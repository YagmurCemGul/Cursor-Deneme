/**
 * Worker Manager
 * Manages Web Workers for background processing
 * 
 * @module workerManager
 * @description Provides easy interface to use Web Workers
 */

import { CVData, ATSOptimization } from '../types';
import { logger } from './logger';

/**
 * Worker task
 */
interface WorkerTask<T> {
  id: string;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  timeout?: NodeJS.Timeout;
}

/**
 * Worker Manager
 * Manages worker pool and task distribution
 */
export class WorkerManager {
  private worker: Worker | null = null;
  private tasks = new Map<string, WorkerTask<any>>();
  private taskIdCounter = 0;

  /**
   * Initialize worker
   */
  init(): void {
    if (this.worker) return;

    try {
      this.worker = new Worker(
        new URL('../workers/cvProcessor.worker.ts', import.meta.url),
        { type: 'module' }
      );

      this.worker.onmessage = this.handleMessage.bind(this);
      this.worker.onerror = this.handleError.bind(this);

      logger.info('Worker manager initialized');
    } catch (error) {
      logger.error('Failed to initialize worker:', error);
    }
  }

  /**
   * Parse CV file in worker
   */
  async parseCV(
    file: ArrayBuffer,
    format: 'pdf' | 'docx' | 'txt'
  ): Promise<CVData> {
    return this.postTask('PARSE_CV', { file, format });
  }

  /**
   * Optimize CV locally (without AI)
   */
  async optimizeLocal(
    cvData: CVData,
    keywords: string[]
  ): Promise<ATSOptimization[]> {
    return this.postTask('OPTIMIZE_LOCAL', { cvData, keywords });
  }

  /**
   * Analyze ATS compatibility
   */
  async analyzeATS(cvData: CVData): Promise<{
    score: number;
    issues: string[];
    recommendations: string[];
  }> {
    return this.postTask('ANALYZE_ATS', { cvData });
  }

  /**
   * Extract text from file
   */
  async extractText(file: ArrayBuffer): Promise<string> {
    return this.postTask('EXTRACT_TEXT', { file });
  }

  /**
   * Calculate match score
   */
  async calculateMatchScore(
    cvData: CVData,
    jobDescription: string
  ): Promise<{ score: number; matches: string[]; missing: string[] }> {
    return this.postTask('CALCULATE_SCORE', { cvData, jobDescription });
  }

  /**
   * Post task to worker
   */
  private postTask<T>(type: string, data: any, timeout = 30000): Promise<T> {
    if (!this.worker) {
      this.init();
    }

    const taskId = `task_${++this.taskIdCounter}`;

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.tasks.delete(taskId);
        reject(new Error(`Worker task timeout: ${type}`));
      }, timeout);

      this.tasks.set(taskId, { id: taskId, resolve, reject, timeout: timeoutId });

      this.worker!.postMessage({
        type,
        data,
        taskId
      });
    });
  }

  /**
   * Handle worker message
   */
  private handleMessage(event: MessageEvent): void {
    const { type, data, error, taskId } = event.data;

    const task = this.tasks.get(taskId);
    if (!task) return;

    if (task.timeout) {
      clearTimeout(task.timeout);
    }

    this.tasks.delete(taskId);

    if (error) {
      task.reject(new Error(error));
    } else if (type.endsWith('_SUCCESS')) {
      task.resolve(data);
    }
  }

  /**
   * Handle worker error
   */
  private handleError(error: ErrorEvent): void {
    logger.error('Worker error:', error);
    
    // Reject all pending tasks
    this.tasks.forEach(task => {
      if (task.timeout) {
        clearTimeout(task.timeout);
      }
      task.reject(new Error('Worker crashed'));
    });
    
    this.tasks.clear();

    // Reinitialize worker
    this.terminate();
    this.init();
  }

  /**
   * Terminate worker
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      logger.info('Worker terminated');
    }
  }
}

/**
 * Global worker manager instance
 */
let globalWorkerManager: WorkerManager | null = null;

/**
 * Get or create global worker manager
 */
export function getWorkerManager(): WorkerManager {
  if (!globalWorkerManager) {
    globalWorkerManager = new WorkerManager();
    globalWorkerManager.init();
  }
  return globalWorkerManager;
}

/**
 * Helper functions for common tasks
 */
export const workerTasks = {
  parseCV: (file: ArrayBuffer, format: 'pdf' | 'docx' | 'txt') =>
    getWorkerManager().parseCV(file, format),

  optimizeLocal: (cvData: CVData, keywords: string[]) =>
    getWorkerManager().optimizeLocal(cvData, keywords),

  analyzeATS: (cvData: CVData) =>
    getWorkerManager().analyzeATS(cvData),

  extractText: (file: ArrayBuffer) =>
    getWorkerManager().extractText(file),

  calculateMatchScore: (cvData: CVData, jobDescription: string) =>
    getWorkerManager().calculateMatchScore(cvData, jobDescription)
};
