import React, { useState } from 'react';
import { t, Lang } from '../i18n';
import { CoverLetterVersion, UserEdit } from '../utils/advancedCoverLetterService';
import { logger } from '../utils/logger';

interface CoverLetterVersionsProps {
  language: Lang;
  versions: CoverLetterVersion[];
  onSelectVersion: (version: CoverLetterVersion) => void;
  onRecordEdit?: (edit: UserEdit) => void;
}

export const CoverLetterVersions: React.FC<CoverLetterVersionsProps> = ({
  language,
  versions,
  onSelectVersion,
  onRecordEdit,
}) => {
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    versions[0]?.id || null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [showComparison, setShowComparison] = useState(false);

  const selectedVersion = versions.find((v) => v.id === selectedVersionId);

  const handleSelectVersion = (version: CoverLetterVersion) => {
    setSelectedVersionId(version.id);
    setEditedContent(version.content);
    onSelectVersion(version);
  };

  const handleStartEdit = () => {
    if (selectedVersion) {
      setEditedContent(selectedVersion.content);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    if (selectedVersion && onRecordEdit) {
      const edit: UserEdit = {
        originalText: selectedVersion.content,
        editedText: editedContent,
        section: 'overall',
        timestamp: new Date().toISOString(),
        feedbackType: 'positive',
      };
      onRecordEdit(edit);
      logger.info('User edit recorded for learning');
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (selectedVersion) {
      setEditedContent(selectedVersion.content);
    }
  };

  const getVariantIcon = (variant: CoverLetterVersion['variant']): string => {
    const icons = {
      standard: '📄',
      brief: '📋',
      detailed: '📑',
      creative: '🎨',
    };
    return icons[variant];
  };

  const getVariantLabel = (variant: CoverLetterVersion['variant']): string => {
    return t(language, `advancedCoverLetter.variant.${variant}`);
  };

  const getToneLabel = (tone: string): string => {
    return t(language, `advancedCoverLetter.tone${tone.charAt(0).toUpperCase() + tone.slice(1)}`);
  };

  const getScoreColor = (score?: number): string => {
    if (!score) return 'gray';
    if (score >= 80) return 'green';
    if (score >= 60) return 'orange';
    return 'red';
  };

  return (
    <div className="cover-letter-versions-container">
      <div className="versions-header">
        <h3 className="subsection-title">
          🎯 {t(language, 'advancedCoverLetter.versionsTitle')}
        </h3>
        <div className="versions-header-actions">
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setShowComparison(!showComparison)}
          >
            {showComparison ? '👁️ ' : '👁️‍🗨️ '}
            {t(language, showComparison ? 'advancedCoverLetter.hideComparison' : 'advancedCoverLetter.showComparison')}
          </button>
        </div>
      </div>

      {/* Version Cards */}
      <div className="versions-grid">
        {versions.map((version) => (
          <div
            key={version.id}
            className={`version-card ${selectedVersionId === version.id ? 'selected' : ''}`}
            onClick={() => handleSelectVersion(version)}
          >
            <div className="version-card-header">
              <div className="version-card-title">
                {getVariantIcon(version.variant)} {getVariantLabel(version.variant)}
              </div>
              {version.score && (
                <div
                  className="version-score"
                  style={{ color: getScoreColor(version.score) }}
                  title={t(language, 'advancedCoverLetter.qualityScore')}
                >
                  {version.score}%
                </div>
              )}
            </div>
            <div className="version-card-meta">
              <span className="version-tone">{getToneLabel(version.tone)}</span>
              <span className="version-words">
                {version.wordCount} {t(language, 'advancedCoverLetter.words')}
              </span>
            </div>
            {selectedVersionId === version.id && (
              <div className="version-selected-badge">
                ✓ {t(language, 'advancedCoverLetter.selected')}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Version Preview */}
      {selectedVersion && (
        <div className="selected-version-preview">
          <div className="preview-header">
            <h4 className="preview-title">
              {getVariantIcon(selectedVersion.variant)} {getVariantLabel(selectedVersion.variant)}
            </h4>
            <div className="preview-actions">
              {!isEditing && (
                <button className="btn btn-sm btn-secondary" onClick={handleStartEdit}>
                  ✏️ {t(language, 'advancedCoverLetter.editVersion')}
                </button>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="edit-mode">
              <textarea
                className="form-textarea edit-textarea"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={15}
              />
              <div className="edit-actions">
                <button className="btn btn-secondary" onClick={handleCancelEdit}>
                  {t(language, 'common.cancel')}
                </button>
                <button className="btn btn-success" onClick={handleSaveEdit}>
                  💾 {t(language, 'common.save')}
                </button>
              </div>
              <div className="edit-hint">
                <small>
                  💡 {t(language, 'advancedCoverLetter.editHint')}
                </small>
              </div>
            </div>
          ) : (
            <div className="preview-content">{selectedVersion.content}</div>
          )}
        </div>
      )}

      {/* Comparison View */}
      {showComparison && versions.length > 1 && (
        <div className="comparison-view">
          <h4 className="comparison-title">
            📊 {t(language, 'advancedCoverLetter.comparisonView')}
          </h4>
          <div className="comparison-grid">
            {versions.map((version) => (
              <div key={version.id} className="comparison-column">
                <div className="comparison-header">
                  <strong>
                    {getVariantIcon(version.variant)} {getVariantLabel(version.variant)}
                  </strong>
                  {version.score && (
                    <div
                      className="comparison-score"
                      style={{ color: getScoreColor(version.score) }}
                    >
                      {version.score}%
                    </div>
                  )}
                </div>
                <div className="comparison-content">{version.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
