import React, { useState, useEffect } from 'react';
import { t, Lang } from '../i18n';
import { logger } from '../utils/logger';
import { StorageService } from '../utils/storage';
import { AIApiKeys } from '../types/storage';

interface AISettingsProps {
  language: Lang;
  onConfigChange?: () => void;
}

type AIProvider = 'openai' | 'gemini' | 'claude' | 'azure-openai' | 'ollama';

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
  'azure-openai': [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-35-turbo', label: 'GPT-3.5 Turbo' },
  ],
  ollama: [
    { value: 'llama2', label: 'Llama 2' },
    { value: 'llama3', label: 'Llama 3' },
    { value: 'mistral', label: 'Mistral' },
    { value: 'mixtral', label: 'Mixtral' },
    { value: 'codellama', label: 'Code Llama' },
    { value: 'phi', label: 'Phi' },
    { value: 'gemma', label: 'Gemma' },
  ],
};

const API_KEY_URLS: Record<AIProvider, string> = {
  openai: 'https://platform.openai.com/api-keys',
  gemini: 'https://makersuite.google.com/app/apikey',
  claude: 'https://console.anthropic.com/settings/keys',
  'azure-openai': 'https://portal.azure.com',
  ollama: 'https://ollama.ai/download',
};

export const AISettings: React.FC<AISettingsProps> = ({ language, onConfigChange }) => {
  const [provider, setProvider] = useState<AIProvider>('openai');
  const [apiKeys, setApiKeys] = useState<AIApiKeys>({});
  const [showApiKey, setShowApiKey] = useState<Record<AIProvider, boolean>>({
    openai: false,
    gemini: false,
    claude: false,
    'azure-openai': false,
    ollama: false,
  });
  const [model, setModel] = useState<string>('');
  const [temperature, setTemperature] = useState<number>(0.3);
  const [azureEndpoint, setAzureEndpoint] = useState<string>('');
  const [azureDeployment, setAzureDeployment] = useState<string>('');
  const [ollamaEndpoint, setOllamaEndpoint] = useState<string>('http://localhost:11434');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveMessage, setSaveMessage] = useState<string>('');

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
      setAzureEndpoint((settings as any)?.azureEndpoint || '');
      setAzureDeployment((settings as any)?.azureDeployment || '');
      setOllamaEndpoint((settings as any)?.ollamaEndpoint || 'http://localhost:11434');
    } catch (error) {
      logger.error('Error loading AI settings:', error);
    }
  };

  const handleProviderChange = (newProvider: AIProvider) => {
    setProvider(newProvider);
    // Set default model for the new provider
    const defaultModel = MODEL_OPTIONS[newProvider][0]?.value || '';
    setModel(defaultModel);
    setTestResult(null);
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
        azureEndpoint,
        azureDeployment,
        ollamaEndpoint,
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
      logger.error('Error saving settings:', error);
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
            style={{ cursor: 'pointer', padding: '16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="radio"
                checked={provider === 'openai'}
                onChange={() => handleProviderChange('openai')}
              />
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>OpenAI (ChatGPT)</div>
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
            style={{ cursor: 'pointer', padding: '16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="radio"
                checked={provider === 'gemini'}
                onChange={() => handleProviderChange('gemini')}
              />
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Google Gemini</div>
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
            style={{ cursor: 'pointer', padding: '16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="radio"
                checked={provider === 'claude'}
                onChange={() => handleProviderChange('claude')}
              />
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Anthropic Claude</div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {t(language, 'settings.claudeInfo')}
                </div>
              </div>
            </div>
          </div>

          {/* Azure OpenAI */}
          <div
            className={`card ${provider === 'azure-openai' ? 'selected' : ''}`}
            onClick={() => handleProviderChange('azure-openai')}
            style={{ cursor: 'pointer', padding: '16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="radio"
                checked={provider === 'azure-openai'}
                onChange={() => handleProviderChange('azure-openai')}
              />
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Azure OpenAI Service</div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {language === 'tr' 
                    ? 'Kurumsal Azure OpenAI hizmeti - Gelişmiş güvenlik ve uyumluluk'
                    : 'Enterprise Azure OpenAI service - Enhanced security and compliance'}
                </div>
              </div>
            </div>
          </div>

          {/* Ollama */}
          <div
            className={`card ${provider === 'ollama' ? 'selected' : ''}`}
            onClick={() => handleProviderChange('ollama')}
            style={{ cursor: 'pointer', padding: '16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="radio"
                checked={provider === 'ollama'}
                onChange={() => handleProviderChange('ollama')}
              />
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🏠 Ollama (Local AI)</div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {language === 'tr'
                    ? 'Yerel AI modelleri - Gizlilik odaklı, ücretsiz, internet bağlantısı gerektirmez'
                    : 'Local AI models - Privacy-focused, free, no internet required'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Azure OpenAI Configuration */}
      {provider === 'azure-openai' && (
        <div style={{ marginBottom: '24px' }}>
          <label className="form-label">
            {language === 'tr' ? 'Azure Endpoint (Uç Nokta)' : 'Azure Endpoint'} *
          </label>
          <input
            type="text"
            className="form-input"
            value={azureEndpoint}
            onChange={(e) => setAzureEndpoint(e.target.value)}
            placeholder="https://your-resource-name.openai.azure.com"
            style={{ marginBottom: '12px' }}
          />
          <label className="form-label">
            {language === 'tr' ? 'Deployment Adı' : 'Deployment Name'} *
          </label>
          <input
            type="text"
            className="form-input"
            value={azureDeployment}
            onChange={(e) => setAzureDeployment(e.target.value)}
            placeholder="gpt-4"
          />
        </div>
      )}

      {/* Ollama Configuration */}
      {provider === 'ollama' && (
        <div style={{ marginBottom: '24px' }}>
          <label className="form-label">
            {language === 'tr' ? 'Ollama Endpoint' : 'Ollama Endpoint'}
          </label>
          <input
            type="text"
            className="form-input"
            value={ollamaEndpoint}
            onChange={(e) => setOllamaEndpoint(e.target.value)}
            placeholder="http://localhost:11434"
          />
          <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            {language === 'tr'
              ? 'Ollama\'yı yerel makinenizde çalıştırmanız gerekir. Kurulum için: ollama.ai'
              : 'You need to run Ollama on your local machine. Install from: ollama.ai'}
          </p>
        </div>
      )}

      {/* API Key Input */}
      <div style={{ marginBottom: '24px' }}>
        <label className="form-label">
          {t(language, 'settings.apiKey')} {provider !== 'ollama' && '*'}
          {provider === 'ollama' && (
            <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#666' }}>
              {language === 'tr' ? ' (İsteğe bağlı - güvenli örnekler için)' : ' (Optional - for secured instances)'}
            </span>
          )}
        </label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            type={showApiKey[provider] ? 'text' : 'password'}
            className="form-input"
            value={currentApiKey}
            onChange={(e) => handleApiKeyChange(provider, e.target.value)}
            placeholder={t(language, 'settings.apiKeyPlaceholder')}
            style={{ flex: 1 }}
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
