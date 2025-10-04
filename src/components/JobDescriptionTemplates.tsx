import React, { useState, useEffect } from 'react';
import { t, Lang } from '../i18n';
import { StorageService } from '../utils/storage';

export interface JobTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  isCustom: boolean;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

interface JobDescriptionTemplatesProps {
  language: Lang;
  onSelect: (template: string) => void;
  onClose: () => void;
}

// Built-in templates
const BUILTIN_TEMPLATES: Omit<JobTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>[] = [
  {
    name: 'Software Engineer',
    description: 'Full-stack software engineer position',
    content: `**Position:** Software Engineer

**About the Role:**
We are seeking a talented Software Engineer to join our growing team. You will be responsible for designing, developing, and maintaining high-quality software solutions.

**Key Responsibilities:**
• Design and implement scalable software solutions
• Collaborate with cross-functional teams
• Write clean, maintainable code
• Participate in code reviews and technical discussions
• Troubleshoot and debug applications

**Required Qualifications:**
• Bachelor's degree in Computer Science or related field
• 3+ years of software development experience
• Strong proficiency in [programming languages]
• Experience with modern frameworks and tools
• Excellent problem-solving skills

**Preferred Qualifications:**
• Experience with cloud platforms (AWS, Azure, GCP)
• Knowledge of DevOps practices
• Contributions to open-source projects

**What We Offer:**
• Competitive salary and benefits
• Remote work options
• Professional development opportunities
• Collaborative work environment`,
    category: 'Engineering',
    tags: ['software', 'engineering', 'development'],
    isCustom: false,
    isShared: false,
  },
  {
    name: 'Product Manager',
    description: 'Product management role',
    content: `**Position:** Product Manager

**About the Role:**
We are looking for an experienced Product Manager to drive our product strategy and execution.

**Key Responsibilities:**
• Define product vision and roadmap
• Gather and prioritize product requirements
• Work closely with engineering and design teams
• Analyze market trends and customer feedback
• Track product metrics and KPIs

**Required Qualifications:**
• 5+ years of product management experience
• Strong analytical and strategic thinking skills
• Excellent communication and leadership abilities
• Experience with Agile methodologies
• Technical background preferred

**What We Offer:**
• Competitive compensation package
• Equity options
• Health and wellness benefits
• Career growth opportunities`,
    category: 'Product',
    tags: ['product', 'management', 'strategy'],
    isCustom: false,
    isShared: false,
  },
  {
    name: 'Marketing Manager',
    description: 'Marketing and growth position',
    content: `**Position:** Marketing Manager

**About the Role:**
Join our marketing team to drive brand awareness and customer acquisition.

**Key Responsibilities:**
• Develop and execute marketing strategies
• Manage digital marketing campaigns
• Analyze campaign performance and ROI
• Collaborate with sales and product teams
• Build and maintain brand identity

**Required Qualifications:**
• 4+ years of marketing experience
• Strong understanding of digital marketing channels
• Experience with marketing automation tools
• Excellent written and verbal communication
• Data-driven mindset

**Preferred Skills:**
• SEO/SEM expertise
• Content marketing experience
• Social media marketing
• Analytics and reporting tools`,
    category: 'Marketing',
    tags: ['marketing', 'digital', 'growth'],
    isCustom: false,
    isShared: false,
  },
];

