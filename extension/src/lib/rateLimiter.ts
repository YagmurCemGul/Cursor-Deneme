/**
 * Rate Limiter
 * Prevents excessive API calls and manages quotas
 */

export interface RateLimitConfig {
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  maxRequestsPerDay: number;
  maxCostPerDay: number;
}

export interface RateLimitStatus {
  allowed: boolean;
  reason?: string;
  retryAfter?: number;
  usage: {
    requestsThisMinute: number;
    requestsThisHour: number;
    requestsToday: number;
    costToday: number;
  };
  limits: RateLimitConfig;
}

const STORAGE_KEY = 'rate_limit_data';

const DEFAULT_LIMITS: RateLimitConfig = {
  maxRequestsPerMinute: 10,
  maxRequestsPerHour: 100,
  maxRequestsPerDay: 500,
  maxCostPerDay: 5.0 // $5 per day
};

/**
 * Rate Limiter Class
 */
export class RateLimiter {
  private static instance: RateLimiter;
  private requests: number[] = [];
  private costs: { timestamp: number; cost: number }[] = [];
  private config: RateLimitConfig = DEFAULT_LIMITS;

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
      RateLimiter.instance.loadFromStorage();
    }
    return RateLimiter.instance;
  }

  /**
   * Check if request is allowed
   */
  async checkLimit(): Promise<RateLimitStatus> {
    const now = Date.now();
    this.cleanup(now);

    const usage = {
      requestsThisMinute: this.countRequests(now, 60 * 1000),
      requestsThisHour: this.countRequests(now, 60 * 60 * 1000),
      requestsToday: this.countRequests(now, 24 * 60 * 60 * 1000),
      costToday: this.calculateCostToday(now)
    };

    // Check minute limit
    if (usage.requestsThisMinute >= this.config.maxRequestsPerMinute) {
      return {
        allowed: false,
        reason: 'Rate limit exceeded: too many requests per minute',
        retryAfter: 60,
        usage,
        limits: this.config
      };
    }

    // Check hour limit
    if (usage.requestsThisHour >= this.config.maxRequestsPerHour) {
      return {
        allowed: false,
        reason: 'Rate limit exceeded: too many requests per hour',
        retryAfter: 3600,
        usage,
        limits: this.config
      };
    }

    // Check day limit
    if (usage.requestsToday >= this.config.maxRequestsPerDay) {
      return {
        allowed: false,
        reason: 'Daily request limit exceeded',
        retryAfter: this.getSecondsUntilMidnight(),
        usage,
        limits: this.config
      };
    }

    // Check cost limit
    if (usage.costToday >= this.config.maxCostPerDay) {
      return {
        allowed: false,
        reason: `Daily cost limit exceeded ($${this.config.maxCostPerDay})`,
        retryAfter: this.getSecondsUntilMidnight(),
        usage,
        limits: this.config
      };
    }

    return {
      allowed: true,
      usage,
      limits: this.config
    };
  }

  /**
   * Record a request
   */
  async recordRequest(cost: number = 0): Promise<void> {
    const now = Date.now();
    this.requests.push(now);
    
    if (cost > 0) {
      this.costs.push({ timestamp: now, cost });
    }

    await this.saveToStorage();
  }

  /**
   * Update rate limit configuration
   */
  async updateConfig(config: Partial<RateLimitConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    await this.saveToStorage();
  }

  /**
   * Reset limits (for testing)
   */
  async reset(): Promise<void> {
    this.requests = [];
    this.costs = [];
    await this.saveToStorage();
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): {
    minute: { used: number; limit: number; percentage: number };
    hour: { used: number; limit: number; percentage: number };
    day: { used: number; limit: number; percentage: number };
    cost: { used: number; limit: number; percentage: number };
  } {
    const now = Date.now();
    const minute = this.countRequests(now, 60 * 1000);
    const hour = this.countRequests(now, 60 * 60 * 1000);
    const day = this.countRequests(now, 24 * 60 * 60 * 1000);
    const cost = this.calculateCostToday(now);

    return {
      minute: {
        used: minute,
        limit: this.config.maxRequestsPerMinute,
        percentage: Math.round((minute / this.config.maxRequestsPerMinute) * 100)
      },
      hour: {
        used: hour,
        limit: this.config.maxRequestsPerHour,
        percentage: Math.round((hour / this.config.maxRequestsPerHour) * 100)
      },
      day: {
        used: day,
        limit: this.config.maxRequestsPerDay,
        percentage: Math.round((day / this.config.maxRequestsPerDay) * 100)
      },
      cost: {
        used: cost,
        limit: this.config.maxCostPerDay,
        percentage: Math.round((cost / this.config.maxCostPerDay) * 100)
      }
    };
  }

  // Private methods

  private countRequests(now: number, windowMs: number): number {
    return this.requests.filter(t => now - t < windowMs).length;
  }

  private calculateCostToday(now: number): number {
    const oneDayMs = 24 * 60 * 60 * 1000;
    return this.costs
      .filter(c => now - c.timestamp < oneDayMs)
      .reduce((sum, c) => sum + c.cost, 0);
  }

  private cleanup(now: number): void {
    const oneDayMs = 24 * 60 * 60 * 1000;
    this.requests = this.requests.filter(t => now - t < oneDayMs);
    this.costs = this.costs.filter(c => now - c.timestamp < oneDayMs);
  }

  private getSecondsUntilMidnight(): number {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.floor((midnight.getTime() - now.getTime()) / 1000);
  }

  private async saveToStorage(): Promise<void> {
    try {
      await chrome.storage.local.set({
        [STORAGE_KEY]: {
          requests: this.requests.slice(-1000),
          costs: this.costs.slice(-500),
          config: this.config
        }
      });
    } catch (error) {
      console.error('Rate limiter save error:', error);
    }
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const stored = await chrome.storage.local.get(STORAGE_KEY);
      if (stored[STORAGE_KEY]) {
        const data = stored[STORAGE_KEY];
        this.requests = data.requests || [];
        this.costs = data.costs || [];
        this.config = data.config || DEFAULT_LIMITS;
      }
    } catch (error) {
      console.error('Rate limiter load error:', error);
    }
  }
}

/**
 * Rate limit middleware for AI calls
 */
export async function withRateLimit<T>(
  fn: () => Promise<T>,
  cost: number = 0
): Promise<T> {
  const limiter = RateLimiter.getInstance();
  const status = await limiter.checkLimit();

  if (!status.allowed) {
    throw new Error(
      `${status.reason}. Retry after ${status.retryAfter} seconds.`
    );
  }

  const result = await fn();
  await limiter.recordRequest(cost);

  return result;
}
