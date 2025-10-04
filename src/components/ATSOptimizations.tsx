import React from 'react';
import { ATSOptimization } from '../types';
import { t, Lang } from '../i18n';

interface ATSOptimizationsProps {
  optimizations: ATSOptimization[];
  onChange: (optimizations: ATSOptimization[]) => void;
  language: Lang;
  onOptimizationFocus: (id: string | null) => void;
  focusedOptimizationId: string | null;
}

export const ATSOptimizations: React.FC<ATSOptimizationsProps> = ({ optimizations, onChange, language, onOptimizationFocus, focusedOptimizationId }) => {
  const toggleOptimization = (id: string) => {
    onChange(optimizations.map(opt => 
      opt.id === id ? { ...opt, applied: !opt.applied } : opt
    ));
  };

  const appliedOptimizations = optimizations.filter(o => o.applied);
  // const _removedOptimizations = optimizations.filter(o => !o.applied);

  return (
    <div className="section">
      <h2 className="section-title">
        ✨ {t(language, 'opt.section')}
      </h2>
      
      {optimizations.length === 0 ? (
        <div className="alert alert-info">
          {t(language, 'opt.clickOptimize')}
        </div>
      ) : (
        <>
          <div className="alert alert-success optimization-summary">
            {appliedOptimizations.length} {appliedOptimizations.length !== 1 ? t(language, 'opt.optimizations') : t(language, 'opt.optimization')} {t(language, 'opt.applied')}. 
            {t(language, 'opt.hoverTip')}
          </div>
          
          <div className="pill-container">
            {optimizations.map((opt) => (
              <button
                key={opt.id}
                className="pill"
                onClick={() => toggleOptimization(opt.id)}
                title={`${opt.category}: ${opt.change}\n\n${t(language, 'opt.original')}: ${opt.originalText}\n${t(language, 'opt.optimized')}: ${opt.optimizedText}\n\n${opt.applied ? t(language, 'opt.clickToRemove') : t(language, 'opt.clickToApply')}`}
                aria-pressed={opt.applied}
                data-opt-id={opt.id}
              >
                <span>{opt.category}: {opt.change}</span>
                <span className="pill-remove">✕</span>
              </button>
            ))}
          </div>
          
          <div className="optimization-details-section">
            <h3 className="subsection-title">
              {t(language, 'opt.detailsTitle')}
            </h3>
            
            {optimizations.map((opt) => (
              <div key={opt.id} className="optimization-card">
                <div className="optimization-header">
                  <span className="optimization-category">{opt.category}</span>
                  <button
                    className={`btn btn-${opt.applied ? 'danger' : 'success'} btn-icon`}
                    onClick={() => toggleOptimization(opt.id)}
                  >
                    {opt.applied ? `✕ ${t(language, 'common.remove')}` : `✓ ${t(language, 'common.add')}`}
                  </button>
                </div>
                
                <div className="optimization-change">
                  {opt.change}
                </div>
                
                <div className="text-comparison">
                  <div>
                    <div className="text-label">{t(language, 'opt.original')}</div>
                    <div className="text-box text-original">
                      {opt.originalText}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-label">{t(language, 'opt.optimized')}</div>
                    <div 
                      className={`text-box text-optimized ${focusedOptimizationId === opt.id ? 'text-optimized-focused' : ''}`}
                      onClick={() => onOptimizationFocus(focusedOptimizationId === opt.id ? null : opt.id)}
                      style={{ cursor: 'pointer' }}
                      title={opt.applied ? t(language, 'opt.clickToHighlight') : t(language, 'opt.applyFirstToHighlight')}
                    >
                      {opt.optimizedText}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
