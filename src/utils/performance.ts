/**
 * Performance monitoring utility
 * Tracks metrics and helps identify performance bottlenecks
 * 
 * @module performance
 */

import { logger } from './logger';

/**
 * Performance metric data
 * 
 * @interface PerformanceMetric
 */
export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

/**
 * Performance monitoring class
 * 
 * @class PerformanceMonitor
 */
export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private enabled: boolean = true;

  /**
   * Starts tracking a performance metric
   * 
   * @param {string} name - Unique name for the metric
   * @param {Record<string, any>} [metadata] - Optional metadata
   * @public
   */
  start(name: string, metadata?: Record<string, any>): void {
    if (!this.enabled) return;

    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      ...(metadata && { metadata }),
    });

    logger.debug(`Performance tracking started: ${name}`, metadata);
  }

  /**
   * Ends tracking for a metric and logs the duration
   * 
   * @param {string} name - Name of the metric to end
   * @returns {number | null} Duration in milliseconds or null if not found
   * @public
   */
  end(name: string): number | null {
    if (!this.enabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      logger.warn(`Performance metric not found: ${name}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    logger.info(`Performance: ${name} took ${duration.toFixed(2)}ms`, metric.metadata);

    // Log warning if operation is slow
    if (duration > 1000) {
      logger.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * Measures the execution time of an async function
   * 
   * @template T
   * @param {string} name - Name for the metric
   * @param {() => Promise<T>} fn - Async function to measure
   * @param {Record<string, any>} [metadata] - Optional metadata
   * @returns {Promise<T>} Result of the function
   * @public
   * @async
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.start(name, metadata);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * Measures the execution time of a synchronous function
   * 
   * @template T
   * @param {string} name - Name for the metric
   * @param {() => T} fn - Function to measure
   * @param {Record<string, any>} [metadata] - Optional metadata
   * @returns {T} Result of the function
   * @public
   */
  measureSync<T>(name: string, fn: () => T, metadata?: Record<string, any>): T {
    this.start(name, metadata);
    try {
      const result = fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * Gets all recorded metrics
   * 
   * @returns {PerformanceMetric[]} Array of all metrics
   * @public
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Gets a specific metric by name
   * 
   * @param {string} name - Name of the metric
   * @returns {PerformanceMetric | undefined} The metric or undefined
   * @public
   */
  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name);
  }

  /**
   * Clears all metrics
   * 
   * @public
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Enables or disables performance monitoring
   * 
   * @param {boolean} enabled - Whether to enable monitoring
   * @public
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    logger.info(`Performance monitoring ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Generates a performance report
   * 
   * @returns {string} Formatted performance report
   * @public
   */
  generateReport(): string {
    const metrics = this.getMetrics().filter((m) => m.duration !== undefined);

    if (metrics.length === 0) {
      return 'No performance metrics recorded';
    }

    const sortedMetrics = metrics.sort((a, b) => (b.duration || 0) - (a.duration || 0));

    let report = '=== Performance Report ===\n\n';
    report += `Total operations: ${metrics.length}\n\n`;

    sortedMetrics.forEach((metric, index) => {
      report += `${index + 1}. ${metric.name}: ${metric.duration?.toFixed(2)}ms\n`;
      if (metric.metadata) {
        report += `   Metadata: ${JSON.stringify(metric.metadata)}\n`;
      }
    });

    const totalTime = metrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    report += `\nTotal time: ${totalTime.toFixed(2)}ms\n`;

    return report;
  }

  /**
   * Logs the performance report
   * 
   * @public
   */
  logReport(): void {
    logger.info(this.generateReport());
  }

  /**
   * Tracks bundle size (for development)
   * 
   * @param {string} bundleName - Name of the bundle
   * @param {number} sizeInBytes - Size in bytes
   * @public
   */
  trackBundleSize(bundleName: string, sizeInBytes: number): void {
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    const sizeInMB = (sizeInBytes / 1024 / 1024).toFixed(2);

    logger.info(`Bundle size: ${bundleName}`, {
      bytes: sizeInBytes,
      kb: sizeInKB,
      mb: sizeInMB,
    });

    // Warn if bundle is large
    if (sizeInBytes > 1024 * 1024) {
      // > 1MB
      logger.warn(`Large bundle detected: ${bundleName} is ${sizeInMB}MB`);
    }
  }

  /**
   * Tracks memory usage
   * 
   * @public
   */
  trackMemoryUsage(): void {
    if (!(performance as any).memory) {
      logger.warn('Memory API not available');
      return;
    }

    const memory = (performance as any).memory;
    const usedMB = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
    const totalMB = (memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
    const limitMB = (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2);

    logger.info('Memory usage:', {
      used: `${usedMB} MB`,
      total: `${totalMB} MB`,
      limit: `${limitMB} MB`,
      percentage: `${((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2)}%`,
    });

    // Warn if memory usage is high
    if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.9) {
      logger.warn('High memory usage detected!');
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Enable in development mode
if (process.env.NODE_ENV === 'development') {
  performanceMonitor.setEnabled(true);
}

/**
 * Decorator for measuring function performance
 * 
 * @param {string} [name] - Optional name for the metric
 * @returns {Function} Decorator function
 * @example
 * ```typescript
 * class MyService {
 *   @measurePerformance('fetchData')
 *   async fetchData() {
 *     // ...
 *   }
 * }
 * ```
 */
export function measurePerformance(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const metricName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      performanceMonitor.start(metricName);
      try {
        const result = await originalMethod.apply(this, args);
        performanceMonitor.end(metricName);
        return result;
      } catch (error) {
        performanceMonitor.end(metricName);
        throw error;
      }
    };

    return descriptor;
  };
}
