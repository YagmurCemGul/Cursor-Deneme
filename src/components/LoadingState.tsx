import React from 'react';
import { t, Lang } from '../i18n';

interface LoadingStateProps {
  message?: string;
  language: Lang;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message,
  language,
  size = 'medium',
  fullScreen = false,
}) => {
  const sizeClasses = {
    small: 'loading-small',
    medium: 'loading-medium',
    large: 'loading-large',
  };

  const defaultMessages = {
    small: t(language, 'common.loading'),
    medium: t(language, 'common.processing'),
    large: t(language, 'common.pleaseWait'),
  };

  return (
    <div className={`loading-state ${fullScreen ? 'loading-fullscreen' : ''} ${sizeClasses[size]}`}>
      <div className="loading-spinner">
        <div className="spinner-circle"></div>
      </div>
      <p className="loading-message">{message || defaultMessages[size]}</p>
      <style>{`
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 20px;
        }

        .loading-fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.95);
          z-index: 9999;
        }

        .loading-spinner {
          position: relative;
        }

        .spinner-circle {
          border: 3px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .loading-small .spinner-circle {
          width: 24px;
          height: 24px;
          border-width: 2px;
        }

        .loading-medium .spinner-circle {
          width: 40px;
          height: 40px;
          border-width: 3px;
        }

        .loading-large .spinner-circle {
          width: 60px;
          height: 60px;
          border-width: 4px;
        }

        .loading-message {
          margin: 0;
          color: #374151;
          font-size: 14px;
          font-weight: 500;
        }

        .loading-large .loading-message {
          font-size: 16px;
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
