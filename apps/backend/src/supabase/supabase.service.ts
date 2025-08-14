import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const serviceKey = this.configService.get<string>('SUPABASE_SERVICE_KEY') || this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !serviceKey) {
      throw new Error('Supabase configuration is missing (SUPABASE_URL, SUPABASE_SERVICE_KEY)');
    }
    this.client = createClient(url, serviceKey);
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  // Expose the storage client with a stable type reference
  getStorageClient(): SupabaseClient['storage'] {
    return this.client.storage;
  }
}


