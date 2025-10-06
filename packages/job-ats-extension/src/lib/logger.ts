/**
 * Lightweight logger with levels and debug switch
 * Stripped in production builds
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private level: LogLevel = LogLevel.INFO;
  private debugEnabled = false;

  async init() {
    const { settings } = await chrome.storage.local.get('settings');
    this.debugEnabled = settings?.debugLogs || false;
    this.level = this.debugEnabled ? LogLevel.DEBUG : LogLevel.INFO;
  }

  setLevel(level: LogLevel) {
    this.level = level;
  }

  setDebugEnabled(enabled: boolean) {
    this.debugEnabled = enabled;
    this.level = enabled ? LogLevel.DEBUG : LogLevel.INFO;
  }

  debug(...args: any[]) {
    // Strip debug logs in production unless explicitly enabled
    if (typeof __DEBUG__ !== 'undefined' && !__DEBUG__ && !this.debugEnabled) {
      return;
    }
    
    if (this.level <= LogLevel.DEBUG && this.debugEnabled) {
      console.debug('[ATS DEBUG]', ...args);
    }
  }

  info(...args: any[]) {
    if (this.level <= LogLevel.INFO) {
      console.info('[ATS INFO]', ...args);
    }
  }

  warn(...args: any[]) {
    if (this.level <= LogLevel.WARN) {
      console.warn('[ATS WARN]', ...args);
    }
  }

  error(...args: any[]) {
    if (this.level <= LogLevel.ERROR) {
      console.error('[ATS ERROR]', ...args);
    }
  }
}

export const logger = new Logger();

// Initialize logger
if (typeof chrome !== 'undefined' && chrome.storage) {
  logger.init().catch(() => {
    // Fallback if storage not available
    logger.setDebugEnabled(false);
  });
}
