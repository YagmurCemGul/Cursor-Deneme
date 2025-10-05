import React, { useState } from 'react';
import { Button } from './ui';
import {
  COVER_LETTER_TEMPLATES,
  CoverLetterTemplate,
  generateFromTemplate,
  getTemplateRecommendation,
} from '../lib/coverLetterTemplates';
import { ResumeProfile, JobPost } from '../lib/types';

interface CoverLetterBuilderProps {
  profile: ResumeProfile;
  job: JobPost;
  onGenerate: (coverLetter: string) => void;
  onClose: () => void;
}

export function CoverLetterBuilder({ profile, job, onGenerate, onClose }: CoverLetterBuilderProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<CoverLetterTemplate>(
    getTemplateRecommendation(job.pastedText, profile)
  );
  const [customization, setCustomization] = useState({
    companyName: job.company || '',
    hiringManager: 'Hiring Manager',
    referralName: '',
    specificInterest: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  async function handleGenerate() {
    setIsGenerating(true);
    
    try {
      const coverLetter = await generateFromTemplate(
        selectedTemplate,
        profile,
        job,
        customization
      );
      
      setPreview(coverLetter);
      setShowPreview(true);
    } catch (error: any) {
      console.error('Cover letter generation error:', error);
      alert(error.message || 'Failed to generate cover letter');
    } finally {
      setIsGenerating(false);
    }
  }

  function handleApply() {
    onGenerate(preview);
    onClose();
  }

  const recommendedTemplate = getTemplateRecommendation(job.pastedText, profile);

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
        maxWidth: 1000,
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
              ✉️ Cover Letter Builder
            </h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>
              Choose a template and customize your cover letter
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
          {!showPreview ? (
            <>
              {/* Template Selection */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>
                    Choose Template
                  </div>
                  {recommendedTemplate.id !== selectedTemplate.id && (
                    <div style={{
                      padding: '6px 12px',
                      background: '#fef3c7',
                      border: '1px solid #fbbf24',
                      borderRadius: 6,
                      fontSize: 12,
                      color: '#92400e',
                    }}>
                      💡 Recommended: {recommendedTemplate.name}
                    </div>
                  )}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: 12,
                }}>
                  {COVER_LETTER_TEMPLATES.map(template => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      style={{
                        padding: 16,
                        background: selectedTemplate.id === template.id
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : 'white',
                        color: selectedTemplate.id === template.id ? 'white' : '#1e293b',
                        border: `2px solid ${selectedTemplate.id === template.id ? '#667eea' : '#e2e8f0'}`,
                        borderRadius: 10,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedTemplate.id !== template.id) {
                          e.currentTarget.style.borderColor = '#667eea';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedTemplate.id !== template.id) {
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      {recommendedTemplate.id === template.id && (
                        <div style={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          background: '#fbbf24',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: 12,
                          fontSize: 10,
                          fontWeight: 700,
                        }}>
                          RECOMMENDED
                        </div>
                      )}
                      <div style={{ fontSize: 32, marginBottom: 8 }}>{template.icon}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                        {template.name}
                      </div>
                      <div style={{
                        fontSize: 11,
                        opacity: selectedTemplate.id === template.id ? 0.9 : 0.6,
                        marginBottom: 8,
                      }}>
                        {template.description}
                      </div>
                      <div style={{
                        fontSize: 10,
                        opacity: selectedTemplate.id === template.id ? 0.8 : 0.5,
                      }}>
                        {template.useCase}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Customization Fields */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>
                  Customize Details
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6 }}>
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={customization.companyName}
                      onChange={(e) => setCustomization({ ...customization, companyName: e.target.value })}
                      placeholder="e.g., Google, Microsoft"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: 8,
                        fontSize: 14,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6 }}>
                      Hiring Manager Name
                    </label>
                    <input
                      type="text"
                      value={customization.hiringManager}
                      onChange={(e) => setCustomization({ ...customization, hiringManager: e.target.value })}
                      placeholder="e.g., John Smith"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: 8,
                        fontSize: 14,
                      }}
                    />
                  </div>

                  {selectedTemplate.id === 'referral-based' && (
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6 }}>
                        Referral Name
                      </label>
                      <input
                        type="text"
                        value={customization.referralName}
                        onChange={(e) => setCustomization({ ...customization, referralName: e.target.value })}
                        placeholder="e.g., Jane Doe"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #cbd5e1',
                          borderRadius: 8,
                          fontSize: 14,
                        }}
                      />
                    </div>
                  )}

                  <div style={{ gridColumn: selectedTemplate.id === 'referral-based' ? 'auto' : 'span 2' }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6 }}>
                      Specific Interest (Optional)
                    </label>
                    <input
                      type="text"
                      value={customization.specificInterest}
                      onChange={(e) => setCustomization({ ...customization, specificInterest: e.target.value })}
                      placeholder="e.g., AI-powered products, sustainable tech, remote-first culture"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: 8,
                        fontSize: 14,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div style={{
                padding: 16,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                marginBottom: 24,
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
                  📋 {selectedTemplate.name} Template
                </div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
                  {selectedTemplate.description}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '4px 10px',
                    background: '#e0e7ff',
                    color: '#4f46e5',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 500,
                  }}>
                    {selectedTemplate.tone} tone
                  </span>
                  <span style={{
                    padding: '4px 10px',
                    background: '#f0fdf4',
                    color: '#16a34a',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 500,
                  }}>
                    {selectedTemplate.structure.body.length} paragraphs
                  </span>
                  <span style={{
                    padding: '4px 10px',
                    background: '#fef3c7',
                    color: '#92400e',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 500,
                  }}>
                    {selectedTemplate.category}
                  </span>
                </div>
              </div>

              {/* Generate Button */}
              <Button
                variant="primary"
                onClick={handleGenerate}
                disabled={isGenerating || !customization.companyName}
                style={{ width: '100%' }}
              >
                {isGenerating ? '✨ Generating...' : '✨ Generate Cover Letter'}
              </Button>
            </>
          ) : (
            <>
              {/* Preview */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>
                  Cover Letter Preview
                </div>
                <div style={{
                  padding: 24,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  fontSize: 14,
                  lineHeight: 1.8,
                  color: '#1e293b',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'Georgia, serif',
                  maxHeight: 500,
                  overflow: 'auto',
                }}>
                  {preview}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12 }}>
                <Button
                  variant="ghost"
                  onClick={() => setShowPreview(false)}
                  style={{ flex: 1 }}
                >
                  ← Back to Edit
                </Button>
                <Button
                  variant="primary"
                  onClick={handleApply}
                  style={{ flex: 1 }}
                >
                  ✅ Use This Cover Letter
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
