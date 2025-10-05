/**
 * Backup Manager Component
 * Manage cloud backups to Google Drive
 */

import React, { useState, useEffect } from 'react';
import { ResumeProfile, JobApplication } from '../lib/types';
import {
  createBackup,
  listBackups,
  restoreBackup,
  deleteBackup,
  BackupMetadata,
  isCloudBackupAvailable,
} from '../lib/cloudBackup';
import { Button } from './ui';
import { Language } from '../lib/i18n';

interface BackupManagerProps {
  profiles: ResumeProfile[];
  applications: JobApplication[];
  activeProfileId?: string;
  language: Language;
  onRestore: (profiles: ResumeProfile[], applications: JobApplication[], activeProfileId?: string) => void;
  onClose: () => void;
}

export function BackupManager({
  profiles,
  applications,
  activeProfileId,
  language,
  onRestore,
  onClose,
}: BackupManagerProps) {
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);

  const t = (key: string) => {
    const translations: Record<string, { en: string; tr: string }> = {
      title: { en: 'Cloud Backup Manager', tr: 'Bulut Yedekleme Yöneticisi' },
      subtitle: { en: 'Backup and restore your data to Google Drive', tr: 'Verilerinizi Google Drive\'a yedekleyin ve geri yükleyin' },
      createBackup: { en: 'Create New Backup', tr: 'Yeni Yedek Oluştur' },
      creating: { en: 'Creating...', tr: 'Oluşturuluyor...' },
      restoring: { en: 'Restoring...', tr: 'Geri Yükleniyor...' },
      restore: { en: 'Restore', tr: 'Geri Yükle' },
      delete: { en: 'Delete', tr: 'Sil' },
      noBackups: { en: 'No backups found', tr: 'Yedek bulunamadı' },
      noBackupsDesc: { en: 'Create your first backup to get started', tr: 'Başlamak için ilk yedeğinizi oluşturun' },
      backupsList: { en: 'Available Backups', tr: 'Mevcut Yedekler' },
      profiles: { en: 'profiles', tr: 'profil' },
      applications: { en: 'applications', tr: 'başvuru' },
      size: { en: 'Size', tr: 'Boyut' },
      created: { en: 'Created', tr: 'Oluşturulma' },
      confirmRestore: { en: 'Are you sure you want to restore this backup? Current data will be replaced.', tr: 'Bu yedeği geri yüklemek istediğinizden emin misiniz? Mevcut veriler değiştirilecek.' },
      confirmDelete: { en: 'Are you sure you want to delete this backup?', tr: 'Bu yedeği silmek istediğinizden emin misiniz?' },
      close: { en: 'Close', tr: 'Kapat' },
      notConnected: { en: 'Google Drive not connected', tr: 'Google Drive bağlı değil' },
      connectInSettings: { en: 'Please connect in Settings to use cloud backup', tr: 'Bulut yedeklemeyi kullanmak için Ayarlar\'dan bağlanın' },
      openSettings: { en: 'Open Settings', tr: 'Ayarları Aç' },
      refreshing: { en: 'Refreshing...', tr: 'Yenileniyor...' },
      refresh: { en: 'Refresh', tr: 'Yenile' },
    };
    return translations[key]?.[language] || translations[key]?.en || key;
  };

  useEffect(() => {
    loadBackups();
  }, []);

  async function loadBackups() {
    setIsLoading(true);
    
    const available = await isCloudBackupAvailable();
    setIsAvailable(available);

    if (!available) {
      setIsLoading(false);
      return;
    }

    const result = await listBackups();
    
    if (result.success && result.backups) {
      setBackups(result.backups);
    } else {
      console.error('Failed to load backups:', result.error);
    }
    
    setIsLoading(false);
  }

  async function handleCreateBackup() {
    setIsCreating(true);
    
    const result = await createBackup(profiles, applications, activeProfileId);
    
    if (result.success) {
      alert(language === 'tr' 
        ? '✅ Yedek başarıyla oluşturuldu!' 
        : '✅ Backup created successfully!');
      await loadBackups();
    } else {
      alert(language === 'tr'
        ? `❌ Yedek oluşturulamadı: ${result.error}`
        : `❌ Failed to create backup: ${result.error}`);
    }
    
    setIsCreating(false);
  }

  async function handleRestoreBackup(backupId: string) {
    const confirmed = confirm(t('confirmRestore'));
    
    if (!confirmed) return;

    setIsRestoring(true);
    setSelectedBackup(backupId);
    
    const result = await restoreBackup(backupId);
    
    if (result.success && result.data) {
      onRestore(
        result.data.profiles,
        result.data.applications || [],
        result.data.activeProfileId
      );
      alert(language === 'tr'
        ? '✅ Yedek başarıyla geri yüklendi!'
        : '✅ Backup restored successfully!');
      onClose();
    } else {
      alert(language === 'tr'
        ? `❌ Yedek geri yüklenemedi: ${result.error}`
        : `❌ Failed to restore backup: ${result.error}`);
    }
    
    setIsRestoring(false);
    setSelectedBackup(null);
  }

  async function handleDeleteBackup(backupId: string, backupName: string) {
    const confirmed = confirm(t('confirmDelete'));
    
    if (!confirmed) return;

    const success = await deleteBackup(backupId);
    
    if (success) {
      alert(language === 'tr'
        ? '✅ Yedek silindi!'
        : '✅ Backup deleted!');
      await loadBackups();
    } else {
      alert(language === 'tr'
        ? '❌ Yedek silinemedi'
        : '❌ Failed to delete backup');
    }
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 16,
          maxWidth: 800,
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 32px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 24, color: '#1e293b' }}>
              ☁️ {t('title')}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: '#64748b' }}>
              {t('subtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: '#64748b',
              padding: 8,
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
          {!isAvailable ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🔒</div>
              <h3 style={{ margin: '0 0 8px', fontSize: 18, color: '#1e293b' }}>
                {t('notConnected')}
              </h3>
              <p style={{ margin: '0 0 24px', fontSize: 14, color: '#64748b' }}>
                {t('connectInSettings')}
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  chrome.runtime.openOptionsPage();
                  onClose();
                }}
              >
                {t('openSettings')}
              </Button>
            </div>
          ) : (
            <>
              {/* Create Backup Button */}
              <div style={{ marginBottom: 24 }}>
                <Button
                  variant="primary"
                  onClick={handleCreateBackup}
                  disabled={isCreating}
                  style={{ width: '100%', fontSize: 15 }}
                >
                  {isCreating ? `⏳ ${t('creating')}` : `💾 ${t('createBackup')}`}
                </Button>
              </div>

              {/* Current Data Summary */}
              <div
                style={{
                  padding: 16,
                  background: '#f8fafc',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  marginBottom: 24,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
                  📊 Current Data:
                </div>
                <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#64748b' }}>
                  <div>
                    <strong>{profiles.length}</strong> {t('profiles')}
                  </div>
                  <div>
                    <strong>{applications.length}</strong> {t('applications')}
                  </div>
                </div>
              </div>

              {/* Backups List */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 16,
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 16, color: '#1e293b' }}>
                    {t('backupsList')}
                  </h3>
                  <button
                    onClick={loadBackups}
                    disabled={isLoading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#667eea',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    {isLoading ? t('refreshing') : `🔄 ${t('refresh')}`}
                  </button>
                </div>

                {isLoading ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                    ⏳ Loading backups...
                  </div>
                ) : backups.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
                      {t('noBackups')}
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>
                      {t('noBackupsDesc')}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {backups.map((backup) => (
                      <div
                        key={backup.id}
                        style={{
                          padding: 16,
                          background: 'white',
                          border: '2px solid #e2e8f0',
                          borderRadius: 12,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
                            {backup.name}
                          </div>
                          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b' }}>
                            <div>
                              📅 {formatDate(backup.createdAt)}
                            </div>
                            <div>
                              👤 {backup.profileCount} {t('profiles')}
                            </div>
                            <div>
                              📄 {backup.applicationCount} {t('applications')}
                            </div>
                            <div>
                              💾 {formatSize(backup.size)}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button
                            variant="primary"
                            onClick={() => handleRestoreBackup(backup.id)}
                            disabled={isRestoring && selectedBackup === backup.id}
                            style={{ fontSize: 13 }}
                          >
                            {isRestoring && selectedBackup === backup.id
                              ? t('restoring')
                              : `↩️ ${t('restore')}`}
                          </Button>
                          <button
                            onClick={() => handleDeleteBackup(backup.id, backup.name)}
                            style={{
                              padding: '8px 12px',
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              borderRadius: 8,
                              cursor: 'pointer',
                              fontSize: 13,
                              fontWeight: 500,
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 32px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button variant="secondary" onClick={onClose}>
            {t('close')}
          </Button>
        </div>
      </div>
    </div>
  );
}
