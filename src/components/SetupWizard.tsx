import React, { useState, useEffect, useCallback } from 'react';
import { t, Lang } from '../i18n';
import { logger } from '../utils/logger';

interface SetupWizardProps {
  language: Lang;
  onComplete?: () => void;
  onClose?: () => void;
}

type StepStatus = 'pending' | 'in-progress' | 'completed' | 'error';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  substeps?: string[];
  actionUrl?: string;
  validation?: () => Promise<{ valid: boolean; message: string }>;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ language, onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [clientIdInput, setClientIdInput] = useState('');
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [validationMessage, setValidationMessage] = useState('');
  const [autoValidateEnabled, setAutoValidateEnabled] = useState(true);
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'project',
      title: t(language, 'wizard.step1Title'),
      description: t(language, 'wizard.step1Desc'),
      status: 'in-progress',
      substeps: [
        t(language, 'wizard.step1Sub1'),
        t(language, 'wizard.step1Sub2'),
        t(language, 'wizard.step1Sub3'),
      ],
      actionUrl: 'https://console.cloud.google.com/projectcreate',
    },
    {
      id: 'apis',
      title: t(language, 'wizard.step2Title'),
      description: t(language, 'wizard.step2Desc'),
      status: 'pending',
      substeps: [
        t(language, 'wizard.step2Sub1'),
        t(language, 'wizard.step2Sub2'),
        t(language, 'wizard.step2Sub3'),
        t(language, 'wizard.step2Sub4'),
      ],
      actionUrl: 'https://console.cloud.google.com/apis/library',
    },
    {
      id: 'credentials',
      title: t(language, 'wizard.step3Title'),
      description: t(language, 'wizard.step3Desc'),
      status: 'pending',
      substeps: [
        t(language, 'wizard.step3Sub1'),
        t(language, 'wizard.step3Sub2'),
        t(language, 'wizard.step3Sub3'),
        t(language, 'wizard.step3Sub4'),
      ],
      actionUrl: 'https://console.cloud.google.com/apis/credentials',
    },
    {
      id: 'configure',
      title: t(language, 'wizard.step4Title'),
      description: t(language, 'wizard.step4Desc'),
      status: 'pending',
      substeps: [
        t(language, 'wizard.step4Sub1'),
        t(language, 'wizard.step4Sub2'),
        t(language, 'wizard.step4Sub3'),
      ],
    },
  ]);

  // Check current Client ID status on mount
  useEffect(() => {
    checkCurrentClientId();
  }, []);

  // Auto-validate when Client ID changes
  useEffect(() => {
    if (autoValidateEnabled && clientIdInput.trim().length > 0 && currentStep === 3) {
      const timer = setTimeout(() => {
        validateClientId();
      }, 800);
      return () => clearTimeout(timer);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientIdInput, autoValidateEnabled, currentStep]);

  const checkCurrentClientId = async () => {
    try {
      const manifest = chrome.runtime.getManifest();
      const oauth2 = (manifest as any).oauth2;
      
      if (oauth2 && oauth2.client_id) {
        const clientId = oauth2.client_id;
        
        // Check if it's a valid format (not placeholder)
        if (
          clientId !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com' &&
          !clientId.includes('YOUR_GOOGLE_CLIENT_ID') &&
          clientId.endsWith('.apps.googleusercontent.com')
        ) {
          setClientIdInput(clientId);
          // Mark steps as completed if valid client ID exists
          updateStepStatus('completed', 0, 1, 2, 3);
        }
      }
    } catch (err) {
      logger.error('Failed to check current Client ID:', err);
    }
  };

  const validateClientId = useCallback(async (): Promise<void> => {
    if (!clientIdInput.trim()) {
      setValidationStatus('idle');
      setValidationMessage('');
      return Promise.resolve();
    }

    setValidationStatus('validating');
    setValidationMessage(t(language, 'wizard.validating'));

    try {
      // Validation checks
      const validations = {
        notEmpty: clientIdInput.trim().length > 0,
        notPlaceholder: 
          !clientIdInput.includes('YOUR_') && 
          clientIdInput !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
        correctFormat: clientIdInput.endsWith('.apps.googleusercontent.com'),
        hasNumbers: /\d/.test(clientIdInput),
        correctLength: clientIdInput.length > 40, // Typical Google Client IDs are longer
      };

      // Live status updates for each check
      await new Promise(resolve => setTimeout(resolve, 300));
      if (!validations.notEmpty) {
        setValidationStatus('invalid');
        setValidationMessage(t(language, 'wizard.validationEmpty'));
        return Promise.resolve();
      }

      await new Promise(resolve => setTimeout(resolve, 300));
      if (!validations.notPlaceholder) {
        setValidationStatus('invalid');
        setValidationMessage(t(language, 'wizard.validationPlaceholder'));
        return Promise.resolve();
      }

      await new Promise(resolve => setTimeout(resolve, 300));
      if (!validations.correctFormat) {
        setValidationStatus('invalid');
        setValidationMessage(t(language, 'wizard.validationFormat'));
        return Promise.resolve();
      }

      await new Promise(resolve => setTimeout(resolve, 300));
      if (!validations.hasNumbers) {
        setValidationStatus('invalid');
        setValidationMessage(t(language, 'wizard.validationNoNumbers'));
        return Promise.resolve();
      }

      await new Promise(resolve => setTimeout(resolve, 300));
      if (!validations.correctLength) {
        setValidationStatus('invalid');
        setValidationMessage(t(language, 'wizard.validationTooShort'));
        return Promise.resolve();
      }

      // All validations passed
      setValidationStatus('valid');
      setValidationMessage(t(language, 'wizard.validationSuccess'));
      return Promise.resolve();
    } catch (error) {
      logger.error('Validation error:', error);
      setValidationStatus('invalid');
      setValidationMessage(t(language, 'wizard.validationError'));
      return Promise.resolve();
    }
  }, [clientIdInput, language]);

  const updateStepStatus = (status: StepStatus, ...stepIndices: number[]) => {
    setSteps(prev =>
      prev.map((step, idx) => {
        if (stepIndices.includes(idx)) {
          return { ...step, status };
        }
        return step;
      })
    );
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      updateStepStatus('completed', currentStep);
      updateStepStatus('in-progress', currentStep + 1);
      setCurrentStep(currentStep + 1);
    } else if (currentStep === steps.length - 1 && validationStatus === 'valid') {
      updateStepStatus('completed', currentStep);
      onComplete?.();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      updateStepStatus('in-progress', currentStep - 1);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (index: number) => {
    // Allow navigation to completed steps or the next immediate step
    if (index <= currentStep + 1) {
      updateStepStatus('in-progress', index);
      setCurrentStep(index);
    }
  };

  const openActionUrl = (url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(t(language, 'wizard.copiedToClipboard'));
  };

  const currentStepData = steps[currentStep];
  const canProceed = currentStep < 3 || (currentStep === 3 && validationStatus === 'valid');

  if (!currentStepData) {
    return null;
  }

  return (
    <div className="setup-wizard-overlay">
      <div className="setup-wizard-container">
        <div className="wizard-header">
          <h2>🚀 {t(language, 'wizard.title')}</h2>
          <p>{t(language, 'wizard.subtitle')}</p>
          {onClose && (
            <button className="wizard-close-btn" onClick={onClose} title={t(language, 'common.cancel')}>
              ✕
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="wizard-progress-bar">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`wizard-progress-step ${step.status} ${index === currentStep ? 'active' : ''}`}
              onClick={() => handleStepClick(index)}
              style={{ cursor: index <= currentStep + 1 ? 'pointer' : 'not-allowed' }}
            >
              <div className="wizard-progress-circle">
                {step.status === 'completed' ? '✓' : index + 1}
              </div>
              <div className="wizard-progress-label">{step.title}</div>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="wizard-content">
          <div className="wizard-step-header">
            <h3>
              {currentStep + 1}. {currentStepData.title}
            </h3>
            <p>{currentStepData.description}</p>
          </div>

          {/* Live Status Indicator */}
          <div className={`wizard-status-indicator ${currentStepData.status}`}>
            <div className="status-icon">
              {currentStepData.status === 'completed' && '✅'}
              {currentStepData.status === 'in-progress' && '🔄'}
              {currentStepData.status === 'pending' && '⏳'}
              {currentStepData.status === 'error' && '❌'}
            </div>
            <div className="status-text">
              {currentStepData.status === 'completed' && t(language, 'wizard.statusCompleted')}
              {currentStepData.status === 'in-progress' && t(language, 'wizard.statusInProgress')}
              {currentStepData.status === 'pending' && t(language, 'wizard.statusPending')}
              {currentStepData.status === 'error' && t(language, 'wizard.statusError')}
            </div>
          </div>

          {/* Substeps */}
          {currentStepData.substeps && (
            <div className="wizard-substeps">
              <ol>
                {currentStepData.substeps.map((substep, idx) => (
                  <li key={idx}>{substep}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Action Button for External Links */}
          {currentStepData.actionUrl && (
            <div className="wizard-action">
              <button
                className="btn btn-primary"
                onClick={() => openActionUrl(currentStepData.actionUrl)}
              >
                🔗 {t(language, 'wizard.openConsole')}
              </button>
            </div>
          )}

          {/* Client ID Input & Validation (Step 4) */}
          {currentStep === 3 && (
            <div className="wizard-client-id-section">
              <div className="wizard-info-box">
                <strong>📋 {t(language, 'wizard.clientIdInstructions')}</strong>
                <p>{t(language, 'wizard.clientIdInstructionsDesc')}</p>
              </div>

              <div className="form-group">
                <label htmlFor="client-id-input">
                  {t(language, 'wizard.clientIdLabel')} <span className="required">*</span>
                </label>
                <input
                  id="client-id-input"
                  type="text"
                  className={`form-control ${
                    validationStatus === 'valid'
                      ? 'valid'
                      : validationStatus === 'invalid'
                        ? 'invalid'
                        : ''
                  }`}
                  placeholder="123456789-abc...xyz.apps.googleusercontent.com"
                  value={clientIdInput}
                  onChange={e => setClientIdInput(e.target.value)}
                />
                
                {/* Live Validation Status */}
                {validationStatus !== 'idle' && (
                  <div className={`wizard-validation-message ${validationStatus}`}>
                    {validationStatus === 'validating' && '🔄 '}
                    {validationStatus === 'valid' && '✅ '}
                    {validationStatus === 'invalid' && '❌ '}
                    {validationMessage}
                  </div>
                )}
              </div>

              <div className="wizard-validation-controls">
                <button
                  className="btn btn-secondary"
                  onClick={validateClientId}
                  disabled={!clientIdInput.trim() || validationStatus === 'validating'}
                >
                  {validationStatus === 'validating' ? '⏳' : '🔍'}{' '}
                  {t(language, 'wizard.validateButton')}
                </button>

                <label className="wizard-checkbox-label">
                  <input
                    type="checkbox"
                    checked={autoValidateEnabled}
                    onChange={e => setAutoValidateEnabled(e.target.checked)}
                  />
                  {t(language, 'wizard.autoValidate')}
                </label>
              </div>

              {/* Copy Instructions */}
              <div className="wizard-copy-instructions">
                <h4>{t(language, 'wizard.howToCopy')}</h4>
                <div className="wizard-code-block">
                  <code>manifest.json</code>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => copyToClipboard('manifest.json')}
                  >
                    📋 {t(language, 'wizard.copy')}
                  </button>
                </div>
                <p>{t(language, 'wizard.updateManifestDesc')}</p>
                <div className="wizard-code-example">
                  <pre>
{`"oauth2": {
  "client_id": "${clientIdInput || 'YOUR_CLIENT_ID.apps.googleusercontent.com'}",
  "scopes": [...]
}`}
                  </pre>
                </div>
              </div>

              {/* Extension ID Info */}
              <div className="wizard-info-box" style={{ marginTop: '20px' }}>
                <strong>🆔 {t(language, 'wizard.extensionIdTitle')}</strong>
                <p>{t(language, 'wizard.extensionIdDesc')}</p>
                <div className="wizard-code-block">
                  <code>chrome://extensions</code>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => copyToClipboard('chrome://extensions')}
                  >
                    📋 {t(language, 'wizard.copy')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="wizard-footer">
          <button
            className="btn btn-secondary"
            onClick={handlePrevStep}
            disabled={currentStep === 0}
          >
            ← {t(language, 'wizard.previous')}
          </button>

          <div className="wizard-step-indicator">
            {currentStep + 1} / {steps.length}
          </div>

          {currentStep < steps.length - 1 ? (
            <button className="btn btn-primary" onClick={handleNextStep}>
              {t(language, 'wizard.next')} →
            </button>
          ) : (
            <button
              className="btn btn-success"
              onClick={handleNextStep}
              disabled={!canProceed}
            >
              ✅ {t(language, 'wizard.complete')}
            </button>
          )}
        </div>

        {/* Help Section */}
        <div className="wizard-help">
          <details>
            <summary>❓ {t(language, 'wizard.needHelp')}</summary>
            <div className="wizard-help-content">
              <p>{t(language, 'wizard.helpText')}</p>
              <ul>
                <li>
                  📖 <a href="QUICK_START_GOOGLE_DRIVE.md" target="_blank" rel="noopener noreferrer">
                    {t(language, 'wizard.quickStartGuide')}
                  </a>
                </li>
                <li>
                  📚 <a href="GOOGLE_DRIVE_INTEGRATION.md" target="_blank" rel="noopener noreferrer">
                    {t(language, 'wizard.fullDocumentation')}
                  </a>
                </li>
                <li>
                  🔧 <a href="TROUBLESHOOTING.md" target="_blank" rel="noopener noreferrer">
                    {t(language, 'wizard.troubleshooting')}
                  </a>
                </li>
              </ul>
            </div>
          </details>
        </div>
      </div>

      <style>{`
        .setup-wizard-overlay {
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
          overflow-y: auto;
        }

        .setup-wizard-container {
          background: var(--bg-color, white);
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 30px;
        }

        .wizard-header {
          text-align: center;
          margin-bottom: 30px;
          position: relative;
        }

        .wizard-header h2 {
          margin: 0 0 10px 0;
          font-size: 28px;
        }

        .wizard-header p {
          margin: 0;
          color: var(--text-secondary, #666);
        }

        .wizard-close-btn {
          position: absolute;
          top: 0;
          right: 0;
          background: transparent;
          border: none;
          font-size: 24px;
          cursor: pointer;
          padding: 5px 10px;
          color: var(--text-color, #333);
          opacity: 0.6;
        }

        .wizard-close-btn:hover {
          opacity: 1;
        }

        .wizard-progress-bar {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
          position: relative;
        }

        .wizard-progress-bar::before {
          content: '';
          position: absolute;
          top: 20px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--border-color, #ddd);
          z-index: 0;
        }

        .wizard-progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          position: relative;
          z-index: 1;
        }

        .wizard-progress-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--bg-secondary, #f5f5f5);
          border: 2px solid var(--border-color, #ddd);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-bottom: 8px;
          transition: all 0.3s ease;
        }

        .wizard-progress-step.active .wizard-progress-circle {
          background: var(--primary-color, #007bff);
          color: white;
          border-color: var(--primary-color, #007bff);
          transform: scale(1.1);
        }

        .wizard-progress-step.completed .wizard-progress-circle {
          background: var(--success-color, #28a745);
          color: white;
          border-color: var(--success-color, #28a745);
        }

        .wizard-progress-label {
          font-size: 12px;
          text-align: center;
          color: var(--text-secondary, #666);
          max-width: 120px;
        }

        .wizard-progress-step.active .wizard-progress-label {
          color: var(--primary-color, #007bff);
          font-weight: 600;
        }

        .wizard-content {
          margin-bottom: 30px;
        }

        .wizard-step-header h3 {
          margin: 0 0 10px 0;
          font-size: 22px;
        }

        .wizard-step-header p {
          color: var(--text-secondary, #666);
          margin: 0 0 20px 0;
        }

        .wizard-status-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-weight: 500;
        }

        .wizard-status-indicator.completed {
          background: #d4edda;
          color: #155724;
        }

        .wizard-status-indicator.in-progress {
          background: #d1ecf1;
          color: #0c5460;
        }

        .wizard-status-indicator.pending {
          background: #fff3cd;
          color: #856404;
        }

        .wizard-status-indicator.error {
          background: #f8d7da;
          color: #721c24;
        }

        .status-icon {
          font-size: 20px;
        }

        .wizard-substeps {
          background: var(--bg-secondary, #f8f9fa);
          padding: 20px 20px 20px 40px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .wizard-substeps ol {
          margin: 0;
          padding-left: 20px;
        }

        .wizard-substeps li {
          margin-bottom: 10px;
          line-height: 1.6;
        }

        .wizard-action {
          margin: 20px 0;
        }

        .wizard-client-id-section {
          margin-top: 20px;
        }

        .wizard-info-box {
          background: #e7f3ff;
          border-left: 4px solid var(--primary-color, #007bff);
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        .wizard-info-box strong {
          display: block;
          margin-bottom: 5px;
        }

        .wizard-info-box p {
          margin: 5px 0 0 0;
          font-size: 14px;
        }

        .wizard-validation-message {
          margin-top: 8px;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 14px;
          animation: slideIn 0.3s ease;
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

        .wizard-validation-message.validating {
          background: #fff3cd;
          color: #856404;
        }

        .wizard-validation-message.valid {
          background: #d4edda;
          color: #155724;
        }

        .wizard-validation-message.invalid {
          background: #f8d7da;
          color: #721c24;
        }

        .wizard-validation-controls {
          display: flex;
          gap: 15px;
          align-items: center;
          margin-top: 15px;
        }

        .wizard-checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }

        .wizard-checkbox-label input {
          cursor: pointer;
        }

        .wizard-copy-instructions {
          margin-top: 25px;
        }

        .wizard-copy-instructions h4 {
          margin: 0 0 10px 0;
          font-size: 16px;
        }

        .wizard-code-block {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--bg-secondary, #f5f5f5);
          padding: 10px 15px;
          border-radius: 6px;
          margin: 10px 0;
        }

        .wizard-code-block code {
          flex: 1;
          font-family: 'Courier New', monospace;
          font-size: 14px;
        }

        .wizard-code-example {
          background: #282c34;
          color: #abb2bf;
          padding: 15px;
          border-radius: 6px;
          overflow-x: auto;
          margin-top: 10px;
        }

        .wizard-code-example pre {
          margin: 0;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.6;
        }

        .wizard-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 20px;
          border-top: 1px solid var(--border-color, #ddd);
        }

        .wizard-step-indicator {
          font-weight: 500;
          color: var(--text-secondary, #666);
        }

        .wizard-help {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--border-color, #ddd);
        }

        .wizard-help details {
          cursor: pointer;
        }

        .wizard-help summary {
          font-weight: 500;
          padding: 10px;
          border-radius: 6px;
          background: var(--bg-secondary, #f8f9fa);
        }

        .wizard-help summary:hover {
          background: var(--bg-hover, #e9ecef);
        }

        .wizard-help-content {
          padding: 15px;
        }

        .wizard-help-content ul {
          list-style: none;
          padding: 0;
        }

        .wizard-help-content li {
          margin: 10px 0;
        }

        .wizard-help-content a {
          color: var(--primary-color, #007bff);
          text-decoration: none;
        }

        .wizard-help-content a:hover {
          text-decoration: underline;
        }

        .form-control.valid {
          border-color: var(--success-color, #28a745);
        }

        .form-control.invalid {
          border-color: var(--error-color, #dc3545);
        }

        .required {
          color: var(--error-color, #dc3545);
        }
      `}</style>
    </div>
  );
};
