/**
 * Mock Utilities
 * 
 * Common mocks for testing CRM React apps
 */

import { DeploymentMode } from '../config/deploymentContext';

/**
 * Mock Dynamics 365 Xrm global object
 */
export function mockXrmGlobal() {
  global.Xrm = {
    Utility: {
      getGlobalContext: jest.fn().mockReturnValue({
        userSettings: {
          userId: 'test-user-id',
          userName: 'Test User',
          languageId: 1033,
          timeZoneCode: 85,
        },
        organizationSettings: {
          organizationId: 'test-org-id',
          uniqueName: 'testorg',
          friendlyName: 'Test Organization',
        },
        getClientUrl: jest.fn().mockReturnValue('https://test.crm.dynamics.com'),
        getVersion: jest.fn().mockReturnValue('9.2'),
        getCurrentAppName: jest.fn().mockReturnValue('Test App'),
        getCurrentAppProperties: jest.fn().mockReturnValue({
          appId: 'test-app-id',
          displayName: 'Test App',
        }),
      }),
      openEntityForm: jest.fn(),
      openQuickCreate: jest.fn(),
      openWebResource: jest.fn(),
      openAlertDialog: jest.fn(),
      openConfirmDialog: jest.fn(),
    },
    WebApi: {
      retrieveMultipleRecords: jest.fn().mockResolvedValue({
        entities: [],
        '@odata.count': 0,
      }),
      retrieveRecord: jest.fn().mockResolvedValue({
        id: 'test-record-id',
        name: 'Test Record',
      }),
      createRecord: jest.fn().mockResolvedValue({
        id: 'new-record-id',
      }),
      updateRecord: jest.fn().mockResolvedValue({}),
      deleteRecord: jest.fn().mockResolvedValue({}),
      online: {
        execute: jest.fn(),
        executeMultiple: jest.fn(),
      },
      offline: {
        execute: jest.fn(),
        executeMultiple: jest.fn(),
      },
    },
    Navigation: {
      openForm: jest.fn(),
      openUrl: jest.fn(),
      openAlertDialog: jest.fn(),
      openConfirmDialog: jest.fn(),
      openErrorDialog: jest.fn(),
      openFile: jest.fn(),
      openWebResource: jest.fn(),
    },
    Device: {
      captureAudio: jest.fn(),
      captureImage: jest.fn(),
      captureVideo: jest.fn(),
      getBarcodeValue: jest.fn(),
      getCurrentPosition: jest.fn(),
      pickFile: jest.fn(),
    },
  };
}

/**
 * Mock MSAL (Microsoft Authentication Library)
 */
export function mockMSAL() {
  const mockMsalInstance = {
    initialize: jest.fn().mockResolvedValue(undefined),
    acquireTokenSilent: jest.fn().mockResolvedValue({
      accessToken: 'mock-access-token',
      account: {
        homeAccountId: 'test-account-id',
        name: 'Test User',
        username: 'test@example.com',
      },
      expiresOn: new Date(Date.now() + 3600000), // 1 hour from now
    }),
    acquireTokenPopup: jest.fn().mockResolvedValue({
      accessToken: 'mock-access-token',
      account: {
        homeAccountId: 'test-account-id',
        name: 'Test User',
        username: 'test@example.com',
      },
    }),
    loginPopup: jest.fn().mockResolvedValue({
      account: {
        homeAccountId: 'test-account-id',
        name: 'Test User',
        username: 'test@example.com',
      },
    }),
    logout: jest.fn().mockResolvedValue(undefined),
    getAllAccounts: jest.fn().mockReturnValue([{
      homeAccountId: 'test-account-id',
      name: 'Test User',
      username: 'test@example.com',
    }]),
    getAccountByHomeId: jest.fn(),
    getAccountByLocalId: jest.fn(),
    getAccountByUsername: jest.fn(),
    setActiveAccount: jest.fn(),
    getActiveAccount: jest.fn().mockReturnValue({
      homeAccountId: 'test-account-id',
      name: 'Test User',
      username: 'test@example.com',
    }),
  };

  jest.mock('@azure/msal-browser', () => ({
    PublicClientApplication: jest.fn().mockImplementation(() => mockMsalInstance),
    InteractionRequiredAuthError: class MockInteractionRequiredAuthError extends Error {
      constructor(message?: string) {
        super(message);
        this.name = 'InteractionRequiredAuthError';
      }
    },
    BrowserAuthError: class MockBrowserAuthError extends Error {
      constructor(message?: string) {
        super(message);
        this.name = 'BrowserAuthError';
      }
    },
    AuthenticationResult: jest.fn(),
    AccountInfo: jest.fn(),
  }));

  return mockMsalInstance;
}