export const JobDescriptionTemplates: React.FC<JobDescriptionTemplatesProps> = ({
  language,
  onSelect,
  onClose,
}) => {
  const [templates, setTemplates] = useState<JobTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<JobTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<JobTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state for creating/editing
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formTags, setFormTags] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchQuery, selectedCategory]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const customTemplates = await StorageService.getJobTemplates();
      
      const builtinTemplates: JobTemplate[] = BUILTIN_TEMPLATES.map((template, index) => ({
        ...template,
        id: `builtin-${index}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
      }));

      setTemplates([...builtinTemplates, ...customTemplates]);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    setFilteredTemplates(filtered);
  };

  const handleUseTemplate = async (template: JobTemplate) => {
    onSelect(template.content);
    
    // Increment usage count
    if (template.isCustom) {
      await StorageService.incrementTemplateUsage(template.id);
    }
    
    onClose();
  };

  const handleCreateTemplate = async () => {
    if (!formName.trim() || !formContent.trim()) return;

    const newTemplate: JobTemplate = {
      id: Date.now().toString(),
      name: formName.trim(),
      description: formDescription.trim(),
      content: formContent.trim(),
      category: formCategory.trim() || 'Other',
      tags: formTags.split(',').map((t) => t.trim()).filter(Boolean),
      isCustom: true,
      isShared: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
    };

    await StorageService.saveJobTemplate(newTemplate);
    await loadTemplates();
    resetForm();
    setShowCreateModal(false);
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate || !formName.trim() || !formContent.trim()) return;

    const updatedTemplate: JobTemplate = {
      ...editingTemplate,
      name: formName.trim(),
      description: formDescription.trim(),
      content: formContent.trim(),
      category: formCategory.trim() || 'Other',
      tags: formTags.split(',').map((t) => t.trim()).filter(Boolean),
      updatedAt: new Date().toISOString(),
    };

    await StorageService.updateJobTemplate(updatedTemplate);
    await loadTemplates();
    resetForm();
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!window.confirm(t(language, 'jobTemplates.confirmDelete'))) return;

    await StorageService.deleteJobTemplate(templateId);
    await loadTemplates();
  };

  const handleEdit = (template: JobTemplate) => {
    setEditingTemplate(template);
    setFormName(template.name);
    setFormDescription(template.description);
    setFormContent(template.content);
    setFormCategory(template.category);
    setFormTags(template.tags.join(', '));
  };

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormContent('');
    setFormCategory('');
    setFormTags('');
  };

  const handleExportTemplate = (template: JobTemplate) => {
    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `template-${template.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportTemplate = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported: JobTemplate = JSON.parse(text);
      
      const newTemplate: JobTemplate = {
        ...imported,
        id: Date.now().toString(),
        isCustom: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await StorageService.saveJobTemplate(newTemplate);
      await loadTemplates();
    } catch (error) {
      console.error('Failed to import template:', error);
      alert(t(language, 'jobTemplates.importError'));
    }
  };

  const categories = ['all', ...new Set(templates.map((t) => t.category))];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content job-templates-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📚 {t(language, 'jobTemplates.title')}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Action Bar */}
          <div className="templates-actions">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowCreateModal(true)}
            >
              ➕ {t(language, 'jobTemplates.create')}
            </button>
            <label className="btn btn-secondary btn-sm">
              📥 {t(language, 'jobTemplates.import')}
              <input
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleImportTemplate}
              />
            </label>
          </div>

          {/* Filters */}
          <div className="templates-filters">
            <input
              type="text"
              className="form-input"
              placeholder={t(language, 'jobTemplates.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? t(language, 'jobTemplates.allCategories') : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Templates List */}
          {loading ? (
            <div className="loading-message">{t(language, 'common.loading')}</div>
          ) : filteredTemplates.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-text">{t(language, 'jobTemplates.noTemplates')}</div>
            </div>
          ) : (
            <div className="templates-list">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="template-item-card">
                  <div className="template-item-header">
                    <div>
                      <h4>{template.name}</h4>
                      {template.isCustom && <span className="badge badge-custom">Custom</span>}
                    </div>
                    <span className="template-category">{template.category}</span>
                  </div>
                  
                  <p className="template-description">{template.description}</p>
                  
                  {template.tags.length > 0 && (
                    <div className="template-tags">
                      {template.tags.map((tag, idx) => (
                        <span key={idx} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="template-meta">
                    <span>{t(language, 'jobTemplates.used')}: {template.usageCount}</span>
                  </div>

                  <div className="template-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleUseTemplate(template)}
                    >
                      {t(language, 'jobTemplates.use')}
                    </button>
                    {template.isCustom && (
                      <>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEdit(template)}
                        >
                          {t(language, 'common.edit')}
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleExportTemplate(template)}
                        >
                          📤
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          {t(language, 'common.delete')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || editingTemplate) && (
          <div className="modal-overlay" onClick={() => {
            setShowCreateModal(false);
            setEditingTemplate(null);
            resetForm();
          }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  {editingTemplate
                    ? t(language, 'jobTemplates.editTemplate')
                    : t(language, 'jobTemplates.createTemplate')}
                </h3>
                <button
                  className="modal-close"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTemplate(null);
                    resetForm();
                  }}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">{t(language, 'jobTemplates.name')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={t(language, 'jobTemplates.namePlaceholder')}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t(language, 'jobTemplates.description')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder={t(language, 'jobTemplates.descriptionPlaceholder')}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t(language, 'jobTemplates.category')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder={t(language, 'jobTemplates.categoryPlaceholder')}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t(language, 'jobTemplates.tags')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder={t(language, 'jobTemplates.tagsPlaceholder')}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t(language, 'jobTemplates.content')}</label>
                  <textarea
                    className="form-textarea"
                    style={{ minHeight: '300px' }}
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder={t(language, 'jobTemplates.contentPlaceholder')}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTemplate(null);
                    resetForm();
                  }}
                >
                  {t(language, 'common.cancel')}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                  disabled={!formName.trim() || !formContent.trim()}
                >
                  {editingTemplate ? t(language, 'common.update') : t(language, 'common.save')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
