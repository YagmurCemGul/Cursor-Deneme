import React, { useState, useEffect, useCallback } from 'react';
import { t, Lang } from '../i18n';
import { aiService } from '../utils/aiService';

interface AIProviderStatusProps {
  language: Lang;
  onConfigure?: () => void;
  compact?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  showLastCheck?: boolean;
}

export const AIProviderStatus: React.FC<AIProviderStatusProps> = ({
  language,
  onConfigure,
  compact = false,
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds default
  showLastCheck = true,
}) => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'degraded' | 'unknown'>('unknown');

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = useCallback(() => {
    setIsChecking(true);
    try {
      const configured = aiService.isConfigured();
      setIsConfigured(configured);
      setHealthStatus(configured ? 'healthy' : 'unknown');
      setLastChecked(new Date());
    } catch (error) {
      console.error('Error checking AI configuration:', error);
      setIsConfigured(false);
      setHealthStatus('degraded');
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        checkConfiguration();
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, checkConfiguration]);

  const formatLastChecked = () => {
    if (!lastChecked) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastChecked.getTime()) / 1000);
    if (diff < 60) return t(language, 'aiStatus.justNow');
    if (diff < 3600) return `${Math.floor(diff / 60)}${t(language, 'time.minutesAgo')}`;
    return `${Math.floor(diff / 3600)}${t(language, 'time.hoursAgo')}`;
  };

  if (isChecking) {
    return (
      <div className={`ai-status ai-status-checking ${compact ? 'ai-status-compact' : ''}`}>
        <div className="ai-status-indicator">
          <div className="ai-status-pulse"></div>
        </div>
        <span className="ai-status-text">{t(language, 'aiStatus.checking')}</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div
        className={`ai-status ai-status-compact ${isConfigured ? 'ai-status-ok' : 'ai-status-warning'}`}
        onClick={!isConfigured ? onConfigure : undefined}
        style={{ cursor: !isConfigured ? 'pointer' : 'default' }}
        title={isConfigured ? t(language, 'aiStatus.configured') : t(language, 'aiStatus.notConfigured')}
      >
        <div className="ai-status-indicator">
          <div className={`ai-status-dot ${isConfigured ? 'ai-status-dot-ok' : 'ai-status-dot-warning'}`}></div>
        </div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="ai-status ai-status-warning">
        <div className="ai-status-content">
          <div className="ai-status-icon">⚠️</div>
          <div className="ai-status-info">
            <h4 className="ai-status-title">{t(language, 'aiStatus.notConfiguredTitle')}</h4>
            <p className="ai-status-description">
              {t(language, 'aiStatus.notConfiguredDesc')}
            </p>
            {showLastCheck && lastChecked && (
              <p className="ai-status-timestamp">
                {t(language, 'aiStatus.lastChecked')}: {formatLastChecked()}
              </p>
            )}
          </div>
        </div>
        <div className="ai-status-actions">
          {onConfigure && (
            <button className="btn btn-primary btn-sm" onClick={onConfigure}>
              ⚙️ {t(language, 'aiStatus.configure')}
            </button>
          )}
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={checkConfiguration}
            disabled={isChecking}
          >
            🔄 {t(language, 'aiStatus.refresh')}
          </button>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className={`ai-status ai-status-ok ${healthStatus === 'degraded' ? 'ai-status-degraded' : ''}`}>
      <div className="ai-status-indicator">
        <div className={`ai-status-dot ai-status-dot-${healthStatus === 'degraded' ? 'warning' : 'ok'}`}></div>
      </div>
      <div className="ai-status-text-wrapper">
        <span className="ai-status-text">
          ✓ {t(language, 'aiStatus.configured')}
        </span>
        {showLastCheck && lastChecked && !compact && (
          <span className="ai-status-timestamp">
            {t(language, 'aiStatus.lastChecked')}: {formatLastChecked()}
          </span>
        )}
      </div>
      {!compact && (
        <button 
          className="btn-refresh-status" 
          onClick={checkConfiguration}
          disabled={isChecking}
          title={t(language, 'aiStatus.refresh')}
        >
          🔄
        </button>
      )}
      <style>{styles}</style>
    </div>
  );
};

const styles = `
  .ai-status {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .ai-status-checking {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
  }

  .ai-status-ok {
    background: #f0fdf4;
    border: 1px solid #86efac;
  }

  .ai-status-warning {
    background: #fffbeb;
    border: 1px solid #fed7aa;
  }

  .ai-status-compact {
    padding: 4px 8px;
    border-radius: 12px;
    display: inline-flex;
  }

  .ai-status-compact .ai-status-text {
    display: none;
  }

  .ai-status-indicator {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ai-status-pulse {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #3b82f6;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .ai-status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    transition: all 0.2s;
  }

  .ai-status-dot-ok {
    background: #10b981;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
  }

  .ai-status-dot-warning {
    background: #f59e0b;
    box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
  }

  .ai-status-content {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    flex: 1;
  }

  .ai-status-icon {
    font-size: 24px;
    flex-shrink: 0;
  }

  .ai-status-info {
    flex: 1;
  }

  .ai-status-title {
    margin: 0 0 4px 0;
    font-size: 14px;
    font-weight: 600;
    color: #d97706;
  }

  .ai-status-description {
    margin: 0;
    font-size: 13px;
    color: #78716c;
    line-height: 1.4;
  }

  .ai-status-timestamp {
    display: block;
    margin-top: 4px;
    font-size: 11px;
    color: #9ca3af;
  }

  .ai-status-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .ai-status-text-wrapper {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .btn-refresh-status {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    font-size: 14px;
    transition: all 0.2s;
    margin-left: auto;
  }

  .btn-refresh-status:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.05);
  }

  .btn-refresh-status:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .ai-status-degraded {
    background: #fffbeb;
    border-color: #fed7aa;
  }

  .ai-status-text {
    font-size: 13px;
    font-weight: 500;
    color: #374151;
  }

  .ai-status-ok .ai-status-text {
    color: #059669;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(0.8);
    }
  }
`;
