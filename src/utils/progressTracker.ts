/**
 * Progress Tracker - Manages and tracks progress for long-running operations
 * 
 * Features:
 * - Track multiple concurrent operations
 * - Subscribe to progress updates
 * - Aggregate progress across operations
 * - Operation history tracking
 * 
 * @module progressTracker
 */

import { logger } from './logger';

/**
 * Progress status types
 */
export type ProgressStatus = 
  | 'queued'
  | 'pending' 
  | 'in_progress' 
  | 'success' 
  | 'error' 
  | 'timeout' 
  | 'offline'
  | 'cancelled';

/**
 * Operation progress information
 */
export interface OperationProgress {
  id: string;
  name: string;
  status: ProgressStatus;
  message: string;
  progress: number; // 0-100
  startTime: number;
  endTime?: number;
  duration?: number;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Progress update callback type
 */
export type ProgressCallback = (progress: OperationProgress) => void;

/**
 * Progress Tracker class
 */
export class ProgressTracker {
  private static operations: Map<string, OperationProgress> = new Map();
  private static subscribers: Map<string, Set<ProgressCallback>> = new Map();
  private static globalSubscribers: Set<ProgressCallback> = new Set();
  private static history: OperationProgress[] = [];
  private static maxHistorySize: number = 100;

  /**
   * Start tracking a new operation
   * 
   * @param {string} id - Unique identifier for the operation
   * @param {string} name - Human-readable name
   * @param {Record<string, any>} [metadata] - Optional metadata
   * @returns {string} - Operation ID
   */
  static startOperation(
    id: string,
    name: string,
    metadata?: Record<string, any>
  ): string {
    const operation: OperationProgress = {
      id,
      name,
      status: 'pending',
      message: 'Starting...',
      progress: 0,
      startTime: Date.now(),
      metadata: metadata || {},
    };

    this.operations.set(id, operation);
    logger.debug(`Started tracking operation: ${name} (${id})`);
    this.notifySubscribers(id, operation);

    return id;
  }

  /**
   * Update operation progress
   * 
   * @param {string} id - Operation ID
   * @param {Partial<OperationProgress>} update - Progress update
   */
  static updateProgress(id: string, update: Partial<OperationProgress>): void {
    const operation = this.operations.get(id);
    if (!operation) {
      logger.warn(`Attempted to update non-existent operation: ${id}`);
      return;
    }

    const updatedOperation: OperationProgress = {
      ...operation,
      ...update,
      id, // Ensure ID doesn't change
      startTime: operation.startTime, // Preserve start time
    };

    // Calculate duration for completed operations
    if (
      update.status &&
      ['success', 'error', 'timeout', 'cancelled'].includes(update.status) &&
      !updatedOperation.endTime
    ) {
      updatedOperation.endTime = Date.now();
      updatedOperation.duration = updatedOperation.endTime - updatedOperation.startTime;
    }

    this.operations.set(id, updatedOperation);
    logger.debug(`Updated operation ${id}: ${update.status || 'in progress'}`, {
      progress: update.progress,
      message: update.message,
    });
    
    this.notifySubscribers(id, updatedOperation);

    // Add to history if completed
    if (updatedOperation.endTime) {
      this.addToHistory(updatedOperation);
    }
  }

  /**
   * Complete operation successfully
   * 
   * @param {string} id - Operation ID
   * @param {string} [message] - Completion message
   */
  static completeOperation(id: string, message: string = 'Completed successfully'): void {
    this.updateProgress(id, {
      status: 'success',
      message,
      progress: 100,
    });

    // Clean up after a delay
    setTimeout(() => {
      this.operations.delete(id);
    }, 5000);
  }

  /**
   * Fail operation
   * 
   * @param {string} id - Operation ID
   * @param {string} error - Error message
   */
  static failOperation(id: string, error: string): void {
    this.updateProgress(id, {
      status: 'error',
      message: 'Operation failed',
      error,
    });

    // Clean up after a delay
    setTimeout(() => {
      this.operations.delete(id);
    }, 10000);
  }

  /**
   * Cancel operation
   * 
   * @param {string} id - Operation ID
   */
  static cancelOperation(id: string): void {
    this.updateProgress(id, {
      status: 'cancelled',
      message: 'Operation cancelled',
    });

    // Clean up after a delay
    setTimeout(() => {
      this.operations.delete(id);
    }, 3000);
  }

