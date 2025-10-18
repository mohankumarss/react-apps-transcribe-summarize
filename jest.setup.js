/**
 * Jest Setup File
 *
 * Global test configuration and utilities for theme-aware testing
 */

require('@testing-library/jest-dom');

// Mock CSS imports
jest.mock('*.css', () => ({}));

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.WEBPACK_DEPLOYMENT_MODE = 'standalone_mfe';
process.env.THEME_MODE = 'mfe';

// Mock process.env for Jest (webpack-style)
global.process = global.process || {};
global.process.env = global.process.env || {};
Object.assign(global.process.env, {
  NODE_ENV: 'test',
  WEBPACK_DEPLOYMENT_MODE: 'standalone_mfe',
  THEME_MODE: 'mfe',
});

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver for components that use it
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver for components that use it
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock getComputedStyle for CSS custom properties
const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = jest.fn().mockImplementation((element) => {
  const style = originalGetComputedStyle(element);
  return {
    ...style,
    getPropertyValue: jest.fn().mockImplementation((property) => {
      // Mock common CSS custom properties for theme testing
      const mockValues = {
        '--theme-primary': '#0078d4',
        '--theme-secondary': '#106ebe',
        '--theme-bg-primary': '#ffffff',
        '--theme-text-primary': '#323130',
        '--theme-border-primary': '#d2d0ce',
        '--theme-font-family': 'Segoe UI, sans-serif',
        '--theme-spacing-sm': '8px',
        '--theme-spacing-md': '16px',
        '--theme-spacing-lg': '24px',
        '--theme-border-radius': '2px',
        '--theme-shadow': '0 2px 4px rgba(0, 0, 0, 0.1)',
      };
      return mockValues[property] || '';
    }),
  };
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console.log in tests
  // log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Setup DOM environment for theme testing
beforeEach(() => {
  // Reset document attributes
  document.documentElement.removeAttribute('data-theme');
  document.body.removeAttribute('data-theme');
  
  // Clear any CSS custom properties
  document.documentElement.style.cssText = '';
  
  // Reset localStorage/sessionStorage
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
});

// Cleanup after each test
afterEach(() => {
  // Clear any timers
  jest.clearAllTimers();
  
  // Clear all mocks
  jest.clearAllMocks();
});
