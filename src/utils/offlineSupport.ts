/**
 * Offline Support - Provides fallback functionality when internet is unavailable
 * 
 * Features:
 * - Online/offline detection
 * - Offline queue for pending operations
 * - Local storage-based offline caching
 * - Graceful degradation of features
 * - Sync when connection is restored
 * 
 * @module offlineSupport
 */

import { logger } from './logger';
import { CVData } from '../types';

/**
 * Offline operation types
 */
export type OfflineOperationType = 
  | 'cv_optimization' 
  | 'cover_letter_generation'
  | 'google_drive_export'
  | 'api_call';

/**
 * Queued operation interface
 */
export interface QueuedOperation {
  id: string;
  type: OfflineOperationType;
  payload: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: number; // Higher number = higher priority
}

/**
 * Offline status
 */
export interface OfflineStatus {
  isOnline: boolean;
  lastOnlineTime: number;
  queuedOperations: number;
  offlineModeEnabled: boolean;
}

/**
 * Offline Support Manager
 */
export class OfflineSupportManager {
  private static isOnline: boolean = navigator.onLine;
  private static lastOnlineTime: number = Date.now();
  private static operationQueue: QueuedOperation[] = [];
  private static maxQueueSize: number = 50;
  private static offlineModeEnabled: boolean = true;
  private static syncInProgress: boolean = false;
  private static listeners: Set<(status: OfflineStatus) => void> = new Set();
  private static readonly QUEUE_STORAGE_KEY = 'offline_operation_queue';

  /**
   * Initialize offline support
   */
  static initialize(): void {
    // Set up online/offline event listeners
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Initialize online status
    this.updateOnlineStatus();

    // Load queued operations from storage
    this.loadQueueFromStorage();

    // Periodic online check (every 30 seconds)
    setInterval(() => {
      this.checkConnection();
    }, 30000);

    logger.info('Offline support initialized', {
      isOnline: this.isOnline,
      queuedOps: this.operationQueue.length,
    });
  }

  /**
   * Check if currently online
   */
  static isCurrentlyOnline(): boolean {
    this.updateOnlineStatus();
    return this.isOnline;
  }

  /**
   * Update online status
   */
  private static updateOnlineStatus(): void {
    const wasOnline = this.isOnline;
    this.isOnline = navigator.onLine;

    if (this.isOnline && !wasOnline) {
      this.handleOnline();
    } else if (!this.isOnline && wasOnline) {
      this.handleOffline();
    }
  }

  /**
   * Handle online event
   */
  private static handleOnline(): void {
    this.isOnline = true;
    this.lastOnlineTime = Date.now();
    logger.info('Connection restored - back online');
    
    this.notifyListeners();
    
    // Attempt to process queued operations
    if (this.operationQueue.length > 0) {
      logger.info(`Processing ${this.operationQueue.length} queued operations`);
      this.processSyncQueue();
    }
  }

  /**
   * Handle offline event
   */
  private static handleOffline(): void {
    this.isOnline = false;
    logger.warn('Connection lost - entering offline mode');
    this.notifyListeners();
  }

