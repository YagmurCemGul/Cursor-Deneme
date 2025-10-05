/**
 * Smart Cache with Semantic Similarity
 * Intelligent caching with fuzzy matching and LRU eviction
 * 
 * @module smartCache
 * @description Advanced caching with semantic similarity matching
 */

import { logger } from './logger';

/**
 * Cache entry with metadata
 */
interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  size: number; // Estimated size in bytes
  importance: number; // 0-1, higher = more important
}

/**
 * Cache statistics
 */
export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  totalSize: number;
  hitRate: number;
  averageAccessTime: number;
}

/**
 * Cache configuration
 */
export interface SmartCacheConfig {
  maxSize?: number; // Maximum cache size in MB
  defaultTTL?: number; // Default TTL in milliseconds
  enableSemanticMatching?: boolean;
  similarityThreshold?: number; // 0-1
  evictionStrategy?: 'lru' | 'lfu' | 'importance';
}

/**
 * Smart Cache
 * Advanced caching with intelligent features
 */
export class SmartCache<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private config: Required<SmartCacheConfig>;
  private stats = {
    hits: 0,
    misses: 0,
    accessTimes: [] as number[]
  };
  private storageKey: string;

  constructor(storageKey: string = 'smart_cache', config: SmartCacheConfig = {}) {
    this.storageKey = storageKey;
    this.config = {
      maxSize: config.maxSize || 50, // 50 MB default
      defaultTTL: config.defaultTTL || 3600000, // 1 hour default
      enableSemanticMatching: config.enableSemanticMatching !== false,
      similarityThreshold: config.similarityThreshold || 0.85,
      evictionStrategy: config.evictionStrategy || 'importance'
    };

    this.loadFromStorage();
    logger.info(`Smart cache initialized: ${storageKey} (max: ${this.config.maxSize}MB)`);
  }

  /**
   * Get item from cache
   */
  get(key: string): T | null {
    const startTime = performance.now();
    
    // Try exact match first
    const entry = this.cache.get(key);
    
    if (entry) {
      // Check if expired
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        this.stats.misses++;
        return null;
      }

      // Update access metadata
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      entry.importance = this.calculateImportance(entry);

      this.stats.hits++;
      this.stats.accessTimes.push(performance.now() - startTime);
      
      logger.debug(`Cache hit (exact): ${key}`);
      return entry.value;
    }

    // Try semantic matching if enabled
    if (this.config.enableSemanticMatching) {
      const similar = this.findSimilar(key, this.config.similarityThreshold);
      if (similar) {
        this.stats.hits++;
        this.stats.accessTimes.push(performance.now() - startTime);
        logger.debug(`Cache hit (similar): ${key} -> ${similar.key}`);
        return similar.value;
      }
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Set item in cache
   */
  set(key: string, value: T, ttl?: number, importance?: number): void {
    // Calculate size
    const size = this.estimateSize(value);

    // Check if we need to evict
    while (this.getCurrentSize() + size > this.config.maxSize * 1024 * 1024) {
      this.evict();
    }

    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      accessCount: 0,
      lastAccessed: Date.now(),
      size,
      importance: importance || 0.5
    };

    this.cache.set(key, entry);
    this.saveToStorage();
    
    logger.debug(`Cache set: ${key} (${this.formatSize(size)})`);
  }

  /**
   * Get or generate (with caching)
   */
  async getOrGenerate(
    key: string,
    generator: () => Promise<T>,
    options?: {
      ttl?: number;
      importance?: number;
      enableSimilarityMatch?: boolean;
    }
  ): Promise<T> {
    // Try to get from cache
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Check similar if enabled
    if (options?.enableSimilarityMatch !== false && this.config.enableSemanticMatching) {
      const similar = this.findSimilar(key, this.config.similarityThreshold);
      if (similar) {
        logger.info(`Using similar cached result for: ${key}`);
        return similar.value;
      }
    }

    // Generate new value
    logger.debug(`Cache miss, generating: ${key}`);
    const value = await generator();

    // Cache it
    this.set(key, value, options?.ttl, options?.importance);

    return value;
  }

  /**
   * Find similar cache entry
   */
  findSimilar(key: string, threshold: number): CacheEntry<T> | null {
    let bestMatch: { entry: CacheEntry<T>; similarity: number } | null = null;

    for (const [cachedKey, entry] of this.cache.entries()) {
      // Skip expired entries
      if (this.isExpired(entry)) {
        continue;
      }

      const similarity = this.calculateSimilarity(key, cachedKey);
      
      if (similarity >= threshold) {
        if (!bestMatch || similarity > bestMatch.similarity) {
          bestMatch = { entry, similarity };
        }
      }
    }

    return bestMatch?.entry || null;
  }

  /**
   * Calculate similarity between two strings (Jaccard similarity)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    // Normalize strings
    const normalize = (str: string) => 
      str.toLowerCase().trim().replace(/\s+/g, ' ');
    
    const s1 = normalize(str1);
    const s2 = normalize(str2);

    // Exact match
    if (s1 === s2) return 1.0;

    // Create word sets
    const words1 = new Set(s1.split(/\s+/));
    const words2 = new Set(s2.split(/\s+/));

    // Calculate Jaccard similarity
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Calculate importance score for eviction
   */
  private calculateImportance(entry: CacheEntry<T>): number {
    const ageWeight = 0.3;
    const accessWeight = 0.4;
    const recencyWeight = 0.3;

    // Age score (newer is better)
    const age = Date.now() - entry.timestamp;
    const maxAge = this.config.defaultTTL;
    const ageScore = 1 - Math.min(age / maxAge, 1);

    // Access frequency score
    const maxAccess = Math.max(...Array.from(this.cache.values()).map(e => e.accessCount));
    const accessScore = maxAccess > 0 ? entry.accessCount / maxAccess : 0;

    // Recency score (recently accessed is better)
    const recency = Date.now() - entry.lastAccessed;
    const maxRecency = maxAge;
    const recencyScore = 1 - Math.min(recency / maxRecency, 1);

    return (
      ageScore * ageWeight +
      accessScore * accessWeight +
      recencyScore * recencyWeight
    );
  }

  /**
   * Evict cache entry based on strategy
   */
  private evict(): void {
    if (this.cache.size === 0) return;

    let toEvict: string | null = null;

    switch (this.config.evictionStrategy) {
      case 'lru':
        // Evict least recently used
        toEvict = this.findLRU();
        break;
      
      case 'lfu':
        // Evict least frequently used
        toEvict = this.findLFU();
        break;
      
      case 'importance':
      default:
        // Evict least important
        toEvict = this.findLeastImportant();
        break;
    }

    if (toEvict) {
      const entry = this.cache.get(toEvict);
      this.cache.delete(toEvict);
      logger.debug(`Evicted cache entry: ${toEvict} (${this.formatSize(entry?.size || 0)})`);
    }
  }

  /**
   * Find least recently used entry
   */
  private findLRU(): string | null {
    let oldest: { key: string; time: number } | null = null;

    for (const [key, entry] of this.cache.entries()) {
      if (!oldest || entry.lastAccessed < oldest.time) {
        oldest = { key, time: entry.lastAccessed };
      }
    }

    return oldest?.key || null;
  }

  /**
   * Find least frequently used entry
   */
  private findLFU(): string | null {
    let leastUsed: { key: string; count: number } | null = null;

    for (const [key, entry] of this.cache.entries()) {
      if (!leastUsed || entry.accessCount < leastUsed.count) {
        leastUsed = { key, count: entry.accessCount };
      }
    }

    return leastUsed?.key || null;
  }

  /**
   * Find least important entry
   */
  private findLeastImportant(): string | null {
    let least: { key: string; importance: number } | null = null;

    for (const [key, entry] of this.cache.entries()) {
      const importance = this.calculateImportance(entry);
      if (!least || importance < least.importance) {
        least = { key, importance };
      }
    }

    return least?.key || null;
  }

  /**
   * Estimate size of value in bytes
   */
  private estimateSize(value: any): number {
    const json = JSON.stringify(value);
    return new Blob([json]).size;
  }

  /**
   * Get current cache size in bytes
   */
  private getCurrentSize(): number {
    return Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.size, 0);
  }

  /**
   * Format size for display
   */
  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
    this.saveToStorage();
    logger.info('Cache cleared');
  }

  /**
   * Delete specific entry
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.saveToStorage();
      logger.debug(`Cache entry deleted: ${key}`);
    }
    return deleted;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
    const avgAccessTime = this.stats.accessTimes.length > 0
      ? this.stats.accessTimes.reduce((sum, t) => sum + t, 0) / this.stats.accessTimes.length
      : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      totalSize: this.getCurrentSize(),
      hitRate,
      averageAccessTime: avgAccessTime
    };
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): number {
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.saveToStorage();
      logger.debug(`Cleaned ${cleaned} expired cache entries`);
    }

    return cleaned;
  }

  /**
   * Warm cache with common items
   */
  async warmCache(items: Array<{ key: string; generator: () => Promise<T>; importance?: number }>): Promise<void> {
    logger.info(`Warming cache with ${items.length} items`);
    
    for (const item of items) {
      try {
        await this.getOrGenerate(item.key, item.generator, { importance: item.importance });
      } catch (error) {
        logger.error(`Failed to warm cache for ${item.key}:`, error);
      }
    }
  }

  /**
   * Load cache from storage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.cache = new Map(data.cache || []);
        this.stats = data.stats || this.stats;
        
        // Clean expired entries on load
        this.cleanExpired();
        
        logger.debug(`Loaded ${this.cache.size} cache entries from storage`);
      }
    } catch (error) {
      logger.error('Failed to load cache from storage:', error);
      this.cache.clear();
    }
  }

  /**
   * Save cache to storage
   */
  private saveToStorage(): void {
    try {
      const data = {
        cache: Array.from(this.cache.entries()),
        stats: this.stats
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      logger.error('Failed to save cache to storage:', error);
    }
  }
}

/**
 * Generate cache key from parameters
 */
export function generateCacheKey(prefix: string, ...params: any[]): string {
  const normalized = params.map(p => {
    if (typeof p === 'string') {
      return p.toLowerCase().trim();
    }
    return JSON.stringify(p);
  });
  
  return `${prefix}:${normalized.join(':')}`;
}

/**
 * Global cache instances
 */
const caches = new Map<string, SmartCache>();

/**
 * Get or create cache instance
 */
export function getCache<T = any>(name: string, config?: SmartCacheConfig): SmartCache<T> {
  if (!caches.has(name)) {
    caches.set(name, new SmartCache<T>(name, config));
  }
  return caches.get(name) as SmartCache<T>;
}

/**
 * Default caches
 */
export const cvOptimizationCache = getCache('cv_optimization', {
  maxSize: 30,
  defaultTTL: 3600000, // 1 hour
  enableSemanticMatching: true,
  similarityThreshold: 0.85
});

export const coverLetterCache = getCache('cover_letter', {
  maxSize: 20,
  defaultTTL: 1800000, // 30 minutes
  enableSemanticMatching: true,
  similarityThreshold: 0.9
});
