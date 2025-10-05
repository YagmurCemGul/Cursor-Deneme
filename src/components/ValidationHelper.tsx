import React, { useState, useEffect, useCallback } from 'react';
import { t, Lang } from '../i18n';
import { ValidationDisplay } from './ValidationDisplay';
import { LoadingState } from './LoadingState';
import { ErrorDisplay } from './ErrorDisplay';
import { AIProviderStatus } from './AIProviderStatus';
import {
  validateCVData,
  validateJobDescription,
  validateOptimizationInputs,
  ValidationResult,
} from '../utils/inputValidation';
import { CVData } from '../types';

interface ValidationHelperProps {
  cvData: CVData;
  jobDescription: string;
  language: Lang;
  onValidationChange?: (result: ValidationResult) => void;
  showLiveValidation?: boolean;
  validationType?: 'cv' | 'jobDescription' | 'optimization';
}

/**
 * ValidationHelper Component
 * 
 * Provides real-time validation feedback for CV data and job descriptions.
 * Shows validation errors, warnings, and suggestions to improve data quality
 * before submitting to AI processing.
 */
export const ValidationHelper: React.FC<ValidationHelperProps> = ({
  cvData,
  jobDescription,
  language,
  onValidationChange,
  showLiveValidation = true,
  validationType = 'optimization',
}) => {
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
  });
  const [isValidating, setIsValidating] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const performValidation = useCallback(() => {
    setIsValidating(true);
    
    // Simulate async validation (in case we want to add debouncing or API checks)
    setTimeout(() => {
      let result: ValidationResult;
      
      switch (validationType) {
        case 'cv':
          result = validateCVData(cvData);
          break;
        case 'jobDescription':
          result = validateJobDescription(jobDescription);
          break;
        case 'optimization':
        default:
          result = validateOptimizationInputs(cvData, jobDescription);
          break;
      }
      
      setValidation(result);
      setIsValidating(false);
      
      if (onValidationChange) {
        onValidationChange(result);
      }
      
      // Auto-show validation if there are errors
      if (result.errors.length > 0) {
        setShowValidation(true);
      }
    }, 300);
  }, [cvData, jobDescription, validationType, onValidationChange]);

  useEffect(() => {
    if (showLiveValidation) {
      performValidation();
    }
  }, [cvData, jobDescription, showLiveValidation, performValidation]);

  const handleValidateClick = () => {
    setShowValidation(true);
    performValidation();
  };

  const getValidationStatusIcon = () => {
    if (validation.errors.length > 0) return '❌';
    if (validation.warnings.length > 0) return '⚠️';
    return '✅';
  };

  const getValidationStatusText = () => {
    if (validation.errors.length > 0) {
      return t(language, 'validation.hasErrors');
    }
    if (validation.warnings.length > 0) {
      return t(language, 'validation.hasWarnings');
    }
    return t(language, 'validation.allGood');
  };

  if (isValidating) {
    return (
      <div className="validation-helper">
        <LoadingState
          language={language}
          size="small"
          message={t(language, 'validation.checking')}
        />
      </div>
    );
  }

  return (
    <div className="validation-helper">
      {/* Validation Status Badge */}
      <div className="validation-status-badge">
        <span className="status-icon">{getValidationStatusIcon()}</span>
        <span className="status-text">{getValidationStatusText()}</span>
        {!showValidation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
          <button
            className="btn-show-details"
            onClick={() => setShowValidation(true)}
          >
            {t(language, 'validation.showDetails')}
          </button>
        )}
        {!showLiveValidation && (
          <button
            className="btn-validate"
            onClick={handleValidateClick}
          >
            🔍 {t(language, 'validation.validate')}
          </button>
        )}
      </div>

      {/* Validation Details */}
      {showValidation && (
        <ValidationDisplay
          validation={validation}
          language={language}
          onDismiss={() => setShowValidation(false)}
          showWarnings
        />
      )}

      {/* Helpful Tips */}
      {validation.isValid && validation.warnings.length === 0 && showValidation && (
        <div className="validation-success">
          <div className="success-icon">✨</div>
          <div className="success-content">
            <h4>{t(language, 'validation.excellentJob')}</h4>
            <p>{t(language, 'validation.readyForAI')}</p>
          </div>
        </div>
      )}

      <style>{`
        .validation-helper {
          margin: 16px 0;
        }

        .validation-status-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          margin-bottom: 12px;
        }

        .status-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .status-text {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .btn-show-details {
          padding: 6px 12px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-show-details:hover {
          background: #2563eb;
        }

        .btn-validate {
          padding: 6px 12px;
          background: #059669;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-validate:hover {
          background: #047857;
        }

        .validation-success {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border: 1px solid #86efac;
          border-radius: 12px;
          margin-top: 12px;
          animation: slideIn 0.3s ease-out;
        }

        .success-icon {
          font-size: 48px;
          flex-shrink: 0;
        }

        .success-content h4 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: #166534;
        }

        .success-content p {
          margin: 0;
          font-size: 14px;
          color: #15803d;
          line-height: 1.5;
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
      `}</style>
    </div>
  );
};

/**
 * ValidationGuard Component
 * 
 * Wraps a component and prevents it from being accessed until validation passes.
 * Shows validation errors and guides users to fix issues before proceeding.
 */
interface ValidationGuardProps {
  cvData: CVData;
  jobDescription: string;
  language: Lang;
  children: React.ReactNode;
  validationType?: 'cv' | 'jobDescription' | 'optimization';
}

export const ValidationGuard: React.FC<ValidationGuardProps> = ({
  cvData,
  jobDescription,
  language,
  children,
  validationType = 'optimization',
}) => {
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
  });

  const handleValidationChange = (result: ValidationResult) => {
    setValidation(result);
  };

  if (!validation.isValid) {
    return (
      <div className="validation-guard">
        <ErrorDisplay
          error={t(language, 'validation.guardMessage')}
          language={language}
          variant="warning"
          showDetails={false}
        />
        <ValidationHelper
          cvData={cvData}
          jobDescription={jobDescription}
          language={language}
          validationType={validationType}
          onValidationChange={handleValidationChange}
          showLiveValidation
        />
        <style>{`
          .validation-guard {
            padding: 24px;
            background: #fffbeb;
            border: 2px dashed #fbbf24;
            border-radius: 12px;
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
};
