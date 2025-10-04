import React, { useState, useEffect } from 'react';
import { CVData } from '../types';
import {
  analyzeTalentGap,
  TalentGapAnalysis as TalentGapResult,
  SkillGap,
  getSkillMatchPercentage,
  groupSkillsByCategory,
} from '../utils/talentGapAnalyzer';
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiTrendingUp, FiTarget } from 'react-icons/fi';

interface TalentGapAnalysisProps {
  cvData: CVData;
  jobDescription: string;
}

const TalentGapAnalysis: React.FC<TalentGapAnalysisProps> = ({
  cvData,
  jobDescription,
}) => {
  const [analysis, setAnalysis] = useState<TalentGapResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'matched' | 'missing' | 'additional'>('matched');

  useEffect(() => {
    if (cvData && jobDescription) {
      performAnalysis();
    }
  }, [cvData, jobDescription]);

  const performAnalysis = () => {
    setLoading(true);
    try {
      const result = analyzeTalentGap(cvData, jobDescription);
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing talent gap:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return '#10b981'; // Green
    if (percentage >= 60) return '#f59e0b'; // Yellow
    if (percentage >= 40) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const renderSkillCard = (skill: SkillGap) => {
    const matchPercentage = getSkillMatchPercentage(skill);
    
    return (
      <div key={skill.skill} className="skill-card">
        <div className="skill-header">
          <div className="skill-info">
            {skill.hasSkill ? (
              <FiCheckCircle className="skill-icon success" />
            ) : (
              <FiXCircle className="skill-icon missing" />
            )}
            <span className="skill-name">{skill.skill}</span>
            {skill.required && <span className="required-badge">Required</span>}
          </div>
          <span className="match-percentage" style={{ color: getMatchColor(matchPercentage) }}>
            {matchPercentage}%
          </span>
        </div>
        
        {skill.matchType === 'partial' && (
          <div className="skill-note">
            <FiAlertCircle className="note-icon" />
            <span>Partial match - consider highlighting related experience</span>
          </div>
        )}
        
        {skill.suggestions && skill.suggestions.length > 0 && (
          <div className="skill-suggestions">
            <strong>Suggestions:</strong>
            <ul>
              {skill.suggestions.map((suggestion, idx) => (
                <li key={idx}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderCategorySection = (title: string, skills: SkillGap[]) => {
    if (skills.length === 0) return null;
    
    const categoryGroups = groupSkillsByCategory(skills);
    
    return (
      <div className="category-section">
        <h3>{title}</h3>
        {Array.from(categoryGroups.entries()).map(([category, categorySkills]) => (
          <div key={category} className="skill-category">
            <h4>{category}</h4>
            <div className="skills-grid">
              {categorySkills.map(skill => renderSkillCard(skill))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="talent-gap-loading">
        <div className="spinner"></div>
        <p>Analyzing talent gaps...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="talent-gap-empty">
        <FiTarget className="empty-icon" />
        <p>Add a job description to analyze talent gaps</p>
      </div>
    );
  }

  return (
    <div className="talent-gap-analysis">
      <div className="analysis-header">
        <div className="header-content">
          <FiTarget className="header-icon" />
          <div>
            <h2>Talent Gap Analysis</h2>
            <p>Compare your skills with job requirements</p>
          </div>
        </div>
      </div>

      {/* Overall Match Score */}
      <div className="match-score-card">
        <div className="score-visual">
          <div className="score-circle">
            <svg viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={getMatchColor(analysis.overallMatch)}
                strokeWidth="8"
                strokeDasharray={`${analysis.overallMatch * 2.51} 251`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="score-text">
              <span className="score-number">{analysis.overallMatch}%</span>
              <span className="score-label">Match</span>
            </div>
          </div>
        </div>

        <div className="score-details">
          <div className="detail-item">
            <FiCheckCircle className="detail-icon success" />
            <div>
              <span className="detail-number">{analysis.matchedSkills.length}</span>
              <span className="detail-label">Matched Skills</span>
            </div>
          </div>
          <div className="detail-item">
            <FiXCircle className="detail-icon missing" />
            <div>
              <span className="detail-number">{analysis.missingSkills.length}</span>
              <span className="detail-label">Missing Skills</span>
            </div>
          </div>
          <div className="detail-item">
            <FiTrendingUp className="detail-icon additional" />
            <div>
              <span className="detail-number">{analysis.additionalSkills.length}</span>
              <span className="detail-label">Additional Skills</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="recommendations-card">
          <h3>
            <FiAlertCircle className="section-icon" />
            Recommendations
          </h3>
          <ul className="recommendations-list">
            {analysis.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Strength Areas */}
      {analysis.strengthAreas.length > 0 && (
        <div className="strength-areas-card">
          <h3>
            <FiCheckCircle className="section-icon" />
            Strength Areas
          </h3>
          <div className="strength-items">
            {analysis.strengthAreas.map((area, idx) => (
              <div key={idx} className="strength-item">
                <FiCheckCircle className="strength-icon" />
                <span>{area}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvement Areas */}
      {analysis.improvementAreas.length > 0 && (
        <div className="improvement-areas-card">
          <h3>
            <FiTrendingUp className="section-icon" />
            Areas for Improvement
          </h3>
          <div className="improvement-items">
            {analysis.improvementAreas.map((area, idx) => (
              <div key={idx} className="improvement-item">
                <FiAlertCircle className="improvement-icon" />
                <span>{area}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills Breakdown */}
      <div className="skills-tabs">
        <button
          className={`tab ${selectedCategory === 'matched' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('matched')}
        >
          <FiCheckCircle />
          Matched Skills ({analysis.matchedSkills.length})
        </button>
        <button
          className={`tab ${selectedCategory === 'missing' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('missing')}
        >
          <FiXCircle />
          Missing Skills ({analysis.missingSkills.length})
        </button>
        <button
          className={`tab ${selectedCategory === 'additional' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('additional')}
        >
          <FiTrendingUp />
          Additional Skills ({analysis.additionalSkills.length})
        </button>
      </div>

      <div className="skills-content">
        {selectedCategory === 'matched' && renderCategorySection('Matched Skills', analysis.matchedSkills)}
        {selectedCategory === 'missing' && renderCategorySection('Missing Skills', analysis.missingSkills)}
        {selectedCategory === 'additional' && (
          <div className="additional-skills">
            <h3>Additional Skills</h3>
            <p className="additional-note">
              Skills you have that aren't explicitly mentioned in the job description.
              These can still be valuable to highlight!
            </p>
            <div className="skills-tags">
              {analysis.additionalSkills.map(skill => (
                <span key={skill} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .talent-gap-analysis {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .analysis-header {
          margin-bottom: 24px;
        }

        .header-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .header-icon {
          width: 32px;
          height: 32px;
          color: #3b82f6;
          flex-shrink: 0;
        }

        .analysis-header h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
        }

        .analysis-header p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .match-score-card {
          display: flex;
          gap: 32px;
          padding: 32px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          margin-bottom: 24px;
        }

        .score-visual {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .score-circle {
          position: relative;
          width: 160px;
          height: 160px;
        }

        .score-circle svg {
          width: 100%;
          height: 100%;
        }

        .score-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .score-number {
          display: block;
          font-size: 36px;
          font-weight: 700;
          color: #1f2937;
        }

        .score-label {
          display: block;
          font-size: 14px;
          color: #6b7280;
        }

        .score-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 24px;
          justify-content: center;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .detail-icon {
          width: 32px;
          height: 32px;
        }

        .detail-icon.success {
          color: #10b981;
        }

        .detail-icon.missing {
          color: #ef4444;
        }

        .detail-icon.additional {
          color: #3b82f6;
        }

        .detail-number {
          display: block;
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
        }

        .detail-label {
          display: block;
          font-size: 14px;
          color: #6b7280;
        }

        .recommendations-card,
        .strength-areas-card,
        .improvement-areas-card {
          padding: 24px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .recommendations-card h3,
        .strength-areas-card h3,
        .improvement-areas-card h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .section-icon {
          width: 20px;
          height: 20px;
        }

        .recommendations-list {
          margin: 0;
          padding-left: 20px;
        }

        .recommendations-list li {
          margin-bottom: 12px;
          line-height: 1.6;
          color: #374151;
        }

        .strength-items,
        .improvement-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .strength-item,
        .improvement-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 6px;
        }

        .strength-icon {
          color: #10b981;
          flex-shrink: 0;
        }

        .improvement-icon {
          color: #f59e0b;
          flex-shrink: 0;
        }

        .skills-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          border-bottom: 2px solid #e5e7eb;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          transition: all 0.2s;
          margin-bottom: -2px;
        }

        .tab:hover {
          color: #374151;
        }

        .tab.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        }

        .skills-content {
          min-height: 200px;
        }

        .category-section {
          margin-bottom: 24px;
        }

        .category-section > h3 {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 16px 0;
        }

        .skill-category {
          margin-bottom: 24px;
        }

        .skill-category h4 {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin: 0 0 12px 0;
        }

        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 12px;
        }

        .skill-card {
          padding: 16px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .skill-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .skill-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .skill-icon {
          width: 18px;
          height: 18px;
        }

        .skill-icon.success {
          color: #10b981;
        }

        .skill-icon.missing {
          color: #ef4444;
        }

        .skill-name {
          font-weight: 500;
          color: #1f2937;
        }

        .required-badge {
          padding: 2px 8px;
          background: #fef3c7;
          color: #92400e;
          font-size: 11px;
          font-weight: 600;
          border-radius: 4px;
        }

        .match-percentage {
          font-weight: 600;
          font-size: 14px;
        }

        .skill-note {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          padding: 8px;
          background: #fef3c7;
          border-radius: 4px;
          font-size: 13px;
          color: #92400e;
        }

        .note-icon {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
        }

        .skill-suggestions {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
          font-size: 13px;
        }

        .skill-suggestions strong {
          color: #374151;
          display: block;
          margin-bottom: 6px;
        }

        .skill-suggestions ul {
          margin: 0;
          padding-left: 20px;
          color: #6b7280;
        }

        .skill-suggestions li {
          margin-bottom: 4px;
        }

        .additional-skills {
          padding: 24px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .additional-skills h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 12px 0;
        }

        .additional-note {
          color: #6b7280;
          font-size: 14px;
          margin: 0 0 16px 0;
        }

        .skills-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .skill-tag {
          padding: 6px 12px;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
        }

        .talent-gap-loading,
        .talent-gap-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
          color: #6b7280;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        .empty-icon {
          width: 64px;
          height: 64px;
          color: #d1d5db;
          margin-bottom: 16px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default TalentGapAnalysis;
