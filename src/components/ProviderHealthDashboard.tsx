import React, { useState, useEffect } from 'react';
import { healthMonitor, ProviderHealth, HealthAlert } from '../utils/healthMonitor';
import { AIProvider } from '../utils/aiProviders';
import { t, Lang } from '../i18n';

interface ProviderHealthDashboardProps {
  language: Lang;
}

export const ProviderHealthDashboard: React.FC<ProviderHealthDashboardProps> = ({ language }) => {
  const [health, setHealth] = useState<ProviderHealth[]>([]);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  useEffect(() => {
    loadHealth();
    
    // Auto-refresh every 30 seconds
    const interval = window.setInterval(() => {
      loadHealth();
    }, 30000);
    
    setRefreshInterval(interval as unknown as number);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const loadHealth = () => {
    const healthData = healthMonitor.getAllProvidersHealth();
    const alertsData = healthMonitor.getActiveAlerts();
    setHealth(healthData);
    setAlerts(alertsData);
  };

  const handleResetStats = (provider?: AIProvider) => {
    if (confirm(language === 'en' ? `Reset statistics${provider ? ` for ${provider}` : ''}?` : `İstatistikleri sıfırla${provider ? ` (${provider})` : ''}?`)) {
      healthMonitor.resetStatistics(provider);
      loadHealth();
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy':
        return '#10b981';
      case 'degraded':
        return '#f59e0b';
      case 'down':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'healthy':
        return '✅';
      case 'degraded':
        return '⚠️';
      case 'down':
        return '❌';
      default:
        return '❓';
    }
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

  return (
    <div className="section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="section-title">
          🏥 {language === 'en' ? 'Provider Health' : 'Sağlayıcı Sağlığı'}
        </h2>
        <button className="btn btn-secondary" onClick={() => loadHealth()}>
          🔄 {language === 'en' ? 'Refresh' : 'Yenile'}
        </button>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`alert ${alert.severity === 'critical' ? 'alert-error' : 'alert-warning'}`}
              style={{ marginBottom: '10px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{alert.severity === 'critical' ? '🚨' : '⚠️'} {getProviderName(alert.provider)}</strong>
                  <div style={{ fontSize: '13px', marginTop: '4px' }}>{alert.message}</div>
                  <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
                    {new Date(alert.timestamp).toLocaleString(language === 'en' ? 'en-US' : 'tr-TR')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Health Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
        {health.map((providerHealth) => (
          <div
            key={providerHealth.provider}
            className="card"
            style={{
              padding: '20px',
              borderLeft: `4px solid ${getStatusColor(providerHealth.status)}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                  {getProviderName(providerHealth.provider)}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{getStatusIcon(providerHealth.status)}</span>
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: getStatusColor(providerHealth.status),
                      textTransform: 'capitalize',
                    }}
                  >
                    {providerHealth.status}
                  </span>
                </div>
              </div>
              <button
                className="btn-icon btn-secondary"
                onClick={() => handleResetStats(providerHealth.provider)}
                title={language === 'en' ? 'Reset Statistics' : 'İstatistikleri Sıfırla'}
              >
                🔄
              </button>
            </div>

            <div style={{ display: 'grid', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>
                  {language === 'en' ? 'Response Time' : 'Yanıt Süresi'}:
                </span>
                <span style={{ fontWeight: '600' }}>
                  {providerHealth.responseTime.toFixed(0)}ms
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>
                  {language === 'en' ? 'Error Rate' : 'Hata Oranı'}:
                </span>
                <span
                  style={{
                    fontWeight: '600',
                    color: providerHealth.errorRate > 0.3 ? '#ef4444' : '#10b981',
                  }}
                >
                  {(providerHealth.errorRate * 100).toFixed(1)}%
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>
                  {language === 'en' ? 'Success / Failures' : 'Başarı / Hata'}:
                </span>
                <span style={{ fontWeight: '600' }}>
                  {providerHealth.successCount} / {providerHealth.failureCount}
                </span>
              </div>

              {providerHealth.consecutiveFailures > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>
                    {language === 'en' ? 'Consecutive Failures' : 'Ardışık Hatalar'}:
                  </span>
                  <span style={{ fontWeight: '600', color: '#ef4444' }}>
                    {providerHealth.consecutiveFailures}
                  </span>
                </div>
              )}

              <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '5px' }}>
                {language === 'en' ? 'Last checked' : 'Son kontrol'}:{' '}
                {new Date(providerHealth.lastCheck).toLocaleString(language === 'en' ? 'en-US' : 'tr-TR')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reset All Button */}
      <div style={{ marginTop: '20px' }}>
        <button className="btn btn-secondary" onClick={() => handleResetStats()} style={{ width: '100%' }}>
          🔄 {language === 'en' ? 'Reset All Statistics' : 'Tüm İstatistikleri Sıfırla'}
        </button>
      </div>
    </div>
  );
};
