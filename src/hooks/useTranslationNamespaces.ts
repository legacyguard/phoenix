import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadNamespaces, type Namespace } from '@/i18n/i18n';

interface UseTranslationNamespacesReturn {
  t: ReturnType<typeof useTranslation>['t'];
  i18n: ReturnType<typeof useTranslation>['i18n'];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook that loads translation namespaces dynamically and provides translation function
 * @param namespaces - Single namespace or array of namespaces to load
 * @param options - Optional configuration
 * @returns Translation function, i18n instance, loading state, and error
 */
export const useTranslationNamespaces = (
  namespaces: Namespace | Namespace[],
  options?: {
    keyPrefix?: string;
    fallbackNS?: string;
  }
): UseTranslationNamespacesReturn => {
  const { t, i18n } = useTranslation(namespaces, options);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRequiredNamespaces = async () => {
      const ns = Array.isArray(namespaces) ? namespaces : [namespaces];
      const notLoaded = ns.filter(namespace => 
        !i18n.hasLoadedNamespace(`${namespace}:${i18n.language}`)
      );

      if (notLoaded.length > 0) {
        setIsLoading(true);
        setError(null);
        
        try {
          const success = await loadNamespaces(notLoaded);
          if (!success) {
            throw new Error(`Failed to load namespaces: ${notLoaded.join(', ')}`);
          }
        } catch (err) {
          console.error('Error loading namespaces:', err);
          setError(err instanceof Error ? err.message : 'Failed to load translations');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadRequiredNamespaces();
  }, [namespaces, i18n.language]);

  return { t, i18n, isLoading, error };
};

// Example usage:
/*
// In a component that needs subscription translations:
const MyComponent = () => {
  const { t, isLoading } = useTranslationNamespaces('subscription');
  
  if (isLoading) {
    return <div>Loading translations...</div>;
  }
  
  return <div>{t('subscription.title')}</div>;
};

// With multiple namespaces:
const ComplexComponent = () => {
  const { t } = useTranslationNamespaces(['dashboard', 'assets']);
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('assets.description')}</p>
    </div>
  );
};
*/
