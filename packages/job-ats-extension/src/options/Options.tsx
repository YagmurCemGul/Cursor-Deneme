import { useEffect, useState } from 'react';
import { Save, ExternalLink } from 'lucide-react';
import { getSettings, saveSettings, type Settings } from '../lib/storage';

export default function Options() {
  const [settings, setSettings] = useState<Settings>({
    model: 'gpt-4o-mini',
    language: 'en',
    encryptionEnabled: false,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const data = await getSettings();
    setSettings(data);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          🦉 Job ATS Assistant
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Configure your extension settings
        </p>
      </div>

      {/* API Configuration */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2>API Configuration</h2>

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
            Get your API key from{' '}
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
              OpenAI Platform <ExternalLink size={12} style={{ display: 'inline' }} />
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
        </div>
      </div>

      {/* Language */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2>Language</h2>

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
        <h2>Security</h2>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.encryptionEnabled}
              onChange={(e) => setSettings({ ...settings, encryptionEnabled: e.target.checked })}
            />
            <span>Enable local data encryption (AES-256-GCM)</span>
          </label>
          <span className="form-hint">
            Encrypts your profile data. Requires a password to decrypt.
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
              ⚠️ If you lose this password, your data cannot be recovered!
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
        <button
          className="btn btn-secondary"
          onClick={() => chrome.runtime.openOptionsPage()}
        >
          Open Full Dashboard
        </button>

        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <div className="spinner" /> : <Save size={16} />}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
