/**
 * Advanced Analytics
 * Provides detailed insights and recommendations for API usage
 * 
 * @module advancedAnalytics
 * @description Advanced analytics with cost optimization insights
 */

import { logger } from './logger';
import { AIProvider } from './aiProviders';
import { getBudgetManager } from './budgetManager';
import { getRateLimitTracker } from './rateLimitTracker';

/**
 * Insight type
 */
export type InsightType = 
  | 'cost_saving'
  | 'performance'
  | 'reliability'
  | 'usage_pattern'
  | 'optimization';

/**
 * Insight
 */
export interface Insight {
  type: InsightType;
  severity: 'info' | 'suggestion' | 'recommendation' | 'important';
  title: string;
  message: string;
  potentialSaving?: number;
  action?: {
    label: string;
    handler: () => void;
  };
  metadata?: Record<string, any>;
}

/**
 * Provider comparison
 */
export interface ProviderComparison {
  provider: AIProvider;
  totalCost: number;
  requests: number;
  averageCost: number;
  averageLatency: number;
  successRate: number;
  costPerRequest: number;
  recommendation: 'recommended' | 'acceptable' | 'expensive';
}

/**
 * Usage pattern
 */
export interface UsagePattern {
  peakHours: number[]; // Hours of day (0-23)
  peakDays: string[]; // Days of week
  averageRequestsPerDay: number;
  averageRequestsPerHour: number;
  busiestHour: number;
  quietestHour: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality: boolean;
}

/**
 * Operation analysis
 */
export interface OperationAnalysis {
  operation: string;
  count: number;
  totalCost: number;
  averageCost: number;
  averageLatency: number;
  successRate: number;
  costPercentage: number;
  optimization?: string;
}

/**
 * Cost forecast
 */
export interface CostForecast {
  daily: number;
  weekly: number;
  monthly: number;
  confidence: number; // 0-1
  trend: 'increasing' | 'decreasing' | 'stable';
  alerts: string[];
}

/**
 * Advanced Analytics
 */
export class AdvancedAnalytics {
  private requestLog: Array<{
    timestamp: number;
    provider: AIProvider;
    operation: string;
    cost: number;
    duration: number;
    success: boolean;
    model: string;
    tokens: { input: number; output: number };
  }> = [];
  
  private storageKey = 'advanced_analytics';
  private maxLogSize = 1000;

  constructor() {
    this.loadLog();
    logger.info('Advanced analytics initialized');
  }

  /**
   * Track request
   */
  trackRequest(data: {
    provider: AIProvider;
    operation: string;
    cost: number;
    duration: number;
    success: boolean;
    model: string;
    inputTokens: number;
    outputTokens: number;
  }): void {
    this.requestLog.push({
      timestamp: Date.now(),
      provider: data.provider,
      operation: data.operation,
      cost: data.cost,
      duration: data.duration,
      success: data.success,
      model: data.model,
      tokens: {
        input: data.inputTokens,
        output: data.outputTokens
      }
    });

    // Keep log size manageable
    if (this.requestLog.length > this.maxLogSize) {
      this.requestLog = this.requestLog.slice(-this.maxLogSize);
    }

    this.saveLog();
  }

  /**
   * Get insights
   */
  getInsights(): Insight[] {
    const insights: Insight[] = [];

    // Cost saving insights
    insights.push(...this.getCostSavingInsights());

    // Performance insights
    insights.push(...this.getPerformanceInsights());

    // Usage pattern insights
    insights.push(...this.getUsagePatternInsights());

    // Reliability insights
    insights.push(...this.getReliabilityInsights());

    // Sort by severity
    const severityWeight = {
      'important': 4,
      'recommendation': 3,
      'suggestion': 2,
      'info': 1
    };

    return insights.sort((a, b) => 
      severityWeight[b.severity] - severityWeight[a.severity]
    );
  }

