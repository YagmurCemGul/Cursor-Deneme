import React, { useState, useEffect, useMemo } from 'react';
import { StorageService } from '../utils/storage';
import { t, Lang } from '../i18n';
import { AnalyticsDateRange, AnalyticsExportOptions, TemplateUsageAnalytics, TemplateMetadata } from '../types';
import { defaultCVTemplates } from '../data/cvTemplates';

interface EnhancedAnalyticsDashboardProps {
  language: Lang;
  onClose: () => void;
}

export const EnhancedAnalyticsDashboard: React.FC<EnhancedAnalyticsDashboardProps> = ({
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
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');

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
    const now = new Date();
    let start = new Date();

    switch (preset) {
      case 'today':
        start = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        start = new Date(0);
        break;
    }

    setDateRange({
      start: start.toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
      preset
    });
  };

  const handleExport = async () => {
    const options: AnalyticsExportOptions = {
      format: exportFormat,
      dateRange,
      sections: ['summary', 'usage', 'trends']
    };

    try {
      const exportData = await StorageService.exportAnalytics(options);
      
      const blob = new Blob([exportData], { 
        type: exportFormat === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${dateRange.start}-to-${dateRange.end}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert(t(language, 'analytics.exportSuccess'));
    } catch (error) {
      alert(t(language, 'analytics.exportError'));
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalUsage = analytics.length;
    const uniqueTemplates = new Set(analytics.map(a => a.templateId)).size;
    const uniqueIndustries = new Set(
      analytics.map(a => a.context?.industry).filter(Boolean)
    ).size;

    const usageByTemplate = analytics.reduce((acc, a) => {
      acc[a.templateId] = (acc[a.templateId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedTemplates = Object.entries(usageByTemplate)
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const usageByDate = analytics.reduce((acc, a) => {
      const date = new Date(a.timestamp).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const usageByIndustry = analytics.reduce((acc, a) => {
      const industry = a.context?.industry || 'Unknown';
      acc[industry] = (acc[industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const usageByType = analytics.reduce((acc, a) => {
      acc[a.templateType] = (acc[a.templateType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate trends
    const midpoint = analytics.length / 2;
    const firstHalf = analytics.slice(0, Math.floor(midpoint));
    const secondHalf = analytics.slice(Math.floor(midpoint));
    const usageGrowth = firstHalf.length > 0 
      ? ((secondHalf.length - firstHalf.length) / firstHalf.length) * 100 
      : 0;

    return {
      totalUsage,
      uniqueTemplates,
      uniqueIndustries,
      mostUsedTemplates,
      usageByDate,
      usageByIndustry,
      usageByType,
      usageGrowth,
      averageUsagePerDay: totalUsage / Math.max(1, Object.keys(usageByDate).length)
    };
  }, [analytics]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content enhanced-analytics-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>📊 {t(language, 'analytics.enhancedTitle')}</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Date Range Selector */}
          <div className="date-range-section">
            <h4>{t(language, 'analytics.dateRange')}</h4>
            
            <div className="preset-buttons">
              {(['today', 'week', 'month', 'quarter', 'year', 'all'] as const).map(preset => (
                <button
                  key={preset}
                  className={`preset-btn ${dateRange.preset === preset ? 'active' : ''}`}
                  onClick={() => handlePresetChange(preset)}
                >
                  {t(language, `analytics.preset.${preset}`)}
                </button>
              ))}
            </div>

            <div className="custom-date-range">
              <div className="date-input-group">
                <label htmlFor="start-date">{t(language, 'analytics.startDate')}:</label>
                <input
                  id="start-date"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value, preset: 'custom' })}
                  className="form-control"
                />
              </div>

              <div className="date-input-group">
                <label htmlFor="end-date">{t(language, 'analytics.endDate')}:</label>
                <input
                  id="end-date"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value, preset: 'custom' })}
                  className="form-control"
                />
              </div>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="analytics-summary">
            <h4>{t(language, 'analytics.summary')}</h4>
            <div className="summary-grid">
              <div className="summary-card">
                <span className="summary-icon">📈</span>
                <span className="summary-value">{stats.totalUsage}</span>
                <span className="summary-label">{t(language, 'analytics.totalUsage')}</span>
              </div>

              <div className="summary-card">
                <span className="summary-icon">📋</span>
                <span className="summary-value">{stats.uniqueTemplates}</span>
                <span className="summary-label">{t(language, 'analytics.uniqueTemplates')}</span>
              </div>

              <div className="summary-card">
                <span className="summary-icon">🏢</span>
                <span className="summary-value">{stats.uniqueIndustries}</span>
                <span className="summary-label">{t(language, 'analytics.industries')}</span>
              </div>

              <div className="summary-card">
                <span className="summary-icon">📊</span>
                <span className="summary-value">{stats.averageUsagePerDay.toFixed(1)}</span>
                <span className="summary-label">{t(language, 'analytics.avgPerDay')}</span>
              </div>

              <div className="summary-card">
                <span className="summary-icon">
                  {stats.usageGrowth >= 0 ? '📈' : '📉'}
                </span>
                <span className="summary-value" style={{ color: stats.usageGrowth >= 0 ? '#10b981' : '#ef4444' }}>
                  {stats.usageGrowth >= 0 ? '+' : ''}{stats.usageGrowth.toFixed(1)}%
                </span>
                <span className="summary-label">{t(language, 'analytics.growth')}</span>
              </div>
            </div>
          </div>

          {/* Most Used Templates */}
          <div className="analytics-section">
            <h4>{t(language, 'analytics.mostUsed')}</h4>
            <div className="chart-container">
              {stats.mostUsedTemplates.map(item => {
                const template = defaultCVTemplates.find(t => t.id === item.id);
                const percentage = (item.count / stats.totalUsage) * 100;
                
                return (
                  <div key={item.id} className="chart-row">
                    <span className="chart-label">
                      {template?.preview} {template?.name || item.id}
                    </span>
                    <div className="chart-bar">
                      <div 
                        className="chart-fill" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="chart-value">{item.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Usage by Industry */}
          <div className="analytics-section">
            <h4>{t(language, 'analytics.byIndustry')}</h4>
            <div className="chart-container">
              {Object.entries(stats.usageByIndustry)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([industry, count]) => {
                  const percentage = (count / stats.totalUsage) * 100;
                  
                  return (
                    <div key={industry} className="chart-row">
                      <span className="chart-label">{industry}</span>
                      <div className="chart-bar">
                        <div 
                          className="chart-fill" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="chart-value">{count}</span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Usage by Type */}
          <div className="analytics-section">
            <h4>{t(language, 'analytics.byType')}</h4>
            <div className="type-distribution">
              {Object.entries(stats.usageByType).map(([type, count]) => (
                <div key={type} className="type-card">
                  <span className="type-icon">
                    {type === 'cv' ? '📄' : type === 'cover-letter' ? '✉️' : '📝'}
                  </span>
                  <span className="type-label">
                    {t(language, `analytics.type.${type}`)}
                  </span>
                  <span className="type-count">{count}</span>
                  <span className="type-percentage">
                    ({((count / stats.totalUsage) * 100).toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Export Section */}
          <div className="export-section">
            <h4>{t(language, 'analytics.exportData')}</h4>
            <div className="export-controls">
              <div className="export-format">
                <label>{t(language, 'analytics.exportFormat')}:</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
                  className="form-select"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleExport}
              >
                📥 {t(language, 'analytics.exportButton')}
              </button>
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
