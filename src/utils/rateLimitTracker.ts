/**
 * Rate Limit Tracker
 * Tracks API usage and prevents hitting rate limits before they happen
 * 
 * @module rateLimitTracker
 * @description Client-side rate limit tracking with tier-based limits
 */

import { logger } from './logger';

/**
 * OpenAI API Tiers and their limits
 * @see https://platform.openai.com/docs/guides/rate-limits
 */
export interface RateLimitTier {
  name: string;
  rpm: number; // Requests per minute
  rpd: number; // Requests per day
  tpm: number; // Tokens per minute
  tpd: number; // Tokens per day
}

/**
 * Predefined tier configurations
 */
export const RATE_LIMIT_TIERS: Record<string, RateLimitTier> = {
  'free': {
    name: 'Free Tier',
    rpm: 3,
    rpd: 200,
    tpm: 40000,
    tpd: 150000
  },
  'tier-1': {
    name: 'Tier 1 ($5+ paid)',
    rpm: 60,
    rpd: 1500,
    tpm: 60000,
    tpd: 2000000
  },
  'tier-2': {
    name: 'Tier 2',
    rpm: 5000,
    rpd: 10000,
    tpm: 450000,
    tpd: 10000000
  },
  'tier-3': {
    name: 'Tier 3',
    rpm: 10000,
    rpd: 20000,
    tpm: 600000,
    tpd: 20000000
  },
  'tier-4': {
    name: 'Tier 4',
    rpm: 30000,
    rpd: 100000,
    tpm: 1000000,
    tpd: 100000000
  }
};

/**
 * Request record for tracking
 */
interface RequestRecord {
  timestamp: number;
  tokens: number;
  provider: string;
}

/**
 * Usage statistics
 */
export interface UsageStats {
  currentRpm: number;
  currentTpm: number;
  currentRpd: number;
  currentTpd: number;
  maxRpm: number;
  maxTpm: number;
  maxRpd: number;
  maxTpd: number;
  rpmUsagePercent: number;
  tpmUsagePercent: number;
  rpdUsagePercent: number;
  tpdUsagePercent: number;
  canMakeRequest: boolean;
  waitTimeMs: number;
  nextResetTime: number;
}

/**
 * Rate limit warning levels
 */
export type WarningLevel = 'safe' | 'warning' | 'critical' | 'exceeded';

/**
 * Rate Limit Tracker
 * Tracks requests in sliding windows and predicts rate limit issues
 */
export class RateLimitTracker {
  private requestHistory: RequestRecord[] = [];
  private tier: RateLimitTier;
  private provider: string;
  private storageKey: string;

  /**
   * Constructor
   * @param provider Provider name (e.g., 'openai', 'gemini', 'claude')
   * @param tierName Tier name (default: 'free')
   */
  constructor(provider: string = 'openai', tierName: string = 'free') {
    this.provider = provider;
    this.tier = RATE_LIMIT_TIERS[tierName] || RATE_LIMIT_TIERS['free'];
    this.storageKey = `rate_limit_${provider}`;
    
    // Load history from storage
    this.loadHistory();
    
    logger.info(`Rate limit tracker initialized for ${provider} (${this.tier.name})`);
  }

  /**
   * Set tier for the provider
   */
  setTier(tierName: string): void {
    const tier = RATE_LIMIT_TIERS[tierName];
    if (!tier) {
      logger.error(`Unknown tier: ${tierName}`);
      return;
    }
    
    this.tier = tier;
    logger.info(`Rate limit tier updated: ${this.tier.name}`);
  }

  /**
   * Record a request
   */
  recordRequest(tokens: number = 1000): void {
    const record: RequestRecord = {
      timestamp: Date.now(),
      tokens,
      provider: this.provider
    };
    
    this.requestHistory.push(record);
    this.saveHistory();
    this.cleanOldRecords();
    
    logger.debug(`Request recorded: ${tokens} tokens`);
  }

  /**
   * Check if we can make a request now
   */
  canMakeRequest(estimatedTokens: number = 1000): boolean {
    this.cleanOldRecords();
    
    const stats = this.getUsageStats();
    
    // Check RPM limit
    const wouldExceedRpm = (stats.currentRpm + 1) > this.tier.rpm;
    
    // Check TPM limit
    const wouldExceedTpm = (stats.currentTpm + estimatedTokens) > this.tier.tpm;
    
    // Check RPD limit
    const wouldExceedRpd = (stats.currentRpd + 1) > this.tier.rpd;
    
    // Check TPD limit
    const wouldExceedTpd = (stats.currentTpd + estimatedTokens) > this.tier.tpd;
    
    return !wouldExceedRpm && !wouldExceedTpm && !wouldExceedRpd && !wouldExceedTpd;
  }

