import React, { useState, useEffect } from 'react';
import { t, Lang } from '../i18n';
import { SavedJobDescription } from '../types';
import { StorageService } from '../utils/storage';

interface AnalyticsDashboardProps {
  language: Lang;
  onClose: () => void;
}

interface AnalyticsData {
  totalDescriptions: number;
  totalUsage: number;
  averageUsage: number;
  mostUsedDescription: SavedJobDescription | null;
  leastUsedDescription: SavedJobDescription | null;
  categoryDistribution: Record<string, number>;
  tagFrequency: Record<string, number>;
  creationTrend: Array<{ date: string; count: number }>;
  usageTrend: Array<{ date: string; count: number }>;
  topDescriptions: SavedJobDescription[];
  recentActivity: Array<{
    type: 'created' | 'updated' | 'used';
    description: SavedJobDescription;
    timestamp: string;
  }>;
}

export const JobDescriptionAnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  language,
  onClose,
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year' | 'all'>('month');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const descriptions = await StorageService.getJobDescriptions();
      const analyticsData = calculateAnalytics(descriptions, timeRange);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAnalytics = (
    descriptions: SavedJobDescription[],
    range: string
  ): AnalyticsData => {
    const totalDescriptions = descriptions.length;
    const totalUsage = descriptions.reduce((sum, d) => sum + (d.usageCount || 0), 0);
    const averageUsage = totalDescriptions > 0 ? totalUsage / totalDescriptions : 0;

    // Most and least used
    const sortedByUsage = [...descriptions].sort((a, b) => 
      (b.usageCount || 0) - (a.usageCount || 0)
    );
    const mostUsedDescription = sortedByUsage[0] || null;
    const leastUsedDescription = sortedByUsage[sortedByUsage.length - 1] || null;

    // Category distribution
    const categoryDistribution: Record<string, number> = {};
    descriptions.forEach(d => {
      const cat = d.category || 'Uncategorized';
      categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;
    });

    // Tag frequency
    const tagFrequency: Record<string, number> = {};
    descriptions.forEach(d => {
      d.tags?.forEach(tag => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      });
    });

    // Creation trend (last N days/months)
    const creationTrend = calculateTimeTrend(descriptions, range, 'created');
    const usageTrend = calculateTimeTrend(descriptions, range, 'usage');

    // Top descriptions by usage
    const topDescriptions = sortedByUsage.slice(0, 10);

    // Recent activity
    const recentActivity = generateRecentActivity(descriptions);

    return {
      totalDescriptions,
      totalUsage,
      averageUsage,
      mostUsedDescription,
      leastUsedDescription,
      categoryDistribution,
      tagFrequency,
      creationTrend,
      usageTrend,
      topDescriptions,
      recentActivity,
    };
  };

  const calculateTimeTrend = (
    descriptions: SavedJobDescription[],
    range: string,
    type: 'created' | 'usage'
  ): Array<{ date: string; count: number }> => {
    const now = new Date();
    const periods: Array<{ date: string; count: number }> = [];
    
    let daysBack = 30;
    let groupBy: 'day' | 'week' | 'month' = 'day';

    switch (range) {
      case 'week':
        daysBack = 7;
        groupBy = 'day';
        break;
      case 'month':
        daysBack = 30;
        groupBy = 'day';
        break;
      case 'quarter':
        daysBack = 90;
        groupBy = 'week';
        break;
      case 'year':
        daysBack = 365;
        groupBy = 'month';
        break;
      case 'all':
        daysBack = 1000;
        groupBy = 'month';
        break;
    }

    // Generate period labels
    for (let i = 0; i < (groupBy === 'day' ? daysBack : Math.ceil(daysBack / (groupBy === 'week' ? 7 : 30))); i++) {
      const date = new Date(now);
      if (groupBy === 'day') {
        date.setDate(date.getDate() - i);
      } else if (groupBy === 'week') {
        date.setDate(date.getDate() - (i * 7));
      } else {
        date.setMonth(date.getMonth() - i);
      }
      
      periods.unshift({
        date: formatDateForTrend(date, groupBy),
        count: 0,
      });
    }

    // Count descriptions per period
    descriptions.forEach(desc => {
      const dateField = type === 'created' ? desc.createdAt : desc.updatedAt;
      const date = new Date(dateField);
      const label = formatDateForTrend(date, groupBy);
      
      const period = periods.find(p => p.date === label);
      if (period) {
        if (type === 'created') {
          period.count += 1;
        } else {
          period.count += desc.usageCount || 0;
        }
      }
    });

    return periods;
  };

  const formatDateForTrend = (date: Date, groupBy: 'day' | 'week' | 'month'): string => {
    if (groupBy === 'day') {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    } else if (groupBy === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      return `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
    } else {
      return `${date.getMonth() + 1}/${date.getFullYear()}`;
    }
  };

  const generateRecentActivity = (
    descriptions: SavedJobDescription[]
  ): Array<{
    type: 'created' | 'updated' | 'used';
    description: SavedJobDescription;
    timestamp: string;
  }> => {
    const activities: Array<{
      type: 'created' | 'updated' | 'used';
      description: SavedJobDescription;
      timestamp: string;
    }> = [];

    descriptions.forEach(desc => {
      // Add created activity
      activities.push({
        type: 'created',
        description: desc,
        timestamp: desc.createdAt,
      });

      // Add updated activity if different from created
      if (desc.updatedAt !== desc.createdAt) {
        activities.push({
          type: 'updated',
          description: desc,
          timestamp: desc.updatedAt,
        });
      }

      // Simulate usage activities (in real implementation, track these separately)
      if (desc.usageCount && desc.usageCount > 0) {
        activities.push({
          type: 'used',
          description: desc,
          timestamp: desc.updatedAt,
        });
      }
    });

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);
  };

  const getTopTags = (tagFreq: Record<string, number>, limit: number = 10) => {
    return Object.entries(tagFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);
  };

  if (isLoading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content analytics-dashboard" onClick={(e) => e.stopPropagation()}>
          <div className="loading-message">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content analytics-dashboard large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📊 Job Description Analytics</h2>
          <div className="header-controls">
            <select
              className="form-select"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>
            <button className="modal-close" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="modal-body analytics-content">
          {/* Overview Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-value">{analytics.totalDescriptions}</div>
              <div className="stat-label">Total Descriptions</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-value">{analytics.totalUsage}</div>
              <div className="stat-label">Total Usage</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-value">{analytics.averageUsage.toFixed(1)}</div>
              <div className="stat-label">Average Usage</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-value">{Object.keys(analytics.categoryDistribution).length}</div>
              <div className="stat-label">Categories</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="charts-row">
            {/* Creation Trend */}
            <div className="chart-card">
              <h3>Creation Trend</h3>
              <div className="simple-chart">
                {analytics.creationTrend.map((point, index) => (
                  <div key={index} className="chart-bar-group">
                    <div 
                      className="chart-bar" 
                      style={{ 
                        height: `${Math.max(point.count * 20, 5)}px`,
                        background: '#4f46e5' 
                      }}
                      title={`${point.date}: ${point.count}`}
                    />
                    {index % Math.ceil(analytics.creationTrend.length / 5) === 0 && (
                      <div className="chart-label">{point.date}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Category Distribution */}
            <div className="chart-card">
              <h3>Category Distribution</h3>
              <div className="distribution-list">
                {Object.entries(analytics.categoryDistribution)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 8)
                  .map(([category, count]) => (
                    <div key={category} className="distribution-item">
                      <div className="distribution-label">{category}</div>
                      <div className="distribution-bar-container">
                        <div 
                          className="distribution-bar"
                          style={{ 
                            width: `${(count / analytics.totalDescriptions) * 100}%` 
                          }}
                        />
                      </div>
                      <div className="distribution-value">{count}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="top-performers-section">
            <h3>🏆 Top Performing Descriptions</h3>
            <div className="top-performers-grid">
              {analytics.topDescriptions.slice(0, 5).map((desc, index) => (
                <div key={desc.id} className="performer-card">
                  <div className="performer-rank">#{index + 1}</div>
                  <div className="performer-info">
                    <div className="performer-name">{desc.name}</div>
                    <div className="performer-category">{desc.category || 'Uncategorized'}</div>
                  </div>
                  <div className="performer-usage">
                    <span className="usage-count">{desc.usageCount || 0}</span>
                    <span className="usage-label">uses</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tag Cloud */}
          <div className="tag-cloud-section">
            <h3>🏷️ Popular Tags</h3>
            <div className="tag-cloud">
              {getTopTags(analytics.tagFrequency, 20).map(([tag, count]) => {
                const size = Math.min(Math.max(count / analytics.totalDescriptions * 100, 12), 32);
                return (
                  <span 
                    key={tag} 
                    className="cloud-tag"
                    style={{ 
                      fontSize: `${size}px`,
                      opacity: Math.min(count / 10, 1)
                    }}
                    title={`${tag}: ${count} uses`}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="activity-section">
            <h3>📅 Recent Activity</h3>
            <div className="activity-timeline">
              {analytics.recentActivity.slice(0, 10).map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === 'created' && '➕'}
                    {activity.type === 'updated' && '✏️'}
                    {activity.type === 'used' && '✓'}
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">{activity.description.name}</div>
                    <div className="activity-meta">
                      <span className="activity-type">
                        {activity.type === 'created' && 'Created'}
                        {activity.type === 'updated' && 'Updated'}
                        {activity.type === 'used' && 'Used'}
                      </span>
                      <span className="activity-time">
                        {new Date(activity.timestamp).toLocaleDateString(language)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="insights-section">
            <h3>💡 Insights</h3>
            <div className="insights-grid">
              {analytics.mostUsedDescription && (
                <div className="insight-card">
                  <div className="insight-icon">🌟</div>
                  <div className="insight-content">
                    <div className="insight-title">Most Popular</div>
                    <div className="insight-text">
                      "{analytics.mostUsedDescription.name}" has been used{' '}
                      {analytics.mostUsedDescription.usageCount} times
                    </div>
                  </div>
                </div>
              )}

              {analytics.totalDescriptions > 0 && (
                <div className="insight-card">
                  <div className="insight-icon">📊</div>
                  <div className="insight-content">
                    <div className="insight-title">Usage Rate</div>
                    <div className="insight-text">
                      {((analytics.totalUsage / analytics.totalDescriptions) * 100).toFixed(0)}%
                      of descriptions are actively used
                    </div>
                  </div>
                </div>
              )}

              {Object.keys(analytics.tagFrequency).length > 0 && (
                <div className="insight-card">
                  <div className="insight-icon">🏷️</div>
                  <div className="insight-content">
                    <div className="insight-title">Top Tag</div>
                    <div className="insight-text">
                      "{getTopTags(analytics.tagFrequency, 1)[0]?.[0]}" appears{' '}
                      {getTopTags(analytics.tagFrequency, 1)[0]?.[1]} times
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
