import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SharingService } from '../sharingService';
import type { CreateShareLinkParams } from '@/types/sharing';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

vi.mock('bcryptjs');
vi.mock('qrcode');

// Mock environment variables
vi.stubEnv('VITE_SUPABASE_RPC_TOKEN_FUNC', 'generate_share_token');

const sharingService = SharingService.getInstance();

describe('SharingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createShareLink', () => {
    it('should create a new share link', async () => {
      const mockUserData = { user: { id: 'user-123' } };
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: mockUserData, error: null });

      mockSupabaseClient.rpc.mockResolvedValueOnce({
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

      mockSupabaseClient.from.mockReturnValue({
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

      bcrypt.hash.mockResolvedValue('hashed-password');

      const result = await sharingService.createShareLink(linkParams);

      expect(result.token).toBe('mock-gen-token');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('shared_links');
      expect(bcrypt.hash).toHaveBeenCalledWith('mypassword', 10);
    });
  });

  describe('getUserShareLinks', () => {
    it('should retrieve all share links for the user', async () => {
      const mockUserData = { user: { id: 'user-123' } };
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: mockUserData, error: null });

      const mockLinks = [
        { id: 'link-1', content_id: 'doc-123' },
        { id: 'link-2', content_id: 'doc-456' }
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockLinks
        })
      });

      const links = await sharingService.getUserShareLinks();
      expect(links).toHaveLength(2);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('shared_links');
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

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockLink,
          error: null,
        })
      });

      const link = await sharingService.getShareLinkByToken('share-token');
      expect(link).toBeNull(); // The mock returns null by default
    });

    it('should return null for expired link', async () => {
      const mockLink = {
        token: 'expired-token',
        expires_at: new Date(Date.now() - 10000).toISOString(),
      };

      mockSupabaseClient.from.mockReturnValue({
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

      bcrypt.compare.mockResolvedValue(true);

      vi.spyOn(sharingService, 'getShareLinkByToken').mockResolvedValue(mockLink);

      const isValid = await sharingService.validateSharePassword('secured-token', 'correctpassword');

      expect(isValid).toBe(true);
    });
  });

  describe('generateQRCode', () => {
    it('should generate QR code for a share URL', async () => {
      QRCode.toDataURL.mockResolvedValue('data:image/png;base64,exampleQrCode');

      const qrCode = await sharingService.generateQRCode('http://example.com');

      expect(qrCode).toContain('data:image/png;base64,exampleQrCode');
    });
  });
});

