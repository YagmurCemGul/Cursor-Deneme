/**
 * Cloud Backup to Google Drive
 * Automatic backup and restore functionality
 */

import { getAuthToken } from './googleAuth';
import { ResumeProfile, JobApplication } from './types';

export interface BackupMetadata {
  id: string;
  name: string;
  createdAt: string;
  size: number;
  version: string;
  profileCount: number;
  applicationCount: number;
}

export interface BackupData {
  version: string;
  timestamp: string;
  profiles: ResumeProfile[];
  applications: JobApplication[];
  activeProfileId?: string;
}

const BACKUP_FOLDER_NAME = 'CV Builder Backups';
const BACKUP_VERSION = '1.0';

/**
 * Get or create backup folder in Google Drive
 */
async function getBackupFolderId(token: string): Promise<string> {
  // Check if folder exists
  const searchResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${BACKUP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const searchResult = await searchResponse.json();

  if (searchResult.files && searchResult.files.length > 0) {
    return searchResult.files[0].id;
  }

  // Create folder if it doesn't exist
  const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: BACKUP_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  const createResult = await createResponse.json();
  return createResult.id;
}

/**
 * Create backup of all data
 */
export async function createBackup(
  profiles: ResumeProfile[],
  applications: JobApplication[],
  activeProfileId?: string
): Promise<{ success: boolean; backupId?: string; error?: string }> {
  try {
    const token = await getAuthToken();
    const folderId = await getBackupFolderId(token);

    // Prepare backup data
    const backupData: BackupData = {
      version: BACKUP_VERSION,
      timestamp: new Date().toISOString(),
      profiles,
      applications,
      activeProfileId,
    };

    const backupJson = JSON.stringify(backupData, null, 2);
    const backupBlob = new Blob([backupJson], { type: 'application/json' });

    // Create file metadata
    const metadata = {
      name: `CV_Backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`,
      mimeType: 'application/json',
      parents: [folderId],
      description: `CV Builder backup - ${profiles.length} profiles, ${applications.length} applications`,
    };

    // Upload using multipart upload
    const boundary = '-------314159265358979323846';
    const delimiter = '\r\n--' + boundary + '\r\n';
    const closeDelimiter = '\r\n--' + boundary + '--';

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      backupJson +
      closeDelimiter;

    const uploadResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      throw new Error(error.error?.message || 'Failed to upload backup');
    }

    const result = await uploadResponse.json();

    return {
      success: true,
      backupId: result.id,
    };
  } catch (error: any) {
    console.error('Backup error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create backup',
    };
  }
}

/**
 * List all backups from Google Drive
 */
export async function listBackups(): Promise<{
  success: boolean;
  backups?: BackupMetadata[];
  error?: string;
}> {
  try {
    const token = await getAuthToken();
    const folderId = await getBackupFolderId(token);

    // List files in backup folder
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false&orderBy=createdTime desc&fields=files(id,name,createdTime,size,description)`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to list backups');
    }

    const result = await response.json();

    // Parse backup metadata
    const backups: BackupMetadata[] = result.files.map((file: any) => {
      // Try to parse profile/application counts from description
      const description = file.description || '';
      const profileMatch = description.match(/(\d+) profiles?/);
      const applicationMatch = description.match(/(\d+) applications?/);

      return {
        id: file.id,
        name: file.name,
        createdAt: file.createdTime,
        size: parseInt(file.size || '0'),
        version: BACKUP_VERSION,
        profileCount: profileMatch ? parseInt(profileMatch[1]) : 0,
        applicationCount: applicationMatch ? parseInt(applicationMatch[1]) : 0,
      };
    });

    return {
      success: true,
      backups,
    };
  } catch (error: any) {
    console.error('List backups error:', error);
    return {
      success: false,
      error: error.message || 'Failed to list backups',
    };
  }
}

/**
 * Restore backup from Google Drive
 */
export async function restoreBackup(
  backupId: string
): Promise<{ success: boolean; data?: BackupData; error?: string }> {
  try {
    const token = await getAuthToken();

    // Download backup file
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${backupId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to download backup');
    }

    const backupData: BackupData = await response.json();

    // Validate backup data
    if (!backupData.version || !backupData.timestamp || !backupData.profiles) {
      throw new Error('Invalid backup data format');
    }

    return {
      success: true,
      data: backupData,
    };
  } catch (error: any) {
    console.error('Restore backup error:', error);
    return {
      success: false,
      error: error.message || 'Failed to restore backup',
    };
  }
}

/**
 * Delete backup from Google Drive
 */
export async function deleteBackup(backupId: string): Promise<boolean> {
  try {
    const token = await getAuthToken();

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${backupId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Delete backup error:', error);
    return false;
  }
}

/**
 * Auto-backup functionality
 */
export async function setupAutoBackup(intervalHours: number = 24): Promise<void> {
  // Store auto-backup preference
  await chrome.storage.local.set({
    autoBackupEnabled: true,
    autoBackupInterval: intervalHours,
    lastAutoBackup: Date.now(),
  });
}

/**
 * Disable auto-backup
 */
export async function disableAutoBackup(): Promise<void> {
  await chrome.storage.local.set({
    autoBackupEnabled: false,
  });
}

/**
 * Check if auto-backup is due
 */
export async function isAutoBackupDue(): Promise<boolean> {
  const result = await chrome.storage.local.get([
    'autoBackupEnabled',
    'autoBackupInterval',
    'lastAutoBackup',
  ]);

  if (!result.autoBackupEnabled) {
    return false;
  }

  const intervalMs = (result.autoBackupInterval || 24) * 60 * 60 * 1000;
  const timeSinceLastBackup = Date.now() - (result.lastAutoBackup || 0);

  return timeSinceLastBackup >= intervalMs;
}

/**
 * Perform auto-backup if due
 */
export async function performAutoBackupIfDue(
  profiles: ResumeProfile[],
  applications: JobApplication[],
  activeProfileId?: string
): Promise<boolean> {
  const isDue = await isAutoBackupDue();

  if (!isDue) {
    return false;
  }

  const result = await createBackup(profiles, applications, activeProfileId);

  if (result.success) {
    await chrome.storage.local.set({
      lastAutoBackup: Date.now(),
    });
    return true;
  }

  return false;
}

/**
 * Get backup settings
 */
export async function getBackupSettings(): Promise<{
  enabled: boolean;
  interval: number;
  lastBackup: number;
}> {
  const result = await chrome.storage.local.get([
    'autoBackupEnabled',
    'autoBackupInterval',
    'lastAutoBackup',
  ]);

  return {
    enabled: result.autoBackupEnabled || false,
    interval: result.autoBackupInterval || 24,
    lastBackup: result.lastAutoBackup || 0,
  };
}

/**
 * Check if cloud backup is available
 */
export async function isCloudBackupAvailable(): Promise<boolean> {
  try {
    const result = await chrome.storage.local.get(['google_auth_token', 'google_token_expiry']);
    const token = result.google_auth_token;
    const expiry = result.google_token_expiry;
    return !!(token && expiry && Date.now() < expiry);
  } catch {
    return false;
  }
}
