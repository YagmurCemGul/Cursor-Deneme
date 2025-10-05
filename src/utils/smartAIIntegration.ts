/**
 * Smart AI Integration
 * Integrates all smart features: rate limiting, queuing, caching, budgeting, and fallback
 * 
 * @module smartAIIntegration
 * @description Complete AI integration with all smart features enabled
 */

import { logger } from './logger';
import { CVData, ATSOptimization } from '../types';
import { AIProvider } from './aiProviders';
import { getRateLimitTracker, waitForRateLimit } from './rateLimitTracker';
import { queueRequest, QueueProgress } from './smartRequestQueue';
import { getBudgetManager, trackCost } from './budgetManager';
import { getProviderManager } from './smartProviderManager';
import { cvOptimizationCache, coverLetterCache, generateCacheKey } from './smartCache';
import { getAnalytics } from './advancedAnalytics';
import { notifications } from './notificationManager';

/**
 * Smart request options
 */
export interface SmartRequestOptions {
  provider?: AIProvider;
  enableQueue?: boolean;
  enableCache?: boolean;
  enableFallback?: boolean;
  enableAnalytics?: boolean;
  onProgress?: (progress: QueueProgress) => void;
  tier?: string;
}

/**
 * Smart AI result
 */
export interface SmartAIResult<T> {
  result: T;
  metadata: {
    provider: AIProvider;
    cached: boolean;
    fallbackUsed: boolean;
    cost: number;
    duration: number;
    tokensUsed: { input: number; output: number };
  };
}

/**
 * Smart AI Integration
 * Main class that ties everything together
 */
export class SmartAIIntegration {
  private defaultOptions: Required<SmartRequestOptions> = {
    provider: 'openai',
    enableQueue: true,
    enableCache: true,
    enableFallback: true,
    enableAnalytics: true,
    onProgress: () => {},
    tier: 'free'
  };

  constructor() {
    logger.info('Smart AI Integration initialized');
  }

