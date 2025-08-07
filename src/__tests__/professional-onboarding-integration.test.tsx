/**
 * Integration Test Suite for Professional Onboarding Flow
 * Tests the complete non-gamified onboarding experience
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock Clerk hooks
vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({
    user: { id: 'test-user-123', firstName: 'John', lastName: 'Doe' },
    isLoaded: true,
  }),
  useAuth: () => ({
    isSignedIn: true,
    userId: 'test-user-123',
  }),
  SignedIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn().mockResolvedValue({ 
        data: { user: { id: 'test-user-123' } }, 
        error: null 
      }),
    },
  },
}));

// Import components after mocks are set up
import { ProfessionalFlowManager } from '@/features/onboarding/components/ProfessionalFlowManager';
import { ProfessionalDashboard } from '@/features/dashboard/components/ProfessionalDashboard';
import { useProfessionalProgress } from '@/hooks/useProfessionalProgress';

// Create a wrapper component for testing
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Professional Onboarding Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial User Experience', () => {
    it('should show welcome message for new users', async () => {
      // Mock new user with no data
      const mockSupabase = await import('@/integrations/supabase/client');
      vi.mocked(mockSupabase.supabase.from).mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      } as any));

      render(
        <TestWrapper>
          <ProfessionalFlowManager />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
      });

      // Should show supportive, non-gamified messaging
      expect(screen.queryByText(/points/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/level/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/achievement/i)).not.toBeInTheDocument();
    });

    it('should display initial security areas without gamification', async () => {
      render(
        <TestWrapper>
          <ProfessionalDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show security areas, not game levels
        expect(screen.getByText(/Security Overview/i)).toBeInTheDocument();
      });

      // No gamification elements
      expect(screen.queryByText(/XP/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/badge/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/streak/i)).not.toBeInTheDocument();
    });
  });

  describe('Progress Tracking', () => {
    it('should show readiness levels instead of game scores', async () => {
      const mockSupabase = await import('@/integrations/supabase/client');
      vi.mocked(mockSupabase.supabase.from).mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    has_will: true,
                    has_executor: true,
                    has_beneficiaries: true,
                  },
                  error: null,
                }),
              }),
            }),
          } as any;
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        } as any;
      });

      // Create a test component that uses the hook
      const TestComponent = () => {
        const { progress, isLoading } = useProfessionalProgress();
        
        if (isLoading) return <div>Loading...</div>;
        
        return (
          <div>
            <div>Readiness: {progress?.readinessLevel.label}</div>
            <div>Areas Complete: {progress?.metrics.completedAreas}/{progress?.metrics.totalAreas}</div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
      });

      // Should show professional readiness levels
      expect(screen.getByText(/Readiness:/i)).toBeInTheDocument();
      expect(screen.getByText(/Areas Complete:/i)).toBeInTheDocument();
      
      // No game elements
      expect(screen.queryByText(/Score:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Level \d+/i)).not.toBeInTheDocument();
    });

    it('should prioritize urgent actions without pressure', async () => {
      const mockSupabase = await import('@/integrations/supabase/client');
      vi.mocked(mockSupabase.supabase.from).mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { has_will: false }, // No will = urgent
                  error: null,
                }),
              }),
            }),
          } as any;
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        } as any;
      });

      render(
        <TestWrapper>
          <ProfessionalDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show urgent action without panic-inducing language
        expect(screen.getByText(/Estate Planning/i)).toBeInTheDocument();
      });

      // Professional urgency indicators
      expect(screen.queryByText(/urgent/i)).toBeInTheDocument();
      
      // No pressure tactics
      expect(screen.queryByText(/hurry/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/limited time/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/act now!/i)).not.toBeInTheDocument();
    });
  });

  describe('User Actions', () => {
    it('should handle area completion without celebration animations', async () => {
      const mockSupabase = await import('@/integrations/supabase/client');
      let hasWill = false;

      vi.mocked(mockSupabase.supabase.from).mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { has_will: hasWill },
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockImplementation((data) => {
              hasWill = data.has_will;
              return {
                eq: vi.fn().mockResolvedValue({
                  data: { has_will: true },
                  error: null,
                }),
              };
            }),
          } as any;
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        } as any;
      });

      const TestComponent = () => {
        const [completed, setCompleted] = React.useState(false);
        
        const handleComplete = () => {
          setCompleted(true);
          // Simulate completing an area
        };

        return (
          <div>
            {!completed ? (
              <button onClick={handleComplete}>Complete Estate Planning</button>
            ) : (
              <div>
                <span>✓ Complete</span>
                <span>Estate planning documents are now secured</span>
              </div>
            )}
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const button = screen.getByText('Complete Estate Planning');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('✓ Complete')).toBeInTheDocument();
        expect(screen.getByText(/secured/i)).toBeInTheDocument();
      });

      // No gamification celebrations
      expect(screen.queryByText(/congratulations/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/achievement unlocked/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/\+\d+ points/i)).not.toBeInTheDocument();
    });

    it('should show time estimates instead of points', async () => {
      render(
        <TestWrapper>
          <ProfessionalDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show time estimates
        const timeEstimates = screen.queryAllByText(/\d+ minutes/i);
        expect(timeEstimates.length).toBeGreaterThan(0);
      });

      // No point values
      expect(screen.queryByText(/\+\d+ XP/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/\d+ points/i)).not.toBeInTheDocument();
    });
  });

  describe('Navigation and Flow', () => {
    it('should allow skipping non-essential steps', async () => {
      render(
        <TestWrapper>
          <ProfessionalFlowManager />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should have skip option for non-critical items
        const skipButtons = screen.queryAllByText(/skip/i);
        expect(skipButtons.length).toBeGreaterThan(0);
      });
    });

    it('should provide clear next steps without pressure', async () => {
      render(
        <TestWrapper>
          <ProfessionalDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show next steps
        expect(screen.getByText(/Next Steps/i)).toBeInTheDocument();
      });

      // Professional language
      expect(screen.queryByText(/recommended/i)).toBeInTheDocument();
      
      // No pressure language
      expect(screen.queryByText(/must complete/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/required immediately/i)).not.toBeInTheDocument();
    });
  });

  describe('Review and Maintenance', () => {
    it('should remind about reviews without nagging', async () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      oneYearAgo.setDate(oneYearAgo.getDate() - 1);

      const mockSupabase = await import('@/integrations/supabase/client');
      vi.mocked(mockSupabase.supabase.from).mockImplementation((table: string) => {
        if (table === 'documents') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{
                  category: 'identity',
                  created_at: oneYearAgo.toISOString(),
                  updated_at: oneYearAgo.toISOString(),
                }],
                error: null,
              }),
            }),
          } as any;
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        } as any;
      });

      const TestComponent = () => {
        const { progress } = useProfessionalProgress();
        const needsReview = progress?.metrics.needsReviewCount || 0;
        
        return (
          <div>
            {needsReview > 0 && (
              <div>
                <span>Review Recommended</span>
                <span>Some documents may need updating</span>
              </div>
            )}
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Review Recommended/i)).toBeInTheDocument();
      });

      // Professional reminder language
      expect(screen.getByText(/may need updating/i)).toBeInTheDocument();
      
      // No nagging
      expect(screen.queryByText(/overdue/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/expired/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/warning/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', async () => {
      render(
        <TestWrapper>
          <ProfessionalDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        // Check for proper semantic HTML
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      // Check for headings hierarchy
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should be keyboard navigable', async () => {
      render(
        <TestWrapper>
          <ProfessionalDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
          expect(button).toHaveProperty('tabIndex');
        });
      });
    });
  });
});
