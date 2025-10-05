/**
 * Real-time Metrics Dashboard
 * Observability and monitoring
 */

import React, { useState, useEffect } from 'react';

interface Metrics {
  requests: { total: number; success: number; failed: number };
  latency: { p50: number; p95: number; p99: number };
  costs: { total: number; byProvider: Record<string, number> };
  cache: { hits: number; misses: number; hitRate: number };
  errors: Array<{ timestamp: number; message: string; provider: string }>;
}

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');

  useEffect(() => {
    // Mock metrics (replace with real data)
    const mockMetrics: Metrics = {
      requests: { total: 1250, success: 1198, failed: 52 },
      latency: { p50: 1250, p95: 3200, p99: 5100 },
      costs: {
        total: 12.45,
        byProvider: { openai: 8.20, gemini: 2.15, claude: 2.10 }
      },
      cache: { hits: 850, misses: 400, hitRate: 0.68 },
      errors: [
        { timestamp: Date.now() - 300000, message: 'Rate limit exceeded', provider: 'openai' },
        { timestamp: Date.now() - 150000, message: 'Timeout', provider: 'gemini' }
      ]
    };
    
    setMetrics(mockMetrics);
  }, [timeRange]);

  if (!metrics) return <div>Loading metrics...</div>;

  const successRate = ((metrics.requests.success / metrics.requests.total) * 100).toFixed(1);

  return (
    <div style={{ padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .metric-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .metric-title { font-size: 14px; color: #6b7280; margin-bottom: 8px; }
        .metric-value { font-size: 32px; font-weight: 700; color: #111827; }
        .metric-subtitle { font-size: 12px; color: #9ca3af; margin-top: 4px; }
        .chart { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 24px; }
        .error-log { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .error-item { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        .time-selector { display: flex; gap: 8px; margin-bottom: 20px; }
        .time-btn { padding: 8px 16px; border: 1px solid #e5e7eb; border-radius: 6px; background: white; cursor: pointer; }
        .time-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; }
      `}</style>

      <h1>Metrics Dashboard</h1>
      
      <div className="time-selector">
        {(['1h', '24h', '7d'] as const).map(range => (
          <button
            key={range}
            className={`time-btn ${timeRange === range ? 'active' : ''}`}
            onClick={() => setTimeRange(range)}
          >
            {range}
          </button>
        ))}
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-title">Total Requests</div>
          <div className="metric-value">{metrics.requests.total}</div>
          <div className="metric-subtitle">{successRate}% success rate</div>
        </div>

        <div className="metric-card">
          <div className="metric-title">Latency (P95)</div>
          <div className="metric-value">{(metrics.latency.p95/1000).toFixed(1)}s</div>
          <div className="metric-subtitle">P50: {(metrics.latency.p50/1000).toFixed(1)}s</div>
        </div>

        <div className="metric-card">
          <div className="metric-title">Total Cost</div>
          <div className="metric-value">${metrics.costs.total.toFixed(2)}</div>
          <div className="metric-subtitle">Last {timeRange}</div>
        </div>

        <div className="metric-card">
          <div className="metric-title">Cache Hit Rate</div>
          <div className="metric-value">{(metrics.cache.hitRate * 100).toFixed(0)}%</div>
          <div className="metric-subtitle">{metrics.cache.hits} hits, {metrics.cache.misses} misses</div>
        </div>
      </div>

      <div className="chart">
        <h3>Cost by Provider</h3>
        {Object.entries(metrics.costs.byProvider).map(([provider, cost]) => (
          <div key={provider} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>{provider}</span>
              <span>${cost.toFixed(2)}</span>
            </div>
            <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${(cost / metrics.costs.total) * 100}%`,
                height: '100%',
                background: '#3b82f6'
              }} />
            </div>
          </div>
        ))}
      </div>

      <div className="error-log">
        <h3>Recent Errors</h3>
        {metrics.errors.map((error, i) => (
          <div key={i} className="error-item">
            <div style={{ fontWeight: 600, color: '#ef4444' }}>{error.message}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              {error.provider} • {new Date(error.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
