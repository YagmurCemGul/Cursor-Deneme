import React, { useState } from 'react';
import { CustomCVTemplate } from '../types';
import { t, Lang } from '../i18n';

interface TemplateCustomizerProps {
  language: Lang;
  baseTemplate?: CustomCVTemplate;
  onSave: (template: CustomCVTemplate) => void;
  onCancel: () => void;
}

const FONT_OPTIONS = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Calibri, sans-serif', label: 'Calibri' },
  { value: 'Consolas, monospace', label: 'Consolas (Monospace)' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet MS' },
  { value: 'Palatino, serif', label: 'Palatino' },
  { value: 'Garamond, serif', label: 'Garamond' },
  { value: 'Book Antiqua, serif', label: 'Book Antiqua' },
];

const LAYOUT_OPTIONS = {
  headerAlign: [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
  ],
  columnLayout: [
    { value: 'single', label: 'Single Column' },
    { value: 'two-column', label: 'Two Columns' },
  ],
};

export const TemplateCustomizer: React.FC<TemplateCustomizerProps> = ({
  language,
  baseTemplate,
  onSave,
  onCancel,
}) => {
  const [template, setTemplate] = useState<CustomCVTemplate>(
    baseTemplate || {
      id: `custom-${Date.now()}`,
      name: 'My Custom Template',
      description: 'Custom template created by me',
      preview: '✨',
      categoryId: undefined,
      colors: {
        primary: '#2c3e50',
        secondary: '#34495e',
        text: '#333333',
        background: '#ffffff',
        accent: '#3498db',
      },
      fonts: {
        heading: 'Arial, sans-serif',
        body: 'Arial, sans-serif',
      },
      layout: {
        headerAlign: 'center',
        sectionSpacing: 16,
        columnLayout: 'single',
      },
      features: [],
      isCustom: true,
      createdAt: new Date().toISOString(),
    }
  );

  const [features, setFeatures] = useState<string>(
    baseTemplate?.features.join(', ') || ''
  );

  const handleColorChange = (colorKey: keyof CustomCVTemplate['colors'], value: string) => {
    setTemplate((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value,
      },
    }));
  };

  const handleFontChange = (fontKey: keyof CustomCVTemplate['fonts'], value: string) => {
    setTemplate((prev) => ({
      ...prev,
      fonts: {
        ...prev.fonts,
        [fontKey]: value,
      },
    }));
  };

  const handleLayoutChange = (
    layoutKey: keyof CustomCVTemplate['layout'],
    value: string | number
  ) => {
    setTemplate((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        [layoutKey]: value,
      },
    }));
  };

  const handleSave = () => {
    const updatedTemplate: CustomCVTemplate = {
      ...template,
      features: features.split(',').map((f) => f.trim()).filter(Boolean),
      updatedAt: new Date().toISOString(),
    };
    onSave(updatedTemplate);
  };

  return (
    <div className="template-customizer">
      <div className="customizer-header">
        <h2>🎨 {t(language, 'templateCustomizer.title')}</h2>
        <p className="text-muted">{t(language, 'templateCustomizer.description')}</p>
      </div>

      <div className="customizer-content">
        {/* Basic Information */}
        <div className="customizer-section">
          <h3>{t(language, 'templateCustomizer.basicInfo')}</h3>
          <div className="form-group">
            <label>{t(language, 'templateCustomizer.templateName')}</label>
            <input
              type="text"
              className="form-control"
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              placeholder="My Custom Template"
            />
          </div>
          <div className="form-group">
            <label>{t(language, 'templateCustomizer.description')}</label>
            <textarea
              className="form-control"
              value={template.description}
              onChange={(e) => setTemplate({ ...template, description: e.target.value })}
              placeholder="Describe your template..."
              rows={2}
            />
          </div>
          <div className="form-group">
            <label>{t(language, 'templateCustomizer.emoji')}</label>
            <input
              type="text"
              className="form-control"
              value={template.preview}
              onChange={(e) => setTemplate({ ...template, preview: e.target.value })}
              placeholder="✨"
              maxLength={2}
            />
          </div>
        </div>

        {/* Color Customization */}
        <div className="customizer-section">
          <h3>{t(language, 'templateCustomizer.colors')}</h3>
          <div className="color-grid">
            <div className="color-picker-group">
              <label>{t(language, 'templateCustomizer.primaryColor')}</label>
              <div className="color-picker-wrapper">
                <input
                  type="color"
                  value={template.colors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                />
                <input
                  type="text"
                  className="form-control color-input"
                  value={template.colors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  placeholder="#2c3e50"
                />
              </div>
            </div>
            <div className="color-picker-group">
              <label>{t(language, 'templateCustomizer.secondaryColor')}</label>
              <div className="color-picker-wrapper">
                <input
                  type="color"
                  value={template.colors.secondary}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                />
                <input
                  type="text"
                  className="form-control color-input"
                  value={template.colors.secondary}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  placeholder="#34495e"
                />
              </div>
            </div>
            <div className="color-picker-group">
              <label>{t(language, 'templateCustomizer.accentColor')}</label>
              <div className="color-picker-wrapper">
                <input
                  type="color"
                  value={template.colors.accent}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                />
                <input
                  type="text"
                  className="form-control color-input"
                  value={template.colors.accent}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                  placeholder="#3498db"
                />
              </div>
            </div>
            <div className="color-picker-group">
              <label>{t(language, 'templateCustomizer.textColor')}</label>
              <div className="color-picker-wrapper">
                <input
                  type="color"
                  value={template.colors.text}
                  onChange={(e) => handleColorChange('text', e.target.value)}
                />
                <input
                  type="text"
                  className="form-control color-input"
                  value={template.colors.text}
                  onChange={(e) => handleColorChange('text', e.target.value)}
                  placeholder="#333333"
                />
              </div>
            </div>
            <div className="color-picker-group">
              <label>{t(language, 'templateCustomizer.backgroundColor')}</label>
              <div className="color-picker-wrapper">
                <input
                  type="color"
                  value={template.colors.background}
                  onChange={(e) => handleColorChange('background', e.target.value)}
                />
                <input
                  type="text"
                  className="form-control color-input"
                  value={template.colors.background}
                  onChange={(e) => handleColorChange('background', e.target.value)}
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Font Selection */}
        <div className="customizer-section">
          <h3>{t(language, 'templateCustomizer.fonts')}</h3>
          <div className="font-grid">
            <div className="form-group">
              <label>{t(language, 'templateCustomizer.headingFont')}</label>
              <select
                className="form-control"
                value={template.fonts.heading}
                onChange={(e) => handleFontChange('heading', e.target.value)}
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
              <div
                className="font-preview"
                style={{ fontFamily: template.fonts.heading }}
              >
                Heading Preview Text
              </div>
            </div>
            <div className="form-group">
              <label>{t(language, 'templateCustomizer.bodyFont')}</label>
              <select
                className="form-control"
                value={template.fonts.body}
                onChange={(e) => handleFontChange('body', e.target.value)}
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
              <div
                className="font-preview"
                style={{ fontFamily: template.fonts.body }}
              >
                Body text preview. This is how your text will look.
              </div>
            </div>
          </div>
        </div>

        {/* Layout Options */}
        <div className="customizer-section">
          <h3>{t(language, 'templateCustomizer.layout')}</h3>
          <div className="layout-grid">
            <div className="form-group">
              <label>{t(language, 'templateCustomizer.headerAlignment')}</label>
              <select
                className="form-control"
                value={template.layout.headerAlign}
                onChange={(e) =>
                  handleLayoutChange('headerAlign', e.target.value as 'left' | 'center' | 'right')
                }
              >
                {LAYOUT_OPTIONS.headerAlign.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>{t(language, 'templateCustomizer.columnLayout')}</label>
              <select
                className="form-control"
                value={template.layout.columnLayout}
                onChange={(e) =>
                  handleLayoutChange('columnLayout', e.target.value as 'single' | 'two-column')
                }
              >
                {LAYOUT_OPTIONS.columnLayout.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>
                {t(language, 'templateCustomizer.sectionSpacing')} ({template.layout.sectionSpacing}px)
              </label>
              <input
                type="range"
                className="form-range"
                min="8"
                max="32"
                step="2"
                value={template.layout.sectionSpacing}
                onChange={(e) =>
                  handleLayoutChange('sectionSpacing', parseInt(e.target.value))
                }
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="customizer-section">
          <h3>{t(language, 'templateCustomizer.features')}</h3>
          <div className="form-group">
            <label>{t(language, 'templateCustomizer.featuresDescription')}</label>
            <input
              type="text"
              className="form-control"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="ATS-Optimized, Clean Layout, Professional"
            />
            <small className="form-text text-muted">
              {t(language, 'templateCustomizer.featuresHint')}
            </small>
          </div>
        </div>

        {/* Preview */}
        <div className="customizer-section">
          <h3>{t(language, 'templateCustomizer.preview')}</h3>
          <div className="template-preview-card" style={{
            borderColor: template.colors.primary,
            backgroundColor: template.colors.background,
          }}>
            <div
              className="preview-header"
              style={{
                backgroundColor: template.colors.primary,
                textAlign: template.layout.headerAlign,
              }}
            >
              <h4 style={{ fontFamily: template.fonts.heading, color: '#ffffff' }}>
                {template.name}
              </h4>
            </div>
            <div className="preview-body" style={{ color: template.colors.text }}>
              <div style={{ fontFamily: template.fonts.body }}>
                <p style={{ marginBottom: `${template.layout.sectionSpacing}px` }}>
                  This is a preview of your custom template. The actual CV will use these styles.
                </p>
                <div
                  className="preview-section"
                  style={{
                    borderLeftColor: template.colors.accent,
                    marginBottom: `${template.layout.sectionSpacing}px`,
                  }}
                >
                  <h5
                    style={{
                      fontFamily: template.fonts.heading,
                      color: template.colors.secondary,
                    }}
                  >
                    Section Heading
                  </h5>
                  <p style={{ fontFamily: template.fonts.body }}>
                    Sample content text that shows how your body font looks in the document.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="customizer-footer">
        <button className="btn btn-secondary" onClick={onCancel}>
          {t(language, 'common.cancel')}
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          {t(language, 'common.save')}
        </button>
      </div>
    </div>
  );
};
