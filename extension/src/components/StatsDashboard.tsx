/**
 * Stats Dashboard
 * Display AI usage, cache, and rate limit stats
 */

import React, { useState, useEffect } from 'react';
import { AICache, type CacheStats } from '../lib/aiCache';
import { RateLimiter } from '../lib/rateLimiter';
import { getUsageStats, type UsageStats } from '../lib/aiProviders';

export function StatsDashboard() {
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [rateLimitStats, setRateLimitStats] = useState<any>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const cache = AICache.getInstance();
      const limiter = RateLimiter.getInstance();
      
      setCacheStats(cache.getStats());
      setRateLimitStats(limiter.getUsageStats());
      const usage = await getUsageStats();
      setUsageStats(usage);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
    setLoading(false);
  };

  const handleClearCache = async () => {
    if (confirm('Clear all cached AI responses?')) {
      const cache = AICache.getInstance();
      await cache.clear();
      await loadStats();
    }
  };

  const handleResetLimits = async () => {
    if (confirm('Reset rate limits?')) {
      const limiter = RateLimiter.getInstance();
      await limiter.reset();
      await loadStats();
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
        <div style={{ fontSize: 18, color: '#64748b' }}>Loading statistics...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 12,
        padding: 24,
        color: 'white'
      }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 24 }}>📊 AI Usage Statistics</h2>
        <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>
          Monitor your AI usage, costs, and performance
        </p>
      </div>

      {/* Cache Stats */}
      {cacheStats && (
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          border: '2px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 18, color: '#1e293b' }}>⚡ Cache Performance</h3>
            <button
              onClick={handleClearCache}
              style={{
                padding: '8px 16px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Clear Cache
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <StatCard
              icon="💾"
              label="Cached Entries"
              value={cacheStats.totalEntries.toString()}
              color="#3b82f6"
            />
            <StatCard
              icon="✓"
              label="Cache Hits"
              value={cacheStats.totalHits.toString()}
              color="#10b981"
            />
            <StatCard
              icon="○"
              label="Cache Misses"
              value={cacheStats.totalMisses.toString()}
              color="#f59e0b"
            />
            <StatCard
              icon="📈"
              label="Hit Rate"
              value={`${cacheStats.hitRate}%`}
              color="#8b5cf6"
            />
            <StatCard
              icon="💰"
              label="Cost Saved"
              value={`$${cacheStats.costSaved.toFixed(2)}`}
              color="#10b981"
            />
          </div>
        </div>
      )}

      {/* Rate Limit Stats */}
      {rateLimitStats && (
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          border: '2px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 18, color: '#1e293b' }}>🚦 Rate Limits</h3>
            <button
              onClick={handleResetLimits}
              style={{
                padding: '8px 16px',
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <UsageBar
              label="This Minute"
              used={rateLimitStats.minute.used}
              limit={rateLimitStats.minute.limit}
              percentage={rateLimitStats.minute.percentage}
            />
            <UsageBar
              label="This Hour"
              used={rateLimitStats.hour.used}
              limit={rateLimitStats.hour.limit}
              percentage={rateLimitStats.hour.percentage}
            />
            <UsageBar
              label="Today"
              used={rateLimitStats.day.used}
              limit={rateLimitStats.day.limit}
              percentage={rateLimitStats.day.percentage}
            />
            <UsageBar
              label="Daily Cost"
              used={rateLimitStats.cost.used}
              limit={rateLimitStats.cost.limit}
              percentage={rateLimitStats.cost.percentage}
              prefix="$"
            />
          </div>
        </div>
      )}

      {/* AI Usage Stats */}
      {usageStats && (
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          border: '2px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 18, color: '#1e293b' }}>🤖 AI Usage</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <StatCard
              icon="💰"
              label="Total Cost"
              value={`$${usageStats.totalCost.toFixed(4)}`}
              color="#ef4444"
            />
            <StatCard
              icon="📝"
              label="Input Tokens"
              value={usageStats.totalInputTokens.toLocaleString()}
              color="#3b82f6"
            />
            <StatCard
              icon="📤"
              label="Output Tokens"
              value={usageStats.totalOutputTokens.toLocaleString()}
              color="#10b981"
            />
            <StatCard
              icon="🔄"
              label="Total Requests"
              value={usageStats.byModel ? Object.values(usageStats.byModel).reduce((sum: number, m: any) => sum + m.requests, 0).toString() : '0'}
              color="#8b5cf6"
            />
          </div>

          {/* By Model */}
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>
              Usage by Model:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {usageStats.byModel && Object.entries(usageStats.byModel).map(([model, stats]: [string, any]) => (
                <div key={model} style={{
                  padding: 12,
                  background: '#f8fafc',
                  borderRadius: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>
                      {model}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      {stats.requests} requests • {stats.totalTokens.toLocaleString()} tokens
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#ef4444' }}>
                    ${stats.totalCost.toFixed(4)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div style={{
      padding: 20,
      background: '#f8fafc',
      borderRadius: 10,
      borderLeft: `4px solid ${color}`
    }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>{value}</div>
    </div>
  );
}

function UsageBar({ label, used, limit, percentage, prefix = '' }: {
  label: string;
  used: number;
  limit: number;
  percentage: number;
  prefix?: string;
}) {
  const getColor = () => {
    if (percentage >= 90) return '#ef4444';
    if (percentage >= 70) return '#f59e0b';
    return '#10b981';
  };

  const color = getColor();

  return (
    <div style={{
      padding: 16,
      background: '#f8fafc',
      borderRadius: 8
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{label}</div>
        <div style={{ fontSize: 12, fontWeight: 700, color }}>
          {percentage}%
        </div>
      </div>
      <div style={{
        width: '100%',
        height: 8,
        background: '#e5e7eb',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8
      }}>
        <div style={{
          width: `${Math.min(percentage, 100)}%`,
          height: '100%',
          background: color,
          transition: 'width 0.3s'
        }} />
      </div>
      <div style={{ fontSize: 11, color: '#64748b' }}>
        {prefix}{used.toFixed(prefix ? 2 : 0)} / {prefix}{limit.toFixed(prefix ? 2 : 0)}
      </div>
    </div>
  );
}
