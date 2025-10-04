import React, { useState, useEffect, useMemo } from 'react';
import { CVTemplateStyle, defaultCVTemplates } from '../data/cvTemplates';
import { StorageService } from '../utils/storage';
import { t, Lang } from '../i18n';
import { 
  TemplateMetadata, 
  CustomTemplate, 
  TemplateUsageAnalytics,
  CVData 
} from '../types';

interface EnhancedTemplateManagerProps {
  language: Lang;
  onSelectTemplate: (templateId: string) => void;
  currentTemplateId?: string;
  cvData?: CVData;
  context?: {
    industry?: string;
    jobTitle?: string;
  };
}

export const EnhancedTemplateManager: React.FC<EnhancedTemplateManagerProps> = ({
  language,
  onSelectTemplate,
  currentTemplateId,
  cvData,
  context,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(currentTemplateId || 'classic');
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [templatesMetadata, setTemplatesMetadata] = useState<Record<string, TemplateMetadata>>({});
  const [previewTemplate, setPreviewTemplate] = useState<CVTemplateStyle | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterIndustry, setFilterIndustry] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'recent'>('name');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Custom template creation state
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');
  const [newTemplateIndustries, setNewTemplateIndustries] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [custom, metadata] = await Promise.all([
      StorageService.getCustomTemplates('cv'),
      StorageService.getAllTemplatesMetadata(),
    ]);
    setCustomTemplates(custom);
    setTemplatesMetadata(metadata);
  };

  // Get all available industries
  const allIndustries = useMemo(() => {
    const industries = new Set<string>();
    defaultCVTemplates.forEach(template => {
      template.industry?.forEach(ind => industries.add(ind));
    });
    customTemplates.forEach(template => {
      template.industry?.forEach(ind => industries.add(ind));
    });
    return Array.from(industries).sort();
  }, [customTemplates]);

  // Context-aware scoring
  const getContextRelevanceScore = (template: CVTemplateStyle): number => {
    let score = 0;
    
    if (context?.industry && template.industry) {
      const industryMatch = template.industry.some(ind => 
        ind.toLowerCase().includes(context.industry!.toLowerCase())
      );
      if (industryMatch) score += 50;
    }

    // Boost score based on usage frequency
    const metadata = templatesMetadata[template.id];
    if (metadata?.usageCount) {
      score += Math.min(metadata.usageCount * 2, 20);
    }

    // Recent usage boost
    if (metadata?.lastUsed) {
      const daysSinceLastUse = (Date.now() - new Date(metadata.lastUsed).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastUse < 7) score += 10;
    }

    return score;
  };

  // Filter and sort templates
  const filteredAndSortedTemplates = useMemo(() => {
    let templates = [...defaultCVTemplates];

    // Filter by industry
    if (filterIndustry !== 'all') {
      templates = templates.filter(t => 
        t.industry?.some(ind => ind.toLowerCase().includes(filterIndustry.toLowerCase()))
      );
    }

    // Filter favorites
    if (showFavoritesOnly) {
      templates = templates.filter(t => templatesMetadata[t.id]?.isFavorite);
    }

    // Sort templates
    templates.sort((a, b) => {
      switch (sortBy) {
        case 'usage':
          const usageA = templatesMetadata[a.id]?.usageCount || 0;
          const usageB = templatesMetadata[b.id]?.usageCount || 0;
          return usageB - usageA;
        case 'recent':
          const lastUsedA = templatesMetadata[a.id]?.lastUsed || '0';
          const lastUsedB = templatesMetadata[b.id]?.lastUsed || '0';
          return lastUsedB.localeCompare(lastUsedA);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return templates;
  }, [defaultCVTemplates, filterIndustry, showFavoritesOnly, sortBy, templatesMetadata]);

  // Get context-aware suggestions
  const suggestedTemplates = useMemo(() => {
    if (!context?.industry && !context?.jobTitle) return [];
    
    return filteredAndSortedTemplates
      .map(template => ({
        template,
        score: getContextRelevanceScore(template),
      }))
      .filter(item => item.score > 30)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.template);
  }, [context, filteredAndSortedTemplates, templatesMetadata]);

  const handleSelectTemplate = async (templateId: string) => {
    setSelectedTemplate(templateId);
    onSelectTemplate(templateId);

    // Record usage analytics
    const analytics: TemplateUsageAnalytics = {
      id: Date.now().toString(),
      templateId,
      templateType: 'cv',
      timestamp: new Date().toISOString(),
      context: {
        industry: context?.industry,
        jobTitle: context?.jobTitle,
      },
    };

    await StorageService.recordTemplateUsage(analytics);
    await loadData(); // Refresh metadata
  };

  const handleToggleFavorite = async (templateId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await StorageService.toggleTemplateFavorite(templateId);
    await loadData();
  };

  const handlePreview = (template: CVTemplateStyle) => {
    setPreviewTemplate(template);
  };

  const handleCreateCustomTemplate = async () => {
    if (!newTemplateName.trim()) return;

    const newTemplate: CustomTemplate = {
      id: Date.now().toString(),
      name: newTemplateName,
      type: 'cv',
      content: newTemplateContent,
      preview: '✨',
      industry: newTemplateIndustries,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        id: Date.now().toString(),
        isFavorite: false,
        usageCount: 0,
      },
    };

    await StorageService.saveCustomTemplate(newTemplate);
    await loadData();
    setShowCreateModal(false);
    resetCreateForm();
  };

  const resetCreateForm = () => {
    setNewTemplateName('');
    setNewTemplateContent('');
    setNewTemplateIndustries([]);
  };

  const handleDeleteCustomTemplate = async (templateId: string) => {
    if (confirm(t(language, 'templates.confirmDelete'))) {
      await StorageService.deleteCustomTemplate(templateId);
      await loadData();
    }
  };

  const renderTemplateCard = (template: CVTemplateStyle, isCustom: boolean = false) => {
    const metadata = templatesMetadata[template.id];
    const isFavorite = metadata?.isFavorite || false;
    const usageCount = metadata?.usageCount || 0;
    const contextScore = getContextRelevanceScore(template);

    return (
      <div
        key={template.id}
        className={`template-card enhanced ${selectedTemplate === template.id ? 'selected' : ''}`}
        onClick={() => handleSelectTemplate(template.id)}
      >
        <div className="template-header">
          <div className="template-preview-icon">{template.preview}</div>
          <button
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={(e) => handleToggleFavorite(template.id, e)}
            title={isFavorite ? t(language, 'templates.unfavorite') : t(language, 'templates.favorite')}
          >
            {isFavorite ? '⭐' : '☆'}
          </button>
        </div>
        
        <div className="template-info">
          <h3 className="template-name">{template.name}</h3>
          <p className="template-description">{template.description}</p>
          
          {contextScore > 30 && (
            <div className="context-badge">
              🎯 {Math.round(contextScore)}% Match
            </div>
          )}
          
          <div className="template-features">
            {template.features.slice(0, 3).map((feature, idx) => (
              <span key={idx} className="feature-tag">
                {feature}
              </span>
            ))}
          </div>

          {template.industry && template.industry.length > 0 && (
            <div className="template-industries">
              {template.industry.slice(0, 3).map((ind, idx) => (
                <span key={idx} className="industry-tag">
                  {ind}
                </span>
              ))}
            </div>
          )}

          <div className="template-stats">
            {usageCount > 0 && (
              <span className="usage-stat">
                📊 Used {usageCount} {usageCount === 1 ? 'time' : 'times'}
              </span>
            )}
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
            {isCustom && (
              <button
                className="btn btn-sm btn-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCustomTemplate(template.id);
                }}
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="section enhanced-template-manager">
      <h2 className="section-title">🎨 {t(language, 'templates.title')}</h2>
      <p className="section-description">{t(language, 'templates.description')}</p>

      {/* Context-Aware Suggestions */}
      {suggestedTemplates.length > 0 && (
        <div className="suggested-templates">
          <h3 className="suggestions-title">
            💡 {t(language, 'templates.suggested')}
            {context?.industry && ` for ${context.industry}`}
          </h3>
          <div className="template-grid compact">
            {suggestedTemplates.map(template => renderTemplateCard(template))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="template-controls">
        <div className="filter-group">
          <label htmlFor="industry-filter">{t(language, 'templates.filterIndustry')}:</label>
          <select
            id="industry-filter"
            value={filterIndustry}
            onChange={(e) => setFilterIndustry(e.target.value)}
            className="form-select"
          >
            <option value="all">{t(language, 'templates.allIndustries')}</option>
            {allIndustries.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort-by">{t(language, 'templates.sortBy')}:</label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="form-select"
          >
            <option value="name">{t(language, 'templates.sortName')}</option>
            <option value="usage">{t(language, 'templates.sortUsage')}</option>
            <option value="recent">{t(language, 'templates.sortRecent')}</option>
          </select>
        </div>

        <div className="filter-group">
          <label>
            <input
              type="checkbox"
              checked={showFavoritesOnly}
              onChange={(e) => setShowFavoritesOnly(e.target.checked)}
            />
            {' '}{t(language, 'templates.favoritesOnly')}
          </label>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          ➕ {t(language, 'templates.createCustom')}
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => setShowAnalytics(!showAnalytics)}
        >
          📊 {t(language, 'templates.viewAnalytics')}
        </button>
      </div>

      {/* All Templates */}
      <div className="all-templates">
        <h3>{t(language, 'templates.allTemplates')} ({filteredAndSortedTemplates.length})</h3>
        <div className="template-grid">
          {filteredAndSortedTemplates.map(template => renderTemplateCard(template))}
        </div>
      </div>

      {/* Custom Templates */}
      {customTemplates.length > 0 && (
        <div className="custom-templates">
          <h3>{t(language, 'templates.customTemplates')} ({customTemplates.length})</h3>
          <div className="template-grid">
            {customTemplates.map(template => renderTemplateCard(template as any, true))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="modal-overlay" onClick={() => setPreviewTemplate(null)}>
          <div
            className="modal-content template-preview-modal enhanced"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>{previewTemplate.name}</h3>
              <button className="modal-close" onClick={() => setPreviewTemplate(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="template-preview-details">
                <div className="preview-section">
                  <h4>{t(language, 'templates.description')}</h4>
                  <p>{previewTemplate.description}</p>
                </div>

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

                {previewTemplate.industry && previewTemplate.industry.length > 0 && (
                  <div className="preview-section">
                    <h4>{t(language, 'templates.industries')}</h4>
                    <div className="industry-tags">
                      {previewTemplate.industry.map((ind, idx) => (
                        <span key={idx} className="industry-tag">{ind}</span>
                      ))}
                    </div>
                  </div>
                )}

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

                {templatesMetadata[previewTemplate.id] && (
                  <div className="preview-section">
                    <h4>{t(language, 'templates.usage')}</h4>
                    <p>
                      <strong>Times used:</strong> {templatesMetadata[previewTemplate.id].usageCount || 0}
                    </p>
                    {templatesMetadata[previewTemplate.id].lastUsed && (
                      <p>
                        <strong>Last used:</strong>{' '}
                        {new Date(templatesMetadata[previewTemplate.id].lastUsed!).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleSelectTemplate(previewTemplate.id);
                  setPreviewTemplate(null);
                }}
              >
                {t(language, 'templates.useTemplate')}
              </button>
              <button className="btn btn-secondary" onClick={() => setPreviewTemplate(null)}>
                {t(language, 'common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Custom Template Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div
            className="modal-content custom-template-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>{t(language, 'templates.createCustom')}</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="template-name">{t(language, 'templates.templateName')}:</label>
                <input
                  id="template-name"
                  type="text"
                  className="form-control"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder={t(language, 'templates.templateNamePlaceholder')}
                />
              </div>

              <div className="form-group">
                <label htmlFor="template-content">{t(language, 'templates.templateContent')}:</label>
                <textarea
                  id="template-content"
                  className="form-control"
                  rows={6}
                  value={newTemplateContent}
                  onChange={(e) => setNewTemplateContent(e.target.value)}
                  placeholder={t(language, 'templates.templateContentPlaceholder')}
                />
              </div>

              <div className="form-group">
                <label>{t(language, 'templates.industries')}:</label>
                <div className="industry-selector">
                  {allIndustries.map(ind => (
                    <label key={ind} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newTemplateIndustries.includes(ind)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewTemplateIndustries([...newTemplateIndustries, ind]);
                          } else {
                            setNewTemplateIndustries(
                              newTemplateIndustries.filter(i => i !== ind)
                            );
                          }
                        }}
                      />
                      {' '}{ind}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={handleCreateCustomTemplate}
                disabled={!newTemplateName.trim()}
              >
                {t(language, 'templates.create')}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                {t(language, 'common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <TemplateAnalyticsView
          language={language}
          onClose={() => setShowAnalytics(false)}
        />
      )}
    </div>
  );
};

// Template Analytics Component
interface TemplateAnalyticsViewProps {
  language: Lang;
  onClose: () => void;
}

const TemplateAnalyticsView: React.FC<TemplateAnalyticsViewProps> = ({ language, onClose }) => {
  const [analytics, setAnalytics] = useState<TemplateUsageAnalytics[]>([]);
  const [templatesMetadata, setTemplatesMetadata] = useState<Record<string, TemplateMetadata>>({});

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const [analyticsData, metadata] = await Promise.all([
      StorageService.getTemplateUsageAnalytics(),
      StorageService.getAllTemplatesMetadata(),
    ]);
    setAnalytics(analyticsData);
    setTemplatesMetadata(metadata);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalUsage = Object.values(templatesMetadata).reduce(
      (sum, meta) => sum + (meta.usageCount || 0),
      0
    );

    const mostUsedTemplates = Object.entries(templatesMetadata)
      .map(([id, meta]) => ({ id, ...meta }))
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, 5);

    const industryUsage = analytics.reduce((acc, analytic) => {
      const industry = analytic.context?.industry || 'Unknown';
      acc[industry] = (acc[industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentActivity = analytics.slice(0, 10);

    return {
      totalUsage,
      mostUsedTemplates,
      industryUsage,
      recentActivity,
    };
  }, [analytics, templatesMetadata]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content analytics-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>📊 {t(language, 'templates.analytics')}</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div className="analytics-grid">
            <div className="analytics-card">
              <h4>{t(language, 'templates.totalUsage')}</h4>
              <div className="stat-value">{stats.totalUsage}</div>
            </div>

            <div className="analytics-card">
              <h4>{t(language, 'templates.uniqueTemplates')}</h4>
              <div className="stat-value">{Object.keys(templatesMetadata).length}</div>
            </div>

            <div className="analytics-card">
              <h4>{t(language, 'templates.favoriteTemplates')}</h4>
              <div className="stat-value">
                {Object.values(templatesMetadata).filter(m => m.isFavorite).length}
              </div>
            </div>
          </div>

          <div className="analytics-section">
            <h4>{t(language, 'templates.mostUsed')}</h4>
            <div className="most-used-list">
              {stats.mostUsedTemplates.map(template => {
                const templateData = defaultCVTemplates.find(t => t.id === template.id);
                return (
                  <div key={template.id} className="usage-item">
                    <span className="template-name">
                      {templateData?.preview} {templateData?.name || template.id}
                    </span>
                    <span className="usage-count">{template.usageCount} uses</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="analytics-section">
            <h4>{t(language, 'templates.industryBreakdown')}</h4>
            <div className="industry-breakdown">
              {Object.entries(stats.industryUsage)
                .sort(([, a], [, b]) => b - a)
                .map(([industry, count]) => (
                  <div key={industry} className="industry-stat">
                    <span className="industry-name">{industry}</span>
                    <div className="usage-bar">
                      <div
                        className="usage-fill"
                        style={{
                          width: `${(count / stats.totalUsage) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="usage-count">{count}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="analytics-section">
            <h4>{t(language, 'templates.recentActivity')}</h4>
            <div className="recent-activity">
              {stats.recentActivity.map(activity => {
                const templateData = defaultCVTemplates.find(t => t.id === activity.templateId);
                return (
                  <div key={activity.id} className="activity-item">
                    <span className="activity-template">
                      {templateData?.preview} {templateData?.name || activity.templateId}
                    </span>
                    <span className="activity-date">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            {t(language, 'common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
