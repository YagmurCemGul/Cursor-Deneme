import React, { useState, useEffect } from 'react';
import { AIProvider } from '../utils/aiProviders';
import { t, Lang } from '../i18n';
import { logger } from '../utils/logger';

interface FallbackSettingsProps {
  language: Lang;
  onSettingsChange?: () => void;
}

interface FallbackConfig {
  autoFallbackEnabled: boolean;
  fallbackOrder: AIProvider[];
  smartFallback: boolean;
}

export const FallbackSettings: React.FC<FallbackSettingsProps> = ({ language, onSettingsChange }) => {
  const [config, setConfig] = useState<FallbackConfig>({
    autoFallbackEnabled: true,
    fallbackOrder: ['gemini', 'claude', 'openai'],
    smartFallback: true,
  });
  const [saveMessage, setSaveMessage] = useState<string>('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await chrome.storage.local.get('fallbackConfig');
      if (stored.fallbackConfig) {
        setConfig(stored.fallbackConfig);
      }
    } catch (error) {
      logger.error('Error loading fallback settings:', error);
    }
  };

  const handleSave = async () => {
    try {
      await chrome.storage.local.set({ fallbackConfig: config });
      setSaveMessage(language === 'en' ? 'Settings saved successfully!' : 'Ayarlar başarıyla kaydedildi!');
      
      if (onSettingsChange) {
        onSettingsChange();
      }

      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      logger.error('Error saving fallback settings:', error);
      setSaveMessage(language === 'en' ? 'Error saving settings' : 'Ayarlar kaydedilemedi');
    }
  };

  const handleDragStart = (e: React.DragEvent, provider: AIProvider) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', provider);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetProvider: AIProvider) => {
    e.preventDefault();
    const draggedProvider = e.dataTransfer.getData('text/plain') as AIProvider;
    
    const newOrder = [...config.fallbackOrder];
    const draggedIndex = newOrder.indexOf(draggedProvider);
    const targetIndex = newOrder.indexOf(targetProvider);

    // Swap providers
    [newOrder[draggedIndex], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[draggedIndex]];
    
    setConfig({ ...config, fallbackOrder: newOrder });
  };

  const getProviderName = (provider: AIProvider): string => {
    switch (provider) {
      case 'openai':
        return 'ChatGPT';
      case 'gemini':
        return 'Gemini';
      case 'claude':
        return 'Claude';
      default:
        return provider;
    }
  };

  const getProviderIcon = (provider: AIProvider): string => {
    switch (provider) {
      case 'openai':
        return '🤖';
      case 'gemini':
        return '✨';
      case 'claude':
        return '🎯';
      default:
        return '🔧';
    }
  };

  return (
    <div className="section">
      <h2 className="section-title">
        ⚙️ {language === 'en' ? 'Fallback Configuration' : 'Yedekleme Yapılandırması'}
      </h2>

      {/* Auto-Fallback Toggle */}
      <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
        <div className="checkbox-item">
          <input
            type="checkbox"
            id="autoFallback"
            checked={config.autoFallbackEnabled}
            onChange={(e) => setConfig({ ...config, autoFallbackEnabled: e.target.checked })}
          />
          <label htmlFor="autoFallback" style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
              {language === 'en' ? 'Enable Auto-Fallback' : 'Otomatik Yedeklemeyi Etkinleştir'}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.7 }}>
              {language === 'en'
                ? 'Automatically switch to alternative providers when the primary provider fails'
                : 'Birincil sağlayıcı başarısız olduğunda otomatik olarak alternatif sağlayıcılara geç'}
            </div>
          </label>
        </div>
      </div>

      {/* Smart Fallback Toggle */}
      <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
        <div className="checkbox-item">
          <input
            type="checkbox"
            id="smartFallback"
            checked={config.smartFallback}
            onChange={(e) => setConfig({ ...config, smartFallback: e.target.checked })}
            disabled={!config.autoFallbackEnabled}
          />
          <label htmlFor="smartFallback" style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
              {language === 'en' ? 'Smart Fallback' : 'Akıllı Yedekleme'}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.7 }}>
              {language === 'en'
                ? 'Automatically select the healthiest provider based on performance metrics'
                : 'Performans metriklerine göre en sağlıklı sağlayıcıyı otomatik olarak seç'}
            </div>
          </label>
        </div>
      </div>

      {/* Fallback Order */}
      {config.autoFallbackEnabled && !config.smartFallback && (
        <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
          <h3 className="card-subtitle" style={{ marginBottom: '15px' }}>
            {language === 'en' ? 'Fallback Priority Order' : 'Yedekleme Öncelik Sırası'}
          </h3>
          <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '15px' }}>
            {language === 'en'
              ? 'Drag and drop to reorder. The system will try providers in this order when fallback is needed.'
              : 'Sıralamak için sürükle ve bırak. Sistem yedekleme gerektiğinde bu sırayla sağlayıcıları deneyecek.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {config.fallbackOrder.map((provider, index) => (
              <div
                key={provider}
                draggable
                onDragStart={(e) => handleDragStart(e, provider)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, provider)}
                className="card"
                style={{
                  padding: '15px',
                  cursor: 'grab',
                  backgroundColor: '#f8fafc',
                  border: '2px dashed #cbd5e1',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      backgroundColor: '#667eea',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '14px',
                    }}
                  >
                    {index + 1}
                  </div>
                  <div style={{ fontSize: '24px' }}>{getProviderIcon(provider)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '15px' }}>{getProviderName(provider)}</div>
                    <div style={{ fontSize: '12px', opacity: 0.6 }}>
                      {language === 'en' ? 'Priority' : 'Öncelik'} #{index + 1}
                    </div>
                  </div>
                  <div style={{ fontSize: '20px', opacity: 0.3' }}>⋮⋮</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smart Fallback Info */}
      {config.autoFallbackEnabled && config.smartFallback && (
        <div className="alert alert-info" style={{ marginBottom: '20px' }}>
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>
            🧠 {language === 'en' ? 'Smart Fallback Active' : 'Akıllı Yedekleme Aktif'}
          </div>
          <div style={{ fontSize: '13px' }}>
            {language === 'en'
              ? 'The system will automatically select the best performing provider based on real-time health metrics including response time, error rate, and success history.'
              : 'Sistem, yanıt süresi, hata oranı ve başarı geçmişi dahil gerçek zamanlı sağlık metriklerine göre en iyi performans gösteren sağlayıcıyı otomatik olarak seçecek.'}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="btn btn-primary" onClick={handleSave} style={{ flex: 1 }}>
          💾 {language === 'en' ? 'Save Settings' : 'Ayarları Kaydet'}
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
