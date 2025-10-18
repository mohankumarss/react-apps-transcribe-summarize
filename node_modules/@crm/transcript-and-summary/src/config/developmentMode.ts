/**
 * Development Mode Configuration
 * 
 * Detects and manages development mode settings for the application.
 * Allows toggling between mock data and real API calls during development.
 */

/**
 * Development mode configuration
 */
export interface DevelopmentModeConfig {
  enabled: boolean;
  useMockData: boolean;
  mockDataDelay: number; // Simulated API delay in ms
}

/**
 * Get development mode configuration
 */
export function getDevelopmentModeConfig(): DevelopmentModeConfig {
  // Check if running in development environment
  let isDevelopment = false;
  try {
    // Check if process is available (webpack)
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
      isDevelopment = true;
    }
  } catch (e) {
    // If process is not available, assume production
    isDevelopment = false;
  }

  // Check for explicit mock data flag in localStorage (for runtime toggling)
  let useMockDataFlag: string | null = null;
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      useMockDataFlag = localStorage.getItem('USE_MOCK_DATA');
    }
  } catch (e) {
    // localStorage might not be available in some contexts
    useMockDataFlag = null;
  }

  // Check for environment variable
  let useMockDataEnv = false;
  try {
    // Check if process is available (webpack)
    if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_USE_MOCK_DATA === 'true') {
      useMockDataEnv = true;
    }
  } catch (e) {
    useMockDataEnv = false;
  }

  // Determine if mock data should be used
  // Priority: localStorage flag > environment variable > default to true in development
  let useMockData = false;
  if (isDevelopment) {
    if (useMockDataFlag === 'true') {
      useMockData = true;
    } else if (useMockDataFlag === 'false') {
      useMockData = false;
    } else if (useMockDataEnv) {
      useMockData = true;
    } else {
      // Default to true in development mode
      useMockData = true;
    }
  }

  return {
    enabled: isDevelopment,
    useMockData,
    mockDataDelay: 300 // Default simulated delay
  };
}

/**
 * Check if development mode is enabled
 */
export function isDevelopmentMode(): boolean {
  return getDevelopmentModeConfig().enabled;
}

/**
 * Check if mock data should be used
 */
export function shouldUseMockData(): boolean {
  return getDevelopmentModeConfig().useMockData;
}

/**
 * Enable mock data mode (runtime toggle)
 */
export function enableMockDataMode(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('USE_MOCK_DATA', 'true');
    // Reload to apply changes
    window.location.reload();
  }
}

/**
 * Disable mock data mode (runtime toggle)
 */
export function disableMockDataMode(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('USE_MOCK_DATA', 'false');
    // Reload to apply changes
    window.location.reload();
  }
}

/**
 * Toggle mock data mode
 */
export function toggleMockDataMode(): void {
  const config = getDevelopmentModeConfig();
  if (config.useMockData) {
    disableMockDataMode();
  } else {
    enableMockDataMode();
  }
}

/**
 * Get current mock data mode status
 */
export function getMockDataModeStatus(): {
  isDevelopment: boolean;
  useMockData: boolean;
  canToggle: boolean;
} {
  const config = getDevelopmentModeConfig();
  return {
    isDevelopment: config.enabled,
    useMockData: config.useMockData,
    canToggle: config.enabled // Can only toggle in development mode
  };
}
