import React from 'react';
import { ATSOptimization } from '../types';

interface ATSOptimizationsProps {
  optimizations: ATSOptimization[];
  onChange: (optimizations: ATSOptimization[]) => void;
}

export const ATSOptimizations: React.FC<ATSOptimizationsProps> = ({ optimizations, onChange }) => {
  const toggleOptimization = (id: string) => {
    onChange(optimizations.map(opt => 
      opt.id === id ? { ...opt, applied: !opt.applied } : opt
    ));
  };

  const appliedOptimizations = optimizations.filter(o => o.applied);
  // const removedOptimizations = optimizations.filter(o => !o.applied);

  return (
    <div className="section">
      <h2 className="section-title">
        ✨ ATS Optimization Details
      </h2>
      
      {optimizations.length === 0 ? (
        <div className="alert alert-info">
          Click "Optimize CV" to generate ATS optimization suggestions based on your CV and the job description.
        </div>
      ) : (
        <>
          <div className="alert alert-success" style={{ marginBottom: '20px' }}>
            {appliedOptimizations.length} optimization{appliedOptimizations.length !== 1 ? 's' : ''} applied. 
            Hover over any pill and click the X to remove an optimization.
          </div>
          
          <div className="pill-container">
            {optimizations.map((opt) => (
              <button
                key={opt.id}
                className="pill"
                onClick={() => toggleOptimization(opt.id)}
                title={`${opt.category}: ${opt.change}\n\nOriginal: ${opt.originalText}\nOptimized: ${opt.optimizedText}\n\nClick to ${opt.applied ? 'remove' : 'apply'}`}
                aria-pressed={opt.applied}
                data-opt-id={opt.id}
              >
                <span>{opt.category}: {opt.change}</span>
                <span className="pill-remove">✕</span>
              </button>
            ))}
          </div>
          
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '15px' }}>
              Optimization Details
            </h3>
            
            {optimizations.map((opt) => (
              <div key={opt.id} className="optimization-card">
                <div className="optimization-header">
                  <span className="optimization-category">{opt.category}</span>
                  <button
                    className={`btn btn-${opt.applied ? 'danger' : 'success'} btn-icon`}
                    onClick={() => toggleOptimization(opt.id)}
                  >
                    {opt.applied ? '✕ Remove' : '✓ Apply'}
                  </button>
                </div>
                
                <div className="optimization-change">
                  {opt.change}
                </div>
                
                <div className="text-comparison">
                  <div>
                    <div className="text-label">Original</div>
                    <div className="text-box text-original">
                      {opt.originalText}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-label">Optimized</div>
                    <div className="text-box text-optimized">
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
