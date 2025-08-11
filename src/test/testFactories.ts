// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: "test-user-id",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockWill = (overrides = {}) => ({
  id: "test-will-id",
  userId: "test-user-id",
  title: "Test Will",
  content: "Test will content",
  version: 1,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockAsset = (overrides = {}) => ({
  id: "test-asset-id",
  userId: "test-user-id",
  name: "Test Asset",
  type: "property",
  value: 100000,
  description: "Test asset description",
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockGuardian = (overrides = {}) => ({
  id: "test-guardian-id",
  userId: "test-user-id",
  name: "Test Guardian",
  email: "guardian@example.com",
  phone: "+1234567890",
  relationship: "friend",
  isPrimary: true,
  createdAt: new Date().toISOString(),
  ...overrides,
});