  /**
   * Get suggested wait time in milliseconds
   */
  getWaitTime(estimatedTokens: number = 1000): number {
    this.cleanOldRecords();
    
    if (this.canMakeRequest(estimatedTokens)) {
      return 0;
    }
    
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    
    // Find oldest request in last minute
    const oldestInMinute = this.requestHistory
      .filter(r => r.timestamp > oneMinuteAgo)
      .sort((a, b) => a.timestamp - b.timestamp)[0];
    
    if (oldestInMinute) {
      const waitTime = (oldestInMinute.timestamp + 60 * 1000) - now;
      return Math.max(0, waitTime);
    }
    
    // If daily limit exceeded, calculate wait until next day
    const oldestInDay = this.requestHistory
      .filter(r => r.timestamp > oneDayAgo)
      .sort((a, b) => a.timestamp - b.timestamp)[0];
    
    if (oldestInDay) {
      const waitTime = (oldestInDay.timestamp + 24 * 60 * 60 * 1000) - now;
      return Math.max(0, waitTime);
    }
    
    return 0;
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): UsageStats {
    this.cleanOldRecords();
    
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    
    // Calculate current usage
    const lastMinuteRequests = this.requestHistory.filter(r => r.timestamp > oneMinuteAgo);
    const lastDayRequests = this.requestHistory.filter(r => r.timestamp > oneDayAgo);
    
    const currentRpm = lastMinuteRequests.length;
    const currentTpm = lastMinuteRequests.reduce((sum, r) => sum + r.tokens, 0);
    const currentRpd = lastDayRequests.length;
    const currentTpd = lastDayRequests.reduce((sum, r) => sum + r.tokens, 0);
    
    // Calculate percentages
    const rpmUsagePercent = (currentRpm / this.tier.rpm) * 100;
    const tpmUsagePercent = (currentTpm / this.tier.tpm) * 100;
    const rpdUsagePercent = (currentRpd / this.tier.rpd) * 100;
    const tpdUsagePercent = (currentTpd / this.tier.tpd) * 100;
    
    // Find next reset time
    const oldestInMinute = lastMinuteRequests[0];
    const nextResetTime = oldestInMinute 
      ? oldestInMinute.timestamp + 60 * 1000 
      : now;
    
    return {
      currentRpm,
      currentTpm,
      currentRpd,
      currentTpd,
      maxRpm: this.tier.rpm,
      maxTpm: this.tier.tpm,
      maxRpd: this.tier.rpd,
      maxTpd: this.tier.tpd,
      rpmUsagePercent,
      tpmUsagePercent,
      rpdUsagePercent,
      tpdUsagePercent,
      canMakeRequest: this.canMakeRequest(),
      waitTimeMs: this.getWaitTime(),
      nextResetTime
    };
  }

  /**
   * Get warning level based on usage
   */
  getWarningLevel(): WarningLevel {
    const stats = this.getUsageStats();
    const maxUsage = Math.max(
      stats.rpmUsagePercent,
      stats.tpmUsagePercent,
      stats.rpdUsagePercent,
      stats.tpdUsagePercent
    );
    
    if (maxUsage >= 100) return 'exceeded';
    if (maxUsage >= 90) return 'critical';
    if (maxUsage >= 75) return 'warning';
    return 'safe';
  }

  /**
   * Get warning message
   */
  getWarningMessage(): string | null {
    const level = this.getWarningLevel();
    const stats = this.getUsageStats();
    
    switch (level) {
      case 'exceeded':
        return `Rate limit exceeded! Please wait ${Math.ceil(stats.waitTimeMs / 1000)} seconds.`;
      case 'critical':
        return `Rate limit critical (>90%)! Next request may fail.`;
      case 'warning':
        return `Rate limit warning (>75%). Consider slowing down requests.`;
      case 'safe':
      default:
        return null;
    }
  }

  /**
   * Clean old records (older than 24 hours)
   */
  private cleanOldRecords(): void {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const before = this.requestHistory.length;
    
    this.requestHistory = this.requestHistory.filter(
      r => r.timestamp > oneDayAgo
    );
    
    const removed = before - this.requestHistory.length;
    if (removed > 0) {
      logger.debug(`Cleaned ${removed} old request records`);
      this.saveHistory();
    }
  }

  /**
   * Load history from storage
   */
  private loadHistory(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.requestHistory = JSON.parse(stored);
        logger.debug(`Loaded ${this.requestHistory.length} request records from storage`);
      }
    } catch (error) {
      logger.error('Failed to load rate limit history:', error);
      this.requestHistory = [];
    }
  }

  /**
   * Save history to storage
   */
  private saveHistory(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.requestHistory));
    } catch (error) {
      logger.error('Failed to save rate limit history:', error);
    }
  }

  /**
   * Reset history (for testing or manual reset)
   */
  reset(): void {
    this.requestHistory = [];
    this.saveHistory();
    logger.info('Rate limit history reset');
  }

  /**
   * Get tier info
   */
  getTierInfo(): RateLimitTier {
    return { ...this.tier };
  }
}

/**
 * Global rate limit trackers for each provider
 */
const trackers = new Map<string, RateLimitTracker>();

/**
 * Get or create tracker for a provider
 */
export function getRateLimitTracker(
  provider: string = 'openai',
  tier?: string
): RateLimitTracker {
  const key = `${provider}-${tier || 'free'}`;
  
  if (!trackers.has(key)) {
    trackers.set(key, new RateLimitTracker(provider, tier));
  }
  
  return trackers.get(key)!;
}

/**
 * Helper to check rate limit before making a request
 */
export async function checkRateLimit(
  provider: string,
  estimatedTokens: number = 1000
): Promise<{ allowed: boolean; waitTimeMs: number; warning?: string }> {
  const tracker = getRateLimitTracker(provider);
  const allowed = tracker.canMakeRequest(estimatedTokens);
  const waitTimeMs = tracker.getWaitTime(estimatedTokens);
  const warning = tracker.getWarningMessage();
  
  return { allowed, waitTimeMs, warning };
}

/**
 * Helper to wait for rate limit if needed
 */
export async function waitForRateLimit(
  provider: string,
  estimatedTokens: number = 1000,
  onWait?: (waitTimeMs: number) => void
): Promise<void> {
  const tracker = getRateLimitTracker(provider);
  const waitTimeMs = tracker.getWaitTime(estimatedTokens);
  
  if (waitTimeMs > 0) {
    logger.info(`Rate limit: waiting ${waitTimeMs}ms before request`);
    
    if (onWait) {
      onWait(waitTimeMs);
    }
    
    await new Promise(resolve => setTimeout(resolve, waitTimeMs));
  }
}
