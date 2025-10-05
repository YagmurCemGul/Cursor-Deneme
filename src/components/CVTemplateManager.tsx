import React, { useState, useEffect } from 'react';
import { CVTemplateStyle, defaultCVTemplates } from '../data/cvTemplates';
import { defaultTemplateCategories } from '../data/templateCategories';
import { StorageService } from '../utils/storage';
import { t, Lang } from '../i18n';
import { CustomCVTemplate, TemplateCategory, TemplateRating } from '../types';
import { TemplateCustomizer } from './TemplateCustomizer';
import { suggestCVTemplates, getConfidenceLabel, getConfidenceColor } from '../utils/templateSuggestions';

interface CVTemplateManagerProps {
  language: Lang;
  onSelectTemplate: (templateId: string) => void;
  currentTemplateId?: string | undefined;
  jobDescription?: string;
}

type ViewMode = 'grid' | 'category' | 'suggestions';

export const CVTemplateManager: React.FC<CVTemplateManagerProps> = ({
  language,
  onSelectTemplate,
  currentTemplateId,
  jobDescription,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(currentTemplateId || 'classic');
  const [customTemplates, setCustomTemplates] = useState<CustomCVTemplate[]>([]);
  const [previewTemplate, setPreviewTemplate] = useState<CVTemplateStyle | CustomCVTemplate | null>(null);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CustomCVTemplate | undefined>(undefined);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingTemplateId, setRatingTemplateId] = useState<string | null>(null);
  const [templateRatings, setTemplateRatings] = useState<Record<string, { average: number; total: number }>>({});

  useEffect(() => {
    loadCustomTemplates();
    loadRatings();
  }, []);

  const loadCustomTemplates = async () => {
    const templates = await StorageService.getCustomCVTemplates();
    setCustomTemplates(templates);
  };

  const loadRatings = async () => {
    const allTemplateIds = [...defaultCVTemplates.map((t) => t.id), ...customTemplates.map((t) => t.id)];
    const ratingsMap: Record<string, { average: number; total: number }> = {};
    
    for (const id of allTemplateIds) {
      const rating = await StorageService.getAverageTemplateRating(id);
      ratingsMap[id] = rating;
    }
    
    setTemplateRatings(ratingsMap);
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    onSelectTemplate(templateId);
  };

  const handlePreview = (template: CVTemplateStyle | CustomCVTemplate) => {
    setPreviewTemplate(template);
  };

  const closePreview = () => {
    setPreviewTemplate(null);
  };

  const handleCreateCustomTemplate = () => {
    setEditingTemplate(undefined);
    setShowCustomizer(true);
  };

  const handleEditTemplate = (template: CustomCVTemplate) => {
    setEditingTemplate(template);
    setShowCustomizer(true);
  };

  const handleSaveCustomTemplate = async (template: CustomCVTemplate) => {
    await StorageService.saveCustomCVTemplate(template);
    await loadCustomTemplates();
    setShowCustomizer(false);
    setEditingTemplate(undefined);
  };

  const handleDeleteCustomTemplate = async (templateId: string) => {
    if (confirm('Are you sure you want to delete this custom template?')) {
      await StorageService.deleteCustomCVTemplate(templateId);
      await loadCustomTemplates();
    }
  };

  const handleExportTemplate = (template: CustomCVTemplate) => {
    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name.replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportTemplate = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const importedTemplate: CustomCVTemplate = JSON.parse(event.target?.result as string);
            importedTemplate.id = `imported-${Date.now()}`;
            importedTemplate.createdAt = new Date().toISOString();
            importedTemplate.isCustom = true;
            await StorageService.saveCustomCVTemplate(importedTemplate);
            await loadCustomTemplates();
            alert('Template imported successfully!');
          } catch (error) {
            alert('Failed to import template. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleRateTemplate = (templateId: string) => {
    setRatingTemplateId(templateId);
    setShowRatingModal(true);
  };

  const handleSubmitRating = async (rating: number, review: string) => {
    if (!ratingTemplateId) return;

    const newRating: TemplateRating = {
      id: `rating-${Date.now()}`,
      templateId: ratingTemplateId,
      rating,
      review,
      createdAt: new Date().toISOString(),
    };

    await StorageService.saveTemplateRating(newRating);
    await loadRatings();
    setShowRatingModal(false);
    setRatingTemplateId(null);
  };

  const allTemplates = [
    ...defaultCVTemplates.map((t) => ({ ...t, isCustom: false })),
    ...customTemplates,
  ];

  const getFilteredTemplates = () => {
    if (viewMode === 'category' && selectedCategory) {
      const category = defaultTemplateCategories.find((c) => c.id === selectedCategory);
      if (category) {
        return allTemplates.filter((template) => {
          // Match by template id or name
          return category.industry?.some((ind) => 
            template.id.includes(ind) || template.name.toLowerCase().includes(ind)
          );
        });
      }
    }
    return allTemplates;
  };

  const suggestions = jobDescription ? suggestCVTemplates(jobDescription) : [];

  if (showCustomizer) {
    return (
      <div className="section">
        <TemplateCustomizer
          language={language}
          baseTemplate={editingTemplate}
          onSave={handleSaveCustomTemplate}
          onCancel={() => {
            setShowCustomizer(false);
            setEditingTemplate(undefined);
          }}
        />
      </div>
    );
  }

  return (
    <div className="section">
      <div className="template-manager-header">
        <div>
          <h2 className="section-title">🎨 {t(language, 'templates.title')}</h2>
          <p className="section-description">{t(language, 'templates.description')}</p>
        </div>
        <div className="template-actions-toolbar">
          <button className="btn btn-primary" onClick={handleCreateCustomTemplate}>
            ✨ {t(language, 'templates.createCustom')}
          </button>
          <button className="btn btn-secondary" onClick={handleImportTemplate}>
            📥 {t(language, 'templates.import')}
          </button>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="view-mode-selector">
        <button
          className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
          onClick={() => setViewMode('grid')}
        >
          🔲 {t(language, 'templates.viewAll')}
        </button>
        <button
          className={`view-mode-btn ${viewMode === 'category' ? 'active' : ''}`}
          onClick={() => setViewMode('category')}
        >
          📂 {t(language, 'templates.viewByCategory')}
        </button>
        {jobDescription && suggestions.length > 0 && (
          <button
            className={`view-mode-btn ${viewMode === 'suggestions' ? 'active' : ''}`}
            onClick={() => setViewMode('suggestions')}
          >
            🤖 {t(language, 'templates.aiSuggestions')} ({suggestions.length})
          </button>
        )}
      </div>

      {/* Category Filter */}
      {viewMode === 'category' && (
        <div className="category-filter">
          <h3>{t(language, 'templates.selectCategory')}</h3>
          <div className="category-grid">
            {defaultTemplateCategories.map((category) => (
              <div
                key={category.id}
                className={`category-card ${selectedCategory === category.id ? 'selected' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="category-icon">{category.icon}</div>
                <div className="category-name">{category.name}</div>
                <div className="category-description">{category.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      {viewMode === 'suggestions' && suggestions.length > 0 && (
        <div className="ai-suggestions">
          <h3>🤖 {t(language, 'templates.aiRecommendations')}</h3>
          <p className="text-muted">{t(language, 'templates.aiDescription')}</p>
          <div className="suggestions-list">
            {suggestions.map((suggestion) => {
              const template = allTemplates.find((t) => t.id === suggestion.templateId);
              if (!template) return null;

              return (
                <div key={suggestion.templateId} className="suggestion-card">
                  <div className="suggestion-header">
                    <div className="template-info-compact">
                      <span className="template-preview-icon">{template.preview}</span>
                      <div>
                        <h4>{template.name}</h4>
                        <p className="text-muted">{template.description}</p>
                      </div>
                    </div>
                    <div className="confidence-badge" style={{ backgroundColor: getConfidenceColor(suggestion.confidence) }}>
                      {getConfidenceLabel(suggestion.confidence)}
                    </div>
                  </div>
                  <div className="suggestion-reason">
                    <strong>{t(language, 'templates.matchReason')}:</strong> {suggestion.reason}
                  </div>
                  <div className="suggestion-keywords">
                    <strong>{t(language, 'templates.matchedKeywords')}:</strong>
                    {suggestion.matchedKeywords.map((keyword, idx) => (
                      <span key={idx} className="keyword-tag">{keyword}</span>
                    ))}
                  </div>
                  <div className="suggestion-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSelectTemplate(template.id)}
                    >
                      {t(language, 'templates.useTemplate')}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handlePreview(template)}
                    >
                      {t(language, 'templates.preview')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Template Grid */}
      {(viewMode === 'grid' || viewMode === 'category') && (
        <div className="template-grid">
          {getFilteredTemplates().map((template) => {
            const isCustom = 'isCustom' in template && template.isCustom;
            const rating = templateRatings[template.id] || { average: 0, total: 0 };

            return (
              <div
                key={template.id}
                className={`template-card ${selectedTemplate === template.id ? 'selected' : ''} ${isCustom ? 'custom' : ''}`}
                onClick={() => handleSelectTemplate(template.id)}
              >
                {isCustom && <div className="custom-badge">✨ {t(language, 'templates.custom')}</div>}
                <div className="template-preview-icon">{template.preview}</div>
                <div className="template-info">
                  <h3 className="template-name">{template.name}</h3>
                  <p className="template-description">{template.description}</p>
                  
                  {/* Rating Display */}
                  {rating.total > 0 && (
                    <div className="template-rating">
                      <span className="rating-stars">
                        {'⭐'.repeat(Math.round(rating.average))}
                      </span>
                      <span className="rating-text">
                        {rating.average.toFixed(1)} ({rating.total} {t(language, 'templates.reviews')})
                      </span>
                    </div>
                  )}

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
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRateTemplate(template.id);
                      }}
                    >
                      ⭐ {t(language, 'templates.rate')}
                    </button>
                    {isCustom && (
                      <>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTemplate(template as CustomCVTemplate);
                          }}
                        >
                          ✏️ {t(language, 'templates.edit')}
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportTemplate(template as CustomCVTemplate);
                          }}
                        >
                          📤 {t(language, 'templates.export')}
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomTemplate(template.id);
                          }}
                        >
                          🗑️ {t(language, 'templates.delete')}
                        </button>
                      </>
                    )}
                    {selectedTemplate === template.id && (
                      <span className="selected-badge">✓ {t(language, 'templates.selected')}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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

      {/* Rating Modal */}
      {showRatingModal && ratingTemplateId && (
        <div className="modal-overlay" onClick={() => setShowRatingModal(false)}>
          <div className="modal-content rating-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t(language, 'templates.rateTemplate')}</h3>
              <button className="modal-close" onClick={() => setShowRatingModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <RatingForm
                language={language}
                onSubmit={handleSubmitRating}
                onCancel={() => setShowRatingModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Rating Form Component
interface RatingFormProps {
  language: Lang;
  onSubmit: (rating: number, review: string) => void;
  onCancel: () => void;
}

const RatingForm: React.FC<RatingFormProps> = ({ language, onSubmit, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = () => {
    if (rating === 0) {
      alert(t(language, 'templates.selectRating'));
      return;
    }
    onSubmit(rating, review);
  };

  return (
    <div className="rating-form">
      <div className="rating-stars-input">
        <label>{t(language, 'templates.yourRating')}</label>
        <div className="stars-container">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className={`star-btn ${star <= (hoveredRating || rating) ? 'filled' : ''}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
            >
              ⭐
            </button>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label>{t(language, 'templates.yourReview')} ({t(language, 'templates.optional')})</label>
        <textarea
          className="form-control"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder={t(language, 'templates.reviewPlaceholder')}
          rows={4}
        />
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onCancel}>
          {t(language, 'common.cancel')}
        </button>
        <button className="btn btn-primary" onClick={handleSubmit}>
          {t(language, 'templates.submitRating')}
        </button>
      </div>
    </div>
  );
};
