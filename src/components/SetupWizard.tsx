import React, { useState, useEffect } from 'react';
import { GoogleDriveService } from '../utils/googleDriveService';
import { t, Lang } from '../i18n';

interface SetupWizardProps {
  language: Lang;
  onComplete: () => void;
  onCancel: () => void;
}

type WizardStep = 1 | 2 | 3 | 4 | 5;

interface StepStatus {
  completed: boolean;
  error?: string;
  validating?: boolean;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ language, onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [stepStatuses, setStepStatuses] = useState<Record<WizardStep, StepStatus>>({
    1: { completed: false },
    2: { completed: false },
    3: { completed: false },
    4: { completed: false },
    5: { completed: false },
  });

  const updateStepStatus = (step: WizardStep, status: Partial<StepStatus>) => {
    setStepStatuses((prev) => ({
      ...prev,
      [step]: { ...prev[step], ...status },
    }));
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as WizardStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
    }
  };

  const handleValidateStep = async (step: WizardStep) => {
    updateStepStatus(step, { validating: true, error: undefined });

    try {
      switch (step) {
        case 1:
          // Validate Google Cloud project setup
          const clientId = GoogleDriveService.getClientId();
          if (!clientId || clientId.includes('YOUR_')) {
            updateStepStatus(1, {
              validating: false,
              completed: false,
              error: 'Client ID not configured',
            });
          } else {
            updateStepStatus(1, { validating: false, completed: true });
          }
          break;

        case 2:
          // Validate Client ID with API
          const validation = await GoogleDriveService.validateClientIdWithAPI();
          updateStepStatus(2, {
            validating: false,
            completed: validation.valid,
            error: validation.error,
          });
          break;

        case 3:
          // Validate scopes
          const enhanced = await GoogleDriveService.validateEnhanced();
          updateStepStatus(3, {
            validating: false,
            completed: enhanced.checks.scopes.passed,
            error: enhanced.checks.scopes.passed ? undefined : enhanced.checks.scopes.message,
          });
          break;

        case 4:
          // Test authentication
          try {
            const authenticated = await GoogleDriveService.authenticate();
            updateStepStatus(4, { validating: false, completed: authenticated });
          } catch (error: any) {
            updateStepStatus(4, {
              validating: false,
              completed: false,
              error: error.message,
            });
          }
          break;

        case 5:
          // Test API access
          const health = await GoogleDriveService.getHealthStatus();
          updateStepStatus(5, {
            validating: false,
            completed: health.status === 'healthy',
            error: health.issues.length > 0 ? health.issues.join(', ') : undefined,
          });
          break;
      }
    } catch (error: any) {
      updateStepStatus(step, {
        validating: false,
        completed: false,
        error: error.message || 'Validation failed',
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="wizard-step">
            <h3 className="step-title">📋 Step 1: Google Cloud Project</h3>
            <p className="step-description">
              Create a Google Cloud project and configure OAuth credentials.
            </p>
            <div className="step-content">
              <ol className="step-instructions">
                <li>Go to Google Cloud Console</li>
                <li>Create a new project (or select existing)</li>
                <li>Enable required APIs (Drive, Docs, Sheets, Slides)</li>
                <li>Create OAuth 2.0 Client ID</li>
                <li>Copy your Client ID to manifest.json</li>
              </ol>

              <div className="step-actions">
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-link"
                >
                  🔗 Open Google Cloud Console
                </a>
                <a
                  href="VIDEO_SETUP_GUIDE.md"
                  target="_blank"
                  className="btn btn-link"
                >
                  📹 View Video Guide
                </a>
              </div>

              <div className="step-validation">
                <button
                  className="btn btn-primary"
                  onClick={() => handleValidateStep(1)}
                  disabled={stepStatuses[1].validating}
                >
                  {stepStatuses[1].validating ? '⏳ Checking...' : '✓ Validate'}
                </button>
              </div>

              {stepStatuses[1].completed && (
                <div className="alert alert-success">✅ Client ID detected in manifest.json</div>
              )}
              {stepStatuses[1].error && (
                <div className="alert alert-error">❌ {stepStatuses[1].error}</div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="wizard-step">
            <h3 className="step-title">🔍 Step 2: Validate Client ID</h3>
            <p className="step-description">
              Verify your Client ID is properly configured with Google Cloud Console.
            </p>
            <div className="step-content">
              <div className="info-box">
                <strong>Current Client ID:</strong>
                <code style={{ display: 'block', marginTop: '10px', fontSize: '12px' }}>
                  {GoogleDriveService.getClientId() || 'Not configured'}
                </code>
              </div>

              <p style={{ marginTop: '15px' }}>
                This will test your Client ID with Google's API to ensure it's valid and properly
                configured.
              </p>

              <div className="step-validation">
                <button
                  className="btn btn-primary"
                  onClick={() => handleValidateStep(2)}
                  disabled={stepStatuses[2].validating}
                >
                  {stepStatuses[2].validating ? '⏳ Validating...' : '✓ Validate Client ID'}
                </button>
              </div>

              {stepStatuses[2].completed && (
                <div className="alert alert-success">
                  ✅ Client ID is valid and properly configured!
                </div>
              )}
              {stepStatuses[2].error && (
                <div className="alert alert-error">
                  ❌ {stepStatuses[2].error}
                  <p style={{ marginTop: '10px', fontSize: '14px' }}>
                    Please check your Client ID in manifest.json and ensure it matches the one in
                    Google Cloud Console.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="wizard-step">
            <h3 className="step-title">🔐 Step 3: Verify Scopes</h3>
            <p className="step-description">
              Check that all required OAuth scopes are configured in your manifest.json.
            </p>
            <div className="step-content">
              <p>Required scopes:</p>
              <ul className="scope-list">
                <li>✓ drive.file - Create and access Drive files</li>
                <li>✓ documents - Create and edit Google Docs</li>
                <li>✓ spreadsheets - Create and edit Google Sheets</li>
                <li>✓ presentations - Create and edit Google Slides</li>
              </ul>

              <div className="step-validation">
                <button
                  className="btn btn-primary"
                  onClick={() => handleValidateStep(3)}
                  disabled={stepStatuses[3].validating}
                >
                  {stepStatuses[3].validating ? '⏳ Checking...' : '✓ Verify Scopes'}
                </button>
              </div>

              {stepStatuses[3].completed && (
                <div className="alert alert-success">✅ All required scopes are configured!</div>
              )}
              {stepStatuses[3].error && (
                <div className="alert alert-error">❌ {stepStatuses[3].error}</div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="wizard-step">
            <h3 className="step-title">🔑 Step 4: Authenticate</h3>
            <p className="step-description">Sign in with your Google account to test authentication.</p>
            <div className="step-content">
              <p>
                This will open a Google sign-in window. Please grant the requested permissions to
                continue.
              </p>

              <div className="step-validation">
                <button
                  className="btn btn-primary btn-large"
                  onClick={() => handleValidateStep(4)}
                  disabled={stepStatuses[4].validating}
                >
                  {stepStatuses[4].validating ? '⏳ Authenticating...' : '🔑 Sign in with Google'}
                </button>
              </div>

              {stepStatuses[4].completed && (
                <div className="alert alert-success">
                  ✅ Successfully authenticated! Your Google account is now connected.
                </div>
              )}
              {stepStatuses[4].error && (
                <div className="alert alert-error">
                  ❌ Authentication failed: {stepStatuses[4].error}
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="wizard-step">
            <h3 className="step-title">✅ Step 5: Test Connection</h3>
            <p className="step-description">Verify everything is working correctly.</p>
            <div className="step-content">
              <p>This will test your connection to Google Drive and verify API access.</p>

              <div className="step-validation">
                <button
                  className="btn btn-primary"
                  onClick={() => handleValidateStep(5)}
                  disabled={stepStatuses[5].validating}
                >
                  {stepStatuses[5].validating ? '⏳ Testing...' : '✓ Test Connection'}
                </button>
              </div>

              {stepStatuses[5].completed && (
                <div className="alert alert-success">
                  <h4 style={{ marginBottom: '10px' }}>🎉 Setup Complete!</h4>
                  <p>Your Google Drive integration is fully configured and working.</p>
                  <p style={{ marginTop: '10px' }}>You can now:</p>
                  <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                    <li>Export CVs to Google Docs</li>
                    <li>Create spreadsheets from CV data</li>
                    <li>Generate presentations</li>
                    <li>Manage files in Google Drive</li>
                  </ul>
                </div>
              )}
              {stepStatuses[5].error && (
                <div className="alert alert-warning">
                  ⚠️ Connection test issues: {stepStatuses[5].error}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="setup-wizard-container">
      <div className="wizard-header">
        <h2 className="wizard-title">🚀 Google Drive Setup Wizard</h2>
        <p className="wizard-subtitle">
          Follow these steps to configure your Google Drive integration
        </p>
      </div>

      {/* Progress Bar */}
      <div className="wizard-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          ></div>
        </div>
        <div className="progress-steps">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`progress-step ${currentStep === step ? 'active' : ''} ${
                stepStatuses[step as WizardStep].completed ? 'completed' : ''
              }`}
            >
              {stepStatuses[step as WizardStep].completed ? '✓' : step}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="wizard-content">{renderStepContent()}</div>

      {/* Navigation */}
      <div className="wizard-navigation">
        <button className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <div className="nav-buttons">
          <button
            className="btn btn-secondary"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            ← Back
          </button>
          {currentStep < 5 ? (
            <button
              className="btn btn-primary"
              onClick={handleNext}
              disabled={!stepStatuses[currentStep].completed}
            >
              Next →
            </button>
          ) : (
            <button
              className="btn btn-success"
              onClick={onComplete}
              disabled={!stepStatuses[5].completed}
            >
              ✓ Finish
            </button>
          )}
        </div>
      </div>

      <style>{`
        .setup-wizard-container {
          max-width: 700px;
          margin: 0 auto;
          padding: 20px;
        }

        .wizard-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .wizard-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .wizard-subtitle {
          color: #666;
          font-size: 14px;
        }

        .wizard-progress {
          margin-bottom: 40px;
        }

        .progress-bar {
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 15px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4285f4 0%, #34a853 100%);
          transition: width 0.3s ease;
        }

        .progress-steps {
          display: flex;
          justify-content: space-between;
          padding: 0 5px;
        }

        .progress-step {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e0e0e0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .progress-step.active {
          background: #4285f4;
          color: white;
          transform: scale(1.1);
        }

        .progress-step.completed {
          background: #34a853;
          color: white;
        }

        .wizard-content {
          background: #f9f9f9;
          border-radius: 8px;
          padding: 30px;
          min-height: 400px;
          margin-bottom: 20px;
        }

        .wizard-step {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .step-title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .step-description {
          color: #666;
          margin-bottom: 20px;
        }

        .step-instructions {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }

        .step-instructions li {
          margin-bottom: 10px;
          padding-left: 10px;
        }

        .step-actions {
          display: flex;
          gap: 10px;
          margin: 20px 0;
        }

        .step-validation {
          margin: 20px 0;
        }

        .info-box {
          background: white;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }

        .scope-list {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin: 15px 0;
        }

        .scope-list li {
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .scope-list li:last-child {
          border-bottom: none;
        }

        .wizard-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }

        .nav-buttons {
          display: flex;
          gap: 10px;
        }

        .btn-large {
          padding: 12px 24px;
          font-size: 16px;
        }

        .alert {
          padding: 15px;
          border-radius: 8px;
          margin-top: 15px;
        }

        .alert-success {
          background: #e8f5e9;
          border: 1px solid #4caf50;
          color: #2e7d32;
        }

        .alert-error {
          background: #ffebee;
          border: 1px solid #f44336;
          color: #c62828;
        }

        .alert-warning {
          background: #fff3e0;
          border: 1px solid #ff9800;
          color: #e65100;
        }
      `}</style>
    </div>
  );
};
