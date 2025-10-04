import React, { useState, useEffect } from 'react';
import { OptimizationAnalytics } from '../types';
import { StorageService } from '../utils/storage';
import { t, Lang } from '../i18n';

interface AdvancedAnalyticsProps {
  language: Lang;
}

interface DateRange {
  start: string;
  end: string;
}

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ language }) => {
  const [analytics, setAnalytics] = useState<OptimizationAnalytics[]>([]);
  const [filteredAnalytics, setFilteredAnalytics] = useState<OptimizationAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: '',
    end: '',
  });
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [compareMode, setCompareMode] = useState(false);
  const [compareRange1, setCompareRange1] = useState<DateRange>({ start: '', end: '' });
  const [compareRange2, setCompareRange2] = useState<DateRange>({ start: '', end: '' });

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [analytics, dateRange, selectedProvider]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await StorageService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...analytics];

    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(
        (a) => new Date(a.timestamp) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(
        (a) => new Date(a.timestamp) <= new Date(dateRange.end + 'T23:59:59')
      );
    }

    // Provider filter
    if (selectedProvider !== 'all') {
      filtered = filtered.filter((a) => a.aiProvider === selectedProvider);
    }

    setFilteredAnalytics(filtered);
  };

  const exportToCSV = () => {
    const headers = [
      'Date',
      'Time',
      'AI Provider',
      'Optimizations Applied',
      'Categories',
      'Sections',
      'Job Description Length',
      'Success Rate',
    ];

    const rows = filteredAnalytics.map((a) => {
      const date = new Date(a.timestamp);
      const successRate =
        a.changes.length > 0
          ? Math.round((a.changes.filter((c) => c.applied).length / a.changes.length) * 100)
          : 0;

      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        a.aiProvider,
        a.optimizationsApplied,
        a.categoriesOptimized.join('; '),
        a.cvSections.join('; '),
        a.jobDescriptionLength || 0,
        `${successRate}%`,
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      totalSessions: filteredAnalytics.length,
      dateRange: {
        start: dateRange.start || 'all',
        end: dateRange.end || 'all',
      },
      provider: selectedProvider,
      analytics: filteredAnalytics,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getComparisonData = (range: DateRange) => {
    const rangeData = analytics.filter((a) => {
      const date = new Date(a.timestamp);
      const start = range.start ? new Date(range.start) : new Date(0);
      const end = range.end ? new Date(range.end + 'T23:59:59') : new Date();
      return date >= start && date <= end;
    });

    return {
      sessions: rangeData.length,
      totalOptimizations: rangeData.reduce((sum, a) => sum + a.optimizationsApplied, 0),
      avgOptimizations:
        rangeData.length > 0
          ? (rangeData.reduce((sum, a) => sum + a.optimizationsApplied, 0) / rangeData.length).toFixed(1)
          : 0,
      providers: {
        openai: rangeData.filter((a) => a.aiProvider === 'openai').length,
        gemini: rangeData.filter((a) => a.aiProvider === 'gemini').length,
        claude: rangeData.filter((a) => a.aiProvider === 'claude').length,
      },
    };
  };

  const setPresetRange = (preset: string) => {
    const end = new Date();
    const start = new Date();

    switch (preset) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case '7days':
        start.setDate(start.getDate() - 7);
        break;
      case '30days':
        start.setDate(start.getDate() - 30);
        break;
      case '90days':
        start.setDate(start.getDate() - 90);
        break;
      case 'all':
        setDateRange({ start: '', end: '' });
        return;
    }

    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    });
  };

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

  const comparison1 = compareMode ? getComparisonData(compareRange1) : null;
  const comparison2 = compareMode ? getComparisonData(compareRange2) : null;

  return (
    <div className="section">
      <h2 className="section-title">
        📊 {language === 'en' ? 'Advanced Analytics' : 'Gelişmiş Analitikler'}
      </h2>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 className="card-subtitle">
          {language === 'en' ? '🔍 Filters' : '🔍 Filtreler'}
        </h3>

        {/* Quick Presets */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
          <button className="btn btn-sm btn-secondary" onClick={() => setPresetRange('today')}>
            {language === 'en' ? 'Today' : 'Bugün'}
          </button>
          <button className="btn btn-sm btn-secondary" onClick={() => setPresetRange('7days')}>
            {language === 'en' ? 'Last 7 Days' : 'Son 7 Gün'}
          </button>
          <button className="btn btn-sm btn-secondary" onClick={() => setPresetRange('30days')}>
            {language === 'en' ? 'Last 30 Days' : 'Son 30 Gün'}
          </button>
          <button className="btn btn-sm btn-secondary" onClick={() => setPresetRange('90days')}>
            {language === 'en' ? 'Last 90 Days' : 'Son 90 Gün'}
          </button>
          <button className="btn btn-sm btn-secondary" onClick={() => setPresetRange('all')}>
            {language === 'en' ? 'All Time' : 'Tüm Zamanlar'}
          </button>
        </div>

        {/* Custom Date Range */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div className="form-group">
            <label className="form-label">
              {language === 'en' ? 'Start Date' : 'Başlangıç Tarihi'}
            </label>
            <input
              type="date"
              className="form-input"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              {language === 'en' ? 'End Date' : 'Bitiş Tarihi'}
            </label>
            <input
              type="date"
              className="form-input"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              {language === 'en' ? 'AI Provider' : 'Yapay Zeka Sağlayıcı'}
            </label>
            <select
              className="form-select"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
            >
              <option value="all">{language === 'en' ? 'All Providers' : 'Tüm Sağlayıcılar'}</option>
              <option value="openai">ChatGPT</option>
              <option value="gemini">Gemini</option>
              <option value="claude">Claude</option>
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px' }}>
          {language === 'en'
            ? `Showing ${filteredAnalytics.length} of ${analytics.length} sessions`
            : `${analytics.length} oturumdan ${filteredAnalytics.length} tanesi gösteriliyor`}
        </div>
      </div>

      {/* Export Options */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 className="card-subtitle">
          {language === 'en' ? '📤 Export Data' : '📤 Verileri Dışa Aktar'}
        </h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={exportToCSV}>
            📊 {language === 'en' ? 'Export to CSV' : 'CSV Olarak Dışa Aktar'}
          </button>
          <button className="btn btn-secondary" onClick={exportToJSON}>
            📄 {language === 'en' ? 'Export to JSON' : 'JSON Olarak Dışa Aktar'}
          </button>
          <button
            className="btn btn-info"
            onClick={() => setCompareMode(!compareMode)}
          >
            📊 {language === 'en' ? 'Compare Periods' : 'Dönemleri Karşılaştır'}
          </button>
        </div>
      </div>

      {/* Comparison Mode */}
      {compareMode && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 className="card-subtitle">
            {language === 'en' ? '📊 Period Comparison' : '📊 Dönem Karşılaştırması'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
            {/* Period 1 */}
            <div>
              <h4 style={{ marginBottom: '10px' }}>
                {language === 'en' ? 'Period 1' : 'Dönem 1'}
              </h4>
              <div className="form-group">
                <label className="form-label">{language === 'en' ? 'Start' : 'Başlangıç'}</label>
                <input
                  type="date"
                  className="form-input"
                  value={compareRange1.start}
                  onChange={(e) => setCompareRange1({ ...compareRange1, start: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{language === 'en' ? 'End' : 'Bitiş'}</label>
                <input
                  type="date"
                  className="form-input"
                  value={compareRange1.end}
                  onChange={(e) => setCompareRange1({ ...compareRange1, end: e.target.value })}
                />
              </div>
            </div>

            {/* Period 2 */}
            <div>
              <h4 style={{ marginBottom: '10px' }}>
                {language === 'en' ? 'Period 2' : 'Dönem 2'}
              </h4>
              <div className="form-group">
                <label className="form-label">{language === 'en' ? 'Start' : 'Başlangıç'}</label>
                <input
                  type="date"
                  className="form-input"
                  value={compareRange2.start}
                  onChange={(e) => setCompareRange2({ ...compareRange2, start: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{language === 'en' ? 'End' : 'Bitiş'}</label>
                <input
                  type="date"
                  className="form-input"
                  value={compareRange2.end}
                  onChange={(e) => setCompareRange2({ ...compareRange2, end: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Comparison Results */}
          {comparison1 && comparison2 && (
            <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Period 1 Stats */}
              <div className="card" style={{ padding: '15px', backgroundColor: 'var(--bg-secondary)' }}>
                <h4 style={{ marginBottom: '15px', color: 'var(--primary-color)' }}>
                  {language === 'en' ? 'Period 1 Results' : 'Dönem 1 Sonuçları'}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{comparison1.sessions}</div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>
                      {language === 'en' ? 'Sessions' : 'Oturum'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{comparison1.totalOptimizations}</div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>
                      {language === 'en' ? 'Total Optimizations' : 'Toplam Optimizasyon'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{comparison1.avgOptimizations}</div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>
                      {language === 'en' ? 'Avg per Session' : 'Oturum Başına Ort.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Period 2 Stats */}
              <div className="card" style={{ padding: '15px', backgroundColor: 'var(--bg-secondary)' }}>
                <h4 style={{ marginBottom: '15px', color: 'var(--success-color)' }}>
                  {language === 'en' ? 'Period 2 Results' : 'Dönem 2 Sonuçları'}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      {comparison2.sessions}
                      {comparison2.sessions !== comparison1.sessions && (
                        <span
                          style={{
                            fontSize: '14px',
                            marginLeft: '10px',
                            color: comparison2.sessions > comparison1.sessions ? 'green' : 'red',
                          }}
                        >
                          {comparison2.sessions > comparison1.sessions ? '↑' : '↓'}
                          {Math.abs(comparison2.sessions - comparison1.sessions)}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>
                      {language === 'en' ? 'Sessions' : 'Oturum'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      {comparison2.totalOptimizations}
                      {comparison2.totalOptimizations !== comparison1.totalOptimizations && (
                        <span
                          style={{
                            fontSize: '14px',
                            marginLeft: '10px',
                            color:
                              comparison2.totalOptimizations > comparison1.totalOptimizations ? 'green' : 'red',
                          }}
                        >
                          {comparison2.totalOptimizations > comparison1.totalOptimizations ? '↑' : '↓'}
                          {Math.abs(comparison2.totalOptimizations - comparison1.totalOptimizations)}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>
                      {language === 'en' ? 'Total Optimizations' : 'Toplam Optimizasyon'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{comparison2.avgOptimizations}</div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>
                      {language === 'en' ? 'Avg per Session' : 'Oturum Başına Ort.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filtered Results Summary */}
      {filteredAnalytics.length > 0 && (
        <div className="card">
          <h3 className="card-subtitle">
            {language === 'en' ? '📈 Filtered Results' : '📈 Filtrelenmiş Sonuçlar'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                {filteredAnalytics.reduce((sum, a) => sum + a.optimizationsApplied, 0)}
              </div>
              <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.7 }}>
                {language === 'en' ? 'Total Optimizations' : 'Toplam Optimizasyon'}
              </div>
            </div>

            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--success-color)' }}>
                {(filteredAnalytics.reduce((sum, a) => sum + a.optimizationsApplied, 0) / filteredAnalytics.length).toFixed(1)}
              </div>
              <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.7 }}>
                {language === 'en' ? 'Average per Session' : 'Oturum Başına Ortalama'}
              </div>
            </div>

            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--info-color)' }}>
                {filteredAnalytics.length}
              </div>
              <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.7 }}>
                {language === 'en' ? 'Sessions' : 'Oturum'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
