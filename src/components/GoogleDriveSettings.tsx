import React, { useState, useEffect } from 'react';
import { GoogleDriveService, GoogleDriveFile } from '../utils/googleDriveService';
import { logger } from '../utils/logger';
import { t, Lang } from '../i18n';

interface GoogleDriveSettingsProps {
  language: Lang;
}

export const GoogleDriveSettings: React.FC<GoogleDriveSettingsProps> = ({ language }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [folders, setFolders] = useState<GoogleDriveFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFileManager, setShowFileManager] = useState(false);
  const [showFolderSelector, setShowFolderSelector] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [showEmailShare, setShowEmailShare] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [shareRole, setShareRole] = useState<'reader' | 'writer'>('reader');
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    checkAuthStatus();
    checkSetupStatus();
  }, []);

  const checkSetupStatus = () => {
    try {
      const manifest = chrome.runtime.getManifest();
      const oauth2 = (manifest as any).oauth2;

      if (
        !oauth2 ||
        !oauth2.client_id ||
        oauth2.client_id === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com' ||
        oauth2.client_id.includes('YOUR_GOOGLE_CLIENT_ID')
      ) {
        setSetupRequired(true);
        setError(t(language, 'googleDrive.clientIdPlaceholder'));
      }
    } catch (err) {
      logger.error('Failed to check setup status:', err);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const authenticated = await GoogleDriveService.ensureAuthenticated();
      setIsAuthenticated(authenticated);
      setError(null);
    } catch (err: any) {
      setIsAuthenticated(false);
      // Don't show auth errors if setup is not complete
      if (!setupRequired) {
        setError(err.message || 'Authentication check failed');
      }
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const success = await GoogleDriveService.authenticate();
      setIsAuthenticated(success);
      if (success) {
        setSetupRequired(false);
        alert(t(language, 'googleDrive.signInSuccess'));
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Authentication failed';

      // Check for specific error types and provide helpful messages
      if (errorMessage.includes('setup') || errorMessage.includes('Client ID')) {
        setSetupRequired(true);
        setError(errorMessage);
        setShowTroubleshooting(true);
      } else if (
        errorMessage.includes('bad client id') ||
        errorMessage.includes('Invalid Client ID')
      ) {
        setError(t(language, 'googleDrive.badClientIdError'));
        setShowTroubleshooting(true);
      } else {
        setError(errorMessage);
      }

      // Show a more user-friendly alert
      if (setupRequired) {
        alert(t(language, 'googleDrive.setupRequired') + '\\n\\n' + errorMessage);
      } else {
        alert(t(language, 'googleDrive.signInError') + '\\n\\n' + errorMessage);
      }
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
      setFiles(files.filter((f) => f.id !== fileId));
      alert(t(language, 'googleDrive.deleteSuccess'));
    } catch (err: any) {
      setError(err.message || 'Failed to delete file');
      alert(t(language, 'googleDrive.deleteError'));
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async () => {
    setLoading(true);
    setError(null);
    try {
      const folderList = await GoogleDriveService.listFolders();
      setFolders(folderList);
      setShowFolderSelector(true);
    } catch (err: any) {
      setError(err.message || 'Failed to load folders');
      alert(language === 'en' ? 'Failed to load folders' : 'Klasörler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      alert(language === 'en' ? 'Please enter a folder name' : 'Lütfen bir klasör adı girin');
      return;
    }

    setLoading(true);
    try {
      const folder = await GoogleDriveService.createFolder(newFolderName);
      setFolders([...folders, folder]);
      setNewFolderName('');
      alert(language === 'en' ? 'Folder created successfully' : 'Klasör başarıyla oluşturuldu');
    } catch (err: any) {
      setError(err.message || 'Failed to create folder');
      alert(language === 'en' ? 'Failed to create folder' : 'Klasör oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleShareFile = async (fileId: string) => {
    if (!shareEmail.trim()) {
      alert(language === 'en' ? 'Please enter an email address' : 'Lütfen bir e-posta adresi girin');
      return;
    }

    setLoading(true);
    try {
      await GoogleDriveService.shareFile(fileId, shareEmail, shareRole);
      alert(
        language === 'en'
          ? `File shared successfully with ${shareEmail}`
          : `Dosya ${shareEmail} ile başarıyla paylaşıldı`
      );
      setShowEmailShare(null);
      setShareEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to share file');
      alert(language === 'en' ? 'Failed to share file' : 'Dosya paylaşılamadı');
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
      <h2 className="section-title">☁️ {t(language, 'googleDrive.title')}</h2>

      {setupRequired && (
        <div className="alert alert-warning" style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '10px' }}>
            <strong>⚠️ {t(language, 'googleDrive.setupRequired')}</strong>
          </div>
          <div style={{ marginBottom: '10px' }}>{t(language, 'googleDrive.setupRequiredDesc')}</div>
          <ol style={{ marginLeft: '20px', marginTop: '10px' }}>
            <li>{t(language, 'googleDrive.setupStep1')}</li>
            <li>{t(language, 'googleDrive.setupStep2')}</li>
            <li>{t(language, 'googleDrive.setupStep3')}</li>
          </ol>
          <div style={{ marginTop: '15px' }}>
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
              style={{ marginRight: '10px' }}
            >
              🔗 {t(language, 'googleDrive.openConsole')}
            </a>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => window.open('QUICK_START_GOOGLE_DRIVE.md', '_blank')}
            >
              📖 {t(language, 'googleDrive.viewFullGuide')}
            </button>
          </div>
        </div>
      )}

      <div className="google-drive-status">
        {isAuthenticated ? (
          <div className="alert alert-success">
            <span>✓ {t(language, 'googleDrive.connected')}</span>
            <button className="btn btn-secondary btn-sm" onClick={handleSignOut} disabled={loading}>
              {t(language, 'googleDrive.signOut')}
            </button>
          </div>
        ) : (
          <div className="alert alert-info">
            <span>{t(language, 'googleDrive.notConnected')}</span>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSignIn}
              disabled={loading || setupRequired}
              title={setupRequired ? t(language, 'googleDrive.setupRequired') : ''}
            >
              {loading ? '⏳' : '🔑'} {t(language, 'googleDrive.signIn')}
            </button>
          </div>
        )}
      </div>

      {error && !setupRequired && <div className="alert alert-error">⚠️ {error}</div>}

      {isAuthenticated && (
        <>
          <div className="google-drive-info">
            <h3 className="subsection-title">{t(language, 'googleDrive.infoTitle')}</h3>
            <p className="info-text">{t(language, 'googleDrive.infoText')}</p>
            <ul className="feature-list">
              <li>📄 {t(language, 'googleDrive.feature1')}</li>
              <li>📊 {t(language, 'googleDrive.feature2')}</li>
              <li>📽️ {t(language, 'googleDrive.feature3')}</li>
              <li>☁️ {t(language, 'googleDrive.feature4')}</li>
            </ul>
          </div>

          <div className="button-group" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={loadFiles} disabled={loading}>
              📁 {t(language, 'googleDrive.viewFiles')}
            </button>
            <button className="btn btn-secondary" onClick={loadFolders} disabled={loading}>
              📂 {language === 'en' ? 'Manage Folders' : 'Klasörleri Yönet'}
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
                  <div className="empty-state-text">{t(language, 'googleDrive.noFiles')}</div>
                </div>
              ) : (
                <div className="file-list">
                  {files.map((file) => (
                    <div key={file.id} className="file-item">
                      <div className="file-icon">{getFileIcon(file.mimeType)}</div>
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
                          className="btn btn-info btn-sm"
                          onClick={() => setShowEmailShare(file.id)}
                          disabled={loading}
                        >
                          📧 {language === 'en' ? 'Share' : 'Paylaş'}
                        </button>
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
                  maxWidth: '600px',
                  maxHeight: '80vh',
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
                    📂 {language === 'en' ? 'Manage Folders' : 'Klasör Yönetimi'}
                  </h3>
                  <button className="btn btn-secondary" onClick={() => setShowFolderSelector(false)}>
                    ✖️
                  </button>
                </div>

                {/* Create New Folder */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={language === 'en' ? 'New folder name' : 'Yeni klasör adı'}
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button className="btn btn-primary" onClick={handleCreateFolder} disabled={loading}>
                      ➕ {language === 'en' ? 'Create' : 'Oluştur'}
                    </button>
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
                        className={`card ${selectedFolder === folder.id ? 'selected' : ''}`}
                        style={{
                          padding: '12px',
                          cursor: 'pointer',
                          border: selectedFolder === folder.id ? '2px solid var(--primary-color)' : undefined,
                        }}
                        onClick={() => setSelectedFolder(folder.id)}
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
                          {selectedFolder === folder.id && <span style={{ fontSize: '20px' }}>✓</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedFolder && (
                  <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', marginBottom: '5px' }}>
                      {language === 'en' ? 'Selected folder:' : 'Seçili klasör:'}
                    </div>
                    <div style={{ fontWeight: 'bold' }}>
                      {folders.find((f) => f.id === selectedFolder)?.name}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Email Share Modal */}
          {showEmailShare && (
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
                    📧 {language === 'en' ? 'Share via Email' : 'E-posta ile Paylaş'}
                  </h3>
                  <button className="btn btn-secondary" onClick={() => setShowEmailShare(null)}>
                    ✖️
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {language === 'en' ? 'Email Address' : 'E-posta Adresi'}
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="example@email.com"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {language === 'en' ? 'Permission Level' : 'İzin Seviyesi'}
                  </label>
                  <select
                    className="form-select"
                    value={shareRole}
                    onChange={(e) => setShareRole(e.target.value as 'reader' | 'writer')}
                  >
                    <option value="reader">
                      {language === 'en' ? 'Can view only' : 'Sadece görüntüleyebilir'}
                    </option>
                    <option value="writer">
                      {language === 'en' ? 'Can edit' : 'Düzenleyebilir'}
                    </option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleShareFile(showEmailShare)}
                    disabled={loading}
                    style={{ flex: 1 }}
                  >
                    {language === 'en' ? 'Share' : 'Paylaş'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowEmailShare(null);
                      setShareEmail('');
                    }}
                    style={{ flex: 1 }}
                  >
                    {language === 'en' ? 'Cancel' : 'İptal'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!isAuthenticated && (
        <div className="google-drive-setup">
          <h3 className="subsection-title">⚙️ {t(language, 'googleDrive.setupTitle')}</h3>
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
      )}

      {showTroubleshooting && (
        <div className="google-drive-troubleshooting" style={{ marginTop: '20px' }}>
          <h3 className="subsection-title">🔧 {t(language, 'googleDrive.troubleshooting')}</h3>
          <div className="info-text">
            <h4>{t(language, 'googleDrive.commonIssues')}</h4>
            <div style={{ marginTop: '15px' }}>
              <strong>1. {t(language, 'googleDrive.issue1')}</strong>
              <p style={{ marginLeft: '20px', color: '#666' }}>
                ✓ {t(language, 'googleDrive.solution1')}
              </p>
            </div>
            <div style={{ marginTop: '15px' }}>
              <strong>2. {t(language, 'googleDrive.issue2')}</strong>
              <p style={{ marginLeft: '20px', color: '#666' }}>
                ✓ {t(language, 'googleDrive.solution2')}
              </p>
            </div>
            <div style={{ marginTop: '15px' }}>
              <strong>3. {t(language, 'googleDrive.issue3')}</strong>
              <p style={{ marginLeft: '20px', color: '#666' }}>
                ✓ {t(language, 'googleDrive.solution3')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
