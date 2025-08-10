import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

// Base loading spinner
export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
        sizeClasses[size],
        className
      )}
    />
  );
};

// Full page loading state
export const FullPageLoading: React.FC = () => {
  const { t } = useTranslation('ui-common');
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600">{t('loading')}</p>
      </div>
    </div>
  );
};

// Button loading state
export const ButtonLoading: React.FC = () => {
  const { t } = useTranslation('ui-common');
  
  return (
    <div className="flex items-center justify-center">
      <LoadingSpinner size="sm" className="mr-2" />
      <span>{t('loading')}</span>
    </div>
  );
};

// Skeleton components for different content types
export const Skeleton: React.FC<{
  className?: string;
}> = ({ className }) => (
  <div className={cn('animate-pulse bg-gray-200 rounded', className)} />
);

// Card skeleton
export const CardSkeleton: React.FC = () => (
  <div className="border rounded-lg p-4 space-y-3">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-5/6" />
    <Skeleton className="h-8 w-24 mt-4" />
  </div>
);

// List item skeleton
export const ListItemSkeleton: React.FC = () => (
  <div className="flex items-center space-x-3 p-3">
    <Skeleton className="w-10 h-10 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  </div>
);

// Table skeleton
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-2">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex space-x-4">
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 w-20" />
      </div>
    ))}
  </div>
);

// Form skeleton
export const FormSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div>
      <Skeleton className="h-4 w-20 mb-2" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div>
      <Skeleton className="h-4 w-20 mb-2" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div>
      <Skeleton className="h-4 w-20 mb-2" />
      <Skeleton className="h-24 w-full" />
    </div>
    <Skeleton className="h-10 w-32" />
  </div>
);

// Dashboard skeleton
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CardSkeleton />
      <CardSkeleton />
    </div>
  </div>
);

// Document viewer skeleton
export const DocumentSkeleton: React.FC = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-64" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);

// Search results skeleton
export const SearchResultsSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="border rounded-lg p-4">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6 mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>
    ))}
  </div>
);

// Loading wrapper component
interface LoadingWrapperProps {
  isLoading: boolean;
  loadingComponent?: React.ReactNode;
  skeleton?: React.ReactNode;
  children: React.ReactNode;
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  isLoading,
  loadingComponent,
  skeleton,
  children,
}) => {
  if (isLoading) {
    if (loadingComponent) return <>{loadingComponent}</>;
    if (skeleton) return <>{skeleton}</>;
    return <FullPageLoading />;
  }

  return <>{children}</>;
};

// Progressive loading component
export const ProgressiveLoading: React.FC<{
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  children: React.ReactNode;
}> = ({ isLoading, hasMore, onLoadMore, children }) => {
  const { t } = useTranslation('ui-common');
  
  return (
    <div>
      {children}
      {isLoading && (
        <div className="flex justify-center py-4">
          <LoadingSpinner />
        </div>
      )}
      {hasMore && !isLoading && (
        <div className="flex justify-center py-4">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {t('loadMore')}
          </button>
        </div>
      )}
    </div>
  );
};
