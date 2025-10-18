/**
 * Jest Configuration for CRM React Apps Webpack Monorepo
 * 
 * Supports testing across multiple workspaces with theme-aware utilities
 */

module.exports = {
  // Use multiple projects for workspace support
  projects: [
    {
      displayName: 'shared',
      preset: 'ts-jest',
      testMatch: ['<rootDir>/shared/**/__tests__/**/*.(test|spec).(ts|tsx|js|jsx)'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      moduleNameMapper: {
        '^@shared/(.*)$': '<rootDir>/shared/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      },
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
      },
      transformIgnorePatterns: [
        'node_modules/(?!(.*\\.mjs$))',
      ],
      globals: {
        'ts-jest': {
          tsconfig: {
            jsx: 'react-jsx',
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
          },
        },
      },
      testEnvironmentOptions: {
        customExportConditions: [''],
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      collectCoverageFrom: [
        'shared/**/*.{ts,tsx}',
        '!shared/**/*.d.ts',
        '!shared/dist/**',
        '!shared/node_modules/**',
      ],
    },
    {
      displayName: 'transcript-and-summary',
      preset: 'ts-jest',
      testMatch: ['<rootDir>/apps/transcript-and-summary/**/__tests__/**/*.(test|spec).(ts|tsx|js|jsx)'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      moduleNameMapper: {
        '^@shared/(.*)$': '<rootDir>/shared/$1',
        '^@shared/components$': '<rootDir>/shared/components',
        '^@shared/services$': '<rootDir>/shared/services',
        '^@shared/utils$': '<rootDir>/shared/utils',
        '^@shared/config$': '<rootDir>/shared/config',
        '^@shared/styles$': '<rootDir>/shared/styles',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      },
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
      },
      transformIgnorePatterns: [
        'node_modules/(?!(.*\\.mjs$))',
      ],
      globals: {
        'ts-jest': {
          tsconfig: {
            jsx: 'react-jsx',
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
          },
        },
      },
      testEnvironmentOptions: {
        customExportConditions: [''],
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      collectCoverageFrom: [
        'apps/transcript-and-summary/src/**/*.{ts,tsx}',
        '!apps/transcript-and-summary/src/**/*.d.ts',
        '!apps/transcript-and-summary/dist/**',
      ],
    },
    {
      displayName: 'if-party-master',
      preset: 'ts-jest',
      testMatch: ['<rootDir>/apps/if-party-master/**/__tests__/**/*.(test|spec).(ts|tsx|js|jsx)'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      moduleNameMapper: {
        '^@shared/(.*)$': '<rootDir>/shared/$1',
        '^@shared/components$': '<rootDir>/shared/components',
        '^@shared/services$': '<rootDir>/shared/services',
        '^@shared/utils$': '<rootDir>/shared/utils',
        '^@shared/config$': '<rootDir>/shared/config',
        '^@shared/styles$': '<rootDir>/shared/styles',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      },
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
      },
      transformIgnorePatterns: [
        'node_modules/(?!(.*\\.mjs$))',
      ],
      globals: {
        'ts-jest': {
          tsconfig: {
            jsx: 'react-jsx',
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
          },
        },
      },
      testEnvironmentOptions: {
        customExportConditions: [''],
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      collectCoverageFrom: [
        'apps/if-party-master/src/**/*.{ts,tsx}',
        '!apps/if-party-master/src/**/*.d.ts',
        '!apps/if-party-master/dist/**',
      ],
    },
  ],

  // Global settings
  testTimeout: 10000,
  verbose: true,
  
  // Coverage settings
  collectCoverage: false, // Enable with --coverage flag
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './shared/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  collectCoverageFrom: [
    'shared/**/*.{ts,tsx}',
    'apps/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/coverage/**',
    '!**/*.config.{ts,js}',
    '!**/*.test.{ts,tsx}',
    '!**/*.spec.{ts,tsx}',
    '!**/index.ts',
    '!**/main.tsx',
    '!**/vite-env.d.ts',
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/',
  ],

  // Watch mode settings
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/',
  ],

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
};
