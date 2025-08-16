import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AssetList } from '@/features/assets-vault/components/AssetList';
import { AddAssetDialog } from '@/features/assets-vault/components/AddAssetDialog';
import { useAssetStore } from '@/stores/assetStore';

export function MyPossessionsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { fetchAssets } = useAssetStore();

  const handleAssetAdded = () => {
    // Refresh assets from store (no need for local state trigger)
    fetchAssets();
    setIsAddDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-card-foreground">
                What You Own and Cherish
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Your complete inventory of assets, possessions, and valuable items
              </p>
            </div>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              size="lg"
              className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
            >
              <PlusCircle className="w-5 h-5" />
              Add a New Possession
            </Button>
          </div>

          {/* Contextual Help */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-card-foreground">Why this matters:</span>{' '}
              Documenting your possessions ensures your loved ones know what you have and how to access it. 
              This includes bank accounts, real estate, investments, digital assets, and personal items of value.
            </p>
          </div>
        </div>

        {/* Asset List Component */}
        <AssetList />

        {/* Add Asset Dialog */}
        <AddAssetDialog 
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onAssetAdded={handleAssetAdded}
        />
      </div>
    </div>
  );
}

export default MyPossessionsPage;
