/**
 * API Manager - Handles API requests with timeout, caching, and progress tracking
 * 
 * Features:
 * - Request timeout management
 * - Response caching with TTL
 * - Request deduplication
 * - Progress tracking
 * - Offline detection
 * 
 * @module apiManager
 */

import { logger } from './logger';

/**
 * Cache entry interface
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * API Request options
 */
export interface APIRequestOptions {
  timeout?: number; // Timeout in milliseconds (default: 30000)
  cache?: boolean; // Enable caching (default: false)
  cacheTTL?: number; // Cache time-to-live in milliseconds (default: 300000 = 5 minutes)
  cacheKey?: string; // Custom cache key
  retries?: number; // Number of retries (default: 2)
  retryDelay?: number; // Initial retry delay in milliseconds (default: 1000)
  onProgress?: (progress: APIProgress) => void; // Progress callback
  signal?: AbortSignal; // AbortController signal
}

/**
 * API Progress information
 */
export interface APIProgress {
  status: 'pending' | 'in_progress' | 'success' | 'error' | 'timeout' | 'offline';
  message: string;
  progress?: number; // Progress percentage (0-100)
  timestamp: number;
}

/**
 * API Manager class for handling API requests
 */
export class APIManager {
  private static cache: Map<string, CacheEntry<any>> = new Map();
  private static pendingRequests: Map<string, Promise<any>> = new Map();
  private static defaultTimeout: number = 30000; // 30 seconds
  private static maxTimeout: number = 120000; // 2 minutes
  private static isOnline: boolean = navigator.onLine;

