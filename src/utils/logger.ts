/**
 * Logging utility for the extension
 * Provides structured logging with different levels and detailed tracking
 * 
 * Features:
 * - Multiple log levels (DEBUG, INFO, WARN, ERROR)
 * - Performance timing and metrics
 * - API call logging
 * - Request/response tracking
 * - Error tracking with context
 * - Log history for debugging
 * 
 * @module logger
 * @description Centralized logging system with support for multiple log levels
 * 
 * @example
 * ```typescript
 * import { logger } from './utils/logger';
 * 
 * logger.info('Application started');
 * logger.error('An error occurred', error);
 * logger.debug('Debug information', { data });
 * logger.logAPICall('optimizeCV', { status: 'success', duration: 1234 });
 * logger.startTimer('operation');
 * logger.endTimer('operation');
 * ```
 */

/**
 * Log levels enum
 * 
 * @enum {number}
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Log entry interface
 */
interface LogEntry {
  level: LogLevel;
  timestamp: number;
  message: string;
  data?: any;
}

/**
 * API call log entry
 */
interface APICallLog {
  operation: string;
  timestamp: number;
  duration: number;
  status: 'pending' | 'success' | 'error' | 'timeout';
  error: string | undefined;
  metadata: Record<string, any> | undefined;
}

/**
 * Logger class for structured logging
 * 
 * @class Logger
 */
class Logger {
  private level: LogLevel = LogLevel.INFO;
  private prefix: string;
  private logHistory: LogEntry[] = [];
  private maxHistorySize: number = 500;
  private apiCallLogs: APICallLog[] = [];
  private maxAPILogsSize: number = 100;
  private timers: Map<string, number> = new Map();
  private metrics: Map<string, number[]> = new Map();

