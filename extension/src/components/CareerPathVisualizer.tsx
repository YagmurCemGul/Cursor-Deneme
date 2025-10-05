/**
 * Career Path Visualizer
 * Explore career options and growth strategies
 */

import React, { useState, useEffect } from 'react';
import type { ResumeProfile } from '../lib/types';
import { analyzeCareer, generateSkillDevelopmentPlan, type CareerAnalysis, type CareerPath } from '../lib/careerPath';

interface CareerPathVisualizerProps {
  profile: ResumeProfile;
}

export function CareerPathVisualizer({ profile }: CareerPathVisualizerProps) {
  const [analysis, setAnalysis] = useState<CareerAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPath, setSelectedPath] = useState<CareerPath | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [skillPlan, setSkillPlan] = useState<any>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await analyzeCareer(profile);
      setAnalysis(result);
    } catch (error) {
      console.error('Career analysis error:', error);
      alert('Failed to analyze career');
    }
    setLoading(false);
  };

  const handleSkillPlan = async (skill: string) => {
    setLoading(true);
    setSelectedSkill(skill);
    try {
      const plan = await generateSkillDevelopmentPlan(
        skill,
        ['beginner', 'intermediate', 'advanced'],
        '3 months'
      );
      setSkillPlan(plan);
    } catch (error) {
      console.error('Skill plan error:', error);
    }
    setLoading(false);
  };

  if (loading && !analysis) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
        <div style={{ fontSize: 18, color: '#64748b' }}>Analyzing your career trajectory...</div>
        <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 8 }}>
          This may take a moment
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div style={{
        padding: 40,
        textAlign: 'center',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        borderRadius: 16,
        color: 'white'
      }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎯</div>
        <h2 style={{ margin: '0 0 16px', fontSize: 28 }}>Career Path Planning</h2>
        <p style={{ margin: '0 0 24px', fontSize: 16, opacity: 0.9, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
          Discover potential career directions, identify skill gaps, and get a personalized growth strategy based on your profile.
        </p>
        <button
          onClick={handleAnalyze}
          style={{
            padding: '14px 32px',
            background: 'white',
            color: '#8b5cf6',
            border: 'none',
            borderRadius: 10,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          🔮 Analyze My Career
        </button>
      </div>
    );
  }

  if (selectedPath) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setSelectedPath(null)}
            style={{
              padding: '8px 16px',
              background: '#f1f5f9',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500
            }}
          >
            ← Back to All Paths
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
              {selectedPath.title}
            </div>
            <div style={{ fontSize: 14, color: '#64748b' }}>
              {selectedPath.type.charAt(0).toUpperCase() + selectedPath.type.slice(1)} Path
            </div>
          </div>
        </div>

        {/* Overview */}
        <div style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          borderRadius: 12,
          padding: 24,
          border: '2px solid #3b82f6'
        }}>
          <div style={{ display: 'flex', gap: 24, marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 48, fontWeight: 700, color: '#3b82f6', marginBottom: 4 }}>
                {selectedPath.matchScore}%
              </div>
              <div style={{ fontSize: 14, color: '#64748b' }}>Match Score</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                {selectedPath.timeToAchieve}
              </div>
              <div style={{ fontSize: 14, color: '#64748b' }}>Timeline</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981', marginBottom: 4 }}>
                +{selectedPath.salaryIncrease}%
              </div>
              <div style={{ fontSize: 14, color: '#64748b' }}>Salary Increase</div>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: '#1e293b', lineHeight: 1.6 }}>
            {selectedPath.description}
          </p>
        </div>

        {/* Skills Required */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          border: '2px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 18, color: '#1e293b' }}>
            📚 Skills Required
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
            {selectedPath.requiredSkills.map((skill, i) => (
              <div key={i} style={{
                padding: 16,
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>
                    {skill.name}
                  </div>
                  <span style={{
                    padding: '2px 8px',
                    background: skill.importance === 'critical' ? '#fee2e2' : skill.importance === 'important' ? '#fef3c7' : '#e0f2fe',
                    color: skill.importance === 'critical' ? '#991b1b' : skill.importance === 'important' ? '#92400e' : '#075985',
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: 'uppercase'
                  }}>
                    {skill.importance}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                  {skill.currentLevel || 'Not learned'} → {skill.targetLevel}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                  ⏱️ {skill.timeToLearn}
                </div>
                <button
                  onClick={() => handleSkillPlan(skill.name)}
                  style={{
                    width: '100%',
                    padding: '6px 12px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  📖 Learning Plan
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          border: '2px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 18, color: '#1e293b' }}>
            🎯 Milestones
          </h3>
          <div style={{ position: 'relative', paddingLeft: 40 }}>
            {selectedPath.milestones.map((milestone, i) => (
              <div key={i} style={{ position: 'relative', marginBottom: 24 }}>
                <div style={{
                  position: 'absolute',
                  left: -40,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#667eea',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 700,
                  zIndex: 2
                }}>
                  {i + 1}
                </div>
                {i < selectedPath.milestones.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    left: -24,
                    top: 32,
                    width: 2,
                    height: 'calc(100% + 24px)',
                    background: '#e5e7eb'
                  }} />
                )}
                <div style={{
                  padding: 16,
                  background: '#f8fafc',
                  borderRadius: 8
                }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#1e293b', marginBottom: 8 }}>
                    {milestone.title}
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
                    {milestone.description}
                  </div>
                  <div style={{ fontSize: 12, color: '#667eea', fontWeight: 500 }}>
                    📅 {milestone.timeframe}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Strategy */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          border: '2px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 18, color: '#1e293b' }}>
            📈 Growth Strategy
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Object.entries({
              'Short Term (0-6 months)': analysis.growthStrategy.shortTerm,
              'Medium Term (6-18 months)': analysis.growthStrategy.mediumTerm,
              'Long Term (18+ months)': analysis.growthStrategy.longTerm
            }).map(([period, actions]) => (
              <div key={period} style={{
                padding: 16,
                background: '#f8fafc',
                borderRadius: 8
              }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b', marginBottom: 8 }}>
                  {period}
                </div>
                <ul style={{ margin: 0, paddingLeft: 20, color: '#64748b', fontSize: 13 }}>
                  {actions.map((action: any, i: number) => (
                    <li key={i} style={{ marginBottom: 4 }}>{action.title}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Plan Modal */}
        {skillPlan && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
          }} onClick={() => setSkillPlan(null)}>
            <div style={{
              background: 'white',
              borderRadius: 12,
              padding: 32,
              maxWidth: 600,
              maxHeight: '80vh',
              overflowY: 'auto'
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 20, color: '#1e293b' }}>
                  📖 {selectedSkill} Learning Plan
                </h3>
                <button
                  onClick={() => setSkillPlan(null)}
                  style={{
                    padding: '4px 12px',
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 16
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {skillPlan.levels.map((level: any, i: number) => (
                  <div key={i} style={{
                    padding: 16,
                    background: '#f8fafc',
                    borderRadius: 8
                  }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b', marginBottom: 8 }}>
                      Level {i + 1}: {level.name}
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
                      ⏱️ {level.duration}
                    </div>
                    <div style={{ fontSize: 12, color: '#1e293b' }}>
                      <strong>Topics:</strong>
                      <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
                        {level.topics.map((topic: string, j: number) => (
                          <li key={j}>{topic}</li>
                        ))}
                      </ul>
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Current Analysis */}
      <div style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        borderRadius: 12,
        padding: 24,
        color: 'white'
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 20 }}>📊 Career Analysis</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>EXPERIENCE LEVEL</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{analysis.currentLevel}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>YEARS OF EXPERIENCE</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{analysis.yearsOfExperience}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>KEY STRENGTHS</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{analysis.keyStrengths.length}</div>
          </div>
        </div>
      </div>

      {/* Career Paths */}
      <div>
        <h3 style={{ margin: '0 0 16px', fontSize: 20, color: '#1e293b' }}>🛤️ Career Paths</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {analysis.paths.map((path, i) => (
            <PathCard key={i} path={path} onClick={() => setSelectedPath(path)} />
          ))}
        </div>
      </div>

      {/* Skill Gaps */}
      {analysis.skillGaps.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          border: '2px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 18, color: '#1e293b' }}>
            🎯 Key Skill Gaps to Address
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
            {analysis.skillGaps.map((gap, i) => (
              <div key={i} style={{
                padding: 16,
                background: '#fef3c7',
                borderRadius: 8,
                border: '1px solid #fde047'
              }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b', marginBottom: 4 }}>
                  {gap.skill}
                </div>
                <div style={{ fontSize: 12, color: '#92400e', marginBottom: 8 }}>
                  {gap.reason}
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  Priority: {gap.priority.toUpperCase()} • {gap.timeToLearn}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PathCard({ path, onClick }: { path: CareerPath; onClick: () => void }) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'linear': return '#3b82f6';
      case 'lateral': return '#10b981';
      case 'leadership': return '#8b5cf6';
      case 'entrepreneurial': return '#f59e0b';
      default: return '#64748b';
    }
  };

  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: 12,
        padding: 20,
        border: '2px solid #e5e7eb',
        cursor: 'pointer',
        transition: 'all 0.2s',
        ':hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: `${getTypeColor(path.type)}20`,
          color: getTypeColor(path.type),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          fontWeight: 700
        }}>
          {path.matchScore}%
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: '#1e293b' }}>
            {path.title}
          </div>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            {path.type.charAt(0).toUpperCase() + path.type.slice(1)}
          </div>
        </div>
      </div>
      <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
        {path.description.slice(0, 100)}...
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
        <span>📅 {path.timeToAchieve}</span>
        <span>💰 +{path.salaryIncrease}%</span>
      </div>
    </div>
  );
}
