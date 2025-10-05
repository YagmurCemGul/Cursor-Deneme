/**
 * Salary Negotiation UI
 * Research, strategy, and email templates
 */

import React, { useState } from 'react';
import type { ResumeProfile, JobPost } from '../lib/types';
import {
  researchSalary,
  generateNegotiationStrategy,
  generateNegotiationEmail,
  type SalaryResearch,
  type NegotiationStrategy
} from '../lib/salaryNegotiation';

interface SalaryNegotiationUIProps {
  profile: ResumeProfile;
  job: JobPost;
}

export function SalaryNegotiationUI({ profile, job }: SalaryNegotiationUIProps) {
  const [step, setStep] = useState<'research' | 'strategy' | 'email'>('research');
  const [research, setResearch] = useState<SalaryResearch | null>(null);
  const [strategy, setStrategy] = useState<NegotiationStrategy | null>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState('');
  const [currentSalary, setCurrentSalary] = useState('');
  const [offeredSalary, setOfferedSalary] = useState('');
  const [emailScenario, setEmailScenario] = useState<string>('counter-offer');
  const [generatedEmail, setGeneratedEmail] = useState('');

  const handleResearch = async () => {
    setLoading(true);
    try {
      const result = await researchSalary(profile, job, location || 'United States');
      setResearch(result);
      setStep('strategy');
    } catch (error) {
      console.error('Research error:', error);
      alert('Failed to research salary');
    }
    setLoading(false);
  };

  const handleStrategy = async () => {
    if (!research) return;
    setLoading(true);
    try {
      const result = await generateNegotiationStrategy(
        profile,
        job,
        research,
        currentSalary ? parseInt(currentSalary) : undefined
      );
      setStrategy(result);
    } catch (error) {
      console.error('Strategy error:', error);
      alert('Failed to generate strategy');
    }
    setLoading(false);
  };

  const handleGenerateEmail = async () => {
    if (!strategy) return;
    setLoading(true);
    try {
      const result = await generateNegotiationEmail(emailScenario, {
        jobTitle: job.title,
        companyName: job.company,
        currentOffer: offeredSalary ? parseInt(offeredSalary) : undefined,
        targetSalary: strategy.negotiationScript.targetSalary,
        marketRange: `$${research?.salaryRange.min.toLocaleString()} - $${research?.salaryRange.max.toLocaleString()}`,
        strengths: strategy.strengths.slice(0, 3)
      });
      setGeneratedEmail(result);
    } catch (error) {
      console.error('Email generation error:', error);
      alert('Failed to generate email');
    }
    setLoading(false);
  };

  if (step === 'research') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: 12,
          padding: 32,
          color: 'white'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💰</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 28 }}>Salary Negotiation</h2>
          <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>
            Research market rates and build a winning negotiation strategy
          </p>
        </div>

        {!research ? (
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 32,
            border: '2px solid #e5e7eb'
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 20, color: '#1e293b' }}>
              Step 1: Market Research
            </h3>
            <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: 14 }}>
              Let's research the market salary for <strong>{job.title}</strong>
            </p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                Location (Optional)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., San Francisco, New York, Remote"
                style={{
                  width: '100%',
                  padding: 12,
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 14
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                Current Salary (Optional)
              </label>
              <input
                type="number"
                value={currentSalary}
                onChange={(e) => setCurrentSalary(e.target.value)}
                placeholder="e.g., 120000"
                style={{
                  width: '100%',
                  padding: 12,
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 14
                }}
              />
            </div>

            <button
              onClick={handleResearch}
              disabled={loading}
              style={{
                padding: '14px 28px',
                background: loading ? '#94a3b8' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '⏳ Researching...' : '🔍 Research Market Rates'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Salary Range */}
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              borderRadius: 12,
              padding: 24,
              border: '2px solid #10b981'
            }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 18, color: '#1e293b' }}>
                💵 Market Salary Range
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
                <SalaryCard label="Minimum" value={research.salaryRange.min} color="#f59e0b" />
                <SalaryCard label="Median" value={research.salaryRange.median} color="#10b981" />
                <SalaryCard label="Maximum" value={research.salaryRange.max} color="#3b82f6" />
              </div>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                Based on: {research.factors.join(' • ')}
              </div>
            </div>

            {/* Recommendations */}
            <div style={{
              background: 'white',
              borderRadius: 12,
              padding: 24,
              border: '2px solid #e5e7eb'
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 18, color: '#1e293b' }}>
                🎯 Target Recommendations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {research.recommendations.map((rec, i) => (
                  <div key={i} style={{
                    padding: 16,
                    background: '#f8fafc',
                    borderRadius: 8,
                    fontSize: 14,
                    color: '#1e293b'
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{rec.title}</div>
                    <div style={{ color: '#64748b', fontSize: 13 }}>{rec.description}</div>
                    {rec.value && (
                      <div style={{
                        marginTop: 8,
                        fontSize: 20,
                        fontWeight: 700,
                        color: '#10b981'
                      }}>
                        ${rec.value.toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleStrategy}
                disabled={loading}
                style={{
                  padding: '14px 28px',
                  background: loading ? '#94a3b8' : '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '⏳ Generating...' : '→ Generate Strategy'}
              </button>
              <button
                onClick={() => {
                  setResearch(null);
                  setStrategy(null);
                }}
                style={{
                  padding: '14px 28px',
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                🔄 New Research
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (step === 'strategy') {
    if (!strategy) {
      handleStrategy();
      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
          <div style={{ fontSize: 18, color: '#64748b' }}>Generating negotiation strategy...</div>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setStep('research')}
            style={{
              padding: '8px 16px',
              background: '#f1f5f9',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500
            }}
          >
            ← Back to Research
          </button>
          <button
            onClick={() => setStep('email')}
            style={{
              padding: '8px 16px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600
            }}
          >
            → Generate Email
          </button>
        </div>

        {/* Strategy Overview */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 12,
          padding: 24,
          color: 'white'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 20 }}>🎯 Your Negotiation Strategy</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>TARGET SALARY</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>
                ${strategy.negotiationScript.targetSalary.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>WALK-AWAY POINT</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>
                ${strategy.negotiationScript.walkAwayPoint.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>JUSTIFICATION</div>
              <div style={{ fontSize: 14, marginTop: 8 }}>
                {strategy.negotiationScript.justification.slice(0, 60)}...
              </div>
            </div>
          </div>
        </div>

        {/* Strengths */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          border: '2px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 18, color: '#1e293b' }}>💪 Your Leverage Points</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
            {strategy.strengths.map((strength, i) => (
              <div key={i} style={{
                padding: 12,
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 8,
                fontSize: 13,
                color: '#166534'
              }}>
                ✓ {strength}
              </div>
            ))}
          </div>
        </div>

        {/* Phases */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          border: '2px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 18, color: '#1e293b' }}>📋 Negotiation Phases</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {strategy.phases.map((phase, i) => (
              <div key={i} style={{
                padding: 20,
                background: '#f8fafc',
                borderRadius: 8,
                borderLeft: '4px solid #667eea'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#667eea',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700
                  }}>
                    {i + 1}
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#1e293b' }}>{phase.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{phase.timing}</div>
                  </div>
                </div>
                <div style={{ fontSize: 14, color: '#64748b', marginBottom: 12 }}>
                  {phase.description}
                </div>
                <div style={{ fontSize: 13, color: '#1e293b' }}>
                  <strong>Key Actions:</strong>
                  <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                    {phase.tactics.slice(0, 3).map((tactic, j) => (
                      <li key={j} style={{ marginBottom: 4 }}>{tactic}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Common Mistakes */}
        <div style={{
          background: '#fef2f2',
          borderRadius: 12,
          padding: 24,
          border: '2px solid #fecaca'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 18, color: '#1e293b' }}>⚠️ Avoid These Mistakes</h3>
          <ul style={{ margin: 0, paddingLeft: 20, color: '#991b1b' }}>
            {strategy.commonMistakes.map((mistake, i) => (
              <li key={i} style={{ marginBottom: 8, fontSize: 14 }}>{mistake}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // Email generation step
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Navigation */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => setStep('strategy')}
          style={{
            padding: '8px 16px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500
          }}
        >
          ← Back to Strategy
        </button>
      </div>

      {/* Email Generator */}
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: 24,
        border: '2px solid #e5e7eb'
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 18, color: '#1e293b' }}>📧 Generate Negotiation Email</h3>
        
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
            Email Type
          </label>
          <select
            value={emailScenario}
            onChange={(e) => setEmailScenario(e.target.value)}
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 14
            }}
          >
            <option value="counter-offer">Counter-Offer</option>
            <option value="request-time">Request More Time</option>
            <option value="accept-negotiate-benefits">Accept with Benefit Negotiation</option>
            <option value="decline-politely">Decline Politely</option>
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
            Offered Salary (Optional)
          </label>
          <input
            type="number"
            value={offeredSalary}
            onChange={(e) => setOfferedSalary(e.target.value)}
            placeholder="e.g., 140000"
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 14
            }}
          />
        </div>

        <button
          onClick={handleGenerateEmail}
          disabled={loading}
          style={{
            padding: '12px 24px',
            background: loading ? '#94a3b8' : '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: 20
          }}
        >
          {loading ? '⏳ Generating...' : '✨ Generate Email'}
        </button>

        {generatedEmail && (
          <div style={{
            padding: 20,
            background: '#f8fafc',
            borderRadius: 8,
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>Generated Email:</div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedEmail);
                  alert('Copied to clipboard!');
                }}
                style={{
                  padding: '6px 12px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                📋 Copy
              </button>
            </div>
            <pre style={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              fontSize: 13,
              color: '#1e293b',
              lineHeight: 1.6,
              margin: 0
            }}>
              {generatedEmail}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

function SalaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      padding: 20,
      background: 'white',
      borderRadius: 10,
      textAlign: 'center'
    }}>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>${value.toLocaleString()}</div>
    </div>
  );
}
