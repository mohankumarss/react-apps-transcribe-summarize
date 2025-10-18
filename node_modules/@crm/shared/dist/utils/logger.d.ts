export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
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
declare class Logger {
    private config;
    private entries;
    constructor(config?: Partial<LoggerConfig>);
    private shouldLog;
    private createEntry;
    private logToConsole;
    private storeEntry;
    private loadFromStorage;
    private log;
    debug(message: string, data?: any): void;
    info(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    error(message: string, data?: any): void;
    /**
     * Get all stored log entries
     */
    getEntries(): LogEntry[];
    /**
     * Clear all stored log entries
     */
    clear(): void;
    /**
     * Export log entries as JSON
     */
    export(): string;
    /**
     * Update logger configuration
     */
    configure(config: Partial<LoggerConfig>): void;
}
export declare const logger: Logger;
export { Logger };
//# sourceMappingURL=logger.d.ts.map