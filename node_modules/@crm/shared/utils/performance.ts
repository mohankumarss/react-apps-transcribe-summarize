/**
 * Performance monitoring utilities
 */

import { logger } from './logger';

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
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private activeTimers: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start timing an operation
   */
  start(name: string, metadata?: Record<string, any>): void {
    const startTime = performance.now();
    this.activeTimers.set(name, startTime);
    
    logger.debug(`Performance: Started timing "${name}"`, { startTime, metadata });
  }

  /**
   * End timing an operation and record metrics
   */
  end(name: string, metadata?: Record<string, any>): PerformanceMetrics | null {
    const endTime = performance.now();
    const startTime = this.activeTimers.get(name);

    if (!startTime) {
      logger.warn(`Performance: No start time found for "${name}"`);
      return null;
    }

    const duration = endTime - startTime;
    const metrics: PerformanceMetrics = {
      name,
      duration,
      startTime,
      endTime,
      metadata,
    };

    this.metrics.push(metrics);
    this.activeTimers.delete(name);

    logger.debug(`Performance: Completed timing "${name}"`, {
      duration: `${duration.toFixed(2)}ms`,
      metadata,
    });

    // Log slow operations
    if (duration > 1000) {
      logger.warn(`Performance: Slow operation detected "${name}"`, {
        duration: `${duration.toFixed(2)}ms`,
        metadata,
      });
    }

    return metrics;
  }

  /**
   * Measure a function execution time
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T> | T,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.start(name, metadata);
    
    try {
      const result = await fn();
      this.end(name, metadata);
      return result;
    } catch (error) {
      this.end(name, { ...metadata, error: true });
      throw error;
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get metrics for a specific operation
   */
  getMetricsFor(name: string): PerformanceMetrics[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  /**
   * Get average duration for an operation
   */
  getAverageDuration(name: string): number {
    const operationMetrics = this.getMetricsFor(name);
    if (operationMetrics.length === 0) return 0;

    const totalDuration = operationMetrics.reduce(
      (sum, metric) => sum + metric.duration,
      0
    );
    return totalDuration / operationMetrics.length;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.activeTimers.clear();
  }

  /**
   * Get performance summary
   */
  getSummary(): Record<string, any> {
    const summary: Record<string, any> = {};
    const operationNames = [...new Set(this.metrics.map(m => m.name))];

    operationNames.forEach(name => {
      const operationMetrics = this.getMetricsFor(name);
      const durations = operationMetrics.map(m => m.duration);
      
      summary[name] = {
        count: operationMetrics.length,
        averageDuration: this.getAverageDuration(name),
        minDuration: Math.min(...durations),
        maxDuration: Math.max(...durations),
        totalDuration: durations.reduce((sum, d) => sum + d, 0),
      };
    });

    return summary;
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * Decorator for measuring method performance
 */
export function measurePerformance(name?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const operationName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      return performanceMonitor.measure(
        operationName,
        () => originalMethod.apply(this, args),
        { className: target.constructor.name, methodName: propertyKey }
      );
    };

    return descriptor;
  };
}

/**
 * Hook for measuring React component render performance
 */
export const usePerformanceMonitor = (componentName: string) => {
  const startRender = () => {
    performanceMonitor.start(`${componentName}.render`);
  };

  const endRender = () => {
    performanceMonitor.end(`${componentName}.render`);
  };

  return { startRender, endRender };
};

/**
 * Web Vitals monitoring
 */
export interface WebVitalsMetrics {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

export class WebVitalsMonitor {
  private metrics: WebVitalsMetrics = {};

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers(): void {
    // Performance Observer for paint metrics
    if ('PerformanceObserver' in window) {
      try {
        // First Contentful Paint
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.FCP = entry.startTime;
              logger.info('Web Vitals: First Contentful Paint', {
                FCP: `${entry.startTime.toFixed(2)}ms`,
              });
            }
          }
        });
        paintObserver.observe({ entryTypes: ['paint'] });

        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.LCP = lastEntry.startTime;
          logger.info('Web Vitals: Largest Contentful Paint', {
            LCP: `${lastEntry.startTime.toFixed(2)}ms`,
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.metrics.FID = (entry as any).processingStart - entry.startTime;
            logger.info('Web Vitals: First Input Delay', {
              FID: `${this.metrics.FID.toFixed(2)}ms`,
            });
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          this.metrics.CLS = clsValue;
          logger.info('Web Vitals: Cumulative Layout Shift', {
            CLS: clsValue.toFixed(4),
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

      } catch (error) {
        logger.warn('Web Vitals: Failed to initialize observers', error);
      }
    }

    // Time to First Byte
    if ('navigation' in performance) {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        this.metrics.TTFB = navigationEntry.responseStart - navigationEntry.requestStart;
        logger.info('Web Vitals: Time to First Byte', {
          TTFB: `${this.metrics.TTFB.toFixed(2)}ms`,
        });
      }
    }
  }

  getMetrics(): WebVitalsMetrics {
    return { ...this.metrics };
  }

  reportMetrics(): void {
    logger.info('Web Vitals Report', this.getMetrics());
  }
}

/**
 * Bundle size analyzer
 */
export const analyzeBundleSize = (): void => {
  if ('performance' in window && 'getEntriesByType' in performance) {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    const jsResources = resources.filter(resource => 
      resource.name.endsWith('.js') || resource.name.includes('.js?')
    );
    
    const cssResources = resources.filter(resource => 
      resource.name.endsWith('.css') || resource.name.includes('.css?')
    );

    const totalJSSize = jsResources.reduce((total, resource) => 
      total + (resource.transferSize || 0), 0
    );
    
    const totalCSSSize = cssResources.reduce((total, resource) => 
      total + (resource.transferSize || 0), 0
    );

    logger.info('Bundle Size Analysis', {
      javascript: {
        files: jsResources.length,
        totalSize: `${(totalJSSize / 1024).toFixed(2)} KB`,
        resources: jsResources.map(r => ({
          name: r.name.split('/').pop(),
          size: `${((r.transferSize || 0) / 1024).toFixed(2)} KB`,
          loadTime: `${(r.responseEnd - r.requestStart).toFixed(2)}ms`,
        })),
      },
      css: {
        files: cssResources.length,
        totalSize: `${(totalCSSSize / 1024).toFixed(2)} KB`,
        resources: cssResources.map(r => ({
          name: r.name.split('/').pop(),
          size: `${((r.transferSize || 0) / 1024).toFixed(2)} KB`,
          loadTime: `${(r.responseEnd - r.requestStart).toFixed(2)}ms`,
        })),
      },
    });
  }
};

/**
 * Memory usage monitoring
 */
export const getMemoryUsage = (): Record<string, any> | null => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      totalJSHeapSize: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      jsHeapSizeLimit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
      usagePercentage: `${((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2)}%`,
    };
  }
  return null;
};

/**
 * Initialize performance monitoring
 */
export const initializePerformanceMonitoring = (): void => {
  // Initialize Web Vitals monitoring
  new WebVitalsMonitor();

  // Analyze bundle size after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      analyzeBundleSize();
      
      const memoryUsage = getMemoryUsage();
      if (memoryUsage) {
        logger.info('Memory Usage', memoryUsage);
      }
    }, 1000);
  });

  // Log performance summary periodically
  setInterval(() => {
    const summary = performanceMonitor.getSummary();
    if (Object.keys(summary).length > 0) {
      logger.info('Performance Summary', summary);
    }
  }, 60000); // Every minute
};
