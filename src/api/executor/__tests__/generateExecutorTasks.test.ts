import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';
import { generateExecutorTasks } from '../tasks';
import { ExecutorTaskService } from '@/services/executorTaskService';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/services/executorTaskService', () => ({
  ExecutorTaskService: {
    generateExecutorTasks: vi.fn(),
  },
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
  },
}));

const mockedService = ExecutorTaskService as unknown as {
  generateExecutorTasks: ReturnType<typeof vi.fn>;
};

const mockedSupabase = supabase as unknown as {
  auth: { getUser: ReturnType<typeof vi.fn> };
};

function mockResponse() {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnThis();
  res.json = vi.fn().mockReturnThis();
  return res as Response;
}

describe('generateExecutorTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows admin users to generate tasks', async () => {
    mockedSupabase.auth.getUser.mockResolvedValue({
      data: { user: { user_metadata: { role: 'admin' }, email: 'admin@legacyguard.com' } },
      error: null,
    });

    const req = {
      body: { deceasedUserId: 'd1', executorId: 'e1' },
      headers: { authorization: 'Bearer token' },
    } as unknown as Request;
    const res = mockResponse();

    await generateExecutorTasks(req, res);

    expect(mockedService.generateExecutorTasks).toHaveBeenCalledWith('d1', 'e1');
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Executor tasks generated successfully',
    });
  });

  it('rejects non-admin users', async () => {
    mockedSupabase.auth.getUser.mockResolvedValue({
      data: { user: { user_metadata: { role: 'user' }, email: 'user@example.com' } },
      error: null,
    });

    const req = {
      body: { deceasedUserId: 'd1', executorId: 'e1' },
      headers: { authorization: 'Bearer token' },
    } as unknown as Request;
    const res = mockResponse();

    await generateExecutorTasks(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
    expect(mockedService.generateExecutorTasks).not.toHaveBeenCalled();
  });
});
