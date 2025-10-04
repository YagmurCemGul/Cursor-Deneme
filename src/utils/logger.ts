/**
 * Logging utility for the extension
 * Provides structured logging with different levels
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private level: LogLevel = LogLevel.INFO;
  private prefix: string;

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

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage('DEBUG', message), ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage('INFO', message), ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message), ...args);
    }
  }

  error(message: string, error?: Error | any, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('ERROR', message), error, ...args);
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
