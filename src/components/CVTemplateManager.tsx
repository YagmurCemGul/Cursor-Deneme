import React, { useState, useEffect } from 'react';
import { CVTemplateStyle, defaultCVTemplates } from '../data/cvTemplates';
import { StorageService } from '../utils/storage';
import { t, Lang } from '../i18n';

interface CVTemplateManagerProps {
  language: Lang;
  onSelectTemplate: (templateId: string) => void;
  currentTemplateId?: string | undefined;
}

export const CVTemplateManager: React.FC<CVTemplateManagerProps> = ({
  language,
  onSelectTemplate,
  currentTemplateId,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(currentTemplateId || 'classic');
  const [customTemplates, setCustomTemplates] = useState<CVTemplateStyle[]>([]);
  const [previewTemplate, setPreviewTemplate] = useState<CVTemplateStyle | null>(null);

  useEffect(() => {
    loadCustomTemplates();
  }, []);

  const loadCustomTemplates = async () => {
    // Load custom templates from storage
    await StorageService.getTemplates();
    // For now, we'll work with default templates
    setCustomTemplates([]);
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    onSelectTemplate(templateId);
  };

  const handlePreview = (template: CVTemplateStyle) => {
    setPreviewTemplate(template);
  };

  const closePreview = () => {
    setPreviewTemplate(null);
  };

  const allTemplates = [...defaultCVTemplates, ...customTemplates];

  return (
    <div className="section">
      <h2 className="section-title">🎨 {t(language, 'templates.title')}</h2>
      <p className="section-description">{t(language, 'templates.description')}</p>

      <div className="template-grid">
        {allTemplates.map((template) => (
          <div
            key={template.id}
            className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
            onClick={() => handleSelectTemplate(template.id)}
          >
            <div className="template-preview-icon">{template.preview}</div>
            <div className="template-info">
              <h3 className="template-name">{template.name}</h3>
              <p className="template-description">{template.description}</p>
              <div className="template-features">
                {template.features.slice(0, 3).map((feature, idx) => (
                  <span key={idx} className="feature-tag">
                    {feature}
                  </span>
                ))}
              </div>
              <div className="template-actions">
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreview(template);
                  }}
                >
                  👁️ {t(language, 'templates.preview')}
                </button>
                {selectedTemplate === template.id && (
                  <span className="selected-badge">✓ {t(language, 'templates.selected')}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="modal-overlay" onClick={closePreview}>
          <div
            className="modal-content template-preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>{previewTemplate.name}</h3>
              <button className="modal-close" onClick={closePreview}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="template-preview-details">
                <div className="preview-section">
                  <h4>{t(language, 'templates.colors')}</h4>
                  <div className="color-palette">
                    <div
                      className="color-swatch"
                      style={{ backgroundColor: previewTemplate.colors.primary }}
                    >
                      <span>Primary</span>
                    </div>
                    <div
                      className="color-swatch"
                      style={{ backgroundColor: previewTemplate.colors.secondary }}
                    >
                      <span>Secondary</span>
                    </div>
                    <div
                      className="color-swatch"
                      style={{ backgroundColor: previewTemplate.colors.accent }}
                    >
                      <span>Accent</span>
                    </div>
                  </div>
                </div>
                <div className="preview-section">
                  <h4>{t(language, 'templates.features')}</h4>
                  <ul>
                    {previewTemplate.features.map((feature, idx) => (
                      <li key={idx}>✓ {feature}</li>
                    ))}
                  </ul>
                </div>
                <div className="preview-section">
                  <h4>{t(language, 'templates.layout')}</h4>
                  <p>
                    <strong>Header:</strong> {previewTemplate.layout.headerAlign}
                  </p>
                  <p>
                    <strong>Columns:</strong> {previewTemplate.layout.columnLayout}
                  </p>
                  <p>
                    <strong>Spacing:</strong> {previewTemplate.layout.sectionSpacing}px
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleSelectTemplate(previewTemplate.id);
                  closePreview();
                }}
              >
                {t(language, 'templates.useTemplate')}
              </button>
              <button className="btn btn-secondary" onClick={closePreview}>
                {t(language, 'common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
