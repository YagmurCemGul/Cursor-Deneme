import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { loadOptions, saveOptions } from '../lib/storage';

// Model options for each provider
const MODEL_OPTIONS = {
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  ],
  azure: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-35-turbo', label: 'GPT-3.5 Turbo' },
  ],
  gemini: [
    { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Experimental)' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  ],
  claude: [
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
  ],
};

type Provider = 'openai' | 'azure' | 'gemini' | 'claude';

function Options() {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<Provider>('openai');
  const [language, setLanguage] = useState<'tr' | 'en'>('tr');
  const [aiModel, setAiModel] = useState('');
  const [temperature, setTemperature] = useState(0.3);
  const [showApiKey, setShowApiKey] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const opts = await loadOptions();
    if (opts?.apiKey) setApiKey(opts.apiKey);
    if (opts?.apiProvider) setProvider(opts.apiProvider);
    if (opts?.language) setLanguage(opts.language);
    if (opts?.aiModel) setAiModel(opts.aiModel);
    if (opts?.aiTemperature !== undefined) setTemperature(opts.aiTemperature);
  }

  useEffect(() => {
    // Set default model when provider changes
    if (!aiModel || !MODEL_OPTIONS[provider].find(m => m.value === aiModel)) {
      setAiModel(MODEL_OPTIONS[provider][0].value);
    }
  }, [provider]);

  async function testConnection() {
    if (!apiKey) {
      showMessage('error', language === 'tr' ? 'Lütfen API anahtarı girin' : 'Please enter API key');
      return;
    }

    setIsTesting(true);
    setMessage(null);

    try {
      // Simple test based on provider
      let response;
      const testMessage = 'Hello';
      
      if (provider === 'openai') {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: aiModel || 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: testMessage }],
            max_tokens: 5,
          }),
        });
      } else if (provider === 'claude') {
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: aiModel || 'claude-3-5-sonnet-20241022',
            messages: [{ role: 'user', content: testMessage }],
            max_tokens: 5,
          }),
        });
      } else if (provider === 'gemini') {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${aiModel || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: testMessage }] }],
          }),
        });
      } else {
        showMessage('error', language === 'tr' ? 'Azure OpenAI test desteği yakında eklenecek' : 'Azure OpenAI test support coming soon');
        setIsTesting(false);
        return;
      }

      if (response.ok) {
        showMessage('success', language === 'tr' ? '✓ Bağlantı başarılı!' : '✓ Connection successful!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || errorData.error || 'Unknown error';
        showMessage('error', language === 'tr' ? `✗ Bağlantı hatası: ${errorMessage}` : `✗ Connection error: ${errorMessage}`);
      }
    } catch (error: any) {
      showMessage('error', language === 'tr' ? `✗ Bağlantı hatası: ${error.message}` : `✗ Connection error: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  }

  async function save() {
    if (!apiKey) {
      showMessage('error', language === 'tr' ? 'Lütfen API anahtarı girin' : 'Please enter API key');
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      await saveOptions({
        apiKey,
        apiProvider: provider,
        language,
        aiModel,
        aiTemperature: temperature,
      });
      showMessage('success', language === 'tr' ? '✓ Ayarlar kaydedildi!' : '✓ Settings saved!');
    } catch (error: any) {
      showMessage('error', language === 'tr' ? `Kaydetme hatası: ${error.message}` : `Save error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }

  const t = {
    title: language === 'tr' ? 'AI CV Optimizer - Ayarlar' : 'AI CV Optimizer - Settings',
    apiProvider: language === 'tr' ? 'API Sağlayıcı' : 'API Provider',
    apiKey: language === 'tr' ? 'API Anahtarı' : 'API Key',
    apiKeyPlaceholder: language === 'tr' ? 'API anahtarınızı girin' : 'Enter your API key',
    language: language === 'tr' ? 'Dil' : 'Language',
    aiModel: language === 'tr' ? 'AI Modeli' : 'AI Model',
    temperature: language === 'tr' ? 'Temperature (Yaratıcılık)' : 'Temperature (Creativity)',
    testConnection: language === 'tr' ? 'Bağlantıyı Test Et' : 'Test Connection',
    save: language === 'tr' ? 'Kaydet' : 'Save',
    show: language === 'tr' ? 'Göster' : 'Show',
    hide: language === 'tr' ? 'Gizle' : 'Hide',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '32px 24px',
          color: 'white',
        }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>{t.title}</h1>
          <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: '14px' }}>
            {language === 'tr' ? 'AI destekli CV optimizasyonu için ayarlarınızı yapılandırın' : 'Configure your settings for AI-powered CV optimization'}
          </p>
        </div>

        {/* Message Banner */}
        {message && (
          <div style={{
            padding: '16px 24px',
            background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: message.type === 'success' ? '#166534' : '#991b1b',
            borderBottom: `3px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`,
            fontSize: '14px',
            fontWeight: '500',
          }}>
            {message.text}
          </div>
        )}

        {/* Form */}
        <div style={{ padding: '32px 24px' }}>
          <div className="col" style={{ gap: 24 }}>
            {/* API Provider */}
            <label className="col" style={{ gap: 8 }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{t.apiProvider}</span>
              <select
                className="select"
                value={provider}
                onChange={(e) => setProvider(e.target.value as Provider)}
                style={{
                  fontSize: '15px',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  transition: 'all 0.2s',
                }}
              >
                <option value="openai">OpenAI</option>
                <option value="azure">Azure OpenAI</option>
                <option value="gemini">Google Gemini</option>
                <option value="claude">Anthropic Claude</option>
              </select>
            </label>

            {/* API Key */}
            <label className="col" style={{ gap: 8 }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{t.apiKey}</span>
              <div style={{ position: 'relative' }}>
                <input
                  className="text-input"
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={t.apiKeyPlaceholder}
                  style={{
                    fontSize: '15px',
                    padding: '12px',
                    paddingRight: '80px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    transition: 'all 0.2s',
                    fontFamily: showApiKey ? 'monospace' : 'inherit',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#6b7280',
                    fontSize: '12px',
                    fontWeight: '600',
                    padding: '6px 10px',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f3f4f6';
                    e.currentTarget.style.color = '#374151';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#6b7280';
                  }}
                >
                  {showApiKey ? t.hide : t.show}
                </button>
              </div>
            </label>

            {/* Language */}
            <label className="col" style={{ gap: 8 }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{t.language}</span>
              <select
                className="select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'tr' | 'en')}
                style={{
                  fontSize: '15px',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  transition: 'all 0.2s',
                }}
              >
                <option value="tr">🇹🇷 Türkçe</option>
                <option value="en">🇬🇧 English</option>
              </select>
            </label>

            {/* AI Model */}
            <label className="col" style={{ gap: 8 }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{t.aiModel}</span>
              <select
                className="select"
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                style={{
                  fontSize: '15px',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  transition: 'all 0.2s',
                }}
              >
                {MODEL_OPTIONS[provider].map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Temperature Slider */}
            <label className="col" style={{ gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{t.temperature}</span>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: 'white',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '4px 12px',
                  borderRadius: '999px',
                }}>
                  {temperature.toFixed(2)}
                </span>
              </div>
              <div style={{ position: 'relative', padding: '8px 0' }}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    outline: 'none',
                    background: `linear-gradient(to right, #667eea 0%, #667eea ${temperature * 100}%, #e5e7eb ${temperature * 100}%, #e5e7eb 100%)`,
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                  <span>{language === 'tr' ? 'Tutarlı' : 'Consistent'} (0)</span>
                  <span>{language === 'tr' ? 'Yaratıcı' : 'Creative'} (1)</span>
                </div>
              </div>
            </label>

            {/* Buttons */}
            <div className="row" style={{ gap: 12, marginTop: 8 }}>
              <button
                className="btn"
                onClick={testConnection}
                disabled={isTesting}
                style={{
                  flex: 1,
                  background: 'white',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '15px',
                  transition: 'all 0.2s',
                  opacity: isTesting ? 0.6 : 1,
                }}
              >
                {isTesting ? (language === 'tr' ? 'Test ediliyor...' : 'Testing...') : t.testConnection}
              </button>
              <button
                className="btn"
                onClick={save}
                disabled={isSaving}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '15px',
                  transition: 'all 0.2s',
                  opacity: isSaving ? 0.6 : 1,
                }}
              >
                {isSaving ? (language === 'tr' ? 'Kaydediliyor...' : 'Saving...') : t.save}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 24px',
          background: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          fontSize: '13px',
          color: '#6b7280',
          textAlign: 'center',
        }}>
          {language === 'tr' 
            ? '💡 API anahtarlarınız yalnızca cihazınızda saklanır ve asla paylaşılmaz.'
            : '💡 Your API keys are stored only on your device and never shared.'}
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<Options />);
