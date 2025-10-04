import React, { useState, useEffect, useMemo } from 'react';
import { t, Lang } from '../i18n';
import { StorageService } from '../utils/storage';
import { TemplateMetadata, TemplateUsageAnalytics, CustomTemplate } from '../types';

interface EnhancedDescriptionTemplatesProps {
  onSelect: (template: string) => void;
  language: Lang;
  type: 'experience' | 'education' | 'certification' | 'project';
  context?: {
    industry?: string;
    jobTitle?: string;
    section?: string;
  };
}

interface DescriptionTemplate {
  id: string;
  label: string;
  industry?: string[];
  tags?: string[];
}

export const EnhancedDescriptionTemplates: React.FC<EnhancedDescriptionTemplatesProps> = ({
  onSelect,
  language,
  type,
  context,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [templatesMetadata, setTemplatesMetadata] = useState<Record<string, TemplateMetadata>>({});
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [filterIndustry, setFilterIndustry] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showPreview, setShowPreview] = useState<DescriptionTemplate | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [metadata, custom] = await Promise.all([
      StorageService.getAllTemplatesMetadata(),
      StorageService.getCustomTemplates('description'),
    ]);
    setTemplatesMetadata(metadata);
    setCustomTemplates(custom);
  };

  const getBaseTemplates = (): DescriptionTemplate[] => {
    switch (type) {
      case 'experience':
        return [
          {
            id: 'templates.experience.improved',
            label: t(language, 'templates.experience.improved'),
            industry: ['Technology', 'Software', 'Business'],
            tags: ['optimization', 'improvement'],
          },
          {
            id: 'templates.experience.led',
            label: t(language, 'templates.experience.led'),
            industry: ['Management', 'Leadership', 'Executive'],
            tags: ['leadership', 'management'],
          },
          {
            id: 'templates.experience.developed',
            label: t(language, 'templates.experience.developed'),
            industry: ['Technology', 'Software', 'Engineering'],
            tags: ['development', 'creation'],
          },
          {
            id: 'templates.experience.managed',
            label: t(language, 'templates.experience.managed'),
            industry: ['Management', 'Operations', 'Business'],
            tags: ['management', 'coordination'],
          },
          {
            id: 'templates.experience.achieved',
            label: t(language, 'templates.experience.achieved'),
            industry: ['Sales', 'Business', 'Marketing'],
            tags: ['achievement', 'results'],
          },
          {
            id: 'templates.experience.collaborated',
            label: t(language, 'templates.experience.collaborated'),
            industry: ['All Industries'],
            tags: ['teamwork', 'collaboration'],
          },
          {
            id: 'templates.experience.reduced',
            label: t(language, 'templates.experience.reduced'),
            industry: ['Operations', 'Finance', 'Engineering'],
            tags: ['efficiency', 'optimization'],
          },
          {
            id: 'templates.experience.increased',
            label: t(language, 'templates.experience.increased'),
            industry: ['Sales', 'Marketing', 'Business Development'],
            tags: ['growth', 'expansion'],
          },
        ];
      case 'education':
        return [
          {
            id: 'templates.education.coursework',
            label: t(language, 'templates.education.coursework'),
            industry: ['Academia', 'Research', 'Technical'],
            tags: ['education', 'coursework'],
          },
          {
            id: 'templates.education.achievement',
            label: t(language, 'templates.education.achievement'),
            industry: ['All Industries'],
            tags: ['achievement', 'recognition'],
          },
          {
            id: 'templates.education.thesis',
            label: t(language, 'templates.education.thesis'),
            industry: ['Academia', 'Research', 'Science'],
            tags: ['research', 'thesis'],
          },
          {
            id: 'templates.education.gpa',
            label: t(language, 'templates.education.gpa'),
            industry: ['All Industries'],
            tags: ['academic', 'performance'],
          },
          {
            id: 'templates.education.honors',
            label: t(language, 'templates.education.honors'),
            industry: ['All Industries'],
            tags: ['honors', 'achievement'],
          },
          {
            id: 'templates.education.activities',
            label: t(language, 'templates.education.activities'),
            industry: ['All Industries'],
            tags: ['extracurricular', 'leadership'],
          },
        ];
      case 'certification':
        return [
          {
            id: 'templates.cert.skills',
            label: t(language, 'templates.cert.skills'),
            industry: ['Technology', 'Healthcare', 'Finance'],
            tags: ['skills', 'competency'],
          },
          {
            id: 'templates.cert.focus',
            label: t(language, 'templates.cert.focus'),
            industry: ['All Industries'],
            tags: ['specialization', 'focus'],
          },
          {
            id: 'templates.cert.validation',
            label: t(language, 'templates.cert.validation'),
            industry: ['Technology', 'Healthcare', 'Legal'],
            tags: ['validation', 'verification'],
          },
          {
            id: 'templates.cert.credential',
            label: t(language, 'templates.cert.credential'),
            industry: ['All Industries'],
            tags: ['credential', 'certification'],
          },
        ];
      case 'project':
        return [
          {
            id: 'templates.project.built',
            label: t(language, 'templates.project.built'),
            industry: ['Technology', 'Engineering', 'Construction'],
            tags: ['development', 'creation'],
          },
          {
            id: 'templates.project.implemented',
            label: t(language, 'templates.project.implemented'),
            industry: ['Technology', 'Business', 'Operations'],
            tags: ['implementation', 'execution'],
          },
          {
            id: 'templates.project.designed',
            label: t(language, 'templates.project.designed'),
            industry: ['Design', 'Engineering', 'Architecture'],
            tags: ['design', 'planning'],
          },
          {
            id: 'templates.project.technologies',
            label: t(language, 'templates.project.technologies'),
            industry: ['Technology', 'Software', 'IT'],
            tags: ['technology', 'tools'],
          },
        ];
    }
  };

  const getContextRelevanceScore = (template: DescriptionTemplate): number => {
    let score = 0;

    if (context?.industry && template.industry) {
      const industryMatch = template.industry.some(ind =>
        ind.toLowerCase().includes(context.industry!.toLowerCase()) ||
        ind === 'All Industries'
      );
      if (industryMatch) score += 50;
    }

    const metadata = templatesMetadata[template.id];
    if (metadata?.usageCount) {
      score += Math.min(metadata.usageCount * 2, 20);
    }

    if (metadata?.isFavorite) {
      score += 15;
    }

    return score;
  };

  const allIndustries = useMemo(() => {
    const industries = new Set<string>();
    getBaseTemplates().forEach(template => {
      template.industry?.forEach(ind => industries.add(ind));
    });
    return Array.from(industries).sort();
  }, [type]);

  const filteredTemplates = useMemo(() => {
    let templates = getBaseTemplates();

    if (filterIndustry !== 'all') {
      templates = templates.filter(t =>
        t.industry?.some(ind =>
          ind.toLowerCase().includes(filterIndustry.toLowerCase())
        )
      );
    }

    if (showFavoritesOnly) {
      templates = templates.filter(t => templatesMetadata[t.id]?.isFavorite);
    }

    return templates.sort((a, b) => {
      const scoreA = getContextRelevanceScore(a);
      const scoreB = getContextRelevanceScore(b);
      return scoreB - scoreA;
    });
  }, [filterIndustry, showFavoritesOnly, templatesMetadata, type, context]);

  const suggestedTemplates = useMemo(() => {
    if (!context?.industry && !context?.jobTitle) return [];

    return filteredTemplates
      .map(template => ({
        template,
        score: getContextRelevanceScore(template),
      }))
      .filter(item => item.score > 30)
      .slice(0, 3)
      .map(item => item.template);
  }, [context, filteredTemplates, templatesMetadata]);

  const handleSelectTemplate = async (template: DescriptionTemplate) => {
    onSelect(template.label);
    setIsOpen(false);

    // Record usage analytics
    const analytics: TemplateUsageAnalytics = {
      id: Date.now().toString(),
      templateId: template.id,
      templateType: 'description',
      timestamp: new Date().toISOString(),
      context: {
        industry: context?.industry,
        jobTitle: context?.jobTitle,
        section: type,
      },
    };

    await StorageService.recordTemplateUsage(analytics);
    await loadData();
  };

  const handleToggleFavorite = async (templateId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await StorageService.toggleTemplateFavorite(templateId);
    await loadData();
  };

  const handlePreview = (template: DescriptionTemplate, event: React.MouseEvent) => {
    event.stopPropagation();
    setShowPreview(template);
  };

  return (
    <div className="template-dropdown enhanced-description-templates">
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        💡 {t(language, 'editor.templates')}
      </button>

      {isOpen && (
        <>
          <div className="template-overlay" onClick={() => setIsOpen(false)} />
          <div className="template-menu enhanced">
            <div className="template-menu-header">
              <span>{t(language, 'editor.templates')}</span>
              <button
                type="button"
                className="template-close"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="template-filters">
              <div className="filter-group">
                <select
                  value={filterIndustry}
                  onChange={(e) => setFilterIndustry(e.target.value)}
                  className="form-select-sm"
                >
                  <option value="all">{t(language, 'templates.allIndustries')}</option>
                  {allIndustries.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="checkbox-label-sm">
                  <input
                    type="checkbox"
                    checked={showFavoritesOnly}
                    onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                  />
                  {' '}⭐ {t(language, 'templates.favorites')}
                </label>
              </div>
            </div>

            {suggestedTemplates.length > 0 && (
              <div className="suggested-section">
                <div className="suggested-header">
                  💡 {t(language, 'templates.suggested')}
                </div>
                <div className="template-list">
                  {suggestedTemplates.map((template) => {
                    const metadata = templatesMetadata[template.id];
                    const isFavorite = metadata?.isFavorite || false;
                    const score = getContextRelevanceScore(template);

                    return (
                      <button
                        key={template.id}
                        type="button"
                        className="template-item suggested"
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <div className="template-item-content">
                          <span className="template-label">{template.label}</span>
                          <span className="match-score">{Math.round(score)}%</span>
                        </div>
                        <div className="template-item-actions">
                          <button
                            className={`favorite-btn-sm ${isFavorite ? 'active' : ''}`}
                            onClick={(e) => handleToggleFavorite(template.id, e)}
                            title={isFavorite ? t(language, 'templates.unfavorite') : t(language, 'templates.favorite')}
                          >
                            {isFavorite ? '⭐' : '☆'}
                          </button>
                          <button
                            className="preview-btn-sm"
                            onClick={(e) => handlePreview(template, e)}
                            title={t(language, 'templates.preview')}
                          >
                            👁️
                          </button>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="all-templates-section">
              <div className="section-header">
                📋 {t(language, 'templates.allTemplates')}
              </div>
              <div className="template-list">
                {filteredTemplates.map((template) => {
                  const metadata = templatesMetadata[template.id];
                  const isFavorite = metadata?.isFavorite || false;
                  const usageCount = metadata?.usageCount || 0;

                  return (
                    <button
                      key={template.id}
                      type="button"
                      className="template-item"
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <div className="template-item-content">
                        <span className="template-label">{template.label}</span>
                        {usageCount > 0 && (
                          <span className="usage-count-sm">({usageCount})</span>
                        )}
                      </div>
                      <div className="template-item-actions">
                        <button
                          className={`favorite-btn-sm ${isFavorite ? 'active' : ''}`}
                          onClick={(e) => handleToggleFavorite(template.id, e)}
                          title={isFavorite ? t(language, 'templates.unfavorite') : t(language, 'templates.favorite')}
                        >
                          {isFavorite ? '⭐' : '☆'}
                        </button>
                        <button
                          className="preview-btn-sm"
                          onClick={(e) => handlePreview(template, e)}
                          title={t(language, 'templates.preview')}
                        >
                          👁️
                        </button>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {customTemplates.length > 0 && (
              <div className="custom-templates-section">
                <div className="section-header">
                  ✨ {t(language, 'templates.customTemplates')}
                </div>
                <div className="template-list">
                  {customTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      className="template-item custom"
                      onClick={() => {
                        onSelect(template.content);
                        setIsOpen(false);
                      }}
                    >
                      <span className="template-label">{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(null)}>
          <div
            className="modal-content template-preview-modal-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h4>{t(language, 'templates.preview')}</h4>
              <button className="modal-close" onClick={() => setShowPreview(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="preview-content">
                <p><strong>{t(language, 'templates.template')}:</strong></p>
                <div className="preview-text">{showPreview.label}</div>

                {showPreview.industry && showPreview.industry.length > 0 && (
                  <div className="preview-industries">
                    <p><strong>{t(language, 'templates.industries')}:</strong></p>
                    <div className="industry-tags">
                      {showPreview.industry.map((ind, idx) => (
                        <span key={idx} className="industry-tag-sm">{ind}</span>
                      ))}
                    </div>
                  </div>
                )}

                {showPreview.tags && showPreview.tags.length > 0 && (
                  <div className="preview-tags">
                    <p><strong>{t(language, 'templates.tags')}:</strong></p>
                    <div className="tag-list">
                      {showPreview.tags.map((tag, idx) => (
                        <span key={idx} className="tag-sm">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {templatesMetadata[showPreview.id] && (
                  <div className="preview-stats">
                    <p>
                      <strong>{t(language, 'templates.usageCount')}:</strong>{' '}
                      {templatesMetadata[showPreview.id].usageCount || 0}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  handleSelectTemplate(showPreview);
                  setShowPreview(null);
                }}
              >
                {t(language, 'templates.useTemplate')}
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowPreview(null)}
              >
                {t(language, 'common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
