import React, { useState, useEffect } from 'react';
import { OptimizationAnalytics } from '../types';
import { StorageService } from '../utils/storage';
import { t, Lang } from '../i18n';

interface AnalyticsDashboardProps {
  language: Lang;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ language }) => {
  const [analytics, setAnalytics] = useState<OptimizationAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await StorageService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAnalytics = async () => {
    if (confirm(t(language, 'analytics.clearConfirm'))) {
      await StorageService.clearAnalytics();
      setAnalytics([]);
    }
  };

  // Calculate statistics
  const totalOptimizations = analytics.reduce((sum, a) => sum + a.optimizationsApplied, 0);
  const averagePerSession = analytics.length > 0 ? (totalOptimizations / analytics.length).toFixed(1) : 0;
  
  // Get most optimized section
  const sectionCounts: Record<string, number> = {};
  analytics.forEach(a => {
    a.cvSections.forEach(section => {
      sectionCounts[section] = (sectionCounts[section] || 0) + 1;
    });
  });
  const mostOptimizedSection = Object.entries(sectionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  // Get category breakdown
  const categoryCounts: Record<string, number> = {};
  analytics.forEach(a => {
    a.categoriesOptimized.forEach(cat => {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
  });

  // AI Provider usage
  const providerCounts: Record<string, number> = {};
  analytics.forEach(a => {
    providerCounts[a.aiProvider] = (providerCounts[a.aiProvider] || 0) + 1;
  });
  const mostUsedProvider = Object.entries(providerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  if (loading) {
    return (
      <div className="section">
        <h2 className="section-title">📊 {t(language, 'analytics.title')}</h2>
        <div className="card">
          <p style={{ textAlign: 'center', padding: '20px' }}>
            {language === 'en' ? 'Loading...' : 'Yükleniyor...'}
          </p>
        </div>
      </div>
    );
  }

  if (analytics.length === 0) {
    return (
      <div className="section">
        <h2 className="section-title">📊 {t(language, 'analytics.title')}</h2>
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-text">{t(language, 'analytics.noData')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <h2 className="section-title">📊 {t(language, 'analytics.title')}</h2>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
            {totalOptimizations}
          </div>
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
            {t(language, 'analytics.totalOptimizations')}
          </div>
        </div>

        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--success-color)' }}>
            {averagePerSession}
          </div>
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
            {t(language, 'analytics.averagePerSession')}
          </div>
        </div>

        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--info-color)' }}>
            {mostOptimizedSection}
          </div>
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
            {t(language, 'analytics.mostOptimized')}
          </div>
        </div>

        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--warning-color)' }}>
            {mostUsedProvider === 'openai' ? 'ChatGPT' : mostUsedProvider === 'gemini' ? 'Gemini' : 'Claude'}
          </div>
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
            {t(language, 'analytics.aiProvider')}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 className="card-subtitle">{t(language, 'analytics.categoryBreakdown')}</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          {Object.entries(categoryCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([category, count]) => (
              <div key={category} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  flex: 1, 
                  height: '30px', 
                  backgroundColor: 'var(--primary-color)', 
                  borderRadius: '4px',
                  width: `${(count / Math.max(...Object.values(categoryCounts))) * 100}%`,
                  transition: 'width 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '10px',
                  color: 'white',
                  fontSize: '14px'
                }}>
                  {category}
                </div>
                <div style={{ width: '40px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>
                  {count}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 className="card-subtitle">{t(language, 'analytics.recentActivity')}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {analytics.slice(0, 10).map((item) => (
            <div key={item.id} className="card" style={{ padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {new Date(item.timestamp).toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>
                  🤖 {item.aiProvider === 'openai' ? 'ChatGPT' : item.aiProvider === 'gemini' ? 'Gemini' : 'Claude'}
                </div>
              </div>
              <div style={{ fontSize: '13px', marginBottom: '4px' }}>
                ✨ {item.optimizationsApplied} {t(language, 'analytics.optimizationsApplied')}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.7, display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {item.categoriesOptimized.map((cat, idx) => (
                  <span key={idx} style={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    padding: '2px 8px', 
                    borderRadius: '4px',
                    fontSize: '11px'
                  }}>
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Button */}
      <button
        className="btn btn-danger"
        onClick={handleClearAnalytics}
        style={{ width: '100%' }}
      >
        🗑️ {t(language, 'analytics.clearData')}
      </button>
    </div>
  );
};
