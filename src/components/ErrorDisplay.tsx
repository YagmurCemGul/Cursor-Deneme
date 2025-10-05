import React from 'react';
import { t, Lang } from '../i18n';

interface ErrorDisplayProps {
  error: Error | string;
  language: Lang;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  language,
  onRetry,
  onDismiss,
  showDetails = true,
  variant = 'danger',
}) => {
  const [showFullError, setShowFullError] = React.useState(false);

  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'object' && 'stack' in error ? error.stack : undefined;

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❌';
    }
  };

  const getTitle = () => {
    switch (variant) {
      case 'danger':
        return t(language, 'error.title');
      case 'warning':
        return t(language, 'error.warning');
      case 'info':
        return t(language, 'error.info');
      default:
        return t(language, 'error.title');
    }
  };

  // Check if error is about AI configuration
  const isAIConfigError = errorMessage.toLowerCase().includes('ai provider not configured') ||
                          errorMessage.toLowerCase().includes('api key');

  return (
    <div className={`error-display error-${variant}`}>
      <div className="error-header">
        <div className="error-icon">{getIcon()}</div>
        <div className="error-content">
          <h3 className="error-title">{getTitle()}</h3>
          <p className="error-message">{errorMessage}</p>
        </div>
        {onDismiss && (
          <button className="error-dismiss" onClick={onDismiss} aria-label="Dismiss">
            ✕
          </button>
        )}
      </div>

      {isAIConfigError && (
        <div className="error-suggestion">
          <strong>💡 {t(language, 'error.suggestion')}:</strong>
          <p>{t(language, 'error.configureAI')}</p>
          <a href="#settings" className="error-link">
            {t(language, 'error.goToSettings')} →
          </a>
        </div>
      )}

      {showDetails && errorStack && (
        <div className="error-details">
          <button
            className="error-toggle"
            onClick={() => setShowFullError(!showFullError)}
          >
            {showFullError ? '▼' : '▶'} {t(language, 'error.technicalDetails')}
          </button>
          {showFullError && (
            <pre className="error-stack">{errorStack}</pre>
          )}
        </div>
      )}

      {onRetry && (
        <div className="error-actions">
          <button className="btn btn-primary" onClick={onRetry}>
            🔄 {t(language, 'error.tryAgain')}
          </button>
        </div>
      )}

      <style>{`
        .error-display {
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
          animation: slideIn 0.3s ease-out;
        }

        .error-danger {
          background: #fef2f2;
          border: 1px solid #fecaca;
        }

        .error-warning {
          background: #fffbeb;
          border: 1px solid #fed7aa;
        }

        .error-info {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
        }

        .error-header {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .error-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .error-content {
          flex: 1;
        }

        .error-title {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .error-danger .error-title {
          color: #dc2626;
        }

        .error-warning .error-title {
          color: #d97706;
        }

        .error-info .error-title {
          color: #2563eb;
        }

        .error-message {
          margin: 0;
          font-size: 14px;
          color: #374151;
          line-height: 1.5;
        }

        .error-dismiss {
          background: transparent;
          border: none;
          font-size: 20px;
          color: #6b7280;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .error-dismiss:hover {
          background: rgba(0, 0, 0, 0.05);
          color: #374151;
        }

        .error-suggestion {
          margin-top: 12px;
          padding: 12px;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 6px;
          border-left: 3px solid #3b82f6;
        }

        .error-suggestion strong {
          display: block;
          margin-bottom: 8px;
          color: #1e40af;
        }

        .error-suggestion p {
          margin: 0 0 8px 0;
          font-size: 13px;
          color: #374151;
        }

        .error-link {
          display: inline-flex;
          align-items: center;
          color: #2563eb;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
        }

        .error-link:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }

        .error-details {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .error-toggle {
          background: transparent;
          border: none;
          color: #6b7280;
          font-size: 13px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .error-toggle:hover {
          background: rgba(0, 0, 0, 0.05);
          color: #374151;
        }

        .error-stack {
          margin: 8px 0 0 0;
          padding: 12px;
          background: #1f2937;
          color: #f3f4f6;
          border-radius: 4px;
          font-size: 11px;
          overflow-x: auto;
          max-height: 200px;
        }

        .error-actions {
          margin-top: 16px;
          display: flex;
          gap: 8px;
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