/**
 * Mock fetch for external API calls
 */
export function mockFetch() {
  global.fetch = jest.fn().mockImplementation((url: string, options?: RequestInit) => {
    const method = options?.method || 'GET';
    
    // Mock different API endpoints
    if (url.includes('/api/contacts')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          value: [
            { id: '1', fullname: 'John Doe', emailaddress1: 'john@example.com' },
            { id: '2', fullname: 'Jane Smith', emailaddress1: 'jane@example.com' },
          ],
          '@odata.count': 2,
        }),
      });
    }

    if (url.includes('/api/accounts')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          value: [
            { id: '1', name: 'Contoso Ltd', websiteurl: 'https://contoso.com' },
            { id: '2', name: 'Fabrikam Inc', websiteurl: 'https://fabrikam.com' },
          ],
          '@odata.count': 2,
        }),
      });
    }

    // Mock POST/PUT/DELETE operations
    if (method === 'POST') {
      return Promise.resolve({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ id: 'new-record-id' }),
      });
    }

    if (method === 'PUT' || method === 'PATCH') {
      return Promise.resolve({
        ok: true,
        status: 204,
        json: () => Promise.resolve({}),
      });
    }

    if (method === 'DELETE') {
      return Promise.resolve({
        ok: true,
        status: 204,
        json: () => Promise.resolve({}),
      });
    }

    // Default mock response
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });
  });
}

/**
 * Mock deployment context detection
 */
export function mockDeploymentContext(mode: DeploymentMode) {
  process.env.VITE_DEPLOYMENT_MODE = mode;
  
  // Mock window properties based on deployment mode
  switch (mode) {
    case DeploymentMode.WEB_RESOURCE:
      mockXrmGlobal();
      Object.defineProperty(window, 'location', {
        value: {
          href: 'https://test.crm.dynamics.com/main.aspx',
          hostname: 'test.crm.dynamics.com',
          pathname: '/main.aspx',
        },
        writable: true,
      });
      break;

    case DeploymentMode.STANDALONE:
      mockMSAL();
      mockFetch();
      Object.defineProperty(window, 'location', {
        value: {
          href: 'https://myapp.azurewebsites.net',
          hostname: 'myapp.azurewebsites.net',
          pathname: '/',
        },
        writable: true,
      });
      break;
  }
}

/**
 * Mock common browser APIs
 */
export function mockBrowserAPIs() {
  // Mock IntersectionObserver
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Mock ResizeObserver
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Mock MutationObserver
  global.MutationObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    disconnect: jest.fn(),
    takeRecords: jest.fn(),
  }));

  // Mock requestAnimationFrame
  global.requestAnimationFrame = jest.fn().mockImplementation(cb => setTimeout(cb, 16));
  global.cancelAnimationFrame = jest.fn().mockImplementation(id => clearTimeout(id));

  // Mock URL.createObjectURL
  global.URL.createObjectURL = jest.fn().mockReturnValue('mock-object-url');
  global.URL.revokeObjectURL = jest.fn();

  // Mock Blob
  global.Blob = jest.fn().mockImplementation((content, options) => ({
    size: content ? content.length : 0,
    type: options?.type || '',
  }));

  // Mock File
  global.File = jest.fn().mockImplementation((content, name, options) => ({
    name,
    size: content ? content.length : 0,
    type: options?.type || '',
    lastModified: Date.now(),
  }));
}

/**
 * Setup all common mocks for testing
 */
export function setupTestMocks(deploymentMode: DeploymentMode = DeploymentMode.STANDALONE) {
  mockDeploymentContext(deploymentMode);
  mockBrowserAPIs();
  
  // Mock console methods to reduce test noise
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'debug').mockImplementation(() => {});
}

/**
 * Cleanup mocks after tests
 */
export function cleanupTestMocks() {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  
  // Clean up global objects
  delete (global as any).Xrm;
  delete (global as any).fetch;
  
  // Reset environment variables
  delete process.env.VITE_DEPLOYMENT_MODE;
  delete process.env.VITE_THEME_MODE;
}
