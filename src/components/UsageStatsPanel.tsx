/**
 * Usage Statistics Panel Component
 * Displays API usage statistics and trends
 */

import React, { useState, useEffect } from 'react';
import { UsageTracker } from '../utils/usageTracker';
import { formatCost } from '../utils/costCalculator';
import { formatTokenCount } from '../utils/tokenCounter';
import { APIUsageStats } from '../types/storage';

interface UsageStatsPanelProps {
  language: 'en' | 'tr';
}

export const UsageStatsPanel: React.FC<UsageStatsPanelProps> = ({ language }) => {
  const [summary, setSummary] = useState<any>(null);
  const [recentUsage, setRecentUsage] = useState<APIUsageStats[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<number>(7); // Last 7 days
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, [dateRange]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      const [summaryData, recent, trendsData] = await Promise.all([
        UsageTracker.getUsageSummary({ start: startDate, end: endDate }),
        UsageTracker.getRecentUsage(10),
        UsageTracker.getUsageTrends(dateRange),
      ]);

      setSummary(summaryData);
      setRecentUsage(recent);
      setTrends(trendsData);
    } catch (error) {
      console.error('Failed to load usage statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    const data = await UsageTracker.exportUsage();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-usage-stats-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleClear = async () => {
    if (confirm(language === 'tr' 
      ? 'Tüm kullanım istatistiklerini silmek istediğinizden emin misiniz?'
      : 'Are you sure you want to clear all usage statistics?')) {
      await UsageTracker.clearUsage();
      loadStatistics();
    }
  };

  if (loading) {
    return (
      <div className="section">
        <h2 className="section-title">
          📊 {language === 'tr' ? 'Kullanım İstatistikleri' : 'Usage Statistics'}
        </h2>
        <p>{language === 'tr' ? 'Yükleniyor...' : 'Loading...'}</p>
      </div>
    );
  }

  return (
    <div className="section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="section-title">
          📊 {language === 'tr' ? 'API Kullanım İstatistikleri' : 'API Usage Statistics'}
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            className="form-select"
            value={dateRange}
            onChange={(e) => setDateRange(Number(e.target.value))}
            style={{ width: 'auto' }}
          >
            <option value={7}>{language === 'tr' ? 'Son 7 Gün' : 'Last 7 Days'}</option>
            <option value={30}>{language === 'tr' ? 'Son 30 Gün' : 'Last 30 Days'}</option>
            <option value={90}>{language === 'tr' ? 'Son 90 Gün' : 'Last 90 Days'}</option>
          </select>
          <button className="btn btn-secondary" onClick={handleExport}>
            💾 {language === 'tr' ? 'Dışa Aktar' : 'Export'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
            {language === 'tr' ? 'Toplam Çağrı' : 'Total Calls'}
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{summary?.totalCalls || 0}</div>
        </div>
        
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
            {language === 'tr' ? 'Toplam Token' : 'Total Tokens'}
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {formatTokenCount(summary?.totalTokens || 0)}
          </div>
        </div>
        
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
            {language === 'tr' ? 'Toplam Maliyet' : 'Total Cost'}
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e53e3e' }}>
            {formatCost(summary?.totalCost || 0)}
          </div>
        </div>
        
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
            {language === 'tr' ? 'Başarı Oranı' : 'Success Rate'}
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#38a169' }}>
            {summary?.successRate?.toFixed(1) || 0}%
          </div>
        </div>
      </div>

      {/* Provider Breakdown */}
      {summary?.byProvider && Object.keys(summary.byProvider).length > 0 && (
        <div className="card" style={{ padding: '16px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>
            {language === 'tr' ? 'Sağlayıcı Bazında' : 'By Provider'}
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {Object.entries(summary.byProvider).map(([provider, stats]: [string, any]) => (
              <div key={provider} style={{ borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', textTransform: 'capitalize' }}>
                  {provider}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '13px' }}>
                  <div>
                    <div style={{ color: '#666' }}>{language === 'tr' ? 'Çağrı' : 'Calls'}</div>
                    <div style={{ fontWeight: 'bold' }}>{stats.calls}</div>
                  </div>
                  <div>
                    <div style={{ color: '#666' }}>{language === 'tr' ? 'Token' : 'Tokens'}</div>
                    <div style={{ fontWeight: 'bold' }}>{formatTokenCount(stats.tokens)}</div>
                  </div>
                  <div>
                    <div style={{ color: '#666' }}>{language === 'tr' ? 'Maliyet' : 'Cost'}</div>
                    <div style={{ fontWeight: 'bold' }}>{formatCost(stats.cost)}</div>
                  </div>
                  <div>
                    <div style={{ color: '#666' }}>{language === 'tr' ? 'Ort. Süre' : 'Avg Duration'}</div>
                    <div style={{ fontWeight: 'bold' }}>{(stats.avgDuration / 1000).toFixed(2)}s</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Usage */}
      {recentUsage.length > 0 && (
        <div className="card" style={{ padding: '16px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>
            {language === 'tr' ? 'Son Kullanımlar' : 'Recent Usage'}
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee' }}>
                  <th style={{ textAlign: 'left', padding: '8px' }}>
                    {language === 'tr' ? 'Zaman' : 'Time'}
                  </th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>
                    {language === 'tr' ? 'Sağlayıcı' : 'Provider'}
                  </th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>
                    {language === 'tr' ? 'Model' : 'Model'}
                  </th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>
                    {language === 'tr' ? 'İşlem' : 'Operation'}
                  </th>
                  <th style={{ textAlign: 'right', padding: '8px' }}>
                    {language === 'tr' ? 'Token' : 'Tokens'}
                  </th>
                  <th style={{ textAlign: 'right', padding: '8px' }}>
                    {language === 'tr' ? 'Maliyet' : 'Cost'}
                  </th>
                  <th style={{ textAlign: 'center', padding: '8px' }}>
                    {language === 'tr' ? 'Durum' : 'Status'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentUsage.map((stat) => (
                  <tr key={stat.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '8px' }}>
                      {new Date(stat.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: '8px', textTransform: 'capitalize' }}>{stat.provider}</td>
                    <td style={{ padding: '8px' }}>{stat.model}</td>
                    <td style={{ padding: '8px' }}>{stat.operation}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>
                      {formatTokenCount(stat.tokensUsed.total)}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{formatCost(stat.cost)}</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      {stat.success ? (
                        <span style={{ color: '#38a169' }}>✓</span>
                      ) : (
                        <span style={{ color: '#e53e3e' }}>✗</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={handleClear} style={{ color: '#e53e3e' }}>
          🗑️ {language === 'tr' ? 'İstatistikleri Temizle' : 'Clear Statistics'}
        </button>
      </div>
    </div>
  );
};
