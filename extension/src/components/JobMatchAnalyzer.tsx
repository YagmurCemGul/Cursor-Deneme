/**
 * Job Match Analyzer Component
 * Shows real-time analysis of how well a profile matches a job posting
 */

import { useState, useEffect, useMemo } from 'react';
import type { ResumeProfile } from '../lib/types';
import { analyzeJobMatch, tailorResumeToJob, TailoringResult } from '../lib/resumeTailoring';
import { Button } from './ui';

interface JobMatchAnalyzerProps {
  profile: ResumeProfile;
  jobText: string;
  jobTitle?: string;
  onApplySuggestion?: (suggestion: any) => void;
}

export function JobMatchAnalyzer({ profile, jobText, jobTitle, onApplySuggestion }: JobMatchAnalyzerProps) {
  const [result, setResult] = useState<TailoringResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');

  // Auto-analyze when inputs change
  useEffect(() => {
    if (!profile || !jobText || jobText.length < 50) {
      setResult(null);
      return;
    }

    setIsAnalyzing(true);
    // Debounce analysis
    const timer = setTimeout(() => {
      try {
        const tailoringResult = tailorResumeToJob(profile, jobText, jobTitle);
        setResult(tailoringResult);
      } catch (error) {
        console.error('Analysis error:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [profile, jobText, jobTitle]);

  // Calculate match quality
  const matchQuality = useMemo(() => {
    if (!result) return null;
    const score = result.analysis.overallMatchScore;
    if (score >= 80) return { label: 'Excellent Match', color: '#10b981', emoji: '🎯' };
    if (score >= 65) return { label: 'Good Match', color: '#3b82f6', emoji: '✅' };
    if (score >= 50) return { label: 'Fair Match', color: '#f59e0b', emoji: '⚠️' };
    return { label: 'Needs Work', color: '#ef4444', emoji: '❌' };
  }, [result]);

  if (!result || isAnalyzing) {
    return (
      <div style={{
        padding: 20,
        background: '#f8fafc',
        borderRadius: 12,
        border: '1px solid #e2e8f0',
        textAlign: 'center'
      }}>
        {isAnalyzing ? (
          <>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
            <div style={{ fontSize: 14, color: '#64748b' }}>Analyzing job match...</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
            <div style={{ fontSize: 14, color: '#64748b' }}>Paste a job description to see match analysis</div>
          </>
        )}
      </div>
    );
  }

  const { analysis, suggestions, keywordGaps, strengthAreas } = result;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Match Score Card */}
      <div style={{
        padding: 24,
        background: `linear-gradient(135deg, ${matchQuality!.color}15 0%, ${matchQuality!.color}05 100%)`,
        border: `2px solid ${matchQuality!.color}`,
        borderRadius: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 20
      }}>
        <div style={{
          fontSize: 48,
          fontWeight: 700,
          color: matchQuality!.color,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <span style={{ fontSize: 40 }}>{matchQuality!.emoji}</span>
          <span>{analysis.overallMatchScore}%</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
            {matchQuality!.label}
          </div>
          <div style={{ fontSize: 14, color: '#64748b' }}>
            Based on skills, experience, and keywords
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <StatCard
          icon="✅"
          label="Skills Match"
          value={`${analysis.skillMatches.filter(m => m.userHasIt).length}/${analysis.skillMatches.length}`}
          color="#10b981"
        />
        <StatCard
          icon="⚠️"
          label="Missing Skills"
          value={analysis.missingSkills.length.toString()}
          color="#f59e0b"
        />
        <StatCard
          icon="💡"
          label="Suggestions"
          value={suggestions.length.toString()}
          color="#3b82f6"
        />
      </div>

      {/* Expandable Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Skill Matches */}
        <ExpandableSection
          title="Skill Matches"
          icon="🎯"
          badge={`${analysis.skillMatches.filter(m => m.userHasIt).length}/${analysis.skillMatches.length}`}
          isExpanded={expandedSection === 'skills'}
          onToggle={() => setExpandedSection(expandedSection === 'skills' ? null : 'skills')}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Required Skills */}
            {analysis.skillMatches.filter(m => m.importance === 'required').length > 0 && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
                  Required Skills
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {analysis.skillMatches
                    .filter(m => m.importance === 'required')
                    .map(match => (
                      <SkillBadge key={match.skill} match={match} />
                    ))}
                </div>
              </div>
            )}

            {/* Preferred Skills */}
            {analysis.skillMatches.filter(m => m.importance === 'preferred').length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
                  Preferred Skills
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {analysis.skillMatches
                    .filter(m => m.importance === 'preferred')
                    .map(match => (
                      <SkillBadge key={match.skill} match={match} />
                    ))}
                </div>
              </div>
            )}
          </div>
        </ExpandableSection>

        {/* Missing Skills */}
        {analysis.missingSkills.length > 0 && (
          <ExpandableSection
            title="Missing Skills"
            icon="⚠️"
            badge={analysis.missingSkills.length.toString()}
            isExpanded={expandedSection === 'missing'}
            onToggle={() => setExpandedSection(expandedSection === 'missing' ? null : 'missing')}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {analysis.missingSkills.map(skill => (
                <span
                  key={skill}
                  style={{
                    padding: '6px 12px',
                    background: '#fef3c7',
                    border: '1px solid #fbbf24',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#92400e'
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
            <div style={{
              marginTop: 12,
              padding: 12,
              background: '#fef3c7',
              borderRadius: 8,
              fontSize: 12,
              color: '#92400e'
            }}>
              💡 Consider adding these skills if you have experience with them
            </div>
          </ExpandableSection>
        )}

        {/* Strength Areas */}
        {strengthAreas.length > 0 && (
          <ExpandableSection
            title="Your Strengths"
            icon="💪"
            badge={strengthAreas.length.toString()}
            isExpanded={expandedSection === 'strengths'}
            onToggle={() => setExpandedSection(expandedSection === 'strengths' ? null : 'strengths')}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {strengthAreas.map(skill => (
                <span
                  key={skill}
                  style={{
                    padding: '6px 12px',
                    background: '#dcfce7',
                    border: '1px solid #10b981',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#166534'
                  }}
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
            <div style={{
              marginTop: 12,
              padding: 12,
              background: '#dcfce7',
              borderRadius: 8,
              fontSize: 12,
              color: '#166534'
            }}>
              💡 Emphasize these skills in your resume and cover letter
            </div>
          </ExpandableSection>
        )}

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <ExpandableSection
            title="AI Suggestions"
            icon="✨"
            badge={suggestions.length.toString()}
            isExpanded={expandedSection === 'suggestions'}
            onToggle={() => setExpandedSection(expandedSection === 'suggestions' ? null : 'suggestions')}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  style={{
                    padding: 14,
                    background: suggestion.priority === 'critical' ? '#fef2f2' :
                               suggestion.priority === 'high' ? '#fef3c7' :
                               suggestion.priority === 'medium' ? '#e0f2fe' : '#f8fafc',
                    border: `1px solid ${
                      suggestion.priority === 'critical' ? '#fca5a5' :
                      suggestion.priority === 'high' ? '#fbbf24' :
                      suggestion.priority === 'medium' ? '#60a5fa' : '#cbd5e1'
                    }`,
                    borderRadius: 10
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{
                      fontSize: 18,
                      flexShrink: 0
                    }}>
                      {suggestion.priority === 'critical' ? '🚨' :
                       suggestion.priority === 'high' ? '⚡' :
                       suggestion.priority === 'medium' ? '💡' : '✨'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
                        {suggestion.title}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {suggestion.description}
                      </div>
                      {suggestion.after && (
                        <div style={{
                          marginTop: 8,
                          padding: 8,
                          background: 'white',
                          borderRadius: 6,
                          fontSize: 11,
                          color: '#475569',
                          fontFamily: 'monospace'
                        }}>
                          {suggestion.after}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ExpandableSection>
        )}

        {/* Job Context */}
        <ExpandableSection
          title="Job Context"
          icon="📋"
          badge="Details"
          isExpanded={expandedSection === 'context'}
          onToggle={() => setExpandedSection(expandedSection === 'context' ? null : 'context')}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <ContextItem label="Experience Level" value={analysis.context.experienceLevel} />
            <ContextItem label="Company Size" value={analysis.context.companySize} />
            <ContextItem label="Work Style" value={analysis.context.workStyle} />
            <ContextItem label="Department" value={analysis.context.department} />
          </div>
          {analysis.context.companyCulture.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
                Company Culture
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {analysis.context.companyCulture.map(trait => (
                  <span
                    key={trait}
                    style={{
                      padding: '4px 10px',
                      background: '#e0e7ff',
                      borderRadius: 6,
                      fontSize: 11,
                      color: '#4338ca'
                    }}
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}
        </ExpandableSection>
      </div>
    </div>
  );
}

// Helper Components

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div style={{
      padding: 16,
      background: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      textAlign: 'center'
    }}>
      <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#64748b' }}>{label}</div>
    </div>
  );
}

function SkillBadge({ match }: { match: any }) {
  const colors = match.userHasIt
    ? { bg: '#dcfce7', border: '#10b981', text: '#166534', icon: '✓' }
    : { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', icon: '✗' };

  return (
    <span
      style={{
        padding: '6px 12px',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 500,
        color: colors.text,
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }}
    >
      <span>{colors.icon}</span>
      <span>{match.skill}</span>
    </span>
  );
}

function ExpandableSection({
  title,
  icon,
  badge,
  isExpanded,
  onToggle,
  children
}: {
  title: string;
  icon: string;
  badge: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      overflow: 'hidden'
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: 16,
          background: isExpanded ? '#f8fafc' : 'white',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'background 0.2s'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>{icon}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{title}</span>
          <span style={{
            padding: '2px 8px',
            background: '#e0e7ff',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            color: '#4338ca'
          }}>
            {badge}
          </span>
        </div>
        <span style={{ fontSize: 18, color: '#94a3b8', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>
      {isExpanded && (
        <div style={{ padding: 16, borderTop: '1px solid #e2e8f0' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function ContextItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', textTransform: 'capitalize' }}>
        {value}
      </div>
    </div>
  );
}