  /**
   * Optimize CV with all smart features
   */
  async optimizeCV(
    cvData: CVData,
    jobDescription: string,
    options: SmartRequestOptions = {}
  ): Promise<SmartAIResult<{ optimizedCV: CVData; optimizations: ATSOptimization[] }>> {
    const opts = { ...this.defaultOptions, ...options };
    const startTime = Date.now();

    logger.info('Starting smart CV optimization');

    try {
      // Check budget first
      const budgetManager = getBudgetManager();
      if (!budgetManager.canSpend(0.05)) {
        const alert = budgetManager.checkBudgetAlert();
        if (alert) {
          notifications.showBudgetAlert(alert);
        }
        throw new Error('Budget limit reached. Please adjust your budget or wait for the next period.');
      }

      // Generate cache key
      const cacheKey = generateCacheKey(
        'cv_optimize',
        opts.provider,
        JSON.stringify(cvData).substring(0, 100), // Partial key for privacy
        jobDescription.substring(0, 100)
      );

      // Try cache first if enabled
      if (opts.enableCache) {
        const cached = cvOptimizationCache.get(cacheKey);
        if (cached) {
          logger.info('Cache hit for CV optimization');
          notifications.showSuccess('Request Completed', 'Result retrieved from cache (instant, $0.00)');
          
          return {
            result: cached,
            metadata: {
              provider: opts.provider,
              cached: true,
              fallbackUsed: false,
              cost: 0,
              duration: Date.now() - startTime,
              tokensUsed: { input: 0, output: 0 }
            }
          };
        }
      }

      // Create the actual API call function
      const apiCall = async () => {
        // Check rate limit
        const tracker = getRateLimitTracker(opts.provider, opts.tier);
        const stats = tracker.getUsageStats();
        
        // Show rate limit warning if needed
        if (stats.rpmUsagePercent > 75) {
          notifications.showRateLimitWarning(stats, opts.provider);
        }

        // Wait for rate limit if needed
        if (stats.waitTimeMs > 0) {
          notifications.showRateLimitWait(stats.waitTimeMs);
          await waitForRateLimit(opts.provider, 2000);
        }

        // Use provider manager with fallback if enabled
        let result;
        let usedProvider = opts.provider;
        let fallbackUsed = false;

        if (opts.enableFallback) {
          const providerManager = getProviderManager();
          const fallbackResult = await providerManager.optimizeCV(
            cvData,
            jobDescription,
            (from, to, reason) => {
              notifications.showProviderSwitch(from, to, reason);
              fallbackUsed = true;
              usedProvider = to;
            }
          );
          result = fallbackResult.result;
          fallbackUsed = fallbackResult.fallbackUsed;
          usedProvider = fallbackResult.provider;
        } else {
          // Direct call without fallback
          const providerManager = getProviderManager({ enableHealthCheck: false });
          const fallbackResult = await providerManager.optimizeCV(cvData, jobDescription);
          result = fallbackResult.result;
        }

        // Record request in rate limiter
        tracker.recordRequest(2000); // Estimate 2000 tokens

        return { result, usedProvider, fallbackUsed };
      };

      // Execute with queue if enabled
      let apiResult;
      if (opts.enableQueue) {
        apiResult = await queueRequest(
          apiCall,
          {
            provider: opts.provider,
            estimatedTokens: 2000,
            onProgress: opts.onProgress
          }
        );
      } else {
        apiResult = await apiCall();
      }

      const duration = Date.now() - startTime;

      // Estimate cost (rough estimate)
      const estimatedCost = 0.02; // $0.02 for CV optimization
      const tokensUsed = { input: 1500, output: 500 };

      // Track cost
      trackCost(
        apiResult.usedProvider,
        'optimizeCV',
        tokensUsed.input,
        tokensUsed.output,
        estimatedCost,
        'gpt-4o-mini'
      );

      // Track analytics
      if (opts.enableAnalytics) {
        const analytics = getAnalytics();
        analytics.trackRequest({
          provider: apiResult.usedProvider,
          operation: 'optimizeCV',
          cost: estimatedCost,
          duration,
          success: true,
          model: 'gpt-4o-mini',
          inputTokens: tokensUsed.input,
          outputTokens: tokensUsed.output
        });

        // Show insights occasionally
        if (Math.random() < 0.1) { // 10% chance
          const insights = analytics.getInsights();
          if (insights.length > 0 && insights[0].type === 'cost_saving') {
            notifications.showCostSavingTip(
              insights[0].message,
              insights[0].potentialSaving || 0
            );
          }
        }
      }

      // Cache result
      if (opts.enableCache) {
        cvOptimizationCache.set(cacheKey, apiResult.result, undefined, 0.8);
      }

      // Show success notification
      notifications.showRequestCompleted('CV Optimization', estimatedCost, duration);

      return {
        result: apiResult.result,
        metadata: {
          provider: apiResult.usedProvider,
          cached: false,
          fallbackUsed: apiResult.fallbackUsed,
          cost: estimatedCost,
          duration,
          tokensUsed
        }
      };
    } catch (error: any) {
      logger.error('Smart CV optimization failed:', error);
      
      // Track failed request
      if (opts.enableAnalytics) {
        const analytics = getAnalytics();
        analytics.trackRequest({
          provider: opts.provider,
          operation: 'optimizeCV',
          cost: 0,
          duration: Date.now() - startTime,
          success: false,
          model: 'gpt-4o-mini',
          inputTokens: 0,
          outputTokens: 0
        });
      }

      notifications.showError('CV Optimization Failed', error.message);
      throw error;
    }
  }