  /**
   * Creates a logger instance
   * 
   * @param {string} [prefix='[AI-CV-Optimizer]'] - Prefix for log messages
   * @constructor
   */
  constructor(prefix: string = '[AI-CV-Optimizer]') {
    this.prefix = prefix;

    // Set log level based on environment
    if (process.env.NODE_ENV === 'development') {
      this.level = LogLevel.DEBUG;
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `${this.prefix} [${timestamp}] [${level}] ${message}`;
  }

  /**
   * Logs a debug message
   * 
   * @param {string} message - The message to log
   * @param {...any} args - Additional arguments to log
   * @public
   */
  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage('DEBUG', message), ...args);
      this.addToHistory(LogLevel.DEBUG, message, args);
    }
  }

  /**
   * Logs an info message
   * 
   * @param {string} message - The message to log
   * @param {...any} args - Additional arguments to log
   * @public
   */
  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage('INFO', message), ...args);
      this.addToHistory(LogLevel.INFO, message, args);
    }
  }

  /**
   * Logs a warning message
   * 
   * @param {string} message - The message to log
   * @param {...any} args - Additional arguments to log
   * @public
   */
  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message), ...args);
      this.addToHistory(LogLevel.WARN, message, args);
    }
  }

  /**
   * Logs an error message
   * 
   * @param {string} message - The message to log
   * @param {Error|any} [error] - Optional error object
   * @param {...any} args - Additional arguments to log
   * @public
   */
  error(message: string, error?: Error | any, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('ERROR', message), error, ...args);
      this.addToHistory(LogLevel.ERROR, message, { error, args });
    }
  }

  group(label: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.group(this.formatMessage('GROUP', label));
    }
  }

  groupEnd(): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.groupEnd();
    }
  }

  /**
   * Add entry to log history
   */
  private addToHistory(level: LogLevel, message: string, data?: any): void {
    this.logHistory.unshift({
      level,
      timestamp: Date.now(),
      message,
      data,
    });

    // Trim history if too large
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory = this.logHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Get log history
   * 
   * @param {number} [limit] - Maximum number of entries to return
   * @param {LogLevel} [minLevel] - Minimum log level to include
   * @returns {LogEntry[]} - Array of log entries
   */
  getHistory(limit?: number, minLevel?: LogLevel): LogEntry[] {
    let history = this.logHistory;

    // Filter by level if specified
    if (minLevel !== undefined) {
      history = history.filter(entry => entry.level >= minLevel);
    }

    // Apply limit if specified
    return limit ? history.slice(0, limit) : history;
  }

  /**
   * Clear log history
   */
  clearHistory(): void {
    this.logHistory = [];
    this.info('Log history cleared');
  }

  /**
   * Log API call with detailed information
   * 
   * @param {string} operation - Operation name
   * @param {Partial<APICallLog>} details - Call details
   */
  logAPICall(operation: string, details: Partial<APICallLog>): void {
    const log: APICallLog = {
      operation,
      timestamp: Date.now(),
      status: details.status || 'pending',
      duration: details.duration || 0,
      error: details.error,
      metadata: details.metadata,
    };

    this.apiCallLogs.unshift(log);

    // Trim if too large
    if (this.apiCallLogs.length > this.maxAPILogsSize) {
      this.apiCallLogs = this.apiCallLogs.slice(0, this.maxAPILogsSize);
    }

    // Also log to console
    const statusColor = log.status === 'success' ? '✓' : log.status === 'error' ? '✗' : '⋯';
    const durationStr = log.duration ? ` (${log.duration}ms)` : '';
    this.debug(`${statusColor} API Call: ${operation}${durationStr}`, log);
  }

  /**
   * Get API call logs
   * 
   * @param {number} [limit] - Maximum number of entries to return
   * @returns {APICallLog[]} - Array of API call logs
   */
  getAPICallLogs(limit?: number): APICallLog[] {
    return limit ? this.apiCallLogs.slice(0, limit) : this.apiCallLogs;
  }

  /**
   * Get API call statistics
   * 
   * @returns {Object} - Statistics object
   */
  getAPICallStats(): {
    total: number;
    success: number;
    error: number;
    timeout: number;
    averageDuration: number;
  } {
    const stats = {
      total: this.apiCallLogs.length,
      success: 0,
      error: 0,
      timeout: 0,
      averageDuration: 0,
    };

    let totalDuration = 0;
    let durationCount = 0;

    for (const log of this.apiCallLogs) {
      if (log.status === 'success') stats.success++;
      if (log.status === 'error') stats.error++;
      if (log.status === 'timeout') stats.timeout++;

      if (log.duration) {
        totalDuration += log.duration;
        durationCount++;
      }
    }

    stats.averageDuration = durationCount > 0 ? Math.round(totalDuration / durationCount) : 0;

    return stats;
  }

  /**
   * Start a performance timer
   * 
   * @param {string} name - Timer name
   */
  startTimer(name: string): void {
    this.timers.set(name, performance.now());
    this.debug(`Timer started: ${name}`);
  }

  /**
   * End a performance timer and log the duration
   * 
   * @param {string} name - Timer name
   * @returns {number} - Duration in milliseconds
   */
  endTimer(name: string): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      this.warn(`Timer '${name}' was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(name);
    this.debug(`Timer ended: ${name} (${duration.toFixed(2)}ms)`);

    // Store metric
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);

    return duration;
  }

  /**
   * Get performance metrics for a timer
   * 
   * @param {string} name - Timer name
   * @returns {Object | null} - Metrics object or null if no data
   */
  getMetrics(name: string): {
    count: number;
    average: number;
    min: number;
    max: number;
    total: number;
  } | null {
    const measurements = this.metrics.get(name);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const total = measurements.reduce((sum, val) => sum + val, 0);
    const average = total / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);

    return {
      count: measurements.length,
      average: Math.round(average * 100) / 100,
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }

  /**
   * Get all available metrics
   * 
   * @returns {string[]} - Array of metric names
   */
  getAllMetrics(): string[] {
    return Array.from(this.metrics.keys());
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
    this.info('Metrics cleared');
  }

  /**
   * Export logs as JSON for debugging
   * 
   * @returns {string} - JSON string of logs
   */
  exportLogs(): string {
    return JSON.stringify(
      {
        history: this.logHistory,
        apiCalls: this.apiCallLogs,
        metrics: Object.fromEntries(
          Array.from(this.metrics.entries()).map(([name]) => [
            name,
            this.getMetrics(name),
          ])
        ),
      },
      null,
      2
    );
  }
}

// Export singleton instance
export const logger = new Logger();

// Export factory for creating named loggers
export const createLogger = (name: string): Logger => {
  return new Logger(`[AI-CV-Optimizer:${name}]`);
};
