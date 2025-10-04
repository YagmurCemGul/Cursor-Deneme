import React, { useState, useEffect } from 'react';
import { StorageService } from '../utils/storage';
import { t, Lang } from '../i18n';
import { TemplateFolder, TemplateCategory, CustomTemplate } from '../types';

interface TemplateFolderManagerProps {
  language: Lang;
  onClose: () => void;
  onFolderSelect?: (folderId: string) => void;
}

export const TemplateFolderManager: React.FC<TemplateFolderManagerProps> = ({
  language,
  onClose,
  onFolderSelect,
}) => {
  const [folders, setFolders] = useState<TemplateFolder[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [templates, setTemplates] = useState<CustomTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<'folders' | 'categories'>('folders');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Folder form state
  const [folderName, setFolderName] = useState('');
  const [folderDescription, setFolderDescription] = useState('');
  const [folderColor, setFolderColor] = useState('#3b82f6');
  const [folderIcon, setFolderIcon] = useState('📁');
  
  // Category form state
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryColor, setCategoryColor] = useState('#3b82f6');
  const [categoryIcon, setCategoryIcon] = useState('🏷️');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [foldersData, categoriesData, templatesData] = await Promise.all([
      StorageService.getTemplateFolders(),
      StorageService.getTemplateCategories(),
      StorageService.getCustomTemplates()
    ]);

    setFolders(foldersData);
    setCategories(categoriesData);
    setTemplates(templatesData);
  };

  const resetFolderForm = () => {
    setFolderName('');
    setFolderDescription('');
    setFolderColor('#3b82f6');
    setFolderIcon('📁');
    setEditingId(null);
  };

  const resetCategoryForm = () => {
    setCategoryName('');
    setCategoryDescription('');
    setCategoryColor('#3b82f6');
    setCategoryIcon('🏷️');
    setEditingId(null);
  };

  const handleSaveFolder = async () => {
    if (!folderName.trim()) {
      alert(t(language, 'folders.nameRequired'));
      return;
    }

    const folder: TemplateFolder = {
      id: editingId || Date.now().toString(),
      name: folderName,
      description: folderDescription,
      color: folderColor,
      icon: folderIcon,
      createdAt: editingId ? folders.find(f => f.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: editingId ? folders.find(f => f.id === editingId)?.order || folders.length : folders.length
    };

    await StorageService.saveTemplateFolder(folder);
    await loadData();
    resetFolderForm();
    setShowAddForm(false);
  };

  const handleEditFolder = (folder: TemplateFolder) => {
    setFolderName(folder.name);
    setFolderDescription(folder.description || '');
    setFolderColor(folder.color || '#3b82f6');
    setFolderIcon(folder.icon || '📁');
    setEditingId(folder.id);
    setShowAddForm(true);
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (confirm(t(language, 'folders.confirmDelete'))) {
      await StorageService.deleteTemplateFolder(folderId);
      await loadData();
    }
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      alert(t(language, 'categories.nameRequired'));
      return;
    }

    const category: TemplateCategory = {
      id: editingId || Date.now().toString(),
      name: categoryName,
      description: categoryDescription,
      icon: categoryIcon,
      color: categoryColor,
      templates: editingId ? categories.find(c => c.id === editingId)?.templates || [] : [],
      createdAt: editingId ? categories.find(c => c.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await StorageService.saveTemplateCategory(category);
    await loadData();
    resetCategoryForm();
    setShowAddForm(false);
  };

  const handleEditCategory = (category: TemplateCategory) => {
    setCategoryName(category.name);
    setCategoryDescription(category.description || '');
    setCategoryColor(category.color || '#3b82f6');
    setCategoryIcon(category.icon || '🏷️');
    setEditingId(category.id);
    setShowAddForm(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm(t(language, 'categories.confirmDelete'))) {
      await StorageService.deleteTemplateCategory(categoryId);
      await loadData();
    }
  };

  const getTemplatesInFolder = (folderId: string) => {
    return templates.filter(t => t.folderId === folderId).length;
  };

  const getTemplatesInCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.templates.length || 0;
  };

  const colorPresets = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
  const iconPresets = ['📁', '📂', '🗂️', '📋', '📦', '🎯', '⭐', '🏷️', '📌', '🔖', '💼', '🎨'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content folder-manager-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>📂 {t(language, 'folders.title')}</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'folders' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('folders');
                setShowAddForm(false);
                resetFolderForm();
                resetCategoryForm();
              }}
            >
              📁 {t(language, 'folders.folders')}
            </button>
            <button
              className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('categories');
                setShowAddForm(false);
                resetFolderForm();
                resetCategoryForm();
              }}
            >
              🏷️ {t(language, 'folders.categories')}
            </button>
          </div>

          {/* Folders Tab */}
          {activeTab === 'folders' && (
            <div className="tab-content">
              <div className="section-header">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setShowAddForm(!showAddForm);
                    resetFolderForm();
                  }}
                >
                  {showAddForm ? t(language, 'common.cancel') : `➕ ${t(language, 'folders.addFolder')}`}
                </button>
              </div>

              {showAddForm && (
                <div className="add-form">
                  <div className="form-group">
                    <label htmlFor="folder-name">{t(language, 'folders.name')}*</label>
                    <input
                      id="folder-name"
                      type="text"
                      className="form-control"
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                      placeholder={t(language, 'folders.namePlaceholder')}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="folder-description">{t(language, 'folders.description')}</label>
                    <textarea
                      id="folder-description"
                      className="form-control"
                      rows={2}
                      value={folderDescription}
                      onChange={(e) => setFolderDescription(e.target.value)}
                      placeholder={t(language, 'folders.descriptionPlaceholder')}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{t(language, 'folders.icon')}</label>
                      <div className="icon-picker">
                        {iconPresets.map(icon => (
                          <button
                            key={icon}
                            type="button"
                            className={`icon-option ${folderIcon === icon ? 'selected' : ''}`}
                            onClick={() => setFolderIcon(icon)}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>{t(language, 'folders.color')}</label>
                      <div className="color-picker">
                        {colorPresets.map(color => (
                          <button
                            key={color}
                            type="button"
                            className={`color-option ${folderColor === color ? 'selected' : ''}`}
                            style={{ backgroundColor: color }}
                            onClick={() => setFolderColor(color)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      className="btn btn-primary"
                      onClick={handleSaveFolder}
                      disabled={!folderName.trim()}
                    >
                      {editingId ? t(language, 'folders.update') : t(language, 'folders.create')}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowAddForm(false);
                        resetFolderForm();
                      }}
                    >
                      {t(language, 'common.cancel')}
                    </button>
                  </div>
                </div>
              )}

              <div className="folders-list">
                {folders.length === 0 ? (
                  <div className="empty-state">
                    <p>{t(language, 'folders.noFolders')}</p>
                  </div>
                ) : (
                  folders.map(folder => (
                    <div key={folder.id} className="folder-item">
                      <div 
                        className="folder-icon" 
                        style={{ backgroundColor: folder.color }}
                      >
                        {folder.icon}
                      </div>
                      <div className="folder-info">
                        <h5>{folder.name}</h5>
                        {folder.description && <p>{folder.description}</p>}
                        <span className="folder-count">
                          {getTemplatesInFolder(folder.id)} {t(language, 'folders.templates')}
                        </span>
                      </div>
                      <div className="folder-actions">
                        <button
                          className="btn-icon"
                          onClick={() => handleEditFolder(folder)}
                          title={t(language, 'folders.edit')}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleDeleteFolder(folder.id)}
                          title={t(language, 'folders.delete')}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="tab-content">
              <div className="section-header">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setShowAddForm(!showAddForm);
                    resetCategoryForm();
                  }}
                >
                  {showAddForm ? t(language, 'common.cancel') : `➕ ${t(language, 'folders.addCategory')}`}
                </button>
              </div>

              {showAddForm && (
                <div className="add-form">
                  <div className="form-group">
                    <label htmlFor="category-name">{t(language, 'folders.name')}*</label>
                    <input
                      id="category-name"
                      type="text"
                      className="form-control"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      placeholder={t(language, 'folders.namePlaceholder')}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="category-description">{t(language, 'folders.description')}</label>
                    <textarea
                      id="category-description"
                      className="form-control"
                      rows={2}
                      value={categoryDescription}
                      onChange={(e) => setCategoryDescription(e.target.value)}
                      placeholder={t(language, 'folders.descriptionPlaceholder')}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{t(language, 'folders.icon')}</label>
                      <div className="icon-picker">
                        {iconPresets.map(icon => (
                          <button
                            key={icon}
                            type="button"
                            className={`icon-option ${categoryIcon === icon ? 'selected' : ''}`}
                            onClick={() => setCategoryIcon(icon)}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>{t(language, 'folders.color')}</label>
                      <div className="color-picker">
                        {colorPresets.map(color => (
                          <button
                            key={color}
                            type="button"
                            className={`color-option ${categoryColor === color ? 'selected' : ''}`}
                            style={{ backgroundColor: color }}
                            onClick={() => setCategoryColor(color)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      className="btn btn-primary"
                      onClick={handleSaveCategory}
                      disabled={!categoryName.trim()}
                    >
                      {editingId ? t(language, 'folders.update') : t(language, 'folders.create')}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowAddForm(false);
                        resetCategoryForm();
                      }}
                    >
                      {t(language, 'common.cancel')}
                    </button>
                  </div>
                </div>
              )}

              <div className="categories-list">
                {categories.length === 0 ? (
                  <div className="empty-state">
                    <p>{t(language, 'folders.noCategories')}</p>
                  </div>
                ) : (
                  categories.map(category => (
                    <div key={category.id} className="category-item">
                      <div 
                        className="category-icon" 
                        style={{ backgroundColor: category.color }}
                      >
                        {category.icon}
                      </div>
                      <div className="category-info">
                        <h5>{category.name}</h5>
                        {category.description && <p>{category.description}</p>}
                        <span className="category-count">
                          {getTemplatesInCategory(category.id)} {t(language, 'folders.templates')}
                        </span>
                      </div>
                      <div className="category-actions">
                        <button
                          className="btn-icon"
                          onClick={() => handleEditCategory(category)}
                          title={t(language, 'folders.edit')}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleDeleteCategory(category.id)}
                          title={t(language, 'folders.delete')}
                        >
                          🗑️
                        </button>
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
