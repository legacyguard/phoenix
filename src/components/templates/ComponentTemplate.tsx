/**
 * Component Template
 * 
 * This template provides a standardized structure for all React components
 * in the LegacyGuard application. Follow this pattern for consistency.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'sonner';

// UI Components - Import only what you need
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Icons - Import only what you need
import { Plus, Edit, Trash2 } from 'lucide-react';

// Constants and Types
import { API_URLS, TIME } from '@/utils/constants';

// Types and Interfaces
interface ComponentProps {
  /** Unique identifier for the component */
  id?: string;
  /** Optional callback when data changes */
  onChange?: (data: Record<string, unknown>) => void;
  /** Whether the component is in loading state */
  loading?: boolean;
  /** Optional CSS class name */
  className?: string;
}

interface ComponentData {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ComponentName Component
 * 
 * Purpose: Brief description of what this component does
 * 
 * Features:
 * - Feature 1: Description
 * - Feature 2: Description
 * 
 * Usage:
 * ```tsx
 * <ComponentName 
 *   id="unique-id"
 *   onChange={handleChange}
 *   loading={false}
 * />
 * ```
 */
export const ComponentName: React.FC<ComponentProps> = ({
  id,
  onChange,
  loading = false,
  className = ''
}) => {
  // Translation hook
  const { t } = useTranslation('ui');
  
  // Authentication hook
  const { getToken } = useAuth();
  
  // State management
  const [data, setData] = useState<ComponentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Memoized callbacks
  const handleDataChange = useCallback((newData: ComponentData) => {
     
    setData(newData);
    onChange?.(newData);
  }, [onChange]);
  
  const handleError = useCallback((error: Error) => {
     
    console.error('[ComponentName] Error:', error);
    setError(error.message);
    toast.error(t('ui.common.errors.generic'));
  }, [t]);
  
  // Data loading function
  const loadData = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // TODO: Implement actual API call
      const response = await fetch(`${API_URLS.api}/data/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.status}`);
      }
      
      const result = await response.json();
      handleDataChange(result);
      
    } catch (error) {
      handleError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [id, handleDataChange, handleError, getToken]);
  
  // Effects
  useEffect(() => {
     
    if (id) {
      loadData();
    }
  }, [id, loadData]);
  
  // Event handlers
  const handleSave = async () => {
    if (!data) return;
    
    setIsLoading(true);
    
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // TODO: Implement actual save logic
      const response = await fetch(`${API_URLS.api}/data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save: ${response.status}`);
      }
      
      toast.success(t('ui.common.messages.saved'));
      
    } catch (error) {
      handleError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Loading state
  if (loading || isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Card className={`border-red-200 bg-red-50 ${className}`}>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadData} variant="outline">
              {t('ui.common.actions.retry')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Main render
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('component.title')}</span>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('ui.common.actions.save')}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {data ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('component.fields.name')}
              </label>
              <p className="text-lg">{data.name}</p>
            </div>
            
            {data.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('component.fields.description')}
                </label>
                <p className="text-muted-foreground">{data.description}</p>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              {t('component.fields.lastUpdated')}: {data.updatedAt.toLocaleDateString()}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {t('component.messages.noData')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ComponentName; 