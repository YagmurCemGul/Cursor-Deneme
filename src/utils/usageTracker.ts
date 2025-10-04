/**
 * API Usage Tracker
 * Tracks and stores API usage statistics
 */

import { StorageService } from './storage';
import { APIUsageStats } from '../types/storage';
import { logger } from './logger';

export class UsageTracker {
  /**
   * Record an API usage event
   */
  static async recordUsage(stats: Omit<APIUsageStats, 'id' | 'timestamp'>): Promise<void> {
    try {
      const usageRecord: APIUsageStats = {
        id: `usage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        ...stats,
      };

      // Get existing usage stats
      const existingStats = await this.getAllUsage();
      
      // Add new record
      existingStats.push(usageRecord);
      
      // Keep only last 1000 records to avoid storage bloat
      const trimmedStats = existingStats.slice(-1000);
      
      // Save to storage
      await chrome.storage.local.set({ apiUsageStats: trimmedStats });
      
      logger.info('Usage recorded:', usageRecord);
    } catch (error) {
      logger.error('Failed to record usage:', error);
    }
  }

  /**
   * Get all usage statistics
   */
  static async getAllUsage(): Promise<APIUsageStats[]> {
    try {
      const result = await chrome.storage.local.get('apiUsageStats');
      return result.apiUsageStats || [];
    } catch (error) {
      logger.error('Failed to get usage stats:', error);
      return [];
    }
  }

  /**
   * Get usage statistics for a specific date range
   */
  static async getUsageByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<APIUsageStats[]> {
    const allUsage = await this.getAllUsage();
    
    return allUsage.filter((stat) => {
      const statDate = new Date(stat.timestamp);
      return statDate >= startDate && statDate <= endDate;
    });
  }

  /**
   * Get usage statistics by provider
   */
  static async getUsageByProvider(
    provider: string
  ): Promise<APIUsageStats[]> {
    const allUsage = await this.getAllUsage();
    return allUsage.filter((stat) => stat.provider === provider);
  }

  /**
   * Get usage summary
   */
  static async getUsageSummary(dateRange?: { start: Date; end: Date }): Promise<{
    totalCalls: number;
    totalTokens: number;
    totalCost: number;
    successRate: number;
    byProvider: Record<string, {
      calls: number;
      tokens: number;
      cost: number;
      avgDuration: number;
    }>;
    byOperation: Record<string, number>;
  }> {
    let usage = await this.getAllUsage();
    
    if (dateRange) {
      usage = usage.filter((stat) => {
        const statDate = new Date(stat.timestamp);
        return statDate >= dateRange.start && statDate <= dateRange.end;
      });
    }

    const summary = {
      totalCalls: usage.length,
      totalTokens: usage.reduce((sum, stat) => sum + stat.tokensUsed.total, 0),
      totalCost: usage.reduce((sum, stat) => sum + stat.cost, 0),
      successRate: usage.length > 0
        ? (usage.filter((stat) => stat.success).length / usage.length) * 100
        : 0,
      byProvider: {} as Record<string, any>,
      byOperation: {} as Record<string, number>,
    };

    // Aggregate by provider
    usage.forEach((stat) => {
      if (!summary.byProvider[stat.provider]) {
        summary.byProvider[stat.provider] = {
          calls: 0,
          tokens: 0,
          cost: 0,
          avgDuration: 0,
          totalDuration: 0,
        };
      }
      
      const providerStats = summary.byProvider[stat.provider];
      providerStats.calls++;
      providerStats.tokens += stat.tokensUsed.total;
      providerStats.cost += stat.cost;
      providerStats.totalDuration += stat.duration;
    });

    // Calculate average duration
    Object.keys(summary.byProvider).forEach((provider) => {
      const providerStats = summary.byProvider[provider];
      providerStats.avgDuration = providerStats.totalDuration / providerStats.calls;
      delete providerStats.totalDuration;
    });

    // Aggregate by operation
    usage.forEach((stat) => {
      summary.byOperation[stat.operation] = (summary.byOperation[stat.operation] || 0) + 1;
    });

    return summary;
  }

  /**
   * Clear all usage statistics
   */
  static async clearUsage(): Promise<void> {
    try {
      await chrome.storage.local.set({ apiUsageStats: [] });
      logger.info('Usage statistics cleared');
    } catch (error) {
      logger.error('Failed to clear usage stats:', error);
    }
  }

  /**
   * Export usage statistics to JSON
   */
  static async exportUsage(): Promise<string> {
    const usage = await this.getAllUsage();
    return JSON.stringify(usage, null, 2);
  }

  /**
   * Get recent usage (last N records)
   */
  static async getRecentUsage(limit: number = 10): Promise<APIUsageStats[]> {
    const allUsage = await this.getAllUsage();
    return allUsage.slice(-limit).reverse(); // Most recent first
  }

  /**
   * Get usage trends (daily aggregation for the last N days)
   */
  static async getUsageTrends(days: number = 30): Promise<Array<{
    date: string;
    calls: number;
    tokens: number;
    cost: number;
  }>> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const usage = await this.getUsageByDateRange(startDate, endDate);

    // Group by date
    const trendMap: Record<string, {
      calls: number;
      tokens: number;
      cost: number;
    }> = {};

    usage.forEach((stat) => {
      const date = new Date(stat.timestamp).toISOString().split('T')[0];
      
      if (!trendMap[date]) {
        trendMap[date] = { calls: 0, tokens: 0, cost: 0 };
      }
      
      trendMap[date].calls++;
      trendMap[date].tokens += stat.tokensUsed.total;
      trendMap[date].cost += stat.cost;
    });

    // Convert to array and sort by date
    return Object.entries(trendMap)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
