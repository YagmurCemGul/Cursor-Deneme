import React, { useState } from 'react';
import { t, Lang } from '../i18n';
import { AIProvider, AIConfig } from '../utils/aiProviders';
import { aiService } from '../utils/aiService';

interface AIOnboardingProps {
  language: Lang;
  onComplete: (config: AIConfig) => void;
  onSkip?: () => void;
}

interface Step {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
}

export const AIOnboarding: React.FC<AIOnboardingProps> = ({
  language,
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('openai');
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const providers: Array<{
    id: AIProvider;
    name: string;
    description: string;
    icon: string;
    docsUrl: string;
    features: string[];
  }> = [
    {
      id: 'openai',
      name: 'OpenAI',
      description: t(language, 'aiOnboarding.openaiDesc'),
      icon: '🤖',
      docsUrl: 'https://platform.openai.com/api-keys',
      features: [
        t(language, 'aiOnboarding.feature.gpt4'),
        t(language, 'aiOnboarding.feature.reliable'),
        t(language, 'aiOnboarding.feature.popular'),
      ],
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      description: t(language, 'aiOnboarding.geminiDesc'),
      icon: '✨',
      docsUrl: 'https://makersuite.google.com/app/apikey',
      features: [
        t(language, 'aiOnboarding.feature.free'),
        t(language, 'aiOnboarding.feature.fast'),
        t(language, 'aiOnboarding.feature.google'),
      ],
    },
    {
      id: 'claude',
      name: 'Anthropic Claude',
      description: t(language, 'aiOnboarding.claudeDesc'),
      icon: '🧠',
      docsUrl: 'https://console.anthropic.com/account/keys',
      features: [
        t(language, 'aiOnboarding.feature.detailed'),
        t(language, 'aiOnboarding.feature.safe'),
        t(language, 'aiOnboarding.feature.context'),
      ],
    },
  ];

  const validateAndComplete = async () => {
    if (!apiKey.trim()) {
      setValidationError(t(language, 'aiOnboarding.error.emptyKey'));
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const config: AIConfig = {
        provider: selectedProvider,
        apiKey: apiKey.trim(),
      };

      // Try to update the service with the new config
      aiService.updateConfig(config);

      // Configuration successful
      onComplete(config);
    } catch (error) {
      console.error('Validation error:', error);
      setValidationError(
        error instanceof Error
          ? error.message
          : t(language, 'aiOnboarding.error.invalid')
      );
    } finally {
      setIsValidating(false);
    }
  };

  const steps: Step[] = [
    {
      id: 'welcome',
      title: t(language, 'aiOnboarding.welcome.title'),
      description: t(language, 'aiOnboarding.welcome.desc'),
      component: (
        <div className="onboarding-step">
          <div className="onboarding-hero">
            <div className="onboarding-icon">🚀</div>
            <h2>{t(language, 'aiOnboarding.welcome.heading')}</h2>
            <p className="onboarding-lead">
              {t(language, 'aiOnboarding.welcome.lead')}
            </p>
          </div>
          <div className="onboarding-features">
            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <h3>{t(language, 'aiOnboarding.feature.optimize')}</h3>
              <p>{t(language, 'aiOnboarding.feature.optimizeDesc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✉️</div>
              <h3>{t(language, 'aiOnboarding.feature.coverLetter')}</h3>
              <p>{t(language, 'aiOnboarding.feature.coverLetterDesc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>{t(language, 'aiOnboarding.feature.match')}</h3>
              <p>{t(language, 'aiOnboarding.feature.matchDesc')}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'provider',
      title: t(language, 'aiOnboarding.provider.title'),
      description: t(language, 'aiOnboarding.provider.desc'),
      component: (
        <div className="onboarding-step">
          <div className="provider-grid">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className={`provider-card ${selectedProvider === provider.id ? 'selected' : ''}`}
                onClick={() => setSelectedProvider(provider.id)}
              >
                <div className="provider-header">
                  <div className="provider-icon">{provider.icon}</div>
                  <h3>{provider.name}</h3>
                  {selectedProvider === provider.id && (
                    <div className="provider-check">✓</div>
                  )}
                </div>
                <p className="provider-description">{provider.description}</p>
                <ul className="provider-features">
                  {provider.features.map((feature, idx) => (
                    <li key={idx}>✓ {feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'apikey',
      title: t(language, 'aiOnboarding.apiKey.title'),
      description: t(language, 'aiOnboarding.apiKey.desc'),
      component: (
        <div className="onboarding-step">
          <div className="api-key-section">
            <div className="provider-info">
              <div className="provider-icon">
                {providers.find((p) => p.id === selectedProvider)?.icon}
              </div>
              <div>
                <h3>{providers.find((p) => p.id === selectedProvider)?.name}</h3>
                <p>{t(language, 'aiOnboarding.apiKey.selected')}</p>
              </div>
            </div>

            <div className="instructions-card">
              <h4>📋 {t(language, 'aiOnboarding.apiKey.howTo')}</h4>
              <ol className="instructions-list">
                <li>
                  {t(language, 'aiOnboarding.apiKey.step1')}{' '}
                  <a
                    href={providers.find((p) => p.id === selectedProvider)?.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="external-link"
                  >
                    {providers.find((p) => p.id === selectedProvider)?.name}{' '}
                    {t(language, 'aiOnboarding.apiKey.dashboard')} ↗
                  </a>
                </li>
                <li>{t(language, 'aiOnboarding.apiKey.step2')}</li>
                <li>{t(language, 'aiOnboarding.apiKey.step3')}</li>
              </ol>
            </div>

            <div className="api-key-input-group">
              <label htmlFor="api-key" className="form-label">
                🔑 {t(language, 'aiOnboarding.apiKey.label')}
              </label>
              <input
                id="api-key"
                type="password"
                className="form-input"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setValidationError(null);
                }}
                placeholder={t(language, 'aiOnboarding.apiKey.placeholder')}
                disabled={isValidating}
              />
              {validationError && (
                <div className="validation-error">
                  <span className="error-icon">⚠️</span>
                  {validationError}
                </div>
              )}
              <p className="input-hint">
                🔒 {t(language, 'aiOnboarding.apiKey.security')}
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="ai-onboarding-overlay">
      <div className="ai-onboarding-modal">
        <div className="onboarding-header">
          <div className="progress-bar">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`progress-step ${index <= currentStep ? 'active' : ''} ${
                  index < currentStep ? 'completed' : ''
                }`}
              >
                <div className="progress-dot"></div>
                {index < steps.length - 1 && <div className="progress-line"></div>}
              </div>
            ))}
          </div>
          {onSkip && (
            <button className="btn-skip" onClick={onSkip}>
              {t(language, 'common.skip')}
            </button>
          )}
        </div>

        <div className="onboarding-content">
          <div className="step-header">
            <h2 className="step-title">{currentStepData.title}</h2>
            <p className="step-description">{currentStepData.description}</p>
          </div>
          <div className="step-body">{currentStepData.component}</div>
        </div>

        <div className="onboarding-footer">
          {currentStep > 0 && (
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={isValidating}
            >
              ← {t(language, 'common.back')}
            </button>
          )}
          <div style={{ flex: 1 }}></div>
          {!isLastStep ? (
            <button
              className="btn btn-primary"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              {t(language, 'common.next')} →
            </button>
          ) : (
            <button
              className="btn btn-success"
              onClick={validateAndComplete}
              disabled={!apiKey.trim() || isValidating}
            >
              {isValidating
                ? `⏳ ${t(language, 'common.validating')}...`
                : `✓ ${t(language, 'common.complete')}`}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .ai-onboarding-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
          animation: fadeIn 0.3s ease-out;
        }

        .ai-onboarding-modal {
          background: white;
          border-radius: 16px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: slideUp 0.3s ease-out;
        }

        .onboarding-header {
          padding: 24px 24px 16px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .progress-bar {
          display: flex;
          align-items: center;
          flex: 1;
          max-width: 300px;
        }

        .progress-step {
          display: flex;
          align-items: center;
          flex: 1;
          position: relative;
        }

        .progress-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #e5e7eb;
          transition: all 0.3s;
          position: relative;
          z-index: 1;
        }

        .progress-step.active .progress-dot {
          background: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
        }

        .progress-step.completed .progress-dot {
          background: #10b981;
        }

        .progress-line {
          flex: 1;
          height: 2px;
          background: #e5e7eb;
          transition: all 0.3s;
        }

        .progress-step.completed .progress-line,
        .progress-step.active .progress-line {
          background: #10b981;
        }

        .btn-skip {
          background: transparent;
          border: none;
          color: #6b7280;
          font-size: 14px;
          cursor: pointer;
          padding: 4px 12px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .btn-skip:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .onboarding-content {
          flex: 1;
          overflow-y: auto;
          padding: 32px 24px;
        }

        .step-header {
          margin-bottom: 32px;
          text-align: center;
        }

        .step-title {
          margin: 0 0 12px 0;
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
        }

        .step-description {
          margin: 0;
          font-size: 16px;
          color: #6b7280;
          line-height: 1.5;
        }

        .onboarding-step {
          animation: fadeIn 0.3s ease-out;
        }

        .onboarding-hero {
          text-align: center;
          margin-bottom: 48px;
        }

        .onboarding-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .onboarding-hero h2 {
          margin: 0 0 12px 0;
          font-size: 32px;
          font-weight: 700;
          color: #1f2937;
        }

        .onboarding-lead {
          font-size: 18px;
          color: #6b7280;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .onboarding-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
        }

        .feature-card {
          padding: 24px;
          background: #f9fafb;
          border-radius: 12px;
          text-align: center;
          transition: all 0.2s;
        }

        .feature-card:hover {
          background: #f3f4f6;
          transform: translateY(-2px);
        }

        .feature-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .feature-card h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .feature-card p {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
        }

        .provider-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }

        .provider-card {
          padding: 20px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .provider-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
        }

        .provider-card.selected {
          border-color: #3b82f6;
          background: #eff6ff;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }

        .provider-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .provider-icon {
          font-size: 32px;
        }

        .provider-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          flex: 1;
        }

        .provider-check {
          width: 24px;
          height: 24px;
          background: #10b981;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
        }

        .provider-description {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
        }

        .provider-features {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .provider-features li {
          font-size: 13px;
          color: #059669;
          margin-bottom: 6px;
        }

        .api-key-section {
          max-width: 600px;
          margin: 0 auto;
        }

        .provider-info {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: #f9fafb;
          border-radius: 12px;
          margin-bottom: 24px;
        }

        .provider-info .provider-icon {
          font-size: 48px;
        }

        .provider-info h3 {
          margin: 0 0 4px 0;
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }

        .provider-info p {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
        }

        .instructions-card {
          padding: 20px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 12px;
          margin-bottom: 24px;
        }

        .instructions-card h4 {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1e40af;
        }

        .instructions-list {
          margin: 0;
          padding-left: 20px;
        }

        .instructions-list li {
          margin-bottom: 8px;
          font-size: 14px;
          color: #374151;
          line-height: 1.6;
        }

        .external-link {
          color: #2563eb;
          text-decoration: none;
          font-weight: 500;
        }

        .external-link:hover {
          text-decoration: underline;
        }

        .api-key-input-group {
          margin-bottom: 16px;
        }

        .api-key-input-group .form-label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .api-key-input-group .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-family: 'Courier New', monospace;
          transition: all 0.2s;
        }

        .api-key-input-group .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .api-key-input-group .form-input:disabled {
          background: #f9fafb;
          cursor: not-allowed;
        }

        .validation-error {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          padding: 8px 12px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          color: #dc2626;
          font-size: 13px;
        }

        .error-icon {
          flex-shrink: 0;
        }

        .input-hint {
          margin: 8px 0 0 0;
          font-size: 13px;
          color: #6b7280;
        }

        .onboarding-footer {
          padding: 20px 24px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 12px;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
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
