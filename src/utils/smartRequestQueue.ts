/**
 * Smart Request Queue
 * Automatically queues and schedules API requests to avoid rate limits
 * 
 * @module smartRequestQueue
 * @description Intelligent request queuing with rate limit awareness
 */

import { logger } from './logger';
import { getRateLimitTracker, waitForRateLimit } from './rateLimitTracker';

/**
 * Request priority levels
 */
export type RequestPriority = 'high' | 'normal' | 'low';

/**
 * Queued request
 */
interface QueuedRequest<T> {
  id: string;
  request: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
  priority: RequestPriority;
  provider: string;
  estimatedTokens: number;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

/**
 * Queue statistics
 */
export interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  averageWaitTime: number;
  estimatedWaitTime: number;
}

/**
 * Progress callback
 */
export interface QueueProgress {
  status: 'queued' | 'processing' | 'waiting' | 'completed' | 'failed';
  message: string;
  position?: number;
  totalInQueue?: number;
  waitTimeMs?: number;
  progress?: number;
}

/**
 * Smart Request Queue
 * Manages API requests with rate limit awareness
 */
export class SmartRequestQueue {
  private queue: QueuedRequest<any>[] = [];
  private processing: boolean = false;
  private stats = {
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0
  };
  private waitTimes: number[] = [];
  private maxConcurrent: number = 1;
  private minDelayMs: number = 1000;
  private activeRequests: number = 0;

  /**
   * Constructor
   * @param maxConcurrent Maximum concurrent requests (default: 1)
   * @param minDelayMs Minimum delay between requests in ms (default: 1000)
   */
  constructor(maxConcurrent: number = 1, minDelayMs: number = 1000) {
    this.maxConcurrent = maxConcurrent;
    this.minDelayMs = minDelayMs;
    
    logger.info(`Smart request queue initialized (max concurrent: ${maxConcurrent}, min delay: ${minDelayMs}ms)`);
  }

  /**
   * Enqueue a request
   */
  async enqueue<T>(
    request: () => Promise<T>,
    options: {
      priority?: RequestPriority;
      provider?: string;
      estimatedTokens?: number;
      maxRetries?: number;
      onProgress?: (progress: QueueProgress) => void;
    } = {}
  ): Promise<T> {
    const {
      priority = 'normal',
      provider = 'openai',
      estimatedTokens = 1000,
      maxRetries = 2,
      onProgress
    } = options;

    return new Promise<T>((resolve, reject) => {
      const id = this.generateId();
      const queuedRequest: QueuedRequest<T> = {
        id,
        request,
        resolve,
        reject,
        priority,
        provider,
        estimatedTokens,
        timestamp: Date.now(),
        retries: 0,
        maxRetries
      };

      // Add to queue
      this.queue.push(queuedRequest);
      this.stats.pending++;
      
      // Sort by priority
      this.sortQueue();

      logger.info(`Request ${id} queued (priority: ${priority}, queue size: ${this.queue.length})`);

      // Notify progress
      if (onProgress) {
        const position = this.queue.findIndex(r => r.id === id) + 1;
        onProgress({
          status: 'queued',
          message: `Request queued at position ${position}`,
          position,
          totalInQueue: this.queue.length
        });
      }

      // Start processing
      this.processQueue(onProgress).catch(error => {
        logger.error('Queue processing error:', error);
      });
    });
  }

  /**
   * Process the queue
   */
  private async processQueue(onProgress?: (progress: QueueProgress) => void): Promise<void> {
    // Prevent multiple processors
    if (this.processing) {
      return;
    }

    this.processing = true;

    try {
      while (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
        const item = this.queue.shift();
        if (!item) break;

        this.stats.pending--;
        this.activeRequests++;
        
        // Process item (don't await, allow concurrent processing)
        this.processItem(item, onProgress)
          .finally(() => {
            this.activeRequests--;
            // Continue processing queue
            this.processQueue(onProgress).catch(logger.error);
          });

        // Add minimum delay between queue pops
        if (this.queue.length > 0) {
          await this.delay(this.minDelayMs);
        }
      }
    } finally {
      if (this.queue.length === 0 && this.activeRequests === 0) {
        this.processing = false;
      }
    }
  }

