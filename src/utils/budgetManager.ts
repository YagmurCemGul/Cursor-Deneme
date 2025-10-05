/**
 * Budget Manager
 * Tracks API costs and manages spending limits
 * 
 * @module budgetManager
 * @description Real-time cost tracking with budget alerts and limits
 */

import { logger } from './logger';
import { AIProvider } from './aiProviders';

/**
 * Budget period
 */
export type BudgetPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly';

/**
 * Budget configuration
 */
export interface BudgetConfig {
  period: BudgetPeriod;
  limit: number;
  alertThresholds: number[]; // e.g., [0.5, 0.8, 0.95] for 50%, 80%, 95%
  autoStopAt?: number; // Auto-stop at this threshold (e.g., 1.0 = 100%)
}

/**
 * Cost record
 */
interface CostRecord {
  timestamp: number;
  provider: AIProvider;
  operation: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  model: string;
}

/**
 * Budget alert
 */
export interface BudgetAlert {
  level: 'info' | 'warning' | 'critical' | 'exceeded';
  message: string;
  usage: number;
  limit: number;
  percentage: number;
  period: BudgetPeriod;
}

/**
 * Cost report
 */
export interface CostReport {
  period: BudgetPeriod;
  totalCost: number;
  budgetLimit: number;
  remaining: number;
  percentage: number;
  byProvider: Record<AIProvider, number>;
  byOperation: Record<string, number>;
  byModel: Record<string, number>;
  byDay: { date: string; cost: number }[];
  averageCostPerRequest: number;
  totalRequests: number;
  projectedCost?: number; // Projected cost for rest of period
}

/**
 * Budget Manager
 * Manages API spending with alerts and limits
 */
export class BudgetManager {
  private config: BudgetConfig;
  private costHistory: CostRecord[] = [];
  private storageKey = 'budget_manager';
  private alertedThresholds = new Set<number>();

  /**
   * Constructor
   */
  constructor(config?: Partial<BudgetConfig>) {
    this.config = {
      period: config?.period || 'daily',
      limit: config?.limit || 10.0, // $10 default
      alertThresholds: config?.alertThresholds || [0.5, 0.8, 0.95],
      autoStopAt: config?.autoStopAt
    };

    this.loadHistory();
    logger.info(`Budget manager initialized: ${this.config.period} limit of $${this.config.limit}`);
  }

  /**
   * Set budget configuration
   */
  setBudget(config: Partial<BudgetConfig>): void {
    this.config = { ...this.config, ...config };
    this.alertedThresholds.clear(); // Reset alerts on config change
    logger.info(`Budget updated: ${this.config.period} limit of $${this.config.limit}`);
  }

  /**
   * Track a cost
   */
  trackCost(record: {
    provider: AIProvider;
    operation: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
    model: string;
  }): void {
    const costRecord: CostRecord = {
      timestamp: Date.now(),
      ...record
    };

    this.costHistory.push(costRecord);
    this.saveHistory();
    this.cleanOldRecords();

    logger.debug(`Cost tracked: $${cost.toFixed(4)} (${record.provider}/${record.model})`);

    // Check for alerts
    const alert = this.checkBudgetAlert();
    if (alert) {
      this.handleAlert(alert);
    }
  }

  /**
   * Check if spending is allowed
   */
  canSpend(estimatedCost: number = 0): boolean {
    const report = this.getCostReport();
    const wouldExceed = (report.totalCost + estimatedCost) > this.config.limit;
    
    // Check auto-stop threshold
    if (this.config.autoStopAt) {
      const threshold = this.config.limit * this.config.autoStopAt;
      if (report.totalCost >= threshold) {
        logger.warn(`Budget auto-stop triggered at $${report.totalCost.toFixed(2)}`);
        return false;
      }
    }

    return !wouldExceed;
  }

  /**
   * Get current spending for the period
   */
  getCurrentSpending(): number {
    this.cleanOldRecords();
    return this.costHistory.reduce((sum, r) => sum + r.cost, 0);
  }

  /**
   * Check budget alert
   */
  checkBudgetAlert(): BudgetAlert | null {
    const spending = this.getCurrentSpending();
    const percentage = spending / this.config.limit;

    // Check if exceeded
    if (spending >= this.config.limit) {
      return {
        level: 'exceeded',
        message: `Budget exceeded! Spent $${spending.toFixed(2)} of $${this.config.limit.toFixed(2)} ${this.config.period} limit`,
        usage: spending,
        limit: this.config.limit,
        percentage: percentage * 100,
        period: this.config.period
      };
    }

    // Check thresholds
    for (const threshold of this.config.alertThresholds.sort((a, b) => b - a)) {
      if (percentage >= threshold && !this.alertedThresholds.has(threshold)) {
        this.alertedThresholds.add(threshold);
        
        const level = threshold >= 0.95 ? 'critical' : threshold >= 0.8 ? 'warning' : 'info';
        
        return {
          level,
          message: `Budget ${level}: ${(percentage * 100).toFixed(1)}% used ($${spending.toFixed(2)} of $${this.config.limit.toFixed(2)})`,
          usage: spending,
          limit: this.config.limit,
          percentage: percentage * 100,
          period: this.config.period
        };
      }
    }

    return null;
  }

