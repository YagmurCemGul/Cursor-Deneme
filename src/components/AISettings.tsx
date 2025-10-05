import React, { useState, useEffect } from 'react';
import { t, Lang } from '../i18n';
import { StorageService } from '../utils/storage';
import { AIApiKeys } from '../types/storage';

interface AISettingsProps {
  language: Lang;
  onConfigChange?: () => void;
}

type AIProvider = 'openai' | 'gemini' | 'claude';

// Animation styles
const providerCardStyles = {
  transition: 'all 0.3s ease-in-out',
  transform: 'scale(1)',
  opacity: 1,
};

const providerCardHoverStyles = {
  transform: 'scale(1.02)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
};

const providerCardSelectedStyles = {
  border: '2px solid #0066cc',
  backgroundColor: '#f0f7ff',
  transform: 'scale(1.02)',
};

interface ModelOption {
  value: string;
  label: string;
}

const MODEL_OPTIONS: Record<AIProvider, ModelOption[]> = {
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o (Recommended)' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast & Cost-effective)' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Budget)' },
  ],
  gemini: [
    { value: 'gemini-pro', label: 'Gemini Pro' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Recommended)' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Fast)' },
  ],
  claude: [
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Recommended)' },
    { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (Fast)' },
    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (Powerful)' },
  ],
};

const API_KEY_URLS: Record<AIProvider, string> = {
  openai: 'https://platform.openai.com/api-keys',
  gemini: 'https://makersuite.google.com/app/apikey',
  claude: 'https://console.anthropic.com/settings/keys',
};

