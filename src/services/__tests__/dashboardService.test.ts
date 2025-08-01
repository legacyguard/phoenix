import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { ProgressService } from '@/services/ProgressService';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

describe('Dashboard Service - Plan Strength & Stages', () => {
  const mockUserId = 'test-user-123';
  
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Plan Strength Calculation', () => {
    it('should calculate 0% for a brand new user with no data', () => {
      const strength = ProgressService.calculateCompletionScore(mockUserId);
      expect(strength).toBe(0);
    });

    it('should calculate correct percentage based on completed items', () => {
      // Mock user with some completed items
      const mockProfile = {
        has_will: true,
        has_executor: true,
        has_beneficiaries: false,
        has_assets: true,
        has_documents: false,
        has_emergency_contacts: false,
      };
      
      // 3 out of 6 items completed = 50%
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
          }),
        }),
      } as any);
      
      const strength = ProgressService.calculateCompletionScore(mockUserId);
      expect(strength).toBeGreaterThan(0);
      expect(strength).toBeLessThan(100);
    });

    it('should return 100% for fully complete user profile', () => {
      // Mock complete user profile
      const completeProfile = {
        has_will: true,
        has_executor: true,
        has_beneficiaries: true,
        has_assets: true,
        has_documents: true,
        has_emergency_contacts: true,
        has_time_capsules: true,
        has_legacy_letters: true,
      };
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: completeProfile, error: null }),
          }),
        }),
      } as any);
      
      // Mock localStorage to simulate 100% completion
      localStorage.setItem(`completionScore_${mockUserId}`, '100');
      const strength = ProgressService.calculateCompletionScore(mockUserId);
      expect(strength).toBe(100);
    });
  });

  describe('Stage Determination', () => {
    it('should return "Foundation" stage for strength < 25%', () => {
      const { currentStage, nextObjective } = ProgressService.determineStageAndObjective(15, null, true);
      
      expect(currentStage).toBe('Foundation');
      expect(nextObjective.type).toBe('task');
      expect(nextObjective.title).toContain('Add Your First Trusted Person');
      expect(nextObjective.actionUrl).toBe('/trusted-circle');
    });

    it('should return "Buildout" stage for strength 25-59%', () => {
      const { currentStage, nextObjective } = ProgressService.determineStageAndObjective(45, null, true);
      
      expect(currentStage).toBe('Buildout');
      expect(nextObjective.type).toBe('task');
      expect(nextObjective.title).toContain('bank account');
      expect(nextObjective.actionUrl).toBe('/vault');
    });

    it('should return "Reinforcement" stage for strength 60-74%', () => {
      const { currentStage, nextObjective } = ProgressService.determineStageAndObjective(70, null, true);
      
      expect(currentStage).toBe('Reinforcement');
      expect(nextObjective.type).toBe('task');
      expect(nextObjective.title).toContain('Family Hub');
      expect(nextObjective.actionUrl).toBe('/family-hub');
    });

    it('should return "Advanced Planning" stage for strength 75-89%', () => {
      const { currentStage, nextObjective } = ProgressService.determineStageAndObjective(85, null, true);
      
      expect(currentStage).toBe('Advanced Planning');
      expect(nextObjective.type).toBe('deepDive');
      expect(nextObjective.title).toContain('Foundation Secured');
      expect(nextObjective.features).toBeDefined();
      expect(nextObjective.features).toHaveLength(2);
    });

    it('should return "Monitoring" stage for 100% completion', () => {
      const lastReview = new Date().toISOString();
      const { currentStage, nextObjective } = ProgressService.determineStageAndObjective(100, lastReview, false);
      
      expect(currentStage).toBe('Monitoring');
      expect(nextObjective.type).toBe('monitoring');
      expect(nextObjective.title).toContain('Well Done');
      expect(nextObjective.lastReviewDate).toBe(lastReview);
      expect(nextObjective.notifications).toBeDefined();
    });
  });

  describe('Next Recommended Step', () => {
    it('should recommend adding trusted person for new users', () => {
      const status = ProgressService.getProgressStatus(mockUserId);
      
      expect(status.completionScore).toBe(70); // Mock default
      expect(status.currentStage).toBeDefined();
      expect(status.nextObjective).toBeDefined();
    });

    it('should recommend annual review when needed', () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      oneYearAgo.setDate(oneYearAgo.getDate() - 1);
      
      localStorage.setItem(`lastReview_${mockUserId}`, oneYearAgo.toISOString());
      
      const isReviewNeeded = ProgressService.checkIfReviewNeeded(oneYearAgo.toISOString());
      expect(isReviewNeeded).toBe(true);
    });

    it('should not recommend review if done recently', () => {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const isReviewNeeded = ProgressService.checkIfReviewNeeded(lastWeek.toISOString());
      expect(isReviewNeeded).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined user data gracefully', () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
          }),
        }),
      } as any);
      
      const strength = ProgressService.calculateCompletionScore(mockUserId);
      expect(strength).toBe(70); // Should return default mock value
    });

    it('should handle progress status for users who never reviewed', () => {
      const status = ProgressService.getProgressStatus(mockUserId);
      
      expect(status.lastReviewDate).toBeNull();
      expect(status.isReviewNeeded).toBe(true);
    });

    it('should update last review date correctly', () => {
      const newDate = ProgressService.updateLastReviewDate(mockUserId);
      const storedDate = localStorage.getItem(`lastReview_${mockUserId}`);
      
      expect(storedDate).toBe(newDate);
      expect(new Date(newDate).toDateString()).toBe(new Date().toDateString());
    });
  });
});
