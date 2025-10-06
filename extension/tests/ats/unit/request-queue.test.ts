/**
 * Unit tests for LLM request queue
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequestQueue } from '../../background/request-queue';

describe('RequestQueue', () => {
  let queue: RequestQueue;

  beforeEach(() => {
    queue = new RequestQueue();
    vi.useFakeTimers();
  });

  it('should process requests one at a time per tab', async () => {
    const execOrder: number[] = [];
    
    const req1 = vi.fn(async () => {
      execOrder.push(1);
      await new Promise(resolve => setTimeout(resolve, 100));
      return 'result1';
    });

    const req2 = vi.fn(async () => {
      execOrder.push(2);
      return 'result2';
    });

    // Queue two requests for same tab
    const promise1 = queue.enqueue(1, req1);
    const promise2 = queue.enqueue(1, req2);

    // First request should start immediately
    await vi.advanceTimersByTimeAsync(0);
    expect(req1).toHaveBeenCalled();
    expect(req2).not.toHaveBeenCalled();

    // Complete first request
    await vi.advanceTimersByTimeAsync(100);
    await promise1;

    // Second request should start
    await vi.advanceTimersByTimeAsync(0);
    expect(req2).toHaveBeenCalled();

    await promise2;

    expect(execOrder).toEqual([1, 2]);
  });

  it('should handle concurrent requests for different tabs', async () => {
    const req1 = vi.fn(async () => 'result1');
    const req2 = vi.fn(async () => 'result2');

    // Queue requests for different tabs
    const promise1 = queue.enqueue(1, req1);
    const promise2 = queue.enqueue(2, req2);

    await vi.advanceTimersByTimeAsync(0);

    // Both should execute
    expect(req1).toHaveBeenCalled();
    expect(req2).toHaveBeenCalled();

    await Promise.all([promise1, promise2]);
  });

  it('should retry on rate limit errors', async () => {
    let attempts = 0;
    const req = vi.fn(async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error('429 rate limit exceeded');
      }
      return 'success';
    });

    const promise = queue.enqueue(1, req, 3);

    // First attempt
    await vi.advanceTimersByTimeAsync(0);
    expect(attempts).toBe(1);

    // First retry (1s backoff)
    await vi.advanceTimersByTimeAsync(1000);
    expect(attempts).toBe(2);

    // Second retry (2s backoff)
    await vi.advanceTimersByTimeAsync(2000);
    expect(attempts).toBe(3);

    const result = await promise;
    expect(result).toBe('success');
    expect(req).toHaveBeenCalledTimes(3);
  });

  it('should fail after max retries', async () => {
    const req = vi.fn(async () => {
      throw new Error('500 server error');
    });

    const promise = queue.enqueue(1, req, 2);

    // Initial + 2 retries
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(2000);

    await expect(promise).rejects.toThrow('500 server error');
    expect(req).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it('should cancel requests for closed tab', async () => {
    const req1 = vi.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return 'result';
    });

    const req2 = vi.fn(async () => 'result2');

    // Queue requests
    const promise1 = queue.enqueue(1, req1);
    const promise2 = queue.enqueue(1, req2);

    await vi.advanceTimersByTimeAsync(0);

    // Cancel tab 1
    queue.cancelTab(1);

    // Promises should reject
    await expect(promise1).rejects.toThrow('abort');
    await expect(promise2).rejects.toThrow('cancelled');
  });

  it('should report queue status', async () => {
    const req = vi.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return 'result';
    });

    // Queue multiple requests
    queue.enqueue(1, req);
    queue.enqueue(1, req);
    queue.enqueue(2, req);

    const status = queue.getStatus();
    
    expect(status.active).toBe(2); // One for tab 1, one for tab 2
    expect(status.queued).toBe(1); // One waiting for tab 1
    expect(status.byTab[1]).toBe(1);
  });

  it('should not retry non-retryable errors', async () => {
    const req = vi.fn(async () => {
      throw new Error('401 unauthorized');
    });

    const promise = queue.enqueue(1, req, 3);

    await vi.advanceTimersByTimeAsync(0);

    await expect(promise).rejects.toThrow('401 unauthorized');
    expect(req).toHaveBeenCalledTimes(1); // No retries
  });
});
