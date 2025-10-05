/**
 * ML-based Provider Selection
 * Uses machine learning to select optimal AI provider
 * 
 * @module mlProviderSelector
 * @description Self-learning system that improves provider selection over time
 */

import { AIProvider } from './aiProviders';
import { logger } from './logger';

/**
 * Provider performance metrics
 */
export interface ProviderPerformance {
  provider: AIProvider;
  operation: string;
  cost: number;
  latency: number;
  success: boolean;
  timestamp: number;
  timeOfDay: number;
  tokensUsed: number;
  userSatisfaction?: number; // 0-1
}

/**
 * Selection context
 */
export interface SelectionContext {
  operation: string;
  estimatedTokens: number;
  budget: number;
  timeOfDay: number;
  dayOfWeek: number;
  urgency: 'low' | 'normal' | 'high';
  prioritize: 'cost' | 'speed' | 'quality';
}

/**
 * Provider scores
 */
interface ProviderScores {
  [key: string]: number;
}

/**
 * ML Provider Selector
 * Uses historical data and context to select optimal provider
 */
export class MLProviderSelector {
  private history: ProviderPerformance[] = [];
  private maxHistorySize = 1000;
  private storageKey = 'ml_provider_history';

  // Feature weights (learned over time)
  private weights = {
    cost: 0.3,
    latency: 0.3,
    successRate: 0.3,
    satisfaction: 0.1
  };

  constructor() {
    this.loadHistory();
    logger.info('ML Provider Selector initialized');
  }

  /**
   * Select optimal provider based on context
   */
  async selectProvider(context: SelectionContext): Promise<AIProvider> {
    const scores = this.calculateScores(context);
    
    // Apply exploration vs exploitation (epsilon-greedy)
    const epsilon = 0.1; // 10% exploration
    
    if (Math.random() < epsilon) {
      // Explore: randomly select provider
      const providers: AIProvider[] = ['openai', 'gemini', 'claude'];
      const randomIndex = Math.floor(Math.random() * providers.length);
      logger.debug('ML Provider: Exploring random provider');
      return providers[randomIndex];
    } else {
      // Exploit: select best provider
      const best = Object.entries(scores)
        .sort(([, a], [, b]) => b - a)[0];
      
      logger.info(`ML Provider: Selected ${best[0]} (score: ${best[1].toFixed(2)})`);
      return best[0] as AIProvider;
    }
  }

  /**
   * Calculate scores for each provider
   */
  private calculateScores(context: SelectionContext): ProviderScores {
    const providers: AIProvider[] = ['openai', 'gemini', 'claude'];
    const scores: ProviderScores = {};

    for (const provider of providers) {
      scores[provider] = this.scoreProvider(provider, context);
    }

    return scores;
  }

  /**
   * Score a single provider
   */
  private scoreProvider(provider: AIProvider, context: SelectionContext): number {
    // Get relevant historical data
    const relevantHistory = this.history
      .filter(h => 
        h.provider === provider &&
        h.operation === context.operation
      )
      .slice(-50); // Last 50 requests

    if (relevantHistory.length === 0) {
      return 0.5; // Neutral score for unknown providers
    }

    // Calculate metrics
    const avgCost = relevantHistory.reduce((sum, h) => sum + h.cost, 0) / relevantHistory.length;
    const avgLatency = relevantHistory.reduce((sum, h) => sum + h.latency, 0) / relevantHistory.length;
    const successRate = relevantHistory.filter(h => h.success).length / relevantHistory.length;
    const avgSatisfaction = relevantHistory
      .filter(h => h.userSatisfaction !== undefined)
      .reduce((sum, h) => sum + (h.userSatisfaction || 0), 0) / relevantHistory.length || 0.5;

    // Normalize metrics (0-1 scale)
    const costScore = 1 - Math.min(avgCost / 0.1, 1); // Lower cost is better
    const latencyScore = 1 - Math.min(avgLatency / 10000, 1); // Lower latency is better
    const successScore = successRate;
    const satisfactionScore = avgSatisfaction;

    // Apply context-based adjustments
    let finalScore = 
      costScore * this.weights.cost +
      latencyScore * this.weights.latency +
      successScore * this.weights.successRate +
      satisfactionScore * this.weights.satisfaction;

    // Adjust based on user priority
    if (context.prioritize === 'cost') {
      finalScore = costScore * 0.7 + finalScore * 0.3;
    } else if (context.prioritize === 'speed') {
      finalScore = latencyScore * 0.7 + finalScore * 0.3;
    } else if (context.prioritize === 'quality') {
      finalScore = successScore * 0.5 + satisfactionScore * 0.3 + finalScore * 0.2;
    }

    // Adjust for budget constraints
    if (avgCost > context.budget) {
      finalScore *= 0.5; // Penalize if too expensive
    }

    // Time-of-day patterns
    const timePatternScore = this.getTimePatternScore(provider, context.timeOfDay);
    finalScore = finalScore * 0.8 + timePatternScore * 0.2;

    return Math.max(0, Math.min(1, finalScore));
  }

