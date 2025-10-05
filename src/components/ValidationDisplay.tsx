import React, { useState } from 'react';
import { t, Lang } from '../i18n';
import { ValidationResult } from '../utils/inputValidation';

interface ValidationDisplayProps {
  validation: ValidationResult;
  language: Lang;
  onDismiss?: () => void;
  showWarnings?: boolean;
  compact?: boolean;
}

export const ValidationDisplay: React.FC<ValidationDisplayProps> = ({
  validation,
  language,
  onDismiss,
  showWarnings = true,
  compact = false,
}) => {
  const [expandedErrors, setExpandedErrors] = useState(true);
  const [expandedWarnings, setExpandedWarnings] = useState(false);

  if (validation.errors.length === 0 && validation.warnings.length === 0) {
    return null;
  }

  // If valid and we're not showing warnings, don't render
  if (validation.isValid && !showWarnings) {
    return null;
  }

  if (compact) {
    return (
      <div className="validation-compact">
        {validation.errors.length > 0 && (
          <span className="validation-badge validation-error-badge">
            ❌ {validation.errors.length} {t(language, 'validation.error', { count: validation.errors.length })}
          </span>
        )}
        {validation.warnings.length > 0 && showWarnings && (
          <span className="validation-badge validation-warning-badge">
            ⚠️ {validation.warnings.length} {t(language, 'validation.warning', { count: validation.warnings.length })}
          </span>
        )}
        <style>{compactStyles}</style>
      </div>
    );
  }

  return (
    <div className="validation-display">
      {/* Errors Section */}
      {validation.errors.length > 0 && (
        <div className="validation-section validation-errors">
          <div className="validation-header" onClick={() => setExpandedErrors(!expandedErrors)}>
            <div className="validation-title">
              <span className="validation-icon">❌</span>
              <h4>
                {t(language, 'validation.errorsTitle')} ({validation.errors.length})
              </h4>
            </div>
            <button className="validation-toggle" aria-label="Toggle errors">
              {expandedErrors ? '▼' : '▶'}
            </button>
          </div>
          {expandedErrors && (
            <ul className="validation-list">
              {validation.errors.map((error, index) => (
                <li key={index} className="validation-item validation-error-item">
                  <span className="validation-bullet">•</span>
                  <span className="validation-text">{error}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Warnings Section */}
      {validation.warnings.length > 0 && showWarnings && (
        <div className="validation-section validation-warnings">
          <div className="validation-header" onClick={() => setExpandedWarnings(!expandedWarnings)}>
            <div className="validation-title">
              <span className="validation-icon">💡</span>
              <h4>
                {t(language, 'validation.warningsTitle')} ({validation.warnings.length})
              </h4>
            </div>
            <button className="validation-toggle" aria-label="Toggle warnings">
              {expandedWarnings ? '▼' : '▶'}
            </button>
          </div>
          {expandedWarnings && (
            <ul className="validation-list">
              {validation.warnings.map((warning, index) => (
                <li key={index} className="validation-item validation-warning-item">
                  <span className="validation-bullet">•</span>
                  <span className="validation-text">{warning}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Summary */}
      {validation.isValid && validation.warnings.length > 0 && (
        <div className="validation-summary">
          <p>
            ✓ {t(language, 'validation.readyToProcess')}{' '}
            <span className="validation-summary-note">
              ({t(language, 'validation.recommendationsOptional')})
            </span>
          </p>
        </div>
      )}

      {onDismiss && (
        <button className="validation-dismiss" onClick={onDismiss} aria-label="Dismiss">
          ✕
        </button>
      )}

      <style>{styles}</style>
    </div>
  );
};

const styles = `
  .validation-display {
    border-radius: 8px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    padding: 16px;
    margin: 16px 0;
    position: relative;
    animation: slideIn 0.3s ease-out;
  }

  .validation-section {
    margin-bottom: 12px;
  }

  .validation-section:last-of-type {
    margin-bottom: 0;
  }

  .validation-errors {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 6px;
    padding: 12px;
  }

  .validation-warnings {
    background: #fffbeb;
    border: 1px solid #fed7aa;
    border-radius: 6px;
    padding: 12px;
  }

  .validation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }

  .validation-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .validation-icon {
    font-size: 20px;
    flex-shrink: 0;
  }

  .validation-title h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
  }

  .validation-errors .validation-title h4 {
    color: #dc2626;
  }

  .validation-warnings .validation-title h4 {
    color: #d97706;
  }

  .validation-toggle {
    background: transparent;
    border: none;
    color: #6b7280;
    font-size: 12px;
    cursor: pointer;
    padding: 4px;
    transition: all 0.2s;
  }

  .validation-toggle:hover {
    color: #374151;
  }

  .validation-list {
    list-style: none;
    padding: 0;
    margin: 12px 0 0 0;
  }

  .validation-item {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    padding: 6px 0;
    font-size: 13px;
    line-height: 1.5;
  }

  .validation-bullet {
    flex-shrink: 0;
    font-weight: 600;
  }

  .validation-error-item {
    color: #991b1b;
  }

  .validation-error-item .validation-bullet {
    color: #dc2626;
  }

  .validation-warning-item {
    color: #92400e;
  }

  .validation-warning-item .validation-bullet {
    color: #d97706;
  }

  .validation-text {
    flex: 1;
  }

  .validation-summary {
    margin-top: 12px;
    padding: 12px;
    background: #f0fdf4;
    border: 1px solid #86efac;
    border-radius: 6px;
  }

  .validation-summary p {
    margin: 0;
    font-size: 13px;
    color: #166534;
    font-weight: 500;
  }

  .validation-summary-note {
    font-weight: 400;
    color: #16a34a;
  }

  .validation-dismiss {
    position: absolute;
    top: 12px;
    right: 12px;
    background: transparent;
    border: none;
    font-size: 18px;
    color: #6b7280;
    cursor: pointer;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .validation-dismiss:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #374151;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const compactStyles = `
  .validation-compact {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    margin: 8px 0;
  }

  .validation-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }

  .validation-error-badge {
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
  }

  .validation-warning-badge {
    background: #fffbeb;
    color: #d97706;
    border: 1px solid #fed7aa;
  }
`;
