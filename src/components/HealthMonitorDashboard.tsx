import React, { useState, useEffect } from 'react';
import { GoogleDriveService } from '../utils/googleDriveService';
import { t, Lang } from '../i18n';

interface HealthMonitorDashboardProps {
  language: Lang;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface HealthStatus {
  status: 'healthy' | 'warning' | 'error';
  lastCheck: string;
  issues: string[];
  metrics: {
    authentication: boolean;
    apiAccess: boolean;
    recentErrors: number;
  };
}

interface EnhancedValidation {
  valid: boolean;
  checks: {
    clientId: { passed: boolean; message: string };
    apis: { passed: boolean; message: string; details?: string[] };
    scopes: { passed: boolean; message: string; details?: string[] };
    quota: { passed: boolean; message: string; details?: string };
  };
  overallScore: number;
  recommendations: string[];
}

export const HealthMonitorDashboard: React.FC<HealthMonitorDashboardProps> = ({
  language,
  autoRefresh = true,
  refreshInterval = 60000, // 1 minute
}) => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [enhancedValidation, setEnhancedValidation] = useState<EnhancedValidation | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [showDetails, setShowDetails] = useState(false);

  const fetchHealthStatus = async () => {
    setLoading(true);
    try {
      const [health, enhanced] = await Promise.all([
        GoogleDriveService.getHealthStatus(),
        GoogleDriveService.validateEnhanced(),
      ]);
      setHealthStatus(health);
      setEnhancedValidation(enhanced);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch health status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();

    if (autoRefresh) {
      const interval = setInterval(fetchHealthStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const getStatusColor = (status?: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return '#4caf50';
      case 'warning':
        return '#ff9800';
      case 'error':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusIcon = (status?: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✗';
      default:
        return '?';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  return (
    <div className="health-monitor-dashboard">
      <div className="dashboard-header">
        <div>
          <h3 className="dashboard-title">📊 Health Monitor</h3>
          <p className="dashboard-subtitle">Real-time Google Drive integration status</p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={fetchHealthStatus}
          disabled={loading}
        >
          {loading ? '⏳' : '🔄'} Refresh
        </button>
      </div>

      {/* Overall Status Card */}
      {healthStatus && (
        <div className="status-card" style={{ borderColor: getStatusColor(healthStatus.status) }}>
          <div className="status-header">
            <div
              className="status-icon"
              style={{ backgroundColor: getStatusColor(healthStatus.status) }}
            >
              {getStatusIcon(healthStatus.status)}
            </div>
            <div className="status-info">
              <h4 className="status-title">
                {healthStatus.status === 'healthy' && 'All Systems Operational'}
                {healthStatus.status === 'warning' && 'Minor Issues Detected'}
                {healthStatus.status === 'error' && 'Critical Issues'}
              </h4>
              <p className="status-time">
                Last checked: {new Date(healthStatus.lastCheck).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {enhancedValidation && (
            <div className="status-score">
              <div className="score-circle" style={{ borderColor: getScoreColor(enhancedValidation.overallScore) }}>
                <span className="score-value" style={{ color: getScoreColor(enhancedValidation.overallScore) }}>
                  {enhancedValidation.overallScore}
                </span>
                <span className="score-label">Score</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Metrics Grid */}
      {healthStatus && (
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon" style={{ backgroundColor: healthStatus.metrics.authentication ? '#4caf50' : '#f44336' }}>
              🔐
            </div>
            <div className="metric-info">
              <p className="metric-label">Authentication</p>
              <p className="metric-value">
                {healthStatus.metrics.authentication ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon" style={{ backgroundColor: healthStatus.metrics.apiAccess ? '#4caf50' : '#f44336' }}>
              🔌
            </div>
            <div className="metric-info">
              <p className="metric-label">API Access</p>
              <p className="metric-value">
                {healthStatus.metrics.apiAccess ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon" style={{ backgroundColor: healthStatus.metrics.recentErrors === 0 ? '#4caf50' : '#ff9800' }}>
              📈
            </div>
            <div className="metric-info">
              <p className="metric-label">Recent Errors</p>
              <p className="metric-value">{healthStatus.metrics.recentErrors}</p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Validation Details */}
      {enhancedValidation && (
        <div className="validation-details">
          <button
            className="btn btn-link details-toggle"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? '▼' : '▶'} Detailed Validation Results
          </button>

          {showDetails && (
            <div className="details-content">
              {/* Client ID Check */}
              <div className="check-item">
                <div className="check-header">
                  <span className="check-icon">{enhancedValidation.checks.clientId.passed ? '✓' : '✗'}</span>
                  <span className="check-title">Client ID</span>
                </div>
                <p className="check-message">{enhancedValidation.checks.clientId.message}</p>
              </div>

              {/* APIs Check */}
              <div className="check-item">
                <div className="check-header">
                  <span className="check-icon">{enhancedValidation.checks.apis.passed ? '✓' : '✗'}</span>
                  <span className="check-title">API Endpoints</span>
                </div>
                <p className="check-message">{enhancedValidation.checks.apis.message}</p>
                {enhancedValidation.checks.apis.details && (
                  <ul className="check-details">
                    {enhancedValidation.checks.apis.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Scopes Check */}
              <div className="check-item">
                <div className="check-header">
                  <span className="check-icon">{enhancedValidation.checks.scopes.passed ? '✓' : '✗'}</span>
                  <span className="check-title">OAuth Scopes</span>
                </div>
                <p className="check-message">{enhancedValidation.checks.scopes.message}</p>
                {enhancedValidation.checks.scopes.details && (
                  <ul className="check-details">
                    {enhancedValidation.checks.scopes.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Quota Check */}
              <div className="check-item">
                <div className="check-header">
                  <span className="check-icon">{enhancedValidation.checks.quota.passed ? '✓' : '✗'}</span>
                  <span className="check-title">Quota Status</span>
                </div>
                <p className="check-message">{enhancedValidation.checks.quota.message}</p>
                {enhancedValidation.checks.quota.details && (
                  <p className="check-details-text">{enhancedValidation.checks.quota.details}</p>
                )}
              </div>

              {/* Recommendations */}
              {enhancedValidation.recommendations.length > 0 && (
                <div className="recommendations">
                  <h4 className="recommendations-title">📋 Recommendations</h4>
                  <ul className="recommendations-list">
                    {enhancedValidation.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Issues List */}
      {healthStatus && healthStatus.issues.length > 0 && (
        <div className="issues-list">
          <h4 className="issues-title">⚠️ Active Issues</h4>
          <ul>
            {healthStatus.issues.map((issue, index) => (
              <li key={index} className="issue-item">
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Auto-refresh indicator */}
      {autoRefresh && (
        <div className="auto-refresh-indicator">
          <span className="refresh-icon">🔄</span>
          <span className="refresh-text">
            Auto-refreshing every {refreshInterval / 1000} seconds
          </span>
        </div>
      )}

      <style>{`
        .health-monitor-dashboard {
          padding: 20px;
          background: #f9f9f9;
          border-radius: 8px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .dashboard-title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .dashboard-subtitle {
          color: #666;
          font-size: 14px;
        }

        .status-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          border-left: 4px solid;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .status-header {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .status-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: bold;
        }

        .status-info {
          flex: 1;
        }

        .status-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .status-time {
          color: #666;
          font-size: 12px;
        }

        .status-score {
          margin-left: 20px;
        }

        .score-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 4px solid;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .score-value {
          font-size: 24px;
          font-weight: bold;
        }

        .score-label {
          font-size: 10px;
          color: #666;
          text-transform: uppercase;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .metric-card {
          background: white;
          border-radius: 8px;
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .metric-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .metric-info {
          flex: 1;
        }

        .metric-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
        }

        .metric-value {
          font-size: 16px;
          font-weight: bold;
        }

        .validation-details {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .details-toggle {
          width: 100%;
          text-align: left;
          font-weight: bold;
          padding: 0;
        }

        .details-content {
          margin-top: 20px;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .check-item {
          padding: 15px;
          border-bottom: 1px solid #f0f0f0;
        }

        .check-item:last-child {
          border-bottom: none;
        }

        .check-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .check-icon {
          font-size: 20px;
          font-weight: bold;
        }

        .check-title {
          font-weight: bold;
          font-size: 16px;
        }

        .check-message {
          color: #666;
          margin-left: 30px;
          margin-bottom: 10px;
        }

        .check-details {
          margin-left: 30px;
          padding-left: 20px;
        }

        .check-details li {
          padding: 5px 0;
          font-size: 14px;
          color: #666;
        }

        .check-details-text {
          margin-left: 30px;
          font-size: 14px;
          color: #666;
        }

        .recommendations {
          margin-top: 20px;
          padding: 15px;
          background: #fff3e0;
          border-radius: 8px;
        }

        .recommendations-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .recommendations-list {
          padding-left: 20px;
        }

        .recommendations-list li {
          padding: 5px 0;
          color: #e65100;
        }

        .issues-list {
          background: #ffebee;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
        }

        .issues-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #c62828;
        }

        .issue-item {
          padding: 8px 0;
          color: #c62828;
        }

        .auto-refresh-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
          padding: 10px;
          background: white;
          border-radius: 8px;
          font-size: 12px;
          color: #666;
        }

        .refresh-icon {
          animation: rotate 2s linear infinite;
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
