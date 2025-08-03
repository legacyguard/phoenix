import { createContext } from 'react';
import type { SessionResource } from '@clerk/types';
import { MockUser } from './mockClerkHelpers';

export interface MockSession extends Partial<SessionResource> {
  id: string;
  status: 'active' | 'ended' | 'expired' | 'removed' | 'replaced' | 'unknown';
  lastActiveAt: Date;
  expireAt: Date;
  user?: MockUser;
}

export interface MockAuthContextValue {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  sessionId: string | null;
  session: MockSession | null;
  signOut: () => Promise<void>;
  getToken: (options?: Record<string, unknown>) => Promise<string | null>;
  orgId: string | null;
  orgRole: string | null;
  orgSlug: string | null;
}

export interface MockUserContextValue {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: MockUser | null;
}

// Create contexts
export const MockAuthContext = createContext<MockAuthContextValue | null>(null);
export const MockUserContext = createContext<MockUserContextValue | null>(null);
export const MockClerkContext = createContext<Record<string, unknown> | null>(null);
