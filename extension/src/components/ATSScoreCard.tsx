import React from 'react';
import { ATSScore } from '../lib/atsScoring';
import { Button } from './ui';

interface ATSScoreCardProps {
  score: ATSScore;
  onRefresh?: () => void;
}

export function ATSScoreCard({ score, onRefresh }: ATSScoreCardProps) {
  const getScoreColor = (value: number): string => {
    if (value >= 80) return '#10b981'; // Green
    if (value >= 60) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const getScoreLabel = (value: number): string => {
    if (value >= 80) return 'Excellent';
    if (value >= 60) return 'Good';
    if (value >= 40) return 'Fair';
    return 'Needs Work';
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: 12,
      padding: 24,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h3 style={{ margin: 0, fontSize: 18, color: '#1e293b' }}>
          📊 ATS Compatibility Score
        </h3>
        {onRefresh && (
          <Button variant="ghost" onClick={onRefresh} style={{ fontSize: 12 }}>
            🔄 Refresh
          </Button>
        )}
      </div>

      {/* Overall Score */}
      <div style={{
        textAlign: 'center',
        padding: 32,
        background: `linear-gradient(135deg, ${getScoreColor(score.overallScore)}15 0%, ${getScoreColor(score.overallScore)}05 100%)`,
        borderRadius: 12,
        marginBottom: 24,
        border: `2px solid ${getScoreColor(score.overallScore)}40`,
      }}>
        <div style={{
          fontSize: 64,
          fontWeight: 700,
          color: getScoreColor(score.overallScore),
          lineHeight: 1,
        }}>
          {score.overallScore}
        </div>
        <div style={{
          fontSize: 16,
          color: getScoreColor(score.overallScore),
          fontWeight: 600,
          marginTop: 8,
        }}>
          {getScoreLabel(score.overallScore)}
        </div>
        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
          out of 100
        </div>
      </div>

      {/* Score Breakdown */}
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontSize: 14, color: '#1e293b', marginBottom: 16 }}>Score Breakdown</h4>
        
        {/* Keyword Match */}
        <ScoreBar
          label="Keyword Match"
          value={score.keywordScore}
          color={getScoreColor(score.keywordScore)}
          icon="🔑"
        />
        
        {/* Format Quality */}
        <ScoreBar
          label="Format Quality"
          value={score.formatScore}
          color={getScoreColor(score.formatScore)}
          icon="📄"
        />
        
        {/* Profile Completeness */}
        <ScoreBar
          label="Completeness"
          value={score.completenessScore}
          color={getScoreColor(score.completenessScore)}
          icon="✓"
        />
      </div>

      {/* Category Breakdown */}
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontSize: 14, color: '#1e293b', marginBottom: 16 }}>Section Scores</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <CategoryScore label="Skills" value={score.categoryBreakdown.skills} />
          <CategoryScore label="Experience" value={score.categoryBreakdown.experience} />
          <CategoryScore label="Education" value={score.categoryBreakdown.education} />
          <CategoryScore label="Formatting" value={score.categoryBreakdown.formatting} />
        </div>
      </div>

      {/* Keywords */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h4 style={{ fontSize: 14, color: '#1e293b', margin: 0 }}>Keyword Analysis</h4>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            {score.matchedKeywords.length} matched, {score.missingKeywords.length} missing
          </span>
        </div>

        {/* Matched Keywords */}
        {score.matchedKeywords.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#10b981', marginBottom: 6, fontWeight: 600 }}>
              ✓ Matched Keywords
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {score.matchedKeywords.slice(0, 10).map((keyword, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '4px 10px',
                    background: '#10b98115',
                    border: '1px solid #10b98140',
                    borderRadius: 6,
                    fontSize: 11,
                    color: '#10b981',
                  }}
                >
                  {keyword}
                </span>
              ))}
              {score.matchedKeywords.length > 10 && (
                <span style={{ fontSize: 11, color: '#64748b', alignSelf: 'center' }}>
                  +{score.matchedKeywords.length - 10} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Missing Keywords */}
        {score.missingKeywords.length > 0 && (
          <div>
            <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 6, fontWeight: 600 }}>
              ⚠️ Missing Keywords
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {score.missingKeywords.slice(0, 10).map((keyword, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '4px 10px',
                    background: '#ef444415',
                    border: '1px solid #ef444440',
                    borderRadius: 6,
                    fontSize: 11,
                    color: '#ef4444',
                  }}
                >
                  {keyword}
                </span>
              ))}
              {score.missingKeywords.length > 10 && (
                <span style={{ fontSize: 11, color: '#64748b', alignSelf: 'center' }}>
                  +{score.missingKeywords.length - 10} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {score.suggestions.length > 0 && (
        <div>
          <h4 style={{ fontSize: 14, color: '#1e293b', marginBottom: 12 }}>
            💡 Improvement Suggestions
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {score.suggestions.slice(0, 5).map((suggestion, idx) => (
              <div
                key={idx}
                style={{
                  padding: 12,
                  background: getSuggestionColor(suggestion.type),
                  borderRadius: 8,
                  border: `1px solid ${getSuggestionBorderColor(suggestion.type)}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: 11, 
                      fontWeight: 600, 
                      textTransform: 'uppercase',
                      color: getSuggestionTextColor(suggestion.type),
                      marginBottom: 4,
                    }}>
                      {getSuggestionIcon(suggestion.type)} {suggestion.type}
                    </div>
                    <div style={{ fontSize: 13, color: '#1e293b' }}>
                      {suggestion.message}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#10b981',
                    background: '#10b98115',
                    padding: '4px 8px',
                    borderRadius: 4,
                  }}>
                    +{suggestion.impact}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: '#64748b' }}>
          {icon} {label}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color }}>
          {value}%
        </span>
      </div>
      <div style={{
        width: '100%',
        height: 8,
        background: '#f1f5f9',
        borderRadius: 4,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${value}%`,
          height: '100%',
          background: color,
          transition: 'width 0.3s ease',
          borderRadius: 4,
        }} />
      </div>
    </div>
  );
}

function CategoryScore({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? '#10b981' : value >= 50 ? '#f59e0b' : '#ef4444';
  
  return (
    <div style={{
      padding: 12,
      background: '#f8fafc',
      borderRadius: 8,
      border: '1px solid #e5e7eb',
    }}>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 600, color }}>
        {value}%
      </div>
    </div>
  );
}

function getSuggestionColor(type: 'critical' | 'important' | 'optional'): string {
  switch (type) {
    case 'critical': return '#fef2f2';
    case 'important': return '#fffbeb';
    case 'optional': return '#f0f9ff';
  }
}

function getSuggestionBorderColor(type: 'critical' | 'important' | 'optional'): string {
  switch (type) {
    case 'critical': return '#fca5a5';
    case 'important': return '#fde047';
    case 'optional': return '#bfdbfe';
  }
}

function getSuggestionTextColor(type: 'critical' | 'important' | 'optional'): string {
  switch (type) {
    case 'critical': return '#dc2626';
    case 'important': return '#d97706';
    case 'optional': return '#2563eb';
  }
}

function getSuggestionIcon(type: 'critical' | 'important' | 'optional'): string {
  switch (type) {
    case 'critical': return '🔴';
    case 'important': return '🟡';
    case 'optional': return '🔵';
  }
}
