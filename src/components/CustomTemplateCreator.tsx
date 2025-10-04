import React, { useState } from 'react';
import { CVTemplateStyle } from '../data/cvTemplates';
import { StorageService } from '../utils/storage';
import { t, Lang } from '../i18n';

interface CustomTemplateCreatorProps {
  language: Lang;
  onTemplateCreated?: (template: CVTemplateStyle) => void;
  onClose?: () => void;
}

export const CustomTemplateCreator: React.FC<CustomTemplateCreatorProps> = ({
  language,
  onTemplateCreated,
  onClose,
}) => {
  const [templateData, setTemplateData] = useState<Partial<CVTemplateStyle>>({
    name: '',
    description: '',
    preview: '📄',
    colors: {
      primary: '#2563eb',
      secondary: '#475569',
      accent: '#3b82f6',
      text: '#1e293b',
      background: '#ffffff',
    },
    fonts: {
      heading: 'Arial, sans-serif',
      body: 'Arial, sans-serif',
      size: {
        heading: '24px',
        subheading: '18px',
        body: '14px',
      },
    },
    layout: {
      headerAlign: 'center',
      columnLayout: 'single',
      sectionSpacing: 20,
      margins: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
    },
    features: [],
  });

  const [newFeature, setNewFeature] = useState('');
  const [saving, setSaving] = useState(false);

  const handleColorChange = (colorKey: keyof CVTemplateStyle['colors'], value: string) => {
    setTemplateData({
      ...templateData,
      colors: {
        ...templateData.colors!,
        [colorKey]: value,
      },
    });
  };

  const handleFontChange = (fontKey: keyof CVTemplateStyle['fonts'], value: string) => {
    if (fontKey === 'size') return; // Handle size separately
    setTemplateData({
      ...templateData,
      fonts: {
        ...templateData.fonts!,
        [fontKey]: value,
      },
    });
  };

  const handleFontSizeChange = (sizeKey: keyof CVTemplateStyle['fonts']['size'], value: string) => {
    setTemplateData({
      ...templateData,
      fonts: {
        ...templateData.fonts!,
        size: {
          ...templateData.fonts!.size,
          [sizeKey]: value,
        },
      },
    });
  };

  const handleLayoutChange = (layoutKey: keyof CVTemplateStyle['layout'], value: any) => {
    if (layoutKey === 'margins') return; // Handle margins separately
    setTemplateData({
      ...templateData,
      layout: {
        ...templateData.layout!,
        [layoutKey]: value,
      },
    });
  };

  const handleMarginChange = (marginKey: keyof CVTemplateStyle['layout']['margins'], value: number) => {
    setTemplateData({
      ...templateData,
      layout: {
        ...templateData.layout!,
        margins: {
          ...templateData.layout!.margins,
          [marginKey]: value,
        },
      },
    });
  };

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    setTemplateData({
      ...templateData,
      features: [...(templateData.features || []), newFeature],
    });
    setNewFeature('');
  };

  const handleRemoveFeature = (index: number) => {
    setTemplateData({
      ...templateData,
      features: templateData.features?.filter((_, i) => i !== index),
    });
  };

  const handleSaveTemplate = async () => {
    if (!templateData.name?.trim()) {
      alert(language === 'en' ? 'Please enter a template name' : 'Lütfen bir şablon adı girin');
      return;
    }

    setSaving(true);
    try {
      const template: CVTemplateStyle = {
        id: `custom_${Date.now()}`,
        name: templateData.name,
        description: templateData.description || '',
        preview: templateData.preview || '📄',
        colors: templateData.colors!,
        fonts: templateData.fonts!,
        layout: templateData.layout!,
        features: templateData.features || [],
      };

      // Save to storage
      await StorageService.saveTemplate({
        id: template.id,
        name: template.name,
        content: JSON.stringify(template),
        createdAt: new Date().toISOString(),
      });

      alert(
        language === 'en'
          ? 'Template created successfully!'
          : 'Şablon başarıyla oluşturuldu!'
      );

      if (onTemplateCreated) {
        onTemplateCreated(template);
      }

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      alert(
        language === 'en'
          ? 'Failed to create template'
          : 'Şablon oluşturulamadı'
      );
    } finally {
      setSaving(false);
    }
  };

  const previewIcons = ['📄', '📋', '📃', '📝', '🎨', '✨', '🌟', '💼'];

  return (
    <div className="custom-template-creator">
      <div className="section">
        <h2 className="section-title">
          🎨 {language === 'en' ? 'Create Custom Template' : 'Özel Şablon Oluştur'}
        </h2>

        {/* Basic Info */}
        <div className="card">
          <h3 className="card-subtitle">
            {language === 'en' ? 'Basic Information' : 'Temel Bilgiler'}
          </h3>

          <div className="form-group">
            <label className="form-label">
              {language === 'en' ? 'Template Name' : 'Şablon Adı'}
            </label>
            <input
              type="text"
              className="form-input"
              value={templateData.name}
              onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
              placeholder={language === 'en' ? 'e.g., Professional Blue' : 'örn., Profesyonel Mavi'}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              {language === 'en' ? 'Description' : 'Açıklama'}
            </label>
            <textarea
              className="form-input"
              value={templateData.description}
              onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
              placeholder={language === 'en' ? 'Describe your template...' : 'Şablonunuzu tanımlayın...'}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              {language === 'en' ? 'Preview Icon' : 'Önizleme İkonu'}
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {previewIcons.map((icon) => (
                <button
                  key={icon}
                  className={`btn ${templateData.preview === icon ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setTemplateData({ ...templateData, preview: icon })}
                  style={{ fontSize: '24px', padding: '10px 15px' }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="card">
          <h3 className="card-subtitle">
            {language === 'en' ? 'Color Scheme' : 'Renk Şeması'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
            {Object.entries(templateData.colors || {}).map(([key, value]) => (
              <div key={key} className="form-group">
                <label className="form-label" style={{ textTransform: 'capitalize' }}>
                  {key}
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => handleColorChange(key as any, e.target.value)}
                    style={{ width: '50px', height: '40px', border: 'none', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={value}
                    onChange={(e) => handleColorChange(key as any, e.target.value)}
                    style={{ flex: 1, fontFamily: 'monospace', fontSize: '12px' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fonts */}
        <div className="card">
          <h3 className="card-subtitle">
            {language === 'en' ? 'Typography' : 'Tipografi'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div className="form-group">
              <label className="form-label">
                {language === 'en' ? 'Heading Font' : 'Başlık Yazı Tipi'}
              </label>
              <select
                className="form-select"
                value={templateData.fonts?.heading}
                onChange={(e) => handleFontChange('heading', e.target.value)}
              >
                <option value="Arial, sans-serif">Arial</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Courier New', monospace">Courier New</option>
                <option value="Verdana, sans-serif">Verdana</option>
                <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                {language === 'en' ? 'Body Font' : 'Gövde Yazı Tipi'}
              </label>
              <select
                className="form-select"
                value={templateData.fonts?.body}
                onChange={(e) => handleFontChange('body', e.target.value)}
              >
                <option value="Arial, sans-serif">Arial</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Courier New', monospace">Courier New</option>
                <option value="Verdana, sans-serif">Verdana</option>
                <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                {language === 'en' ? 'Heading Size' : 'Başlık Boyutu'}
              </label>
              <input
                type="text"
                className="form-input"
                value={templateData.fonts?.size.heading}
                onChange={(e) => handleFontSizeChange('heading', e.target.value)}
                placeholder="24px"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                {language === 'en' ? 'Subheading Size' : 'Alt Başlık Boyutu'}
              </label>
              <input
                type="text"
                className="form-input"
                value={templateData.fonts?.size.subheading}
                onChange={(e) => handleFontSizeChange('subheading', e.target.value)}
                placeholder="18px"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                {language === 'en' ? 'Body Size' : 'Gövde Boyutu'}
              </label>
              <input
                type="text"
                className="form-input"
                value={templateData.fonts?.size.body}
                onChange={(e) => handleFontSizeChange('body', e.target.value)}
                placeholder="14px"
              />
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="card">
          <h3 className="card-subtitle">
            {language === 'en' ? 'Layout Settings' : 'Düzen Ayarları'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div className="form-group">
              <label className="form-label">
                {language === 'en' ? 'Header Alignment' : 'Başlık Hizalama'}
              </label>
              <select
                className="form-select"
                value={templateData.layout?.headerAlign}
                onChange={(e) => handleLayoutChange('headerAlign', e.target.value)}
              >
                <option value="left">{language === 'en' ? 'Left' : 'Sol'}</option>
                <option value="center">{language === 'en' ? 'Center' : 'Ortala'}</option>
                <option value="right">{language === 'en' ? 'Right' : 'Sağ'}</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                {language === 'en' ? 'Column Layout' : 'Sütun Düzeni'}
              </label>
              <select
                className="form-select"
                value={templateData.layout?.columnLayout}
                onChange={(e) => handleLayoutChange('columnLayout', e.target.value)}
              >
                <option value="single">{language === 'en' ? 'Single Column' : 'Tek Sütun'}</option>
                <option value="two-column">{language === 'en' ? 'Two Columns' : 'İki Sütun'}</option>
                <option value="sidebar-left">{language === 'en' ? 'Sidebar Left' : 'Sol Kenar Çubuğu'}</option>
                <option value="sidebar-right">{language === 'en' ? 'Sidebar Right' : 'Sağ Kenar Çubuğu'}</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                {language === 'en' ? 'Section Spacing' : 'Bölüm Boşluğu'}
              </label>
              <input
                type="number"
                className="form-input"
                value={templateData.layout?.sectionSpacing}
                onChange={(e) => handleLayoutChange('sectionSpacing', Number(e.target.value))}
                placeholder="20"
              />
            </div>

            {/* Margins */}
            <div className="form-group">
              <label className="form-label">
                {language === 'en' ? 'Top Margin' : 'Üst Kenar Boşluğu'}
              </label>
              <input
                type="number"
                className="form-input"
                value={templateData.layout?.margins.top}
                onChange={(e) => handleMarginChange('top', Number(e.target.value))}
                placeholder="20"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                {language === 'en' ? 'Right Margin' : 'Sağ Kenar Boşluğu'}
              </label>
              <input
                type="number"
                className="form-input"
                value={templateData.layout?.margins.right}
                onChange={(e) => handleMarginChange('right', Number(e.target.value))}
                placeholder="20"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                {language === 'en' ? 'Bottom Margin' : 'Alt Kenar Boşluğu'}
              </label>
              <input
                type="number"
                className="form-input"
                value={templateData.layout?.margins.bottom}
                onChange={(e) => handleMarginChange('bottom', Number(e.target.value))}
                placeholder="20"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                {language === 'en' ? 'Left Margin' : 'Sol Kenar Boşluğu'}
              </label>
              <input
                type="number"
                className="form-input"
                value={templateData.layout?.margins.left}
                onChange={(e) => handleMarginChange('left', Number(e.target.value))}
                placeholder="20"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="card">
          <h3 className="card-subtitle">
            {language === 'en' ? 'Features' : 'Özellikler'}
          </h3>

          <div className="form-group">
            <label className="form-label">
              {language === 'en' ? 'Add Feature' : 'Özellik Ekle'}
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="form-input"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder={language === 'en' ? 'e.g., ATS-friendly' : 'örn., ATS dostu'}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={handleAddFeature}>
                {language === 'en' ? 'Add' : 'Ekle'}
              </button>
            </div>
          </div>

          {templateData.features && templateData.features.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '15px' }}>
              {templateData.features.map((feature, index) => (
                <div
                  key={index}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span>{feature}</span>
                  <button
                    onClick={() => handleRemoveFeature(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      padding: '0',
                      fontSize: '16px',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            className="btn btn-primary"
            onClick={handleSaveTemplate}
            disabled={saving}
            style={{ flex: 1 }}
          >
            {saving ? '⏳' : '💾'} {language === 'en' ? 'Save Template' : 'Şablonu Kaydet'}
          </button>
          {onClose && (
            <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
              {language === 'en' ? 'Cancel' : 'İptal'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