  /**
   * Generate cover letter with all smart features
   */
  async generateCoverLetter(
    cvData: CVData,
    jobDescription: string,
    extraPrompt?: string,
    options: SmartRequestOptions = {}
  ): Promise<SmartAIResult<string>> {
    const opts = { ...this.defaultOptions, ...options };
    const startTime = Date.now();

    logger.info('Starting smart cover letter generation');

    try {
      // Check budget
      const budgetManager = getBudgetManager();
      if (!budgetManager.canSpend(0.03)) {
        const alert = budgetManager.checkBudgetAlert();
        if (alert) {
          notifications.showBudgetAlert(alert);
        }
        throw new Error('Budget limit reached. Please adjust your budget or wait for the next period.');
      }

      // Generate cache key
      const cacheKey = generateCacheKey(
        'cover_letter',
        opts.provider,
        JSON.stringify(cvData).substring(0, 100),
        jobDescription.substring(0, 100),
        extraPrompt || ''
      );

      // Try cache
      if (opts.enableCache) {
        const cached = coverLetterCache.get(cacheKey);
        if (cached) {
          logger.info('Cache hit for cover letter');
          notifications.showSuccess('Request Completed', 'Result retrieved from cache (instant, $0.00)');
          
          return {
            result: cached,
            metadata: {
              provider: opts.provider,
              cached: true,
              fallbackUsed: false,
              cost: 0,
              duration: Date.now() - startTime,
              tokensUsed: { input: 0, output: 0 }
            }
          };
        }
      }

      // API call
      const apiCall = async () => {
        const tracker = getRateLimitTracker(opts.provider, opts.tier);
        const stats = tracker.getUsageStats();
        
        if (stats.rpmUsagePercent > 75) {
          notifications.showRateLimitWarning(stats, opts.provider);
        }

        if (stats.waitTimeMs > 0) {
          notifications.showRateLimitWait(stats.waitTimeMs);
          await waitForRateLimit(opts.provider, 1500);
        }

        let result;
        let usedProvider = opts.provider;
        let fallbackUsed = false;

        if (opts.enableFallback) {
          const providerManager = getProviderManager();
          const fallbackResult = await providerManager.generateCoverLetter(
            cvData,
            jobDescription,
            extraPrompt,
            (from, to, reason) => {
              notifications.showProviderSwitch(from, to, reason);
              fallbackUsed = true;
              usedProvider = to;
            }
          );
          result = fallbackResult.result;
          fallbackUsed = fallbackResult.fallbackUsed;
          usedProvider = fallbackResult.provider;
        } else {
          const providerManager = getProviderManager({ enableHealthCheck: false });
          const fallbackResult = await providerManager.generateCoverLetter(cvData, jobDescription, extraPrompt);
          result = fallbackResult.result;
        }

        tracker.recordRequest(1500);

        return { result, usedProvider, fallbackUsed };
      };

      // Execute with queue
      let apiResult;
      if (opts.enableQueue) {
        apiResult = await queueRequest(
          apiCall,
          {
            provider: opts.provider,
            estimatedTokens: 1500,
            onProgress: opts.onProgress
          }
        );
      } else {
        apiResult = await apiCall();
      }

      const duration = Date.now() - startTime;
      const estimatedCost = 0.015;
      const tokensUsed = { input: 1000, output: 500 };

      // Track cost
      trackCost(
        apiResult.usedProvider,
        'generateCoverLetter',
        tokensUsed.input,
        tokensUsed.output,
        estimatedCost,
        'gpt-4o-mini'
      );

      // Track analytics
      if (opts.enableAnalytics) {
        const analytics = getAnalytics();
        analytics.trackRequest({
          provider: apiResult.usedProvider,
          operation: 'generateCoverLetter',
          cost: estimatedCost,
          duration,
          success: true,
          model: 'gpt-4o-mini',
          inputTokens: tokensUsed.input,
          outputTokens: tokensUsed.output
        });
      }

      // Cache result
      if (opts.enableCache) {
        coverLetterCache.set(cacheKey, apiResult.result, undefined, 0.7);
      }

      notifications.showRequestCompleted('Cover Letter Generation', estimatedCost, duration);

      return {
        result: apiResult.result,
        metadata: {
          provider: apiResult.usedProvider,
          cached: false,
          fallbackUsed: apiResult.fallbackUsed,
          cost: estimatedCost,
          duration,
          tokensUsed
        }
      };
    } catch (error: any) {
      logger.error('Smart cover letter generation failed:', error);
      
      if (opts.enableAnalytics) {
        const analytics = getAnalytics();
        analytics.trackRequest({
          provider: opts.provider,
          operation: 'generateCoverLetter',
          cost: 0,
          duration: Date.now() - startTime,
          success: false,
          model: 'gpt-4o-mini',
          inputTokens: 0,
          outputTokens: 0
        });
      }

      notifications.showError('Cover Letter Generation Failed', error.message);
      throw error;
    }
  }
}

/**
 * Global instance
 */
let globalSmartAI: SmartAIIntegration | null = null;

/**
 * Get global smart AI instance
 */
export function getSmartAI(): SmartAIIntegration {
  if (!globalSmartAI) {
    globalSmartAI = new SmartAIIntegration();
  }
  return globalSmartAI;
}

/**
 * Quick access functions
 */
export const smartAI = {
  optimizeCV: (cvData: CVData, jobDescription: string, options?: SmartRequestOptions) =>
    getSmartAI().optimizeCV(cvData, jobDescription, options),
  
  generateCoverLetter: (cvData: CVData, jobDescription: string, extraPrompt?: string, options?: SmartRequestOptions) =>
    getSmartAI().generateCoverLetter(cvData, jobDescription, extraPrompt, options)
};
