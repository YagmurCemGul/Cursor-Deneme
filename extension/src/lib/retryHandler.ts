/**
 * Retry Handler with Exponential Backoff
 * Automatically retries failed operations with smart backoff strategy
 */

import { isRetryableError, getRetryDelay, createAppError, logError } from './errorHandler';

export interface RetryConfig {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: any, attempt: number) => boolean;
  onRetry?: (error: any, attempt: number, delay: number) => void;
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  shouldRetry: (error: any) => {
    const appError = createAppError(error);
    return isRetryableError(appError.type);
  },
  onRetry: (error: any, attempt: number, delay: number) => {
    console.log(`🔄 Retrying operation (attempt ${attempt}) after ${delay}ms...`);
  },
};

/**
 * Retry an async operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  let lastError: any;

  for (let attempt = 0; attempt < finalConfig.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      const appError = createAppError(error);

      // Check if we should retry
      if (attempt === finalConfig.maxAttempts - 1) {
        // Last attempt, don't retry
        logError(appError);
        throw error;
      }

      if (!finalConfig.shouldRetry(error, attempt)) {
        // Error is not retryable
        logError(appError);
        throw error;
      }

      // Calculate delay
      const delay = getRetryDelay(appError.type, attempt);

      // Notify about retry
      if (finalConfig.onRetry) {
        finalConfig.onRetry(error, attempt + 1, delay);
      }

      // Wait before retrying
      await sleep(delay);
    }
  }

  // This shouldn't be reached, but just in case
  throw lastError;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry with timeout
 */
export async function retryWithTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  config: RetryConfig = {}
): Promise<T> {
  return Promise.race([
    retryWithBackoff(operation, config),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
    ),
  ]);
}

/**
 * Batch retry - retry multiple operations
 */
export async function retryBatch<T>(
  operations: Array<() => Promise<T>>,
  config: RetryConfig = {}
): Promise<Array<T | Error>> {
  const results = await Promise.allSettled(
    operations.map((op) => retryWithBackoff(op, config))
  );

  return results.map((result) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return result.reason;
    }
  });
}

/**
 * Smart retry - automatically adjusts strategy based on error patterns
 */
export class SmartRetryHandler {
  private errorHistory: Array<{ type: string; timestamp: number }> = [];
  private readonly historyLimit = 100;
  private readonly errorWindowMs = 60000; // 1 minute

  /**
   * Record an error
   */
  recordError(error: any): void {
    const appError = createAppError(error);
    this.errorHistory.push({
      type: appError.type,
      timestamp: Date.now(),
    });

    // Keep only recent errors
    if (this.errorHistory.length > this.historyLimit) {
      this.errorHistory.shift();
    }
  }

  /**
   * Get error frequency in the last window
   */
  getErrorFrequency(errorType?: string): number {
    const now = Date.now();
    const recentErrors = this.errorHistory.filter(
      (e) =>
        now - e.timestamp < this.errorWindowMs &&
        (!errorType || e.type === errorType)
    );
    return recentErrors.length;
  }

  /**
   * Check if we're experiencing high error rate
   */
  isHighErrorRate(threshold: number = 5): boolean {
    return this.getErrorFrequency() > threshold;
  }

  /**
   * Get recommended retry config based on error history
   */
  getRecommendedConfig(): RetryConfig {
    const errorRate = this.getErrorFrequency();

    if (errorRate > 10) {
      // High error rate - be more conservative
      return {
        maxAttempts: 2,
        initialDelay: 5000,
        maxDelay: 60000,
      };
    } else if (errorRate > 5) {
      // Medium error rate
      return {
        maxAttempts: 3,
        initialDelay: 2000,
        maxDelay: 30000,
      };
    } else {
      // Low error rate - normal retry
      return {
        maxAttempts: 3,
        initialDelay: 1000,
        maxDelay: 15000,
      };
    }
  }

  /**
   * Execute operation with smart retry
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    const config = this.getRecommendedConfig();

    try {
      return await retryWithBackoff(operation, {
        ...config,
        onRetry: (error, attempt, delay) => {
          this.recordError(error);
          console.log(
            `🔄 Smart retry (attempt ${attempt}, error rate: ${this.getErrorFrequency()}) after ${delay}ms...`
          );
        },
      });
    } catch (error) {
      this.recordError(error);
      throw error;
    }
  }

  /**
   * Clear error history
   */
  clearHistory(): void {
    this.errorHistory = [];
  }
}

// Global smart retry handler instance
export const smartRetry = new SmartRetryHandler();
