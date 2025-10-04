import React, { useState, useEffect } from 'react';
import { ErrorTrackingService, ErrorStats, ErrorCategory } from '../utils/errorTracking';
import { ErrorPreventionService } from '../utils/errorPrevention';
import { logger } from '../utils/logger';

/**
 * Error Monitoring Dashboard Component
 * Displays error tracking statistics and prevention actions
 */
export const ErrorMonitoringDashboard: React.FC = () => {
  const [errorStats, setErrorStats] = useState<ErrorStats[]>([]);
  const [errorTrends, setErrorTrends] = useState<any>(null);
  const [preventionStats, setPreventionStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ErrorCategory | 'all'>('all');
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stats, trends, prevention, notifs] = await Promise.all([
        ErrorTrackingService.getAllErrorStats(),
        ErrorTrackingService.getErrorTrends(),
        ErrorPreventionService.getPreventionStats(),
        getNotifications(),
      ]);

      setErrorStats(stats);
      setErrorTrends(trends);
      setPreventionStats(prevention);
      setNotifications(notifs);
    } catch (error: any) {
      logger.error('Failed to load error monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotifications = async (): Promise<any[]> => {
    try {
      const { notifications = [] } = await chrome.storage.local.get('notifications');
      return notifications.filter((n: any) => !n.read);
    } catch (error: any) {
      return [];
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      const { notifications = [] } = await chrome.storage.local.get('notifications');
      const updated = notifications.map((n: any) =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      await chrome.storage.local.set({ notifications: updated });
      setNotifications(updated.filter((n: any) => !n.read));
    } catch (error: any) {
      logger.error('Failed to mark notification as read:', error);
    }
  };

  const handleClearAllErrors = async () => {
    if (window.confirm('Are you sure you want to clear all error tracking data?')) {
      await ErrorTrackingService.clearAllErrors();
      await loadData();
    }
  };

  const handleMarkResolved = async (errorHash: string) => {
    await ErrorTrackingService.markErrorResolved(errorHash);
    await loadData();
  };

  const handleRunPrevention = async () => {
    try {
      const results = await ErrorPreventionService.checkAndPrevent();
      alert(
        `Prevention check completed. Applied ${results.filter((r) => r.success).length} preventive measures.`
      );
      await loadData();
    } catch (error: any) {
      logger.error('Failed to run prevention:', error);
      alert('Failed to run prevention check. See console for details.');
    }
  };

  const filteredStats =
    selectedCategory === 'all'
      ? errorStats
      : errorStats.filter((s) => s.category === selectedCategory);

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return '#dc2626';
      case 'high':
        return '#ea580c';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getTrendIcon = (trend: string): string => {
    switch (trend) {
      case 'increasing':
        return '📈';
      case 'decreasing':
        return '📉';
      default:
        return '➡️';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
        <div>Loading error monitoring data...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>🔍 Error Monitoring Dashboard</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleRunPrevention}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            🛡️ Run Prevention
          </button>
          <button
            onClick={loadData}
            style={{
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            🔄 Refresh
          </button>
          <button
            onClick={handleClearAllErrors}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            🗑️ Clear All
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                padding: '12px',
                backgroundColor:
                  notification.type === 'error'
                    ? '#fee'
                    : notification.type === 'warning'
                      ? '#fef3c7'
                      : '#e0f2fe',
                border: `1px solid ${notification.type === 'error' ? '#fcc' : notification.type === 'warning' ? '#fde68a' : '#bae6fd'}`,
                borderRadius: '6px',
                marginBottom: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <strong>{notification.title}</strong>
                <div style={{ fontSize: '14px', marginTop: '4px' }}>{notification.message}</div>
              </div>
              <button
                onClick={() => markNotificationRead(notification.id)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div style={{ padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Total Errors</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{errorTrends?.totalErrors || 0}</div>
        </div>

        <div style={{ padding: '15px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '5px' }}>Frequent Errors</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{errorTrends?.frequentErrors || 0}</div>
        </div>

        <div style={{ padding: '15px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', color: '#991b1b', marginBottom: '5px' }}>Critical Errors</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{errorTrends?.criticalErrors || 0}</div>
        </div>

        <div style={{ padding: '15px', backgroundColor: '#e0f2fe', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', color: '#075985', marginBottom: '5px' }}>
            Trend {getTrendIcon(errorTrends?.recentTrend)}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', textTransform: 'capitalize' }}>
            {errorTrends?.recentTrend || 'stable'}
          </div>
        </div>
      </div>

      {/* Prevention Stats */}
      {preventionStats && (
        <div style={{ padding: '15px', backgroundColor: '#dcfce7', borderRadius: '8px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>🛡️ Prevention Statistics</h3>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <strong>Total Preventions:</strong> {preventionStats.totalPreventions}
            </div>
            <div>
              <strong>Success Rate:</strong> {(preventionStats.successRate * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Filter by Category:</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as ErrorCategory | 'all')}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
          }}
        >
          <option value="all">All Categories</option>
          {Object.values(ErrorCategory).map((category) => (
            <option key={category} value={category}>
              {category.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Error List */}
      <div>
        <h3 style={{ marginBottom: '15px' }}>Error Statistics ({filteredStats.length})</h3>
        {filteredStats.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>✨</div>
            <div style={{ fontSize: '18px', color: '#6b7280' }}>No errors tracked</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredStats.map((stat) => (
              <div
                key={stat.errorHash}
                style={{
                  padding: '15px',
                  backgroundColor: 'white',
                  border: `2px solid ${getSeverityColor(stat.severity)}`,
                  borderRadius: '8px',
                  opacity: stat.resolved ? 0.6 : 1,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          backgroundColor: getSeverityColor(stat.severity),
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                        }}
                      >
                        {stat.severity.toUpperCase()}
                      </span>
                      <span
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#e5e7eb',
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}
                      >
                        {stat.category}
                      </span>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        Occurred {stat.count} time{stat.count !== 1 ? 's' : ''}
                      </span>
                      {stat.resolved && (
                        <span
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            borderRadius: '4px',
                            fontSize: '12px',
                          }}
                        >
                          ✓ RESOLVED
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '14px', marginBottom: '8px', fontFamily: 'monospace' }}>
                      {stat.message}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      Contexts: {stat.contexts.join(', ') || 'N/A'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      Last occurred: {new Date(stat.lastOccurrence).toLocaleString()}
                    </div>
                  </div>
                  {!stat.resolved && (
                    <button
                      onClick={() => handleMarkResolved(stat.errorHash)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
