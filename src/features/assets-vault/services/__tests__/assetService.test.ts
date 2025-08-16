import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getAssets, 
  getAssetById, 
  createAsset, 
  updateAsset, 
  deleteAsset, 
  searchAssets, 
  getAssetsByCategory, 
  getAssetsNeedingAttention, 
  getTotalAssetValue 
} from '@/services/assetService';
import { Asset, AssetFormData, AssetStatus } from '@/types/assets';
import { storageKeys } from '@/config/storageKeys';

// Mock the storage service
vi.mock('@/services/storageService', () => ({
  storageService: {
    get: vi.fn(),
    set: vi.fn(),
    has: vi.fn(),
  },
}));

// Import the mocked storage service
import { storageService } from '@/services/storageService';

// Mock data for testing
const mockAssets: Asset[] = [
  {
    id: 'asset-1',
    userId: 'user-1',
    name: 'Primary Checking Account',
    category: 'financial',
    status: 'secured',
    institution: 'First National Bank',
    accountNumber: '****4567',
    accountType: 'Checking',
    estimatedValue: 25000,
    accessInfo: ['Sarah (Spouse)', 'Michael (Son)'],
    assignedPeople: ['person-1', 'person-2'],
    accessInstructions: 'Joint account holder. Online banking credentials in password manager.',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'asset-2',
    userId: 'user-1',
    name: 'Family Home',
    category: 'real-estate',
    status: 'needs-attention',
    address: '123 Oak Street, Springfield',
    propertyType: 'Single Family Home',
    estimatedValue: 450000,
    accessInfo: ['Sarah (Spouse)'],
    assignedPeople: ['person-1'],
    notes: 'Mortgage with Wells Fargo. Property deed in safe deposit box.',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 'asset-3',
    userId: 'user-1',
    name: 'Investment Portfolio',
    category: 'financial',
    status: 'at-risk',
    institution: 'Vanguard',
    accountNumber: '****8901',
    accountType: 'Brokerage',
    estimatedValue: 125000,
    accessInfo: [],
    assignedPeople: [],
    notes: 'Retirement savings. Need to add beneficiaries.',
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-08T10:00:00Z'
  }
];

