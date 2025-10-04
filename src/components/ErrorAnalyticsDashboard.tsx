import React, { useState, useEffect } from 'react';
import { ErrorAnalytics, ErrorLog } from '../types';
import { StorageService } from '../utils/storage';
import { t, Lang } from '../i18n';

interface ErrorAnalyticsDashboardProps {
  language: Lang;
}

export const ErrorAnalyticsDashboard: React.FC<ErrorAnalyticsDashboardProps> = ({ language }) => {
  const [analytics, setAnalytics] = useState<ErrorAnalytics | null>(null);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await StorageService.getErrorAnalytics();
      const logs = await StorageService.getErrorLogs();
      setAnalytics(data);
      setErrorLogs(logs);
    } catch (error) {
      console.error('Failed to load error analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (confirm(t(language, 'errorAnalytics.clearConfirm'))) {
      await StorageService.clearErrorLogs();
      await loadAnalytics();
    }
  };

  const handleMarkResolved = async (errorId: string) => {
    await StorageService.markErrorResolved(errorId);
    await loadAnalytics();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#dc3545';
      case 'high':
        return '#fd7e14';
      case 'medium':
        return '#ffc107';
      case 'low':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'runtime':
        return '⚠️';
      case 'network':
        return '🌐';
      case 'validation':
        return '✅';
      case 'api':
        return '🔌';
      case 'storage':
        return '💾';
      case 'parsing':
        return '📄';
      case 'export':
        return '📤';
      default:
        return '❓';
    }
  };

  const filteredErrors = errorLogs.filter((error) => {
    if (filterSeverity !== 'all' && error.severity !== filterSeverity) return false;
    if (filterType !== 'all' && error.errorType !== filterType) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="section">
        <h2 className="section-title">🔍 {t(language, 'errorAnalytics.title')}</h2>
        <div className="card">
          <p style={{ textAlign: 'center', padding: '20px' }}>
            {language === 'en' ? 'Loading...' : 'Yükleniyor...'}
          </p>
        </div>
      </div>
    );
  }

  if (!analytics || analytics.totalErrors === 0) {
    return (
      <div className="section">
        <h2 className="section-title">🔍 {t(language, 'errorAnalytics.title')}</h2>
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <div className="empty-state-text">{t(language, 'errorAnalytics.noErrors')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <h2 className="section-title">🔍 {t(language, 'errorAnalytics.title')}</h2>

      {/* Overview Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '20px',
        }}
      >
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc3545' }}>
            {analytics.totalErrors}
          </div>
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
            {t(language, 'errorAnalytics.totalErrors')}
          </div>
        </div>

        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: getSeverityColor('critical') }}>
            {analytics.errorsBySeverity.critical || 0}
          </div>
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
            {t(language, 'errorAnalytics.criticalErrors')}
          </div>
        </div>

        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: getSeverityColor('high') }}>
            {analytics.errorsBySeverity.high || 0}
          </div>
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
            {t(language, 'errorAnalytics.highErrors')}
          </div>
        </div>

        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
            {Object.keys(analytics.errorsByType).length}
          </div>
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
            {t(language, 'errorAnalytics.errorTypes')}
          </div>
        </div>
      </div>

      {/* Error Type Breakdown */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 className="card-subtitle">{t(language, 'errorAnalytics.byType')}</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          {Object.entries(analytics.errorsByType)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    flex: 1,
                    height: '35px',
                    backgroundColor: 'var(--primary-color)',
                    borderRadius: '4px',
                    width: `${(count / Math.max(...Object.values(analytics.errorsByType))) * 100}%`,
                    transition: 'width 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '10px',
                    color: 'white',
                    fontSize: '14px',
                  }}
                >
                  {getTypeIcon(type)} {type}
                </div>
                <div style={{ width: '40px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>
                  {count}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Severity Breakdown */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 className="card-subtitle">{t(language, 'errorAnalytics.bySeverity')}</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          {Object.entries(analytics.errorsBySeverity)
            .sort((a, b) => {
              const order = { critical: 0, high: 1, medium: 2, low: 3 };
              return (order[a[0] as keyof typeof order] || 4) - (order[b[0] as keyof typeof order] || 4);
            })
            .map(([severity, count]) => (
              <div key={severity} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    flex: 1,
                    height: '35px',
                    backgroundColor: getSeverityColor(severity),
                    borderRadius: '4px',
                    width: `${(count / Math.max(...Object.values(analytics.errorsBySeverity))) * 100}%`,
                    transition: 'width 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '10px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  {severity.toUpperCase()}
                </div>
                <div style={{ width: '40px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>
                  {count}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 className="card-subtitle">{t(language, 'errorAnalytics.filters')}</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
              {t(language, 'errorAnalytics.filterBySeverity')}
            </label>
            <select
              className="input"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="all">{language === 'en' ? 'All' : 'Tümü'}</option>
              <option value="critical">{language === 'en' ? 'Critical' : 'Kritik'}</option>
              <option value="high">{language === 'en' ? 'High' : 'Yüksek'}</option>
              <option value="medium">{language === 'en' ? 'Medium' : 'Orta'}</option>
              <option value="low">{language === 'en' ? 'Low' : 'Düşük'}</option>
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
              {t(language, 'errorAnalytics.filterByType')}
            </label>
            <select
              className="input"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="all">{language === 'en' ? 'All' : 'Tümü'}</option>
              <option value="runtime">{language === 'en' ? 'Runtime' : 'Çalışma Zamanı'}</option>
              <option value="network">{language === 'en' ? 'Network' : 'Ağ'}</option>
              <option value="validation">{language === 'en' ? 'Validation' : 'Doğrulama'}</option>
              <option value="api">API</option>
              <option value="storage">{language === 'en' ? 'Storage' : 'Depolama'}</option>
              <option value="parsing">{language === 'en' ? 'Parsing' : 'Ayrıştırma'}</option>
              <option value="export">{language === 'en' ? 'Export' : 'Dışa Aktarım'}</option>
              <option value="unknown">{language === 'en' ? 'Unknown' : 'Bilinmeyen'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recent Errors */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 className="card-subtitle">
          {t(language, 'errorAnalytics.recentErrors')} ({filteredErrors.length})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '500px', overflowY: 'auto' }}>
          {filteredErrors.map((error) => (
            <div
              key={error.id}
              className="card"
              style={{
                padding: '12px',
                cursor: 'pointer',
                borderLeft: `4px solid ${getSeverityColor(error.severity)}`,
                opacity: error.resolved ? 0.6 : 1,
              }}
              onClick={() => setSelectedError(selectedError?.id === error.id ? null : error)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '16px' }}>{getTypeIcon(error.errorType)}</span>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        backgroundColor: getSeverityColor(error.severity),
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    >
                      {error.severity.toUpperCase()}
                    </span>
                    {error.resolved && (
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          backgroundColor: '#28a745',
                          color: 'white',
                        }}
                      >
                        {language === 'en' ? 'RESOLVED' : 'ÇÖZÜLDİ'}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>{error.message}</div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>
                    {new Date(error.timestamp).toLocaleString(language === 'en' ? 'en-US' : 'tr-TR')}
                    {error.component && ` • ${error.component}`}
                    {error.action && ` • ${error.action}`}
                  </div>
                </div>
                {!error.resolved && (
                  <button
                    className="btn btn-success"
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkResolved(error.id);
                    }}
                  >
                    ✓ {language === 'en' ? 'Resolve' : 'Çöz'}
                  </button>
                )}
              </div>

              {selectedError?.id === error.id && (
                <div style={{ marginTop: '10px', padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px' }}>
                  {error.stack && (
                    <details style={{ marginBottom: '10px' }}>
                      <summary style={{ cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                        {language === 'en' ? 'Stack Trace' : 'Yığın İzleme'}
                      </summary>
                      <pre
                        style={{
                          marginTop: '8px',
                          fontSize: '11px',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          maxHeight: '200px',
                          overflow: 'auto',
                        }}
                      >
                        {error.stack}
                      </pre>
                    </details>
                  )}
                  {error.metadata && Object.keys(error.metadata).length > 0 && (
                    <details>
                      <summary style={{ cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                        {language === 'en' ? 'Metadata' : 'Metadata'}
                      </summary>
                      <pre
                        style={{
                          marginTop: '8px',
                          fontSize: '11px',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {JSON.stringify(error.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Clear Button */}
      <button className="btn btn-danger" onClick={handleClearLogs} style={{ width: '100%' }}>
        🗑️ {t(language, 'errorAnalytics.clearData')}
      </button>
    </div>
  );
};