  /**
   * Get detailed cost report
   */
  getCostReport(): CostReport {
    this.cleanOldRecords();

    const totalCost = this.costHistory.reduce((sum, r) => sum + r.cost, 0);
    const remaining = Math.max(0, this.config.limit - totalCost);
    const percentage = (totalCost / this.config.limit) * 100;

    // Group by provider
    const byProvider: Record<string, number> = {};
    this.costHistory.forEach(r => {
      byProvider[r.provider] = (byProvider[r.provider] || 0) + r.cost;
    });

    // Group by operation
    const byOperation: Record<string, number> = {};
    this.costHistory.forEach(r => {
      byOperation[r.operation] = (byOperation[r.operation] || 0) + r.cost;
    });

    // Group by model
    const byModel: Record<string, number> = {};
    this.costHistory.forEach(r => {
      byModel[r.model] = (byModel[r.model] || 0) + r.cost;
    });

    // Group by day
    const byDay: { date: string; cost: number }[] = [];
    const dayMap = new Map<string, number>();
    
    this.costHistory.forEach(r => {
      const date = new Date(r.timestamp).toISOString().split('T')[0];
      dayMap.set(date, (dayMap.get(date) || 0) + r.cost);
    });
    
    dayMap.forEach((cost, date) => {
      byDay.push({ date, cost });
    });
    byDay.sort((a, b) => a.date.localeCompare(b.date));

    // Calculate averages
    const totalRequests = this.costHistory.length;
    const averageCostPerRequest = totalRequests > 0 ? totalCost / totalRequests : 0;

    // Project future cost
    let projectedCost: number | undefined;
    if (totalRequests > 0) {
      const periodMs = this.getPeriodMilliseconds();
      const oldestTimestamp = Math.min(...this.costHistory.map(r => r.timestamp));
      const elapsedMs = Date.now() - oldestTimestamp;
      const elapsedRatio = elapsedMs / periodMs;
      
      if (elapsedRatio > 0 && elapsedRatio < 1) {
        projectedCost = totalCost / elapsedRatio;
      }
    }

    return {
      period: this.config.period,
      totalCost,
      budgetLimit: this.config.limit,
      remaining,
      percentage,
      byProvider: byProvider as Record<AIProvider, number>,
      byOperation,
      byModel,
      byDay,
      averageCostPerRequest,
      totalRequests,
      projectedCost
    };
  }

  /**
   * Get cost breakdown by provider
   */
  getCostByProvider(): Record<AIProvider, { cost: number; requests: number; percentage: number }> {
    this.cleanOldRecords();
    
    const result: any = {};
    const totalCost = this.getCurrentSpending();
    
    this.costHistory.forEach(r => {
      if (!result[r.provider]) {
        result[r.provider] = { cost: 0, requests: 0, percentage: 0 };
      }
      result[r.provider].cost += r.cost;
      result[r.provider].requests++;
    });
    
    // Calculate percentages
    Object.keys(result).forEach(provider => {
      result[provider].percentage = totalCost > 0 
        ? (result[provider].cost / totalCost) * 100 
        : 0;
    });
    
    return result;
  }

  /**
   * Reset budget and history
   */
  reset(): void {
    this.costHistory = [];
    this.alertedThresholds.clear();
    this.saveHistory();
    logger.info('Budget reset');
  }

  /**
   * Get budget config
   */
  getConfig(): BudgetConfig {
    return { ...this.config };
  }

  /**
   * Handle alert (can be overridden)
   */
  private handleAlert(alert: BudgetAlert): void {
    logger.warn(`Budget alert: ${alert.message}`);
    
    // Emit custom event for UI to handle
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('budgetAlert', { detail: alert }));
    }
  }

  /**
   * Get period in milliseconds
   */
  private getPeriodMilliseconds(): number {
    const periods: Record<BudgetPeriod, number> = {
      'hourly': 60 * 60 * 1000,
      'daily': 24 * 60 * 60 * 1000,
      'weekly': 7 * 24 * 60 * 60 * 1000,
      'monthly': 30 * 24 * 60 * 60 * 1000
    };
    return periods[this.config.period];
  }

  /**
   * Clean old records outside current period
   */
  private cleanOldRecords(): void {
    const periodMs = this.getPeriodMilliseconds();
    const cutoff = Date.now() - periodMs;
    const before = this.costHistory.length;

    this.costHistory = this.costHistory.filter(r => r.timestamp > cutoff);

    const removed = before - this.costHistory.length;
    if (removed > 0) {
      logger.debug(`Cleaned ${removed} old cost records`);
      this.saveHistory();
      
      // Reset alerts for new period
      this.alertedThresholds.clear();
    }
  }

  /**
   * Load history from storage
   */
  private loadHistory(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.costHistory = data.costHistory || [];
        this.config = { ...this.config, ...data.config };
        logger.debug(`Loaded ${this.costHistory.length} cost records from storage`);
      }
    } catch (error) {
      logger.error('Failed to load budget history:', error);
      this.costHistory = [];
    }
  }

  /**
   * Save history to storage
   */
  private saveHistory(): void {
    try {
      const data = {
        costHistory: this.costHistory,
        config: this.config
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      logger.error('Failed to save budget history:', error);
    }
  }
}

/**
 * Global budget manager instance
 */
let globalBudgetManager: BudgetManager | null = null;

/**
 * Get or create global budget manager
 */
export function getBudgetManager(config?: Partial<BudgetConfig>): BudgetManager {
  if (!globalBudgetManager) {
    globalBudgetManager = new BudgetManager(config);
  } else if (config) {
    globalBudgetManager.setBudget(config);
  }
  return globalBudgetManager;
}

/**
 * Helper to track cost
 */
export function trackCost(
  provider: AIProvider,
  operation: string,
  inputTokens: number,
  outputTokens: number,
  cost: number,
  model: string
): void {
  const manager = getBudgetManager();
  manager.trackCost({
    provider,
    operation,
    inputTokens,
    outputTokens,
    cost,
    model
  });
}
