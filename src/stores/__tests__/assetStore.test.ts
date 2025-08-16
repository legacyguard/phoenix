import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAssetStore, useAssets } from '../assetStore';
import { assetService } from '@/services/assetService';
import { Asset, AssetFormData } from '@/types/assets';

// Mock assetService
vi.mock('@/services/assetService', () => ({
  assetService: {
    getAssets: vi.fn(),
    createAsset: vi.fn(),
    updateAsset: vi.fn(),
    deleteAsset: vi.fn(),
  },
}));

const mockAssets: Asset[] = [
  {
    id: 'asset-1',
    userId: 'user-1',
    name: 'Test Asset 1',
    category: 'financial',
    status: 'secured',
    institution: 'Test Bank',
    accountNumber: '****1234',
    accountType: 'Checking',
    estimatedValue: 10000,
    accessInfo: ['Test Person'],
    assignedPeople: ['person-1'],
    accessInstructions: 'Test instructions',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'asset-2',
    userId: 'user-1',
    name: 'Test Asset 2',
    category: 'real-estate',
    status: 'needs-attention',
    address: '123 Test St',
    propertyType: 'House',
    estimatedValue: 200000,
    accessInfo: [],
    assignedPeople: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

describe('Asset Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useAssetStore.setState({
        assets: [],
        isLoading: false,
        error: null,
        selectedAsset: null,
      });
    });
    
    vi.clearAllMocks();
  });

  describe('useAssetStore', () => {
    it('should have initial state', () => {
      const { result } = renderHook(() => useAssetStore());
      
      expect(result.current.assets).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.selectedAsset).toBeNull();
    });

    it('should fetch assets successfully', async () => {
      const mockGetAssets = vi.mocked(assetService.getAssets);
      mockGetAssets.mockResolvedValue(mockAssets);

      const { result } = renderHook(() => useAssetStore());

      await act(async () => {
        await result.current.fetchAssets();
      });

      expect(result.current.assets).toEqual(mockAssets);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockGetAssets).toHaveBeenCalledOnce();
    });

    it('should handle fetch assets error', async () => {
      const mockGetAssets = vi.mocked(assetService.getAssets);
      mockGetAssets.mockRejectedValue(new Error('Fetch failed'));

      const { result } = renderHook(() => useAssetStore());

      await act(async () => {
        await result.current.fetchAssets();
      });

      expect(result.current.assets).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Fetch failed');
    });

    it('should add asset successfully', async () => {
      const newAssetData: AssetFormData = {
        name: 'New Asset',
        category: 'financial',
        institution: 'New Bank',
        estimatedValue: 5000,
      };

      const createdAsset: Asset = {
        ...newAssetData,
        id: 'asset-new',
        userId: 'user-1',
        status: 'needs-attention',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const mockCreateAsset = vi.mocked(assetService.createAsset);
      mockCreateAsset.mockResolvedValue(createdAsset);

      const { result } = renderHook(() => useAssetStore());

      await act(async () => {
        await result.current.addAsset(newAssetData);
      });

      expect(result.current.assets).toContain(createdAsset);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockCreateAsset).toHaveBeenCalledWith(newAssetData);
    });

    it('should update asset successfully', async () => {
      // First, set up some assets
      act(() => {
        useAssetStore.setState({ assets: mockAssets });
      });

      const updates = { name: 'Updated Asset Name' };
      const updatedAsset = { ...mockAssets[0], ...updates, updatedAt: '2024-01-02T00:00:00Z' };

      const mockUpdateAsset = vi.mocked(assetService.updateAsset);
      mockUpdateAsset.mockResolvedValue(updatedAsset);

      const { result } = renderHook(() => useAssetStore());

      await act(async () => {
        await result.current.updateAsset('asset-1', updates);
      });

      expect(result.current.assets[0].name).toBe('Updated Asset Name');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockUpdateAsset).toHaveBeenCalledWith('asset-1', updates);
    });

    it('should delete asset successfully', async () => {
      // First, set up some assets
      act(() => {
        useAssetStore.setState({ assets: mockAssets });
      });

      const mockDeleteAsset = vi.mocked(assetService.deleteAsset);
      mockDeleteAsset.mockResolvedValue(true);

      const { result } = renderHook(() => useAssetStore());

      await act(async () => {
        await result.current.deleteAsset('asset-1');
      });

      expect(result.current.assets).toHaveLength(1);
      expect(result.current.assets[0].id).toBe('asset-2');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockDeleteAsset).toHaveBeenCalledWith('asset-1');
    });

    it('should select asset', () => {
      const { result } = renderHook(() => useAssetStore());

      act(() => {
        result.current.selectAsset(mockAssets[0]);
      });

      expect(result.current.selectedAsset).toEqual(mockAssets[0]);
    });

    it('should clear error', () => {
      // First, set an error
      act(() => {
        useAssetStore.setState({ error: 'Test error' });
      });

      const { result } = renderHook(() => useAssetStore());

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should get asset by ID', () => {
      act(() => {
        useAssetStore.setState({ assets: mockAssets });
      });

      const { result } = renderHook(() => useAssetStore());

      const asset = result.current.getAssetById('asset-1');
      expect(asset).toEqual(mockAssets[0]);

      const nonExistentAsset = result.current.getAssetById('non-existent');
      expect(nonExistentAsset).toBeNull();
    });

    it('should get assets by category', () => {
      act(() => {
        useAssetStore.setState({ assets: mockAssets });
      });

      const { result } = renderHook(() => useAssetStore());

      const financialAssets = result.current.getAssetsByCategory('financial');
      expect(financialAssets).toHaveLength(1);
      expect(financialAssets[0].category).toBe('financial');

      const realEstateAssets = result.current.getAssetsByCategory('real-estate');
      expect(realEstateAssets).toHaveLength(1);
      expect(realEstateAssets[0].category).toBe('real-estate');
    });

    it('should get assets needing attention', () => {
      act(() => {
        useAssetStore.setState({ assets: mockAssets });
      });

      const { result } = renderHook(() => useAssetStore());

      const assetsNeedingAttention = result.current.getAssetsNeedingAttention();
      expect(assetsNeedingAttention).toHaveLength(1);
      expect(assetsNeedingAttention[0].status).toBe('needs-attention');
    });

    it('should calculate total asset value', () => {
      act(() => {
        useAssetStore.setState({ assets: mockAssets });
      });

      const { result } = renderHook(() => useAssetStore());

      const totalValue = result.current.getTotalAssetValue();
      expect(totalValue).toBe(210000); // 10000 + 200000
    });

    it('should search assets', () => {
      act(() => {
        useAssetStore.setState({ assets: mockAssets });
      });

      const { result } = renderHook(() => useAssetStore());

      const searchResults = result.current.searchAssets('Test');
      expect(searchResults).toHaveLength(2);

      const bankResults = result.current.searchAssets('Bank');
      expect(bankResults).toHaveLength(1);
      expect(bankResults[0].institution).toBe('Test Bank');
    });
  });

  describe('Selectors', () => {
    it('should useAssets selector work correctly', () => {
      act(() => {
        useAssetStore.setState({ assets: mockAssets });
      });

      const { result } = renderHook(() => useAssets());
      expect(result.current).toEqual(mockAssets);
    });
  });
});
