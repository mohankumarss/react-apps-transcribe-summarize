/**
 * Performance monitoring utilities
 */
/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
    name: string;
    duration: number;
    startTime: number;
    endTime: number;
    metadata?: Record<string, any>;
}
/**
 * Performance monitor class for tracking operations
 */
export declare class PerformanceMonitor {
    private static instance;
    private metrics;
    private activeTimers;
    static getInstance(): PerformanceMonitor;
    /**
     * Start timing an operation
     */
    start(name: string, metadata?: Record<string, any>): void;
    /**
     * End timing an operation and record metrics
     */
    end(name: string, metadata?: Record<string, any>): PerformanceMetrics | null;
    /**
     * Measure a function execution time
     */
    measure<T>(name: string, fn: () => Promise<T> | T, metadata?: Record<string, any>): Promise<T>;
    /**
     * Get all recorded metrics
     */
    getMetrics(): PerformanceMetrics[];
    /**
     * Get metrics for a specific operation
     */
    getMetricsFor(name: string): PerformanceMetrics[];
    /**
     * Get average duration for an operation
     */
    getAverageDuration(name: string): number;
    /**
     * Clear all metrics
     */
    clear(): void;
    /**
     * Get performance summary
     */
    getSummary(): Record<string, any>;
}
/**
 * Global performance monitor instance
 */
export declare const performanceMonitor: PerformanceMonitor;
/**
 * Decorator for measuring method performance
 */
export declare function measurePerformance(name?: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * Hook for measuring React component render performance
 */
export declare const usePerformanceMonitor: (componentName: string) => {
    startRender: () => void;
    endRender: () => void;
};
/**
 * Web Vitals monitoring
 */
export interface WebVitalsMetrics {
    FCP?: number;
    LCP?: number;
    FID?: number;
    CLS?: number;
    TTFB?: number;
}
export declare class WebVitalsMonitor {
    private metrics;
    constructor();
    private initializeObservers;
    getMetrics(): WebVitalsMetrics;
    reportMetrics(): void;
}
/**
 * Bundle size analyzer
 */
export declare const analyzeBundleSize: () => void;
/**
 * Memory usage monitoring
 */
export declare const getMemoryUsage: () => Record<string, any> | null;
/**
 * Initialize performance monitoring
 */
export declare const initializePerformanceMonitoring: () => void;
//# sourceMappingURL=performance.d.ts.map