  /**
   * Get cost saving insights
   */
  private getCostSavingInsights(): Insight[] {
    const insights: Insight[] = [];
    
    if (this.requestLog.length < 10) return insights;

    // Analyze by operation and provider
    const byOperation = this.groupBy(this.requestLog, 'operation');
    
    for (const [operation, requests] of Object.entries(byOperation)) {
      const byProvider = this.groupBy(requests, 'provider');
      const providers = Object.keys(byProvider) as AIProvider[];
      
      if (providers.length < 2) continue;

      // Compare costs
      const costs = providers.map(p => ({
        provider: p,
        avgCost: byProvider[p].reduce((sum, r) => sum + r.cost, 0) / byProvider[p].length
      }));

      costs.sort((a, b) => a.avgCost - b.avgCost);
      
      const cheapest = costs[0];
      const current = costs.find(c => 
        byProvider[c.provider].length === Math.max(...providers.map(p => byProvider[p].length))
      ) || costs[0];

      if (current.provider !== cheapest.provider) {
        const savingPerRequest = current.avgCost - cheapest.avgCost;
        const requestCount = byProvider[current.provider].length;
        const potentialSaving = savingPerRequest * requestCount;

        if (potentialSaving > 0.1) { // Significant saving
          insights.push({
            type: 'cost_saving',
            severity: potentialSaving > 1 ? 'important' : 'recommendation',
            title: `Switch ${operation} to ${cheapest.provider}`,
            message: `Using ${cheapest.provider} instead of ${current.provider} for ${operation} could save $${savingPerRequest.toFixed(4)} per request.`,
            potentialSaving,
            metadata: {
              operation,
              currentProvider: current.provider,
              recommendedProvider: cheapest.provider,
              savingPerRequest
            }
          });
        }
      }
    }

    // Check for expensive models
    const modelUsage = this.groupBy(this.requestLog, 'model');
    for (const [model, requests] of Object.entries(modelUsage)) {
      const avgCost = requests.reduce((sum, r) => sum + r.cost, 0) / requests.length;
      
      if (model.includes('gpt-4') && !model.includes('mini') && avgCost > 0.01) {
        const estimatedSaving = requests.length * avgCost * 0.9; // 90% saving with cheaper model
        
        insights.push({
          type: 'cost_saving',
          severity: 'recommendation',
          title: 'Consider using GPT-4-mini',
          message: `${model} is expensive. For simpler tasks, GPT-4-mini is 90% cheaper with similar quality.`,
          potentialSaving: estimatedSaving,
          metadata: { model, avgCost, requestCount: requests.length }
        });
      }
    }

    return insights;
  }

  /**
   * Get performance insights
   */
  private getPerformanceInsights(): Insight[] {
    const insights: Insight[] = [];
    
    if (this.requestLog.length < 5) return insights;

    // Check average latency by provider
    const byProvider = this.groupBy(this.requestLog, 'provider');
    
    for (const [provider, requests] of Object.entries(byProvider)) {
      const avgLatency = requests.reduce((sum, r) => sum + r.duration, 0) / requests.length;
      
      if (avgLatency > 5000) { // Slower than 5 seconds
        insights.push({
          type: 'performance',
          severity: 'suggestion',
          title: `${provider} is slow`,
          message: `Average response time for ${provider} is ${(avgLatency / 1000).toFixed(1)}s. Consider using a faster provider for better UX.`,
          metadata: { provider, avgLatency }
        });
      }
    }

    // Check for slow operations
    const byOperation = this.groupBy(this.requestLog, 'operation');
    
    for (const [operation, requests] of Object.entries(byOperation)) {
      const avgLatency = requests.reduce((sum, r) => sum + r.duration, 0) / requests.length;
      
      if (avgLatency > 10000) { // Very slow
        insights.push({
          type: 'performance',
          severity: 'recommendation',
          title: `${operation} is very slow`,
          message: `${operation} takes ${(avgLatency / 1000).toFixed(1)}s on average. Consider optimizing prompts or using streaming.`,
          metadata: { operation, avgLatency }
        });
      }
    }

    return insights;
  }

  /**
   * Get usage pattern insights
   */
  private getUsagePatternInsights(): Insight[] {
    const insights: Insight[] = [];
    
    if (this.requestLog.length < 20) return insights;

    const pattern = this.analyzePatterns();
    
    // Peak usage warning
    if (pattern.peakHours.length > 0) {
      insights.push({
        type: 'usage_pattern',
        severity: 'info',
        title: 'Peak usage detected',
        message: `Your peak usage hours are ${pattern.peakHours.join(', ')}:00. Consider spreading requests to avoid rate limits.`,
        metadata: { peakHours: pattern.peakHours }
      });
    }

    // Increasing trend warning
    if (pattern.trend === 'increasing') {
      const forecast = this.forecastCost();
      
      if (forecast.monthly > 100) {
        insights.push({
          type: 'usage_pattern',
          severity: 'recommendation',
          title: 'Increasing usage trend',
          message: `Your usage is trending up. Projected monthly cost: $${forecast.monthly.toFixed(2)}. Consider optimizing to reduce costs.`,
          metadata: { forecast }
        });
      }
    }

    return insights;
  }

