/**
 * LLM Request Queue with concurrency control and exponential backoff
 * Ensures only one request per tab at a time, with retry logic
 */

import { logger } from '../lib/logger';

interface QueuedRequest {
  id: string;
  tabId: number;
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: Error) => void;
  retries: number;
  maxRetries: number;
}

export class RequestQueue {
  private queue: QueuedRequest[] = [];
  private activeRequests: Map<number, string> = new Map(); // tabId -> requestId
  private abortControllers: Map<string, AbortController> = new Map();

  /**
   * Add request to queue
   */
  async enqueue<T>(
    tabId: number,
    execute: (signal: AbortSignal) => Promise<T>,
    maxRetries = 3
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const requestId = `${tabId}-${Date.now()}-${Math.random()}`;
      const controller = new AbortController();
      this.abortControllers.set(requestId, controller);

      const request: QueuedRequest = {
        id: requestId,
        tabId,
        execute: () => execute(controller.signal),
        resolve,
        reject,
        retries: 0,
        maxRetries,
      };

      this.queue.push(request);
      logger.debug(`Request ${requestId} queued for tab ${tabId}`);

      this.processQueue();
    });
  }

  /**
   * Process queue with concurrency control
   */
  private async processQueue(): Promise<void> {
    // Find next request for a tab that's not busy
    const nextRequest = this.queue.find(
      req => !this.activeRequests.has(req.tabId)
    );

    if (!nextRequest) return;

    // Remove from queue and mark as active
    this.queue = this.queue.filter(r => r.id !== nextRequest.id);
    this.activeRequests.set(nextRequest.tabId, nextRequest.id);

    logger.debug(`Processing request ${nextRequest.id} for tab ${nextRequest.tabId}`);

    try {
      const result = await this.executeWithRetry(nextRequest);
      nextRequest.resolve(result);
    } catch (error) {
      nextRequest.reject(error as Error);
    } finally {
      // Mark as inactive and process next
      this.activeRequests.delete(nextRequest.tabId);
      this.abortControllers.delete(nextRequest.id);
      
      // Process next request
      if (this.queue.length > 0) {
        this.processQueue();
      }
    }
  }

  /**
   * Execute request with exponential backoff retry
   */
  private async executeWithRetry(request: QueuedRequest): Promise<any> {
    while (request.retries <= request.maxRetries) {
      try {
        const result = await request.execute();
        return result;
      } catch (error: any) {
        const isRetryable = this.isRetryableError(error);
        
        if (!isRetryable || request.retries >= request.maxRetries) {
          logger.error(`Request ${request.id} failed permanently:`, error);
          throw error;
        }

        request.retries++;
        const delay = this.calculateBackoff(request.retries);
        
        logger.warn(
          `Request ${request.id} failed (attempt ${request.retries}/${request.maxRetries}), ` +
          `retrying in ${delay}ms:`,
          error.message
        );

        await this.sleep(delay);
      }
    }

    throw new Error('Max retries exceeded');
  }

  /**
   * Check if error is retryable (429, 5xx)
   */
  private isRetryableError(error: any): boolean {
    const message = error?.message || '';
    
    // Rate limit errors
    if (message.includes('429') || message.includes('rate limit')) {
      return true;
    }

    // Server errors
    if (message.includes('500') || message.includes('502') || 
        message.includes('503') || message.includes('504')) {
      return true;
    }

    // Network errors
    if (message.includes('network') || message.includes('timeout')) {
      return true;
    }

    return false;
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoff(retryCount: number): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    
    // Exponential: 1s, 2s, 4s, 8s, ...
    const delay = Math.min(baseDelay * Math.pow(2, retryCount - 1), maxDelay);
    
    // Add jitter (±25%)
    const jitter = delay * 0.25 * (Math.random() * 2 - 1);
    
    return Math.floor(delay + jitter);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cancel all requests for a specific tab
   */
  cancelTab(tabId: number): void {
    // Cancel active request
    const activeRequestId = this.activeRequests.get(tabId);
    if (activeRequestId) {
      const controller = this.abortControllers.get(activeRequestId);
      controller?.abort();
      this.activeRequests.delete(tabId);
      this.abortControllers.delete(activeRequestId);
      logger.info(`Cancelled active request for tab ${tabId}`);
    }

    // Remove queued requests
    const removed = this.queue.filter(r => r.tabId === tabId);
    this.queue = this.queue.filter(r => r.tabId !== tabId);
    
    removed.forEach(req => {
      req.reject(new Error('Request cancelled due to tab close'));
      this.abortControllers.delete(req.id);
    });

    if (removed.length > 0) {
      logger.info(`Removed ${removed.length} queued requests for tab ${tabId}`);
    }
  }

  /**
   * Cancel specific request
   */
  cancel(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }

    // Remove from queue
    const request = this.queue.find(r => r.id === requestId);
    if (request) {
      this.queue = this.queue.filter(r => r.id !== requestId);
      request.reject(new Error('Request cancelled'));
    }

    // Remove from active
    for (const [tabId, activeId] of this.activeRequests.entries()) {
      if (activeId === requestId) {
        this.activeRequests.delete(tabId);
        break;
      }
    }
  }

  /**
   * Get queue status
   */
  getStatus(): { queued: number; active: number; byTab: Record<number, number> } {
    const byTab: Record<number, number> = {};
    
    this.queue.forEach(req => {
      byTab[req.tabId] = (byTab[req.tabId] || 0) + 1;
    });

    return {
      queued: this.queue.length,
      active: this.activeRequests.size,
      byTab,
    };
  }
}

// Global singleton
export const requestQueue = new RequestQueue();