  /**
   * Initialize the API Manager with event listeners
   */
  static initialize(): void {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      logger.info('Network connection restored');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      logger.warn('Network connection lost - entering offline mode');
    });

    // Periodically clean up expired cache entries
    setInterval(() => {
      this.cleanCache();
    }, 60000); // Run every minute

    logger.info('API Manager initialized');
  }

  /**
   * Check if the application is online
   */
  static checkOnlineStatus(): boolean {
    this.isOnline = navigator.onLine;
    return this.isOnline;
  }

  /**
   * Make an API request with timeout, caching, and progress tracking
   * 
   * @template T - Response type
   * @param {string} key - Unique identifier for this request
   * @param {() => Promise<T>} requestFn - Function that returns a promise for the API call
   * @param {APIRequestOptions} [options] - Request options
   * @returns {Promise<T>} - Promise that resolves with the response
   */
  static async request<T>(
    key: string,
    requestFn: () => Promise<T>,
    options: APIRequestOptions = {}
  ): Promise<T> {
    const {
      timeout = this.defaultTimeout,
      cache = false,
      cacheTTL = 300000, // 5 minutes default
      cacheKey = key,
      retries = 2,
      retryDelay = 1000,
      onProgress,
      signal,
    } = options;

    // Enforce maximum timeout
    const effectiveTimeout = Math.min(timeout, this.maxTimeout);

    logger.debug(`API Request: ${key}`, {
      timeout: effectiveTimeout,
      cache,
      cacheTTL,
      retries,
    });

    // Report initial progress
    this.reportProgress(onProgress, {
      status: 'pending',
      message: 'Initializing request...',
      progress: 0,
      timestamp: Date.now(),
    });

    // Check if we're offline
    if (!this.checkOnlineStatus()) {
      logger.warn(`Request ${key} failed: offline`);
      this.reportProgress(onProgress, {
        status: 'offline',
        message: 'No internet connection',
        timestamp: Date.now(),
      });
      throw new Error('No internet connection. Please check your network and try again.');
    }

    // Check cache if enabled
    if (cache) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached !== null) {
        logger.debug(`Cache hit for: ${cacheKey}`);
        this.reportProgress(onProgress, {
          status: 'success',
          message: 'Retrieved from cache',
          progress: 100,
          timestamp: Date.now(),
        });
        return cached;
      }
      logger.debug(`Cache miss for: ${cacheKey}`);
    }

    // Check if there's already a pending request for this key (deduplication)
    if (this.pendingRequests.has(key)) {
      logger.debug(`Request deduplication for: ${key}`);
      this.reportProgress(onProgress, {
        status: 'in_progress',
        message: 'Using existing pending request...',
        progress: 50,
        timestamp: Date.now(),
      });
      return this.pendingRequests.get(key)!;
    }

    // Create the request with retry logic
    const requestPromise = this.executeWithRetry<T>(
      key,
      requestFn,
      effectiveTimeout,
      retries,
      retryDelay,
      onProgress,
      signal
    );

    // Store pending request
    this.pendingRequests.set(key, requestPromise);

    try {
      const result = await requestPromise;

      // Cache the result if enabled
      if (cache) {
        this.setCache(cacheKey, result, cacheTTL);
        logger.debug(`Cached result for: ${cacheKey} (TTL: ${cacheTTL}ms)`);
      }

      this.reportProgress(onProgress, {
        status: 'success',
        message: 'Request completed successfully',
        progress: 100,
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      this.reportProgress(onProgress, {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      });
      throw error;
    } finally {
      // Remove from pending requests
      this.pendingRequests.delete(key);
    }
  }

  /**
   * Execute request with retry logic
   */
  private static async executeWithRetry<T>(
    key: string,
    requestFn: () => Promise<T>,
    timeout: number,
    maxRetries: number,
    retryDelay: number,
    onProgress?: (progress: APIProgress) => void,
    signal?: AbortSignal
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        this.reportProgress(onProgress, {
          status: 'in_progress',
          message: `Processing request${attempt > 0 ? ` (retry ${attempt}/${maxRetries})` : ''}...`,
          progress: 10 + (attempt * 30),
          timestamp: Date.now(),
        });

        // Execute request with timeout
        const result = await this.executeWithTimeout<T>(
          key,
          requestFn,
          timeout,
          onProgress,
          signal
        );

        logger.info(`Request ${key} completed successfully${attempt > 0 ? ` after ${attempt} retries` : ''}`);
        return result;
      } catch (error: any) {
        lastError = error;

        // Don't retry on certain errors
        if (
          error.message?.includes('Invalid API key') ||
          error.message?.includes('Invalid request') ||
          error.message?.includes('blocked by safety') ||
          error.message?.includes('parse') ||
          error.message?.includes('No internet connection') ||
          signal?.aborted
        ) {
          logger.debug(`Request ${key} - non-retryable error: ${error.message}`);
          throw error;
        }

        // Only retry on network errors or server errors
        const shouldRetry =
          error.message?.includes('timeout') ||
          error.message?.includes('network') ||
          error.message?.includes('temporarily unavailable') ||
          error.message?.includes('503') ||
          error.message?.includes('502') ||
          error.message?.includes('504');

        if (!shouldRetry || attempt === maxRetries) {
          logger.error(`Request ${key} failed after ${attempt + 1} attempts`);
          throw error;
        }

        // Exponential backoff
        const delay = retryDelay * Math.pow(2, attempt);
        logger.info(`Retrying request ${key} after ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);

        this.reportProgress(onProgress, {
          status: 'in_progress',
          message: `Retrying in ${delay}ms...`,
          progress: 10 + (attempt * 30),
          timestamp: Date.now(),
        });

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('Request failed');
  }

  /**
   * Execute request with timeout
   */
  private static async executeWithTimeout<T>(
    key: string,
    requestFn: () => Promise<T>,
    timeout: number,
    onProgress?: (progress: APIProgress) => void,
    signal?: AbortSignal
  ): Promise<T> {
    return new Promise<T>(async (resolve, reject) => {
      // Check if already aborted
      if (signal?.aborted) {
        reject(new Error('Request was cancelled'));
        return;
      }

      // Set up timeout
      const timeoutId = setTimeout(() => {
        logger.warn(`Request ${key} timed out after ${timeout}ms`);
        this.reportProgress(onProgress, {
          status: 'timeout',
          message: `Request timed out after ${timeout / 1000} seconds`,
          timestamp: Date.now(),
        });
        reject(new Error(`Request timeout: The request took longer than ${timeout / 1000} seconds. Please try again.`));
      }, timeout);

      // Set up abort listener
      const abortListener = () => {
        clearTimeout(timeoutId);
        reject(new Error('Request was cancelled'));
      };

      signal?.addEventListener('abort', abortListener);

      try {
        const result = await requestFn();
        clearTimeout(timeoutId);
        signal?.removeEventListener('abort', abortListener);
        resolve(result);
      } catch (error) {
        clearTimeout(timeoutId);
        signal?.removeEventListener('abort', abortListener);
        reject(error);
      }
    });
  }

  /**
   * Report progress to callback if provided
   */
  private static reportProgress(
    callback: ((progress: APIProgress) => void) | undefined,
    progress: APIProgress
  ): void {
    if (callback) {
      callback(progress);
    }
  }

  /**
   * Get item from cache
   */
  private static getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Check if cache entry is still valid
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      logger.debug(`Cache entry expired: ${key}`);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set item in cache
   */
  private static setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    this.cache.clear();
    logger.info('Cache cleared');
  }

  /**
   * Clear specific cache entry
   */
  static clearCacheEntry(key: string): void {
    this.cache.delete(key);
    logger.debug(`Cache entry cleared: ${key}`);
  }

  /**
   * Clean up expired cache entries
   */
  private static cleanCache(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`Cleaned ${cleaned} expired cache entries`);
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }

  /**
   * Configure default timeout
   */
  static setDefaultTimeout(timeout: number): void {
    this.defaultTimeout = Math.min(timeout, this.maxTimeout);
    logger.info(`Default timeout set to ${this.defaultTimeout}ms`);
  }

  /**
   * Get default timeout
   */
  static getDefaultTimeout(): number {
    return this.defaultTimeout;
  }

  /**
   * Get maximum timeout
   */
  static getMaxTimeout(): number {
    return this.maxTimeout;
  }
}

/**
 * Helper function to create a cache key from parameters
 */
export function createCacheKey(prefix: string, ...params: any[]): string {
  return `${prefix}:${params.map(p => JSON.stringify(p)).join(':')}`;
}

/**
 * Helper to create an AbortController with timeout
 */
export function createTimeoutController(timeout: number): { controller: AbortController; timeoutId: NodeJS.Timeout } {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  return { controller, timeoutId };
}
