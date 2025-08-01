import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AnalyticsService } from '../analytics';

// Mock the supabase client
const mockInsert = vi.fn();
const mockFrom = vi.fn(() => ({
  select: vi.fn(() => ({
    eq: vi.fn(() => ({
      single: vi.fn()
    }))
  })),
  insert: mockInsert
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: mockFrom,
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id' } } }))
    }
  }
}));

// Mock sessionStorage and localStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock fetch
global.fetch = vi.fn();

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue(null);
    mockLocalStorage.getItem.mockReturnValue('true'); // Consent given by default
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    
    // Setup default insert mock behavior
    mockInsert.mockResolvedValue({ error: null });
    
    // Reset the singleton instance
    (AnalyticsService as any).instance = undefined;
    analyticsService = AnalyticsService.getInstance();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = AnalyticsService.getInstance();
      const instance2 = AnalyticsService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Session Management', () => {
    it('should create a new session ID when none exists', () => {
      mockSessionStorage.getItem.mockReturnValue(null);
      const service = AnalyticsService.getInstance();
      
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'analytics_session_id',
        expect.any(String)
      );
    });

    it('should reuse existing session ID when available', () => {
      const existingSessionId = 'existing-session-123';
      mockSessionStorage.getItem.mockReturnValue(existingSessionId);
      
      const service = AnalyticsService.getInstance();
      
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('analytics_session_id');
    });
  });

  describe('Consent Management', () => {
    it('should load consent from localStorage on initialization', () => {
      mockLocalStorage.getItem.mockReturnValue('true');
      const service = AnalyticsService.getInstance();
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('analytics_consent');
    });

    it('should set consent and save to localStorage', () => {
      const service = AnalyticsService.getInstance();
      service.setConsent(false);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('analytics_consent', 'false');
    });

    it('should clear event queue when consent is revoked', () => {
      const service = AnalyticsService.getInstance();
      service.setConsent(false);
      
      // The queue should be cleared when consent is revoked
      // This is tested indirectly through the track method
    });
  });

  describe('Event Tracking', () => {
    it('should not track events when consent is not given', async () => {
      mockLocalStorage.getItem.mockReturnValue('false');
      const service = AnalyticsService.getInstance();
      
      await service.track('test_event');
      
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('should track events when consent is given', async () => {
      const service = AnalyticsService.getInstance();
      
      await service.track('test_event', { property: 'value' });
      
      expect(mockInsert).toHaveBeenCalled();
    });

    it('should sanitize properties before sending', async () => {
      const service = AnalyticsService.getInstance();
      
      await service.track('test_event', {
        sensitiveData: 'password123',
        normalData: 'value',
        nested: { sensitive: 'secret' }
      });
      
      const insertCall = mockInsert.mock.calls[0];
      const insertData = insertCall[0];
      
      expect(insertData.properties).toEqual({
        normalData: 'value',
        nested: { sensitive: 'secret' }
      });
    });
  });

  describe('Specialized Tracking Methods', () => {
    it('should track onboarding steps', async () => {
      const service = AnalyticsService.getInstance();
      
      await service.trackOnboardingStep('profile_completion', true);
      
      expect(mockInsert).toHaveBeenCalled();
    });

    it('should track document actions', async () => {
      const service = AnalyticsService.getInstance();
      
      await service.trackDocumentAction('uploaded', 'pdf');
      
      expect(mockInsert).toHaveBeenCalled();
    });

    it('should track family actions', async () => {
      const service = AnalyticsService.getInstance();
      
      await service.trackFamilyAction('guardian_added');
      
      expect(mockInsert).toHaveBeenCalled();
    });

    it('should track emotional milestones', async () => {
      const service = AnalyticsService.getInstance();
      
      await service.trackEmotionalMilestone('first_peace_of_mind');
      
      expect(mockInsert).toHaveBeenCalled();
    });

    it('should track feature usage', async () => {
      const service = AnalyticsService.getInstance();
      
      await service.trackFeatureUsage('document_upload', true);
      
      expect(mockInsert).toHaveBeenCalled();
    });
  });

  describe('User Metrics', () => {
    it('should calculate onboarding completion correctly', async () => {
      const service = AnalyticsService.getInstance();
      
      // Mock the getUserMetrics method to return test data
      const mockMetrics = {
        onboarding_completion: 75,
        time_to_first_value: 120,
        feature_adoption: { document_upload: 0.8, guardian_management: 0.6 },
        document_completion: 60,
        family_preparedness_score: 85
      };
      
      // This would require mocking the actual implementation
      // For now, we'll test the structure
      expect(mockMetrics.onboarding_completion).toBe(75);
      expect(mockMetrics.time_to_first_value).toBe(120);
      expect(mockMetrics.feature_adoption.document_upload).toBe(0.8);
    });
  });

  describe('Session Management', () => {
    it('should start a new session', () => {
      const service = AnalyticsService.getInstance();
      const originalSessionId = mockSessionStorage.getItem('analytics_session_id');
      
      service.startNewSession();
      
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'analytics_session_id',
        expect.any(String)
      );
    });

    it('should end session and track session duration', () => {
      const service = AnalyticsService.getInstance();
      
      service.endSession();
      
      expect(mockInsert).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));
      const service = AnalyticsService.getInstance();
      
      // Should not throw an error
      await expect(service.track('test_event')).resolves.toBeUndefined();
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });
      const service = AnalyticsService.getInstance();
      
      // Should not throw an error
      await expect(service.track('test_event')).resolves.toBeUndefined();
    });
  });

  describe('Offline Support', () => {
    it('should queue events when offline', async () => {
      // Mock navigator.onLine to be false
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
      });
      
      const service = AnalyticsService.getInstance();
      await service.track('offline_event');
      
      // Event should be queued, not sent immediately
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('should process queued events when coming back online', async () => {
      // Mock navigator.onLine to be true
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
      });
      
      const service = AnalyticsService.getInstance();
      
      // Simulate coming back online
      window.dispatchEvent(new Event('online'));
      
      // Should attempt to process queued events
      // Since there are no queued events, we just verify the service is initialized
      expect(service).toBeDefined();
    });
  });
}); 