export const AISettings: React.FC<AISettingsProps> = ({ language, onConfigChange }) => {
  const [provider, setProvider] = useState<AIProvider>('openai');
  const [apiKeys, setApiKeys] = useState<AIApiKeys>({});
  const [showApiKey, setShowApiKey] = useState<Record<AIProvider, boolean>>({
    openai: false,
    gemini: false,
    claude: false,
  });
  const [model, setModel] = useState<string>('');
  const [temperature, setTemperature] = useState<number>(0.3);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hoveredProvider, setHoveredProvider] = useState<AIProvider | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [savedProvider, savedApiKeys, savedModel, settings] = await Promise.all([
        StorageService.getAIProvider(),
        StorageService.getAPIKeys(),
        StorageService.getAIModel(),
        StorageService.getSettings(),
      ]);

      setProvider(savedProvider);
      setApiKeys(savedApiKeys);
      setModel(savedModel || MODEL_OPTIONS[savedProvider][0]?.value || '');
      setTemperature((settings as any)?.aiTemperature || 0.3);
    } catch (error) {
      console.error('Error loading AI settings:', error);
    }
  };

  const handleProviderChange = (newProvider: AIProvider) => {
    if (newProvider === provider) return;
    
    // Trigger transition animation
    setIsTransitioning(true);
    
    // Fade out current provider
    setTimeout(() => {
      setProvider(newProvider);
      // Set default model for the new provider
      const defaultModel = MODEL_OPTIONS[newProvider][0]?.value || '';
      setModel(defaultModel);
      setTestResult(null);
      
      // Fade in new provider
      setTimeout(() => {
        setIsTransitioning(false);
      }, 150);
    }, 150);
  };

  const handleApiKeyChange = (provider: AIProvider, value: string) => {
    setApiKeys((prev) => ({
      ...prev,
      [provider]: value,
    }));
    setTestResult(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      // Get current settings first to avoid race conditions
      const currentSettings = (await StorageService.getSettings()) || {};

      // Update all settings in one object to prevent race conditions
      const updatedSettings = {
        ...currentSettings,
        aiProvider: provider,
        aiModel: model,
        aiTemperature: temperature,
      };

      // Save everything together
      await Promise.all([
        StorageService.saveAPIKeys(apiKeys),
        StorageService.saveSettings(updatedSettings),
      ]);

      setSaveMessage(t(language, 'settings.saveSuccess'));

      // Notify parent component that config has changed
      if (onConfigChange) {
        onConfigChange();
      }

      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage(t(language, 'settings.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    const currentApiKey = apiKeys[provider];

    if (!currentApiKey) {
      setTestResult({
        success: false,
        message: t(language, 'settings.apiKeyRequired'),
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Simple test: try to make a minimal API call
      let testSuccessful = false;

      if (provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${currentApiKey}` },
        });
        testSuccessful = response.ok;
      } else if (provider === 'gemini') {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${currentApiKey}`
        );
        testSuccessful = response.ok;
      } else if (provider === 'claude') {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': currentApiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Hi' }],
          }),
        });
        testSuccessful = response.ok;
      }

      setTestResult({
        success: testSuccessful,
        message: testSuccessful
          ? t(language, 'settings.testSuccess')
          : t(language, 'settings.testError'),
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: t(language, 'settings.testError'),
      });
    } finally {
      setIsTesting(false);
    }
  };

  const currentApiKey = apiKeys[provider] || '';
  const hasApiKey = currentApiKey.length > 0;

  return (
    <div className="section">
      <h2 className="section-title">⚙️ {t(language, 'settings.aiSection')}</h2>

      {/* Provider Selection */}
      <div style={{ marginBottom: '24px' }}>
        <label className="form-label">{t(language, 'settings.aiProvider')}</label>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
          {t(language, 'settings.aiProviderDesc')}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* OpenAI */}
          <div
            className={`card ${provider === 'openai' ? 'selected' : ''}`}
            onClick={() => handleProviderChange('openai')}
            onMouseEnter={() => setHoveredProvider('openai')}
            onMouseLeave={() => setHoveredProvider(null)}
            style={{
              cursor: 'pointer',
              padding: '16px',
              ...providerCardStyles,
              ...(provider === 'openai' ? providerCardSelectedStyles : {}),
              ...(hoveredProvider === 'openai' && provider !== 'openai' ? providerCardHoverStyles : {}),
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="radio"
                checked={provider === 'openai'}
                onChange={() => handleProviderChange('openai')}
              />
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🤖 OpenAI (ChatGPT)</div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {t(language, 'settings.openaiInfo')}
                </div>
              </div>
            </div>
          </div>

          {/* Gemini */}
          <div
            className={`card ${provider === 'gemini' ? 'selected' : ''}`}
            onClick={() => handleProviderChange('gemini')}
            onMouseEnter={() => setHoveredProvider('gemini')}
            onMouseLeave={() => setHoveredProvider(null)}
            style={{
              cursor: 'pointer',
              padding: '16px',
              ...providerCardStyles,
              ...(provider === 'gemini' ? providerCardSelectedStyles : {}),
              ...(hoveredProvider === 'gemini' && provider !== 'gemini' ? providerCardHoverStyles : {}),
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="radio"
                checked={provider === 'gemini'}
                onChange={() => handleProviderChange('gemini')}
              />
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>✨ Google Gemini</div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {t(language, 'settings.geminiInfo')}
                </div>
              </div>
            </div>
          </div>

          {/* Claude */}
          <div
            className={`card ${provider === 'claude' ? 'selected' : ''}`}
            onClick={() => handleProviderChange('claude')}
            onMouseEnter={() => setHoveredProvider('claude')}
            onMouseLeave={() => setHoveredProvider(null)}
            style={{
              cursor: 'pointer',
              padding: '16px',
              ...providerCardStyles,
              ...(provider === 'claude' ? providerCardSelectedStyles : {}),
              ...(hoveredProvider === 'claude' && provider !== 'claude' ? providerCardHoverStyles : {}),
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="radio"
                checked={provider === 'claude'}
                onChange={() => handleProviderChange('claude')}
              />
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🧠 Anthropic Claude</div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {t(language, 'settings.claudeInfo')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Key Input */}
      <div style={{ 
        marginBottom: '24px',
        opacity: isTransitioning ? 0.5 : 1,
        transition: 'opacity 0.3s ease-in-out',
      }}>
        <label className="form-label">{t(language, 'settings.apiKey')} *</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            type={showApiKey[provider] ? 'text' : 'password'}
            className="form-input"
            value={currentApiKey}
            onChange={(e) => handleApiKeyChange(provider, e.target.value)}
            placeholder={t(language, 'settings.apiKeyPlaceholder')}
            style={{ flex: 1 }}
            disabled={isTransitioning}
          />
          <button
            className="btn btn-secondary"
            onClick={() => setShowApiKey((prev) => ({ ...prev, [provider]: !prev[provider] }))}
          >
            {showApiKey[provider]
              ? t(language, 'settings.hideApiKey')
              : t(language, 'settings.showApiKey')}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <a
            href={API_KEY_URLS[provider]}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ fontSize: '13px', padding: '6px 12px' }}
          >
            🔑 {t(language, 'settings.getApiKey')}
          </a>
          <button
            className="btn btn-secondary"
            onClick={handleTestConnection}
            disabled={isTesting || !hasApiKey}
            style={{ fontSize: '13px', padding: '6px 12px' }}
          >
            {isTesting ? t(language, 'settings.testing') : t(language, 'settings.testConnection')}
          </button>
        </div>
        {testResult && (
          <div
            className={`alert ${testResult.success ? 'alert-success' : 'alert-error'}`}
            style={{ marginTop: '8px' }}
          >
            {testResult.message}
          </div>
        )}
        {!hasApiKey && (
          <div className="alert alert-info" style={{ marginTop: '8px' }}>
            {t(language, 'settings.mockMode')}: {t(language, 'settings.mockModeDesc')}
          </div>
        )}
      </div>

      {/* Model Selection */}
      <div style={{ marginBottom: '24px' }}>
        <label className="form-label">{t(language, 'settings.aiModel')}</label>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
          {t(language, 'settings.aiModelDesc')}
        </p>
        <select className="form-select" value={model} onChange={(e) => setModel(e.target.value)}>
          {MODEL_OPTIONS[provider].map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Temperature Slider */}
      <div style={{ marginBottom: '24px' }}>
        <label className="form-label">
          {t(language, 'settings.aiTemperature')}: {temperature.toFixed(1)}
        </label>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
          {t(language, 'settings.aiTemperatureDesc')}
        </p>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#666',
          }}
        >
          <span>{language === 'tr' ? 'Odaklı (0.0)' : 'Focused (0.0)'}</span>
          <span>{language === 'tr' ? 'Dengeli (0.5)' : 'Balanced (0.5)'}</span>
          <span>{language === 'tr' ? 'Yaratıcı (1.0)' : 'Creative (1.0)'}</span>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={isSaving}
          style={{ flex: 1 }}
        >
          {isSaving
            ? '⏳ ' + t(language, 'common.save') + '...'
            : '💾 ' + t(language, 'common.save')}
        </button>
      </div>

      {saveMessage && (
        <div
          className={`alert ${saveMessage.includes('success') || saveMessage.includes('başarı') ? 'alert-success' : 'alert-error'}`}
          style={{ marginTop: '12px' }}
        >
          {saveMessage}
        </div>
      )}
    </div>
  );
};
