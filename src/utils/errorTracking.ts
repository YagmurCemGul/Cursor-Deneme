/**
 * Error tracking utility for the extension
 * Provides centralized error tracking and analytics
 * 
 * @module errorTracking
 * @description Track and analyze errors throughout the application
 */

import { ErrorLog, ErrorReportingConfig, ErrorAlertConfig } from '../types';
import { StorageService } from './storage';
import { logger } from './logger';
import { breadcrumbTracker } from './breadcrumbTracker';

/**
 * Error Tracker class for tracking and logging errors
 */
class ErrorTracker {
  private reportingConfig: ErrorReportingConfig = {
    enabled: false,
    reportCriticalOnly: true,
    includeStackTrace: true,
    includeScreenshot: false,
    includeBreadcrumbs: true,
  };

  private alertConfig: ErrorAlertConfig = {
    enabled: false,
    thresholdPerHour: 10,
    criticalErrorThreshold: 1,
    notificationMethod: 'browser',
  };

  private errorCountLastHour: number = 0;
  private lastAlertTime: number = 0;
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
    const severity = options.severity || this.inferSeverity(error);
    const errorType = options.errorType || this.inferErrorType(error);

    // Capture performance metrics
    const performanceImpact = this.capturePerformanceMetrics();

    // Get recent breadcrumbs
    const breadcrumbs = breadcrumbTracker.getRecentBreadcrumbs(5);

    // Determine if error is recoverable
    const { recoverable, recoverySuggestion } = this.analyzeRecoverability(
      errorType,
      errorMessage
    );

    // Optionally capture screenshot for critical errors
    let screenshot: string | undefined;
    if (severity === 'critical' && this.reportingConfig.includeScreenshot) {
      screenshot = await this.captureScreenshot();
    }

    // Generate group ID for similar errors
    const groupId = this.generateGroupId(errorMessage, errorType, options.component);

