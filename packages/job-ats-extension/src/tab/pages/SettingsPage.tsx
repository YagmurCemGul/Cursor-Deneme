import { useEffect, useState } from 'react';
import { Save, Key, Globe, Lock, Download, Upload, Wrench, Bug } from 'lucide-react';
import { getSettings, saveSettings, type Settings } from '../../lib/storage';
import { ATS_DOMAINS, setAdapterEnabled, loadAdapterSettings } from '../../lib/domains';
import { logger } from '../../lib/logger';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    model: 'gpt-4o-mini',
    language: 'en',
    encryptionEnabled: false,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [adapters, setAdapters] = useState(Object.values(ATS_DOMAINS));

  useEffect(() => {
    loadSettings();
    loadAdapters();
  }, []);

  async function loadAdapters() {
    await loadAdapterSettings();
    setAdapters(Object.values(ATS_DOMAINS));
  }

  async function loadSettings() {
    const data = await getSettings();
    setSettings(data);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveSettings(settings);
      
      // Update logger if debug setting changed
      if (settings.debugLogs !== undefined) {
        logger.setDebugEnabled(settings.debugLogs);
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1>Settings</h1>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? <div className="spinner" /> : <Save size={16} />}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      {/* API Settings */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Key size={20} />
          <h2 style={{ marginBottom: 0 }}>API Configuration</h2>
        </div>

        <div className="form-group">
          <label className="form-label">OpenAI API Key</label>
          <input
            type="password"
            className="form-input"
            placeholder="sk-..."
            value={settings.apiKey || ''}
            onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
          />
          <span className="form-hint">
            Your API key is stored locally and never shared. Get one at{' '}
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
              platform.openai.com
            </a>
          </span>
        </div>

        <div className="form-group">
          <label className="form-label">Model</label>
          <select
            className="form-select"
            value={settings.model}
            onChange={(e) => setSettings({ ...settings, model: e.target.value })}
          >
            <option value="gpt-4o-mini">GPT-4o Mini (Recommended)</option>
            <option value="gpt-4o">GPT-4o</option>
            <option value="gpt-4-turbo">GPT-4 Turbo</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          </select>
          <span className="form-hint">
            GPT-4o Mini offers the best balance of speed and cost
          </span>
        </div>
      </div>

      {/* Language */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Globe size={20} />
          <h2 style={{ marginBottom: 0 }}>Language</h2>
        </div>

        <div className="form-group">
          <label className="form-label">Interface Language</label>
          <select
            className="form-select"
            value={settings.language}
            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
          >
            <option value="en">English</option>
            <option value="tr">Türkçe</option>
          </select>
        </div>
      </div>

      {/* Encryption */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Lock size={20} />
          <h2 style={{ marginBottom: 0 }}>Data Encryption</h2>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.encryptionEnabled}
              onChange={(e) => setSettings({ ...settings, encryptionEnabled: e.target.checked })}
            />
            <span>Enable local data encryption</span>
          </label>
          <span className="form-hint">
            Encrypts your profile data with AES-256-GCM. You'll need a password to decrypt.
          </span>
        </div>

        {settings.encryptionEnabled && (
          <div className="form-group">
            <label className="form-label">Encryption Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter a strong password"
              value={settings.encryptionPassword || ''}
              onChange={(e) => setSettings({ ...settings, encryptionPassword: e.target.value })}
            />
            <span className="form-error">
              ⚠️ Warning: If you lose this password, your data cannot be recovered!
            </span>
          </div>
        )}
      </div>

      {/* Debug Settings */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Bug size={20} />
          <h2 style={{ marginBottom: 0 }}>Developer Options</h2>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.debugLogs || false}
              onChange={(e) => setSettings({ ...settings, debugLogs: e.target.checked })}
            />
            <span>Enable debug logs</span>
          </label>
          <span className="form-hint">
            Show detailed logs in browser console. Useful for troubleshooting.
          </span>
        </div>
      </div>

      {/* Adapters */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Wrench size={20} />
          <h2 style={{ marginBottom: 0 }}>ATS Platform Adapters</h2>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          Enable or disable specific ATS platform adapters. Disabling unused adapters improves performance.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          {adapters.map(adapter => (
            <label
              key={adapter.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                background: 'var(--color-bg-secondary)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={adapter.enabled}
                onChange={async (e) => {
                  await setAdapterEnabled(adapter.id, e.target.checked);
                  await loadAdapters();
                }}
              />
              <span style={{ fontSize: '0.875rem' }}>{adapter.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Import/Export */}
      <div className="card">
        <h2>Data Management</h2>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary">
            <Upload size={16} />
            Import Profile
          </button>
          <button className="btn btn-secondary">
            <Download size={16} />
            Export Profile
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '1rem', marginBottom: 0 }}>
          Export your profile data as JSON for backup or transfer to another device.
        </p>
      </div>
    </div>
  );
}
