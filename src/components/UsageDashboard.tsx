/**
 * Usage Dashboard Component
 * Real-time API usage monitoring and cost tracking
 */

import React, { useState, useEffect } from 'react';
import { getRateLimitTracker, UsageStats, WarningLevel } from '../utils/rateLimitTracker';
import { getBudgetManager, CostReport, BudgetAlert } from '../utils/budgetManager';
import { getGlobalQueue, QueueStats } from '../utils/smartRequestQueue';
import { AIProvider } from '../utils/aiProviders';

interface UsageDashboardProps {
  provider?: AIProvider;
  refreshInterval?: number;
}

export function UsageDashboard({ 
  provider = 'openai',
  refreshInterval = 5000 
}: UsageDashboardProps) {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [costReport, setCostReport] = useState<CostReport | null>(null);
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [budgetAlert, setBudgetAlert] = useState<BudgetAlert | null>(null);

  useEffect(() => {
    const updateStats = () => {
      const tracker = getRateLimitTracker(provider);
      const budgetManager = getBudgetManager();
      const queue = getGlobalQueue();

      setUsageStats(tracker.getUsageStats());
      setCostReport(budgetManager.getCostReport());
      setQueueStats(queue.getStats());
      setBudgetAlert(budgetManager.checkBudgetAlert());
    };

    updateStats();
    const interval = setInterval(updateStats, refreshInterval);

    // Listen for budget alerts
    const handleBudgetAlert = (event: CustomEvent<BudgetAlert>) => {
      setBudgetAlert(event.detail);
    };

    window.addEventListener('budgetAlert', handleBudgetAlert as EventListener);

    return () => {
      clearInterval(interval);
      window.removeEventListener('budgetAlert', handleBudgetAlert as EventListener);
    };
  }, [provider, refreshInterval]);

  if (!usageStats || !costReport || !queueStats) {
    return <div className="usage-dashboard loading">Loading...</div>;
  }

  const getWarningColor = (percentage: number): string => {
    if (percentage >= 95) return '#ef4444'; // red
    if (percentage >= 80) return '#f59e0b'; // amber
    if (percentage >= 60) return '#eab308'; // yellow
    return '#10b981'; // green
  };

  const formatWaitTime = (ms: number): string => {
    if (ms === 0) return 'None';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${Math.ceil(ms / 1000)}s`;
    return `${Math.ceil(ms / 60000)}m`;
  };

  return (
    <div className="usage-dashboard">
      <style>{`
        .usage-dashboard {
          padding: 20px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          max-width: 800px;
          margin: 0 auto;
        }
        .usage-dashboard.loading {
          text-align: center;
          padding: 40px;
          color: #6b7280;
        }
        .dashboard-header {
          margin-bottom: 24px;
        }
        .dashboard-header h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 600;
          color: #111827;
        }
        .dashboard-header p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }
        .alert {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .alert.info { background: #dbeafe; border-left: 4px solid #3b82f6; }
        .alert.warning { background: #fef3c7; border-left: 4px solid #f59e0b; }
        .alert.critical { background: #fee2e2; border-left: 4px solid #ef4444; }
        .alert.exceeded { background: #fecaca; border-left: 4px solid #dc2626; }
        .alert-icon {
          font-size: 20px;
        }
        .alert-content {
          flex: 1;
        }
        .alert-title {
          font-weight: 600;
          margin-bottom: 4px;
        }
        .alert-message {
          font-size: 14px;
          color: #374151;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .metric-card {
          background: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .metric-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .metric-value {
          font-size: 28px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 4px;
        }
        .metric-subtext {
          font-size: 13px;
          color: #6b7280;
        }
        .progress-section {
          margin-bottom: 24px;
        }
        .progress-item {
          margin-bottom: 16px;
        }
        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .progress-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }
        .progress-value {
          font-size: 13px;
          font-weight: 600;
          color: #6b7280;
        }
        .progress-bar {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          transition: width 0.3s ease, background-color 0.3s ease;
          border-radius: 4px;
        }
        .cost-breakdown {
          background: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .cost-breakdown h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }
        .cost-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .cost-item:last-child {
          border-bottom: none;
        }
        .cost-label {
          color: #6b7280;
          font-size: 14px;
        }
        .cost-value {
          font-weight: 600;
          color: #111827;
          font-size: 14px;
        }
        .queue-info {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 12px 16px;
          background: #eff6ff;
          border-radius: 8px;
          margin-top: 16px;
        }
        .queue-info-icon {
          font-size: 20px;
        }
        .queue-info-text {
          font-size: 14px;
          color: #1e40af;
        }
      `}</style>

      <div className="dashboard-header">
        <h2>API Usage Dashboard</h2>
        <p>Real-time monitoring for {provider.toUpperCase()}</p>
      </div>

      {budgetAlert && (
        <div className={`alert ${budgetAlert.level}`}>
          <span className="alert-icon">
            {budgetAlert.level === 'exceeded' ? '🚫' : 
             budgetAlert.level === 'critical' ? '⚠️' : 
             budgetAlert.level === 'warning' ? '⚡' : 'ℹ️'}
          </span>
          <div className="alert-content">
            <div className="alert-title">Budget Alert</div>
            <div className="alert-message">{budgetAlert.message}</div>
          </div>
        </div>
      )}

      {usageStats.waitTimeMs > 0 && (
        <div className="alert warning">
          <span className="alert-icon">⏱️</span>
          <div className="alert-content">
            <div className="alert-title">Rate Limit Wait</div>
            <div className="alert-message">
              Please wait {formatWaitTime(usageStats.waitTimeMs)} before next request
            </div>
          </div>
        </div>
      )}

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Today's Cost</div>
          <div className="metric-value">${costReport.totalCost.toFixed(2)}</div>
          <div className="metric-subtext">
            {costReport.totalRequests} requests
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Budget Remaining</div>
          <div className="metric-value">${costReport.remaining.toFixed(2)}</div>
          <div className="metric-subtext">
            of ${costReport.budgetLimit.toFixed(2)} limit
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Avg Cost/Request</div>
          <div className="metric-value">${costReport.averageCostPerRequest.toFixed(4)}</div>
          <div className="metric-subtext">
            {costReport.period} average
          </div>
        </div>

        {costReport.projectedCost && (
          <div className="metric-card">
            <div className="metric-label">Projected Cost</div>
            <div className="metric-value">${costReport.projectedCost.toFixed(2)}</div>
            <div className="metric-subtext">
              by end of {costReport.period}
            </div>
          </div>
        )}
      </div>

      <div className="progress-section">
        <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
          Rate Limits
        </h3>

        <div className="progress-item">
          <div className="progress-header">
            <span className="progress-label">Requests per Minute</span>
            <span className="progress-value">
              {usageStats.currentRpm} / {usageStats.maxRpm}
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{
                width: `${Math.min(100, usageStats.rpmUsagePercent)}%`,
                backgroundColor: getWarningColor(usageStats.rpmUsagePercent)
              }}
            />
          </div>
        </div>

        <div className="progress-item">
          <div className="progress-header">
            <span className="progress-label">Tokens per Minute</span>
            <span className="progress-value">
              {usageStats.currentTpm.toLocaleString()} / {usageStats.maxTpm.toLocaleString()}
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{
                width: `${Math.min(100, usageStats.tpmUsagePercent)}%`,
                backgroundColor: getWarningColor(usageStats.tpmUsagePercent)
              }}
            />
          </div>
        </div>

        <div className="progress-item">
          <div className="progress-header">
            <span className="progress-label">Budget Used</span>
            <span className="progress-value">
              ${costReport.totalCost.toFixed(2)} / ${costReport.budgetLimit.toFixed(2)}
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{
                width: `${Math.min(100, costReport.percentage)}%`,
                backgroundColor: getWarningColor(costReport.percentage)
              }}
            />
          </div>
        </div>
      </div>

      <div className="cost-breakdown">
        <h3>Cost Breakdown</h3>
        {Object.entries(costReport.byProvider).map(([provider, cost]) => (
          <div key={provider} className="cost-item">
            <span className="cost-label">{provider}</span>
            <span className="cost-value">${cost.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {queueStats.pending > 0 && (
        <div className="queue-info">
          <span className="queue-info-icon">📋</span>
          <span className="queue-info-text">
            {queueStats.pending} request{queueStats.pending !== 1 ? 's' : ''} in queue
            {queueStats.estimatedWaitTime > 0 && 
              ` • Est. wait: ${formatWaitTime(queueStats.estimatedWaitTime)}`
            }
          </span>
        </div>
      )}
    </div>
  );
}
