/**
 * Error tracking utility for the extension
 * Provides centralized error tracking and analytics
 * 
 * @module errorTracking
 * @description Track and analyze errors throughout the application
 */

import { ErrorLog } from '../types';
import { StorageService } from './storage';
import { logger } from './logger';

/**
 * Error Tracker class for tracking and logging errors
 */
class ErrorTracker {
  /**
   * Track an error and save it to storage
   * 
   * @param {Error} error - The error object
   * @param {Object} options - Additional error tracking options
   * @param {string} options.errorType - Type of error
   * @param {string} options.severity - Severity level
   * @param {string} options.component - Component where error occurred
   * @param {string} options.action - Action being performed when error occurred
   * @param {Record<string, any>} options.metadata - Additional metadata
   */
  async trackError(
    error: Error | string,
    options: {
      errorType?: ErrorLog['errorType'];
      severity?: ErrorLog['severity'];
      component?: string;
      action?: string;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<void> {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;

    const errorLog: ErrorLog = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      errorType: options.errorType || this.inferErrorType(error),
      severity: options.severity || this.inferSeverity(error),
      message: errorMessage,
      stack: errorStack,
      component: options.component,
      action: options.action,
      userAgent: navigator.userAgent,
      resolved: false,
      metadata: options.metadata,
    };

    // Log to console
    logger.error(`[${errorLog.errorType}] ${errorMessage}`, error, {
      component: errorLog.component,
      action: errorLog.action,
      severity: errorLog.severity,
    });

    // Save to storage
    try {
      await StorageService.saveError(errorLog);
    } catch (storageError) {
      logger.error('Failed to save error log to storage', storageError);
    }
  }

  /**
   * Track a network error
   */
  async trackNetworkError(
    error: Error | string,
    options: {
      url?: string;
      method?: string;
      statusCode?: number;
      component?: string;
    } = {}
  ): Promise<void> {
    await this.trackError(error, {
      errorType: 'network',
      severity: 'high',
      component: options.component,
      action: `${options.method || 'GET'} ${options.url || 'unknown'}`,
      metadata: {
        url: options.url,
        method: options.method,
        statusCode: options.statusCode,
      },
    });
  }

  /**
   * Track a validation error
   */
  async trackValidationError(
    error: Error | string,
    options: {
      field?: string;
      value?: any;
      component?: string;
    } = {}
  ): Promise<void> {
    await this.trackError(error, {
      errorType: 'validation',
      severity: 'low',
      component: options.component,
      action: `Validation failed for field: ${options.field || 'unknown'}`,
      metadata: {
        field: options.field,
        value: options.value,
      },
    });
  }

  /**
   * Track an API error
   */
  async trackAPIError(
    error: Error | string,
    options: {
      provider?: string;
      endpoint?: string;
      component?: string;
    } = {}
  ): Promise<void> {
    await this.trackError(error, {
      errorType: 'api',
      severity: 'high',
      component: options.component,
      action: `API call to ${options.provider || 'unknown'} failed`,
      metadata: {
        provider: options.provider,
        endpoint: options.endpoint,
      },
    });
  }

  /**
   * Track a storage error
   */
  async trackStorageError(
    error: Error | string,
    options: {
      operation?: string;
      key?: string;
      component?: string;
    } = {}
  ): Promise<void> {
    await this.trackError(error, {
      errorType: 'storage',
      severity: 'medium',
      component: options.component,
      action: `Storage ${options.operation || 'operation'} failed`,
      metadata: {
        operation: options.operation,
        key: options.key,
      },
    });
  }

  /**
   * Track a parsing error
   */
  async trackParsingError(
    error: Error | string,
    options: {
      fileType?: string;
      fileName?: string;
      component?: string;
    } = {}
  ): Promise<void> {
    await this.trackError(error, {
      errorType: 'parsing',
      severity: 'medium',
      component: options.component,
      action: `Failed to parse ${options.fileType || 'file'}`,
      metadata: {
        fileType: options.fileType,
        fileName: options.fileName,
      },
    });
  }

  /**
   * Track an export error
   */
  async trackExportError(
    error: Error | string,
    options: {
      format?: string;
      destination?: string;
      component?: string;
    } = {}
  ): Promise<void> {
    await this.trackError(error, {
      errorType: 'export',
      severity: 'medium',
      component: options.component,
      action: `Export to ${options.format || 'unknown'} failed`,
      metadata: {
        format: options.format,
        destination: options.destination,
      },
    });
  }

  /**
   * Infer error type from error object
   */
  private inferErrorType(error: Error | string): ErrorLog['errorType'] {
    const errorMessage = typeof error === 'string' ? error : error.message.toLowerCase();

    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'network';
    } else if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      return 'validation';
    } else if (errorMessage.includes('api') || errorMessage.includes('request')) {
      return 'api';
    } else if (errorMessage.includes('storage') || errorMessage.includes('chrome.storage')) {
      return 'storage';
    } else if (errorMessage.includes('parse') || errorMessage.includes('parsing')) {
      return 'parsing';
    } else if (errorMessage.includes('export') || errorMessage.includes('download')) {
      return 'export';
    }

    return 'unknown';
  }

  /**
   * Infer severity from error object
   */
  private inferSeverity(error: Error | string): ErrorLog['severity'] {
    const errorMessage = typeof error === 'string' ? error : error.message.toLowerCase();

    if (
      errorMessage.includes('critical') ||
      errorMessage.includes('fatal') ||
      errorMessage.includes('crash')
    ) {
      return 'critical';
    } else if (
      errorMessage.includes('failed') ||
      errorMessage.includes('error') ||
      errorMessage.includes('exception')
    ) {
      return 'high';
    } else if (errorMessage.includes('warning') || errorMessage.includes('deprecated')) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Get error analytics
   */
  async getAnalytics() {
    return await StorageService.getErrorAnalytics();
  }

  /**
   * Clear all error logs
   */
  async clearLogs(): Promise<void> {
    await StorageService.clearErrorLogs();
  }

  /**
   * Mark error as resolved
   */
  async markResolved(errorId: string): Promise<void> {
    await StorageService.markErrorResolved(errorId);
  }
}

// Export singleton instance
export const errorTracker = new ErrorTracker();
