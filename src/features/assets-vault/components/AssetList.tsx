import React, { useState, useEffect } from 'react';
import { AssetCard } from './AssetCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Landmark, 
  Home, 
  Briefcase, 
  Car, 
  Gem, 
  Globe,
  Wallet,
  Filter,
  LayoutGrid
} from 'lucide-react';
import { Asset, AssetCategory } from '@/types/assets';
import { getAssets, updateAsset, deleteAsset } from '@/services/assetService';
import { cn } from '@/lib/utils';
import { usePersistedState } from '@/hooks/usePersistedState';

interface AssetListProps {
  refreshTrigger?: number;
}

export function AssetList({ refreshTrigger }: AssetListProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use persisted state for category filter to remember user's selection
  const [selectedCategory, setSelectedCategory] = usePersistedState<AssetCategory | 'all'>(
    'assetList.selectedCategory',
    'all',
    'session'
  );

  // Category configurations
  const categories = [
    { id: 'all', label: 'All Possessions', icon: <LayoutGrid className="w-4 h-4" />, count: 0 },
    { id: 'financial', label: 'Financial', icon: <Landmark className="w-4 h-4" />, count: 0 },
    { id: 'real-estate', label: 'Real Estate', icon: <Home className="w-4 h-4" />, count: 0 },
    { id: 'business', label: 'Business', icon: <Briefcase className="w-4 h-4" />, count: 0 },
    { id: 'vehicles', label: 'Vehicles', icon: <Car className="w-4 h-4" />, count: 0 },
    { id: 'valuables', label: 'Valuables', icon: <Gem className="w-4 h-4" />, count: 0 },
    { id: 'digital', label: 'Digital', icon: <Globe className="w-4 h-4" />, count: 0 },
    { id: 'other', label: 'Other', icon: <Wallet className="w-4 h-4" />, count: 0 },
  ];

  // Load assets
  useEffect(() => {
    loadAssets();
  }, [refreshTrigger]);

  const loadAssets = async () => {
    setIsLoading(true);
    try {
      const loadedAssets = await getAssets();
      setAssets(loadedAssets);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter assets by category
  const filteredAssets = selectedCategory === 'all' 
    ? assets 
    : assets.filter(asset => asset.category === selectedCategory);

  // Update category counts
  const categoriesWithCounts = categories.map(cat => ({
    ...cat,
    count: cat.id === 'all' 
      ? assets.length 
      : assets.filter(a => a.category === cat.id).length
  }));

  const handleUpdateAsset = async (assetId: string, updates: Partial<Asset>) => {
    const updatedAsset = await updateAsset(assetId, updates);
    if (updatedAsset) {
      setAssets(prev => prev.map(a => a.id === assetId ? updatedAsset : a));
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    const success = await deleteAsset(assetId);
    if (success) {
      setAssets(prev => prev.filter(a => a.id !== assetId));
    }
  };

  // Calculate total value
  const totalValue = assets.reduce((sum, asset) => sum + (asset.estimatedValue || 0), 0);
  const securedCount = assets.filter(a => a.status === 'secured').length;
  const needsAttentionCount = assets.filter(a => a.status === 'needs-attention').length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton for filters */}
        <div className="flex gap-2 flex-wrap">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        {/* Loading skeleton for cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Possessions</p>
          <p className="text-2xl font-bold text-card-foreground">{assets.length}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Estimated Value</p>
          <p className="text-2xl font-bold text-card-foreground">
            ${totalValue.toLocaleString()}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Status</p>
          <div className="flex gap-2 mt-1">
            <Badge className="bg-green-100 text-green-800 border-green-200">
              {securedCount} Secured
            </Badge>
            {needsAttentionCount > 0 && (
              <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                {needsAttentionCount} Need Attention
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap">
        {categoriesWithCounts.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id as AssetCategory | 'all')}
            className={cn(
              "transition-all duration-300 ease-in-out",
              selectedCategory === category.id && "shadow-md"
            )}
          >
            {category.icon}
            <span className="ml-2">{category.label}</span>
            {category.count > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 h-5 px-1.5"
              >
                {category.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Assets Grid */}
      {filteredAssets.length === 0 ? (
        <div className="text-center py-12 bg-card border rounded-lg">
          <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            No possessions found
          </h3>
          <p className="text-muted-foreground">
            {selectedCategory === 'all' 
              ? "Start by adding your first possession to build your inventory."
              : `You don't have any ${selectedCategory} assets yet.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onUpdate={(updates) => handleUpdateAsset(asset.id, updates)}
              onDelete={() => handleDeleteAsset(asset.id)}
            />
          ))}
        </div>
      )}

      {/* Contextual Help */}
      {assets.length > 0 && needsAttentionCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            <span className="font-medium">Action needed:</span>{' '}
            You have {needsAttentionCount} {needsAttentionCount === 1 ? 'possession' : 'possessions'} that need attention. 
            These might be missing important details or access information for your loved ones.
          </p>
        </div>
      )}
    </div>
  );
}