  /**
   * Process a single queued item
   */
  private async processItem<T>(
    item: QueuedRequest<T>,
    onProgress?: (progress: QueueProgress) => void
  ): Promise<void> {
    const startTime = Date.now();

    try {
      this.stats.processing++;

      // Check rate limit
      const tracker = getRateLimitTracker(item.provider);
      const waitTimeMs = tracker.getWaitTime(item.estimatedTokens);

      if (waitTimeMs > 0) {
        logger.info(`Request ${item.id} waiting ${waitTimeMs}ms for rate limit`);
        
        if (onProgress) {
          onProgress({
            status: 'waiting',
            message: `Waiting ${Math.ceil(waitTimeMs / 1000)}s for rate limit...`,
            waitTimeMs,
            progress: 0
          });
        }

        await this.delay(waitTimeMs);
      }

      // Notify processing
      if (onProgress) {
        onProgress({
          status: 'processing',
          message: 'Processing request...',
          progress: 50
        });
      }

      // Execute request
      logger.debug(`Executing request ${item.id}`);
      const result = await item.request();

      // Record request for rate limiting
      tracker.recordRequest(item.estimatedTokens);

      // Calculate wait time
      const waitTime = Date.now() - startTime;
      this.waitTimes.push(waitTime);
      if (this.waitTimes.length > 100) {
        this.waitTimes.shift(); // Keep last 100
      }

      this.stats.processing--;
      this.stats.completed++;

      logger.info(`Request ${item.id} completed in ${waitTime}ms`);

      // Notify completion
      if (onProgress) {
        onProgress({
          status: 'completed',
          message: 'Request completed successfully',
          progress: 100
        });
      }

      item.resolve(result);
    } catch (error: any) {
      this.stats.processing--;

      // Check if we should retry
      if (item.retries < item.maxRetries && this.shouldRetry(error)) {
        item.retries++;
        logger.warn(`Request ${item.id} failed, retry ${item.retries}/${item.maxRetries}`);
        
        // Re-queue with exponential backoff
        const backoffDelay = Math.min(1000 * Math.pow(2, item.retries), 30000);
        await this.delay(backoffDelay);
        
        this.queue.unshift(item); // Add to front of queue
        this.stats.pending++;
        
        if (onProgress) {
          onProgress({
            status: 'waiting',
            message: `Retrying (${item.retries}/${item.maxRetries})...`,
            waitTimeMs: backoffDelay
          });
        }
      } else {
        this.stats.failed++;
        logger.error(`Request ${item.id} failed permanently:`, error);
        
        if (onProgress) {
          onProgress({
            status: 'failed',
            message: error.message || 'Request failed'
          });
        }
        
        item.reject(error);
      }
    }
  }

  /**
   * Check if error is retryable
   */
  private shouldRetry(error: any): boolean {
    const message = error.message?.toLowerCase() || '';
    
    // Retry on rate limit, timeout, or server errors
    return (
      message.includes('rate limit') ||
      message.includes('429') ||
      message.includes('timeout') ||
      message.includes('503') ||
      message.includes('502') ||
      message.includes('temporarily unavailable')
    );
  }

  /**
   * Sort queue by priority
   */
  private sortQueue(): void {
    const priorityWeight = {
      'high': 3,
      'normal': 2,
      'low': 1
    };

    this.queue.sort((a, b) => {
      // First by priority
      const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by timestamp (FIFO within same priority)
      return a.timestamp - b.timestamp;
    });
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    const avgWaitTime = this.waitTimes.length > 0
      ? this.waitTimes.reduce((sum, t) => sum + t, 0) / this.waitTimes.length
      : 0;

    const estimatedWaitTime = avgWaitTime * this.queue.length;

    return {
      ...this.stats,
      averageWaitTime: Math.round(avgWaitTime),
      estimatedWaitTime: Math.round(estimatedWaitTime)
    };
  }

  /**
   * Get queue position for a request ID
   */
  getPosition(id: string): number {
    return this.queue.findIndex(r => r.id === id) + 1;
  }

  /**
   * Clear the queue (cancel all pending requests)
   */
  clear(): void {
    const count = this.queue.length;
    
    this.queue.forEach(item => {
      item.reject(new Error('Request cancelled: queue cleared'));
    });
    
    this.queue = [];
    this.stats.pending = 0;
    this.stats.failed += count;
    
    logger.info(`Queue cleared: ${count} requests cancelled`);
  }

  /**
   * Pause queue processing
   */
  pause(): void {
    this.processing = false;
    logger.info('Queue processing paused');
  }

  /**
   * Resume queue processing
   */
  resume(): void {
    logger.info('Queue processing resumed');
    this.processQueue().catch(logger.error);
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.queue.length === 0 && this.activeRequests === 0;
  }

  /**
   * Get current queue size
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Helper to generate unique ID
   */
  private generateId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Helper delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Global queue instance
 */
let globalQueue: SmartRequestQueue | null = null;

/**
 * Get or create global queue
 */
export function getGlobalQueue(): SmartRequestQueue {
  if (!globalQueue) {
    globalQueue = new SmartRequestQueue(1, 2000); // 1 concurrent, 2s min delay
  }
  return globalQueue;
}

/**
 * Helper function to queue a request
 */
export async function queueRequest<T>(
  request: () => Promise<T>,
  options?: {
    priority?: RequestPriority;
    provider?: string;
    estimatedTokens?: number;
    onProgress?: (progress: QueueProgress) => void;
  }
): Promise<T> {
  const queue = getGlobalQueue();
  return queue.enqueue(request, options);
}
