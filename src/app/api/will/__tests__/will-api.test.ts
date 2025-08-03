import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getWillList } from '../list/route';
import { GET as getWill, PUT as updateWill, DELETE as deleteWill } from '../[id]/route';
import { POST as generateWill } from '../generate/route';
import { POST as signWill } from '../sign/route';
import { POST as notarizeWill, GET as verifyNotarization } from '../notarize/route';

// Mock Next.js dependencies
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
  })),
}));

vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-123', email: 'test@example.com' } },
        error: null,
      }),
    },
    from: vi.fn((table: string) => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockData[table], error: null }),
      order: vi.fn().mockReturnThis(),
    })),
    rpc: vi.fn().mockResolvedValue({ data: { id: 'version-123' }, error: null }),
  })),
}));

// Mock data
const mockData: Record<string, any> = {
  generated_wills: {
    id: 'will-123',
    user_id: 'test-user-123',
    country_code: 'SK',
    status: 'draft',
    will_content: {
      testator: { name: 'John Doe', birthDate: '1980-01-01', address: '123 Main St' },
      beneficiaries: [],
    },
  },
  will_notarization: {
    id: 'notary-123',
    will_id: 'will-123',
    notary_name: 'Jane Notary',
    verification_code: 'ABCD-EFGH-IJKL',
  },
};

describe('Will API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/will/list', () => {
    it('should return list of wills for authenticated user', async () => {
      const request = new NextRequest('http://localhost:3000/api/will/list');
      const response = await getWillList(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('GET /api/will/[id]', () => {
    it('should return specific will for authenticated user', async () => {
      const request = new NextRequest('http://localhost:3000/api/will/will-123');
      const response = await getWill(request, { params: { id: 'will-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe('will-123');
    });
  });

  describe('PUT /api/will/[id]', () => {
    it('should update draft will', async () => {
      const request = new NextRequest('http://localhost:3000/api/will/will-123', {
        method: 'PUT',
        body: JSON.stringify({
          willContent: { testator: { name: 'John Updated' } },
          requirements: {},
        }),
      });
      
      const response = await updateWill(request, { params: { id: 'will-123' } });
      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/will/[id]', () => {
    it('should delete draft will', async () => {
      const request = new NextRequest('http://localhost:3000/api/will/will-123', {
        method: 'DELETE',
      });
      
      const response = await deleteWill(request, { params: { id: 'will-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('POST /api/will/generate', () => {
    it('should generate new will PDF', async () => {
      const request = new NextRequest('http://localhost:3000/api/will/generate', {
        method: 'POST',
        body: JSON.stringify({
          willContent: mockData.generated_wills.will_content,
          requirements: { witness_count: 2, legal_language: { title: 'WILL' } },
          countryCode: 'SK',
        }),
      });

      const response = await generateWill(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.willId).toBeDefined();
    });
  });

  describe('POST /api/will/notarize', () => {
    it('should notarize signed will', async () => {
      mockData.generated_wills.status = 'signed';
      
      const request = new NextRequest('http://localhost:3000/api/will/notarize', {
        method: 'POST',
        body: JSON.stringify({
          willId: 'will-123',
          notaryName: 'Jane Notary',
          notaryLicense: 'NOT-12345',
          notaryJurisdiction: 'SK',
          notarizationLocation: 'Bratislava',
        }),
      });

      const response = await notarizeWill(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.verificationCode).toBeDefined();
    });
  });

  describe('GET /api/will/notarize', () => {
    it('should verify notarization with code', async () => {
      const request = new NextRequest('http://localhost:3000/api/will/notarize?code=ABCD-EFGH-IJKL');
      const response = await verifyNotarization(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.verified).toBe(true);
      expect(data.notarization).toBeDefined();
    });
  });
});
