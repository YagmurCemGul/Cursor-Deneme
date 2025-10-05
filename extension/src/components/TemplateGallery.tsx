import React, { useState } from 'react';
import { DEFAULT_TEMPLATES, TemplateType, TemplateColors, TemplateFonts } from '../lib/templates';
import { Button } from './ui';

interface TemplateGalleryProps {
  currentTemplate: TemplateType;
  onSelectTemplate: (template: TemplateType) => void;
  onClose: () => void;
  onCustomize?: (colors: Partial<TemplateColors>, fonts: Partial<TemplateFonts>) => void;
}

export function TemplateGallery({ currentTemplate, onSelectTemplate, onClose, onCustomize }: TemplateGalleryProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>(currentTemplate);
  const [showCustomization, setShowCustomization] = useState(false);
  
  const template = DEFAULT_TEMPLATES[selectedTemplate];
  const [customColors, setCustomColors] = useState(template.colors);

  const handleSelectTemplate = (templateId: TemplateType) => {
    setSelectedTemplate(templateId);
    const newTemplate = DEFAULT_TEMPLATES[templateId];
    setCustomColors(newTemplate.colors);
  };

  const handleApply = () => {
    onSelectTemplate(selectedTemplate);
    if (onCustomize) {
      onCustomize(customColors, {});
    }
    onClose();
  };

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
            <h2 style={{ margin: 0, fontSize: 24, color: '#1e293b' }}>Choose Your Template</h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>
              Select a professional template that matches your style
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

        {/* Templates Grid */}
        <div style={{ padding: 32 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
            marginBottom: 24,
          }}>
            {(Object.keys(DEFAULT_TEMPLATES) as TemplateType[]).map((templateId) => {
              const tmpl = DEFAULT_TEMPLATES[templateId];
              const isSelected = selectedTemplate === templateId;
              const isCurrent = currentTemplate === templateId;

              return (
                <div
                  key={templateId}
                  onClick={() => handleSelectTemplate(templateId)}
                  style={{
                    border: `2px solid ${isSelected ? tmpl.colors.accent : '#e5e7eb'}`,
                    borderRadius: 12,
                    padding: 16,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: isSelected ? `${tmpl.colors.accent}05` : 'white',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = tmpl.colors.accent + '60';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {/* Preview */}
                  <div style={{
                    height: 200,
                    background: `linear-gradient(135deg, ${tmpl.colors.primary}20 0%, ${tmpl.colors.secondary}20 100%)`,
                    borderRadius: 8,
                    marginBottom: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 48,
                  }}>
                    {tmpl.preview}
                  </div>

                  {/* Info */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, color: '#1e293b', fontWeight: 600 }}>
                        {tmpl.name}
                      </h3>
                      {isCurrent && (
                        <span style={{
                          fontSize: 11,
                          background: '#10b981',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: 4,
                          marginLeft: 8,
                        }}>
                          Current
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <span style={{ fontSize: 20 }}>✓</span>
                    )}
                  </div>
                  <p style={{ margin: '4px 0 12px', fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
                    {tmpl.description}
                  </p>

                  {/* Features */}
                  <div style={{ marginBottom: 12 }}>
                    {tmpl.features.map((feature, idx) => (
                      <div key={idx} style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>
                        ✓ {feature}
                      </div>
                    ))}
                  </div>

                  {/* Best For */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {tmpl.bestFor.slice(0, 3).map((use, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: 10,
                          background: `${tmpl.colors.accent}15`,
                          color: tmpl.colors.accent,
                          padding: '2px 8px',
                          borderRadius: 4,
                        }}
                      >
                        {use}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Customization Section */}
          {showCustomization && (
            <div style={{
              background: '#f8fafc',
              padding: 20,
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              marginBottom: 24,
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#1e293b' }}>
                🎨 Customize Colors
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', marginBottom: 4, display: 'block' }}>
                    Primary Color
                  </label>
                  <input
                    type="color"
                    value={customColors.primary}
                    onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                    style={{ width: '100%', height: 40, borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', marginBottom: 4, display: 'block' }}>
                    Accent Color
                  </label>
                  <input
                    type="color"
                    value={customColors.accent}
                    onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                    style={{ width: '100%', height: 40, borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', marginBottom: 4, display: 'block' }}>
                    Text Color
                  </label>
                  <input
                    type="color"
                    value={customColors.text}
                    onChange={(e) => setCustomColors({ ...customColors, text: e.target.value })}
                    style={{ width: '100%', height: 40, borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="ghost"
              onClick={() => setShowCustomization(!showCustomization)}
            >
              {showCustomization ? '🎨 Hide Customization' : '🎨 Customize Colors'}
            </Button>
            <div style={{ display: 'flex', gap: 12 }}>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleApply}>
                Apply Template
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
