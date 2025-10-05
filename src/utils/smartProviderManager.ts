/**
 * Smart Provider Manager
 * Automatically switches between AI providers based on availability and health
 * 
 * @module smartProviderManager
 * @description Intelligent provider selection with automatic fallback
 */

import { logger } from './logger';
import { AIProvider, AIConfig, createAIProvider } from './aiProviders';
import { CVData, ATSOptimization } from '../types';
import { healthMonitor } from './healthMonitor';

/**
 * Provider status
 */
export interface ProviderStatus {
  provider: AIProvider;
  available: boolean;
  healthy: boolean;
  lastError?: string;
  lastErrorTime?: number;
  consecutiveFailures: number;
}

/**
 * Fallback result
 */
export interface FallbackResult<T> {
  result: T;
  provider: AIProvider;
  fallbackUsed: boolean;
  attemptedProviders: AIProvider[];
}

/**
 * Smart Provider Manager Options
 */
export interface ProviderManagerOptions {
  providerPriority?: AIProvider[];
  enableHealthCheck?: boolean;
  maxConsecutiveFailures?: number;
  fallbackOnRateLimit?: boolean;
  fallbackOnQuota?: boolean;
  fallbackOnError?: boolean;
}

/**
 * Smart Provider Manager
 * Manages multiple AI providers with intelligent fallback
 */
export class SmartProviderManager {
  private providerPriority: AIProvider[];
  private providerStatus: Map<AIProvider, ProviderStatus>;
  private options: Required<ProviderManagerOptions>;

  /**
   * Constructor
   */
  constructor(options: ProviderManagerOptions = {}) {
    this.providerPriority = options.providerPriority || ['openai', 'gemini', 'claude'];
    this.providerStatus = new Map();
    
    this.options = {
      providerPriority: this.providerPriority,
      enableHealthCheck: options.enableHealthCheck !== false,
      maxConsecutiveFailures: options.maxConsecutiveFailures || 3,
      fallbackOnRateLimit: options.fallbackOnRateLimit !== false,
      fallbackOnQuota: options.fallbackOnQuota !== false,
      fallbackOnError: options.fallbackOnError !== false
    };

    // Initialize status for each provider
    this.providerPriority.forEach(provider => {
      this.providerStatus.set(provider, {
        provider,
        available: true,
        healthy: true,
        consecutiveFailures: 0
      });
    });

    logger.info(`Smart provider manager initialized with priority: ${this.providerPriority.join(' > ')}`);
  }

  /**
   * Call with automatic fallback
   */
  async callWithFallback<T>(
    operation: 'optimizeCV' | 'generateCoverLetter',
    args: any[],
    onFallback?: (from: AIProvider, to: AIProvider, reason: string) => void
  ): Promise<FallbackResult<T>> {
    const attemptedProviders: AIProvider[] = [];
    let lastError: Error | null = null;

    for (const provider of this.getAvailableProviders()) {
      try {
        attemptedProviders.push(provider);
        logger.info(`Attempting ${operation} with ${provider}`);

        // Get provider instance
        const config = await this.getProviderConfig(provider);
        const providerInstance = createAIProvider(config);

        // Execute operation
        let result: T;
        if (operation === 'optimizeCV') {
          result = await providerInstance.optimizeCV(args[0], args[1]) as T;
        } else if (operation === 'generateCoverLetter') {
          result = await providerInstance.generateCoverLetter(args[0], args[1], args[2]) as T;
        } else {
          throw new Error(`Unknown operation: ${operation}`);
        }

        // Success! Record it
        this.recordSuccess(provider);

        return {
          result,
          provider,
          fallbackUsed: attemptedProviders.length > 1,
          attemptedProviders
        };
      } catch (error: any) {
        lastError = error;
        logger.warn(`${provider} failed for ${operation}:`, error.message);

        // Record failure
        this.recordFailure(provider, error.message);

        // Check if we should fallback
        if (this.shouldFallback(error)) {
          const nextProvider = this.getNextProvider(provider);
          
          if (nextProvider) {
            const reason = this.getFallbackReason(error);
            logger.info(`Falling back from ${provider} to ${nextProvider}: ${reason}`);
            
            // Notify about fallback
            if (onFallback) {
              onFallback(provider, nextProvider, reason);
            }
            
            // Emit event
            this.emitFallbackEvent(provider, nextProvider, reason);
            
            continue; // Try next provider
          }
        }

        // If not retryable or no more providers, throw
        if (!this.shouldFallback(error) || attemptedProviders.length >= this.providerPriority.length) {
          throw error;
        }
      }
    }

    // All providers failed
    throw lastError || new Error('All providers failed');
  }

  /**
   * Optimize CV with fallback
   */
  async optimizeCV(
    cvData: CVData,
    jobDescription: string,
    onFallback?: (from: AIProvider, to: AIProvider, reason: string) => void
  ): Promise<FallbackResult<{ optimizedCV: CVData; optimizations: ATSOptimization[] }>> {
    return this.callWithFallback('optimizeCV', [cvData, jobDescription], onFallback);
  }

  /**
   * Generate cover letter with fallback
   */
  async generateCoverLetter(
    cvData: CVData,
    jobDescription: string,
    extraPrompt?: string,
    onFallback?: (from: AIProvider, to: AIProvider, reason: string) => void
  ): Promise<FallbackResult<string>> {
    return this.callWithFallback('generateCoverLetter', [cvData, jobDescription, extraPrompt], onFallback);
  }

