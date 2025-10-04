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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFileManager, setShowFileManager] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    error?: string;
    details?: string;
  } | null>(null);
  const [showValidation, setShowValidation] = useState(false);

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

  const handleValidateClientId = async () => {
    setValidating(true);
    setValidationResult(null);
    setError(null);

    try {
      const result = await GoogleDriveService.validateClientIdWithAPI();
      setValidationResult(result);
      setShowValidation(true);

      if (result.valid) {
        setSetupRequired(false);
        alert(
          `✅ ${t(language, 'googleDrive.validationSuccess')}\n\n${result.details || 'Your Google Client ID is properly configured.'}`
        );
      } else {
        alert(
          `❌ ${t(language, 'googleDrive.validationFailed')}\n\n${result.error || 'Unknown error'}\n\n${result.details || ''}`
        );
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Validation failed';
      setValidationResult({
        valid: false,
        error: errorMsg,
        details: 'An unexpected error occurred during validation.',
      });
      setError(errorMsg);
    } finally {
      setValidating(false);
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

          <div className="button-group">
            <button className="btn btn-primary" onClick={loadFiles} disabled={loading}>
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

      {!isAuthenticated && (
        <>
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

          {/* Client ID Validation Section */}
          <div
            className="google-drive-validation"
            style={{
              marginTop: '20px',
              padding: '20px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9',
            }}
          >
            <h3 className="subsection-title">🔍 {t(language, 'googleDrive.autoValidation')}</h3>
            <p style={{ marginBottom: '15px', color: '#666' }}>
              {t(language, 'googleDrive.autoValidationDesc')}
            </p>

            {/* Display Current Client ID */}
            <div style={{ marginBottom: '15px' }}>
              <strong>{t(language, 'googleDrive.currentClientId')}:</strong>
              <code
                style={{
                  display: 'block',
                  marginTop: '5px',
                  padding: '10px',
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '12px',
                  wordBreak: 'break-all',
                }}
              >
                {GoogleDriveService.getClientId() || 'Not configured'}
              </code>
            </div>

            {/* Validation Button */}
            <button
              className="btn btn-primary"
              onClick={handleValidateClientId}
              disabled={validating || setupRequired}
              style={{ marginBottom: '15px' }}
            >
              {validating ? '⏳ ' + t(language, 'googleDrive.validating') : '✓ ' + t(language, 'googleDrive.validateClientId')}
            </button>

            {/* Validation Result */}
            {showValidation && validationResult && (
              <div
                className={`alert ${validationResult.valid ? 'alert-success' : 'alert-error'}`}
                style={{ marginTop: '15px' }}
              >
                <div style={{ marginBottom: '10px' }}>
                  <strong>
                    {validationResult.valid ? '✅ ' : '❌ '}
                    {validationResult.valid
                      ? t(language, 'googleDrive.validationSuccess')
                      : t(language, 'googleDrive.validationFailed')}
                  </strong>
                </div>
                {validationResult.error && (
                  <div style={{ color: '#d32f2f', marginBottom: '5px' }}>
                    <strong>Error:</strong> {validationResult.error}
                  </div>
                )}
                {validationResult.details && (
                  <div style={{ fontSize: '14px', marginTop: '5px' }}>
                    <strong>{t(language, 'googleDrive.validationDetails')}:</strong>
                    <div style={{ marginTop: '5px', color: '#666' }}>
                      {validationResult.details}
                    </div>
                  </div>
                )}
              </div>
            )}

            <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
              {t(language, 'googleDrive.validationNote')}
            </p>
          </div>
        </>
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
