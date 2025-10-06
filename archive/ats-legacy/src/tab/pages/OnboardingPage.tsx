import { useState } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import { saveSettings } from '../../lib/storage';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [apiKey, setApiKey] = useState('');

  async function handleComplete() {
    await saveSettings({ apiKey, model: 'gpt-4o-mini', language: 'en', encryptionEnabled: false });
    window.location.hash = '/';
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        padding: '3rem',
        boxShadow: 'var(--shadow-xl)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🦉</div>
          <h1 style={{ marginBottom: '0.5rem' }}>Welcome to Job ATS Assistant</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 0 }}>
            Let's get you set up in a few simple steps
          </p>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              style={{
                flex: 1,
                height: '4px',
                background: i <= step ? 'var(--color-primary)' : 'var(--color-border)',
                borderRadius: '2px',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        {/* Steps */}
        {step === 1 && (
          <div>
            <h2>What is Job ATS Assistant?</h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              A powerful Chrome extension that helps you:
            </p>
            <ul style={{ marginBottom: '2rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>✅ Auto-fill job application forms</li>
              <li style={{ marginBottom: '0.5rem' }}>📊 Calculate ATS match scores</li>
              <li style={{ marginBottom: '0.5rem' }}>✍️ Generate cover letters with AI</li>
              <li style={{ marginBottom: '0.5rem' }}>📋 Track your applications</li>
            </ul>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setStep(2)}>
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2>Set up OpenAI API</h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              To enable AI features, you need an OpenAI API key.
            </p>

            <div className="form-group">
              <label className="form-label">OpenAI API Key</label>
              <input
                type="password"
                className="form-input"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <span className="form-hint">
                Get your key at{' '}
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                  platform.openai.com/api-keys
                </a>
              </span>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => setStep(3)}
                disabled={!apiKey}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'rgba(79, 70, 229, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}>
                <Check size={40} color="var(--color-primary)" />
              </div>
              <h2>You're All Set!</h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Start by setting up your profile, then navigate to any job posting to try autofill.
              </p>
            </div>

            <div style={{ background: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>Quick Tips:</h4>
              <ul style={{ fontSize: '0.875rem', margin: 0, paddingLeft: '1.25rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Use <kbd>Ctrl+Shift+A</kbd> to autofill forms</li>
                <li style={{ marginBottom: '0.5rem' }}>Use <kbd>Ctrl+Shift+M</kbd> to check ATS score</li>
                <li style={{ marginBottom: '0.5rem' }}>Use <kbd>Ctrl+Shift+L</kbd> to open side panel</li>
              </ul>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleComplete}>
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
