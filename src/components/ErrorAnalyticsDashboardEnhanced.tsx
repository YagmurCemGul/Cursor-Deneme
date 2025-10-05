import React, { useState, useEffect } from 'react';
import { ErrorAnalytics, ErrorLog, ErrorGroup } from '../types';
import { StorageService } from '../utils/storage';
import { t, Lang } from '../i18n';

interface ErrorAnalyticsDashboardEnhancedProps {
  language: Lang;
}

export const ErrorAnalyticsDashboardEnhanced: React.FC<ErrorAnalyticsDashboardEnhancedProps> = ({ language }) => {
  const [analytics, setAnalytics] = useState<ErrorAnalytics | null>(null);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<ErrorGroup | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'individual' | 'grouped'>('grouped');

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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
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

      {/* Error Rate Cards */}
      {analytics.errorRate && (
        <div style={{ marginBottom: '20px' }}>
          <h3 className="card-subtitle">{language === 'en' ? 'Error Rate' : 'Hata Oranı'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
            <div className="card" style={{ padding: '15px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: analytics.errorRate.lastHour > 10 ? '#dc3545' : '#28a745' }}>
                {analytics.errorRate.lastHour}
              </div>
              <div style={{ fontSize: '11px', marginTop: '5px', opacity: 0.8 }}>
                {language === 'en' ? 'Last Hour' : 'Son Saat'}
              </div>
            </div>
            <div className="card" style={{ padding: '15px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#17a2b8' }}>
                {analytics.errorRate.lastDay}
              </div>
              <div style={{ fontSize: '11px', marginTop: '5px', opacity: 0.8 }}>
                {language === 'en' ? 'Last 24 Hours' : 'Son 24 Saat'}
              </div>
            </div>
            <div className="card" style={{ padding: '15px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6c757d' }}>
                {analytics.errorRate.lastWeek}
              </div>
              <div style={{ fontSize: '11px', marginTop: '5px', opacity: 0.8 }}>
                {language === 'en' ? 'Last Week' : 'Son Hafta'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Impact */}
      {analytics.performanceImpact && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 className="card-subtitle">{language === 'en' ? '⚡ Performance Impact' : '⚡ Performans Etkisi'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>
                {language === 'en' ? 'Avg Memory Increase' : 'Ort. Bellek Artışı'}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {formatBytes(analytics.performanceImpact.avgMemoryIncrease)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>
                {language === 'en' ? 'Avg Load Time Impact' : 'Ort. Yükleme Süresi'}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {Math.round(analytics.performanceImpact.avgLoadTimeIncrease)}ms
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>
                {language === 'en' ? 'Impacted Operations' : 'Etkilenen İşlemler'}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {analytics.performanceImpact.totalImpactedOperations}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Trends Graph */}
      {analytics.errorTrends && analytics.errorTrends.length > 0 && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 className="card-subtitle">{language === 'en' ? '📈 Error Trends' : '📈 Hata Eğilimleri'}</h3>
          <div style={{ position: 'relative', height: '150px', display: 'flex', alignItems: 'flex-end', gap: '4px', padding: '10px 0' }}>
            {analytics.errorTrends.slice(-14).map((trend, idx) => {
              const maxCount = Math.max(...analytics.errorTrends.map(t => t.count));
              const height = maxCount > 0 ? (trend.count / maxCount) * 120 : 0;
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div 
                    style={{ 
                      width: '100%', 
                      height: `${height}px`, 
                      backgroundColor: trend.count > 10 ? '#dc3545' : '#007bff',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    title={`${trend.date}: ${trend.count} errors`}
                  >
                    {trend.count > 0 && (
                      <div style={{ 
                        position: 'absolute', 
                        top: '-20px', 
                        left: '50%', 
                        transform: 'translateX(-50%)',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        {trend.count}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '9px', marginTop: '5px', opacity: 0.6, transform: 'rotate(-45deg)', transformOrigin: 'top left', whiteSpace: 'nowrap' }}>
                    {new Date(trend.date).toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View Mode Toggle */}
      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
        <button
          className={`btn ${viewMode === 'grouped' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setViewMode('grouped')}
          style={{ fontSize: '13px', padding: '8px 16px' }}
        >
          👥 {language === 'en' ? 'Grouped Errors' : 'Gruplanmış Hatalar'}
          {analytics.groupedErrors && ` (${analytics.groupedErrors.length})`}
        </button>
        <button
          className={`btn ${viewMode === 'individual' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setViewMode('individual')}
          style={{ fontSize: '13px', padding: '8px 16px' }}
        >
          📋 {language === 'en' ? 'All Errors' : 'Tüm Hatalar'} ({filteredErrors.length})
        </button>
      </div>

      {/* Grouped Errors View */}
      {viewMode === 'grouped' && analytics.groupedErrors && analytics.groupedErrors.length > 0 && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 className="card-subtitle">{language === 'en' ? '👥 Grouped Errors' : '👥 Gruplanmış Hatalar'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {analytics.groupedErrors.slice(0, 10).map((group) => (
              <div
                key={group.id}
                className="card"
                style={{
                  padding: '12px',
                  cursor: 'pointer',
                  borderLeft: `4px solid ${getSeverityColor(group.severity)}`,
                }}
                onClick={() => setSelectedGroup(selectedGroup?.id === group.id ? null : group)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '16px' }}>{getTypeIcon(group.errorType)}</span>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          backgroundColor: getSeverityColor(group.severity),
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      >
                        {group.severity.toUpperCase()}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          backgroundColor: '#17a2b8',
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      >
                        {group.count}x
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>{group.message}</div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>
                      {language === 'en' ? 'First seen' : 'İlk görülme'}: {new Date(group.firstSeen).toLocaleString(language === 'en' ? 'en-US' : 'tr-TR')}
                      {' • '}
                      {language === 'en' ? 'Last seen' : 'Son görülme'}: {new Date(group.lastSeen).toLocaleString(language === 'en' ? 'en-US' : 'tr-TR')}
                    </div>
                  </div>
                </div>

                {selectedGroup?.id === group.id && group.errors.length > 0 && (
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>
                      {language === 'en' ? `Recent occurrences (${group.errors.length} shown)` : `Son tekrarlar (${group.errors.length} gösteriliyor)`}
                    </div>
                    {group.errors.map((error, idx) => (
                      <div key={idx} style={{ fontSize: '12px', padding: '4px 0', borderBottom: '1px solid var(--border-color)' }}>
                        {new Date(error.timestamp).toLocaleString(language === 'en' ? 'en-US' : 'tr-TR')}
                        {error.component && ` • ${error.component}`}
                        {error.recoverable && (
                          <span style={{ marginLeft: '8px', color: '#28a745' }}>
                            ✓ {language === 'en' ? 'Recoverable' : 'Kurtarılabilir'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Individual Errors View (existing code with recovery suggestions) */}
      {viewMode === 'individual' && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 className="card-subtitle">
            {t(language, 'errorAnalytics.recentErrors')} ({filteredErrors.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '600px', overflowY: 'auto' }}>
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
                      {error.recoverable && (
                        <span
                          style={{
                            fontSize: '11px',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            backgroundColor: '#28a745',
                            color: 'white',
                          }}
                        >
                          {language === 'en' ? '✓ RECOVERABLE' : '✓ KURTARILABİLİR'}
                        </span>
                      )}
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
                    {error.recoverySuggestion && (
                      <div style={{ marginTop: '6px', padding: '6px', backgroundColor: '#d4edda', borderRadius: '4px', fontSize: '12px' }}>
                        💡 <strong>{language === 'en' ? 'Recovery Suggestion' : 'Kurtarma Önerisi'}:</strong> {error.recoverySuggestion}
                      </div>
                    )}
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
                    {/* Breadcrumbs */}
                    {error.breadcrumbs && error.breadcrumbs.length > 0 && (
                      <details style={{ marginBottom: '10px' }}>
                        <summary style={{ cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                          🍞 {language === 'en' ? 'User Actions Leading to Error' : 'Hataya Yol Açan Kullanıcı Eylemleri'} ({error.breadcrumbs.length})
                        </summary>
                        <div style={{ marginTop: '8px', maxHeight: '200px', overflow: 'auto' }}>
                          {error.breadcrumbs.map((breadcrumb, idx) => (
                            <div key={idx} style={{ fontSize: '11px', padding: '4px 0', borderBottom: '1px solid var(--border-color)' }}>
                              <span style={{ opacity: 0.6 }}>{new Date(breadcrumb.timestamp).toLocaleTimeString()}</span>
                              {' • '}
                              <span style={{ fontWeight: 'bold' }}>{breadcrumb.type}</span>
                              {' • '}
                              {breadcrumb.message}
                            </div>
                          ))}
                        </div>
                      </details>
                    )}

                    {/* Performance Impact */}
                    {error.performanceImpact && (
                      <details style={{ marginBottom: '10px' }}>
                        <summary style={{ cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                          ⚡ {language === 'en' ? 'Performance Impact' : 'Performans Etkisi'}
                        </summary>
                        <div style={{ marginTop: '8px', fontSize: '12px' }}>
                          {error.performanceImpact.memoryUsage && (
                            <div>Memory: {formatBytes(error.performanceImpact.memoryUsage)}</div>
                          )}
                          {error.performanceImpact.loadTime && (
                            <div>Load Time: {Math.round(error.performanceImpact.loadTime)}ms</div>
                          )}
                        </div>
                      </details>
                    )}

                    {/* Stack Trace */}
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

                    {/* Metadata */}
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
      )}

      {/* Clear Button */}
      <button className="btn btn-danger" onClick={handleClearLogs} style={{ width: '100%' }}>
        🗑️ {t(language, 'errorAnalytics.clearData')}
      </button>
    </div>
  );
};
