/**
 * Proactive Error Prevention System
 * Automatically prevents and mitigates frequent errors
 * 
 * @module errorPrevention
 * @description Implements automatic fixes and preventive measures for common errors
 */

import { ErrorTrackingService, ErrorStats, ErrorCategory } from './errorTracking';
import { logger } from './logger';

/**
 * Prevention action result
 */
export interface PreventionResult {
  success: boolean;
  action: string;
  message: string;
  errorHash: string;
}

/**
 * Error Prevention Service
 * Monitors error patterns and applies proactive fixes
 */
export class ErrorPreventionService {
  private static monitoringInterval: number | null = null;
  private static readonly MONITORING_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

  /**
   * Start monitoring for frequent errors
   */
  static startMonitoring(): void {
    if (this.monitoringInterval) {
      logger.info('Error prevention monitoring already running');
      return;
    }

    logger.info('Starting error prevention monitoring');

    // Run initial check
    this.checkAndPrevent().catch((error) => {
      logger.error('Error prevention check failed:', error);
    });

    // Set up periodic checks
    this.monitoringInterval = window.setInterval(() => {
      this.checkAndPrevent().catch((error) => {
        logger.error('Error prevention check failed:', error);
      });
    }, this.MONITORING_INTERVAL);
  }

  /**
   * Stop monitoring
   */
  static stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      logger.info('Error prevention monitoring stopped');
    }
  }

  /**
   * Check for frequent errors and apply preventive measures
   */
  static async checkAndPrevent(): Promise<PreventionResult[]> {
    const results: PreventionResult[] = [];

    try {
      const frequentErrors = await ErrorTrackingService.getFrequentErrors();

      if (frequentErrors.length === 0) {
        logger.debug('No frequent errors detected');
        return results;
      }

      logger.info(`Found ${frequentErrors.length} frequent error(s), applying preventive measures`);

      for (const errorStats of frequentErrors) {
        const result = await this.applyPrevention(errorStats);
        if (result) {
          results.push(result);
        }
      }

      // Cleanup old errors after processing
      await ErrorTrackingService.cleanupOldErrors();
    } catch (error: any) {
      logger.error('Failed to check and prevent errors:', error);
    }

    return results;
  }

  /**
   * Apply prevention measures for a specific error
   */
  private static async applyPrevention(stats: ErrorStats): Promise<PreventionResult | null> {
    logger.info(`Applying prevention for error: ${stats.message} (${stats.count} occurrences)`);

    let result: PreventionResult | null = null;

    switch (stats.category) {
      case ErrorCategory.NETWORK:
        result = await this.preventNetworkErrors(stats);
        break;

      case ErrorCategory.API:
        result = await this.preventAPIErrors(stats);
        break;

      case ErrorCategory.VALIDATION:
        result = await this.preventValidationErrors(stats);
        break;

      case ErrorCategory.STORAGE:
        result = await this.preventStorageErrors(stats);
        break;

      case ErrorCategory.PARSING:
        result = await this.preventParsingErrors(stats);
        break;

      case ErrorCategory.AUTHENTICATION:
        result = await this.preventAuthErrors(stats);
        break;

      default:
        logger.debug(`No automatic prevention available for category: ${stats.category}`);
    }

    // Mark error as handled
    if (result && result.success) {
      await ErrorTrackingService.markErrorResolved(stats.errorHash);
    }

    return result;
  }

  /**
   * Prevent network-related errors
   */
  private static async preventNetworkErrors(stats: ErrorStats): Promise<PreventionResult> {
    const message = stats.message.toLowerCase();

    // Store network error handling configuration
    const config = await this.getPreventionConfig('network');

    if (!config.retryEnabled) {
      // Enable retry logic
      await this.setPreventionConfig('network', {
        retryEnabled: true,
        maxRetries: 3,
        backoffMultiplier: 2,
        initialDelay: 1000,
      });

      return {
        success: true,
        action: 'ENABLE_RETRY',
        message: 'Enabled automatic retry with exponential backoff for network requests',
        errorHash: stats.errorHash,
      };
    }

    if (message.includes('timeout') && config.timeout < 30000) {
      // Increase timeout
      await this.setPreventionConfig('network', {
        ...config,
        timeout: Math.min(config.timeout * 1.5, 30000),
      });

      return {
        success: true,
        action: 'INCREASE_TIMEOUT',
        message: `Increased network timeout to ${Math.min(config.timeout * 1.5, 30000)}ms`,
        errorHash: stats.errorHash,
      };
    }

    return {
      success: false,
      action: 'NO_ACTION',
      message: 'Network error prevention already configured',
      errorHash: stats.errorHash,
    };
  }

  /**
   * Prevent API-related errors
   */
  private static async preventAPIErrors(stats: ErrorStats): Promise<PreventionResult> {
    const message = stats.message.toLowerCase();

    if (message.includes('api key') || message.includes('invalid key')) {
      // Notify user to update API key
      await this.notifyUser(
        'API Key Issue Detected',
        'Multiple API authentication failures detected. Please check your API keys in Settings.',
        'warning'
      );

      return {
        success: true,
        action: 'NOTIFY_USER',
        message: 'User notified about API key issues',
        errorHash: stats.errorHash,
      };
    }

    if (message.includes('rate limit')) {
      // Enable rate limiting
      const config = await this.getPreventionConfig('api');

      await this.setPreventionConfig('api', {
        ...config,
        rateLimitEnabled: true,
        requestsPerMinute: 10,
        queueEnabled: true,
      });

      return {
        success: true,
        action: 'ENABLE_RATE_LIMIT',
        message: 'Enabled request rate limiting to prevent API throttling',
        errorHash: stats.errorHash,
      };
    }

    if (message.includes('429') || message.includes('quota')) {
      // Increase delay between requests
      const config = await this.getPreventionConfig('api');
      const newDelay = (config.requestDelay || 0) + 1000;

      await this.setPreventionConfig('api', {
        ...config,
        requestDelay: newDelay,
      });

      return {
        success: true,
        action: 'INCREASE_DELAY',
        message: `Increased delay between API requests to ${newDelay}ms`,
        errorHash: stats.errorHash,
      };
    }

    return {
      success: false,
      action: 'NO_ACTION',
      message: 'No automatic fix available for this API error',
      errorHash: stats.errorHash,
    };
  }

  /**
   * Prevent validation errors
   */
  private static async preventValidationErrors(stats: ErrorStats): Promise<PreventionResult> {
    // Enable stricter validation
    const config = await this.getPreventionConfig('validation');

    await this.setPreventionConfig('validation', {
      ...config,
      strictMode: true,
      sanitizeInputs: true,
      showValidationHints: true,
    });

    return {
      success: true,
      action: 'ENABLE_STRICT_VALIDATION',
      message: 'Enabled stricter input validation and sanitization',
      errorHash: stats.errorHash,
    };
  }

  /**
   * Prevent storage errors
   */
  private static async preventStorageErrors(stats: ErrorStats): Promise<PreventionResult> {
    const message = stats.message.toLowerCase();

    if (message.includes('quota') || message.includes('exceeded')) {
      // Trigger storage cleanup
      await this.cleanupStorage();

      return {
        success: true,
        action: 'CLEANUP_STORAGE',
        message: 'Cleaned up old data to free storage space',
        errorHash: stats.errorHash,
      };
    }

    // Enable storage monitoring
    const config = await this.getPreventionConfig('storage');
    await this.setPreventionConfig('storage', {
      ...config,
      monitoringEnabled: true,
      autoCleanup: true,
      warningThreshold: 0.8, // Warn at 80% capacity
    });

    return {
      success: true,
      action: 'ENABLE_MONITORING',
      message: 'Enabled storage monitoring and automatic cleanup',
      errorHash: stats.errorHash,
    };
  }

  /**
   * Prevent parsing errors
   */
  private static async preventParsingErrors(stats: ErrorStats): Promise<PreventionResult> {
    // Enable safer parsing with fallbacks
    const config = await this.getPreventionConfig('parsing');

    await this.setPreventionConfig('parsing', {
      ...config,
      useFallbacks: true,
      validateBeforeParse: true,
      logParseAttempts: true,
    });

    return {
      success: true,
      action: 'ENABLE_SAFE_PARSING',
      message: 'Enabled safer parsing with validation and fallbacks',
      errorHash: stats.errorHash,
    };
  }

  /**
   * Prevent authentication errors
   */
  private static async preventAuthErrors(stats: ErrorStats): Promise<PreventionResult> {
    const message = stats.message.toLowerCase();

    if (message.includes('token') || message.includes('expired')) {
      // Notify user to re-authenticate
      await this.notifyUser(
        'Authentication Issue',
        'Multiple authentication failures detected. You may need to sign in again.',
        'warning'
      );

      return {
        success: true,
        action: 'NOTIFY_REAUTH',
        message: 'User notified about authentication issues',
        errorHash: stats.errorHash,
      };
    }

    return {
      success: false,
      action: 'NO_ACTION',
      message: 'No automatic fix available for this authentication error',
      errorHash: stats.errorHash,
    };
  }

  /**
   * Get prevention configuration
   */
  private static async getPreventionConfig(category: string): Promise<any> {
    try {
      const { preventionConfig = {} } = await chrome.storage.local.get('preventionConfig');
      return preventionConfig[category] || {};
    } catch (error: any) {
      logger.error('Failed to get prevention config:', error);
      return {};
    }
  }

  /**
   * Set prevention configuration
   */
  private static async setPreventionConfig(category: string, config: any): Promise<void> {
    try {
      const { preventionConfig = {} } = await chrome.storage.local.get('preventionConfig');
      preventionConfig[category] = { ...preventionConfig[category], ...config };
      await chrome.storage.local.set({ preventionConfig });
      logger.info(`Prevention config updated for ${category}:`, config);
    } catch (error: any) {
      logger.error('Failed to set prevention config:', error);
    }
  }

  /**
   * Cleanup storage
   */
  private static async cleanupStorage(): Promise<void> {
    try {
      // Clean up old error tracking data
      await ErrorTrackingService.cleanupOldErrors();

      // Clean up old analytics data (keep last 50 entries)
      const { analyticsData = [] } = await chrome.storage.local.get('analyticsData');
      if (analyticsData.length > 50) {
        const trimmed = analyticsData.slice(-50);
        await chrome.storage.local.set({ analyticsData: trimmed });
      }

      // Clean up old profile versions (keep last 10 per profile)
      const { profileVersions = [] } = await chrome.storage.local.get('profileVersions');
      if (profileVersions.length > 50) {
        const sorted = profileVersions.sort(
          (a: any, b: any) => b.versionNumber - a.versionNumber
        );
        const trimmed = sorted.slice(0, 50);
        await chrome.storage.local.set({ profileVersions: trimmed });
      }

      logger.info('Storage cleanup completed');
    } catch (error: any) {
      logger.error('Storage cleanup failed:', error);
    }
  }

  /**
   * Notify user about errors
   */
  private static async notifyUser(
    title: string,
    message: string,
    type: 'info' | 'warning' | 'error'
  ): Promise<void> {
    try {
      // Store notification for UI to display
      const { notifications = [] } = await chrome.storage.local.get('notifications');
      notifications.push({
        id: `notif-${Date.now()}`,
        title,
        message,
        type,
        timestamp: Date.now(),
        read: false,
      });

      // Keep only last 10 notifications
      const trimmed = notifications.slice(-10);
      await chrome.storage.local.set({ notifications: trimmed });

      logger.info(`User notification created: ${title}`);
    } catch (error: any) {
      logger.error('Failed to create user notification:', error);
    }
  }

  /**
   * Get prevention statistics
   */
  static async getPreventionStats(): Promise<{
    totalPreventions: number;
    preventionsByCategory: Record<string, number>;
    successRate: number;
  }> {
    try {
      const { errorPreventions = [] } = await chrome.storage.local.get('errorPreventions');

      const preventionsByCategory: Record<string, number> = {};
      let successfulPreventions = 0;

      errorPreventions.forEach((prevention: any) => {
        const category = prevention.category || 'unknown';
        preventionsByCategory[category] = (preventionsByCategory[category] || 0) + 1;
        if (prevention.success) {
          successfulPreventions++;
        }
      });

      const successRate =
        errorPreventions.length > 0 ? successfulPreventions / errorPreventions.length : 0;

      return {
        totalPreventions: errorPreventions.length,
        preventionsByCategory,
        successRate,
      };
    } catch (error: any) {
      logger.error('Failed to get prevention stats:', error);
      return {
        totalPreventions: 0,
        preventionsByCategory: {},
        successRate: 0,
      };
    }
  }
}
