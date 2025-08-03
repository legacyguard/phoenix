import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadNamespaces, type Namespace } from '@/i18n/i18n';
import { Loader2 } from 'lucide-react';

interface RouteWithNamespacesProps {
  namespaces: Namespace | Namespace[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RouteWithNamespaces: React.FC<RouteWithNamespacesProps> = ({ 
  namespaces, 
  children,
  fallback 
}) => {
  const { i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRequiredNamespaces = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const ns = Array.isArray(namespaces) ? namespaces : [namespaces];
        const hasNamespaces = ns.every(namespace => 
          i18n.hasLoadedNamespace(`${namespace}:${i18n.language}`)
        );
        
        if (!hasNamespaces) {
          const success = await loadNamespaces(namespaces);
          if (!success) {
            throw new Error('Failed to load translation namespaces');
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading namespaces:', err);
        setError(err instanceof Error ? err.message : 'Failed to load translations');
        setIsLoading(false);
      }
    };

    loadRequiredNamespaces();
  }, [namespaces, i18n.language, i18n]);

  if (error) {
    // Fallback to children even if translations fail to load
    console.warn('Continuing without translations:', error);
    return <>{children}</>;
  }

  if (isLoading) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
};

// Example usage in routes:
/*
import { RouteWithNamespaces } from '@/components/RouteWithNamespaces';

// In your route component:
<Route 
  path="/subscription" 
  element={
    <RouteWithNamespaces namespaces={['subscription', 'common']}>
      <Subscription />
    </RouteWithNamespaces>
  } 
/>

// For multiple namespaces:
<Route 
  path="/dashboard" 
  element={
    <RouteWithNamespaces namespaces={['dashboard', 'assets', 'documents']}>
      <Dashboard />
    </RouteWithNamespaces>
  } 
/>
*/