    const errorLog: ErrorLog = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      errorType,
      severity,
      message: errorMessage,
      stack: errorStack,
      component: options.component,
      action: options.action,
      userAgent: navigator.userAgent,
      resolved: false,
      metadata: options.metadata,
      groupId,
      breadcrumbs: this.reportingConfig.includeBreadcrumbs ? breadcrumbs : undefined,
      performanceImpact,
      screenshot,
      recoverable,
      recoverySuggestion,
    };

    // Log to console
    logger.error(`[${errorLog.errorType}] ${errorMessage}`, error, {
      component: errorLog.component,
      action: errorLog.action,
      severity: errorLog.severity,
      recoverable: errorLog.recoverable,
    });

    // Add error breadcrumb
    breadcrumbTracker.trackError(errorMessage, options.component);

    // Save to storage
    try {
      await StorageService.saveError(errorLog);
    } catch (storageError) {
      logger.error('Failed to save error log to storage', storageError);
    }

    // Check for error rate alerts
    await this.checkErrorRateAlerts(errorLog);

    // Automatic reporting for critical errors
    if (this.reportingConfig.enabled) {
      if (!this.reportingConfig.reportCriticalOnly || severity === 'critical') {
        await this.reportError(errorLog);
      }
    }
  }

  /**
   * Capture current performance metrics
   */
  private capturePerformanceMetrics(): ErrorLog['performanceImpact'] {
    if (typeof performance === 'undefined') return undefined;

    try {
      const memory = (performance as any).memory;
      return {
        memoryUsage: memory?.usedJSHeapSize,
        loadTime: performance.now(),
        renderTime: performance.now(),
      };
    } catch (e) {
      return undefined;
    }
  }

  /**
   * Capture screenshot of current UI state
   */
  private async captureScreenshot(): Promise<string | undefined> {
    try {
      if (typeof document === 'undefined') return undefined;

      // Use html2canvas if available
      const html2canvas = (window as any).html2canvas;
      if (html2canvas) {
        const canvas = await html2canvas(document.body, {
          width: 800,
          height: 600,
          scale: 0.5,
        });
        return canvas.toDataURL('image/jpeg', 0.5);
      }
    } catch (e) {
      logger.warn('Failed to capture screenshot', e);
    }
    return undefined;
  }

  /**
   * Analyze if error is recoverable and provide suggestion
   */
  private analyzeRecoverability(
    errorType: string,
    errorMessage: string
  ): { recoverable: boolean; recoverySuggestion?: string } {
    const lowerMessage = errorMessage.toLowerCase();

    // Network errors are often recoverable
    if (errorType === 'network') {
      return {
        recoverable: true,
        recoverySuggestion: 'Check your internet connection and try again.',
      };
    }

    // API errors might be recoverable
    if (errorType === 'api') {
      if (lowerMessage.includes('timeout') || lowerMessage.includes('rate limit')) {
        return {
          recoverable: true,
          recoverySuggestion: 'Wait a moment and try again.',
        };
      }
      if (lowerMessage.includes('unauthorized') || lowerMessage.includes('api key')) {
        return {
          recoverable: true,
          recoverySuggestion: 'Check your API key in settings.',
        };
      }
      return {
        recoverable: true,
        recoverySuggestion: 'Try again or switch to a different AI provider.',
      };
    }

    // Validation errors are recoverable
    if (errorType === 'validation') {
      return {
        recoverable: true,
        recoverySuggestion: 'Please correct the invalid input and try again.',
      };
    }

    // Storage errors might be recoverable
    if (errorType === 'storage') {
      return {
        recoverable: true,
        recoverySuggestion: 'Try clearing some browser data or restarting the extension.',
      };
    }

    // Parsing errors for file uploads
    if (errorType === 'parsing') {
      return {
        recoverable: true,
        recoverySuggestion: 'Try a different file or manually enter your information.',
      };
    }

    // Export errors
    if (errorType === 'export') {
      return {
        recoverable: true,
        recoverySuggestion: 'Try a different export format or check your permissions.',
      };
    }

    // Runtime errors are usually not easily recoverable
    if (errorType === 'runtime') {
      return {
        recoverable: false,
        recoverySuggestion: 'Please reload the extension and try again.',
      };
    }

    return {
      recoverable: false,
      recoverySuggestion: 'Please report this error to support.',
    };
  }

  /**
   * Generate a group ID for similar errors
   */
  private generateGroupId(
    message: string,
    errorType: string,
    component?: string
  ): string {
    // Normalize the message by removing numbers, timestamps, and variable data
    const normalized = message
      .replace(/\d+/g, 'N') // Replace numbers
      .replace(/['"]/g, '') // Remove quotes
      .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/g, 'UUID') // Replace UUIDs
      .replace(/https?:\/\/[^\s]+/g, 'URL') // Replace URLs
      .toLowerCase()
      .trim();

    // Create a simple hash
    let hash = 0;
    const str = `${errorType}:${component || ''}:${normalized}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return `group_${Math.abs(hash).toString(36)}`;
  }

  /**
   * Check error rate and trigger alerts if threshold exceeded
   */
  private async checkErrorRateAlerts(errorLog: ErrorLog): Promise<void> {
    if (!this.alertConfig.enabled) return;

    this.errorCountLastHour++;

    // Check if we should alert
    const shouldAlert =
      (errorLog.severity === 'critical' &&
        this.errorCountLastHour >= this.alertConfig.criticalErrorThreshold) ||
      this.errorCountLastHour >= this.alertConfig.thresholdPerHour;

    // Only alert once per hour
    const now = Date.now();
    if (shouldAlert && now - this.lastAlertTime > 60 * 60 * 1000) {
      await this.sendAlert(errorLog);
      this.lastAlertTime = now;
    }

    // Reset counter every hour
    setTimeout(() => {
      this.errorCountLastHour = Math.max(0, this.errorCountLastHour - 1);
    }, 60 * 60 * 1000);
  }

  /**
   * Send an alert notification
   */
  private async sendAlert(errorLog: ErrorLog): Promise<void> {
    const message = `Error rate threshold exceeded! ${this.errorCountLastHour} errors in the last hour.`;

    if (
      this.alertConfig.notificationMethod === 'browser' ||
      this.alertConfig.notificationMethod === 'both'
    ) {
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Error Rate Alert', {
            body: message,
            icon: chrome?.runtime?.getURL('icons/icon48.png'),
          });
        }
      } catch (e) {
        logger.warn('Failed to send browser notification', e);
      }
    }

    logger.warn(message, { errorLog });
  }

  /**
   * Report error to external service
   */
  private async reportError(errorLog: ErrorLog): Promise<void> {
    if (!this.reportingConfig.webhookUrl) return;

    try {
      const payload = {
        ...errorLog,
        stack: this.reportingConfig.includeStackTrace ? errorLog.stack : undefined,
        screenshot: this.reportingConfig.includeScreenshot ? errorLog.screenshot : undefined,
        breadcrumbs: this.reportingConfig.includeBreadcrumbs ? errorLog.breadcrumbs : undefined,
      };

      await fetch(this.reportingConfig.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      logger.info('Error reported to external service', { errorId: errorLog.id });
    } catch (e) {
      logger.warn('Failed to report error to external service', e);
    }
  }

  /**
   * Configure error reporting
   */
  setReportingConfig(config: Partial<ErrorReportingConfig>): void {
    this.reportingConfig = { ...this.reportingConfig, ...config };
    logger.info('Error reporting config updated', this.reportingConfig);
  }

  /**
   * Configure error alerts
   */
  setAlertConfig(config: Partial<ErrorAlertConfig>): void {
    this.alertConfig = { ...this.alertConfig, ...config };
    logger.info('Error alert config updated', this.alertConfig);
  }

  /**
   * Get current configurations
   */
  getConfigs(): {
    reporting: ErrorReportingConfig;
    alerts: ErrorAlertConfig;
  } {
    return {
      reporting: { ...this.reportingConfig },
      alerts: { ...this.alertConfig },
    };
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
