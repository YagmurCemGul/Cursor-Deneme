import React, { useState } from 'react';
import { Button } from './ui';
import {
  enhanceDescription,
  EnhancementOptions,
  EnhancementResult,
  suggestActionVerbs,
  detectWeakPhrases,
  improveWithActionVerb,
  ACTION_VERBS,
} from '../lib/aiEnhancer';

interface DescriptionEnhancerProps {
  description: string;
  context: {
    type: 'experience' | 'project' | 'education' | 'summary';
    title?: string;
    company?: string;
    role?: string;
  };
  onApply: (enhanced: string) => void;
  onClose: () => void;
}

export function DescriptionEnhancer({
  description,
  context,
  onApply,
  onClose,
}: DescriptionEnhancerProps) {
  const [options, setOptions] = useState<EnhancementOptions>({
    tone: 'professional',
    length: 'detailed',
    focus: 'achievements',
    includeMetrics: true,
  });
  const [result, setResult] = useState<EnhancementResult | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState('');
  const [showActionVerbs, setShowActionVerbs] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  const suggestedVerbs = suggestActionVerbs(description);
  const weakPhrases = detectWeakPhrases(description);

  async function handleEnhance() {
    setIsEnhancing(true);
    setError('');
    
    try {
      const enhanced = await enhanceDescription(description, context, options);
      setResult(enhanced);
    } catch (err: any) {
      setError(err.message || 'Failed to enhance description');
    } finally {
      setIsEnhancing(false);
    }
  }

  async function handleApplyVerb(verb: string) {
    if (!selectedText) {
      // Apply to first sentence
      const improved = await improveWithActionVerb(description, verb);
      onApply(improved);
      onClose();
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20,
    }}>
      <div style={{
        background: 'white',
        borderRadius: 16,
        maxWidth: 900,
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, color: '#1e293b' }}>
              ✨ AI Description Enhancer
            </h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>
              Transform your description into an ATS-optimized, impactful statement
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 8,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 32 }}>
          {/* Original Text */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
              Original Description
            </div>
            <div style={{
              padding: 16,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 14,
              color: '#475569',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
            }}>
              {description || 'No description provided'}
            </div>

            {/* Weak Phrases Detection */}
            {weakPhrases.length > 0 && (
              <div style={{
                marginTop: 12,
                padding: 12,
                background: '#fef3c7',
                border: '1px solid #fbbf24',
                borderRadius: 8,
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>
                  ⚠️ Weak Phrases Detected
                </div>
                {weakPhrases.map((item, i) => (
                  <div key={i} style={{ fontSize: 12, color: '#92400e', marginBottom: 4 }}>
                    • "<strong>{item.phrase}</strong>" → Try: {item.suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enhancement Options */}
          {!result && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>
                Enhancement Options
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {/* Tone */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6 }}>
                    Tone
                  </label>
                  <select
                    value={options.tone}
                    onChange={(e) => setOptions({ ...options, tone: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  >
                    <option value="professional">Professional</option>
                    <option value="technical">Technical</option>
                    <option value="executive">Executive</option>
                    <option value="friendly">Friendly</option>
                  </select>
                </div>

                {/* Length */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6 }}>
                    Length
                  </label>
                  <select
                    value={options.length}
                    onChange={(e) => setOptions({ ...options, length: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  >
                    <option value="concise">Concise (2-3 points)</option>
                    <option value="detailed">Detailed (3-5 points)</option>
                    <option value="extensive">Extensive (5-7 points)</option>
                  </select>
                </div>

                {/* Focus */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6 }}>
                    Focus
                  </label>
                  <select
                    value={options.focus}
                    onChange={(e) => setOptions({ ...options, focus: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  >
                    <option value="achievements">Achievements</option>
                    <option value="responsibilities">Responsibilities</option>
                    <option value="skills">Skills</option>
                    <option value="impact">Impact</option>
                  </select>
                </div>

                {/* Include Metrics */}
                <div style={{ display: 'flex', alignItems: 'center', paddingTop: 24 }}>
                  <input
                    type="checkbox"
                    id="includeMetrics"
                    checked={options.includeMetrics}
                    onChange={(e) => setOptions({ ...options, includeMetrics: e.target.checked })}
                    style={{ marginRight: 8 }}
                  />
                  <label htmlFor="includeMetrics" style={{ fontSize: 13, color: '#64748b', cursor: 'pointer' }}>
                    Include quantifiable metrics
                  </label>
                </div>
              </div>

              {/* Enhance Button */}
              <Button
                variant="primary"
                onClick={handleEnhance}
                disabled={isEnhancing || !description}
                style={{ marginTop: 16, width: '100%' }}
              >
                {isEnhancing ? '✨ Enhancing...' : '✨ Enhance with AI'}
              </Button>

              {error && (
                <div style={{
                  marginTop: 12,
                  padding: 12,
                  background: '#fef2f2',
                  border: '1px solid #fca5a5',
                  borderRadius: 8,
                  color: '#dc2626',
                  fontSize: 13,
                }}>
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Action Verb Suggestions */}
          {suggestedVerbs.length > 0 && !result && (
            <div style={{ marginBottom: 24 }}>
              <button
                onClick={() => setShowActionVerbs(!showActionVerbs)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#1e293b',
                  width: '100%',
                  justifyContent: 'space-between',
                }}
              >
                <span>💡 Suggested Action Verbs ({suggestedVerbs.length})</span>
                <span>{showActionVerbs ? '▲' : '▼'}</span>
              </button>

              {showActionVerbs && (
                <div style={{
                  marginTop: 12,
                  padding: 16,
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {suggestedVerbs.map((verb, i) => (
                      <button
                        key={i}
                        onClick={() => handleApplyVerb(verb)}
                        style={{
                          padding: '6px 14px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: 500,
                          transition: 'transform 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        {verb}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Enhanced Result */}
          {result && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
                Enhanced Description ✨
              </div>
              <div style={{
                padding: 16,
                background: 'linear-gradient(135deg, #f0f9ff 0%, #f0fdf4 100%)',
                border: '2px solid #667eea',
                borderRadius: 8,
                fontSize: 14,
                color: '#1e293b',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.8,
              }}>
                {result.enhanced}
              </div>

              {/* Improvements */}
              {result.improvements.length > 0 && (
                <div style={{
                  marginTop: 12,
                  padding: 12,
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: 8,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#166534', marginBottom: 6 }}>
                    Improvements Made:
                  </div>
                  {result.improvements.map((improvement, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#166534', marginBottom: 2 }}>
                      {improvement}
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions.length > 0 && (
                <div style={{
                  marginTop: 12,
                  padding: 12,
                  background: '#f0f9ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 8,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1e40af', marginBottom: 6 }}>
                    💡 Additional Suggestions:
                  </div>
                  {result.suggestions.map((suggestion, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#1e40af', marginBottom: 2 }}>
                      • {suggestion}
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <Button
                  variant="primary"
                  onClick={() => {
                    onApply(result.enhanced);
                    onClose();
                  }}
                  style={{ flex: 1 }}
                >
                  ✅ Apply Enhanced Version
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setResult(null)}
                  style={{ flex: 1 }}
                >
                  🔄 Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Action Verb Reference */}
          <div style={{
            marginTop: 24,
            padding: 16,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>
              📚 Action Verb Categories
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {Object.entries(ACTION_VERBS).map(([category, verbs]) => (
                <div key={category}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#667eea', marginBottom: 4, textTransform: 'capitalize' }}>
                    {category}:
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {verbs.slice(0, 5).join(', ')}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
