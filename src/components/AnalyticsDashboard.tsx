import React, { useState, useEffect } from 'react';
import { OptimizationAnalytics } from '../types';
import { StorageService } from '../utils/storage';
import { t, Lang } from '../i18n';
import { AnalyticsExporter, AnalyticsFilter, ExportFormat } from '../utils/analyticsExporter';

interface AnalyticsDashboardProps {
  language: Lang;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ language }) => {
  const [analytics, setAnalytics] = useState<OptimizationAnalytics[]>([]);
  const [filteredAnalytics, setFilteredAnalytics] = useState<OptimizationAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState<AnalyticsFilter>({});
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await StorageService.getAnalytics();
      setAnalytics(data);
      setFilteredAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const newFilter: AnalyticsFilter = {};

    if (dateRange.start && dateRange.end) {
      newFilter.dateRange = {
        start: new Date(dateRange.start),
        end: new Date(dateRange.end),
      };
    }

    if (filter.aiProvider) {
      newFilter.aiProvider = filter.aiProvider;
    }

    if (filter.categories && filter.categories.length > 0) {
      newFilter.categories = filter.categories;
    }

    if (filter.minOptimizations) {
      newFilter.minOptimizations = filter.minOptimizations;
    }

    const filtered = AnalyticsExporter.filterAnalytics(analytics, newFilter);
    setFilteredAnalytics(filtered);
    setFilter(newFilter);
  };

  const clearFilters = () => {
    setDateRange({ start: '', end: '' });
    setFilter({});
    setFilteredAnalytics(analytics);
  };

  const handleExport = (format: ExportFormat) => {
    AnalyticsExporter.exportAndDownload(filteredAnalytics, format, filter);
    alert(language === 'en' ? `Exported to ${format.toUpperCase()}` : `${format.toUpperCase()} olarak dışa aktarıldı`);
  };

  const handleClearAnalytics = async () => {
    if (confirm(t(language, 'analytics.clearConfirm'))) {
      await StorageService.clearAnalytics();
      setAnalytics([]);
    }
  };

  // Calculate statistics (use filtered data)
  const totalOptimizations = filteredAnalytics.reduce((sum, a) => sum + a.optimizationsApplied, 0);
  const averagePerSession = filteredAnalytics.length > 0 ? (totalOptimizations / filteredAnalytics.length).toFixed(1) : 0;
  
  // Get most optimized section
  const sectionCounts: Record<string, number> = {};
  filteredAnalytics.forEach(a => {
    a.cvSections.forEach(section => {
      sectionCounts[section] = (sectionCounts[section] || 0) + 1;
    });
  });
  const mostOptimizedSection = Object.entries(sectionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  // Get category breakdown
  const categoryCounts: Record<string, number> = {};
  filteredAnalytics.forEach(a => {
    a.categoriesOptimized.forEach(cat => {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
  });

  // AI Provider usage
  const providerCounts: Record<string, number> = {};
  filteredAnalytics.forEach(a => {
    providerCounts[a.aiProvider] = (providerCounts[a.aiProvider] || 0) + 1;
  });
  const mostUsedProvider = Object.entries(providerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  // Additional statistics
  const totalSessions = filteredAnalytics.length;
  const avgJobDescLength = filteredAnalytics.length > 0 
    ? Math.round(filteredAnalytics.reduce((sum, a) => sum + (a.jobDescriptionLength || 0), 0) / filteredAnalytics.length) 
    : 0;
  
  // Date range statistics
  const now = new Date();
  const last7Days = filteredAnalytics.filter(a => new Date(a.timestamp) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
  const last30Days = filteredAnalytics.filter(a => new Date(a.timestamp) > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
  
  const optimizationsLast7Days = last7Days.reduce((sum, a) => sum + a.optimizationsApplied, 0);
  const optimizationsLast30Days = last30Days.reduce((sum, a) => sum + a.optimizationsApplied, 0);
  
  // Success rate (percentage of applied optimizations)
  const totalChanges = filteredAnalytics.reduce((sum, a) => sum + a.changes.length, 0);
  const appliedChanges = filteredAnalytics.reduce((sum, a) => sum + a.changes.filter(c => c.applied).length, 0);
  const successRate = totalChanges > 0 ? Math.round((appliedChanges / totalChanges) * 100) : 0;

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

  if (analytics.length === 0) {
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
        <h2 className="section-title" style={{ margin: 0 }}>📊 {t(language, 'analytics.title')}</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setShowFilters(!showFilters)}>
            🔍 {language === 'en' ? 'Filters' : 'Filtreler'}
          </button>
          <button className="btn btn-primary" onClick={() => handleExport('json')}>
            📥 JSON
          </button>
          <button className="btn btn-primary" onClick={() => handleExport('csv')}>
            📥 CSV
          </button>
          <button className="btn btn-primary" onClick={() => handleExport('excel')}>
            📥 Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
          <h3 className="card-subtitle">{language === 'en' ? 'Filter Analytics' : 'Analitikleri Filtrele'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
            <div className="form-group">
              <label className="form-label">{language === 'en' ? 'Start Date' : 'Başlangıç'}</label>
              <input
                type="date"
                className="form-input"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{language === 'en' ? 'End Date' : 'Bitiş'}</label>
              <input
                type="date"
                className="form-input"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{language === 'en' ? 'AI Provider' : 'Yapay Zeka'}</label>
              <select
                className="form-select"
                value={filter.aiProvider || ''}
                onChange={(e) => setFilter({ ...filter, aiProvider: e.target.value as any })}
              >
                <option value="">{language === 'en' ? 'All' : 'Tümü'}</option>
                <option value="openai">ChatGPT</option>
                <option value="gemini">Gemini</option>
                <option value="claude">Claude</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{language === 'en' ? 'Min Optimizations' : 'Min Optimizasyon'}</label>
              <input
                type="number"
                className="form-input"
                value={filter.minOptimizations || ''}
                onChange={(e) => setFilter({ ...filter, minOptimizations: Number(e.target.value) })}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button className="btn btn-primary" onClick={applyFilters}>
              ✓ {language === 'en' ? 'Apply Filters' : 'Filtreleri Uygula'}
            </button>
            <button className="btn btn-secondary" onClick={clearFilters}>
              ✕ {language === 'en' ? 'Clear' : 'Temizle'}
            </button>
          </div>

          {(filter.dateRange || filter.aiProvider || filter.minOptimizations) && (
            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '13px' }}>
              {language === 'en' ? 'Active filters:' : 'Aktif filtreler:'} {filteredAnalytics.length} / {analytics.length} {language === 'en' ? 'sessions' : 'oturum'}
            </div>
          )}
        </div>
      )}

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
            {totalOptimizations}
          </div>
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
            {t(language, 'analytics.totalOptimizations')}
          </div>
        </div>

        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--success-color)' }}>
            {totalSessions}
          </div>
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
            {language === 'en' ? 'Total Sessions' : 'Toplam Oturum'}
          </div>
        </div>

        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--success-color)' }}>
            {averagePerSession}
          </div>
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
            {t(language, 'analytics.averagePerSession')}
          </div>
        </div>

        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--info-color)' }}>
            {successRate}%
          </div>
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
            {language === 'en' ? 'Success Rate' : 'Başarı Oranı'}
          </div>
        </div>

        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--info-color)' }}>
            {mostOptimizedSection}
          </div>
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
            {t(language, 'analytics.mostOptimized')}
          </div>
        </div>

        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--warning-color)' }}>
            {mostUsedProvider === 'openai' ? 'ChatGPT' : mostUsedProvider === 'gemini' ? 'Gemini' : 'Claude'}
          </div>
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
            {t(language, 'analytics.aiProvider')}
          </div>
        </div>
      </div>

      {/* Time-based Statistics */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 className="card-subtitle">
          {language === 'en' ? '📅 Activity Timeline' : '📅 Aktivite Zaman Çizelgesi'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div style={{ padding: '15px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '5px' }}>
              {language === 'en' ? 'Last 7 Days' : 'Son 7 Gün'}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {optimizationsLast7Days} {language === 'en' ? 'optimizations' : 'optimizasyon'}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
              {last7Days.length} {language === 'en' ? 'sessions' : 'oturum'}
            </div>
          </div>

          <div style={{ padding: '15px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '5px' }}>
              {language === 'en' ? 'Last 30 Days' : 'Son 30 Gün'}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {optimizationsLast30Days} {language === 'en' ? 'optimizations' : 'optimizasyon'}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
              {last30Days.length} {language === 'en' ? 'sessions' : 'oturum'}
            </div>
          </div>

          <div style={{ padding: '15px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '5px' }}>
              {language === 'en' ? 'Avg. Job Description' : 'Ort. İş Tanımı'}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {avgJobDescLength}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
              {language === 'en' ? 'characters' : 'karakter'}
            </div>
          </div>
        </div>
      </div>

      {/* AI Provider Distribution */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 className="card-subtitle">
          {language === 'en' ? '🤖 AI Provider Distribution' : '🤖 Yapay Zeka Sağlayıcı Dağılımı'}
        </h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          {Object.entries(providerCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([provider, count]) => {
              const percentage = Math.round((count / totalSessions) * 100);
              const displayName = provider === 'openai' ? 'ChatGPT' : provider === 'gemini' ? 'Gemini' : 'Claude';
              return (
                <div key={provider} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    flex: 1, 
                    height: '35px', 
                    backgroundColor: provider === 'openai' ? '#10a37f' : provider === 'gemini' ? '#4285f4' : '#a06a4e', 
                    borderRadius: '4px',
                    width: `${percentage}%`,
                    transition: 'width 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '10px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {displayName}
                  </div>
                  <div style={{ width: '80px', textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{count}</div>
                    <div style={{ fontSize: '11px', opacity: 0.7 }}>{percentage}%</div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 className="card-subtitle">{t(language, 'analytics.categoryBreakdown')}</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          {Object.entries(categoryCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([category, count]) => (
              <div key={category} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  flex: 1, 
                  height: '30px', 
                  backgroundColor: 'var(--primary-color)', 
                  borderRadius: '4px',
                  width: `${(count / Math.max(...Object.values(categoryCounts))) * 100}%`,
                  transition: 'width 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '10px',
                  color: 'white',
                  fontSize: '14px'
                }}>
                  {category}
                </div>
                <div style={{ width: '40px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>
                  {count}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 className="card-subtitle">{t(language, 'analytics.recentActivity')}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {analytics.slice(0, 10).map((item) => (
            <div key={item.id} className="card" style={{ padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {new Date(item.timestamp).toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>
                  🤖 {item.aiProvider === 'openai' ? 'ChatGPT' : item.aiProvider === 'gemini' ? 'Gemini' : 'Claude'}
                </div>
              </div>
              <div style={{ fontSize: '13px', marginBottom: '4px' }}>
                ✨ {item.optimizationsApplied} {t(language, 'analytics.optimizationsApplied')}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.7, display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {item.categoriesOptimized.map((cat, idx) => (
                  <span key={idx} style={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    padding: '2px 8px', 
                    borderRadius: '4px',
                    fontSize: '11px'
                  }}>
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Button */}
      <button
        className="btn btn-danger"
        onClick={handleClearAnalytics}
        style={{ width: '100%' }}
      >
        🗑️ {t(language, 'analytics.clearData')}
      </button>
    </div>
  );
};
