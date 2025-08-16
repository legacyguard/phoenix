/**
 * Will Service - manages will data with localStorage
 * Following WARP.md privacy-first principles
 */

import { Will, WillWizardState } from '@/types/will';

const STORAGE_KEY = 'legacyguard_wills';
const DRAFT_KEY = 'legacyguard_will_draft';

// Get all wills for the current user
export const getWills = async (): Promise<Will[]> => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const wills = data ? JSON.parse(data) : [];
    
    // In a real app, filter by current user ID
    return wills;
  } catch (error) {
    console.error('Error loading wills:', error);
    return [];
  }
};

// Get the most recent will
export const getCurrentWill = async (): Promise<Will | null> => {
  const wills = await getWills();
  if (wills.length === 0) return null;
  
  // Sort by creation date and return the most recent
  return wills.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
};

// Get a single will by ID
export const getWillById = async (id: string): Promise<Will | null> => {
  const wills = await getWills();
  return wills.find(will => will.id === id) || null;
};

// Create a new will from wizard state
export const createWill = async (wizardState: WillWizardState): Promise<Will> => {
  const wills = await getWills();
  
  const newWill: Will = {
    id: `will-${Date.now()}`,
    userId: 'user-1', // In real app, get from auth
    personalInfo: wizardState.personalInfo,
    executor: wizardState.executor,
    guardians: wizardState.guardians,
    specificGifts: wizardState.specificGifts,
    residualBeneficiaries: wizardState.residualBeneficiaries,
    finalWishes: wizardState.finalWishes,
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: new Date().toISOString()
  };
  
  const updatedWills = [...wills, newWill];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWills));
  
  // Clear the draft
  clearDraft();
  
  return newWill;
};

// Update an existing will
export const updateWill = async (
  id: string, 
  updates: Partial<Will>
): Promise<Will | null> => {
  const wills = await getWills();
  const index = wills.findIndex(will => will.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedWill: Will = {
    ...wills[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  wills[index] = updatedWill;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wills));
  
  return updatedWill;
};

// Delete a will
export const deleteWill = async (id: string): Promise<boolean> => {
  const wills = await getWills();
  const filteredWills = wills.filter(will => will.id !== id);
  
  if (filteredWills.length === wills.length) {
    return false; // Will not found
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredWills));
  return true;
};

// Save draft of wizard state
export const saveDraft = (wizardState: WillWizardState): void => {
  try {
    // Convert Set to Array for serialization
    const serializableState = {
      ...wizardState,
      completedSteps: Array.from(wizardState.completedSteps)
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(serializableState));
  } catch (error) {
    console.error('Error saving draft:', error);
  }
};

// Load draft of wizard state
export const loadDraft = (): WillWizardState | null => {
  try {
    const data = localStorage.getItem(DRAFT_KEY);
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    // Convert Array back to Set
    return {
      ...parsed,
      completedSteps: new Set(parsed.completedSteps || [])
    };
  } catch (error) {
    console.error('Error loading draft:', error);
    return null;
  }
};

// Clear draft
export const clearDraft = (): void => {
  localStorage.removeItem(DRAFT_KEY);
};

// Calculate will completeness
export const calculateCompleteness = (will: Partial<Will>): number => {
  let score = 0;
  let total = 0;
  
  // Personal Info (required)
  total += 1;
  if (will.personalInfo?.fullName && will.personalInfo?.address) {
    score += 1;
  }
  
  // Executor (required)
  total += 1;
  if (will.executor?.primary) {
    score += 1;
  }
  
  // Guardians (optional, but if present should be complete)
  if (will.guardians) {
    total += 1;
    if (will.guardians.primary) {
      score += 1;
    }
  }
  
  // At least one distribution method
  total += 1;
  if ((will.specificGifts && will.specificGifts.length > 0) || 
      (will.residualBeneficiaries && will.residualBeneficiaries.length > 0)) {
    score += 1;
  }
  
  return Math.round((score / total) * 100);
};

// Validate residual beneficiaries percentages
export const validateResidualPercentages = (beneficiaries: { percentage: number }[]): boolean => {
  const total = beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
  return Math.abs(total - 100) < 0.01; // Allow for floating point errors
};
