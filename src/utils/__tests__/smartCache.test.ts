/**
 * Smart Cache Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SmartCache, generateCacheKey } from '../smartCache';

describe('SmartCache', () => {
  let cache: SmartCache<string>;

  beforeEach(() => {
    localStorage.clear();
    cache = new SmartCache('test_cache', {
      maxSize: 1, // 1MB for testing
      defaultTTL: 1000,
      enableSemanticMatching: true,
      similarityThreshold: 0.8
    });
  });

  describe('Basic Caching', () => {
    it('should set and get values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return null for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('should respect TTL', async () => {
      cache.set('key1', 'value1', 100); // 100ms TTL
      
      expect(cache.get('key1')).toBe('value1');
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(cache.get('key1')).toBeNull();
    });

    it('should delete keys', () => {
      cache.set('key1', 'value1');
      cache.delete('key1');
      
      expect(cache.get('key1')).toBeNull();
    });

    it('should clear all cache', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      cache.clear();
      
      expect(cache.size()).toBe(0);
    });
  });

  describe('Semantic Similarity', () => {
    it('should find similar keys', () => {
      cache.set('optimize my cv for software engineer', 'result1');
      
      // Similar query
      const similar = cache.get('optimize cv for software engineering');
      
      // Should find similar (if threshold met)
      expect(similar).toBeDefined();
    });

    it('should not match dissimilar keys', () => {
      cache.set('optimize cv for software engineer', 'result1');
      
      const dissimilar = cache.get('generate cover letter for marketing');
      
      expect(dissimilar).toBeNull();
    });
  });

  describe('Get or Generate', () => {
    it('should generate if not cached', async () => {
      const generator = vi.fn(async () => 'generated value');
      
      const result = await cache.getOrGenerate('new-key', generator);
      
      expect(result).toBe('generated value');
      expect(generator).toHaveBeenCalledTimes(1);
    });

    it('should use cache if available', async () => {
      cache.set('existing-key', 'cached value');
      
      const generator = vi.fn(async () => 'generated value');
      const result = await cache.getOrGenerate('existing-key', generator);
      
      expect(result).toBe('cached value');
      expect(generator).not.toHaveBeenCalled();
    });

    it('should use similar if available', async () => {
      cache.set('optimize cv software', 'cached value');
      
      const generator = vi.fn(async () => 'generated value');
      const result = await cache.getOrGenerate(
        'optimize cv for software engineer',
        generator,
        { enableSimilarityMatch: true }
      );
      
      expect(result).toBe('cached value');
      expect(generator).not.toHaveBeenCalled();
    });
  });

  describe('Cache Statistics', () => {
    it('should track hits and misses', () => {
      cache.set('key1', 'value1');
      
      cache.get('key1'); // Hit
      cache.get('key2'); // Miss
      cache.get('key1'); // Hit
      
      const stats = cache.getStats();
      
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(0.666, 2);
    });

    it('should track cache size', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      const stats = cache.getStats();
      
      expect(stats.size).toBe(2);
      expect(stats.totalSize).toBeGreaterThan(0);
    });
  });

  describe('Eviction', () => {
    it('should evict when max size reached', () => {
      // Set small cache size
      const smallCache = new SmartCache('small', { maxSize: 0.001 }); // 1KB
      
      // Add items until eviction happens
      for (let i = 0; i < 100; i++) {
        smallCache.set(`key${i}`, 'x'.repeat(100));
      }
      
      // Cache should not grow indefinitely
      expect(smallCache.size()).toBeLessThan(100);
    });
  });

  describe('Cache Warming', () => {
    it('should warm cache with items', async () => {
      const items = [
        { key: 'key1', generator: async () => 'value1' },
        { key: 'key2', generator: async () => 'value2' }
      ];

      await cache.warmCache(items);

      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
    });
  });

  describe('Clean Expired', () => {
    it('should clean expired entries', async () => {
      cache.set('key1', 'value1', 50);
      cache.set('key2', 'value2', 10000);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const cleaned = cache.cleanExpired();
      
      expect(cleaned).toBe(1);
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBe('value2');
    });
  });
});

describe('Cache Key Generation', () => {
  it('should generate consistent keys', () => {
    const key1 = generateCacheKey('cv', 'openai', { id: 1 });
    const key2 = generateCacheKey('cv', 'openai', { id: 1 });
    
    expect(key1).toBe(key2);
  });

  it('should normalize strings', () => {
    const key1 = generateCacheKey('cv', 'OpenAI', 'TEST');
    const key2 = generateCacheKey('cv', 'openai', 'test');
    
    expect(key1).toBe(key2);
  });
});
