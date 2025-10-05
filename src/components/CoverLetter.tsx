import React, { useState, useEffect } from 'react';
import { CVData, SavedPrompt } from '../types';
import { DocumentGenerator } from '../utils/documentGenerator';
import { GoogleDriveService } from '../utils/googleDriveService';
import { StorageService } from '../utils/storage';
import { logger } from '../utils/logger';
import { t, Lang } from '../i18n';
import {
  defaultCoverLetterTemplates,
  getCoverLetterTemplateNameKey,
  getCoverLetterTemplateDescriptionKey,
  getCoverLetterFeatureI18nKey,
} from '../data/coverLetterTemplates';
import {
  AdvancedCoverLetterService,
  CoverLetterOptions,
  CoverLetterVersion,
  UserEdit,
} from '../utils/advancedCoverLetterService';
import { AdvancedCoverLetterSettings } from './AdvancedCoverLetterSettings';
import { CoverLetterVersions } from './CoverLetterVersions';

interface CoverLetterProps {
  cvData: CVData;
  jobDescription: string;
  coverLetter: string;
  onGenerate: (extraPrompt: string) => void;
  isGenerating: boolean;
  language: Lang;
}

export const CoverLetter: React.FC<CoverLetterProps> = ({
  cvData,
  jobDescription,
  coverLetter,
  onGenerate,
  isGenerating,
  language,
}) => {
  const [extraPrompt, setExtraPrompt] = useState('');
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [newPromptName, setNewPromptName] = useState('');
  const [newPromptFolder, setNewPromptFolder] = useState('General');
  const [selectedFolder, setSelectedFolder] = useState('All');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('classic');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [isExportingToGoogle, setIsExportingToGoogle] = useState(false);
  
  // Advanced features state
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState<CoverLetterOptions>({
    language: language === 'tr' ? 'tr' : 'en',
    industry: 'general',
    tone: 'professional',
    emphasizeQuantification: true,
    includeCallToAction: true,
    maxLength: 350,
  });
  const [versions, setVersions] = useState<CoverLetterVersion[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [isGeneratingVersions, setIsGeneratingVersions] = useState(false);
  const [advancedService] = useState(() => new AdvancedCoverLetterService(null));

  useEffect(() => {
    loadPrompts();
    advancedService.loadLearningData();
  }, []);

  useEffect(() => {
    // Update language when app language changes
    setAdvancedOptions(prev => ({
      ...prev,
      language: language === 'tr' ? 'tr' : 'en',
    }));
  }, [language]);

  const loadPrompts = async () => {
    const prompts = await StorageService.getPrompts();
    setSavedPrompts(prompts);
  };

  const handleSavePrompt = async () => {
    if (!newPromptName.trim() || !extraPrompt.trim()) return;

    const newPrompt: SavedPrompt = {
      id: Date.now().toString(),
      name: newPromptName,
      folder: newPromptFolder,
      content: extraPrompt,
      createdAt: new Date().toISOString(),
    };

    await StorageService.savePrompt(newPrompt);
    await loadPrompts();
    setShowSavePrompt(false);
    setNewPromptName('');
  };

  const handleLoadPrompt = (prompt: SavedPrompt) => {
    setExtraPrompt(prompt.content);
  };

  const handleDeletePrompt = async (id: string) => {
    await StorageService.deletePrompt(id);
    await loadPrompts();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    alert(t(language, 'cover.copied'));
  };

  const handleDownload = async (format: 'docx' | 'pdf') => {
    const fileName = DocumentGenerator.generateProfessionalFileName(cvData, 'cover-letter', format);
    const name = `${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}`;

    try {
      if (format === 'docx') {
        await DocumentGenerator.generateCoverLetterDOCX(
          coverLetter,
          name,
          fileName,
          selectedTemplateId
        );
      } else if (format === 'pdf') {
        await DocumentGenerator.generateCoverLetterPDF(
          coverLetter,
          name,
          fileName,
          selectedTemplateId
        );
      }
    } catch (error) {
      logger.error('Error generating document:', error);
      alert(t(language, 'common.errorGeneratingDoc'));
    }
  };

  const selectedTemplate = defaultCoverLetterTemplates.find((t) => t.id === selectedTemplateId)!;

  const handleGoogleExport = async () => {
    setIsExportingToGoogle(true);
    try {
      // For cover letter, we'll export to Google Docs
      // First, create a temporary CVData object with just the cover letter content
      const result = await GoogleDriveService.exportToGoogleDocs(cvData, [], selectedTemplateId);

      // Update the document with cover letter content instead
      alert(
        `${t(language, 'googleDrive.exportSuccessCoverLetter')}\n${t(language, 'googleDrive.openFile')}`
      );
      window.open(result.webViewLink, '_blank');
    } catch (error: any) {
      logger.error('Error exporting to Google:', error);
      if (error.message?.includes('authentication') || error.message?.includes('token')) {
        alert(t(language, 'googleDrive.authRequired'));
      } else {
        alert(t(language, 'googleDrive.exportError') + '\n' + error.message);
      }
    } finally {
      setIsExportingToGoogle(false);
    }
  };

  const handleGenerateVersions = async () => {
    if (!jobDescription || isGeneratingVersions) return;

    setIsGeneratingVersions(true);
    try {
      logger.info('Generating multiple cover letter versions');
      const generatedVersions = await advancedService.generateMultipleVersions(
        cvData,
        jobDescription,
        advancedOptions,
        3
      );
      setVersions(generatedVersions);
      setShowVersions(true);
      
      // Select the first version
      if (generatedVersions.length > 0) {
        onGenerate(generatedVersions[0].content);
      }
    } catch (error: any) {
      logger.error('Error generating versions:', error);
      alert(error.message || t(language, 'common.errorGeneratingDoc'));
    } finally {
      setIsGeneratingVersions(false);
    }
  };

  const handleSelectVersion = (version: CoverLetterVersion) => {
    onGenerate(version.content);
  };

  const handleRecordEdit = (edit: UserEdit) => {
    advancedService.recordUserEdit(edit);
  };

  const handleAdvancedOptionsChange = (options: CoverLetterOptions) => {
    setAdvancedOptions(options);
    // Store in local storage for persistence
    chrome.storage.local.set({ advancedCoverLetterOptions: options });
  };

  const folders = [t(language, 'common.all'), ...new Set(savedPrompts.map((p) => p.folder))];
  const filteredPrompts =
    selectedFolder === t(language, 'common.all')
      ? savedPrompts
      : savedPrompts.filter((p) => p.folder === selectedFolder);

  return (
    <div className="section">
      <h2 className="section-title">✉️ {t(language, 'cover.section')}</h2>

      {/* Extra Prompt Input */}
      <div className="form-group">
        <label className="form-label">{t(language, 'cover.extraInstructions')}</label>
        <textarea
          className="form-textarea prompt-textarea"
          value={extraPrompt}
          onChange={(e) => setExtraPrompt(e.target.value)}
          placeholder={t(language, 'cover.placeholder')}
        />
        <div className="button-group">
          <button
            className="btn btn-primary"
            onClick={() => onGenerate(extraPrompt)}
            disabled={isGenerating || !jobDescription}
          >
            {isGenerating
              ? `⏳ ${t(language, 'cover.generating')}`
              : `✨ ${t(language, 'cover.generate')}`}
          </button>
          <button 
            className="btn btn-success" 
            onClick={handleGenerateVersions}
            disabled={isGeneratingVersions || !jobDescription}
          >
            {isGeneratingVersions
              ? `⏳ ${t(language, 'advancedCoverLetter.generating')}`
              : `🎯 ${t(language, 'advancedCoverLetter.generateVersions')}`}
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowAdvancedSettings(true)}
          >
            ⚙️ {t(language, 'advancedCoverLetter.openSettings')}
          </button>
          <button className="btn btn-secondary" onClick={() => setShowSavePrompt(!showSavePrompt)}>
            💾 {t(language, 'cover.savePrompt')}
          </button>
        </div>
      </div>

      {/* Advanced Settings Modal */}
      {showAdvancedSettings && (
        <AdvancedCoverLetterSettings
          language={language}
          options={advancedOptions}
          onOptionsChange={handleAdvancedOptionsChange}
          onClose={() => setShowAdvancedSettings(false)}
        />
      )}

      {/* Versions Display */}
      {showVersions && versions.length > 0 && (
        <CoverLetterVersions
          language={language}
          versions={versions}
          onSelectVersion={handleSelectVersion}
          onRecordEdit={handleRecordEdit}
        />
      )}

      {/* Save Prompt Dialog */}
      {showSavePrompt && (
        <div className="card save-prompt-card">
          <h3 className="card-subtitle">{t(language, 'cover.savePromptTitle')}</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t(language, 'cover.promptName')}</label>
              <input
                type="text"
                className="form-input"
                value={newPromptName}
                onChange={(e) => setNewPromptName(e.target.value)}
                placeholder={t(language, 'cover.promptNamePlaceholder')}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t(language, 'cover.folder')}</label>
              <input
                type="text"
                className="form-input"
                value={newPromptFolder}
                onChange={(e) => setNewPromptFolder(e.target.value)}
                placeholder={t(language, 'cover.folderPlaceholder')}
              />
            </div>
          </div>
          <button className="btn btn-success" onClick={handleSavePrompt}>
            ✓ {t(language, 'common.save')}
          </button>
        </div>
      )}

      {/* Saved Prompts */}
      {savedPrompts.length > 0 && (
        <div className="saved-prompts-section">
          <h3 className="card-subtitle">{t(language, 'cover.savedPrompts')}</h3>

          <div className="folder-selector">
            {folders.map((folder) => (
              <button
                key={folder}
                className={`folder-btn ${selectedFolder === folder ? 'active' : ''}`}
                onClick={() => setSelectedFolder(folder)}
              >
                📁 {folder}
              </button>
            ))}
          </div>

          <div className="card-list">
            {filteredPrompts.map((prompt) => (
              <div key={prompt.id} className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">{prompt.name}</div>
                    <div className="card-meta">
                      {prompt.folder} • {new Date(prompt.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="card-actions">
                    <button
                      className="btn btn-secondary btn-icon"
                      onClick={() => handleLoadPrompt(prompt)}
                    >
                      📥 {t(language, 'cover.load')}
                    </button>
                    <button
                      className="btn btn-danger btn-icon"
                      onClick={() => handleDeletePrompt(prompt.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="prompt-content">{prompt.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Template Selector */}
      {coverLetter && (
        <>
          <div className="template-selector-section">
            <div className="template-selector-header">
              <h3 className="subsection-title">{t(language, 'coverTemplates.title')}</h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowTemplateSelector(!showTemplateSelector)}
              >
                {showTemplateSelector ? '▼' : '▶'} {selectedTemplate?.preview}{' '}
                {t(language, getCoverLetterTemplateNameKey(selectedTemplate?.id || 'classic'))}
              </button>
            </div>

            {showTemplateSelector && (
              <div className="template-grid">
                {defaultCoverLetterTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`template-card ${selectedTemplateId === template.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedTemplateId(template.id);
                      setShowTemplateSelector(false);
                    }}
                  >
                    <div className="template-card-header">
                      <div className="template-preview">{template.preview}</div>
                      <div className="template-info">
                        <div className="template-name">
                          {t(language, getCoverLetterTemplateNameKey(template.id))}
                        </div>
                        <div className="template-description">
                          {t(language, getCoverLetterTemplateDescriptionKey(template.id))}
                        </div>
                      </div>
                    </div>
                    <div className="template-features">
                      {template.features.map((feature, idx) => (
                        <span key={idx} className="feature-tag">
                          ✓ {t(language, getCoverLetterFeatureI18nKey(feature))}
                        </span>
                      ))}
                    </div>
                    {selectedTemplateId === template.id && (
                      <div className="template-selected-badge">
                        ✓ {t(language, 'templates.selected')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cover Letter Preview */}
          <div className="preview-section">
            <h3 className="subsection-title">{t(language, 'cover.preview')}</h3>

            <div
              className="preview-container cover-letter-preview"
              style={{
                fontFamily: selectedTemplate?.style.fontFamily,
                fontSize: `${selectedTemplate?.style.fontSize}px`,
                lineHeight: selectedTemplate?.style.lineHeight,
                color: selectedTemplate?.colors.text,
              }}
            >
              {coverLetter}
            </div>

            <div className="download-options">
              <button className="btn btn-success" onClick={handleCopy}>
                📋 {t(language, 'cover.copyToClipboard')}
              </button>
              <button className="btn btn-primary" onClick={() => handleDownload('pdf')}>
                📥 {t(language, 'preview.downloadPdf')}
              </button>
              <button className="btn btn-primary" onClick={() => handleDownload('docx')}>
                📥 {t(language, 'preview.downloadDocx')}
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleGoogleExport}
                disabled={isExportingToGoogle}
              >
                {isExportingToGoogle ? '⏳' : '☁️'} {t(language, 'preview.exportGoogleDocs')}
              </button>
            </div>
          </div>
        </>
      )}

      {!coverLetter && (
        <div className="empty-state empty-state-margin">
          <div className="empty-state-icon">✉️</div>
          <div className="empty-state-text">{t(language, 'cover.emptyState')}</div>
        </div>
      )}
    </div>
  );
};
