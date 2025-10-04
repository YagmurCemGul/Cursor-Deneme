/**
 * ATS Score Card Component
 * Displays the ATS compatibility score and breakdown
 */

import React from 'react';
import { calculateATSScore, getScoreColor, getScoreLabel, ATSScoreBreakdown } from '../utils/atsScoreCalculator';
import { CVData } from '../types';

interface ATSScoreCardProps {
  cvData: CVData;
  jobDescription?: string;
  language: 'en' | 'tr';
}

export const ATSScoreCard: React.FC<ATSScoreCardProps> = ({ cvData, jobDescription, language }) => {
  const scoreData: ATSScoreBreakdown = calculateATSScore(cvData, jobDescription);
  const overallColor = getScoreColor(scoreData.overall);
  const overallLabel = getScoreLabel(scoreData.overall);

  return (
    <div className="section">
      <h3>📊 {language === 'en' ? 'ATS Compatibility Score' : 'ATS Uyumluluk Skoru'}</h3>
      
      {/* Overall Score Circle */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        margin: '20px 0' 
      }}>
        <div style={{
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          border: `8px solid ${overallColor}`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }}>
          <div style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            color: overallColor 
          }}>
            {scoreData.overall}
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: '#666', 
            marginTop: '4px' 
          }}>
            {overallLabel}
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div style={{ marginTop: '20px' }}>
        <h4 style={{ marginBottom: '12px' }}>
          {language === 'en' ? 'Score Breakdown' : 'Skor Dağılımı'}
        </h4>
        
        {jobDescription && (
          <ScoreBar
            label={language === 'en' ? 'Keyword Match' : 'Anahtar Kelime Eşleşmesi'}
            score={scoreData.keywordMatch}
          />
        )}
        
        <ScoreBar
          label={language === 'en' ? 'Format & Structure' : 'Format ve Yapı'}
          score={scoreData.formatScore}
        />
        
        <ScoreBar
          label={language === 'en' ? 'Content Quality' : 'İçerik Kalitesi'}
          score={scoreData.contentQuality}
        />
        
        <ScoreBar
          label={language === 'en' ? 'Completeness' : 'Eksiksizlik'}
          score={scoreData.completeness}
        />
      </div>

      {/* Recommendations */}
      {scoreData.recommendations.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h4 style={{ marginBottom: '12px' }}>
            💡 {language === 'en' ? 'Recommendations' : 'Öneriler'}
          </h4>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: 0 
          }}>
            {scoreData.recommendations.map((rec, idx) => (
              <li key={idx} style={{
                padding: '10px 12px',
                marginBottom: '8px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderLeft: '3px solid #3b82f6',
                borderRadius: '4px',
                fontSize: '14px',
                lineHeight: '1.5',
              }}>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

interface ScoreBarProps {
  label: string;
  score: number;
}

const ScoreBar: React.FC<ScoreBarProps> = ({ label, score }) => {
  const color = getScoreColor(score);
  
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '6px',
        fontSize: '14px',
      }}>
        <span style={{ fontWeight: '500' }}>{label}</span>
        <span style={{ color, fontWeight: 'bold' }}>{score}%</span>
      </div>
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${score}%`,
          height: '100%',
          backgroundColor: color,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
};