describe('assetService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset console.error mock
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAssets', () => {
    it('should return all assets when storage has data', async () => {
      (storageService.get as vi.Mock).mockReturnValue(mockAssets);
      
      const result = await getAssets();
      
      expect(result).toEqual(mockAssets);
      expect(storageService.get).toHaveBeenCalledWith(storageKeys.assets);
    });

    it('should return empty array when storage returns null', async () => {
      (storageService.get as vi.Mock).mockReturnValue(null);
      
      const result = await getAssets();
      
      expect(result).toEqual([]);
      expect(storageService.get).toHaveBeenCalledWith(storageKeys.assets);
    });

    it('should return empty array when storage returns undefined', async () => {
      (storageService.get as vi.Mock).mockReturnValue(undefined);
      
      const result = await getAssets();
      
      expect(result).toEqual([]);
      expect(storageService.get).toHaveBeenCalledWith(storageKeys.assets);
    });

    it('should return empty array when storage throws error during getAssets', async () => {
      // Mock storageService.get to throw error only when called from getAssets, not from initializeStorage
      (storageService.get as vi.Mock)
        .mockReturnValueOnce(null) // First call from initializeStorage returns null
        .mockImplementationOnce(() => { // Second call from getAssets throws error
          throw new Error('Storage error');
        });
      
      const result = await getAssets();
      
      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Error loading assets:', expect.any(Error));
    });

    it('should initialize storage with mock data when empty', async () => {
      (storageService.get as vi.Mock).mockReturnValue(null);
      
      await getAssets();
      
      expect(storageService.set).toHaveBeenCalledWith(storageKeys.assets, mockAssets);
    });

    it('should not initialize storage when data already exists', async () => {
      (storageService.get as vi.Mock).mockReturnValue(mockAssets);
      
      await getAssets();
      
      expect(storageService.set).not.toHaveBeenCalled();
    });
  });

  describe('getAssetById', () => {
    it('should return asset when found by id', async () => {
      (storageService.get as vi.Mock).mockReturnValue(mockAssets);
      
      const result = await getAssetById('asset-1');
      
      expect(result).toEqual(mockAssets[0]);
    });

    it('should return null when asset not found', async () => {
      (storageService.get as vi.Mock).mockReturnValue(mockAssets);
      
      const result = await getAssetById('non-existent-id');
      
      expect(result).toBeNull();
    });

    it('should return null when storage is empty', async () => {
      (storageService.get as vi.Mock).mockReturnValue([]);
      
      const result = await getAssetById('asset-1');
      
      expect(result).toBeNull();
    });
  });

  describe('createAsset', () => {
    it('should create new asset with generated id and timestamps', async () => {
      const mockDate = new Date('2025-01-01T12:00:00Z');
      vi.setSystemTime(mockDate);
      
      (storageService.get as vi.Mock).mockReturnValue([]);
      
      const formData: AssetFormData = {
        name: 'New Asset',
        category: 'financial',
        institution: 'Test Bank',
        estimatedValue: 10000
      };
      
      const result = await createAsset(formData);
      
      expect(result.name).toBe('New Asset');
      expect(result.category).toBe('financial');
      expect(result.institution).toBe('Test Bank');
      expect(result.estimatedValue).toBe(10000);
      expect(result.id).toMatch(/^asset-\d+$/);
      expect(result.userId).toBe('user-1');
      expect(result.createdAt).toBe(mockDate.toISOString());
      expect(result.updatedAt).toBe(mockDate.toISOString());
      expect(result.status).toBe('at-risk'); // Financial category without access info = at-risk
      
      expect(storageService.set).toHaveBeenCalledWith(storageKeys.assets, [result]);
      
      vi.useRealTimers();
    });

    it('should calculate status as secured when asset has access info', async () => {
      (storageService.get as vi.Mock).mockReturnValue([]);
      
      const formData: AssetFormData = {
        name: 'Secured Asset',
        category: 'financial',
        institution: 'Test Bank',
        estimatedValue: 10000,
        accessInfo: ['Trusted Person'],
        assignedPeople: ['person-1']
      };
      
      const result = await createAsset(formData);
      
      expect(result.status).toBe('secured');
    });

    it('should calculate status as at-risk for critical categories without access', async () => {
      (storageService.get as vi.Mock).mockReturnValue([]);
      
      const formData: AssetFormData = {
        name: 'Critical Asset',
        category: 'financial',
        institution: 'Test Bank',
        estimatedValue: 10000
        // No access info
      };
      
      const result = await createAsset(formData);
      
      expect(result.status).toBe('at-risk');
    });

    it('should add new asset to existing list', async () => {
      (storageService.get as vi.Mock).mockReturnValue([mockAssets[0]]);
      
      const formData: AssetFormData = {
        name: 'Additional Asset',
        category: 'real-estate'
      };
      
      const result = await createAsset(formData);
      
      expect(storageService.set).toHaveBeenCalledWith(storageKeys.assets, [mockAssets[0], result]);
    });

    it('should handle empty form data correctly', async () => {
      (storageService.get as vi.Mock).mockReturnValue([]);
      
      const formData: AssetFormData = {
        name: 'Minimal Asset',
        category: 'other'
      };
      
      const result = await createAsset(formData);
      
      expect(result.name).toBe('Minimal Asset');
      expect(result.category).toBe('other');
      expect(result.status).toBe('needs-attention');
    });
  });

  describe('updateAsset', () => {
    it('should update existing asset successfully', async () => {
      const mockDate = new Date('2025-01-01T12:00:00Z');
      vi.setSystemTime(mockDate);
      
      (storageService.get as vi.Mock).mockReturnValue([...mockAssets]);
      
      const updates = {
        name: 'Updated Asset Name',
        estimatedValue: 50000
      };
      
      const result = await updateAsset('asset-1', updates);
      
      expect(result).not.toBeNull();
      expect(result!.name).toBe('Updated Asset Name');
      expect(result!.estimatedValue).toBe(50000);
      expect(result!.updatedAt).toBe(mockDate.toISOString());
      expect(result!.status).toBe('secured'); // Should recalculate status
      
      // Verify storage was updated
      expect(storageService.set).toHaveBeenCalledWith(storageKeys.assets, expect.arrayContaining([
        expect.objectContaining({ id: 'asset-1', name: 'Updated Asset Name' })
      ]));
      
      vi.useRealTimers();
    });

    it('should recalculate status when updating asset', async () => {
      (storageService.get as vi.Mock).mockReturnValue([...mockAssets]);
      
      // Update asset to remove access info, making it at-risk
      const updates = {
        accessInfo: [],
        assignedPeople: []
      };
      
      const result = await updateAsset('asset-1', updates);
      
      expect(result!.status).toBe('at-risk');
    });

    it('should return null when updating non-existent asset', async () => {
      (storageService.get as vi.Mock).mockReturnValue([...mockAssets]);
      
      const result = await updateAsset('non-existent-id', { name: 'Updated' });
      
      expect(result).toBeNull();
      expect(storageService.set).not.toHaveBeenCalled();
    });

    it('should preserve other asset properties when updating', async () => {
      (storageService.get as vi.Mock).mockReturnValue([...mockAssets]);
      
      const updates = {
        name: 'New Name Only'
      };
      
      const result = await updateAsset('asset-1', updates);
      
      expect(result!.institution).toBe('First National Bank');
      expect(result!.accountNumber).toBe('****4567');
      expect(result!.createdAt).toBe('2024-01-15T10:00:00Z');
    });

    it('should handle partial updates correctly', async () => {
      (storageService.get as vi.Mock).mockReturnValue([...mockAssets]);
      
      const updates = {
        notes: 'Updated notes'
      };
      
      const result = await updateAsset('asset-1', updates);
      
      expect(result!.notes).toBe('Updated notes');
      expect(result!.name).toBe('Primary Checking Account'); // Unchanged
    });
  });

  describe('deleteAsset', () => {
    it('should delete existing asset successfully', async () => {
      (storageService.get as vi.Mock).mockReturnValue([...mockAssets]);
      
      const result = await deleteAsset('asset-1');
      
      expect(result).toBe(true);
      expect(storageService.set).toHaveBeenCalledWith(
        storageKeys.assets, 
        mockAssets.filter(asset => asset.id !== 'asset-1')
      );
    });

    it('should return false when deleting non-existent asset', async () => {
      (storageService.get as vi.Mock).mockReturnValue([...mockAssets]);
      
      const result = await deleteAsset('non-existent-id');
      
      expect(result).toBe(false);
      expect(storageService.set).not.toHaveBeenCalled();
    });

    it('should handle deleting from empty list', async () => {
      (storageService.get as vi.Mock).mockReturnValue([]);
      
      const result = await deleteAsset('asset-1');
      
      expect(result).toBe(false);
      expect(storageService.set).not.toHaveBeenCalled();
    });

    it('should delete correct asset when multiple exist', async () => {
      (storageService.get as vi.Mock).mockReturnValue([...mockAssets]);
      
      await deleteAsset('asset-2');
      
      expect(storageService.set).toHaveBeenCalledWith(
        storageKeys.assets,
        [mockAssets[0], mockAssets[2]] // asset-1 and asset-3
      );
    });
  });

  describe('searchAssets', () => {
    it('should search assets by name', async () => {
      (storageService.get as vi.Mock).mockReturnValue([...mockAssets]);
      
      const result = await searchAssets('checking');
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Primary Checking Account');
    });

    it('should search assets by institution', async () => {
      (storageService.get as vi.Mock).mockReturnValue([...mockAssets]);
      
      const result = await searchAssets('vanguard');
      
      expect(result).toHaveLength(1);
      expect(result[0].institution).toBe('Vanguard');
    });

    it('should search assets by address', async () => {
      (storageService.get as vi.Mock).mockReturnValue([...mockAssets]);
      
      const result = await searchAssets('oak street');
      
      expect(result).toHaveLength(1);
      expect(result[0].address).toBe('123 Oak Street, Springfield');
    });

    it('should return empty array when no matches found', async () => {
      (storageService.get as vi.Mock).mockReturnValue([...mockAssets]);
      
      const result = await searchAssets('nonexistent');
      
      expect(result).toHaveLength(0);
    });

    it('should handle case-insensitive search', async () => {
      (storageService.get as vi.Mock).mockReturnValue([...mockAssets]);
      
      const result = await searchAssets('BANK');
      
      expect(result).toHaveLength(1);
      expect(result[0].institution).toBe('First National Bank');
    });

    it('should return all assets when search query is empty', async () => {
      (storageService.get as vi.Mock).mockReturnValue([...mockAssets]);
      
      const result = await searchAssets('');
      
      expect(result).toEqual(mockAssets);
    });
  });

  describe('getAssetsByCategory', () => {
    it('should return assets by specific category', async () => {
      (storageService.get as vi.Mock).mockReturnValue([...mockAssets]);
      
      const result = await getAssetsByCategory('financial');
      
      expect(result).toHaveLength(2);
      expect(result.every(asset => asset.category === 'financial')).toBe(true);
    });

    it('should return empty array for non-existent category', async () => {
      (storageService.get as vi.Mock).mockReturnValue([...mockAssets]);
      
      const result = await getAssetsByCategory('non-existent');
      
      expect(result).toHaveLength(0);
    });

    it('should handle case-sensitive category matching', async () => {
      (storageService.get as vi.Mock).mockReturnValue([...mockAssets]);
      
      const result = await getAssetsByCategory('FINANCIAL');
      
      expect(result).toHaveLength(0); // Case sensitive
    });
  });

  describe('getAssetsNeedingAttention', () => {
    it('should return assets with needs-attention status', async () => {
      (storageService.get as vi.Mock).mockReturnValue([...mockAssets]);
      
      const result = await getAssetsNeedingAttention();
      
      expect(result).toHaveLength(2);
      expect(result.some(asset => asset.status === 'needs-attention')).toBe(true);
      expect(result.some(asset => asset.status === 'at-risk')).toBe(true);
    });

    it('should not return secured assets', async () => {
      (storageService.get as vi.Mock).mockReturnValue([...mockAssets]);
      
      const result = await getAssetsNeedingAttention();
      
      expect(result.every(asset => asset.status !== 'secured')).toBe(true);
    });

    it('should return empty array when all assets are secured', async () => {
      const securedAssets = mockAssets.map(asset => ({ ...asset, status: 'secured' as AssetStatus }));
      (storageService.get as vi.Mock).mockReturnValue(securedAssets);
      
      const result = await getAssetsNeedingAttention();
      
      expect(result).toHaveLength(0);
    });
  });

  describe('getTotalAssetValue', () => {
    it('should calculate total value of all assets', async () => {
      (storageService.get as vi.Mock).mockReturnValue([...mockAssets]);
      
      const result = await getTotalAssetValue();
      
      // 25000 + 450000 + 125000 = 600000
      expect(result).toBe(600000);
    });

    it('should handle assets without estimated value', async () => {
      const assetsWithoutValue = mockAssets.map(asset => ({ ...asset, estimatedValue: undefined }));
      (storageService.get as vi.Mock).mockReturnValue(assetsWithoutValue);
      
      const result = await getTotalAssetValue();
      
      expect(result).toBe(0);
    });

    it('should handle mixed assets with and without values', async () => {
      const mixedAssets = [
        { ...mockAssets[0], estimatedValue: 10000 },
        { ...mockAssets[1], estimatedValue: undefined },
        { ...mockAssets[2], estimatedValue: 50000 }
      ];
      (storageService.get as vi.Mock).mockReturnValue(mixedAssets);
      
      const result = await getTotalAssetValue();
      
      // 10000 + 0 + 50000 = 60000
      expect(result).toBe(60000);
    });

    it('should return 0 for empty asset list', async () => {
      (storageService.get as vi.Mock).mockReturnValue([]);
      
      const result = await getTotalAssetValue();
      
      expect(result).toBe(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle storage service errors gracefully during getAssets', async () => {
      // Mock storageService.get to throw error only when called from getAssets, not from initializeStorage
      (storageService.get as vi.Mock)
        .mockReturnValueOnce(null) // First call from initializeStorage returns null
        .mockImplementationOnce(() => { // Second call from getAssets throws error
          throw new Error('Storage service error');
        });
      
      const result = await getAssets();
      
      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Error loading assets:', expect.any(Error));
    });

    it('should handle malformed asset data gracefully', async () => {
      const malformedAssets = [
        { ...mockAssets[0], id: undefined }, // Missing required field
        mockAssets[1]
      ];
      (storageService.get as vi.Mock).mockReturnValue(malformedAssets);
      
      // Should still work despite malformed data
      const result = await getAssets();
      
      expect(result).toEqual(malformedAssets);
    });

    it('should handle concurrent operations correctly', async () => {
      (storageService.get as vi.Mock).mockReturnValue([...mockAssets]);
      
      // Simulate concurrent operations
      const promises = [
        createAsset({ name: 'Asset A', category: 'financial' }),
        createAsset({ name: 'Asset B', category: 'real-estate' }),
        updateAsset('asset-1', { name: 'Updated' })
      ];
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(3);
      expect(results[0].name).toBe('Asset A');
      expect(results[1].name).toBe('Asset B');
      expect(results[2]!.name).toBe('Updated');
    });
  });
});
