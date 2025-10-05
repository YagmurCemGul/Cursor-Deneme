/**
 * Onboarding Wizard
 * Guide users through app features
 */

import React, { useState, useEffect } from 'react';
import { OnboardingManager, type OnboardingStep, type OnboardingFlow } from '../lib/onboarding';

interface OnboardingWizardProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [manager] = useState(() => OnboardingManager.getInstance());
  const [flow, setFlow] = useState<OnboardingFlow | null>(null);
  const [step, setStep] = useState<OnboardingStep | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await manager.initialize();
      const activeFlow = manager.getActiveFlow();
      const currentStep = manager.getCurrentStep();
      setFlow(activeFlow);
      setStep(currentStep);
      setLoading(false);
    };
    init();
  }, [manager]);

  const handleNext = async () => {
    if (!step) return;
    await manager.completeStep(step.id);
    const nextStep = manager.getCurrentStep();
    setStep(nextStep);
    
    if (!nextStep) {
      if (onComplete) onComplete();
    }
  };

  const handleSkip = async () => {
    if (!step) return;
    await manager.skipStep(step.id);
    const nextStep = manager.getCurrentStep();
    setStep(nextStep);
    
    if (!nextStep) {
      if (onComplete) onComplete();
    }
  };

  const handleSkipAll = async () => {
    if (!flow) return;
    await manager.skipFlow(flow.id);
    if (onSkip) onSkip();
  };

  if (loading || !flow || !step) {
    return null;
  }

  const progress = ((flow.currentStep + 1) / flow.steps.length) * 100;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: 20
    }}>
      <div style={{
        background: 'white',
        borderRadius: 16,
        maxWidth: 600,
        width: '100%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: 24,
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>
                STEP {flow.currentStep + 1} OF {flow.steps.length}
              </div>
              <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
                {step.title}
              </h3>
            </div>
            <button
              onClick={handleSkipAll}
              style={{
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: 6,
                color: 'white',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Skip Tour
            </button>
          </div>
          
          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: 4,
            background: 'rgba(255,255,255,0.3)',
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'white',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: 32 }}>
          <div style={{
            fontSize: 72,
            textAlign: 'center',
            marginBottom: 24
          }}>
            {getStepIcon(step.id)}
          </div>
          
          <p style={{
            margin: '0 0 32px',
            fontSize: 16,
            color: '#64748b',
            lineHeight: 1.6,
            textAlign: 'center'
          }}>
            {step.description}
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleSkip}
              style={{
                flex: 1,
                padding: '14px 24px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                color: '#64748b',
                cursor: 'pointer'
              }}
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              style={{
                flex: 2,
                padding: '14px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                color: 'white',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
            >
              {flow.currentStep === flow.steps.length - 1 ? '🎉 Finish' : step.action || 'Next →'}
            </button>
          </div>

          {/* Step Indicators */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
            marginTop: 24
          }}>
            {flow.steps.map((s, i) => (
              <div
                key={s.id}
                style={{
                  width: i === flow.currentStep ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i <= flow.currentStep ? '#667eea' : '#e5e7eb',
                  transition: 'all 0.3s'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getStepIcon(stepId: string): string {
  const icons: Record<string, string> = {
    'welcome': '🎉',
    'fill-profile': '📝',
    'add-job': '💼',
    'generate-resume': '🚀',
    'explore-features': '✨',
    'setup-profile': '👤',
    'job-tracker': '📊',
    'ai-coach': '💬',
    'interview-prep': '🎤',
    'career-analysis': '🎯',
    'skill-gaps': '📚',
    'career-paths': '🛤️',
    'learning-plan': '📖'
  };
  return icons[stepId] || '⭐';
}
