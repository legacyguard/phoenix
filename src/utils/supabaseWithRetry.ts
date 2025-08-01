import { supabase } from '@/integrations/supabase/client';
import { retry, RetryConditions, RetryOptions } from './retry';
import { toast } from 'sonner';

/**
 * Supabase client wrapper s automatickým retry
 */
export class SupabaseWithRetry {
  private defaultRetryOptions: RetryOptions = {
    maxAttempts: 3,
    initialDelay: 1000,
    backoffMultiplier: 2,
    retryCondition: RetryConditions.supabaseErrors,
    onRetry: (error, attempt) => {
      console.warn(`[SupabaseRetry] Pokus ${attempt} zlyhal:`, error);
      if (process.env.NODE_ENV === 'development') {
        toast.warning(`Opakujem požiadavku... (pokus ${attempt + 1})`);
      }
    }
  };

  /**
   * Wrapper pre from() query s retry
   */
  from(table: string) {
    const originalFrom = supabase.from(table);
    
    return {
      select: (...args: any[]) => this.wrapQuery(originalFrom.select(...args)),
      insert: (...args: any[]) => this.wrapQuery(originalFrom.insert(...args)),
      update: (...args: any[]) => this.wrapQuery(originalFrom.update(...args)),
      upsert: (...args: any[]) => this.wrapQuery(originalFrom.upsert(...args)),
      delete: (...args: any[]) => this.wrapQuery(originalFrom.delete(...args))
    };
  }

  /**
   * Wrapper pre storage operations s retry
   */
  storage = {
    from: (bucket: string) => {
      const originalStorage = supabase.storage.from(bucket);
      
      return {
        upload: async (path: string, file: File, options?: any) => {
          return retry(
            () => originalStorage.upload(path, file, options),
            this.defaultRetryOptions
          );
        },
        download: async (path: string) => {
          return retry(
            () => originalStorage.download(path),
            this.defaultRetryOptions
          );
        },
        remove: async (paths: string[]) => {
          return retry(
            () => originalStorage.remove(paths),
            this.defaultRetryOptions
          );
        },
        createSignedUrl: async (path: string, expiresIn: number) => {
          return retry(
            () => originalStorage.createSignedUrl(path, expiresIn),
            this.defaultRetryOptions
          );
        }
      };
    }
  };

  /**
   * Wrapper pre auth operations s retry
   */
  auth = {
    getUser: async () => {
      return retry(
        () => supabase.auth.getUser(),
        this.defaultRetryOptions
      );
    },
    signIn: async (credentials: any) => {
      return retry(
        () => supabase.auth.signInWithPassword(credentials),
        {
          ...this.defaultRetryOptions,
          maxAttempts: 2 // Menej pokusov pre prihlasovanie
        }
      );
    },
    signOut: async () => {
      return retry(
        () => supabase.auth.signOut(),
        this.defaultRetryOptions
      );
    }
  };

  /**
   * Wrapper pre query builder s retry
   */
  private wrapQuery(query: any) {
    // Uložíme si pôvodnú query
    const execute = async () => {
      const result = await query;
      if (result.error) {
        throw result.error;
      }
      return result;
    };

    // Vytvoríme proxy objekt, ktorý zachytí všetky metódy
    return new Proxy(query, {
      get: (target, prop) => {
        // Pre metódy, ktoré ukončujú query (single, maybeSingle, atď.)
        if (['single', 'maybeSingle', 'csv', 'execute'].includes(prop as string)) {
          return async () => {
            return retry(execute, this.defaultRetryOptions);
          };
        }
        
        // Pre ostatné metódy, vrátime wrapped query
        if (typeof target[prop] === 'function') {
          return (...args: any[]) => {
            return this.wrapQuery(target[prop](...args));
          };
        }
        
        return target[prop];
      }
    });
  }

  /**
   * Vlastná retry funkcia pre konkrétnu operáciu
   */
  async retryOperation<T>(
    operation: () => Promise<T>,
    options?: Partial<RetryOptions>
  ): Promise<T> {
    return retry(operation, {
      ...this.defaultRetryOptions,
      ...options
    });
  }
}

// Vytvoríme singleton inštanciu
export const supabaseWithRetry = new SupabaseWithRetry();

/**
 * Helper funkcie pre bežné operácie
 */
export const supabaseHelpers = {
  /**
   * Načítaj používateľa s retry
   */
  async getCurrentUser() {
    const { data, error } = await supabaseWithRetry.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  /**
   * Upload súboru s retry a progress callback
   */
  async uploadFile(
    bucket: string,
    path: string,
    file: File,
    onProgress?: (progress: number) => void
  ) {
    // Pre veľké súbory použijeme chunked upload s retry
    const chunkSize = 1024 * 1024 * 2; // 2MB chunks
    const chunks = Math.ceil(file.size / chunkSize);
    
    if (chunks === 1) {
      // Malý súbor, uploadni celý
      return supabaseWithRetry.storage.from(bucket).upload(path, file);
    }

    // TODO: Implementovať chunked upload pre veľké súbory
    return supabaseWithRetry.storage.from(bucket).upload(path, file);
  },

  /**
   * Batch operácie s retry
   */
  async batchOperation<T>(
    operations: Array<() => Promise<T>>,
    options?: {
      concurrency?: number;
      stopOnError?: boolean;
    }
  ): Promise<Array<{ success: boolean; data?: T; error?: any }>> {
    const { concurrency = 3, stopOnError = false } = options || {};
    const results: Array<{ success: boolean; data?: T; error?: any }> = [];
    
    // Rozdelíme operácie na chunky
    for (let i = 0; i < operations.length; i += concurrency) {
      const chunk = operations.slice(i, i + concurrency);
      
      const chunkResults = await Promise.allSettled(
        chunk.map(op => 
          retry(op, {
            ...supabaseWithRetry.defaultRetryOptions,
            maxAttempts: 2
          })
        )
      );
      
      for (const result of chunkResults) {
        if (result.status === 'fulfilled') {
          results.push({ success: true, data: result.value });
        } else {
          results.push({ success: false, error: result.reason });
          if (stopOnError) {
            throw result.reason;
          }
        }
      }
    }
    
    return results;
  }
};
