/**
 * A/B Testing for AI Providers
 * Compare results from different AI providers side-by-side
 */

import { CVData } from '../types';
import { ABTestResult } from '../types/storage';
import { AIConfig, createAIProvider } from './aiProviders';
import { logger } from './logger';
import { UsageTracker } from './usageTracker';
import { countConversationTokens } from './tokenCounter';
import { calculateCost } from './costCalculator';

export interface ABTestConfig {
  testName: string;
  cvData: CVData;
  jobDescription: string;
  providers: Array<{
    provider: 'openai' | 'gemini' | 'claude' | 'azure-openai' | 'ollama';
    apiKey: string;
    model: string;
    temperature?: number;
    azureEndpoint?: string;
    azureDeployment?: string;
    ollamaEndpoint?: string;
  }>;
  operation: 'optimize-cv' | 'generate-cover-letter';
  extraPrompt?: string;
}

export class ABTester {
  /**
   * Run an A/B test across multiple providers
   */
  static async runTest(config: ABTestConfig): Promise<ABTestResult> {
    const testId = `abtest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const result: ABTestResult = {
      id: testId,
      testName: config.testName,
      cvData: config.cvData,
      jobDescription: config.jobDescription,
      timestamp: new Date().toISOString(),
      providers: [],
    };

    // Run test for each provider in parallel
    const promises = config.providers.map(async (providerConfig) => {
      const startTime = Date.now();
      
      try {
        // Create provider instance
        const aiConfig: AIConfig = {
          provider: providerConfig.provider,
          apiKey: providerConfig.apiKey,
          model: providerConfig.model,
          temperature: providerConfig.temperature || 0.3,
          azureEndpoint: providerConfig.azureEndpoint,
          azureDeployment: providerConfig.azureDeployment,
          ollamaEndpoint: providerConfig.ollamaEndpoint,
        };

        const provider = createAIProvider(aiConfig);
        
        // Execute operation
        let output: string;
        if (config.operation === 'optimize-cv') {
          const optimizationResult = await provider.optimizeCV(
            config.cvData,
            config.jobDescription
          );
          output = JSON.stringify(optimizationResult.optimizations, null, 2);
        } else {
          output = await provider.generateCoverLetter(
            config.cvData,
            config.jobDescription,
            config.extraPrompt
          );
        }

        const duration = Date.now() - startTime;

        // Estimate tokens (would be more accurate with actual API response)
        const tokenCount = countConversationTokens(
          'System prompt...',
          config.jobDescription + JSON.stringify(config.cvData),
          output
        );

        // Calculate cost
        const cost = calculateCost(
          providerConfig.model,
          tokenCount.prompt,
          tokenCount.completion
        );

        // Record usage
        await UsageTracker.recordUsage({
          provider: providerConfig.provider,
          model: providerConfig.model,
          operation: 'ab-test',
          tokensUsed: tokenCount,
          cost,
          duration,
          success: true,
        });

        return {
          provider: providerConfig.provider,
          model: providerConfig.model,
          result: output,
          tokensUsed: tokenCount.total,
          cost,
          duration,
        };
      } catch (error: any) {
        logger.error(`A/B test failed for ${providerConfig.provider}:`, error);
        
        const duration = Date.now() - startTime;
        
        // Record failed usage
        await UsageTracker.recordUsage({
          provider: providerConfig.provider,
          model: providerConfig.model,
          operation: 'ab-test',
          tokensUsed: { prompt: 0, completion: 0, total: 0 },
          cost: 0,
          duration,
          success: false,
          errorMessage: error.message,
        });

        return {
          provider: providerConfig.provider,
          model: providerConfig.model,
          result: `Error: ${error.message}`,
          tokensUsed: 0,
          cost: 0,
          duration,
        };
      }
    });

    result.providers = await Promise.all(promises);

    // Save test result
    await this.saveTestResult(result);

    return result;
  }

  /**
   * Save test result to storage
   */
  private static async saveTestResult(result: ABTestResult): Promise<void> {
    try {
      const storage = await chrome.storage.local.get('abTestResults');
      const results: ABTestResult[] = storage.abTestResults || [];
      
      results.push(result);
      
      // Keep only last 50 test results
      const trimmedResults = results.slice(-50);
      
      await chrome.storage.local.set({ abTestResults: trimmedResults });
      logger.info('A/B test result saved:', result.id);
    } catch (error) {
      logger.error('Failed to save A/B test result:', error);
    }
  }

  /**
   * Get all test results
   */
  static async getAllResults(): Promise<ABTestResult[]> {
    try {
      const storage = await chrome.storage.local.get('abTestResults');
      return storage.abTestResults || [];
    } catch (error) {
      logger.error('Failed to get A/B test results:', error);
      return [];
    }
  }

  /**
   * Get a specific test result
   */
  static async getResult(testId: string): Promise<ABTestResult | null> {
    const results = await this.getAllResults();
    return results.find((r) => r.id === testId) || null;
  }

  /**
   * Update test result with user rating
   */
  static async rateProvider(
    testId: string,
    providerName: string,
    rating: number
  ): Promise<void> {
    try {
      const results = await this.getAllResults();
      const testResult = results.find((r) => r.id === testId);
      
      if (!testResult) {
        throw new Error('Test result not found');
      }

      const provider = testResult.providers.find((p) => p.provider === providerName);
      if (provider) {
        provider.rating = rating;
      }

      await chrome.storage.local.set({ abTestResults: results });
    } catch (error) {
      logger.error('Failed to rate provider:', error);
    }
  }

  /**
   * Select best provider for a test
   */
  static async selectBestProvider(testId: string, providerName: string): Promise<void> {
    try {
      const results = await this.getAllResults();
      const testResult = results.find((r) => r.id === testId);
      
      if (!testResult) {
        throw new Error('Test result not found');
      }

      testResult.selectedProvider = providerName;

      await chrome.storage.local.set({ abTestResults: results });
    } catch (error) {
      logger.error('Failed to select best provider:', error);
    }
  }

  /**
   * Add notes to a test result
   */
  static async addNotes(testId: string, notes: string): Promise<void> {
    try {
      const results = await this.getAllResults();
      const testResult = results.find((r) => r.id === testId);
      
      if (!testResult) {
        throw new Error('Test result not found');
      }

      testResult.notes = notes;

      await chrome.storage.local.set({ abTestResults: results });
    } catch (error) {
      logger.error('Failed to add notes:', error);
    }
  }

  /**
   * Delete a test result
   */
  static async deleteResult(testId: string): Promise<void> {
    try {
      const results = await this.getAllResults();
      const filteredResults = results.filter((r) => r.id !== testId);
      
      await chrome.storage.local.set({ abTestResults: filteredResults });
    } catch (error) {
      logger.error('Failed to delete test result:', error);
    }
  }

  /**
   * Clear all test results
   */
  static async clearAllResults(): Promise<void> {
    try {
      await chrome.storage.local.set({ abTestResults: [] });
    } catch (error) {
      logger.error('Failed to clear test results:', error);
    }
  }

  /**
   * Get comparison statistics
   */
  static async getComparisonStats(): Promise<{
    totalTests: number;
    providerStats: Record<string, {
      timesUsed: number;
      timesSelected: number;
      avgRating: number;
      avgCost: number;
      avgDuration: number;
    }>;
  }> {
    const results = await this.getAllResults();
    
    const stats: any = {
      totalTests: results.length,
      providerStats: {},
    };

    results.forEach((test) => {
      test.providers.forEach((provider) => {
        if (!stats.providerStats[provider.provider]) {
          stats.providerStats[provider.provider] = {
            timesUsed: 0,
            timesSelected: 0,
            avgRating: 0,
            avgCost: 0,
            avgDuration: 0,
            totalRating: 0,
            totalCost: 0,
            totalDuration: 0,
            ratingCount: 0,
          };
        }

        const providerStat = stats.providerStats[provider.provider];
        providerStat.timesUsed++;
        providerStat.totalCost += provider.cost;
        providerStat.totalDuration += provider.duration;

        if (provider.rating) {
          providerStat.totalRating += provider.rating;
          providerStat.ratingCount++;
        }

        if (test.selectedProvider === provider.provider) {
          providerStat.timesSelected++;
        }
      });
    });

    // Calculate averages
    Object.keys(stats.providerStats).forEach((provider) => {
      const providerStat = stats.providerStats[provider];
      providerStat.avgCost = providerStat.totalCost / providerStat.timesUsed;
      providerStat.avgDuration = providerStat.totalDuration / providerStat.timesUsed;
      providerStat.avgRating = providerStat.ratingCount > 0
        ? providerStat.totalRating / providerStat.ratingCount
        : 0;

      // Clean up temporary fields
      delete providerStat.totalRating;
      delete providerStat.totalCost;
      delete providerStat.totalDuration;
      delete providerStat.ratingCount;
    });

    return stats;
  }
}
