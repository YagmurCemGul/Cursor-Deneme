/**
 * Usage Analytics Service
 * Tracks user interactions and AI provider usage statistics
 */

import { AIProvider } from './aiProviders';
import { logger } from './logger';

export interface UsageEvent {
  id: string;
  timestamp: string;
  eventType: 'cv_optimization' | 'cover_letter_generation' | 'provider_switch' | 'api_call' | 'error';
  provider?: AIProvider;
  success: boolean;
  duration?: number; // in milliseconds
  metadata?: Record<string, any>;
}

export interface UsageStatistics {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  providerUsage: Record<AIProvider, number>;
  averageResponseTime: number;
  eventsByType: Record<string, number>;
  lastUpdated: string;
}

export interface DailyUsage {
  date: string;
  events: number;
  successRate: number;
}

class UsageAnalyticsService {
  private readonly STORAGE_KEY = 'usageAnalytics';
  private readonly MAX_EVENTS = 1000; // Keep last 1000 events
  private events: UsageEvent[] = [];
  private initialized = false;

  /**
   * Initialize the analytics service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const stored = await this.loadEvents();
      this.events = stored || [];
      this.initialized = true;
      logger.info('Usage analytics initialized', { eventCount: this.events.length });
    } catch (error) {
      logger.error('Failed to initialize usage analytics:', error);
      this.events = [];
      this.initialized = true;
    }
  }

  /**
   * Track a usage event
   */
  async trackEvent(event: Omit<UsageEvent, 'id' | 'timestamp'>): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    const newEvent: UsageEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...event,
    };

    this.events.push(newEvent);

    // Keep only the last MAX_EVENTS
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    await this.saveEvents();

    logger.info('Usage event tracked:', {
      type: newEvent.eventType,
      provider: newEvent.provider,
      success: newEvent.success,
    });
  }

  /**
   * Track CV optimization
   */
  async trackCVOptimization(
    provider: AIProvider,
    success: boolean,
    duration: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      eventType: 'cv_optimization',
      provider,
      success,
      duration,
      ...(metadata && { metadata }),
    });
  }

  /**
   * Track cover letter generation
   */
  async trackCoverLetterGeneration(
    provider: AIProvider,
    success: boolean,
    duration: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      eventType: 'cover_letter_generation',
      provider,
      success,
      duration,
      ...(metadata && { metadata }),
    });
  }

  /**
   * Track provider switch
   */
  async trackProviderSwitch(
    fromProvider: AIProvider | null,
    toProvider: AIProvider
  ): Promise<void> {
    await this.trackEvent({
      eventType: 'provider_switch',
      provider: toProvider,
      success: true,
      metadata: { fromProvider, toProvider },
    });
  }

  /**
   * Track API call
   */
  async trackAPICall(
    provider: AIProvider,
    success: boolean,
    duration: number,
    error?: string
  ): Promise<void> {
    await this.trackEvent({
      eventType: 'api_call',
      provider,
      success,
      duration,
      ...(error && { metadata: { error } }),
    });
  }

  /**
   * Track error
   */
  async trackError(
    provider: AIProvider | undefined,
    error: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      eventType: 'error',
      ...(provider && { provider }),
      success: false,
      metadata: { error, ...metadata },
    });
  }

  /**
   * Get usage statistics
   */
  async getStatistics(days?: number): Promise<UsageStatistics> {
    if (!this.initialized) {
      await this.initialize();
    }

    const filteredEvents = days
      ? this.filterEventsByDays(this.events, days)
      : this.events;

    const totalEvents = filteredEvents.length;
    const successfulEvents = filteredEvents.filter((e) => e.success).length;
    const failedEvents = totalEvents - successfulEvents;

    const providerUsage: Record<AIProvider, number> = {
      openai: 0,
      gemini: 0,
      claude: 0,
    };

    const eventsByType: Record<string, number> = {};

    let totalDuration = 0;
    let durationCount = 0;

    filteredEvents.forEach((event) => {
      if (event.provider) {
        providerUsage[event.provider] = (providerUsage[event.provider] || 0) + 1;
      }

      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;

      if (event.duration) {
        totalDuration += event.duration;
        durationCount++;
      }
    });

    const averageResponseTime = durationCount > 0 ? totalDuration / durationCount : 0;

    return {
      totalEvents,
      successfulEvents,
      failedEvents,
      providerUsage,
      averageResponseTime,
      eventsByType,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get daily usage for the last N days
   */
  async getDailyUsage(days: number = 30): Promise<DailyUsage[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    const dailyMap = new Map<string, { events: number; successes: number }>();
    const now = new Date();

    // Initialize all days
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      if (dateStr) {
        dailyMap.set(dateStr, { events: 0, successes: 0 });
      }
    }

    // Count events per day
    this.events.forEach((event) => {
      const dateStr = event.timestamp.split('T')[0];
      if (dateStr) {
        const dayData = dailyMap.get(dateStr);
        if (dayData) {
          dayData.events++;
          if (event.success) {
            dayData.successes++;
          }
        }
      }
    });

    // Convert to array and calculate success rate
    const result: DailyUsage[] = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        events: data.events,
        successRate: data.events > 0 ? (data.successes / data.events) * 100 : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return result;
  }

  /**
   * Get most used provider
   */
  async getMostUsedProvider(): Promise<AIProvider | null> {
    const stats = await this.getStatistics();
    let maxUsage = 0;
    let mostUsed: AIProvider | null = null;

    (Object.keys(stats.providerUsage) as AIProvider[]).forEach((provider) => {
      if (stats.providerUsage[provider] > maxUsage) {
        maxUsage = stats.providerUsage[provider];
        mostUsed = provider;
      }
    });

    return mostUsed;
  }

  /**
   * Get success rate by provider
   */
  async getSuccessRateByProvider(): Promise<Record<AIProvider, number>> {
    if (!this.initialized) {
      await this.initialize();
    }

    const providerStats: Record<AIProvider, { total: number; success: number }> = {
      openai: { total: 0, success: 0 },
      gemini: { total: 0, success: 0 },
      claude: { total: 0, success: 0 },
    };

    this.events.forEach((event) => {
      if (event.provider) {
        providerStats[event.provider].total++;
        if (event.success) {
          providerStats[event.provider].success++;
        }
      }
    });

    const successRates: Record<AIProvider, number> = {
      openai: 0,
      gemini: 0,
      claude: 0,
    };

    (Object.keys(providerStats) as AIProvider[]).forEach((provider) => {
      const stats = providerStats[provider];
      successRates[provider] = stats.total > 0 ? (stats.success / stats.total) * 100 : 0;
    });

    return successRates;
  }

  /**
   * Clear all analytics data
   */
  async clearAnalytics(): Promise<void> {
    this.events = [];
    await this.saveEvents();
    logger.info('Analytics data cleared');
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }

    const stats = await this.getStatistics();
    const dailyUsage = await this.getDailyUsage(30);
    const successRates = await this.getSuccessRateByProvider();

    const exportData = {
      statistics: stats,
      dailyUsage,
      successRates,
      events: this.events,
      exportDate: new Date().toISOString(),
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Filter events by number of days
   */
  private filterEventsByDays(events: UsageEvent[], days: number): UsageEvent[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffTime = cutoffDate.getTime();

    return events.filter((event) => {
      const eventTime = new Date(event.timestamp).getTime();
      return eventTime >= cutoffTime;
    });
  }

  /**
   * Load events from storage
   */
  private async loadEvents(): Promise<UsageEvent[]> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      const data = result[this.STORAGE_KEY];
      if (data && Array.isArray(data)) {
        return data;
      }
      return [];
    } catch (error) {
      logger.error('Failed to load analytics events:', error);
      return [];
    }
  }

  /**
   * Save events to storage
   */
  private async saveEvents(): Promise<void> {
    try {
      await chrome.storage.local.set({ [this.STORAGE_KEY]: this.events });
    } catch (error) {
      logger.error('Failed to save analytics events:', error);
    }
  }
}

// Export singleton instance
export const usageAnalytics = new UsageAnalyticsService();