  /**
   * Check connection by attempting a lightweight network request
   */
  private static async checkConnection(): Promise<boolean> {
    try {
      // Try to fetch a small resource with a short timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!this.isOnline) {
        this.handleOnline();
      }
      return true;
    } catch {
      if (this.isOnline) {
        this.handleOffline();
      }
      return false;
    }
  }

  /**
   * Queue an operation for later execution
   */
  static queueOperation(
    type: OfflineOperationType,
    payload: any,
    priority: number = 5,
    maxRetries: number = 3
  ): string {
    if (this.operationQueue.length >= this.maxQueueSize) {
      logger.warn('Operation queue is full - removing oldest low-priority operation');
      // Remove lowest priority operation
      this.operationQueue.sort((a, b) => a.priority - b.priority);
      this.operationQueue.shift();
    }

    const operation: QueuedOperation = {
      id: `op-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries,
      priority,
    };

    this.operationQueue.push(operation);
    // Sort by priority (descending)
    this.operationQueue.sort((a, b) => b.priority - a.priority);

    logger.info(`Queued operation: ${type}`, { id: operation.id, priority });

    this.saveQueueToStorage();
    this.notifyListeners();

    return operation.id;
  }

  /**
   * Remove operation from queue
   */
  static removeFromQueue(operationId: string): boolean {
    const index = this.operationQueue.findIndex(op => op.id === operationId);
    if (index !== -1) {
      this.operationQueue.splice(index, 1);
      this.saveQueueToStorage();
      this.notifyListeners();
      logger.debug(`Removed operation from queue: ${operationId}`);
      return true;
    }
    return false;
  }

  /**
   * Get queued operations
   */
  static getQueuedOperations(): QueuedOperation[] {
    return [...this.operationQueue];
  }

  /**
   * Clear all queued operations
   */
  static clearQueue(): void {
    this.operationQueue = [];
    this.saveQueueToStorage();
    this.notifyListeners();
    logger.info('Operation queue cleared');
  }

  /**
   * Process sync queue when connection is restored
   */
  private static async processSyncQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline || this.operationQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    logger.info('Starting sync process');

    const operations = [...this.operationQueue];
    
    for (const operation of operations) {
      if (!this.isOnline) {
        logger.info('Connection lost during sync - pausing');
        break;
      }

      try {
        logger.debug(`Processing queued operation: ${operation.type}`, { id: operation.id });
        
        // Here you would dispatch to appropriate handlers
        // This is a placeholder - actual implementation would need handlers
        await this.processOperation(operation);

        // Remove from queue on success
        this.removeFromQueue(operation.id);
        logger.info(`Successfully processed queued operation: ${operation.id}`);
      } catch (error) {
        logger.error(`Failed to process queued operation: ${operation.id}`, error);
        
        operation.retryCount++;
        
        if (operation.retryCount >= operation.maxRetries) {
          logger.warn(`Max retries reached for operation: ${operation.id} - removing from queue`);
          this.removeFromQueue(operation.id);
        } else {
          // Update the operation in queue
          const index = this.operationQueue.findIndex(op => op.id === operation.id);
          if (index !== -1) {
            this.operationQueue[index] = operation;
            this.saveQueueToStorage();
          }
        }
      }
    }

    this.syncInProgress = false;
    logger.info('Sync process completed');
    this.notifyListeners();
  }

  /**
   * Process a single operation (placeholder for actual implementation)
   */
  private static async processOperation(operation: QueuedOperation): Promise<void> {
    // This is a placeholder - actual implementation would need to dispatch
    // to appropriate handlers based on operation type
    logger.debug(`Processing operation: ${operation.type}`, operation);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Save queue to local storage
   */
  private static saveQueueToStorage(): void {
    try {
      localStorage.setItem(this.QUEUE_STORAGE_KEY, JSON.stringify(this.operationQueue));
    } catch (error) {
      logger.error('Failed to save operation queue to storage', error);
    }
  }

  /**
   * Load queue from local storage
   */
  private static loadQueueFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.QUEUE_STORAGE_KEY);
      if (stored) {
        this.operationQueue = JSON.parse(stored);
        logger.info(`Loaded ${this.operationQueue.length} operations from storage`);
      }
    } catch (error) {
      logger.error('Failed to load operation queue from storage', error);
      this.operationQueue = [];
    }
  }

  /**
   * Subscribe to offline status changes
   */
  static subscribe(callback: (status: OfflineStatus) => void): () => void {
    this.listeners.add(callback);
    
    // Immediately notify with current status
    callback(this.getStatus());

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of status change
   */
  private static notifyListeners(): void {
    const status = this.getStatus();
    this.listeners.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        logger.error('Error in offline status callback', error);
      }
    });
  }

  /**
   * Get current offline status
   */
  static getStatus(): OfflineStatus {
    return {
      isOnline: this.isOnline,
      lastOnlineTime: this.lastOnlineTime,
      queuedOperations: this.operationQueue.length,
      offlineModeEnabled: this.offlineModeEnabled,
    };
  }

  /**
   * Enable/disable offline mode
   */
  static setOfflineModeEnabled(enabled: boolean): void {
    this.offlineModeEnabled = enabled;
    logger.info(`Offline mode ${enabled ? 'enabled' : 'disabled'}`);
    this.notifyListeners();
  }

  /**
   * Get offline capabilities for a feature
   */
  static getOfflineCapabilities(feature: string): {
    available: boolean;
    degraded: boolean;
    message: string;
  } {
    const capabilities: Record<string, any> = {
      cv_preview: {
        available: true,
        degraded: false,
        message: 'CV preview is fully available offline',
      },
      cv_optimization: {
        available: true,
        degraded: true,
        message: 'Basic CV suggestions available offline (AI features require internet)',
      },
      cover_letter: {
        available: true,
        degraded: true,
        message: 'Template-based cover letters available offline (AI generation requires internet)',
      },
      google_drive: {
        available: false,
        degraded: false,
        message: 'Google Drive features require internet connection',
      },
      ai_features: {
        available: false,
        degraded: false,
        message: 'AI features require internet connection',
      },
    };

    return capabilities[feature] || {
      available: false,
      degraded: false,
      message: 'This feature requires internet connection',
    };
  }

  /**
   * Get offline fallback data for CV optimization
   */
  static getOfflineOptimizationSuggestions(cvData: CVData): string[] {
    const suggestions: string[] = [];

    // Basic validation suggestions
    if (!cvData.personalInfo.summary || cvData.personalInfo.summary.length < 50) {
      suggestions.push('Add a professional summary (at least 50 characters)');
    }

    if (cvData.skills.length < 5) {
      suggestions.push('Add more relevant skills to improve ATS matching');
    }

    if (cvData.experience.length === 0) {
      suggestions.push('Add your work experience to strengthen your CV');
    }

    // Check for quantification
    const hasNumbers = cvData.experience.some(exp => 
      /\d+%|\d+\+|\d+ [a-z]+/i.test(exp.description)
    );
    if (!hasNumbers) {
      suggestions.push('Add quantifiable achievements (numbers, percentages, metrics)');
    }

    // Check for action verbs
    const weakVerbs = ['responsible for', 'worked on', 'helped with', 'involved in'];
    const hasWeakVerbs = cvData.experience.some(exp =>
      weakVerbs.some(verb => exp.description.toLowerCase().includes(verb))
    );
    if (hasWeakVerbs) {
      suggestions.push('Use strong action verbs (led, developed, implemented, achieved)');
    }

    if (cvData.education.length === 0) {
      suggestions.push('Add your education background');
    }

    return suggestions;
  }
}
