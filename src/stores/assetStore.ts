/**
 * Asset Store - Zustand store for managing asset state
 * Centralizes all asset-related state management
 */

import { create } from 'zustand';
import { assetService } from '@/services/assetService';
import { Asset, AssetFormData } from '@/types/assets';

interface AssetStoreState {
  // State
  assets: Asset[];
  isLoading: boolean;
  error: string | null;
  selectedAsset: Asset | null;
  
  // Actions
  fetchAssets: () => Promise<void>;
  addAsset: (newAsset: AssetFormData) => Promise<void>;
  updateAsset: (id: string, updates: Partial<Asset>) => Promise<void>;
  deleteAsset: (assetId: string) => Promise<void>;
  selectAsset: (asset: Asset | null) => void;
  clearError: () => void;
  
  // Computed values
  getAssetById: (id: string) => Asset | null;
  getAssetsByCategory: (category: string) => Asset[];
  getAssetsNeedingAttention: () => Asset[];
  getTotalAssetValue: () => number;
  searchAssets: (query: string) => Asset[];
}

export const useAssetStore = create<AssetStoreState>((set, get) => ({
  // Initial state
  assets: [],
  isLoading: false,
  error: null,
  selectedAsset: null,

  // Actions
  fetchAssets: async () => {
    try {
      set({ isLoading: true, error: null });
      const assets = await assetService.getAssets();
      set({ assets, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch assets',
        isLoading: false 
      });
    }
  },

  addAsset: async (newAssetData: AssetFormData) => {
    try {
      set({ isLoading: true, error: null });
      const createdAsset = await assetService.createAsset(newAssetData);
      set((state) => ({ 
        assets: [...state.assets, createdAsset],
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add asset',
        isLoading: false 
      });
    }
  },

  updateAsset: async (id: string, updates: Partial<Asset>) => {
    try {
      set({ isLoading: true, error: null });
      const updatedAsset = await assetService.updateAsset(id, updates);
      
      if (updatedAsset) {
        set((state) => ({
          assets: state.assets.map((asset) =>
            asset.id === id ? updatedAsset : asset
          ),
          selectedAsset: state.selectedAsset?.id === id ? updatedAsset : state.selectedAsset,
          isLoading: false
        }));
      } else {
        set({ 
          error: 'Asset not found',
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update asset',
        isLoading: false 
      });
    }
  },

  deleteAsset: async (assetId: string) => {
    try {
      set({ isLoading: true, error: null });
      const success = await assetService.deleteAsset(assetId);
      
      if (success) {
        set((state) => ({
          assets: state.assets.filter((asset) => asset.id !== assetId),
          selectedAsset: state.selectedAsset?.id === assetId ? null : state.selectedAsset,
          isLoading: false
        }));
      } else {
        set({ 
          error: 'Asset not found',
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete asset',
        isLoading: false 
      });
    }
  },

  selectAsset: (asset: Asset | null) => {
    set({ selectedAsset: asset });
  },

  clearError: () => {
    set({ error: null });
  },

  // Computed values (getters)
  getAssetById: (id: string) => {
    const { assets } = get();
    return assets.find(asset => asset.id === id) || null;
  },

  getAssetsByCategory: (category: string) => {
    const { assets } = get();
    return assets.filter(asset => asset.category === category);
  },

  getAssetsNeedingAttention: () => {
    const { assets } = get();
    return assets.filter(asset => 
      asset.status === 'needs-attention' || asset.status === 'at-risk'
    );
  },

  getTotalAssetValue: () => {
    const { assets } = get();
    return assets.reduce((total, asset) => 
      total + (asset.estimatedValue || 0), 0
    );
  },

  searchAssets: (query: string) => {
    const { assets } = get();
    const lowerQuery = query.toLowerCase();
    
    return assets.filter(asset => 
      asset.name.toLowerCase().includes(lowerQuery) ||
      asset.institution?.toLowerCase().includes(lowerQuery) ||
      asset.location?.toLowerCase().includes(lowerQuery) ||
      asset.address?.toLowerCase().includes(lowerQuery)
    );
  },
}));

// Export selectors for better performance
export const useAssets = () => useAssetStore((state) => state.assets);
export const useAssetLoading = () => useAssetStore((state) => state.isLoading);
export const useAssetError = () => useAssetStore((state) => state.error);
export const useSelectedAsset = () => useAssetStore((state) => state.selectedAsset);
