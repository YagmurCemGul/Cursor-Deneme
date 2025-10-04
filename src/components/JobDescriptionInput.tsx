import React, { useState } from 'react';
import { t, Lang } from '../i18n';
import { JobDescriptionLibrary } from './JobDescriptionLibrary';
import { StorageService } from '../utils/storage';
import { SavedJobDescription } from '../types';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  language: Lang;
}

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  value,
  onChange,
  language,
}) => {
  const [showLibrary, setShowLibrary] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveCategory, setSaveCategory] = useState('');
  const [saveTags, setSaveTags] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = async () => {
    if (!saveName.trim() || !value.trim()) {
      setSaveMessage(t(language, 'jobLibrary.saveError'));
      return;
    }

    const jobDesc: SavedJobDescription = {
      id: Date.now().toString(),
      name: saveName.trim(),
      description: value,
      category: saveCategory.trim() || '',
      tags: saveTags.split(',').map((t) => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
    };

    try {
      await StorageService.saveJobDescription(jobDesc);
      setSaveMessage(t(language, 'jobLibrary.saveSuccess'));
      setTimeout(() => {
        setShowSaveDialog(false);
        setSaveName('');
        setSaveCategory('');
        setSaveTags('');
        setSaveMessage('');
      }, 1500);
    } catch (error) {
      console.error('Error saving job description:', error);
      setSaveMessage(t(language, 'jobLibrary.saveError'));
    }
  };

  const handleLoadFromLibrary = (description: string) => {
    onChange(description);
    setShowLibrary(false);
  };

  return (
    <div className="section">
      <h2 className="section-title">💼 {t(language, 'job.section')}</h2>

      <div className="form-group">
        <label className="form-label">{t(language, 'job.paste')}</label>
        <div className="job-description-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowLibrary(true)}
            title={t(language, 'jobLibrary.loadFromLibrary')}
          >
            📚 {t(language, 'jobLibrary.loadFromLibrary')}
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowSaveDialog(true)}
            disabled={!value.trim()}
            title={t(language, 'jobLibrary.saveToLibrary')}
          >
            💾 {t(language, 'jobLibrary.saveToLibrary')}
          </button>
        </div>
        <textarea
          className="form-textarea"
          placeholder={t(language, 'job.placeholder')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ minHeight: '200px' }}
        />
      </div>

      <div className="alert alert-info">💡 {t(language, 'job.tipFull')}</div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="modal-overlay" onClick={() => setShowSaveDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t(language, 'jobLibrary.saveDialogTitle')}</h3>
              <button className="modal-close" onClick={() => setShowSaveDialog(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">{t(language, 'jobLibrary.nameLabel')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder={t(language, 'jobLibrary.namePlaceholder')}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t(language, 'jobLibrary.categoryLabel')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={saveCategory}
                  onChange={(e) => setSaveCategory(e.target.value)}
                  placeholder={t(language, 'jobLibrary.categoryPlaceholder')}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t(language, 'jobLibrary.tagsLabel')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={saveTags}
                  onChange={(e) => setSaveTags(e.target.value)}
                  placeholder={t(language, 'jobLibrary.tagsPlaceholder')}
                />
              </div>
              {saveMessage && (
                <div
                  className={`alert ${saveMessage.includes(t(language, 'jobLibrary.saveSuccess')) ? 'alert-success' : 'alert-error'}`}
                >
                  {saveMessage}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowSaveDialog(false)}>
                {t(language, 'common.cancel')}
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                {t(language, 'common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Library Modal */}
      {showLibrary && (
        <JobDescriptionLibrary
          language={language}
          onSelect={handleLoadFromLibrary}
          onClose={() => setShowLibrary(false)}
        />
      )}
    </div>
  );
};
