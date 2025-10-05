/**
 * Logging utility for the extension
 * Provides structured logging with different levels
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
 * Logger class for structured logging
 * 
 * @class Logger
 */
class Logger {
  private level: LogLevel = LogLevel.INFO;
  private prefix: string;

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
    }
  }

  /**
   * Logs an error message and tracks it for frequency analysis
   * 
   * @param {string} message - The message to log
   * @param {Error|any} [error] - Optional error object
   * @param {...any} args - Additional arguments to log
   * @public
   */
  error(message: string, error?: Error | any, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('ERROR', message), error, ...args);
      
      // Track error for frequency analysis
      // Import dynamically to avoid circular dependencies
      import('./errorTracking').then(({ ErrorTrackingService }) => {
        const errorObj = error instanceof Error ? error : new Error(message);
        const metadata = args.length > 0 ? { additionalData: args } : undefined;
        ErrorTrackingService.trackError(errorObj, this.prefix, metadata).catch(() => {
          // Silently fail to avoid infinite loops
        });
      }).catch(() => {
        // Silently fail if error tracking is not available
      });
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
}

// Export singleton instance
export const logger = new Logger();

// Export factory for creating named loggers
export const createLogger = (name: string): Logger => {
  return new Logger(`[AI-CV-Optimizer:${name}]`);
};