  /**
   * Subscribe to progress updates for a specific operation
   * 
   * @param {string} id - Operation ID
   * @param {ProgressCallback} callback - Callback function
   * @returns {() => void} - Unsubscribe function
   */
  static subscribe(id: string, callback: ProgressCallback): () => void {
    if (!this.subscribers.has(id)) {
      this.subscribers.set(id, new Set());
    }

    this.subscribers.get(id)!.add(callback);
    logger.debug(`Added subscriber for operation: ${id}`);

    // Immediately notify with current state if operation exists
    const operation = this.operations.get(id);
    if (operation) {
      callback(operation);
    }

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(id);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscribers.delete(id);
        }
      }
      logger.debug(`Removed subscriber for operation: ${id}`);
    };
  }

  /**
   * Subscribe to all progress updates
   * 
   * @param {ProgressCallback} callback - Callback function
   * @returns {() => void} - Unsubscribe function
   */
  static subscribeAll(callback: ProgressCallback): () => void {
    this.globalSubscribers.add(callback);
    logger.debug('Added global subscriber');

    // Immediately notify with all current operations
    for (const operation of this.operations.values()) {
      callback(operation);
    }

    // Return unsubscribe function
    return () => {
      this.globalSubscribers.delete(callback);
      logger.debug('Removed global subscriber');
    };
  }

  /**
   * Notify subscribers of progress update
   */
  private static notifySubscribers(id: string, operation: OperationProgress): void {
    // Notify operation-specific subscribers
    const subs = this.subscribers.get(id);
    if (subs) {
      subs.forEach(callback => {
        try {
          callback(operation);
        } catch (error) {
          logger.error('Error in progress subscriber callback', error);
        }
      });
    }

    // Notify global subscribers
    this.globalSubscribers.forEach(callback => {
      try {
        callback(operation);
      } catch (error) {
        logger.error('Error in global progress subscriber callback', error);
      }
    });
  }

  /**
   * Get operation progress
   * 
   * @param {string} id - Operation ID
   * @returns {OperationProgress | null} - Operation progress or null if not found
   */
  static getProgress(id: string): OperationProgress | null {
    return this.operations.get(id) || null;
  }

  /**
   * Get all active operations
   * 
   * @returns {OperationProgress[]} - Array of active operations
   */
  static getAllOperations(): OperationProgress[] {
    return Array.from(this.operations.values());
  }

  /**
   * Get operation history
   * 
   * @param {number} [limit] - Maximum number of entries to return
   * @returns {OperationProgress[]} - Array of completed operations
   */
  static getHistory(limit?: number): OperationProgress[] {
    const history = [...this.history];
    return limit ? history.slice(0, limit) : history;
  }

  /**
   * Clear operation history
   */
  static clearHistory(): void {
    this.history = [];
    logger.info('Progress history cleared');
  }

  /**
   * Add operation to history
   */
  private static addToHistory(operation: OperationProgress): void {
    // Add to beginning of array
    this.history.unshift(operation);

    // Trim history if too large
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Get aggregate progress for multiple operations
   * 
   * @param {string[]} ids - Array of operation IDs
   * @returns {number} - Average progress (0-100)
   */
  static getAggregateProgress(ids: string[]): number {
    if (ids.length === 0) return 0;

    let totalProgress = 0;
    let count = 0;

    for (const id of ids) {
      const operation = this.operations.get(id);
      if (operation) {
        totalProgress += operation.progress;
        count++;
      }
    }

    return count > 0 ? Math.round(totalProgress / count) : 0;
  }

  /**
   * Check if any operations are in progress
   * 
   * @returns {boolean} - True if any operation is in progress
   */
  static hasActiveOperations(): boolean {
    for (const operation of this.operations.values()) {
      if (operation.status === 'in_progress' || operation.status === 'pending') {
        return true;
      }
    }
    return false;
  }

  /**
   * Get statistics about operations
   * 
   * @returns {Object} - Statistics object
   */
  static getStatistics(): {
    active: number;
    pending: number;
    inProgress: number;
    completed: number;
    failed: number;
    cancelled: number;
    averageDuration: number;
  } {
    const stats = {
      active: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      averageDuration: 0,
    };

    // Count active operations
    for (const operation of this.operations.values()) {
      stats.active++;
      if (operation.status === 'pending') stats.pending++;
      if (operation.status === 'in_progress') stats.inProgress++;
    }

    // Count historical operations
    let totalDuration = 0;
    let durationCount = 0;

    for (const operation of this.history) {
      if (operation.status === 'success') stats.completed++;
      if (operation.status === 'error') stats.failed++;
      if (operation.status === 'cancelled') stats.cancelled++;
      
      if (operation.duration) {
        totalDuration += operation.duration;
        durationCount++;
      }
    }

    stats.averageDuration = durationCount > 0 ? Math.round(totalDuration / durationCount) : 0;

    return stats;
  }

  /**
   * Clear all operations
   */
  static clearAll(): void {
    this.operations.clear();
    this.subscribers.clear();
    logger.info('All operations cleared');
  }
}

/**
 * Helper function to create a unique operation ID
 */
export function createOperationId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
