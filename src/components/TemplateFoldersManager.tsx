import React, { useState, useEffect } from 'react';
import { StorageService } from '../utils/storage';
import { t, Lang } from '../i18n';
import { TemplateFolder, TemplateCategory, CustomTemplate } from '../types';

interface TemplateFoldersManagerProps {
  language: Lang;
  onClose: () => void;
  onOrganized?: () => void;
}

export const TemplateFoldersManager: React.FC<TemplateFoldersManagerProps> = ({
  language,
  onClose,
  onOrganized,
}) => {
  const [activeTab, setActiveTab] = useState<'folders' | 'categories'>('folders');
  const [folders, setFolders] = useState<TemplateFolder[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [templates, setTemplates] = useState<CustomTemplate[]>([]);
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingFolder, setEditingFolder] = useState<TemplateFolder | null>(null);
  const [editingCategory, setEditingCategory] = useState<TemplateCategory | null>(null);

  // Folder form state
  const [folderForm, setFolderForm] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    icon: '📁',
    parentId: ''
  });

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: '🏷️',
    color: '#8b5cf6',
    templates: [] as string[]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [foldersList, categoriesList, templatesList] = await Promise.all([
      StorageService.getTemplateFolders(),
      StorageService.getTemplateCategories(),
      StorageService.getCustomTemplates()
    ]);

    setFolders(foldersList);
    setCategories(categoriesList);
    setTemplates(templatesList);
  };

  const resetFolderForm = () => {
    setFolderForm({
      name: '',
      description: '',
      color: '#3b82f6',
      icon: '📁',
      parentId: ''
    });
    setEditingFolder(null);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      icon: '🏷️',
      color: '#8b5cf6',
      templates: []
    });
    setEditingCategory(null);
  };

  const handleSaveFolder = async () => {
    if (!folderForm.name) {
      alert(t(language, 'folders.nameRequired'));
      return;
    }

    const folder: TemplateFolder = {
      id: editingFolder?.id || Date.now().toString(),
      name: folderForm.name,
      description: folderForm.description,
      parentId: folderForm.parentId || undefined,
      color: folderForm.color,
      icon: folderForm.icon,
      createdAt: editingFolder?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: editingFolder?.order || folders.length
    };

    await StorageService.saveTemplateFolder(folder);
    await loadData();
    resetFolderForm();
    setShowAddFolder(false);

    if (onOrganized) onOrganized();
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (confirm(t(language, 'folders.confirmDelete'))) {
      await StorageService.deleteTemplateFolder(folderId);
      await loadData();
      if (onOrganized) onOrganized();
    }
  };

  const handleEditFolder = (folder: TemplateFolder) => {
    setEditingFolder(folder);
    setFolderForm({
      name: folder.name,
      description: folder.description || '',
      color: folder.color || '#3b82f6',
      icon: folder.icon || '📁',
      parentId: folder.parentId || ''
    });
    setShowAddFolder(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name) {
      alert(t(language, 'categories.nameRequired'));
      return;
    }

    const category: TemplateCategory = {
      id: editingCategory?.id || Date.now().toString(),
      name: categoryForm.name,
      description: categoryForm.description,
      icon: categoryForm.icon,
      color: categoryForm.color,
      templates: categoryForm.templates,
      createdAt: editingCategory?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await StorageService.saveTemplateCategory(category);
    await loadData();
    resetCategoryForm();
    setShowAddCategory(false);

    if (onOrganized) onOrganized();
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm(t(language, 'categories.confirmDelete'))) {
      await StorageService.deleteTemplateCategory(categoryId);
      await loadData();
      if (onOrganized) onOrganized();
    }
  };

  const handleEditCategory = (category: TemplateCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '🏷️',
      color: category.color || '#8b5cf6',
      templates: category.templates || []
    });
    setShowAddCategory(true);
  };

  const handleMoveTemplateToFolder = async (templateId: string, folderId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const updated = { ...template, folderId: folderId || undefined };
      await StorageService.saveCustomTemplate(updated);
      await loadData();
      if (onOrganized) onOrganized();
    }
  };

  const toggleTemplateInCategory = (templateId: string) => {
    setCategoryForm(prev => ({
      ...prev,
      templates: prev.templates.includes(templateId)
        ? prev.templates.filter(id => id !== templateId)
        : [...prev.templates, templateId]
    }));
  };

  const getTemplatesInFolder = (folderId: string) => {
    return templates.filter(t => t.folderId === folderId);
  };

  const getTemplatesNotInFolders = () => {
    return templates.filter(t => !t.folderId);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content folders-manager-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>🗂️ {t(language, 'folders.title')}</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'folders' ? 'active' : ''}`}
              onClick={() => setActiveTab('folders')}
            >
              📁 {t(language, 'folders.folders')} ({folders.length})
            </button>
            <button
              className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              🏷️ {t(language, 'folders.categories')} ({categories.length})
            </button>
          </div>

          {/* Folders Tab */}
          {activeTab === 'folders' && (
            <div className="folders-section">
              <div className="section-header">
                <p>{t(language, 'folders.foldersDesc')}</p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    resetFolderForm();
                    setShowAddFolder(!showAddFolder);
                  }}
                >
                  {showAddFolder ? t(language, 'common.cancel') : t(language, 'folders.addFolder')}
                </button>
              </div>

              {/* Add/Edit Folder Form */}
              {showAddFolder && (
                <div className="folder-form">
                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label htmlFor="folder-name">{t(language, 'folders.folderName')}*</label>
                      <input
                        id="folder-name"
                        type="text"
                        className="form-control"
                        value={folderForm.name}
                        onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
                        placeholder={t(language, 'folders.folderNamePlaceholder')}
                      />
                    </div>

                    <div className="form-group" style={{ width: '100px' }}>
                      <label htmlFor="folder-icon">{t(language, 'folders.icon')}</label>
                      <input
                        id="folder-icon"
                        type="text"
                        className="form-control text-center"
                        value={folderForm.icon}
                        onChange={(e) => setFolderForm({ ...folderForm, icon: e.target.value })}
                        maxLength={2}
                      />
                    </div>

                    <div className="form-group" style={{ width: '100px' }}>
                      <label htmlFor="folder-color">{t(language, 'folders.color')}</label>
                      <input
                        id="folder-color"
                        type="color"
                        className="form-control"
                        value={folderForm.color}
                        onChange={(e) => setFolderForm({ ...folderForm, color: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="folder-description">{t(language, 'folders.description')}</label>
                    <textarea
                      id="folder-description"
                      className="form-control"
                      rows={2}
                      value={folderForm.description}
                      onChange={(e) => setFolderForm({ ...folderForm, description: e.target.value })}
                      placeholder={t(language, 'folders.descriptionPlaceholder')}
                    />
                  </div>

                  <div className="form-actions">
                    <button className="btn btn-primary" onClick={handleSaveFolder}>
                      {editingFolder ? t(language, 'common.save') : t(language, 'folders.create')}
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowAddFolder(false)}>
                      {t(language, 'common.cancel')}
                    </button>
                  </div>
                </div>
              )}

              {/* Folders List */}
              <div className="folders-list">
                {folders.length === 0 ? (
                  <div className="no-folders">
                    <p>{t(language, 'folders.noFolders')}</p>
                  </div>
                ) : (
                  folders.map(folder => (
                    <div key={folder.id} className="folder-card" style={{ borderLeft: `4px solid ${folder.color}` }}>
                      <div className="folder-header">
                        <div className="folder-title">
                          <span className="folder-icon">{folder.icon}</span>
                          <div>
                            <h5>{folder.name}</h5>
                            {folder.description && <p className="folder-desc">{folder.description}</p>}
                          </div>
                        </div>
                        <div className="folder-actions">
                          <button className="btn-icon" onClick={() => handleEditFolder(folder)}>
                            ✏️
                          </button>
                          <button className="btn-icon" onClick={() => handleDeleteFolder(folder.id)}>
                            🗑️
                          </button>
                        </div>
                      </div>

                      <div className="folder-templates">
                        <strong>{t(language, 'folders.templatesInFolder')} ({getTemplatesInFolder(folder.id).length}):</strong>
                        {getTemplatesInFolder(folder.id).length === 0 ? (
                          <p className="empty-folder">{t(language, 'folders.emptyFolder')}</p>
                        ) : (
                          <div className="template-chips">
                            {getTemplatesInFolder(folder.id).map(template => (
                              <span key={template.id} className="template-chip">
                                {template.name}
                                <button
                                  className="chip-remove"
                                  onClick={() => handleMoveTemplateToFolder(template.id, '')}
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Move templates to folder */}
                      {getTemplatesNotInFolders().length > 0 && (
                        <div className="move-to-folder">
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleMoveTemplateToFolder(e.target.value, folder.id);
                                e.target.value = '';
                              }
                            }}
                            className="form-control-sm"
                          >
                            <option value="">{t(language, 'folders.addTemplate')}</option>
                            {getTemplatesNotInFolders().map(template => (
                              <option key={template.id} value={template.id}>
                                {template.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="categories-section">
              <div className="section-header">
                <p>{t(language, 'folders.categoriesDesc')}</p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    resetCategoryForm();
                    setShowAddCategory(!showAddCategory);
                  }}
                >
                  {showAddCategory ? t(language, 'common.cancel') : t(language, 'folders.addCategory')}
                </button>
              </div>

              {/* Add/Edit Category Form */}
              {showAddCategory && (
                <div className="category-form">
                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label htmlFor="category-name">{t(language, 'folders.categoryName')}*</label>
                      <input
                        id="category-name"
                        type="text"
                        className="form-control"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        placeholder={t(language, 'folders.categoryNamePlaceholder')}
                      />
                    </div>

                    <div className="form-group" style={{ width: '100px' }}>
                      <label htmlFor="category-icon">{t(language, 'folders.icon')}</label>
                      <input
                        id="category-icon"
                        type="text"
                        className="form-control text-center"
                        value={categoryForm.icon}
                        onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                        maxLength={2}
                      />
                    </div>

                    <div className="form-group" style={{ width: '100px' }}>
                      <label htmlFor="category-color">{t(language, 'folders.color')}</label>
                      <input
                        id="category-color"
                        type="color"
                        className="form-control"
                        value={categoryForm.color}
                        onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="category-description">{t(language, 'folders.description')}</label>
                    <textarea
                      id="category-description"
                      className="form-control"
                      rows={2}
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      placeholder={t(language, 'folders.descriptionPlaceholder')}
                    />
                  </div>

                  <div className="form-group">
                    <label>{t(language, 'folders.selectTemplates')}</label>
                    <div className="template-checkboxes">
                      {templates.map(template => (
                        <label key={template.id} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={categoryForm.templates.includes(template.id)}
                            onChange={() => toggleTemplateInCategory(template.id)}
                          />
                          {template.name}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button className="btn btn-primary" onClick={handleSaveCategory}>
                      {editingCategory ? t(language, 'common.save') : t(language, 'folders.create')}
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowAddCategory(false)}>
                      {t(language, 'common.cancel')}
                    </button>
                  </div>
                </div>
              )}

              {/* Categories List */}
              <div className="categories-list">
                {categories.length === 0 ? (
                  <div className="no-categories">
                    <p>{t(language, 'folders.noCategories')}</p>
                  </div>
                ) : (
                  categories.map(category => (
                    <div key={category.id} className="category-card" style={{ borderLeft: `4px solid ${category.color}` }}>
                      <div className="category-header">
                        <div className="category-title">
                          <span className="category-icon">{category.icon}</span>
                          <div>
                            <h5>{category.name}</h5>
                            {category.description && <p className="category-desc">{category.description}</p>}
                          </div>
                        </div>
                        <div className="category-actions">
                          <button className="btn-icon" onClick={() => handleEditCategory(category)}>
                            ✏️
                          </button>
                          <button className="btn-icon" onClick={() => handleDeleteCategory(category.id)}>
                            🗑️
                          </button>
                        </div>
                      </div>

                      <div className="category-templates">
                        <strong>{t(language, 'folders.templatesInCategory')} ({category.templates.length}):</strong>
                        {category.templates.length === 0 ? (
                          <p className="empty-category">{t(language, 'folders.emptyCategory')}</p>
                        ) : (
                          <div className="template-chips">
                            {category.templates.map(templateId => {
                              const template = templates.find(t => t.id === templateId);
                              return template ? (
                                <span key={templateId} className="template-chip">
                                  {template.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
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
