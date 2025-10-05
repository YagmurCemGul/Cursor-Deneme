/**
 * AI Model Selector Component
 * Allows users to select and compare AI models
 */

import { useState, useEffect } from 'react';
import {
  AI_MODELS,
  getModelsByProvider,
  getProviderConfig,
  saveProviderConfig,
  savePreferredModel,
  getUsageStats,
  resetUsageStats,
  type AIProvider,
  type AIModel,
  type UsageStats
} from '../lib/aiProviders';
import { Button } from './ui';

interface ModelSelectorProps {
  onClose?: () => void;
}

export function ModelSelector({ onClose }: ModelSelectorProps) {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('openai');
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt-4-turbo');
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [googleKey, setGoogleKey] = useState('');
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    loadSettings();
    loadUsageStats();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await chrome.storage.local.get([
        'openai_api_key', 'anthropic_api_key', 'google_api_key', 
        'preferred_model', 'options'
      ]);
      
      // Check for legacy options format
      const legacyOptions = stored.options || {};
      
      setOpenaiKey(stored.openai_api_key || (legacyOptions.apiProvider === 'openai' ? legacyOptions.apiKey : '') || '');
      setAnthropicKey(stored.anthropic_api_key || (legacyOptions.apiProvider === 'claude' ? legacyOptions.apiKey : '') || '');
      setGoogleKey(stored.google_api_key || (legacyOptions.apiProvider === 'gemini' ? legacyOptions.apiKey : '') || '');
      setSelectedModel(stored.preferred_model || 'gpt-4-turbo');
      setSelectedProvider(AI_MODELS[stored.preferred_model || 'gpt-4-turbo'].provider);
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Use defaults if loading fails
      setSelectedModel('gpt-4-turbo');
      setSelectedProvider('openai');
    }
  };

  const loadUsageStats = async () => {
    const stats = await getUsageStats();
    setUsageStats(stats);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save API keys
      if (openaiKey) await saveProviderConfig('openai', openaiKey);
      if (anthropicKey) await saveProviderConfig('anthropic', anthropicKey);
      if (googleKey) await saveProviderConfig('google', googleKey);
      
      // Save preferred model
      await savePreferredModel(selectedModel);
      
      alert('✅ Settings saved successfully!');
      if (onClose) onClose();
    } catch (error) {
      console.error('Save error:', error);
      alert('❌ Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetStats = async () => {
    if (confirm('Are you sure you want to reset all usage statistics?')) {
      await resetUsageStats();
      await loadUsageStats();
    }
  };

  const getProviderModels = () => {
    return getModelsByProvider(selectedProvider);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: 20
    }}>
      <div style={{
        background: 'white',
        borderRadius: 16,
        maxWidth: 900,
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: 22, color: '#1e293b' }}>
              🤖 AI Model Configuration
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
              Choose your AI provider and model
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 24,
                cursor: 'pointer',
                color: '#94a3b8'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: 32 }}>
          {/* Provider Selection */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#1e293b' }}>
              1. Select AI Provider
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <ProviderCard
                provider="openai"
                name="OpenAI"
                icon="🔵"
                description="GPT-4 Turbo, GPT-4, GPT-3.5"
                isSelected={selectedProvider === 'openai'}
                onClick={() => setSelectedProvider('openai')}
              />
              <ProviderCard
                provider="anthropic"
                name="Anthropic"
                icon="🟠"
                description="Claude 3 Opus, Sonnet, Haiku"
                isSelected={selectedProvider === 'anthropic'}
                onClick={() => setSelectedProvider('anthropic')}
              />
              <ProviderCard
                provider="google"
                name="Google"
                icon="🔴"
                description="Gemini Pro, Gemini 1.5 Pro"
                isSelected={selectedProvider === 'google'}
                onClick={() => setSelectedProvider('google')}
              />
            </div>
          </div>

          {/* API Key Configuration */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#1e293b' }}>
              2. Configure API Keys
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <APIKeyInput
                label="OpenAI API Key"
                value={openaiKey}
                onChange={setOpenaiKey}
                placeholder="sk-..."
                isActive={selectedProvider === 'openai'}
              />
              <APIKeyInput
                label="Anthropic API Key"
                value={anthropicKey}
                onChange={setAnthropicKey}
                placeholder="sk-ant-..."
                isActive={selectedProvider === 'anthropic'}
              />
              <APIKeyInput
                label="Google API Key"
                value={googleKey}
                onChange={setGoogleKey}
                placeholder="AI..."
                isActive={selectedProvider === 'google'}
              />
            </div>
          </div>

          {/* Model Selection */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, color: '#1e293b' }}>
                3. Choose Model
              </h3>
              <button
                onClick={() => setShowComparison(!showComparison)}
                style={{
                  padding: '6px 12px',
                  background: '#e0e7ff',
                  border: '1px solid #c7d2fe',
                  borderRadius: 8,
                  fontSize: 12,
                  cursor: 'pointer',
                  color: '#4338ca'
                }}
              >
                {showComparison ? '📋 List View' : '📊 Compare Models'}
              </button>
            </div>

            {showComparison ? (
              <ModelComparisonTable
                models={getProviderModels()}
                selectedModel={selectedModel}
                onSelect={setSelectedModel}
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {getProviderModels().map(model => (
                  <ModelCard
                    key={model.id}
                    model={model}
                    isSelected={selectedModel === model.id}
                    onClick={() => setSelectedModel(model.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Usage Statistics */}
          {usageStats && usageStats.totalCost > 0 && (
            <div style={{
              padding: 20,
              background: '#f8fafc',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              marginBottom: 24
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16, color: '#1e293b' }}>
                  💰 Usage Statistics
                </h3>
                <button
                  onClick={handleResetStats}
                  style={{
                    padding: '4px 10px',
                    background: 'white',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    fontSize: 11,
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                >
                  Reset
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <StatBox label="Total Cost" value={`$${usageStats.totalCost.toFixed(4)}`} />
                <StatBox label="Input Tokens" value={usageStats.totalInputTokens.toLocaleString()} />
                <StatBox label="Output Tokens" value={usageStats.totalOutputTokens.toLocaleString()} />
              </div>
            </div>
          )}

          {/* Save Button */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            {onClose && (
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSaving}
              style={{ minWidth: 120 }}
            >
              {isSaving ? '⏳ Saving...' : '💾 Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components

function ProviderCard({ provider, name, icon, description, isSelected, onClick }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: 16,
        background: isSelected ? '#e0e7ff' : 'white',
        border: `2px solid ${isSelected ? '#667eea' : '#e2e8f0'}`,
        borderRadius: 12,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s'
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
        {name}
      </div>
      <div style={{ fontSize: 11, color: '#64748b' }}>
        {description}
      </div>
    </button>
  );
}

function APIKeyInput({ label, value, onChange, placeholder, isActive }: any) {
  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: 13,
        fontWeight: 500,
        color: isActive ? '#1e293b' : '#94a3b8',
        marginBottom: 6
      }}>
        {label} {isActive && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 14px',
          border: `2px solid ${isActive ? '#667eea' : '#e2e8f0'}`,
          borderRadius: 8,
          fontSize: 13,
          fontFamily: 'monospace'
        }}
      />
    </div>
  );
}

function ModelCard({ model, isSelected, onClick }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: 16,
        background: isSelected ? '#e0e7ff' : 'white',
        border: `2px solid ${isSelected ? '#667eea' : '#e2e8f0'}`,
        borderRadius: 12,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
          {model.name}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <Badge text={model.speed} color={model.speed === 'fast' ? '#10b981' : model.speed === 'medium' ? '#f59e0b' : '#ef4444'} />
          <Badge text={model.quality} color={model.quality === 'excellent' ? '#667eea' : '#64748b'} />
        </div>
      </div>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>
        {model.description}
      </div>
      <div style={{ fontSize: 10, color: '#94a3b8' }}>
        💰 ${model.costPer1kInputTokens.toFixed(4)}/1k in · ${model.costPer1kOutputTokens.toFixed(4)}/1k out
      </div>
    </button>
  );
}

function ModelComparisonTable({ models, selectedModel, onSelect }: any) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600 }}>Model</th>
            <th style={{ padding: '10px', textAlign: 'center', fontWeight: 600 }}>Context</th>
            <th style={{ padding: '10px', textAlign: 'center', fontWeight: 600 }}>Speed</th>
            <th style={{ padding: '10px', textAlign: 'center', fontWeight: 600 }}>Quality</th>
            <th style={{ padding: '10px', textAlign: 'right', fontWeight: 600 }}>Cost/1k</th>
            <th style={{ padding: '10px', textAlign: 'center', fontWeight: 600 }}>Select</th>
          </tr>
        </thead>
        <tbody>
          {models.map((model: any) => (
            <tr key={model.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '10px' }}>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>{model.name}</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>{model.description}</div>
              </td>
              <td style={{ padding: '10px', textAlign: 'center', color: '#64748b' }}>
                {(model.contextWindow / 1000).toFixed(0)}k
              </td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                <Badge text={model.speed} color={model.speed === 'fast' ? '#10b981' : model.speed === 'medium' ? '#f59e0b' : '#ef4444'} />
              </td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                <Badge text={model.quality} color={model.quality === 'excellent' ? '#667eea' : '#64748b'} />
              </td>
              <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'monospace', fontSize: 11 }}>
                ${model.costPer1kInputTokens.toFixed(4)}
              </td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                <input
                  type="radio"
                  checked={selectedModel === model.id}
                  onChange={() => onSelect(model.id)}
                  style={{ cursor: 'pointer' }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span style={{
      padding: '2px 6px',
      background: `${color}20`,
      color: color,
      borderRadius: 4,
      fontSize: 10,
      fontWeight: 600,
      textTransform: 'uppercase'
    }}>
      {text}
    </span>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{value}</div>
    </div>
  );
}
