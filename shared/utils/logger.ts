export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: any;
  source?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  maxStorageEntries: number;
  source?: string;
}

class Logger {
  private config: LoggerConfig;
  private entries: LogEntry[] = [];

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableStorage: false,
      maxStorageEntries: 1000,
      ...config,
    };

    // Load existing entries from localStorage if storage is enabled
    if (this.config.enableStorage) {
      this.loadFromStorage();
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private createEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date(),
      data,
      source: this.config.source,
    };
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    const timestamp = entry.timestamp.toISOString();
    const source = entry.source ? `[${entry.source}]` : '';
    const prefix = `${timestamp} ${source}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, entry.data);
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.data);
        break;
      case LogLevel.ERROR:
        console.error(prefix, entry.message, entry.data);
        break;
    }
  }

  private storeEntry(entry: LogEntry): void {
    if (!this.config.enableStorage) return;

    this.entries.push(entry);

    // Limit the number of stored entries
    if (this.entries.length > this.config.maxStorageEntries) {
      this.entries = this.entries.slice(-this.config.maxStorageEntries);
    }

    // Save to localStorage
    try {
      localStorage.setItem('logger_entries', JSON.stringify(this.entries));
    } catch (error) {
      console.warn('Failed to save log entries to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('logger_entries');
      if (stored) {
        this.entries = JSON.parse(stored).map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }));
      }
    } catch (error) {
      console.warn('Failed to load log entries from localStorage:', error);
      this.entries = [];
    }
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createEntry(level, message, data);
    this.logToConsole(entry);
    this.storeEntry(entry);
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  /**
   * Get all stored log entries
   */
  getEntries(): LogEntry[] {
    return [...this.entries];
  }

  /**
   * Clear all stored log entries
   */
  clear(): void {
    this.entries = [];
    if (this.config.enableStorage) {
      localStorage.removeItem('logger_entries');
    }
  }

  /**
   * Export log entries as JSON
   */
  export(): string {
    return JSON.stringify(this.entries, null, 2);
  }

  /**
   * Update logger configuration
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Get development mode with fallback
const isDevelopment = (): boolean => {
  try {
    // Check for Node.js development mode (including Jest)
    if (typeof process !== 'undefined' && process.env) {
      return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
    }

    // Check for browser development mode
    if (typeof window !== 'undefined') {
      return window.location?.hostname === 'localhost' || window.location?.hostname === '127.0.0.1';
    }

    return false;
  } catch {
    return false;
  }
};

// Create default logger instance
export const logger = new Logger({
  level: isDevelopment() ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: true,
  enableStorage: isDevelopment(),
  source: 'CRM-App',
});

// Export logger class for custom instances
export { Logger };
