import React, { useState, useEffect } from 'react';
import { t, Lang } from '../i18n';
import { CloudPhotoData } from '../types';
import { CloudPhotoStorageService } from '../utils/cloudPhotoStorage';

interface CloudPhotoSyncProps {
  language: Lang;
  onClose: () => void;
  onRestorePhoto: (photoData: CloudPhotoData) => void;
}

export const CloudPhotoSync: React.FC<CloudPhotoSyncProps> = ({
  language,
  onClose,
  onRestorePhoto,
}) => {
  const [library, setLibrary] = useState<CloudPhotoData[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState({
    totalPhotos: 0,
    totalSize: '0 Bytes',
    sharedPhotos: 0,
  });
  const [syncStatus, setSyncStatus] = useState({
    lastSync: null as number | null,
    pendingUploads: 0,
    pendingDownloads: 0,
  });

  useEffect(() => {
    loadLibrary();
    loadStats();
    loadSyncStatus();
  }, []);

  const loadLibrary = () => {
    const photos = CloudPhotoStorageService.getPhotoLibrary();
    setLibrary(photos);
  };

  const loadStats = () => {
    const stats = CloudPhotoStorageService.getStorageStats();
    setStats(stats);
  };

  const loadSyncStatus = () => {
    const status = CloudPhotoStorageService.getSyncStatus();
    setSyncStatus(status);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await CloudPhotoStorageService.syncPhotos();
      CloudPhotoStorageService.updateSyncTime();
      
      loadLibrary();
      loadStats();
      loadSyncStatus();

      alert(`Sync complete! New: ${result.newPhotos}, Updated: ${result.updatedPhotos}, Deleted: ${result.deletedPhotos}`);
    } catch (error) {
      console.error('Sync error:', error);
      alert('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (photoId: string) => {
    if (confirm('Are you sure you want to delete this photo from cloud storage?')) {
      await CloudPhotoStorageService.deletePhoto(photoId);
      loadLibrary();
      loadStats();
    }
  };

  const handleExport = () => {
    const jsonData = CloudPhotoStorageService.exportLibrary();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `photo-library-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const count = await CloudPhotoStorageService.importLibrary(text);
        alert(`Successfully imported ${count} photos!`);
        loadLibrary();
        loadStats();
      } catch (error) {
        alert('Failed to import library. Please check the file format.');
      }
    };
    input.click();
  };

  const formatLastSync = () => {
    if (!syncStatus.lastSync) return 'Never';
    const date = new Date(syncStatus.lastSync);
    const now = Date.now();
    const diff = now - syncStatus.lastSync;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="cloud-sync-overlay" onClick={onClose}>
      <div className="cloud-sync-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cloud-sync-header">
          <h3>☁️ {t(language, 'personal.photoCloudSync')}</h3>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="cloud-sync-stats">
          <div className="cloud-stat-card">
            <div className="cloud-stat-value">{stats.totalPhotos}</div>
            <div className="cloud-stat-label">Total Photos</div>
          </div>
          <div className="cloud-stat-card">
            <div className="cloud-stat-value">{stats.totalSize}</div>
            <div className="cloud-stat-label">Storage Used</div>
          </div>
          <div className="cloud-stat-card">
            <div className="cloud-stat-value">{stats.sharedPhotos}</div>
            <div className="cloud-stat-label">Shared Photos</div>
          </div>
        </div>

        <div className="cloud-sync-status">
          <div className="sync-status-item">
            <span>Last Sync:</span>
            <strong>{formatLastSync()}</strong>
          </div>
          <div className="sync-status-item">
            <span>Pending Uploads:</span>
            <strong>{syncStatus.pendingUploads}</strong>
          </div>
          <div className="sync-status-item">
            <span>Pending Downloads:</span>
            <strong>{syncStatus.pendingDownloads}</strong>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? '⏳ Syncing...' : '🔄 Sync Now'}
          </button>
        </div>

        <div className="cloud-sync-actions">
          <button className="btn btn-secondary" onClick={handleExport}>
            📥 Export Library
          </button>
          <button className="btn btn-secondary" onClick={handleImport}>
            📤 Import Library
          </button>
        </div>

        <div className="cloud-sync-content">
          <h4>Your Cloud Library</h4>
          {library.length === 0 ? (
            <div className="cloud-empty-state">
              <p>No photos in cloud storage yet.</p>
              <p>Upload photos to get started!</p>
            </div>
          ) : (
            <div className="cloud-photos-grid">
              {library.map((photo) => (
                <div key={photo.id} className="cloud-photo-card">
                  <img src={photo.photoDataUrl} alt="Cloud photo" />
                  <div className="cloud-photo-info">
                    <div className="cloud-photo-date">
                      {new Date(photo.uploadedAt).toLocaleDateString()}
                    </div>
                    {photo.synced && <span className="cloud-badge synced">✓ Synced</span>}
                    {photo.shared && <span className="cloud-badge shared">🔗 Shared</span>}
                  </div>
                  <div className="cloud-photo-actions">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => onRestorePhoto(photo)}
                    >
                      Restore
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleDelete(photo.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="cloud-sync-footer">
          <p className="cloud-sync-note">
            💡 Cloud storage is currently simulated using local storage. 
            In production, this would sync with a cloud service like AWS S3, Firebase, or Cloudinary.
          </p>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
