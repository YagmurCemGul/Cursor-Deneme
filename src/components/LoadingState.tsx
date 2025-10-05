import React, { useState, useEffect } from 'react';
import { t, Lang } from '../i18n';

interface LoadingStateProps {
  message?: string;
  language: Lang;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  progress?: number; // 0-100
  onCancel?: () => void;
  showProgressBar?: boolean;
  estimatedTime?: string;
  steps?: string[];
  currentStep?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message,
  language,
  size = 'medium',
  fullScreen = false,
  progress,
  onCancel,
  showProgressBar = false,
  estimatedTime,
  steps,
  currentStep = 0,
}) => {
  const [dots, setDots] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
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

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  return (
    <div className={`loading-state ${fullScreen ? 'loading-fullscreen' : ''} ${sizeClasses[size]}`}>
      <div className="loading-spinner">
        <div className="spinner-circle"></div>
      </div>
      <p className="loading-message">
        {message || defaultMessages[size]}{dots}
      </p>
      
      {showProgressBar && progress !== undefined && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            ></div>
          </div>
          <span className="progress-text">{Math.round(progress)}%</span>
        </div>
      )}

      {steps && steps.length > 0 && (
        <div className="loading-steps">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`step-item ${
                index < currentStep ? 'completed' : 
                index === currentStep ? 'active' : 'pending'
              }`}
            >
              <div className="step-indicator">
                {index < currentStep ? '✓' : index === currentStep ? '●' : '○'}
              </div>
              <span className="step-text">{step}</span>
            </div>
          ))}
        </div>
      )}

      {estimatedTime && (
        <p className="estimated-time">
          ⏱️ {t(language, 'loading.estimatedTime')}: {estimatedTime}
        </p>
      )}

      <p className="time-elapsed">
        {t(language, 'loading.elapsed')}: {formatTime(timeElapsed)}
      </p>

      {onCancel && (
        <button className="btn-cancel" onClick={onCancel}>
          {t(language, 'common.cancel')}
        </button>
      )}
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

        .progress-container {
          width: 100%;
          max-width: 300px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #2563eb);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 13px;
          font-weight: 600;
          color: #3b82f6;
          min-width: 45px;
        }

        .loading-steps {
          width: 100%;
          max-width: 400px;
          margin-top: 16px;
        }

        .step-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          font-size: 13px;
        }

        .step-indicator {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 12px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .step-item.completed .step-indicator {
          background: #10b981;
          color: white;
        }

        .step-item.active .step-indicator {
          background: #3b82f6;
          color: white;
          animation: pulse-indicator 1.5s ease-in-out infinite;
        }

        .step-item.pending .step-indicator {
          background: #e5e7eb;
          color: #9ca3af;
        }

        .step-item.completed .step-text {
          color: #10b981;
        }

        .step-item.active .step-text {
          color: #374151;
          font-weight: 600;
        }

        .step-item.pending .step-text {
          color: #9ca3af;
        }

        .estimated-time {
          margin: 12px 0 0 0;
          font-size: 13px;
          color: #6b7280;
        }

        .time-elapsed {
          margin: 4px 0 0 0;
          font-size: 12px;
          color: #9ca3af;
        }

        .btn-cancel {
          margin-top: 16px;
          padding: 8px 20px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancel:hover {
          background: #dc2626;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .btn-cancel:active {
          transform: translateY(0);
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse-indicator {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 6px rgba(59, 130, 246, 0);
          }
        }
      `}</style>
    </div>
  );
};