  /**
   * Get time-based pattern score
   */
  private getTimePatternScore(provider: AIProvider, timeOfDay: number): number {
    const relevantHistory = this.history
      .filter(h => 
        h.provider === provider &&
        Math.abs(h.timeOfDay - timeOfDay) < 2 // Within 2 hours
      )
      .slice(-20);

    if (relevantHistory.length === 0) return 0.5;

    const successRate = relevantHistory.filter(h => h.success).length / relevantHistory.length;
    return successRate;
  }

  /**
   * Record provider performance
   */
  recordPerformance(performance: ProviderPerformance): void {
    this.history.push(performance);

    // Keep history size manageable
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }

    this.saveHistory();

    // Periodically update weights
    if (this.history.length % 50 === 0) {
      this.updateWeights();
    }
  }

  /**
   * Update feature weights based on historical performance
   * Simple online learning approach
   */
  private updateWeights(): void {
    // Calculate correlation between each feature and success
    const recentHistory = this.history.slice(-200);
    
    if (recentHistory.length < 50) return;

    // Group by provider and calculate correlations
    const providers: AIProvider[] = ['openai', 'gemini', 'claude'];
    
    for (const provider of providers) {
      const providerHistory = recentHistory.filter(h => h.provider === provider);
      
      if (providerHistory.length < 10) continue;

      // Calculate correlation with success
      const costCorrelation = this.calculateCorrelation(
        providerHistory.map(h => h.cost),
        providerHistory.map(h => h.success ? 1 : 0)
      );

      const latencyCorrelation = this.calculateCorrelation(
        providerHistory.map(h => h.latency),
        providerHistory.map(h => h.success ? 1 : 0)
      );

      // Adjust weights based on correlations
      // Higher negative correlation = more important feature
      if (Math.abs(costCorrelation) > 0.3) {
        this.weights.cost = Math.min(0.5, this.weights.cost + 0.05);
      }
      
      if (Math.abs(latencyCorrelation) > 0.3) {
        this.weights.latency = Math.min(0.5, this.weights.latency + 0.05);
      }
    }

    // Normalize weights to sum to 1
    const sum = Object.values(this.weights).reduce((a, b) => a + b, 0);
    Object.keys(this.weights).forEach(key => {
      this.weights[key as keyof typeof this.weights] /= sum;
    });

    logger.debug('ML weights updated:', this.weights);
  }

  /**
   * Calculate Pearson correlation
   */
  private calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    if (n === 0) return 0;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Get provider recommendations with explanations
   */
  getRecommendations(context: SelectionContext): Array<{
    provider: AIProvider;
    score: number;
    reasoning: string;
  }> {
    const scores = this.calculateScores(context);
    
    return Object.entries(scores)
      .map(([provider, score]) => ({
        provider: provider as AIProvider,
        score,
        reasoning: this.explainScore(provider as AIProvider, score, context)
      }))
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Explain why a provider got its score
   */
  private explainScore(provider: AIProvider, score: number, context: SelectionContext): string {
    const history = this.history
      .filter(h => h.provider === provider && h.operation === context.operation)
      .slice(-20);

    if (history.length === 0) {
      return 'No historical data available. Score based on default weights.';
    }

    const avgCost = history.reduce((s, h) => s + h.cost, 0) / history.length;
    const avgLatency = history.reduce((s, h) => s + h.latency, 0) / history.length;
    const successRate = history.filter(h => h.success).length / history.length;

    const reasons: string[] = [];

    if (avgCost < 0.02) reasons.push('Low cost ($' + avgCost.toFixed(4) + ')');
    if (avgLatency < 3000) reasons.push('Fast response (' + (avgLatency/1000).toFixed(1) + 's)');
    if (successRate > 0.9) reasons.push('High success rate (' + (successRate*100).toFixed(0) + '%)');

    if (context.prioritize === 'cost' && avgCost < 0.02) {
      reasons.push('Matches your cost priority');
    }

    return reasons.length > 0 
      ? reasons.join(', ') 
      : 'Average performance across metrics';
  }

  /**
   * Get insights about provider performance
   */
  getInsights(): string[] {
    const insights: string[] = [];
    const recentHistory = this.history.slice(-100);

    if (recentHistory.length < 20) {
      return ['Not enough data for insights yet. Keep using the system!'];
    }

    // Analyze by provider
    const providers: AIProvider[] = ['openai', 'gemini', 'claude'];
    
    for (const provider of providers) {
      const providerHistory = recentHistory.filter(h => h.provider === provider);
      
      if (providerHistory.length < 5) continue;

      const avgCost = providerHistory.reduce((s, h) => s + h.cost, 0) / providerHistory.length;
      const successRate = providerHistory.filter(h => h.success).length / providerHistory.length;

      if (successRate > 0.95) {
        insights.push(`${provider} is very reliable (${(successRate*100).toFixed(0)}% success rate)`);
      }

      if (avgCost < 0.01) {
        insights.push(`${provider} is cost-effective ($${avgCost.toFixed(4)} avg)`);
      }
    }

    // Find best time patterns
    const hourlyPerformance = new Map<number, number>();
    
    recentHistory.forEach(h => {
      const hour = Math.floor(h.timeOfDay);
      const current = hourlyPerformance.get(hour) || 0;
      hourlyPerformance.set(hour, current + (h.success ? 1 : 0));
    });

    const bestHour = Array.from(hourlyPerformance.entries())
      .sort((a, b) => b[1] - a[1])[0];

    if (bestHour && bestHour[1] > 5) {
      insights.push(`Best performance around ${bestHour[0]}:00 hours`);
    }

    return insights;
  }

  /**
   * Load history from storage
   */
  private loadHistory(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.history = JSON.parse(stored);
        logger.debug(`Loaded ${this.history.length} performance records`);
      }
    } catch (error) {
      logger.error('Failed to load ML history:', error);
    }
  }

  /**
   * Save history to storage
   */
  private saveHistory(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.history));
    } catch (error) {
      logger.error('Failed to save ML history:', error);
    }
  }

  /**
   * Reset ML data
   */
  reset(): void {
    this.history = [];
    this.weights = {
      cost: 0.3,
      latency: 0.3,
      successRate: 0.3,
      satisfaction: 0.1
    };
    this.saveHistory();
    logger.info('ML Provider Selector reset');
  }
}

/**
 * Global ML selector instance
 */
let globalMLSelector: MLProviderSelector | null = null;

/**
 * Get or create global ML selector
 */
export function getMLProviderSelector(): MLProviderSelector {
  if (!globalMLSelector) {
    globalMLSelector = new MLProviderSelector();
  }
  return globalMLSelector;
}