  /**
   * Get reliability insights
   */
  private getReliabilityInsights(): Insight[] {
    const insights: Insight[] = [];
    
    if (this.requestLog.length < 10) return insights;

    const byProvider = this.groupBy(this.requestLog, 'provider');
    
    for (const [provider, requests] of Object.entries(byProvider)) {
      const successRate = requests.filter(r => r.success).length / requests.length;
      
      if (successRate < 0.9) { // Less than 90% success rate
        insights.push({
          type: 'reliability',
          severity: successRate < 0.7 ? 'important' : 'recommendation',
          title: `${provider} reliability issues`,
          message: `${provider} has ${(successRate * 100).toFixed(1)}% success rate. Consider using a more reliable provider or implementing better error handling.`,
          metadata: { provider, successRate, failureCount: requests.filter(r => !r.success).length }
        });
      }
    }

    return insights;
  }

  /**
   * Compare providers
   */
  compareProviders(): ProviderComparison[] {
    const byProvider = this.groupBy(this.requestLog, 'provider');
    const comparisons: ProviderComparison[] = [];

    for (const [provider, requests] of Object.entries(byProvider)) {
      const totalCost = requests.reduce((sum, r) => sum + r.cost, 0);
      const successCount = requests.filter(r => r.success).length;
      const avgCost = totalCost / requests.length;
      const avgLatency = requests.reduce((sum, r) => sum + r.duration, 0) / requests.length;

      // Determine recommendation
      let recommendation: 'recommended' | 'acceptable' | 'expensive' = 'acceptable';
      
      if (avgCost < 0.01 && successCount / requests.length > 0.95) {
        recommendation = 'recommended';
      } else if (avgCost > 0.05 || successCount / requests.length < 0.8) {
        recommendation = 'expensive';
      }

      comparisons.push({
        provider: provider as AIProvider,
        totalCost,
        requests: requests.length,
        averageCost: avgCost,
        averageLatency: avgLatency,
        successRate: successCount / requests.length,
        costPerRequest: avgCost,
        recommendation
      });
    }

    return comparisons.sort((a, b) => a.averageCost - b.averageCost);
  }

