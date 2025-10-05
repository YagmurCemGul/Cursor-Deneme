/**
 * Batch Processing for Multiple CVs
 * Process multiple CVs against job descriptions in parallel or sequence
 */

import { CVData, ATSOptimization } from '../types';
import { BatchProcessingJob } from '../types/storage';
import { AIService } from './aiService';
import { logger } from './logger';
import { UsageTracker } from './usageTracker';
import { estimateCVTokens } from './tokenCounter';
import { calculateCost } from './costCalculator';

export interface BatchProcessingOptions {
  operation: 'optimize-cv' | 'generate-cover-letter';
  parallelLimit?: number; // Max parallel requests (default: 3)
  delayBetweenRequests?: number; // Delay in ms (default: 1000)
  continueOnError?: boolean; // Continue if one fails (default: true)
}

export class BatchProcessor {
  private aiService: AIService;
  private activeJobs: Map<string, BatchProcessingJob> = new Map();

  constructor(aiService: AIService) {
    this.aiService = aiService;
  }

  /**
   * Create a new batch processing job
   */
  async createJob(
    name: string,
    items: Array<{ cvId: string; cvData: CVData; jobDescription: string }>,
    options: BatchProcessingOptions
  ): Promise<string> {
    const jobId = `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const job: BatchProcessingJob = {
      id: jobId,
      name,
      status: 'pending',
      createdAt: new Date().toISOString(),
      items: items.map((item) => ({
        cvId: item.cvId,
        jobDescription: item.jobDescription,
        status: 'pending',
      })),
      progress: {
        total: items.length,
        completed: 0,
        failed: 0,
      },
    };

    this.activeJobs.set(jobId, job);
    await this.saveJob(job);

    // Start processing in background
    this.processJob(jobId, items, options).catch((error) => {
      logger.error('Batch job failed:', error);
    });

    return jobId;
  }

  /**
   * Process a batch job
   */
  private async processJob(
    jobId: string,
    items: Array<{ cvId: string; cvData: CVData; jobDescription: string }>,
    options: BatchProcessingOptions
  ): Promise<void> {
    const job = this.activeJobs.get(jobId);
    if (!job) throw new Error('Job not found');

    job.status = 'processing';
    await this.saveJob(job);

    const parallelLimit = options.parallelLimit || 3;
    const delayBetweenRequests = options.delayBetweenRequests || 1000;
    const continueOnError = options.continueOnError ?? true;

    try {
      // Process in batches with parallel limit
      for (let i = 0; i < items.length; i += parallelLimit) {
        const batch = items.slice(i, i + parallelLimit);
        
        const promises = batch.map(async (item, batchIndex) => {
          const itemIndex = i + batchIndex;
          
          try {
            job.items[itemIndex].status = 'processing';
            await this.saveJob(job);

            const startTime = Date.now();
            let result;

            if (options.operation === 'optimize-cv') {
              result = await this.aiService.optimizeCV(item.cvData, item.jobDescription);
            } else if (options.operation === 'generate-cover-letter') {
              result = await this.aiService.generateCoverLetter(
                item.cvData,
                item.jobDescription
              );
            }

            const duration = Date.now() - startTime;

            job.items[itemIndex].status = 'completed';
            job.items[itemIndex].result = result;
            job.progress.completed++;

            // Record usage (simplified - would need actual token counts)
            await UsageTracker.recordUsage({
              provider: 'openai', // Would get from config
              model: 'gpt-4o-mini',
              operation: 'batch-process',
              tokensUsed: {
                prompt: 1000, // Estimate
                completion: 500,
                total: 1500,
              },
              cost: 0,
              duration,
              success: true,
            });

            await this.saveJob(job);
          } catch (error: any) {
            logger.error(`Batch item ${itemIndex} failed:`, error);
            
            job.items[itemIndex].status = 'failed';
            job.items[itemIndex].error = error.message;
            job.progress.failed++;

            await this.saveJob(job);

            if (!continueOnError) {
              throw error;
            }
          }
        });

        await Promise.all(promises);

        // Delay between batches to avoid rate limiting
        if (i + parallelLimit < items.length) {
          await new Promise((resolve) => setTimeout(resolve, delayBetweenRequests));
        }
      }

      job.status = 'completed';
      job.completedAt = new Date().toISOString();
    } catch (error: any) {
      logger.error('Batch processing failed:', error);
      job.status = 'failed';
    }

    await this.saveJob(job);
  }

  /**
   * Get job status
   */
  async getJob(jobId: string): Promise<BatchProcessingJob | null> {
    // First check in-memory
    if (this.activeJobs.has(jobId)) {
      return this.activeJobs.get(jobId)!;
    }

    // Then check storage
    try {
      const result = await chrome.storage.local.get('batchJobs');
      const jobs = result.batchJobs || [];
      return jobs.find((j: BatchProcessingJob) => j.id === jobId) || null;
    } catch (error) {
      logger.error('Failed to get job:', error);
      return null;
    }
  }

  /**
   * Get all jobs
   */
  async getAllJobs(): Promise<BatchProcessingJob[]> {
    try {
      const result = await chrome.storage.local.get('batchJobs');
      return result.batchJobs || [];
    } catch (error) {
      logger.error('Failed to get all jobs:', error);
      return [];
    }
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<void> {
    const job = this.activeJobs.get(jobId);
    if (!job) throw new Error('Job not found or already completed');

    job.status = 'failed';
    job.items.forEach((item) => {
      if (item.status === 'pending' || item.status === 'processing') {
        item.status = 'failed';
        item.error = 'Job cancelled by user';
      }
    });

    await this.saveJob(job);
    this.activeJobs.delete(jobId);
  }

  /**
   * Save job to storage
   */
  private async saveJob(job: BatchProcessingJob): Promise<void> {
    try {
      const result = await chrome.storage.local.get('batchJobs');
      const jobs: BatchProcessingJob[] = result.batchJobs || [];
      
      const existingIndex = jobs.findIndex((j) => j.id === job.id);
      if (existingIndex >= 0) {
        jobs[existingIndex] = job;
      } else {
        jobs.push(job);
      }

      // Keep only last 50 jobs
      const trimmedJobs = jobs.slice(-50);
      
      await chrome.storage.local.set({ batchJobs: trimmedJobs });
    } catch (error) {
      logger.error('Failed to save job:', error);
    }
  }

  /**
   * Delete a job
   */
  async deleteJob(jobId: string): Promise<void> {
    try {
      const result = await chrome.storage.local.get('batchJobs');
      const jobs: BatchProcessingJob[] = result.batchJobs || [];
      
      const filteredJobs = jobs.filter((j) => j.id !== jobId);
      await chrome.storage.local.set({ batchJobs: filteredJobs });
      
      this.activeJobs.delete(jobId);
    } catch (error) {
      logger.error('Failed to delete job:', error);
    }
  }

  /**
   * Clear all completed jobs
   */
  async clearCompletedJobs(): Promise<void> {
    try {
      const jobs = await this.getAllJobs();
      const activeJobs = jobs.filter((j) => j.status === 'pending' || j.status === 'processing');
      await chrome.storage.local.set({ batchJobs: activeJobs });
    } catch (error) {
      logger.error('Failed to clear completed jobs:', error);
    }
  }
}
