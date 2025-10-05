import React, { useState, useEffect } from 'react';
import { CVTemplateStyle, defaultCVTemplates } from '../data/cvTemplates';
import { StorageService } from '../utils/storage';
import { t, Lang } from '../i18n';
import { CustomTemplateCreator } from './CustomTemplateCreator';

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
  const [showTemplateCreator, setShowTemplateCreator] = useState(false);

  useEffect(() => {
    loadCustomTemplates();
  }, []);

  const loadCustomTemplates = async () => {
    // Load custom templates from storage
    const templates = await StorageService.getTemplates();
    const customTemplateStyles = templates
      .map((t) => {
        try {
          return JSON.parse(t.content) as CVTemplateStyle;
        } catch {
          return null;
        }
      })
      .filter((t): t is CVTemplateStyle => t !== null);
    setCustomTemplates(customTemplateStyles);
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

  const handleTemplateCreated = (template: CVTemplateStyle) => {
    setCustomTemplates([...customTemplates, template]);
    setShowTemplateCreator(false);
  };

  const allTemplates = [...defaultCVTemplates, ...customTemplates];

  return (
    <div className="section">
      <h2 className="section-title">🎨 {t(language, 'templates.title')}</h2>
      <p className="section-description">{t(language, 'templates.description')}</p>

      {/* Create Custom Template Button */}
      <div style={{ marginBottom: '20px' }}>
        <button className="btn btn-primary" onClick={() => setShowTemplateCreator(true)}>
          ➕ {language === 'en' ? 'Create Custom Template' : 'Özel Şablon Oluştur'}
        </button>
      </div>

      {/* Custom Templates Section */}
      {customTemplates.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 className="subsection-title">
            {language === 'en' ? 'Your Custom Templates' : 'Özel Şablonlarınız'}
          </h3>
          <div className="template-grid">
            {customTemplates.map((template) => (
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
        </div>
      )}

      <h3 className="subsection-title">
        {language === 'en' ? 'Built-in Templates' : 'Yerleşik Şablonlar'}
      </h3>
      <div className="template-grid">
        {defaultCVTemplates.map((template) => (
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

      {/* Template Creator Modal */}
      {showTemplateCreator && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              maxWidth: '900px',
              maxHeight: '90vh',
              overflow: 'auto',
              margin: '20px',
              width: '100%',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '12px',
              padding: '20px',
            }}
          >
            <CustomTemplateCreator
              language={language}
              onTemplateCreated={handleTemplateCreated}
              onClose={() => setShowTemplateCreator(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
