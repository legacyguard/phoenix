import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SharingService } from '../sharingService';
import type { CreateShareLinkParams } from '@/types/sharing';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';

vi.mock('@/lib/supabase', () => {
  const mockSupabaseClient = {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
    rpc: vi.fn(),
  };

  return {
    supabase: mockSupabaseClient,
  };
});

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn(),
  },
}));

// Mock environment variables
vi.stubEnv('VITE_SUPABASE_RPC_TOKEN_FUNC', 'generate_share_token');

const sharingService = SharingService.getInstance();

describe('SharingService', () => {
  let mockSupabase: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { supabase } = await import('@/lib/supabase');
    mockSupabase = supabase;
  });

  describe('createShareLink', () => {
    it('should create a new share link', async () => {
      const mockUserData = { user: { id: 'user-123' } };
      mockSupabase.auth.getUser.mockResolvedValue({ data: mockUserData, error: null });

      mockSupabase.rpc.mockResolvedValueOnce({
        data: 'mock-gen-token'
      });

      const mockLink = {
        id: 'share-123',
        token: 'mock-gen-token',
        password_hash: 'hashed-password',
        user_id: 'user-123',
        content_type: 'document',
        content_id: 'doc-123',
        view_count: 0,
        settings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockLink,
          error: null,
        })
      });

      const linkParams: CreateShareLinkParams = {
        content_type: 'document',
        content_id: 'doc-123',
        title: 'Shared Document',
        description: 'This is a shared document link',
        max_views: 5,
        expiration: '7d',
        password: 'mypassword',
      };

      (bcrypt.hash as any).mockResolvedValue('hashed-password');

      const result = await sharingService.createShareLink(linkParams);

      expect(result.token).toBe('mock-gen-token');
      expect(mockSupabase.from).toHaveBeenCalledWith('shared_links');
      expect(bcrypt.hash).toHaveBeenCalledWith('mypassword', 10);
    });
  });

  describe('getUserShareLinks', () => {
    it('should retrieve all share links for the user', async () => {
      const mockUserData = { user: { id: 'user-123' } };
      mockSupabase.auth.getUser.mockResolvedValue({ data: mockUserData, error: null });

      const mockLinks = [
        { id: 'link-1', content_id: 'doc-123' },
        { id: 'link-2', content_id: 'doc-456' }
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockLinks
        })
      });

      const links = await sharingService.getUserShareLinks();
      expect(links).toHaveLength(2);
      expect(mockSupabase.from).toHaveBeenCalledWith('shared_links');
    });
  });

  describe('getShareLinkByToken', () => {
    it('should retrieve a valid share link by token', async () => {
      const mockLink = {
        token: 'share-token',
        expires_at: new Date(Date.now() + 10000).toISOString(),
        max_views: 5,
        view_count: 0
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockLink,
          error: null,
        })
      });

      const link = await sharingService.getShareLinkByToken('share-token');
      expect(link).toEqual(mockLink);
    });

    it('should return null for expired link', async () => {
      const mockLink = {
        token: 'expired-token',
        expires_at: new Date(Date.now() - 10000).toISOString(),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockLink,
          error: null,
        })
      });

      const link = await sharingService.getShareLinkByToken('expired-token');
      expect(link).toBeNull();
    });
  });

  describe('validateSharePassword', () => {
    it('should validate correct password', async () => {
      const mockLink = {
        token: 'secured-token',
        password_hash: 'hashed-password'
      };

      (bcrypt.compare as any).mockResolvedValue(true);

      const fullMockLink = {
        id: 'share-123',
        token: 'secured-token',
        password_hash: 'hashed-password',
        user_id: 'user-123',
        content_type: 'document' as const,
        content_id: 'doc-123',
        view_count: 0,
        settings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        expires_at: null,
        max_views: null,
        title: 'Test',
        description: null,
      };

      vi.spyOn(sharingService, 'getShareLinkByToken').mockResolvedValue(fullMockLink);

      const isValid = await sharingService.validateSharePassword('secured-token', 'correctpassword');

      expect(isValid).toBe(true);
    });
  });

  describe('generateQRCode', () => {
    it('should generate QR code for a share URL', async () => {
      (QRCode.toDataURL as any).mockResolvedValue('data:image/png;base64,exampleQrCode');

      const qrCode = await sharingService.generateQRCode('http://example.com');

      expect(qrCode).toContain('data:image/png;base64,exampleQrCode');
    });
  });
});
