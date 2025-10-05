import React, { useState, useEffect } from 'react';
import { AutoSyncService, SyncSettings } from '../utils/autoSyncService';
import { GoogleDriveService, GoogleDriveFile } from '../utils/googleDriveService';
import { t, Lang } from '../i18n';

interface AutoSyncSettingsProps {
  language: Lang;
}

export const AutoSyncSettings: React.FC<AutoSyncSettingsProps> = ({ language }) => {
  const [settings, setSettings] = useState<SyncSettings>({
    enabled: false,
    interval: 30,
    lastSync: null,
    selectedFolderId: null,
    syncOnSave: false,
  });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [folders, setFolders] = useState<GoogleDriveFile[]>([]);
  const [showFolderSelector, setShowFolderSelector] = useState(false);

  useEffect(() => {
    loadSettings();
    loadFolders();
  }, []);

  const loadSettings = async () => {
    const syncSettings = await AutoSyncService.getSyncSettings();
    setSettings(syncSettings);
  };

  const loadFolders = async () => {
    try {
      const folderList = await GoogleDriveService.listFolders();
      setFolders(folderList);
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  };

  const handleToggleSync = async (enabled: boolean) => {
    setLoading(true);
    try {
      const newSettings = { ...settings, enabled };
      await AutoSyncService.saveSyncSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to toggle sync:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIntervalChange = async (interval: number) => {
    setLoading(true);
    try {
      const newSettings = { ...settings, interval };
      await AutoSyncService.saveSyncSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to update interval:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderSelect = async (folderId: string | null) => {
    setLoading(true);
    try {
      const newSettings = { ...settings, selectedFolderId: folderId };
      await AutoSyncService.saveSyncSettings(newSettings);
      setSettings(newSettings);
      setShowFolderSelector(false);
    } catch (error) {
      console.error('Failed to select folder:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSyncOnSave = async (syncOnSave: boolean) => {
    setLoading(true);
    try {
      const newSettings = { ...settings, syncOnSave };
      await AutoSyncService.saveSyncSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to toggle sync on save:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const result = await AutoSyncService.triggerManualSync();
      if (result.success) {
        alert(
          language === 'en'
            ? `Sync completed: ${result.message}`
            : `Senkronizasyon tamamlandı: ${result.message}`
        );
        await loadSettings();
      } else {
        alert(
          language === 'en' ? `Sync failed: ${result.message}` : `Senkronizasyon başarısız: ${result.message}`
        );
      }
    } catch (error) {
      console.error('Manual sync failed:', error);
      alert(language === 'en' ? 'Sync failed' : 'Senkronizasyon başarısız');
    } finally {
      setSyncing(false);
    }
  };

  const selectedFolder = folders.find((f) => f.id === settings.selectedFolderId);

  return (
    <div className="section">
      <h2 className="section-title">
        🔄 {language === 'en' ? 'Auto-Sync Settings' : 'Otomatik Senkronizasyon Ayarları'}
      </h2>

      <div className="card">
        {/* Enable/Disable Sync */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <label className="form-label">
                {language === 'en' ? 'Enable Auto-Sync' : 'Otomatik Senkronizasyonu Etkinleştir'}
              </label>
              <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
                {language === 'en'
                  ? 'Automatically backup your CV profiles to Google Drive'
                  : 'CV profillerinizi otomatik olarak Google Drive\'a yedekleyin'}
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => handleToggleSync(e.target.checked)}
                disabled={loading}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {settings.enabled && (
          <>
            {/* Sync Interval */}
            <div className="form-group">
              <label className="form-label">
                {language === 'en' ? 'Sync Interval' : 'Senkronizasyon Aralığı'}
              </label>
              <select
                className="form-select"
                value={settings.interval}
                onChange={(e) => handleIntervalChange(Number(e.target.value))}
                disabled={loading}
              >
                <option value={15}>{language === 'en' ? '15 minutes' : '15 dakika'}</option>
                <option value={30}>{language === 'en' ? '30 minutes' : '30 dakika'}</option>
                <option value={60}>{language === 'en' ? '1 hour' : '1 saat'}</option>
                <option value={180}>{language === 'en' ? '3 hours' : '3 saat'}</option>
                <option value={360}>{language === 'en' ? '6 hours' : '6 saat'}</option>
                <option value={1440}>{language === 'en' ? '24 hours' : '24 saat'}</option>
              </select>
            </div>

            {/* Folder Selection */}
            <div className="form-group">
              <label className="form-label">
                {language === 'en' ? 'Sync Folder' : 'Senkronizasyon Klasörü'}
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div
                  className="form-input"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'var(--bg-secondary)',
                  }}
                >
                  {selectedFolder ? (
                    <span>
                      📁 {selectedFolder.name}
                    </span>
                  ) : (
                    <span style={{ opacity: 0.5 }}>
                      {language === 'en' ? 'Root folder (default)' : 'Kök klasör (varsayılan)'}
                    </span>
                  )}
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowFolderSelector(true)}
                  disabled={loading}
                >
                  {language === 'en' ? 'Select' : 'Seç'}
                </button>
              </div>
            </div>

            {/* Sync on Save */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <label className="form-label">
                    {language === 'en' ? 'Sync on Save' : 'Kaydetme Sırasında Senkronize Et'}
                  </label>
                  <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
                    {language === 'en'
                      ? 'Automatically sync when you save a profile'
                      : 'Profil kaydettiğinizde otomatik olarak senkronize et'}
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.syncOnSave}
                    onChange={(e) => handleToggleSyncOnSave(e.target.checked)}
                    disabled={loading}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            {/* Last Sync Info */}
            {settings.lastSync && (
              <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>
                  {language === 'en' ? 'Last synchronized:' : 'Son senkronizasyon:'}
                </div>
                <div style={{ fontSize: '14px', marginTop: '4px' }}>
                  {new Date(settings.lastSync).toLocaleString(language === 'en' ? 'en-US' : 'tr-TR')}
                </div>
              </div>
            )}

            {/* Manual Sync Button */}
            <button
              className="btn btn-primary"
              onClick={handleManualSync}
              disabled={loading || syncing}
              style={{ width: '100%', marginTop: '15px' }}
            >
              {syncing ? '⏳' : '🔄'}{' '}
              {language === 'en' ? 'Sync Now' : 'Şimdi Senkronize Et'}
            </button>
          </>
        )}
      </div>

      {/* Folder Selector Modal */}
      {showFolderSelector && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '500px',
              maxHeight: '70vh',
              overflow: 'auto',
              margin: '20px',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h3 className="card-subtitle">
                {language === 'en' ? 'Select Sync Folder' : 'Senkronizasyon Klasörü Seç'}
              </h3>
              <button className="btn btn-secondary" onClick={() => setShowFolderSelector(false)}>
                ✖️
              </button>
            </div>

            {/* Root Folder Option */}
            <div
              className={`card ${settings.selectedFolderId === null ? 'selected' : ''}`}
              style={{
                padding: '12px',
                cursor: 'pointer',
                marginBottom: '10px',
                border: settings.selectedFolderId === null ? '2px solid var(--primary-color)' : undefined,
              }}
              onClick={() => handleFolderSelect(null)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>📁</span>
                  <div style={{ fontWeight: 'bold' }}>
                    {language === 'en' ? 'Root Folder (Default)' : 'Kök Klasör (Varsayılan)'}
                  </div>
                </div>
                {settings.selectedFolderId === null && <span style={{ fontSize: '20px' }}>✓</span>}
              </div>
            </div>

            {/* Folders List */}
            {folders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-text">
                  {language === 'en' ? 'No folders found' : 'Klasör bulunamadı'}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className={`card ${settings.selectedFolderId === folder.id ? 'selected' : ''}`}
                    style={{
                      padding: '12px',
                      cursor: 'pointer',
                      border:
                        settings.selectedFolderId === folder.id ? '2px solid var(--primary-color)' : undefined,
                    }}
                    onClick={() => handleFolderSelect(folder.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '24px' }}>📁</span>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{folder.name}</div>
                          <div style={{ fontSize: '12px', opacity: 0.7 }}>
                            {new Date(folder.createdTime).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      {settings.selectedFolderId === folder.id && <span style={{ fontSize: '20px' }}>✓</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
