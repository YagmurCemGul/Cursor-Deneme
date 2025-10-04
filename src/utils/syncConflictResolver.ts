/**
 * Sync Conflict Resolution Service
 * Handles conflicts when the same profile is edited in multiple places
 */

import { CVData, CVProfile } from '../types';
import { StorageService } from './storage';
import { logger } from './logger';

export interface SyncConflict {
  id: string;
  profileId: string;
  localVersion: CVProfile;
  remoteVersion: CVProfile;
  timestamp: string;
  resolved: boolean;
}

export interface SyncHistory {
  id: string;
  profileId: string;
  action: 'sync' | 'conflict' | 'rollback';
  timestamp: string;
  details: string;
  snapshot?: CVProfile;
}

export type ConflictResolutionStrategy = 'keep-local' | 'keep-remote' | 'merge' | 'manual';

export class SyncConflictResolver {
  /**
   * Detect conflicts between local and remote versions
   */
  static async detectConflict(
    localProfile: CVProfile,
    remoteProfile: CVProfile
  ): Promise<boolean> {
    // Check if both have been modified since last sync
    const localModified = new Date(localProfile.updatedAt);
    const remoteModified = new Date(remoteProfile.updatedAt);

    // If timestamps are very close (within 5 seconds), no conflict
    const timeDiff = Math.abs(localModified.getTime() - remoteModified.getTime());
    if (timeDiff < 5000) return false;

    // Check if data is different
    const localData = JSON.stringify(localProfile.data);
    const remoteData = JSON.stringify(remoteProfile.data);

    return localData !== remoteData;
  }

  /**
   * Save conflict for manual resolution
   */
  static async saveConflict(
    localProfile: CVProfile,
    remoteProfile: CVProfile
  ): Promise<SyncConflict> {
    const conflict: SyncConflict = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      profileId: localProfile.id,
      localVersion: localProfile,
      remoteVersion: remoteProfile,
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    const { syncConflicts = [] } = await chrome.storage.local.get('syncConflicts');
    syncConflicts.push(conflict);
    await chrome.storage.local.set({ syncConflicts });

    logger.warn(`Sync conflict detected for profile ${localProfile.name}`);
    return conflict;
  }

  /**
   * Get all unresolved conflicts
   */
  static async getConflicts(): Promise<SyncConflict[]> {
    const { syncConflicts = [] } = await chrome.storage.local.get('syncConflicts');
    return syncConflicts.filter((c: SyncConflict) => !c.resolved);
  }

  /**
   * Resolve conflict with a specific strategy
   */
  static async resolveConflict(
    conflictId: string,
    strategy: ConflictResolutionStrategy,
    mergedData?: CVData
  ): Promise<CVProfile> {
    const { syncConflicts = [] } = await chrome.storage.local.get('syncConflicts');
    const conflict = syncConflicts.find((c: SyncConflict) => c.id === conflictId);

    if (!conflict) {
      throw new Error('Conflict not found');
    }

    let resolvedProfile: CVProfile;

    switch (strategy) {
      case 'keep-local':
        resolvedProfile = conflict.localVersion;
        break;

      case 'keep-remote':
        resolvedProfile = conflict.remoteVersion;
        break;

      case 'merge':
        if (!mergedData) {
          throw new Error('Merged data required for merge strategy');
        }
        resolvedProfile = {
          ...conflict.localVersion,
          data: mergedData,
          updatedAt: new Date().toISOString(),
        };
        break;

      case 'manual':
        // User has manually edited the conflict
        if (!mergedData) {
          throw new Error('Manual resolution requires merged data');
        }
        resolvedProfile = {
          ...conflict.localVersion,
          data: mergedData,
          updatedAt: new Date().toISOString(),
        };
        break;
    }

    // Save resolved profile
    await StorageService.saveProfile(resolvedProfile);

    // Mark conflict as resolved
    conflict.resolved = true;
    await chrome.storage.local.set({ syncConflicts });

    // Add to sync history
    await this.addToHistory({
      id: Date.now().toString(),
      profileId: conflict.profileId,
      action: 'conflict',
      timestamp: new Date().toISOString(),
      details: `Conflict resolved using ${strategy} strategy`,
      snapshot: resolvedProfile,
    });

    logger.info(`Conflict resolved for profile ${resolvedProfile.name} using ${strategy}`);
    return resolvedProfile;
  }

