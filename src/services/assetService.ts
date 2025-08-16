/**
 * Asset Service - manages asset data with localStorage
 * Following WARP.md privacy-first principles
 */

import { Asset, AssetFormData, AssetStatus } from '@/types/assets';

const STORAGE_KEY = 'legacyguard_assets';

// Mock initial data for demo
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

// Initialize localStorage with mock data if empty
const initializeStorage = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockAssets));
  }
};

// Calculate asset status based on completeness
const calculateStatus = (asset: Partial<Asset>): AssetStatus => {
  const hasAccessInfo = (asset.accessInfo && asset.accessInfo.length > 0) || 
                       (asset.assignedPeople && asset.assignedPeople.length > 0);
  const hasBasicInfo = asset.name && asset.category;
  const hasDetailedInfo = 
    (asset.institution || asset.address || asset.location) &&
    (asset.estimatedValue !== undefined);

  // Critical assets without assigned people should be at-risk
  const criticalCategories = ['financial', 'business', 'digital'];
  if (asset.category && criticalCategories.includes(asset.category) && !hasAccessInfo) {
    return 'at-risk';
  }
  
  if (!hasAccessInfo) {
    return 'needs-attention';
  }
  if (!hasDetailedInfo) {
    return 'needs-attention';
  }
  return 'secured';
};

// Get all assets for the current user
export const getAssets = async (): Promise<Asset[]> => {
  initializeStorage();
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const assets = data ? JSON.parse(data) : [];
    
    // In a real app, filter by current user ID
    return assets;
  } catch (error) {
    console.error('Error loading assets:', error);
    return [];
  }
};

// Get a single asset by ID
export const getAssetById = async (id: string): Promise<Asset | null> => {
  const assets = await getAssets();
  return assets.find(asset => asset.id === id) || null;
};

// Create a new asset
export const createAsset = async (formData: AssetFormData): Promise<Asset> => {
  const assets = await getAssets();
  
  const newAsset: Asset = {
    ...formData,
    id: `asset-${Date.now()}`,
    userId: 'user-1', // In real app, get from auth
    status: calculateStatus(formData),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const updatedAssets = [...assets, newAsset];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAssets));
  
  return newAsset;
};

// Update an existing asset
export const updateAsset = async (
  id: string, 
  updates: Partial<Asset>
): Promise<Asset | null> => {
  const assets = await getAssets();
  const index = assets.findIndex(asset => asset.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedAsset: Asset = {
    ...assets[index],
    ...updates,
    status: calculateStatus({ ...assets[index], ...updates }),
    updatedAt: new Date().toISOString()
  };
  
  assets[index] = updatedAsset;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
  
  return updatedAsset;
};

// Delete an asset
export const deleteAsset = async (id: string): Promise<boolean> => {
  const assets = await getAssets();
  const filteredAssets = assets.filter(asset => asset.id !== id);
  
  if (filteredAssets.length === assets.length) {
    return false; // Asset not found
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredAssets));
  return true;
};

// Search assets
export const searchAssets = async (query: string): Promise<Asset[]> => {
  const assets = await getAssets();
  const lowerQuery = query.toLowerCase();
  
  return assets.filter(asset => 
    asset.name.toLowerCase().includes(lowerQuery) ||
    asset.institution?.toLowerCase().includes(lowerQuery) ||
    asset.location?.toLowerCase().includes(lowerQuery) ||
    asset.address?.toLowerCase().includes(lowerQuery)
  );
};

// Get assets by category
export const getAssetsByCategory = async (category: string): Promise<Asset[]> => {
  const assets = await getAssets();
  return assets.filter(asset => asset.category === category);
};

// Get assets that need attention
export const getAssetsNeedingAttention = async (): Promise<Asset[]> => {
  const assets = await getAssets();
  return assets.filter(asset => 
    asset.status === 'needs-attention' || asset.status === 'at-risk'
  );
};

// Calculate total value of all assets
export const getTotalAssetValue = async (): Promise<number> => {
  const assets = await getAssets();
  return assets.reduce((total, asset) => 
    total + (asset.estimatedValue || 0), 0
  );
};
