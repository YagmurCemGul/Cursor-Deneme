/**
 * Error Tracking System
 * Monitors and tracks error frequencies to enable proactive improvements
 * 
 * @module errorTracking
 * @description Centralized error tracking with frequency analysis and proactive prevention
 */

import { logger } from './logger';

/**
 * Error entry interface for tracking
 */
export interface ErrorEntry {
  id: string;
  message: string;
  stack?: string | undefined;
  timestamp: number;
  context?: string | undefined;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: ErrorCategory;
  metadata?: Record<string, any> | undefined;
}

/**
 * Error category classification
 */
export enum ErrorCategory {
  NETWORK = 'network',
  API = 'api',
  VALIDATION = 'validation',
  STORAGE = 'storage',
  PARSING = 'parsing',
  AUTHENTICATION = 'authentication',
  RENDER = 'render',
  UNKNOWN = 'unknown',
}

/**
 * Error statistics for frequency analysis
 */
export interface ErrorStats {
  errorHash: string;
  message: string;
  category: ErrorCategory;
  count: number;
  firstOccurrence: number;
  lastOccurrence: number;
  contexts: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

/**
 * Error prevention suggestion
 */
export interface ErrorPrevention {
  errorHash: string;
  message: string;
  prevention: string;
  autoFixAvailable: boolean;
  priority: number;
}

/**
 * Error Tracking Service
 * Manages error collection, frequency analysis, and proactive prevention
 */
export class ErrorTrackingService {
  private static readonly STORAGE_KEY = 'errorTracking';
  private static readonly STATS_KEY = 'errorStats';
  private static readonly MAX_ERRORS = 500;
  private static readonly FREQUENCY_THRESHOLD = 3; // Errors occurring 3+ times are "frequent"
  private static readonly TIME_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Generate a hash for error deduplication
   */
  private static hashError(message: string, category: ErrorCategory, context?: string): string {
    const str = `${message}:${category}:${context || ''}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Classify error severity based on category and message
   */
  private static classifySeverity(
    error: Error,
    category: ErrorCategory
  ): 'low' | 'medium' | 'high' | 'critical' {
    const message = error.message.toLowerCase();

    // Critical errors
    if (
      category === ErrorCategory.AUTHENTICATION ||
      message.includes('critical') ||
      message.includes('fatal')
    ) {
      return 'critical';
    }

    // High severity errors
    if (
      category === ErrorCategory.API ||
      category === ErrorCategory.STORAGE ||
      message.includes('failed') ||
      message.includes('unauthorized')
    ) {
      return 'high';
    }

    // Medium severity errors
    if (
      category === ErrorCategory.VALIDATION ||
      category === ErrorCategory.PARSING ||
      message.includes('invalid')
    ) {
      return 'medium';
    }

    // Low severity errors
    return 'low';
  }

  /**
   * Categorize error based on message content
   */
  private static categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return ErrorCategory.NETWORK;
    }

    if (message.includes('api') || message.includes('status')) {
      return ErrorCategory.API;
    }

    if (message.includes('invalid') || message.includes('validation')) {
      return ErrorCategory.VALIDATION;
    }

    if (message.includes('storage') || message.includes('quota')) {
      return ErrorCategory.STORAGE;
    }

    if (message.includes('parse') || message.includes('json') || message.includes('format')) {
      return ErrorCategory.PARSING;
    }

    if (message.includes('auth') || message.includes('token') || message.includes('unauthorized')) {
      return ErrorCategory.AUTHENTICATION;
    }

    if (message.includes('render') || message.includes('component')) {
      return ErrorCategory.RENDER;
    }

    return ErrorCategory.UNKNOWN;
  }

  /**
   * Track an error occurrence
   */
  static async trackError(
    error: Error,
    context?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const category = this.categorizeError(error);
      const severity = this.classifySeverity(error, category);
      const errorHash = this.hashError(error.message, category, context);

      const errorEntry: ErrorEntry = {
        id: `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        message: error.message,
        stack: error.stack,
        timestamp: Date.now(),
        context,
        severity,
        category,
        metadata,
      };

      // Store error entry
      await this.storeErrorEntry(errorEntry);

      // Update error statistics
      await this.updateErrorStats(errorHash, errorEntry);

