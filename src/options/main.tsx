import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { StorageService } from '../utils/storage';
import { AIApiKeys } from '../types/storage';
import '../styles/options.css';

function Options() {
  const [apiKeys, setApiKeys] = useState<AIApiKeys>({});
  const [provider, setProvider] = useState<'openai' | 'gemini' | 'claude'>('openai');
  const [language, setLanguage] = useState<'tr' | 'en'>('tr');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const settings = await StorageService.getSettings() as any;
      const keys = await StorageService.getAPIKeys();
      const currentProvider = await StorageService.getAIProvider();
      
      setApiKeys(keys);
      setProvider(currentProvider);
      if (settings?.language) setLanguage(settings.language);
    })();
  }, []);

  async function save() {
    try {
      await StorageService.saveAPIKeys(apiKeys);
      await StorageService.saveAIProvider(provider);
      
      const settings = await StorageService.getSettings() || {};
      (settings as any).language = language;
      (settings as any).aiProvider = provider;
      await StorageService.saveSettings(settings);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  return (
    <div className="options-container">
      <div className="options-header">
        <h1>⚙️ AI Settings</h1>
        <p>Configure your AI providers and API keys</p>
      </div>

      <div className="options-content">
        <div className="section">
          <h3>🤖 Active AI Provider</h3>
          <label className="form-group">
            <span className="label">Select Provider</span>
            <select 
              className="select" 
              value={provider} 
              onChange={(e) => setProvider(e.target.value as any)}
            >
              <option value="openai">OpenAI (GPT-4)</option>
              <option value="gemini">Google Gemini</option>
              <option value="claude">Anthropic Claude</option>
            </select>
          </label>
        </div>

        <div className="section">
          <h3>🔑 API Keys</h3>
          <p className="help-text">Enter your API keys for each provider you want to use</p>
          
          <label className="form-group">
            <span className="label">OpenAI API Key</span>
            <input 
              className="text-input" 
              type="password" 
              value={apiKeys.openai || ''} 
              onChange={(e) => setApiKeys({...apiKeys, openai: e.target.value})}
              placeholder="sk-..."
            />
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="help-link">
              Get OpenAI API Key →
            </a>
          </label>

          <label className="form-group">
            <span className="label">Google Gemini API Key</span>
            <input 
              className="text-input" 
              type="password" 
              value={apiKeys.gemini || ''} 
              onChange={(e) => setApiKeys({...apiKeys, gemini: e.target.value})}
              placeholder="AIza..."
            />
            <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="help-link">
              Get Gemini API Key →
            </a>
          </label>

          <label className="form-group">
            <span className="label">Anthropic Claude API Key</span>
            <input 
              className="text-input" 
              type="password" 
              value={apiKeys.claude || ''} 
              onChange={(e) => setApiKeys({...apiKeys, claude: e.target.value})}
              placeholder="sk-ant-..."
            />
            <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="help-link">
              Get Claude API Key →
            </a>
          </label>
        </div>

        <div className="section">
          <h3>🌐 Language Settings</h3>
          <label className="form-group">
            <span className="label">Default Language</span>
            <select 
              className="select" 
              value={language} 
              onChange={(e) => setLanguage(e.target.value as any)}
            >
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
          </label>
        </div>

        <div className="actions">
          <button className="btn primary" onClick={save}>
            💾 Save Settings
          </button>
        </div>

        {saved && (
          <div className="success-message">
            ✅ Settings saved successfully!
          </div>
        )}

        <div className="info-box">
          <h4>ℹ️ Important Notes:</h4>
          <ul>
            <li>Your API keys are stored locally in your browser</li>
            <li>Make sure to enter the API key for your selected provider</li>
            <li>You can switch between providers anytime</li>
            <li>Each provider has different pricing and capabilities</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<Options />);