  /**
   * Smart merge of two profile versions
   */
  static smartMerge(localProfile: CVProfile, remoteProfile: CVProfile): CVData {
    const merged: CVData = { ...localProfile.data };

    // Merge personal info (prefer non-empty fields)
    Object.keys(remoteProfile.data.personalInfo).forEach((key) => {
      const remoteValue = (remoteProfile.data.personalInfo as any)[key];
      const localValue = (merged.personalInfo as any)[key];
      
      if (remoteValue && (!localValue || remoteValue.length > localValue.length)) {
        (merged.personalInfo as any)[key] = remoteValue;
      }
    });

    // Merge arrays (combine and deduplicate)
    merged.skills = [...new Set([...localProfile.data.skills, ...remoteProfile.data.skills])];

    // Merge experience (combine by ID)
    const experienceMap = new Map();
    [...localProfile.data.experience, ...remoteProfile.data.experience].forEach((exp) => {
      const existing = experienceMap.get(exp.id);
      if (!existing || new Date(exp.startDate) > new Date(existing.startDate)) {
        experienceMap.set(exp.id, exp);
      }
    });
    merged.experience = Array.from(experienceMap.values());

    // Merge education
    const educationMap = new Map();
    [...localProfile.data.education, ...remoteProfile.data.education].forEach((edu) => {
      const existing = educationMap.get(edu.id);
      if (!existing || new Date(edu.startDate) > new Date(existing.startDate)) {
        educationMap.set(edu.id, edu);
      }
    });
    merged.education = Array.from(educationMap.values());

    // Merge certifications
    const certMap = new Map();
    [...localProfile.data.certifications, ...remoteProfile.data.certifications].forEach((cert) => {
      const existing = certMap.get(cert.id);
      if (!existing || new Date(cert.issueDate) > new Date(existing.issueDate)) {
        certMap.set(cert.id, cert);
      }
    });
    merged.certifications = Array.from(certMap.values());

    // Merge projects
    const projectMap = new Map();
    [...localProfile.data.projects, ...remoteProfile.data.projects].forEach((proj) => {
      const existing = projectMap.get(proj.id);
      if (!existing || new Date(proj.startDate) > new Date(existing.startDate)) {
        projectMap.set(proj.id, proj);
      }
    });
    merged.projects = Array.from(projectMap.values());

    return merged;
  }

  /**
   * Add entry to sync history
   */
  static async addToHistory(entry: SyncHistory): Promise<void> {
    const { syncHistory = [] } = await chrome.storage.local.get('syncHistory');
    syncHistory.push(entry);
    
    // Keep only last 50 entries
    const trimmed = syncHistory.slice(-50);
    await chrome.storage.local.set({ syncHistory: trimmed });
  }

  /**
   * Get sync history for a profile
   */
  static async getHistory(profileId?: string): Promise<SyncHistory[]> {
    const { syncHistory = [] } = await chrome.storage.local.get('syncHistory');
    
    if (profileId) {
      return syncHistory.filter((h: SyncHistory) => h.profileId === profileId);
    }
    
    return syncHistory;
  }

  /**
   * Rollback to a previous version from history
   */
  static async rollback(historyId: string): Promise<CVProfile> {
    const history = await this.getHistory();
    const entry = history.find((h) => h.id === historyId);

    if (!entry || !entry.snapshot) {
      throw new Error('History entry not found or has no snapshot');
    }

    // Restore the snapshot
    await StorageService.saveProfile(entry.snapshot);

    // Add rollback entry to history
    await this.addToHistory({
      id: Date.now().toString(),
      profileId: entry.profileId,
      action: 'rollback',
      timestamp: new Date().toISOString(),
      details: `Rolled back to version from ${entry.timestamp}`,
      snapshot: entry.snapshot,
    });

    logger.info(`Rolled back profile ${entry.snapshot.name} to ${entry.timestamp}`);
    return entry.snapshot;
  }

  /**
   * Clear resolved conflicts older than specified days
   */
  static async cleanupOldConflicts(daysOld: number = 30): Promise<number> {
    const { syncConflicts = [] } = await chrome.storage.local.get('syncConflicts');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const remaining = syncConflicts.filter((c: SyncConflict) => {
      if (!c.resolved) return true; // Keep unresolved
      return new Date(c.timestamp) > cutoffDate;
    });

    const removed = syncConflicts.length - remaining.length;
    await chrome.storage.local.set({ syncConflicts: remaining });

    return removed;
  }
}