      // Check for frequent errors and log warnings
      const stats = await this.getErrorStats(errorHash);
      if (stats && stats.count >= this.FREQUENCY_THRESHOLD && !stats.resolved) {
        logger.warn(
          `Frequent error detected: "${error.message}" (occurred ${stats.count} times)`,
          { category, context, errorHash }
        );

        // Trigger proactive prevention
        await this.suggestPrevention(stats);
      }
    } catch (trackingError: any) {
      // Fail silently to avoid infinite loops
      logger.debug('Error tracking failed:', trackingError);
    }
  }

  /**
   * Store error entry in storage
   */
  private static async storeErrorEntry(entry: ErrorEntry): Promise<void> {
    try {
      const { [this.STORAGE_KEY]: errors = [] } = await chrome.storage.local.get(
        this.STORAGE_KEY
      );

      errors.push(entry);

      // Keep only recent errors
      const trimmedErrors = errors.slice(-this.MAX_ERRORS);

      await chrome.storage.local.set({ [this.STORAGE_KEY]: trimmedErrors });
    } catch (error: any) {
      logger.debug('Failed to store error entry:', error);
    }
  }

  /**
   * Update error statistics for frequency tracking
   */
  private static async updateErrorStats(errorHash: string, entry: ErrorEntry): Promise<void> {
    try {
      const { [this.STATS_KEY]: allStats = {} } = await chrome.storage.local.get(this.STATS_KEY);

      if (!allStats[errorHash]) {
        allStats[errorHash] = {
          errorHash,
          message: entry.message,
          category: entry.category,
          count: 0,
          firstOccurrence: entry.timestamp,
          lastOccurrence: entry.timestamp,
          contexts: [],
          severity: entry.severity,
          resolved: false,
        };
      }

      const stats: ErrorStats = allStats[errorHash];
      stats.count++;
      stats.lastOccurrence = entry.timestamp;
      if (entry.context && !stats.contexts.includes(entry.context)) {
        stats.contexts.push(entry.context);
      }

      // Update severity to highest encountered
      const severityLevels = { low: 0, medium: 1, high: 2, critical: 3 };
      if (severityLevels[entry.severity] > severityLevels[stats.severity]) {
        stats.severity = entry.severity;
      }

      await chrome.storage.local.set({ [this.STATS_KEY]: allStats });
    } catch (error: any) {
      logger.debug('Failed to update error stats:', error);
    }
  }

  /**
   * Get error statistics for a specific error
   */
  static async getErrorStats(errorHash: string): Promise<ErrorStats | null> {
    try {
      const { [this.STATS_KEY]: allStats = {} } = await chrome.storage.local.get(this.STATS_KEY);
      return allStats[errorHash] || null;
    } catch (error: any) {
      logger.debug('Failed to get error stats:', error);
      return null;
    }
  }

  /**
   * Get all error statistics
   */
  static async getAllErrorStats(): Promise<ErrorStats[]> {
    try {
      const { [this.STATS_KEY]: allStats = {} } = await chrome.storage.local.get(this.STATS_KEY);
      return (Object.values(allStats) as ErrorStats[]).sort((a: ErrorStats, b: ErrorStats) => b.count - a.count);
    } catch (error: any) {
      logger.debug('Failed to get all error stats:', error);
      return [];
    }
  }

  /**
   * Get frequent errors (occurring more than threshold times)
   */
  static async getFrequentErrors(): Promise<ErrorStats[]> {
    const allStats = await this.getAllErrorStats();
    const cutoffTime = Date.now() - this.TIME_WINDOW;

    return allStats.filter(
      (stats) =>
        stats.count >= this.FREQUENCY_THRESHOLD &&
        stats.lastOccurrence >= cutoffTime &&
        !stats.resolved
    );
  }

  /**
   * Mark an error as resolved
   */
  static async markErrorResolved(errorHash: string): Promise<void> {
    try {
      const { [this.STATS_KEY]: allStats = {} } = await chrome.storage.local.get(this.STATS_KEY);

      if (allStats[errorHash]) {
        allStats[errorHash].resolved = true;
        await chrome.storage.local.set({ [this.STATS_KEY]: allStats });
        logger.info(`Error marked as resolved: ${errorHash}`);
      }
    } catch (error: any) {
      logger.error('Failed to mark error as resolved:', error);
    }
  }

  /**
   * Get error prevention suggestions
   */
  static async suggestPrevention(stats: ErrorStats): Promise<ErrorPrevention | null> {
    const prevention = this.generatePreventionSuggestion(stats);

    if (prevention) {
      logger.info('Prevention suggestion generated:', prevention);

      // Store prevention suggestion
      try {
        const { errorPreventions = [] } = await chrome.storage.local.get('errorPreventions');
        errorPreventions.push(prevention);
        await chrome.storage.local.set({ errorPreventions });
      } catch (error: any) {
        logger.debug('Failed to store prevention suggestion:', error);
      }
    }

    return prevention;
  }

  /**
   * Generate prevention suggestions based on error patterns
   */
  private static generatePreventionSuggestion(stats: ErrorStats): ErrorPrevention | null {
    const message = stats.message.toLowerCase();
    let prevention = '';
    let autoFixAvailable = false;
    let priority = 5;

    switch (stats.category) {
      case ErrorCategory.NETWORK:
        if (message.includes('fetch') || message.includes('connection')) {
          prevention = 'Implement retry logic with exponential backoff for network requests';
          autoFixAvailable = true;
          priority = 8;
        }
        break;

      case ErrorCategory.API:
        if (message.includes('api key') || message.includes('unauthorized')) {
          prevention =
            'Add API key validation before making requests. Prompt user to update invalid keys';
          autoFixAvailable = true;
          priority = 9;
        } else if (message.includes('rate limit')) {
          prevention = 'Implement rate limiting and request queuing to prevent API throttling';
          autoFixAvailable = true;
          priority = 7;
        }
        break;

      case ErrorCategory.VALIDATION:
        prevention = 'Add input validation and sanitization before processing user data';
        autoFixAvailable = true;
        priority = 6;
        break;

      case ErrorCategory.STORAGE:
        if (message.includes('quota')) {
          prevention = 'Implement storage cleanup and quota monitoring';
          autoFixAvailable = true;
          priority = 8;
        }
        break;

      case ErrorCategory.PARSING:
        prevention = 'Add try-catch blocks around JSON parsing with fallback handling';
        autoFixAvailable = true;
        priority = 7;
        break;

      case ErrorCategory.AUTHENTICATION:
        prevention = 'Implement token refresh mechanism and authentication state management';
        autoFixAvailable = true;
        priority = 10;
        break;

      default:
        prevention = `Investigate and handle error: ${stats.message}`;
        priority = 5;
    }

    if (!prevention) {
      return null;
    }

    return {
      errorHash: stats.errorHash,
      message: stats.message,
      prevention,
      autoFixAvailable,
      priority,
    };
  }

  /**
   * Clear all error tracking data
   */
  static async clearAllErrors(): Promise<void> {
    try {
      await chrome.storage.local.remove([this.STORAGE_KEY, this.STATS_KEY, 'errorPreventions']);
      logger.info('All error tracking data cleared');
    } catch (error: any) {
      logger.error('Failed to clear error tracking data:', error);
    }
  }

  /**
   * Clear old errors (older than time window)
   */
  static async cleanupOldErrors(): Promise<void> {
    try {
      const cutoffTime = Date.now() - this.TIME_WINDOW;

      // Clean up error entries
      const { [this.STORAGE_KEY]: errors = [] } = await chrome.storage.local.get(
        this.STORAGE_KEY
      );
      const recentErrors = errors.filter((err: ErrorEntry) => err.timestamp >= cutoffTime);
      await chrome.storage.local.set({ [this.STORAGE_KEY]: recentErrors });

      // Clean up resolved or old error stats
      const { [this.STATS_KEY]: allStats = {} } = await chrome.storage.local.get(this.STATS_KEY);
      const activeStats: Record<string, ErrorStats> = {};

      Object.entries(allStats).forEach(([hash, stats]: [string, any]) => {
        if (stats.lastOccurrence >= cutoffTime || (!stats.resolved && stats.count >= 3)) {
          activeStats[hash] = stats;
        }
      });

      await chrome.storage.local.set({ [this.STATS_KEY]: activeStats });

      logger.info('Old error data cleaned up');
    } catch (error: any) {
      logger.error('Failed to cleanup old errors:', error);
    }
  }

  /**
   * Get error trends and analytics
   */
  static async getErrorTrends(): Promise<{
    totalErrors: number;
    frequentErrors: number;
    criticalErrors: number;
    categoryCounts: Record<ErrorCategory, number>;
    recentTrend: 'increasing' | 'decreasing' | 'stable';
  }> {
    try {
      const { [this.STORAGE_KEY]: errors = [] } = await chrome.storage.local.get(
        this.STORAGE_KEY
      );
      const allStats = await this.getAllErrorStats();
      const frequentErrors = await this.getFrequentErrors();

      const categoryCounts: Record<ErrorCategory, number> = {
        [ErrorCategory.NETWORK]: 0,
        [ErrorCategory.API]: 0,
        [ErrorCategory.VALIDATION]: 0,
        [ErrorCategory.STORAGE]: 0,
        [ErrorCategory.PARSING]: 0,
        [ErrorCategory.AUTHENTICATION]: 0,
        [ErrorCategory.RENDER]: 0,
        [ErrorCategory.UNKNOWN]: 0,
      };

      allStats.forEach((stats) => {
        categoryCounts[stats.category] = (categoryCounts[stats.category] || 0) + stats.count;
      });

      const criticalErrors = allStats.filter((s) => s.severity === 'critical').length;

      // Calculate trend
      const last6Hours = Date.now() - 6 * 60 * 60 * 1000;
      const recentErrors = errors.filter((err: ErrorEntry) => err.timestamp >= last6Hours).length;
      const olderErrors = errors.filter((err: ErrorEntry) => err.timestamp < last6Hours).length;

      let recentTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (recentErrors > olderErrors * 1.2) {
        recentTrend = 'increasing';
      } else if (recentErrors < olderErrors * 0.8) {
        recentTrend = 'decreasing';
      }

      return {
        totalErrors: errors.length,
        frequentErrors: frequentErrors.length,
        criticalErrors,
        categoryCounts,
        recentTrend,
      };
    } catch (error: any) {
      logger.error('Failed to get error trends:', error);
      return {
        totalErrors: 0,
        frequentErrors: 0,
        criticalErrors: 0,
        categoryCounts: {} as Record<ErrorCategory, number>,
        recentTrend: 'stable',
      };
    }
  }
}

/**
 * Convenience function to track errors
 */
export async function trackError(
  error: Error,
  context?: string,
  metadata?: Record<string, any>
): Promise<void> {
  await ErrorTrackingService.trackError(error, context, metadata);
}

/**
 * Convenience function to get frequent errors
 */
export async function getFrequentErrors(): Promise<ErrorStats[]> {
  return await ErrorTrackingService.getFrequentErrors();
}
