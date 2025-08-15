import { Page, Route } from '@playwright/test';

// Mock data generators
export const generateMockAsset = (overrides: Partial<any> = {}) => ({
  id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test Asset',
  main_category: 'personal-items',
  sub_type: 'jewelry',
  estimated_value: 5000,
  currency: 'USD',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  user_id: 'mock_user_id',
  details: {},
  ...overrides,
});

export const generateMockDocument = (overrides: Partial<any> = {}) => ({
  id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  file_name: 'test-document.pdf',
  file_size: 1024000,
  file_type: 'application/pdf',
  category: 'will',
  metadata: {},
  created_at: new Date().toISOString(),
  user_id: 'mock_user_id',
  ...overrides,
});

export const generateMockTrustedPerson = (overrides: Partial<any> = {}) => ({
  id: `trusted_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  relationship: 'spouse',
  role: 'executor',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  user_id: 'mock_user_id',
  ...overrides,
});

// Supabase Database Mocks
export async function mockAssets(page: Page, assets: any[] = []) {
  // Match Supabase REST API patterns
  await page.route('**/*.supabase.co/rest/v1/assets**', async (route: Route) => {
    const method = route.request().method();
    const url = route.request().url();
    
    if (method === 'GET') {
      // Handle query parameters for filtering
      if (url.includes('select=')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          json: assets,
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          json: assets,
        });
      }
    } else if (method === 'POST') {
      // Create new asset
      const requestBody = route.request().postDataJSON();
      const newAsset = generateMockAsset(requestBody);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        json: [newAsset], // Supabase returns array for insert with select
      });
    } else if (method === 'PATCH') {
      // Update asset
      const requestBody = route.request().postDataJSON();
      const assetId = url.match(/id=eq\.([^&]+)/)?.[1];
      const updatedAsset = assets.find(a => a.id === assetId) || generateMockAsset();
      Object.assign(updatedAsset, requestBody);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: [updatedAsset],
      });
    } else if (method === 'DELETE') {
      await route.fulfill({
        status: 204,
        contentType: 'application/json',
      });
    } else {
      await route.continue();
    }
  });
}

export async function mockDocuments(page: Page, documents: any[] = []) {
  await page.route('**/*.supabase.co/rest/v1/documents**', async (route: Route) => {
    const method = route.request().method();
    
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: documents,
      });
    } else if (method === 'POST') {
      const requestBody = route.request().postDataJSON();
      const newDocument = generateMockDocument(requestBody);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        json: [newDocument],
      });
    } else if (method === 'DELETE') {
      await route.fulfill({
        status: 204,
        contentType: 'application/json',
      });
    } else {
      await route.continue();
    }
  });
}

export async function mockTrustedPeople(page: Page, trustedPeople: any[] = []) {
  await page.route('**/*.supabase.co/rest/v1/trusted_people**', async (route: Route) => {
    const method = route.request().method();
    
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: trustedPeople,
      });
    } else if (method === 'POST') {
      const requestBody = route.request().postDataJSON();
      const newPerson = generateMockTrustedPerson(requestBody);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        json: [newPerson],
      });
    } else {
      await route.continue();
    }
  });
}

export async function mockAssetFiles(page: Page, assetFiles: any[] = []) {
  await page.route('**/*.supabase.co/rest/v1/asset_files**', async (route: Route) => {
    const method = route.request().method();
    
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: assetFiles,
      });
    } else if (method === 'POST') {
      const requestBody = route.request().postDataJSON();
      const newFile = {
        id: `file_${Date.now()}`,
        ...requestBody,
        created_at: new Date().toISOString(),
      };
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        json: [newFile],
      });
    } else {
      await route.continue();
    }
  });
}

// Supabase Storage Mocks
export async function mockStorageUpload(page: Page) {
  await page.route('**/*.supabase.co/storage/v1/object/**', async (route: Route) => {
    const method = route.request().method();
    
    if (method === 'POST') {
      // Mock file upload
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          Key: `mock-file-${Date.now()}.pdf`,
        },
      });
    } else if (method === 'GET') {
      // Mock file download - return a simple blob
      await route.fulfill({
        status: 200,
        contentType: 'application/octet-stream',
        body: Buffer.from('Mock file content'),
      });
    } else {
      await route.continue();
    }
  });
}

// Supabase Auth Mocks
export async function mockAuth(page: Page, user: any = null) {
  const mockUser = user || {
    id: 'mock_user_id',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  };

  // Mock getting current user
  await page.route('**/*.supabase.co/auth/v1/user**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: mockUser,
    });
  });

  // Mock token endpoint
  await page.route('**/*.supabase.co/auth/v1/token**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        access_token: 'mock_access_token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock_refresh_token',
        user: mockUser,
      },
    });
  });
}

// Custom API Route Mocks
export async function mockPlanStrength(page: Page, strength: number = 0) {
  // This might be calculated client-side, but if there's an API endpoint
  await page.route('**/api/user/plan-strength**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: { strength, total: 100 },
    });
  });
}

export async function mockPrivacySettings(page: Page, settings: any = {}) {
  await page.route('**/api/privacy-settings**', async (route: Route) => {
    const method = route.request().method();
    
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          shareData: false,
          allowAnalytics: false,
          ...settings,
        },
      });
    } else if (method === 'POST' || method === 'PUT') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: { success: true },
      });
    } else {
      await route.continue();
    }
  });
}

export async function mockExecutorTasks(page: Page, tasks: any[] = []) {
  await page.route('**/api/executor/tasks**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: tasks,
    });
  });
}

// Utility function to set up all basic mocks
export async function setupBasicMocks(
  page: Page,
  options: {
    assets?: any[];
    documents?: any[];
    trustedPeople?: any[];
    user?: any;
  } = {}
) {
  // Set up authentication
  await mockAuth(page, options.user);
  
  // Set up database mocks
  await mockAssets(page, options.assets || []);
  await mockDocuments(page, options.documents || []);
  await mockTrustedPeople(page, options.trustedPeople || []);
  await mockAssetFiles(page, []);
  
  // Set up storage mocks
  await mockStorageUpload(page);
  
  // Set up custom API mocks
  await mockPrivacySettings(page);
  await mockExecutorTasks(page);
}

// Helper to create a complete mock environment with sample data
export async function setupMockEnvironment(page: Page) {
  const sampleAssets = [
    generateMockAsset({
      id: 'asset_1',
      name: 'Family Home',
      main_category: 'real-estate',
      sub_type: 'residential',
      estimated_value: 500000,
    }),
    generateMockAsset({
      id: 'asset_2',
      name: 'Grandmother\'s Wedding Ring',
      main_category: 'personal-items',
      sub_type: 'jewelry',
      estimated_value: 10000,
    }),
    generateMockAsset({
      id: 'asset_3',
      name: 'Investment Portfolio',
      main_category: 'investments',
      sub_type: 'stocks',
      estimated_value: 250000,
    }),
  ];

  const sampleDocuments = [
    generateMockDocument({
      id: 'doc_1',
      file_name: 'will_2024.pdf',
      category: 'will',
    }),
    generateMockDocument({
      id: 'doc_2',
      file_name: 'insurance_policy.pdf',
      category: 'insurance',
    }),
  ];

  const sampleTrustedPeople = [
    generateMockTrustedPerson({
      id: 'trusted_1',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      relationship: 'spouse',
      role: 'executor',
    }),
    generateMockTrustedPerson({
      id: 'trusted_2',
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      relationship: 'friend',
      role: 'beneficiary',
    }),
  ];

  await setupBasicMocks(page, {
    assets: sampleAssets,
    documents: sampleDocuments,
    trustedPeople: sampleTrustedPeople,
  });
}