  /**
   * Check if error should trigger fallback
   */
  private shouldFallback(error: any): boolean {
    const message = error.message?.toLowerCase() || '';
    
    // Rate limit errors
    if (this.options.fallbackOnRateLimit && 
        (message.includes('rate limit') || message.includes('429'))) {
      return true;
    }
    
    // Quota errors
    if (this.options.fallbackOnQuota && 
        (message.includes('quota') || message.includes('insufficient_quota'))) {
      return true;
    }
    
    // Server errors
    if (this.options.fallbackOnError && 
        (message.includes('503') || message.includes('502') || 
         message.includes('temporarily unavailable'))) {
      return true;
    }
    
    // Don't fallback on API key errors or invalid requests
    if (message.includes('invalid api key') || 
        message.includes('invalid request') ||
        message.includes('401')) {
      return false;
    }
    
    return false;
  }

  /**
   * Get fallback reason from error
   */
  private getFallbackReason(error: any): string {
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('rate limit') || message.includes('429')) {
      return 'rate limit exceeded';
    }
    if (message.includes('quota') || message.includes('insufficient_quota')) {
      return 'quota exceeded';
    }
    if (message.includes('503')) {
      return 'service unavailable';
    }
    if (message.includes('timeout')) {
      return 'request timeout';
    }
    
    return 'error occurred';
  }

  /**
   * Get next available provider
   */
  private getNextProvider(current: AIProvider): AIProvider | null {
    const currentIndex = this.providerPriority.indexOf(current);
    const nextProviders = this.providerPriority.slice(currentIndex + 1);
    
    for (const provider of nextProviders) {
      const status = this.providerStatus.get(provider);
      if (status && status.available && status.healthy) {
        return provider;
      }
    }
    
    return null;
  }

  /**
   * Get list of available providers
   */
  private getAvailableProviders(): AIProvider[] {
    return this.providerPriority.filter(provider => {
      const status = this.providerStatus.get(provider);
      return status && status.available && status.healthy;
    });
  }

  /**
   * Record successful call
   */
  private recordSuccess(provider: AIProvider): void {
    const status = this.providerStatus.get(provider);
    if (status) {
      status.consecutiveFailures = 0;
      status.healthy = true;
      status.available = true;
      status.lastError = undefined;
      status.lastErrorTime = undefined;
    }
    
    // Record in health monitor
    if (this.options.enableHealthCheck) {
      healthMonitor.recordSuccess(provider, 1000);
    }
  }

  /**
   * Record failed call
   */
  private recordFailure(provider: AIProvider, errorMessage: string): void {
    const status = this.providerStatus.get(provider);
    if (status) {
      status.consecutiveFailures++;
      status.lastError = errorMessage;
      status.lastErrorTime = Date.now();
      
      // Mark as unhealthy if too many failures
      if (status.consecutiveFailures >= this.options.maxConsecutiveFailures) {
        status.healthy = false;
        logger.warn(`${provider} marked as unhealthy after ${status.consecutiveFailures} failures`);
      }
    }
    
    // Record in health monitor
    if (this.options.enableHealthCheck) {
      healthMonitor.recordFailure(provider, errorMessage);
    }
  }

  /**
   * Get provider configuration from storage
   */
  private async getProviderConfig(provider: AIProvider): Promise<AIConfig> {
    // This should get API keys from chrome storage
    const stored = await chrome.storage.local.get([
      'openai_api_key',
      'google_api_key', 
      'anthropic_api_key',
      'encrypted_openai_api_key',
      'encrypted_google_api_key',
      'encrypted_anthropic_api_key'
    ]);
    
    let apiKey = '';
    switch (provider) {
      case 'openai':
        apiKey = stored.encrypted_openai_api_key || stored.openai_api_key || '';
        break;
      case 'gemini':
        apiKey = stored.encrypted_google_api_key || stored.google_api_key || '';
        break;
      case 'claude':
        apiKey = stored.encrypted_anthropic_api_key || stored.anthropic_api_key || '';
        break;
    }
    
    if (!apiKey) {
      throw new Error(`No API key found for ${provider}`);
    }
    
    return {
      provider,
      apiKey,
      model: this.getDefaultModel(provider),
      temperature: 0.7
    };
  }

  /**
   * Get default model for provider
   */
  private getDefaultModel(provider: AIProvider): string {
    const models: Record<AIProvider, string> = {
      'openai': 'gpt-4o-mini',
      'gemini': 'gemini-pro',
      'claude': 'claude-3-haiku-20240307'
    };
    return models[provider];
  }

  /**
   * Get provider status
   */
  getProviderStatus(provider: AIProvider): ProviderStatus | undefined {
    return this.providerStatus.get(provider);
  }

  /**
   * Get all provider statuses
   */
  getAllStatuses(): ProviderStatus[] {
    return Array.from(this.providerStatus.values());
  }

  /**
   * Manually set provider availability
   */
  setProviderAvailable(provider: AIProvider, available: boolean): void {
    const status = this.providerStatus.get(provider);
    if (status) {
      status.available = available;
      logger.info(`${provider} availability set to ${available}`);
    }
  }

  /**
   * Reset provider status
   */
  resetProviderStatus(provider: AIProvider): void {
    const status = this.providerStatus.get(provider);
    if (status) {
      status.consecutiveFailures = 0;
      status.healthy = true;
      status.available = true;
      status.lastError = undefined;
      status.lastErrorTime = undefined;
      logger.info(`${provider} status reset`);
    }
  }

  /**
   * Emit fallback event
   */
  private emitFallbackEvent(from: AIProvider, to: AIProvider, reason: string): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('providerFallback', {
        detail: { from, to, reason, timestamp: Date.now() }
      }));
    }
  }
}

/**
 * Global instance
 */
let globalProviderManager: SmartProviderManager | null = null;

/**
 * Get or create global provider manager
 */
export function getProviderManager(options?: ProviderManagerOptions): SmartProviderManager {
  if (!globalProviderManager) {
    globalProviderManager = new SmartProviderManager(options);
  }
  return globalProviderManager;
}
