import React, { useEffect, useState } from 'react';
import { loadOptions, saveOptions } from '../lib/storage';
import { Button, SectionHeader, TextRow } from '../components/ui';
import { authenticateWithGoogle, revokeAuthToken, isAuthenticated, getUserProfile } from '../lib/googleAuth';
import { setupAutoBackup, disableAutoBackup, getBackupSettings } from '../lib/cloudBackup';
import '../styles/global.css';

export function Options() {
  const [apiKey, setApiKey] = useState<string>('');
  const [apiProvider, setApiProvider] = useState<'openai' | 'azure' | 'gemini' | 'claude'>('openai');
  const [language, setLanguage] = useState<'tr' | 'en'>('en');
  const [saved, setSaved] = useState(false);
  const [googleAuth, setGoogleAuth] = useState(false);
  const [googleProfile, setGoogleProfile] = useState<{ email: string; name: string; picture?: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [autoBackupInterval, setAutoBackupInterval] = useState(24);
  const [lastBackupTime, setLastBackupTime] = useState<number>(0);
  const [atsEnabled, setAtsEnabled] = useState(false);
  const [atsDebugLogs, setAtsDebugLogs] = useState(false);
  const [atsAutoOpenPanel, setAtsAutoOpenPanel] = useState(false);

  useEffect(() => {
    (async () => {
      const opts = await loadOptions();
      if (opts) {
        setApiKey(opts.apiKey ?? '');
        setApiProvider(opts.apiProvider ?? 'openai');
        setLanguage(opts.language ?? 'en');
      }

      // Check Google authentication status
      const authenticated = await isAuthenticated();
      setGoogleAuth(authenticated);
      if (authenticated) {
        try {
          const profile = await getUserProfile();
          setGoogleProfile(profile);
        } catch (error) {
          console.error('Failed to get user profile:', error);
        }
      }

      // Load backup settings
      const backupSettings = await getBackupSettings();
      setAutoBackupEnabled(backupSettings.enabled);
      setAutoBackupInterval(backupSettings.interval);
      setLastBackupTime(backupSettings.lastBackup);

      // Load ATS settings
      const result = await chrome.storage.local.get(['settings']);
      if (result.settings?.ats) {
        setAtsEnabled(result.settings.ats.enabled || false);
        setAtsDebugLogs(result.settings.ats.debugLogs || false);
        setAtsAutoOpenPanel(result.settings.ats.autoOpenPanel || false);
      }
    })();
  }, []);

  async function handleSave() {
    await saveOptions({ apiKey, apiProvider, language });
    
    // Save ATS settings
    const result = await chrome.storage.local.get(['settings']);
    const settings = result.settings || {};
    await chrome.storage.local.set({
      settings: {
        ...settings,
        ats: {
          ...(settings.ats || {}),
          enabled: atsEnabled,
          debugLogs: atsDebugLogs,
          autoOpenPanel: atsAutoOpenPanel,
        },
      },
    });
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleGoogleSignIn() {
    setAuthLoading(true);
    try {
      await authenticateWithGoogle();
      const authenticated = await isAuthenticated();
      setGoogleAuth(authenticated);
      if (authenticated) {
        const profile = await getUserProfile();
        setGoogleProfile(profile);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to authenticate with Google');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleGoogleSignOut() {
    setAuthLoading(true);
    try {
      await revokeAuthToken();
      setGoogleAuth(false);
      setGoogleProfile(null);
      // Also disable auto-backup when signing out
      await disableAutoBackup();
      setAutoBackupEnabled(false);
    } catch (error: any) {
      console.error('Sign out error:', error);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleAutoBackupToggle(enabled: boolean) {
    setAutoBackupEnabled(enabled);
    if (enabled) {
      await setupAutoBackup(autoBackupInterval);
    } else {
      await disableAutoBackup();
    }
  }

  async function handleAutoBackupIntervalChange(interval: number) {
    setAutoBackupInterval(interval);
    if (autoBackupEnabled) {
      await setupAutoBackup(interval);
    }
  }

  function formatLastBackupTime(): string {
    if (!lastBackupTime) return 'Never';
    const date = new Date(lastBackupTime);
    const now = Date.now();
    const diff = now - lastBackupTime;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: 40 }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 24, color: '#1e293b' }}>⚙️ Settings</h1>
          <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: 14 }}>
            Configure your AI provider and preferences
          </p>

          <div className="col" style={{ gap: 20 }}>
            <label className="col">
              <span className="label">AI Provider</span>
              <select value={apiProvider} onChange={(e) => setApiProvider(e.target.value as any)}>
                <option value="openai">OpenAI (GPT-4)</option>
                <option value="gemini">Google Gemini</option>
                <option value="claude">Anthropic Claude</option>
                <option value="azure">Azure OpenAI</option>
              </select>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
                Choose your preferred AI provider
              </p>
            </label>

            <label className="col">
              <span className="label">API Key</span>
              <input 
                type="password" 
                className="text-input" 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)} 
                placeholder="sk-..."
              />
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
                Your API key is stored locally and securely
              </p>
            </label>

            <label className="col">
              <span className="label">Default Language</span>
              <select value={language} onChange={(e) => setLanguage(e.target.value as 'tr' | 'en')}>
                <option value="en">English</option>
                <option value="tr">Türkçe</option>
              </select>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
                Language for AI-generated content
              </p>
            </label>

            <Button variant="primary" onClick={handleSave}>
              💾 Save Settings
            </Button>

            {saved && (
              <div style={{ padding: 12, background: '#dcfce7', border: '1px solid #86efac', borderRadius: 8, color: '#166534', fontSize: 14 }}>
                ✓ Settings saved successfully!
              </div>
            )}
          </div>

          <div style={{ marginTop: 32, padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#1e293b' }}>🔑 Get API Keys</h3>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#475569', fontSize: 14 }}>
              <li style={{ marginBottom: 8 }}>
                <strong>OpenAI:</strong>{' '}
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>
                  platform.openai.com/api-keys
                </a>
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong>Google Gemini:</strong>{' '}
                <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>
                  makersuite.google.com/app/apikey
                </a>
              </li>
              <li>
                <strong>Anthropic Claude:</strong>{' '}
                <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>
                  console.anthropic.com
                </a>
              </li>
            </ul>
          </div>

          <div style={{ marginTop: 16, padding: 16, background: '#fef3c7', borderRadius: 12, border: '1px solid #fbbf24' }}>
            <p style={{ margin: 0, color: '#92400e', fontSize: 13 }}>
              <strong>⚠️ Security Note:</strong> Your API key is stored locally in your browser using Chrome's secure storage API. 
              It is never sent to any third-party servers except directly to your chosen AI provider when generating content.
            </p>
          </div>
        </div>

        {/* Google Authentication Section */}
        <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', marginTop: 24 }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, color: '#1e293b' }}>📄 Google Docs Export</h2>
          <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: 14 }}>
            Connect your Google account to export CVs directly to Google Docs
          </p>

          {!googleAuth ? (
            <div>
              <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 16 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 14, color: '#1e293b' }}>✨ Benefits:</h3>
                <ul style={{ margin: 0, paddingLeft: 20, color: '#475569', fontSize: 13 }}>
                  <li style={{ marginBottom: 6 }}>Export CVs directly to Google Docs with one click</li>
                  <li style={{ marginBottom: 6 }}>Automatic formatting and styling preservation</li>
                  <li style={{ marginBottom: 6 }}>Save to your Google Drive for easy sharing</li>
                  <li>Edit and customize further in Google Docs</li>
                </ul>
              </div>

              <Button 
                variant="primary" 
                onClick={handleGoogleSignIn} 
                disabled={authLoading}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {authLoading ? (
                  <>⏳ Connecting...</>
                ) : (
                  <>
                    <span style={{ fontSize: 18 }}>📧</span>
                    <span>Sign in with Google</span>
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div>
              <div style={{ padding: 16, background: '#dcfce7', borderRadius: 12, border: '1px solid #86efac', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {googleProfile?.picture && (
                    <img 
                      src={googleProfile.picture} 
                      alt={googleProfile.name}
                      style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid #10b981' }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#166534', marginBottom: 2 }}>
                      ✓ Connected to Google
                    </div>
                    {googleProfile && (
                      <>
                        <div style={{ fontSize: 13, color: '#166534' }}>{googleProfile.name}</div>
                        <div style={{ fontSize: 12, color: '#166534', opacity: 0.8 }}>{googleProfile.email}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: '#475569', marginBottom: 8 }}>
                  <strong>🎉 You're all set!</strong>
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  You can now export your CVs to Google Docs from the main editor. 
                  Look for the "Export to Google Docs" button in the export toolbar.
                </div>
              </div>

              <Button 
                variant="secondary" 
                onClick={handleGoogleSignOut} 
                disabled={authLoading}
                style={{ width: '100%' }}
              >
                {authLoading ? '⏳ Disconnecting...' : '🔓 Sign Out'}
              </Button>
            </div>
          )}

          {/* Auto-Backup Settings */}
          {googleAuth && (
            <div style={{ marginTop: 24, padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#1e293b' }}>☁️ Auto-Backup Settings</h3>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={autoBackupEnabled}
                    onChange={(e) => handleAutoBackupToggle(e.target.checked)}
                  />
                  <span style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>
                    Enable automatic backups to Google Drive
                  </span>
                </label>
              </div>

              {autoBackupEnabled && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 8 }}>
                      Backup Interval
                    </label>
                    <select
                      value={autoBackupInterval}
                      onChange={(e) => handleAutoBackupIntervalChange(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: 8,
                        fontSize: 14,
                      }}
                    >
                      <option value={1}>Every hour</option>
                      <option value={6}>Every 6 hours</option>
                      <option value={12}>Every 12 hours</option>
                      <option value={24}>Every 24 hours (daily)</option>
                      <option value={168}>Every week</option>
                    </select>
                  </div>

                  <div style={{ padding: 12, background: 'white', borderRadius: 8, fontSize: 13, color: '#64748b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span>Last backup:</span>
                      <span style={{ fontWeight: 500, color: '#1e293b' }}>{formatLastBackupTime()}</span>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>
                      💡 Backups are created automatically when you make changes after the interval period.
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ATS Settings Section */}
        <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', marginTop: 24 }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, color: '#1e293b' }}>🎯 ATS Auto-Fill Features</h2>
          <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: 14 }}>
            Automatically fill job application forms on ATS platforms
          </p>

          <div className="col" style={{ gap: 16 }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={atsEnabled}
                  onChange={(e) => setAtsEnabled(e.target.checked)}
                />
                <span style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>
                  Enable ATS Auto-Fill
                </span>
              </label>
              <p style={{ margin: '8px 0 0 28px', fontSize: 12, color: '#64748b' }}>
                Automatically detect and fill job application forms on supported platforms
              </p>
            </div>

            {atsEnabled && (
              <>
                <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#1e293b' }}>🌐 Supported Platforms:</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 13, color: '#475569' }}>
                    <div>✓ Workday</div>
                    <div>✓ Greenhouse</div>
                    <div>✓ Lever</div>
                    <div>✓ Ashby</div>
                    <div>✓ SmartRecruiters</div>
                    <div>✓ SAP SuccessFactors</div>
                    <div>✓ Workable</div>
                    <div>✓ iCIMS</div>
                    <div>✓ LinkedIn</div>
                    <div>✓ Indeed</div>
                    <div>✓ Glassdoor</div>
                    <div>+ More coming soon</div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={atsAutoOpenPanel}
                      onChange={(e) => setAtsAutoOpenPanel(e.target.checked)}
                    />
                    <span style={{ fontSize: 14, color: '#1e293b' }}>
                      Auto-open side panel on job pages
                    </span>
                  </label>
                  <p style={{ margin: '8px 0 0 28px', fontSize: 12, color: '#64748b' }}>
                    Automatically show job details when visiting supported job pages
                  </p>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={atsDebugLogs}
                      onChange={(e) => setAtsDebugLogs(e.target.checked)}
                    />
                    <span style={{ fontSize: 14, color: '#1e293b' }}>
                      Enable debug logging
                    </span>
                  </label>
                  <p style={{ margin: '8px 0 0 28px', fontSize: 12, color: '#64748b' }}>
                    Show detailed logs in browser console (useful for troubleshooting)
                  </p>
                </div>

                <div style={{ padding: 16, background: '#fef3c7', borderRadius: 12, border: '1px solid #fbbf24', marginTop: 8 }}>
                  <p style={{ margin: 0, fontSize: 13, color: '#92400e' }}>
                    <strong>ℹ️ Note:</strong> To use ATS Auto-Fill, make sure to set up your profile first in the main extension. 
                    Right-click on any application form and select "ATS Auto-Fill Form" from the context menu.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
