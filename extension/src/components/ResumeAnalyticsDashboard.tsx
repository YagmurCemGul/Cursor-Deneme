/**
 * Resume Analytics Dashboard
 * Comprehensive resume analysis and insights
 */

import React, { useState, useEffect } from 'react';
import type { ResumeProfile, JobPost } from '../lib/types';
import { analyzeResume, type ResumeAnalytics, type SectionAnalytics } from '../lib/analyticsEngine';

interface ResumeAnalyticsDashboardProps {
  profile: ResumeProfile;
  job?: JobPost;
}

export function ResumeAnalyticsDashboard({ profile, job }: ResumeAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<ResumeAnalytics | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Simulate async analysis
    setTimeout(() => {
      const result = analyzeResume(profile, job);
      setAnalytics(result);
      setLoading(false);
    }, 500);
  }, [profile, job]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
        <div style={{ fontSize: 18, color: '#64748b' }}>Analyzing your resume...</div>
      </div>
    );
  }

  if (!analytics) return null;

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreEmoji = (score: number): string => {
    if (score >= 80) return '🌟';
    if (score >= 60) return '✅';
    if (score >= 40) return '⚠️';
    return '❌';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Overall Score Card */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 16,
        padding: 32,
        color: 'white',
        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 48,
            fontWeight: 700
          }}>
            {analytics.overallScore}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
              Resume Score {getScoreEmoji(analytics.overallScore)}
            </div>
            <div style={{ fontSize: 16, opacity: 0.9, marginBottom: 16 }}>
              {analytics.overallScore >= 80 && 'Excellent! Your resume is highly optimized.'}
              {analytics.overallScore >= 60 && analytics.overallScore < 80 && 'Good! A few improvements will make it great.'}
              {analytics.overallScore >= 40 && analytics.overallScore < 60 && 'Fair. Significant improvements needed.'}
              {analytics.overallScore < 40 && 'Needs work. Follow suggestions below.'}
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <StatBadge label="Strengths" value={analytics.strengths.length} />
              <StatBadge label="Improvements" value={analytics.weaknesses.length} />
              <StatBadge label="Opportunities" value={analytics.opportunities.length} />
            </div>
          </div>
        </div>
      </div>

      {/* Section Scores */}
      <div>
        <h3 style={{ margin: '0 0 16px', fontSize: 20, color: '#1e293b' }}>📋 Section Analysis</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {analytics.sections.map((section) => (
            <SectionCard
              key={section.section}
              section={section}
              expanded={expandedSection === section.section}
              onToggle={() => setExpandedSection(expandedSection === section.section ? null : section.section)}
            />
          ))}
        </div>
      </div>

      {/* Insights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 16 }}>
        {/* Strengths */}
        {analytics.strengths.length > 0 && (
          <InsightCard
            title="💪 Strengths"
            insights={analytics.strengths}
            color="#10b981"
          />
        )}

        {/* Weaknesses */}
        {analytics.weaknesses.length > 0 && (
          <InsightCard
            title="⚠️ Areas to Improve"
            insights={analytics.weaknesses}
            color="#f59e0b"
          />
        )}

        {/* Opportunities */}
        {analytics.opportunities.length > 0 && (
          <InsightCard
            title="✨ Opportunities"
            insights={analytics.opportunities}
            color="#3b82f6"
          />
        )}
      </div>

      {/* Competitor Comparison */}
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: 24,
        border: '2px solid #e5e7eb'
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 18, color: '#1e293b' }}>
          🏆 Competitor Analysis
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 48, fontWeight: 700, color: '#667eea', marginBottom: 8 }}>
              {analytics.competitorComparison.percentile}th
            </div>
            <div style={{ fontSize: 14, color: '#64748b' }}>
              Better than {Math.round(analytics.competitorComparison.percentile * 10)} of 1000 candidates
            </div>
          </div>
          <div style={{ flex: 2 }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
                Stronger Areas:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {analytics.competitorComparison.strongerAreas.map((area) => (
                  <span key={area} style={{
                    padding: '4px 12px',
                    background: '#d1fae5',
                    color: '#065f46',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 500
                  }}>
                    ✓ {area}
                  </span>
                ))}
              </div>
            </div>
            {analytics.competitorComparison.weakerAreas.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
                  Weaker Areas:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {analytics.competitorComparison.weakerAreas.map((area) => (
                    <span key={area} style={{
                      padding: '4px 12px',
                      background: '#fee2e2',
                      color: '#991b1b',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 500
                    }}>
                      → {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Improvement Roadmap */}
      {analytics.improvementRoadmap.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          border: '2px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 18, color: '#1e293b' }}>
            🗺️ Improvement Roadmap
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {analytics.improvementRoadmap.map((item, index) => (
              <div key={index} style={{
                padding: 16,
                background: '#f8fafc',
                borderRadius: 8,
                borderLeft: `4px solid ${getScoreColor(100 - item.priority * 10)}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#667eea',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700
                  }}>
                    {item.priority}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.title}</div>
                  </div>
                  <ImpactBadge impact={item.impact} />
                  <EffortBadge effort={item.effort} />
                  <span style={{ fontSize: 12, color: '#64748b' }}>⏱️ {item.timeToComplete}</span>
                </div>
                <div style={{ fontSize: 13, color: '#64748b', marginLeft: 36 }}>
                  {item.currentState} → {item.targetState}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Predictions */}
      {analytics.predictions.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          borderRadius: 12,
          padding: 24,
          border: '2px solid #3b82f6'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 18, color: '#1e293b' }}>
            🔮 Career Predictions
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            {analytics.predictions.map((pred, index) => (
              <div key={index} style={{
                padding: 16,
                background: 'white',
                borderRadius: 8
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
                  {pred.metric}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>
                  {pred.prediction}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                  Confidence: {Math.round(pred.confidence * 100)}% • {pred.timeline}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  Based on: {pred.factors.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBadge({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      padding: '8px 16px',
      background: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 8,
      fontSize: 14
    }}>
      <div style={{ fontWeight: 700, fontSize: 20 }}>{value}</div>
      <div style={{ fontSize: 12, opacity: 0.9 }}>{label}</div>
    </div>
  );
}

function SectionCard({ section, expanded, onToggle }: {
  section: SectionAnalytics;
  expanded: boolean;
  onToggle: () => void;
}) {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: 12,
      padding: 20,
      border: '2px solid #e5e7eb',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }} onClick={onToggle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
        <div style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: `${getScoreColor(section.score)}20`,
          color: getScoreColor(section.score),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          fontWeight: 700
        }}>
          {section.score}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
            {section.section}
          </div>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            {section.issues.length > 0 ? `${section.issues.length} issues` : 'Looking good!'}
          </div>
        </div>
        <span style={{ color: '#94a3b8' }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>BREAKDOWN</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <MiniStat label="Complete" value={section.completeness} />
              <MiniStat label="Quality" value={section.quality} />
              <MiniStat label="ATS" value={section.atsOptimization} />
            </div>
          </div>

          {section.issues.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>ISSUES</div>
              {section.issues.map((issue, i) => (
                <div key={i} style={{ fontSize: 12, color: '#ef4444', marginBottom: 4 }}>
                  ⚠️ {issue}
                </div>
              ))}
            </div>
          )}

          {section.recommendations.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>RECOMMENDATIONS</div>
              {section.recommendations.map((rec, i) => (
                <div key={i} style={{ fontSize: 12, color: '#3b82f6', marginBottom: 4 }}>
                  💡 {rec}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      flex: 1,
      padding: '4px 8px',
      background: '#f8fafc',
      borderRadius: 4,
      textAlign: 'center'
    }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{value}</div>
      <div style={{ fontSize: 10, color: '#64748b' }}>{label}</div>
    </div>
  );
}

function InsightCard({ title, insights, color }: {
  title: string;
  insights: Array<{ title: string; description: string; impact: string; estimatedImprovement: number }>;
  color: string;
}) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 12,
      padding: 20,
      border: `2px solid ${color}20`
    }}>
      <h4 style={{ margin: '0 0 16px', fontSize: 16, color }}>{title}</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {insights.map((insight, i) => (
          <div key={i} style={{
            padding: 12,
            background: `${color}10`,
            borderRadius: 8
          }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b', marginBottom: 4 }}>
              {insight.title}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
              {insight.description}
            </div>
            {insight.estimatedImprovement > 0 && (
              <div style={{ fontSize: 11, color, fontWeight: 500 }}>
                +{insight.estimatedImprovement}% improvement potential
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ImpactBadge({ impact }: { impact: string }) {
  const colors = {
    high: { bg: '#dcfce7', text: '#166534' },
    medium: { bg: '#fef3c7', text: '#92400e' },
    low: { bg: '#e0e7ff', text: '#3730a3' }
  };
  const c = colors[impact as keyof typeof colors];
  return (
    <span style={{
      padding: '4px 8px',
      background: c.bg,
      color: c.text,
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 600
    }}>
      {impact.toUpperCase()} IMPACT
    </span>
  );
}

function EffortBadge({ effort }: { effort: string }) {
  const colors = {
    low: { bg: '#dcfce7', text: '#166534' },
    medium: { bg: '#fef3c7', text: '#92400e' },
    high: { bg: '#fee2e2', text: '#991b1b' }
  };
  const c = colors[effort as keyof typeof colors];
  return (
    <span style={{
      padding: '4px 8px',
      background: c.bg,
      color: c.text,
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 600
    }}>
      {effort.toUpperCase()} EFFORT
    </span>
  );
}
