import React, { useState, useEffect } from 'react';
import { StorageService } from '../utils/storage';
import { ProviderUsageAnalytics, PerformanceMetrics } from '../types/storage';
import { t, Lang } from '../i18n';

interface ProviderMetricsDashboardProps {
  language: Lang;
}

interface ProviderStats {
  provider: 'openai' | 'gemini' | 'claude';
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageDuration: number;
  successRate: number;
  lastUsed?: string;
}

export const ProviderMetricsDashboard: React.FC<ProviderMetricsDashboardProps> = ({ language }) => {
  const [analytics, setAnalytics] = useState<ProviderUsageAnalytics[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [providerStats, setProviderStats] = useState<ProviderStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<'all' | 'openai' | 'gemini' | 'claude'>('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (analytics.length > 0) {
      calculateStats();
    }
  }, [analytics, selectedProvider]);

  const loadData = async () => {
    try {
      const [analyticsData, metricsData] = await Promise.all([
        StorageService.getProviderAnalytics(),
        StorageService.getPerformanceMetrics(),
      ]);

      setAnalytics(analyticsData);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = () => {
    const providers: Array<'openai' | 'gemini' | 'claude'> = ['openai', 'gemini', 'claude'];
    const stats: ProviderStats[] = [];

    for (const provider of providers) {
      const providerAnalytics = analytics.filter(a => a.provider === provider);
      
      if (providerAnalytics.length === 0) continue;

      const totalCalls = providerAnalytics.length;
      const successfulCalls = providerAnalytics.filter(a => a.success).length;
      const failedCalls = totalCalls - successfulCalls;
      const totalDuration = providerAnalytics.reduce((sum, a) => sum + a.duration, 0);
      const averageDuration = totalDuration / totalCalls;
      const successRate = (successfulCalls / totalCalls) * 100;
      const lastUsed = providerAnalytics[0]?.timestamp;

      stats.push({
        provider,
        totalCalls,
        successfulCalls,
        failedCalls,
        averageDuration,
        successRate,
        lastUsed,
      });
    }

    // Sort by total calls descending
    stats.sort((a, b) => b.totalCalls - a.totalCalls);
    setProviderStats(stats);
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai': return '🤖';
      case 'gemini': return '✨';
      case 'claude': return '🧠';
      default: return '🔧';
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'openai': return 'OpenAI';
      case 'gemini': return 'Google Gemini';
      case 'claude': return 'Anthropic Claude';
      default: return provider;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFilteredAnalytics = () => {
    if (selectedProvider === 'all') return analytics;
    return analytics.filter(a => a.provider === selectedProvider);
  };

  const handleClearData = async () => {
    if (confirm(language === 'tr' ? 
      'Tüm performans verileri silinecek. Emin misiniz?' : 
      'All performance data will be deleted. Are you sure?')) {
      await StorageService.clearProviderAnalytics();
      await StorageService.clearPerformanceMetrics();
      await loadData();
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
        <div>{language === 'tr' ? 'Yükleniyor...' : 'Loading...'}</div>
      </div>
    );
  }

  if (analytics.length === 0) {
    return (
      <div className="section">
        <h2 className="section-title">
          📊 {language === 'tr' ? 'Performans Metrikleri' : 'Performance Metrics'}
        </h2>
        <div className="alert alert-info">
          {language === 'tr' 
            ? 'Henüz performans verisi yok. AI sağlayıcılarını kullanmaya başladığınızda burada istatistikler görünecektir.'
            : 'No performance data yet. Statistics will appear here once you start using AI providers.'}
        </div>
      </div>
    );
  }

  const filteredAnalytics = getFilteredAnalytics();
  const totalOperations = filteredAnalytics.length;
  const successfulOperations = filteredAnalytics.filter(a => a.success).length;
  const failedOperations = totalOperations - successfulOperations;
  const overallSuccessRate = (successfulOperations / totalOperations) * 100;

  return (
    <div className="section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 className="section-title">
          📊 {language === 'tr' ? 'Performans Metrikleri' : 'Performance Metrics'}
        </h2>
        <button 
          className="btn btn-secondary"
          onClick={handleClearData}
          style={{ fontSize: '13px', padding: '6px 12px' }}
        >
          🗑️ {language === 'tr' ? 'Verileri Temizle' : 'Clear Data'}
        </button>
      </div>

      {/* Overall Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '12px',
        marginBottom: '24px',
      }}>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0066cc' }}>
            {totalOperations}
          </div>
          <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
            {language === 'tr' ? 'Toplam İşlem' : 'Total Operations'}
          </div>
        </div>

        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00aa00' }}>
            {successfulOperations}
          </div>
          <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
            {language === 'tr' ? 'Başarılı' : 'Successful'}
          </div>
        </div>

        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#cc0000' }}>
            {failedOperations}
          </div>
          <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
            {language === 'tr' ? 'Başarısız' : 'Failed'}
          </div>
        </div>

        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff9900' }}>
            {overallSuccessRate.toFixed(1)}%
          </div>
          <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
            {language === 'tr' ? 'Başarı Oranı' : 'Success Rate'}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: '16px' }}>
        <label className="form-label">
          {language === 'tr' ? 'Sağlayıcı Filtresi' : 'Provider Filter'}
        </label>
        <select 
          className="form-select"
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value as any)}
        >
          <option value="all">{language === 'tr' ? 'Tümü' : 'All'}</option>
          <option value="openai">🤖 OpenAI</option>
          <option value="gemini">✨ Google Gemini</option>
          <option value="claude">🧠 Anthropic Claude</option>
        </select>
      </div>

      {/* Provider Comparison */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
          {language === 'tr' ? 'Sağlayıcı Karşılaştırması' : 'Provider Comparison'}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {providerStats.map((stat) => (
            <div key={stat.provider} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {getProviderIcon(stat.provider)} {getProviderName(stat.provider)}
                  </div>
                  {stat.lastUsed && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      {language === 'tr' ? 'Son kullanım' : 'Last used'}: {formatDate(stat.lastUsed)}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: stat.successRate >= 80 ? '#00aa00' : stat.successRate >= 50 ? '#ff9900' : '#cc0000' }}>
                    {stat.successRate.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    {language === 'tr' ? 'başarı' : 'success'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '13px' }}>
                <div>
                  <div style={{ color: '#666' }}>{language === 'tr' ? 'Toplam' : 'Total'}</div>
                  <div style={{ fontWeight: 'bold' }}>{stat.totalCalls}</div>
                </div>
                <div>
                  <div style={{ color: '#666' }}>{language === 'tr' ? 'Ort. Süre' : 'Avg. Time'}</div>
                  <div style={{ fontWeight: 'bold' }}>{formatDuration(stat.averageDuration)}</div>
                </div>
                <div>
                  <div style={{ color: '#666' }}>{language === 'tr' ? 'Başarısız' : 'Failed'}</div>
                  <div style={{ fontWeight: 'bold', color: stat.failedCalls > 0 ? '#cc0000' : '#666' }}>
                    {stat.failedCalls}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: '12px', height: '6px', backgroundColor: '#eee', borderRadius: '3px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${stat.successRate}%`,
                    backgroundColor: stat.successRate >= 80 ? '#00aa00' : stat.successRate >= 50 ? '#ff9900' : '#cc0000',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
          {language === 'tr' ? 'Son İşlemler' : 'Recent Activity'}
        </h3>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {filteredAnalytics.slice(0, 10).map((item, index) => (
            <div 
              key={item.id} 
              className="card" 
              style={{ 
                padding: '12px', 
                marginBottom: '8px',
                borderLeft: `4px solid ${item.success ? '#00aa00' : '#cc0000'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '16px' }}>{getProviderIcon(item.provider)}</span>
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                      {getProviderName(item.provider)}
                    </span>
                    <span style={{ 
                      fontSize: '11px', 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      backgroundColor: item.success ? '#e6f7e6' : '#ffe6e6',
                      color: item.success ? '#00aa00' : '#cc0000',
                    }}>
                      {item.success ? (language === 'tr' ? 'Başarılı' : 'Success') : (language === 'tr' ? 'Başarısız' : 'Failed')}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {item.operation === 'optimizeCV' 
                      ? (language === 'tr' ? 'CV Optimizasyonu' : 'CV Optimization')
                      : (language === 'tr' ? 'Niyet Mektubu' : 'Cover Letter')}
                  </div>
                  {item.errorMessage && (
                    <div style={{ fontSize: '11px', color: '#cc0000', marginTop: '4px' }}>
                      {item.errorMessage}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                    {formatDuration(item.duration)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                    {formatDate(item.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
