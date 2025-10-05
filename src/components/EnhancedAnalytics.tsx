import React, { useState, useEffect, useMemo } from 'react';
import { StorageService } from '../utils/storage';
import { t, Lang } from '../i18n';
import { AnalyticsDateRange, TemplateUsageAnalytics, TemplateMetadata } from '../types';
import { defaultCVTemplates } from '../data/cvTemplates';

interface EnhancedAnalyticsProps {
  language: Lang;
  onClose: () => void;
}

export const EnhancedAnalytics: React.FC<EnhancedAnalyticsProps> = ({
  language,
  onClose,
}) => {
  const [analytics, setAnalytics] = useState<TemplateUsageAnalytics[]>([]);
  const [templatesMetadata, setTemplatesMetadata] = useState<Record<string, TemplateMetadata>>({});
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
    preset: 'month'
  });

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    const [analyticsData, metadata] = await Promise.all([
      StorageService.getAnalyticsByDateRange(dateRange),
      StorageService.getAllTemplatesMetadata(),
    ]);
    setAnalytics(analyticsData);
    setTemplatesMetadata(metadata);
  };

  const handlePresetChange = (preset: AnalyticsDateRange['preset']) => {
    const end = new Date().toISOString().split('T')[0];
    let start = end;

    switch (preset) {
      case 'today':
        start = end;
        break;
      case 'week':
        start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'month':
        start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'quarter':
        start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'year':
        start = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'all':
        start = '2020-01-01';
        break;
    }

    setDateRange({ start, end, preset });
  };

  const handleExport = async (format: 'json' | 'csv') => {
    const data = await StorageService.exportAnalytics({
      format,
      dateRange,
      includeCharts: false,
      sections: ['summary', 'usage']
    });

    const blob = new Blob([data], { 
      type: format === 'json' ? 'application/json' : 'text/csv' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template-analytics-${dateRange.start}-to-${dateRange.end}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalUsage = analytics.length;
    const uniqueTemplates = new Set(analytics.map(a => a.templateId)).size;
    
    const usageByDate: Record<string, number> = {};
    analytics.forEach(a => {
      const date = new Date(a.timestamp).toLocaleDateString();
      usageByDate[date] = (usageByDate[date] || 0) + 1;
    });

    const dates = Object.keys(usageByDate).sort();
    const peakDate = dates.reduce((max, date) => 
      usageByDate[date] > (usageByDate[max] || 0) ? date : max
    , dates[0] || '');

    const daysInRange = Math.max(1, (new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime()) / (1000 * 60 * 60 * 24));
    const averageUsesPerDay = totalUsage / daysInRange;

    const templateUsage = analytics.reduce((acc, a) => {
      acc[a.templateId] = (acc[a.templateId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedTemplates = Object.entries(templateUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    const industryUsage = analytics.reduce((acc, a) => {
      const industry = a.context?.industry || 'Unknown';
      acc[industry] = (acc[industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeUsage = analytics.reduce((acc, a) => {
      acc[a.templateType] = (acc[a.templateType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const usageTrend = dates.map(date => ({
      date,
      count: usageByDate[date]
    }));

    return {
      totalUsage,
      uniqueTemplates,
      averageUsesPerDay,
      peakDate,
      peakUsage: usageByDate[peakDate] || 0,
      mostUsedTemplates,
      industryUsage,
      typeUsage,
      usageTrend
    };
  }, [analytics, dateRange]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content enhanced-analytics-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>📊 {t(language, 'analytics.enhanced')}</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Date Range Selector */}
          <div className="analytics-controls">
            <div className="date-presets">
              <button
                className={`preset-btn ${dateRange.preset === 'today' ? 'active' : ''}`}
                onClick={() => handlePresetChange('today')}
              >
                {t(language, 'analytics.today')}
              </button>
              <button
                className={`preset-btn ${dateRange.preset === 'week' ? 'active' : ''}`}
                onClick={() => handlePresetChange('week')}
              >
                {t(language, 'analytics.week')}
              </button>
              <button
                className={`preset-btn ${dateRange.preset === 'month' ? 'active' : ''}`}
                onClick={() => handlePresetChange('month')}
              >
                {t(language, 'analytics.month')}
              </button>
              <button
                className={`preset-btn ${dateRange.preset === 'quarter' ? 'active' : ''}`}
                onClick={() => handlePresetChange('quarter')}
              >
                {t(language, 'analytics.quarter')}
              </button>
              <button
                className={`preset-btn ${dateRange.preset === 'year' ? 'active' : ''}`}
                onClick={() => handlePresetChange('year')}
              >
                {t(language, 'analytics.year')}
              </button>
              <button
                className={`preset-btn ${dateRange.preset === 'all' ? 'active' : ''}`}
                onClick={() => handlePresetChange('all')}
              >
                {t(language, 'analytics.all')}
              </button>
            </div>

            <div className="custom-date-range">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value, preset: 'custom' })}
                className="date-input"
              />
              <span>→</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value, preset: 'custom' })}
                className="date-input"
              />
            </div>

            <div className="export-buttons">
              <button className="btn btn-sm btn-secondary" onClick={() => handleExport('json')}>
                📄 {t(language, 'analytics.exportJSON')}
              </button>
              <button className="btn btn-sm btn-secondary" onClick={() => handleExport('csv')}>
                📊 {t(language, 'analytics.exportCSV')}
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="analytics-summary">
            <div className="summary-card">
              <div className="card-icon">📈</div>
              <div className="card-content">
                <span className="card-label">{t(language, 'analytics.totalUsage')}</span>
                <span className="card-value">{stats.totalUsage}</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">🎨</div>
              <div className="card-content">
                <span className="card-label">{t(language, 'analytics.uniqueTemplates')}</span>
                <span className="card-value">{stats.uniqueTemplates}</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">📅</div>
              <div className="card-content">
                <span className="card-label">{t(language, 'analytics.avgPerDay')}</span>
                <span className="card-value">{stats.averageUsesPerDay.toFixed(1)}</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">🔥</div>
              <div className="card-content">
                <span className="card-label">{t(language, 'analytics.peakDay')}</span>
                <span className="card-value">{stats.peakUsage}</span>
                <span className="card-subtitle">{stats.peakDate}</span>
              </div>
            </div>
          </div>

          {/* Usage Trend Chart */}
          <div className="analytics-chart">
            <h4>{t(language, 'analytics.usageTrend')}</h4>
            <div className="trend-chart">
              {stats.usageTrend.map((point, idx) => {
                const maxUsage = Math.max(...stats.usageTrend.map(p => p.count));
                const height = maxUsage > 0 ? (point.count / maxUsage) * 100 : 0;
                
                return (
                  <div key={idx} className="trend-bar-container" title={`${point.date}: ${point.count}`}>
                    <div className="trend-bar" style={{ height: `${height}%` }} />
                    <span className="trend-label">{point.date.split('/').slice(0, 2).join('/')}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Most Used Templates */}
          <div className="analytics-section">
            <h4>{t(language, 'analytics.mostUsedTemplates')}</h4>
            <div className="templates-ranking">
              {stats.mostUsedTemplates.map(([templateId, count], idx) => {
                const template = defaultCVTemplates.find(t => t.id === templateId);
                return (
                  <div key={templateId} className="ranking-item">
                    <span className="rank-number">#{idx + 1}</span>
                    <span className="template-name">
                      {template?.preview} {template?.name || templateId}
                    </span>
                    <span className="usage-count">{count} {t(language, 'analytics.uses')}</span>
                    <div className="usage-bar-small">
                      <div
                        className="usage-fill-small"
                        style={{ width: `${(count / stats.mostUsedTemplates[0][1]) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Industry Breakdown */}
          <div className="analytics-section">
            <h4>{t(language, 'analytics.industryBreakdown')}</h4>
            <div className="industry-breakdown">
              {Object.entries(stats.industryUsage)
                .sort(([, a], [, b]) => b - a)
                .map(([industry, count]) => (
                  <div key={industry} className="industry-row">
                    <span className="industry-name">{industry}</span>
                    <div className="industry-bar">
                      <div
                        className="industry-fill"
                        style={{ width: `${(count / stats.totalUsage) * 100}%` }}
                      />
                    </div>
                    <span className="industry-count">
                      {count} ({((count / stats.totalUsage) * 100).toFixed(1)}%)
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Template Type Distribution */}
          <div className="analytics-section">
            <h4>{t(language, 'analytics.templateTypes')}</h4>
            <div className="type-distribution">
              {Object.entries(stats.typeUsage).map(([type, count]) => (
                <div key={type} className="type-card">
                  <div className="type-icon">
                    {type === 'cv' ? '📄' : type === 'cover-letter' ? '✉️' : '📝'}
                  </div>
                  <div className="type-info">
                    <span className="type-name">{type}</span>
                    <span className="type-count">{count}</span>
                    <span className="type-percentage">
                      {((count / stats.totalUsage) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            {t(language, 'common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
