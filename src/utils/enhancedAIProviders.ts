/**
 * Enhanced AI Provider Wrappers
 * Wraps existing AI providers with timeout, caching, and progress tracking
 * 
 * @module enhancedAIProviders
 */

import { CVData, ATSOptimization } from '../types';
import { 
  OpenAIProvider, 
  GeminiProvider, 
  ClaudeProvider, 
  AIConfig,
  AIRequestOptions as BaseAIRequestOptions
} from './aiProviders';
import { logger } from './logger';
import { APIManager, createCacheKey } from './apiManager';
import { ProgressTracker, createOperationId } from './progressTracker';
import { OfflineSupportManager } from './offlineSupport';

/**
 * Enhanced AI provider that wraps base providers with additional features
 */
export class EnhancedAIProvider {
  private baseProvider: OpenAIProvider | GeminiProvider | ClaudeProvider;
  private config: AIConfig;
  private timeout: number;
  private enableCache: boolean;
  private cacheTTL: number;

  constructor(config: AIConfig) {
    this.config = config;
    this.timeout = config.timeout || 60000; // 60 seconds default
    this.enableCache = config.enableCache ?? true;
    this.cacheTTL = config.cacheTTL || 300000; // 5 minutes default

    // Create base provider
    switch (config.provider) {
      case 'openai':
        this.baseProvider = new OpenAIProvider(config);
        break;
      case 'gemini':
        this.baseProvider = new GeminiProvider(config);
        break;
      case 'claude':
        this.baseProvider = new ClaudeProvider(config);
        break;
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }

    logger.info(`Enhanced AI provider initialized: ${config.provider}`);
  }

  /**
   * Optimize CV with enhanced features
   */
  async optimizeCV(
    cvData: CVData,
    jobDescription: string,
    options?: BaseAIRequestOptions
  ): Promise<{ optimizedCV: CVData; optimizations: ATSOptimization[] }> {
    // Check if offline
    if (!OfflineSupportManager.isCurrentlyOnline()) {
      logger.warn('Offline mode - CV optimization requires internet');
      throw new Error('No internet connection. CV optimization requires an active internet connection.');
    }

    const operationId = createOperationId('cv-optimize');
    const cacheKey = createCacheKey(
      `${this.config.provider}-optimize`,
      this.config.model || 'default',
      jobDescription.substring(0, 100)
    );
    
    logger.startTimer(operationId);
    ProgressTracker.startOperation(operationId, `Optimizing CV with ${this.config.provider}`, {
      provider: this.config.provider,
      model: this.config.model,
    });

    try {
      const result = await APIManager.request(
        operationId,
        async () => {
          // Call the base provider
          logger.debug(`Calling ${this.config.provider} optimizeCV API`);
          return await this.baseProvider.optimizeCV(cvData, jobDescription);
        },
        {
          timeout: this.timeout,
          cache: this.enableCache,
          cacheTTL: this.cacheTTL,
          cacheKey,
          onProgress: (progress) => {
            ProgressTracker.updateProgress(operationId, {
              status: progress.status as any,
              message: progress.message,
              progress: progress.progress || 0,
            });
            options?.onProgress?.(progress);
          },
          ...(options?.signal ? { signal: options.signal } : {}),
        }
      );

      const duration = logger.endTimer(operationId);
      logger.logAPICall(`${this.config.provider}-optimizeCV`, {
        status: 'success',
        duration,
        metadata: { model: this.config.model },
      });
      ProgressTracker.completeOperation(operationId, 'CV optimization completed');

      return result;
    } catch (error: any) {
      const duration = logger.endTimer(operationId);
      logger.logAPICall(`${this.config.provider}-optimizeCV`, {
        status: error.message?.includes('timeout') ? 'timeout' : 'error',
        duration,
        error: error.message,
      });
      ProgressTracker.failOperation(operationId, error.message);
      throw error;
    }
  }

  /**
   * Generate cover letter with enhanced features
   */
  async generateCoverLetter(
    cvData: CVData,
    jobDescription: string,
    extraPrompt?: string,
    options?: BaseAIRequestOptions
  ): Promise<string> {
    // Check if offline
    if (!OfflineSupportManager.isCurrentlyOnline()) {
      logger.warn('Offline mode - cover letter generation requires internet');
      throw new Error('No internet connection. Cover letter generation requires an active internet connection.');
    }

    const operationId = createOperationId('cover-letter');
    const cacheKey = createCacheKey(
      `${this.config.provider}-cover`,
      this.config.model || 'default',
      jobDescription.substring(0, 100),
      extraPrompt || ''
    );
    
    logger.startTimer(operationId);
    ProgressTracker.startOperation(operationId, `Generating cover letter with ${this.config.provider}`, {
      provider: this.config.provider,
      model: this.config.model,
    });

    try {
      const result = await APIManager.request(
        operationId,
        async () => {
          // Call the base provider
          logger.debug(`Calling ${this.config.provider} generateCoverLetter API`);
          return await this.baseProvider.generateCoverLetter(cvData, jobDescription, extraPrompt);
        },
        {
          timeout: this.timeout,
          cache: this.enableCache,
          cacheTTL: this.cacheTTL,
          cacheKey,
          onProgress: (progress) => {
            ProgressTracker.updateProgress(operationId, {
              status: progress.status as any,
              message: progress.message,
              progress: progress.progress || 0,
            });
            options?.onProgress?.(progress);
          },
          ...(options?.signal ? { signal: options.signal } : {}),
        }
      );

      const duration = logger.endTimer(operationId);
      logger.logAPICall(`${this.config.provider}-generateCoverLetter`, {
        status: 'success',
        duration,
        metadata: { model: this.config.model },
      });
      ProgressTracker.completeOperation(operationId, 'Cover letter generated');

      return result;
    } catch (error: any) {
      const duration = logger.endTimer(operationId);
      logger.logAPICall(`${this.config.provider}-generateCoverLetter`, {
        status: error.message?.includes('timeout') ? 'timeout' : 'error',
        duration,
        error: error.message,
      });
      ProgressTracker.failOperation(operationId, error.message);
      throw error;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: AIConfig): void {
    this.config = { ...this.config, ...config };
    this.timeout = config.timeout || this.timeout;
    this.enableCache = config.enableCache ?? this.enableCache;
    this.cacheTTL = config.cacheTTL || this.cacheTTL;

    // Recreate base provider if provider type changed
    if (config.provider && config.provider !== this.config.provider) {
      switch (config.provider) {
        case 'openai':
          this.baseProvider = new OpenAIProvider(this.config);
          break;
        case 'gemini':
          this.baseProvider = new GeminiProvider(this.config);
          break;
        case 'claude':
          this.baseProvider = new ClaudeProvider(this.config);
          break;
      }
    }

    logger.info(`AI provider configuration updated: ${this.config.provider}`);
  }
}

/**
 * Factory function to create an enhanced AI provider
 */
export function createEnhancedAIProvider(config: AIConfig): EnhancedAIProvider {
  return new EnhancedAIProvider(config);
}
