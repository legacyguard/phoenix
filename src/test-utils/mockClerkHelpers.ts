import type { UserResource } from '@clerk/types';

// Define mock types that match Clerk's actual types
export interface MockUser extends Partial<UserResource> {
  id: string;
  primaryEmailAddress?: {
    emailAddress: string;
    id: string;
  };
  emailAddresses?: Array<{
    emailAddress: string;
    id: string;
  }>;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  imageUrl?: string;
  publicMetadata?: Record<string, unknown>;
  unsafeMetadata?: Record<string, unknown>;
}

// Create test user factories
export const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => {
  const id = overrides.id || `user_${Math.random().toString(36).substring(7)}`;
  const email = overrides.primaryEmailAddress?.emailAddress || `user-${id}@test.com`;
  const firstName = overrides.firstName || 'Test';
  const lastName = overrides.lastName || 'User';
  
  return {
    id,
    primaryEmailAddress: {
      emailAddress: email,
      id: `email_${Math.random().toString(36).substring(7)}`
    },
    emailAddresses: [{
      emailAddress: email,
      id: `email_${Math.random().toString(36).substring(7)}`
    }],
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    imageUrl: `https://ui-avatars.com/api/?name=${firstName}+${lastName}`,
    publicMetadata: {
      subscriptionTier: 'free',
      isExecutor: false,
      ...overrides.publicMetadata
    },
    unsafeMetadata: {},
    ...overrides
  };
};

// Pre-defined test users
export const mockUsers = {
  freeUser: createMockUser({
    id: 'test-free-user',
    firstName: 'Free',
    lastName: 'User',
    primaryEmailAddress: {
      emailAddress: 'test-free@example.com',
      id: 'email-free'
    },
    publicMetadata: {
      subscriptionTier: 'free',
      isExecutor: false
    }
  }),
  premiumUser: createMockUser({
    id: 'test-premium-user', 
    firstName: 'Premium',
    lastName: 'User',
    primaryEmailAddress: {
      emailAddress: 'test-premium@example.com',
      id: 'email-premium'
    },
    publicMetadata: {
      subscriptionTier: 'premium',
      isExecutor: true
    }
  })
};
