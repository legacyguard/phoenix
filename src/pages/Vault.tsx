import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Home, Package, Landmark, Car, Laptop, Gem, PlusCircle, Search, Filter } from 'lucide-react';
import AssetTypeSelectorModal from '@/components/assets/AssetTypeSelectorModal';
import DynamicAssetForm from '@/components/assets/DynamicAssetForm';
import AssetCard from '@/components/assets/AssetCard';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Asset {
  id: string;
  name: string;
  main_category: string;
  sub_type: string;
  estimated_value?: number;
  currency?: string;
  created_at: string;
  updated_at: string;
  details?: Record<string, any>;
}

export const Vault: React.FC = () => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
  const [showSubTypeModal, setShowSubTypeModal] = useState(false);
  const [selectedSubType, setSelectedSubType] = useState<string | null>(null);
  const [showDynamicForm, setShowDynamicForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch assets on component mount
  useEffect(() => {
    fetchAssets();
  }, [user]);

  // Filter assets based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredAssets(assets);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = assets.filter(
        asset => 
          asset.name.toLowerCase().includes(query) ||
          asset.main_category.toLowerCase().includes(query) ||
          asset.sub_type.toLowerCase().includes(query)
      );
      setFilteredAssets(filtered);
    }
  }, [searchQuery, assets]);

  const fetchAssets = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setAssets(data || []);
      setFilteredAssets(data || []);
    } catch (err) {
      console.error('Error fetching assets:', err);
      setError(t('vault.errorLoadingAssets'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssetTypeClick = (category: string) => {
    setSelectedMainCategory(category);
    setShowSubTypeModal(true);
  };

  const handleSubTypeSelect = (subType: string) => {
    setSelectedSubType(subType);
    setShowSubTypeModal(false);
    setShowDynamicForm(true);
  };

  const handleFormClose = () => {
    setShowDynamicForm(false);
    setSelectedMainCategory(null);
    setSelectedSubType(null);
    setSelectedAsset(null);
    // Refresh assets after adding/editing
    fetchAssets();
  };

  const handleViewAsset = (asset: Asset) => {
    // TODO: Implement view asset details
    console.log('View asset:', asset);
  };

  const handleEditAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setSelectedMainCategory(asset.main_category);
    setSelectedSubType(asset.sub_type);
    setShowDynamicForm(true);
  };

  const handleDeleteAsset = async (asset: Asset) => {
    if (!confirm(t('vault.confirmDeletion', { assetName: asset.name }))) return;
    
    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', asset.id);
        
      if (error) throw error;
      
      // Remove from local state
      setAssets(prev => prev.filter(a => a.id !== asset.id));
    } catch (err) {
      console.error('Error deleting asset:', err);
      alert(t('vault.errorDeletingAsset'));
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-8 max-w-screen-xl">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-6 w-96 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-8 space-y-4 md:space-y-6 lg:space-y-8 max-w-screen-xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{t('vault.title')}</h1>
        <p className="text-lg text-muted-foreground">{t('vault.subtitle')}</p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      {assets.length === 0 && !isLoading ? (
        // New Empty State UI with Asset Type Grid
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            {/* Large Headline */}
            <h2 className="text-4xl font-bold text-foreground">
              {t('vault.letsBuildInventory')}
            </h2>
            
            {/* Asset Type Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Add Property */}
              <Card 
                className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary"
                onClick={() => handleAssetTypeClick('Property')}
              >
                <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Home className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{t('vault.addProperty')}</h3>
                </CardContent>
              </Card>

              {/* Add Finances */}
              <Card 
                className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary"
                onClick={() => handleAssetTypeClick('Finances')}
              >
                <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Landmark className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{t('vault.addFinances')}</h3>
                </CardContent>
              </Card>

              {/* Add Vehicle */}
              <Card 
                className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary"
                onClick={() => handleAssetTypeClick('Vehicle')}
              >
                <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Car className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{t('vault.addVehicle')}</h3>
                </CardContent>
              </Card>

              {/* Add Digital Asset */}
              <Card 
                className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary"
                onClick={() => handleAssetTypeClick('Digital Asset')}
              >
                <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Laptop className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{t('vault.addDigitalAsset')}</h3>
                </CardContent>
              </Card>

              {/* Add Personal Item */}
              <Card 
                className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary"
                onClick={() => handleAssetTypeClick('Personal Item')}
              >
                <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Gem className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{t('vault.addPersonalItem')}</h3>
                </CardContent>
              </Card>

              {/* Add Something Else */}
              <Card 
                className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary"
                onClick={() => handleAssetTypeClick('Other')}
              >
                <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <PlusCircle className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{t('vault.addOther')}</h3>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        // Asset List View
        <div className="space-y-6">
          {/* Search and Add Asset Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('vault.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={() => {
                setSelectedMainCategory(null);
                setShowSubTypeModal(false);
                // Show asset type selector
                const firstCard = document.querySelector('[data-asset-type]');
                if (firstCard) {
                  firstCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className="shrink-0"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('vault.addAsset')}
            </Button>
          </div>

          {/* Asset Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{assets.length}</div>
                <p className="text-sm text-muted-foreground">{t('vault.totalAssets')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">
                  {assets.reduce((sum, asset) => sum + (asset.estimated_value || 0), 0).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </div>
                <p className="text-sm text-muted-foreground">{t('vault.totalValue')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">
                  {[...new Set(assets.map(a => a.main_category))].length}
                </div>
                <p className="text-sm text-muted-foreground">{t('vault.categories')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Asset Cards Grid */}
          {filteredAssets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onView={handleViewAsset}
                  onEdit={handleEditAsset}
                  onDelete={handleDeleteAsset}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery
                  ? t('vault.noAssetsFound', { searchQuery })
                  : t('vault.startAddingAssets')}
              </p>
            </div>
          )}

          {/* Quick Add Asset Types */}
          {assets.length > 0 && (
            <div className="border-t pt-8">
              <h3 className="text-lg font-semibold mb-4">{t('vault.addNewAsset')}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { label: t('vault.property'), icon: Home, category: 'Property' },
                  { label: t('vault.finances'), icon: Landmark, category: 'Finances' },
                  { label: t('vault.vehicle'), icon: Car, category: 'Vehicle' },
                  { label: t('vault.digital'), icon: Laptop, category: 'Digital Asset' },
                  { label: t('vault.personal'), icon: Gem, category: 'Personal Item' },
                  { label: t('vault.other'), icon: PlusCircle, category: 'Other' },
                ].map((type) => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.category}
                      variant="outline"
                      className="flex flex-col items-center gap-2 h-20"
                      onClick={() => handleAssetTypeClick(type.category)}
                      data-asset-type={type.category}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs">{type.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Asset Type Selector Modal */}
      <AssetTypeSelectorModal
        isOpen={showSubTypeModal}
        onClose={() => setShowSubTypeModal(false)}
        mainCategory={selectedMainCategory || ''}
        onSelectSubType={handleSubTypeSelect}
      />

      {/* Dynamic Asset Form */}
      <DynamicAssetForm
        isOpen={showDynamicForm}
        onClose={handleFormClose}
        mainCategory={selectedMainCategory || ''}
        subType={selectedSubType || ''}
      />
    </div>
  );
};

export default Vault;
