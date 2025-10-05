/**
 * AI Response Caching Layer
 * Reduces API costs and improves response time
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  hits: number;
}

export interface CacheStats {
  totalEntries: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  memorySaved: number;
  costSaved: number;
}

const CACHE_KEY = 'ai_response_cache';
const CACHE_STATS_KEY = 'ai_cache_stats';

/**
 * AI Cache Manager
 */
export class AICache {
  private static instance: AICache;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private stats = { hits: 0, misses: 0, costSaved: 0 };

  static getInstance(): AICache {
    if (!AICache.instance) {
      AICache.instance = new AICache();
      AICache.instance.loadFromStorage();
    }
    return AICache.instance;
  }

  /**
   * Get cached response
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      await this.saveToStorage();
      return null;
    }

    // Update hits
    entry.hits++;
    this.stats.hits++;
    await this.saveToStorage();
    
    return entry.data as T;
  }

  /**
   * Set cache entry
   */
  async set<T>(key: string, data: T, ttlMinutes: number = 60): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + (ttlMinutes * 60 * 1000),
      hits: 0
    };

    this.cache.set(key, entry);
    await this.saveToStorage();
  }

  /**
   * Clear expired entries
   */
  async cleanup(): Promise<number> {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      await this.saveToStorage();
    }

    return removed;
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, costSaved: 0 };
    await this.saveToStorage();
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    
    // Estimate: each hit saves ~$0.002 (average API call cost)
    const costSaved = this.stats.hits * 0.002;

    return {
      totalEntries: this.cache.size,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      hitRate: Math.round(hitRate * 10) / 10,
      memorySaved: this.cache.size,
      costSaved: Math.round(costSaved * 100) / 100
    };
  }

  /**
   * Save to Chrome storage
   */
  private async saveToStorage(): Promise<void> {
    try {
      const cacheData = Array.from(this.cache.entries());
      await chrome.storage.local.set({
        [CACHE_KEY]: cacheData,
        [CACHE_STATS_KEY]: this.stats
      });
    } catch (error) {
      console.error('Cache save error:', error);
    }
  }

  /**
   * Load from Chrome storage
   */
  private async loadFromStorage(): Promise<void> {
    try {
      const stored = await chrome.storage.local.get([CACHE_KEY, CACHE_STATS_KEY]);
      
      if (stored[CACHE_KEY]) {
        this.cache = new Map(stored[CACHE_KEY]);
      }
      
      if (stored[CACHE_STATS_KEY]) {
        this.stats = stored[CACHE_STATS_KEY];
      }

      // Cleanup expired entries
      await this.cleanup();
    } catch (error) {
      console.error('Cache load error:', error);
    }
  }
}

/**
 * Generate cache key from prompt
 */
export function generateCacheKey(systemPrompt: string, userPrompt: string, model: string): string {
  const combined = `${model}:${systemPrompt}:${userPrompt}`;
  return hashString(combined);
}

/**
 * Simple string hash function
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Cache decorator for AI functions
 */
export function cachedAICall<T>(
  ttlMinutes: number = 60
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]): Promise<T> {
      const cache = AICache.getInstance();
      const cacheKey = generateCacheKey(
        JSON.stringify(args),
        propertyName,
        'default'
      );

      // Try cache first
      const cached = await cache.get<T>(cacheKey);
      if (cached) {
        console.log(`[Cache HIT] ${propertyName}`);
        return cached;
      }

      // Call original method
      console.log(`[Cache MISS] ${propertyName}`);
      const result = await originalMethod.apply(this, args);

      // Store in cache
      await cache.set(cacheKey, result, ttlMinutes);

      return result;
    };

    return descriptor;
  };
}
