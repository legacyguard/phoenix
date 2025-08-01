import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logActivity } from '../loggingService';
import { supabase } from '@/integrations/supabase/client';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn()
    }))
  }
}));

describe('LoggingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error during tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('logActivity', () => {
    it('should successfully log activity with all parameters', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      (supabase.from as Record<string, unknown>).mockReturnValue({ insert: mockInsert });

      const logParams = {
        userId: 'user-123',
        actor: 'USER' as const,
        action: 'document_uploaded',
        targetId: 'doc-456',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        metadata: { fileSize: 1024, fileType: 'pdf' }
      };

      await logActivity(logParams);

      expect(supabase.from).toHaveBeenCalledWith('access_logs');
      expect(mockInsert).toHaveBeenCalledWith([{
        user_id: 'user-123',
        actor: 'USER',
        action: 'document_uploaded',
        target_id: 'doc-456',
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
        metadata: { fileSize: 1024, fileType: 'pdf' }
      }]);
    });

    it('should successfully log activity with minimal parameters', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      (supabase.from as Record<string, unknown>).mockReturnValue({ insert: mockInsert });

      const logParams = {
        userId: 'user-123',
        actor: 'AI_SYSTEM' as const,
        action: 'document_categorized'
      };

      await logActivity(logParams);

      expect(supabase.from).toHaveBeenCalledWith('access_logs');
      expect(mockInsert).toHaveBeenCalledWith([{
        user_id: 'user-123',
        actor: 'AI_SYSTEM',
        action: 'document_categorized',
        target_id: undefined,
        ip_address: undefined,
        user_agent: undefined,
        metadata: {}
      }]);
    });

    it('should handle database errors gracefully', async () => {
      const mockError = new Error('Database connection failed');
      const mockInsert = vi.fn().mockResolvedValue({ error: mockError });
      (supabase.from as Record<string, unknown>).mockReturnValue({ insert: mockInsert });

      const logParams = {
        userId: 'user-123',
        actor: 'TRUSTED_PERSON' as const,
        action: 'document_viewed'
      };

      // Should not throw an error
      await expect(logActivity(logParams)).resolves.toBeUndefined();

      expect(console.error).toHaveBeenCalledWith('Failed to log activity:', mockError);
    });

    it('should handle network errors gracefully', async () => {
      const mockError = new Error('Network timeout');
      const mockInsert = vi.fn().mockRejectedValue(mockError);
      (supabase.from as Record<string, unknown>).mockReturnValue({ insert: mockInsert });

      const logParams = {
        userId: 'user-123',
        actor: 'USER' as const,
        action: 'login_attempt'
      };

      // Should not throw an error
      await expect(logActivity(logParams)).resolves.toBeUndefined();

      expect(console.error).toHaveBeenCalledWith('Failed to log activity:', mockError);
    });

    it('should use default empty object for metadata when not provided', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      (supabase.from as Record<string, unknown>).mockReturnValue({ insert: mockInsert });

      const logParams = {
        userId: 'user-123',
        actor: 'USER' as const,
        action: 'profile_updated'
      };

      await logActivity(logParams);

      expect(mockInsert).toHaveBeenCalledWith([{
        user_id: 'user-123',
        actor: 'USER',
        action: 'profile_updated',
        target_id: undefined,
        ip_address: undefined,
        user_agent: undefined,
        metadata: {}
      }]);
    });

    it('should handle all actor types correctly', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      (supabase.from as Record<string, unknown>).mockReturnValue({ insert: mockInsert });

      const actors = ['USER', 'AI_SYSTEM', 'TRUSTED_PERSON'] as const;

      for (const actor of actors) {
        await logActivity({
          userId: 'user-123',
          actor,
          action: 'test_action'
        });

        expect(mockInsert).toHaveBeenCalledWith([{
          user_id: 'user-123',
          actor,
          action: 'test_action',
          target_id: undefined,
          ip_address: undefined,
          user_agent: undefined,
          metadata: {}
        }]);
      }
    });
  });
}); 