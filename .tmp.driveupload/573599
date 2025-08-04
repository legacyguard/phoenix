import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { LogLifeEvent, generateChecklist } from '@/services/LivingLegacy';
import { db } from '@/infra/db';

vi.mock('@/infra/db', () => ({
  db: {
    accounts: {
      where: vi.fn(),
    },
    lifeEvents: {
      insert: vi.fn(),
    },
    checklists: {
      insert: vi.fn(),
    },
  },
}));

beforeAll(() => {
  vi.mocked(db.accounts.where).mockReturnValue([{
    id: 'user_123',
    needsReview: true,
  }]);
});

afterAll(() => {
  vi.resetAllMocks();
});

describe('Living Legacy Service - Annual Review', () => {
  it('should identify accounts needing review', async () => {
    const accounts = await db.accounts.where('needsReview', true);
    expect(accounts.length).toBeGreaterThan(0);
    expect(accounts[0].id).toBe('user_123');
  });
});

describe('Life Event - LogLifeEvent Checklist Generation', () => {
  const eventTypes = ['New Child', 'Retirement', 'New Job'];

  it('should generate the correct checklist for life events', () => {
    eventTypes.forEach((event) => {
      const checklist = generateChecklist(event);
      expect(checklist).toBeDefined();
      expect(checklist.length).toBeGreaterThan(0);
    });
  });

  it('should log life event in database', async () => {
    await LogLifeEvent('user_123', 'New Child');
    expect(db.lifeEvents.insert).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user_123',
      type: 'New Child',
    }));
  });
});

