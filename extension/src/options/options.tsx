import React, { useEffect, useState } from 'react';
import { loadOptions, saveOptions } from '../lib/storage';
import { Button, SectionHeader, TextRow } from '../components/ui';
import { authenticateWithGoogle, revokeAuthToken, isAuthenticated, getUserProfile } from '../lib/googleAuth';
import '../styles/global.css';

export function Options() {
  const [apiKey, setApiKey] = useState<string>('');
  const [apiProvider, setApiProvider] = useState<'openai' | 'azure' | 'gemini' | 'claude'>('openai');
  const [language, setLanguage] = useState<'tr' | 'en'>('en');
  const [saved, setSaved] = useState(false);
  const [googleAuth, setGoogleAuth] = useState(false);
  const [googleProfile, setGoogleProfile] = useState<{ email: string; name: string; picture?: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

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
    })();
  }, []);

  async function handleSave() {
    await saveOptions({ apiKey, apiProvider, language });
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
    } catch (error: any) {
      console.error('Sign out error:', error);
    } finally {
      setAuthLoading(false);
    }
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
        </div>
      </div>
    </div>
  );
}
