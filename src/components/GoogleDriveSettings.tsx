import React, { useState, useEffect } from 'react';
import { GoogleDriveService, GoogleDriveFile } from '../utils/googleDriveService';
import { t, Lang } from '../i18n';

interface GoogleDriveSettingsProps {
  language: Lang;
}

export const GoogleDriveSettings: React.FC<GoogleDriveSettingsProps> = ({ language }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFileManager, setShowFileManager] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await GoogleDriveService.ensureAuthenticated();
      setIsAuthenticated(authenticated);
    } catch (err) {
      setIsAuthenticated(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const success = await GoogleDriveService.authenticate();
      setIsAuthenticated(success);
      if (success) {
        alert(t(language, 'googleDrive.signInSuccess'));
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      alert(t(language, 'googleDrive.signInError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await GoogleDriveService.signOut();
      setIsAuthenticated(false);
      setFiles([]);
      alert(t(language, 'googleDrive.signOutSuccess'));
    } catch (err: any) {
      setError(err.message || 'Sign out failed');
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const fileList = await GoogleDriveService.listFiles();
      setFiles(fileList);
      setShowFileManager(true);
    } catch (err: any) {
      setError(err.message || 'Failed to load files');
      alert(t(language, 'googleDrive.loadFilesError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (!confirm(t(language, 'googleDrive.confirmDelete').replace('{name}', fileName))) {
      return;
    }

    setLoading(true);
    try {
      await GoogleDriveService.deleteFile(fileId);
      setFiles(files.filter(f => f.id !== fileId));
      alert(t(language, 'googleDrive.deleteSuccess'));
    } catch (err: any) {
      setError(err.message || 'Failed to delete file');
      alert(t(language, 'googleDrive.deleteError'));
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('document')) return '📄';
    if (mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('presentation')) return '📽️';
    if (mimeType.includes('folder')) return '📁';
    return '📎';
  };

  return (
    <div className="section">
      <h2 className="section-title">
        ☁️ {t(language, 'googleDrive.title')}
      </h2>

      <div className="google-drive-status">
        {isAuthenticated ? (
          <div className="alert alert-success">
            <span>✓ {t(language, 'googleDrive.connected')}</span>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleSignOut}
              disabled={loading}
            >
              {t(language, 'googleDrive.signOut')}
            </button>
          </div>
        ) : (
          <div className="alert alert-info">
            <span>{t(language, 'googleDrive.notConnected')}</span>
            <button 
              className="btn btn-primary btn-sm"
              onClick={handleSignIn}
              disabled={loading}
            >
              {loading ? '⏳' : '🔑'} {t(language, 'googleDrive.signIn')}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          ⚠️ {error}
        </div>
      )}

      {isAuthenticated && (
        <>
          <div className="google-drive-info">
            <h3 className="subsection-title">
              {t(language, 'googleDrive.infoTitle')}
            </h3>
            <p className="info-text">
              {t(language, 'googleDrive.infoText')}
            </p>
            <ul className="feature-list">
              <li>📄 {t(language, 'googleDrive.feature1')}</li>
              <li>📊 {t(language, 'googleDrive.feature2')}</li>
              <li>📽️ {t(language, 'googleDrive.feature3')}</li>
              <li>☁️ {t(language, 'googleDrive.feature4')}</li>
            </ul>
          </div>

          <div className="button-group">
            <button 
              className="btn btn-primary"
              onClick={loadFiles}
              disabled={loading}
            >
              📁 {t(language, 'googleDrive.viewFiles')}
            </button>
          </div>

          {showFileManager && (
            <div className="google-drive-files">
              <h3 className="subsection-title">
                {t(language, 'googleDrive.yourFiles')} ({files.length})
              </h3>
              
              {files.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📂</div>
                  <div className="empty-state-text">
                    {t(language, 'googleDrive.noFiles')}
                  </div>
                </div>
              ) : (
                <div className="file-list">
                  {files.map(file => (
                    <div key={file.id} className="file-item">
                      <div className="file-icon">
                        {getFileIcon(file.mimeType)}
                      </div>
                      <div className="file-details">
                        <div className="file-name">{file.name}</div>
                        <div className="file-meta">
                          {new Date(file.createdTime).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="file-actions">
                        <a 
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                        >
                          👁️ {t(language, 'googleDrive.open')}
                        </a>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteFile(file.id, file.name)}
                          disabled={loading}
                        >
                          🗑️ {t(language, 'googleDrive.delete')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className="google-drive-setup">
        <h3 className="subsection-title">
          ⚙️ {t(language, 'googleDrive.setupTitle')}
        </h3>
        <div className="info-text">
          <p>{t(language, 'googleDrive.setupStep1')}</p>
          <p>{t(language, 'googleDrive.setupStep2')}</p>
          <p>{t(language, 'googleDrive.setupStep3')}</p>
          <a 
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-link"
          >
            🔗 {t(language, 'googleDrive.openConsole')}
          </a>
        </div>
      </div>
    </div>
  );
};
