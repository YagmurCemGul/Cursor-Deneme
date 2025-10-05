import React, { useState, useEffect } from 'react';
import { OptimizationAnalytics } from '../types';
import { StorageService } from '../utils/storage';
import { t, Lang } from '../i18n';
import { usageAnalytics, UsageStatistics, DailyUsage } from '../utils/usageAnalytics';
import { PieChart } from './PieChart';
import { LineChart } from './LineChart';
import { getProviderColor } from '../utils/chartUtils';

interface AnalyticsDashboardProps {
  language: Lang;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ language }) => {
  const [oldAnalytics, setOldAnalytics] = useState<OptimizationAnalytics[]>([]);
  const [statistics, setStatistics] = useState<UsageStatistics | null>(null);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
  const [successRates, setSuccessRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<number>(30); // days

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Load new analytics
      await usageAnalytics.initialize();
      const [stats, daily, rates, oldData] = await Promise.all([
        usageAnalytics.getStatistics(timeRange),
        usageAnalytics.getDailyUsage(timeRange),
        usageAnalytics.getSuccessRateByProvider(),
        StorageService.getAnalytics(),
      ]);
      
      setStatistics(stats);
      setDailyUsage(daily);
      setSuccessRates(rates);
      setOldAnalytics(oldData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAnalytics = async () => {
    if (confirm(t(language, 'analytics.clearConfirm'))) {
      await Promise.all([
        StorageService.clearAnalytics(),
        usageAnalytics.clearAnalytics(),
      ]);
      await loadAnalytics();
    }
  };

  const handleExportAnalytics = async () => {
    try {
      const data = await usageAnalytics.exportAnalytics();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export analytics:', error);
    }
  };

  // Calculate legacy statistics from old data
  // const totalOptimizations = oldAnalytics.reduce((sum, a) => sum + a.optimizationsApplied, 0);
  // const _averagePerSession = oldAnalytics.length > 0 ? (totalOptimizations / oldAnalytics.length).toFixed(1) : 0;
  
  // Get most optimized section from old data
  const sectionCounts: Record<string, number> = {};
  oldAnalytics.forEach(a => {
    a.cvSections.forEach(section => {
      sectionCounts[section] = (sectionCounts[section] || 0) + 1;
    });
  });
  // const _mostOptimizedSection = Object.entries(sectionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  // Get most used provider from new statistics
  const mostUsedProvider = statistics 
    ? (Object.entries(statistics.providerUsage).sort((a, b) => b[1] - a[1])[0]?.[0] || '-')
    : '-';

  if (loading) {
    return (
      <div className="section">
        <h2 className="section-title">📊 {t(language, 'analytics.title')}</h2>
        <div className="card">
          <p style={{ textAlign: 'center', padding: '20px' }}>
            {language === 'en' ? 'Loading...' : 'Yükleniyor...'}
          </p>
        </div>
      </div>
    );
  }

  if (!statistics || statistics.totalEvents === 0) {
    return (
      <div className="section">
        <h2 className="section-title">📊 {t(language, 'analytics.title')}</h2>
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-text">{t(language, 'analytics.noData')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="section-title">📊 {t(language, 'analytics.title')}</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            className="form-select" 
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            style={{ width: 'auto' }}
          >
            <option value={7}>{language === 'en' ? 'Last 7 days' : 'Son 7 gün'}</option>
            <option value={30}>{language === 'en' ? 'Last 30 days' : 'Son 30 gün'}</option>
            <option value={90}>{language === 'en' ? 'Last 90 days' : 'Son 90 gün'}</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>
            {statistics.totalEvents}
          </div>
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
            {language === 'en' ? 'Total Events' : 'Toplam Etkinlik'}
          </div>
        </div>

        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
            {((statistics.successfulEvents / statistics.totalEvents) * 100).toFixed(1)}%
          </div>
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
            {language === 'en' ? 'Success Rate' : 'Başarı Oranı'}
          </div>
        </div>

        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
            {statistics.averageResponseTime.toFixed(0)}ms
          </div>
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
            {language === 'en' ? 'Avg Response Time' : 'Ort. Yanıt Süresi'}
          </div>
        </div>

        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#8b5cf6' }}>
            {mostUsedProvider === 'openai' ? 'ChatGPT' : mostUsedProvider === 'gemini' ? 'Gemini' : mostUsedProvider === 'claude' ? 'Claude' : '-'}
          </div>
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
            {t(language, 'analytics.aiProvider')}
          </div>
        </div>
      </div>

      {/* Provider Usage Pie Chart */}
      <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
        <h3 className="card-subtitle" style={{ marginBottom: '20px' }}>
          {language === 'en' ? 'Provider Distribution' : 'Sağlayıcı Dağılımı'}
        </h3>
        <PieChart
          data={Object.entries(statistics.providerUsage)
            .filter(([_, count]) => count > 0)
            .map(([provider, count]) => ({
              label: provider === 'openai' ? 'ChatGPT' : provider === 'gemini' ? 'Gemini' : 'Claude',
              value: count,
              color: getProviderColor(provider),
            }))}
          size={250}
        />
      </div>

      {/* Provider Usage Details */}
      <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
        <h3 className="card-subtitle">{language === 'en' ? 'Provider Usage Details' : 'Sağlayıcı Kullanım Detayları'}</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          {Object.entries(statistics.providerUsage).map(([provider, count]) => (
            <div key={provider} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '100px', fontSize: '14px', fontWeight: '500' }}>
                {provider === 'openai' ? 'ChatGPT' : provider === 'gemini' ? 'Gemini' : 'Claude'}
              </div>
              <div style={{ flex: 1, position: 'relative', height: '30px', backgroundColor: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${(count / Math.max(...Object.values(statistics.providerUsage))) * 100}%`,
                  backgroundColor: provider === 'openai' ? '#10b981' : provider === 'gemini' ? '#3b82f6' : '#8b5cf6',
                  borderRadius: '6px',
                  transition: 'width 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '10px',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: '600'
                }}>
                  {count}
                </div>
              </div>
              <div style={{ width: '80px', textAlign: 'right', fontSize: '13px' }}>
                {successRates[provider as keyof typeof successRates]?.toFixed(1)}% {language === 'en' ? 'success' : 'başarı'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Types Breakdown */}
      <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
        <h3 className="card-subtitle">{language === 'en' ? 'Event Types' : 'Etkinlik Türleri'}</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          {Object.entries(statistics.eventsByType)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '150px', fontSize: '13px', textTransform: 'capitalize' }}>
                  {type.replace(/_/g, ' ')}
                </div>
                <div style={{ flex: 1, position: 'relative', height: '25px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${(count / Math.max(...Object.values(statistics.eventsByType))) * 100}%`,
                    backgroundColor: '#667eea',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                <div style={{ width: '40px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold' }}>
                  {count}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Daily Usage Chart */}
      <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
        <h3 className="card-subtitle" style={{ marginBottom: '20px' }}>
          {language === 'en' ? 'Daily Usage Trend' : 'Günlük Kullanım Trendi'}
        </h3>
        <LineChart
          data={dailyUsage.map((day) => ({
            x: new Date(day.date).toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR', { month: 'short', day: 'numeric' }),
            y: day.events,
          }))}
          width={700}
          height={200}
          color="#667eea"
          showTrend={true}
          yLabel={language === 'en' ? 'Events' : 'Etkinlikler'}
        />
      </div>

      {/* Response Time Trend */}
      {dailyUsage.length > 0 && (
        <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
          <h3 className="card-subtitle" style={{ marginBottom: '20px' }}>
            {language === 'en' ? 'Success Rate Trend' : 'Başarı Oranı Trendi'}
          </h3>
          <LineChart
            data={dailyUsage.map((day) => ({
              x: new Date(day.date).toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR', { month: 'short', day: 'numeric' }),
              y: day.successRate,
            }))}
            width={700}
            height={200}
            color="#10b981"
            showTrend={true}
            yLabel={language === 'en' ? 'Success Rate (%)' : 'Başarı Oranı (%)'}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          className="btn btn-secondary"
          onClick={handleExportAnalytics}
          style={{ flex: 1 }}
        >
          📥 {language === 'en' ? 'Export Data' : 'Verileri Dışa Aktar'}
        </button>
        <button
          className="btn btn-danger"
          onClick={handleClearAnalytics}
          style={{ flex: 1 }}
        >
          🗑️ {t(language, 'analytics.clearData')}
        </button>
      </div>
    </div>
  );
};
