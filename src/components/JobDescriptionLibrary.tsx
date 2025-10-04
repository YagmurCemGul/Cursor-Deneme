import React, { useState, useEffect } from 'react';
import { t, Lang } from '../i18n';
import { SavedJobDescription } from '../types';
import { StorageService } from '../utils/storage';

interface JobDescriptionLibraryProps {
  language: Lang;
  onSelect: (description: string) => void;
  onClose: () => void;
}

export const JobDescriptionLibrary: React.FC<JobDescriptionLibraryProps> = ({
  language,
  onSelect,
  onClose,
}) => {
  const [jobDescriptions, setJobDescriptions] = useState<SavedJobDescription[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SavedJobDescription>>({});

  useEffect(() => {
    loadJobDescriptions();
  }, []);

  const loadJobDescriptions = async () => {
    setIsLoading(true);
    try {
      const descriptions = await StorageService.getJobDescriptions();
      setJobDescriptions(descriptions);
    } catch (error) {
      console.error('Error loading job descriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t(language, 'jobLibrary.confirmDelete'))) {
      await StorageService.deleteJobDescription(id);
      await loadJobDescriptions();
    }
  };

  const handleSelect = async (jobDesc: SavedJobDescription) => {
    await StorageService.incrementJobDescriptionUsage(jobDesc.id);
    onSelect(jobDesc.description);
    onClose();
  };

  const handleEdit = (jobDesc: SavedJobDescription) => {
    setEditingId(jobDesc.id);
    setEditForm(jobDesc);
  };

  const handleSaveEdit = async () => {
    if (editingId && editForm.name && editForm.description) {
      const updatedJobDesc: SavedJobDescription = {
        id: editingId,
        name: editForm.name,
        description: editForm.description,
        category: editForm.category,
        tags: editForm.tags,
        createdAt: editForm.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: editForm.usageCount || 0,
      };
      await StorageService.saveJobDescription(updatedJobDesc);
      setEditingId(null);
      setEditForm({});
      await loadJobDescriptions();
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const categories = Array.from(
    new Set(jobDescriptions.map((jd) => jd.category).filter(Boolean))
  );

  const filteredDescriptions = jobDescriptions.filter((jd) => {
    const matchesSearch =
      jd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jd.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jd.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || jd.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content job-library-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📚 {t(language, 'jobLibrary.title')}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Search and Filter */}
          <div className="job-library-filters">
            <input
              type="text"
              className="form-input"
              placeholder={t(language, 'jobLibrary.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">{t(language, 'jobLibrary.allCategories')}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Job Descriptions List */}
          {isLoading ? (
            <div className="loading-message">{t(language, 'common.loading')}</div>
          ) : filteredDescriptions.length === 0 ? (
            <div className="empty-state">
              <p>{t(language, 'jobLibrary.empty')}</p>
            </div>
          ) : (
            <div className="job-library-list">
              {filteredDescriptions.map((jobDesc) => (
                <div key={jobDesc.id} className="job-library-item">
                  {editingId === jobDesc.id ? (
                    // Edit Mode
                    <div className="job-library-edit">
                      <input
                        type="text"
                        className="form-input"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder={t(language, 'jobLibrary.nameLabel')}
                      />
                      <input
                        type="text"
                        className="form-input"
                        value={editForm.category || ''}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        placeholder={t(language, 'jobLibrary.categoryLabel')}
                      />
                      <textarea
                        className="form-textarea"
                        value={editForm.description || ''}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        placeholder={t(language, 'jobLibrary.descriptionLabel')}
                        rows={6}
                      />
                      <input
                        type="text"
                        className="form-input"
                        value={editForm.tags?.join(', ') || ''}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            tags: e.target.value.split(',').map((t) => t.trim()),
                          })
                        }
                        placeholder={t(language, 'jobLibrary.tagsLabel')}
                      />
                      <div className="job-library-actions">
                        <button className="btn btn-primary btn-sm" onClick={handleSaveEdit}>
                          {t(language, 'common.save')}
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={handleCancelEdit}>
                          {t(language, 'common.cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className="job-library-header">
                        <h3>{jobDesc.name}</h3>
                        {jobDesc.category && (
                          <span className="job-library-category">{jobDesc.category}</span>
                        )}
                      </div>
                      <p className="job-library-description">
                        {jobDesc.description.substring(0, 150)}
                        {jobDesc.description.length > 150 ? '...' : ''}
                      </p>
                      {jobDesc.tags && jobDesc.tags.length > 0 && (
                        <div className="job-library-tags">
                          {jobDesc.tags.map((tag, idx) => (
                            <span key={idx} className="tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="job-library-meta">
                        <span>
                          📅 {new Date(jobDesc.updatedAt).toLocaleDateString(language)}
                        </span>
                        {jobDesc.usageCount !== undefined && jobDesc.usageCount > 0 && (
                          <span>📊 {t(language, 'jobLibrary.usedTimes', { count: jobDesc.usageCount })}</span>
                        )}
                      </div>
                      <div className="job-library-actions">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleSelect(jobDesc)}
                        >
                          {t(language, 'jobLibrary.use')}
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEdit(jobDesc)}
                        >
                          {t(language, 'common.edit')}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(jobDesc.id)}
                        >
                          {t(language, 'common.delete')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