  /**
   * Analyze usage patterns
   */
  analyzePatterns(): UsagePattern {
    if (this.requestLog.length === 0) {
      return {
        peakHours: [],
        peakDays: [],
        averageRequestsPerDay: 0,
        averageRequestsPerHour: 0,
        busiestHour: 0,
        quietestHour: 0,
        trend: 'stable',
        seasonality: false
      };
    }

    // Group by hour
    const byHour: Record<number, number> = {};
    const byDay: Record<string, number> = {};

    this.requestLog.forEach(r => {
      const date = new Date(r.timestamp);
      const hour = date.getHours();
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });

      byHour[hour] = (byHour[hour] || 0) + 1;
      byDay[day] = (byDay[day] || 0) + 1;
    });

    // Find peaks
    const maxHourCount = Math.max(...Object.values(byHour));
    const peakHours = Object.entries(byHour)
      .filter(([_, count]) => count >= maxHourCount * 0.8)
      .map(([hour]) => parseInt(hour));

    const maxDayCount = Math.max(...Object.values(byDay));
    const peakDays = Object.entries(byDay)
      .filter(([_, count]) => count >= maxDayCount * 0.8)
      .map(([day]) => day);

    // Calculate averages
    const uniqueDays = new Set(this.requestLog.map(r => 
      new Date(r.timestamp).toDateString()
    )).size;
    
    const averageRequestsPerDay = this.requestLog.length / uniqueDays;
    const averageRequestsPerHour = averageRequestsPerDay / 24;

    // Find busiest/quietest hour
    const busiestHour = parseInt(
      Object.entries(byHour).sort((a, b) => b[1] - a[1])[0][0]
    );
    const quietestHour = parseInt(
      Object.entries(byHour).sort((a, b) => a[1] - b[1])[0][0]
    );

    // Determine trend
    const trend = this.calculateTrend();

    return {
      peakHours,
      peakDays,
      averageRequestsPerDay,
      averageRequestsPerHour,
      busiestHour,
      quietestHour,
      trend,
      seasonality: peakDays.length < 5 // Weekday pattern detected
    };
  }

  /**
   * Get operation analysis
   */
  analyzeOperations(): OperationAnalysis[] {
    const byOperation = this.groupBy(this.requestLog, 'operation');
    const totalCost = this.requestLog.reduce((sum, r) => sum + r.cost, 0);
    const analyses: OperationAnalysis[] = [];

    for (const [operation, requests] of Object.entries(byOperation)) {
      const opTotalCost = requests.reduce((sum, r) => sum + r.cost, 0);
      const successCount = requests.filter(r => r.success).length;

      analyses.push({
        operation,
        count: requests.length,
        totalCost: opTotalCost,
        averageCost: opTotalCost / requests.length,
        averageLatency: requests.reduce((sum, r) => sum + r.duration, 0) / requests.length,
        successRate: successCount / requests.length,
        costPercentage: totalCost > 0 ? (opTotalCost / totalCost) * 100 : 0,
        optimization: this.getOperationOptimization(operation, requests)
      });
    }

    return analyses.sort((a, b) => b.totalCost - a.totalCost);
  }

  /**
   * Forecast cost
   */
  forecastCost(): CostForecast {
    if (this.requestLog.length < 7) {
      return {
        daily: 0,
        weekly: 0,
        monthly: 0,
        confidence: 0,
        trend: 'stable',
        alerts: ['Insufficient data for accurate forecast']
      };
    }

    // Calculate recent daily costs
    const dailyCosts: number[] = [];
    const daysMap = new Map<string, number>();

    this.requestLog.forEach(r => {
      const day = new Date(r.timestamp).toDateString();
      daysMap.set(day, (daysMap.get(day) || 0) + r.cost);
    });

    dailyCosts.push(...Array.from(daysMap.values()));

    const avgDailyCost = dailyCosts.reduce((sum, c) => sum + c, 0) / dailyCosts.length;
    const trend = this.calculateTrend();

    // Apply trend multiplier
    let multiplier = 1.0;
    if (trend === 'increasing') multiplier = 1.2;
    if (trend === 'decreasing') multiplier = 0.8;

    const alerts: string[] = [];
    const monthly = avgDailyCost * 30 * multiplier;

    if (monthly > 100) {
      alerts.push(`Projected monthly cost exceeds $100`);
    }
    if (trend === 'increasing') {
      alerts.push(`Usage is trending upward`);
    }

    return {
      daily: avgDailyCost * multiplier,
      weekly: avgDailyCost * 7 * multiplier,
      monthly,
      confidence: Math.min(dailyCosts.length / 30, 1), // Higher confidence with more data
      trend,
      alerts
    };
  }

  /**
   * Calculate trend
   */
  private calculateTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.requestLog.length < 14) return 'stable';

    const midpoint = Math.floor(this.requestLog.length / 2);
    const firstHalf = this.requestLog.slice(0, midpoint);
    const secondHalf = this.requestLog.slice(midpoint);

    const firstHalfAvg = firstHalf.reduce((sum, r) => sum + r.cost, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, r) => sum + r.cost, 0) / secondHalf.length;

    const change = (secondHalfAvg - firstHalfAvg) / firstHalfAvg;

    if (change > 0.2) return 'increasing';
    if (change < -0.2) return 'decreasing';
    return 'stable';
  }

  /**
   * Get operation optimization suggestion
   */
  private getOperationOptimization(operation: string, requests: any[]): string | undefined {
    const avgCost = requests.reduce((sum, r) => sum + r.cost, 0) / requests.length;
    
    if (avgCost > 0.05) {
      return 'Consider using a cheaper model or optimizing prompts';
    }
    
    const avgLatency = requests.reduce((sum, r) => sum + r.duration, 0) / requests.length;
    if (avgLatency > 10000) {
      return 'Consider implementing caching or reducing prompt size';
    }
    
    return undefined;
  }

  /**
   * Group array by key
   */
  private groupBy<T extends Record<string, any>>(
    array: T[],
    key: keyof T
  ): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      groups[groupKey] = groups[groupKey] || [];
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  /**
   * Load log from storage
   */
  private loadLog(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.requestLog = JSON.parse(stored);
        logger.debug(`Loaded ${this.requestLog.length} analytics records`);
      }
    } catch (error) {
      logger.error('Failed to load analytics log:', error);
    }
  }

  /**
   * Save log to storage
   */
  private saveLog(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.requestLog));
    } catch (error) {
      logger.error('Failed to save analytics log:', error);
    }
  }

  /**
   * Clear analytics data
   */
  clear(): void {
    this.requestLog = [];
    this.saveLog();
    logger.info('Analytics data cleared');
  }
}

/**
 * Global instance
 */
let globalAnalytics: AdvancedAnalytics | null = null;

/**
 * Get global analytics instance
 */
export function getAnalytics(): AdvancedAnalytics {
  if (!globalAnalytics) {
    globalAnalytics = new AdvancedAnalytics();
  }
  return globalAnalytics;
}
