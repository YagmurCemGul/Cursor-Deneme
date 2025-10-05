/**
 * Smart Request Queue Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SmartRequestQueue, getGlobalQueue } from '../smartRequestQueue';
import { getRateLimitTracker } from '../rateLimitTracker';

// Mock rate limit tracker
vi.mock('../rateLimitTracker', () => ({
  getRateLimitTracker: vi.fn(() => ({
    getWaitTime: vi.fn(() => 0),
    recordRequest: vi.fn()
  }))
}));

describe('SmartRequestQueue', () => {
  let queue: SmartRequestQueue;

  beforeEach(() => {
    queue = new SmartRequestQueue(1, 100);
    vi.clearAllMocks();
  });

  describe('Basic Queuing', () => {
    it('should execute requests in order', async () => {
      const results: number[] = [];
      
      const promises = [
        queue.enqueue(async () => { results.push(1); return 1; }),
        queue.enqueue(async () => { results.push(2); return 2; }),
        queue.enqueue(async () => { results.push(3); return 3; })
      ];

      await Promise.all(promises);

      expect(results).toEqual([1, 2, 3]);
    });

    it('should return correct results', async () => {
      const result1 = queue.enqueue(async () => 'hello');
      const result2 = queue.enqueue(async () => 42);

      expect(await result1).toBe('hello');
      expect(await result2).toBe(42);
    });

    it('should handle errors correctly', async () => {
      const error = new Error('Test error');
      
      await expect(
        queue.enqueue(async () => { throw error; })
      ).rejects.toThrow('Test error');
    });
  });

  describe('Priority Queuing', () => {
    it('should prioritize high priority requests', async () => {
      const results: string[] = [];

      // Add requests in low -> normal -> high order
      const lowPromise = queue.enqueue(
        async () => { results.push('low'); return 'low'; },
        { priority: 'low' }
      );
      
      const normalPromise = queue.enqueue(
        async () => { results.push('normal'); return 'normal'; },
        { priority: 'normal' }
      );
      
      const highPromise = queue.enqueue(
        async () => { results.push('high'); return 'high'; },
        { priority: 'high' }
      );

      await Promise.all([lowPromise, normalPromise, highPromise]);

      // First request (low) executes first, then high priority jumps ahead
      expect(results[0]).toBe('low');
      expect(results[1]).toBe('high');
      expect(results[2]).toBe('normal');
    });
  });

  describe('Retry Logic', () => {
    it('should retry on retryable errors', async () => {
      let attempts = 0;
      
      const result = await queue.enqueue(
        async () => {
          attempts++;
          if (attempts < 3) {
            throw new Error('Rate limit exceeded (429)');
          }
          return 'success';
        },
        { maxRetries: 3 }
      );

      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('should not retry on non-retryable errors', async () => {
      let attempts = 0;
      
      await expect(
        queue.enqueue(
          async () => {
            attempts++;
            throw new Error('Invalid API key');
          },
          { maxRetries: 3 }
        )
      ).rejects.toThrow('Invalid API key');

      expect(attempts).toBe(1);
    });
  });

  describe('Queue Statistics', () => {
    it('should track queue statistics', async () => {
      const stats1 = queue.getStats();
      expect(stats1.pending).toBe(0);
      expect(stats1.completed).toBe(0);

      // Add some requests
      await queue.enqueue(async () => 'done');
      await queue.enqueue(async () => 'done');

      const stats2 = queue.getStats();
      expect(stats2.completed).toBe(2);
    });

    it('should calculate average wait time', async () => {
      await queue.enqueue(async () => 'done');
      await queue.enqueue(async () => 'done');
      
      const stats = queue.getStats();
      expect(stats.averageWaitTime).toBeGreaterThan(0);
    });
  });

  describe('Queue Management', () => {
    it('should clear queue', async () => {
      const promise1 = queue.enqueue(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'done';
      });

      // Clear while first request is processing
      queue.clear();

      expect(queue.size()).toBe(0);
      
      // First request should still complete
      await expect(promise1).resolves.toBe('done');
    });

    it('should pause and resume', async () => {
      let executed = false;

      const promise = queue.enqueue(async () => {
        executed = true;
        return 'done';
      });

      queue.pause();
      
      // Give it time to try to execute
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Should not have executed while paused
      expect(executed).toBe(false);

      queue.resume();
      await promise;
      
      expect(executed).toBe(true);
    });
  });

  describe('Progress Callback', () => {
    it('should call progress callback', async () => {
      const progressStates: string[] = [];

      await queue.enqueue(
        async () => 'done',
        {
          onProgress: (progress) => {
            progressStates.push(progress.status);
          }
        }
      );

      expect(progressStates).toContain('queued');
      expect(progressStates).toContain('processing');
      expect(progressStates).toContain('completed');
    });
  });

  describe('Global Queue', () => {
    it('should return same global instance', () => {
      const queue1 = getGlobalQueue();
      const queue2 = getGlobalQueue();
      
      expect(queue1).toBe(queue2);
    });
  });
});
