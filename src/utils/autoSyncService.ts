/**
 * Auto-Sync Service for Google Drive
 * Automatically synchronizes CV data with Google Drive at regular intervals
 */

import { CVData, ATSOptimization } from '../types';
import { GoogleDriveService } from './googleDriveService';
import { StorageService } from './storage';
import { logger } from './logger';

export interface SyncSettings {
  enabled: boolean;
  interval: number; // in minutes
  lastSync: string | null;
  selectedFolderId: string | null;
  syncOnSave: boolean;
}

export class AutoSyncService {
  private static syncIntervalId: number | null = null;
  private static isSyncing = false;

  /**
   * Initialize auto-sync service
   */
  static async initialize(): Promise<void> {
    const settings = await this.getSyncSettings();
    
    if (settings.enabled) {
      this.startAutoSync(settings.interval);
    }
  }

  /**
   * Get sync settings from storage
   */
  static async getSyncSettings(): Promise<SyncSettings> {
    const settings = await StorageService.getSettings();
    return (settings as any)?.syncSettings || {
      enabled: false,
      interval: 30, // default 30 minutes
      lastSync: null,
      selectedFolderId: null,
      syncOnSave: false,
    };
  }

  /**
   * Save sync settings
   */
  static async saveSyncSettings(settings: SyncSettings): Promise<void> {
    const currentSettings = await StorageService.getSettings() || {};
    (currentSettings as any).syncSettings = settings;
    await StorageService.saveSettings(currentSettings);

    // Update sync interval if enabled
    if (settings.enabled) {
      this.startAutoSync(settings.interval);
    } else {
      this.stopAutoSync();
    }
  }

  /**
   * Start automatic synchronization
   */
  static startAutoSync(intervalMinutes: number): void {
    // Clear existing interval
    this.stopAutoSync();

    // Convert minutes to milliseconds
    const intervalMs = intervalMinutes * 60 * 1000;

    // Set up new interval
    this.syncIntervalId = window.setInterval(() => {
      this.performSync();
    }, intervalMs);

    logger.info(`Auto-sync started with interval: ${intervalMinutes} minutes`);
  }

  /**
   * Stop automatic synchronization
   */
  static stopAutoSync(): void {
    if (this.syncIntervalId !== null) {
      window.clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
      logger.info('Auto-sync stopped');
    }
  }

  /**
   * Perform synchronization
   */
  static async performSync(): Promise<{ success: boolean; message: string }> {
    if (this.isSyncing) {
      return { success: false, message: 'Sync already in progress' };
    }

    this.isSyncing = true;

    try {
      // Check if authenticated
      const isAuthenticated = await GoogleDriveService.ensureAuthenticated();
      if (!isAuthenticated) {
        return { success: false, message: 'Not authenticated with Google Drive' };
      }

      // Get sync settings
      const settings = await this.getSyncSettings();
      
      // Get all profiles
      const profiles = await StorageService.getProfiles();
      
      if (profiles.length === 0) {
        return { success: true, message: 'No profiles to sync' };
      }

      // Sync each profile
      let syncedCount = 0;
      for (const profile of profiles) {
        try {
          await GoogleDriveService.exportToGoogleDocsWithFolder(
            profile.data,
            [], // Empty optimizations for auto-sync
            settings.selectedFolderId || undefined
          );
          syncedCount++;
        } catch (error) {
          logger.error(`Failed to sync profile ${profile.name}:`, error);
        }
      }

      // Update last sync time
      settings.lastSync = new Date().toISOString();
      await this.saveSyncSettings(settings);

      logger.info(`Auto-sync completed: ${syncedCount}/${profiles.length} profiles synced`);
      
      return { 
        success: true, 
        message: `Successfully synced ${syncedCount} of ${profiles.length} profiles` 
      };
    } catch (error: any) {
      logger.error('Auto-sync failed:', error);
      return { success: false, message: error.message || 'Sync failed' };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Manual sync trigger
   */
  static async triggerManualSync(): Promise<{ success: boolean; message: string }> {
    return await this.performSync();
  }

  /**
   * Sync single profile (used for syncOnSave)
   */
  static async syncProfile(cvData: CVData, optimizations: ATSOptimization[] = []): Promise<boolean> {
    try {
      const settings = await this.getSyncSettings();
      
      if (!settings.syncOnSave) {
        return false;
      }

      const isAuthenticated = await GoogleDriveService.ensureAuthenticated();
      if (!isAuthenticated) {
        return false;
      }

      await GoogleDriveService.exportToGoogleDocsWithFolder(
        cvData,
        optimizations,
        settings.selectedFolderId || undefined
      );

      return true;
    } catch (error) {
      logger.error('Failed to sync profile on save:', error);
      return false;
    }
  }

  /**
   * Get sync status
   */
  static getSyncStatus(): { isSyncing: boolean; intervalActive: boolean } {
    return {
      isSyncing: this.isSyncing,
      intervalActive: this.syncIntervalId !== null,
    };
  }
}
