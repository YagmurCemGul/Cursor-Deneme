import React, { useState } from 'react';
import { CVData, SavedPrompt } from '../types';
import { DocumentGenerator } from '../utils/documentGenerator';
import { GoogleDriveService } from '../utils/googleDriveService';
import { StorageService } from '../utils/storage';
import { t, Lang } from '../i18n';
import { defaultCoverLetterTemplates } from '../data/coverLetterTemplates';

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
  language 
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

  React.useEffect(() => {
    loadPrompts();
  }, []);

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
      createdAt: new Date().toISOString()
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
        await DocumentGenerator.generateCoverLetterDOCX(coverLetter, name, fileName, selectedTemplateId);
      } else if (format === 'pdf') {
        await DocumentGenerator.generateCoverLetterPDF(coverLetter, name, fileName, selectedTemplateId);
      }
    } catch (error) {
      console.error('Error generating document:', error);
      alert(t(language, 'common.errorGeneratingDoc'));
    }
  };

  const selectedTemplate = defaultCoverLetterTemplates.find(t => t.id === selectedTemplateId)!;

  const handleGoogleExport = async () => {
    setIsExportingToGoogle(true);
    try {
      // For cover letter, we'll export to Google Docs
      // First, create a temporary CVData object with just the cover letter content
      const result = await GoogleDriveService.exportToGoogleDocs(cvData, [], selectedTemplateId);
      
      // Update the document with cover letter content instead
      alert(`${t(language, 'googleDrive.exportSuccessCoverLetter')}\n${t(language, 'googleDrive.openFile')}`);
      window.open(result.webViewLink, '_blank');
    } catch (error: any) {
      console.error('Error exporting to Google:', error);
      if (error.message?.includes('authentication') || error.message?.includes('token')) {
        alert(t(language, 'googleDrive.authRequired'));
      } else {
        alert(t(language, 'googleDrive.exportError') + '\n' + error.message);
      }
    } finally {
      setIsExportingToGoogle(false);
    }
  };

  const folders = [t(language, 'common.all'), ...new Set(savedPrompts.map(p => p.folder))];
  const filteredPrompts = selectedFolder === t(language, 'common.all') 
    ? savedPrompts 
    : savedPrompts.filter(p => p.folder === selectedFolder);

  return (
    <div className="section">
      <h2 className="section-title">
        ✉️ {t(language, 'cover.section')}
      </h2>
      
      {/* Extra Prompt Input */}
      <div className="form-group">
        <label className="form-label">
          {t(language, 'cover.extraInstructions')}
        </label>
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
            {isGenerating ? `⏳ ${t(language, 'cover.generating')}` : `✨ ${t(language, 'cover.generate')}`}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowSavePrompt(!showSavePrompt)}
          >
            💾 {t(language, 'cover.savePrompt')}
          </button>
        </div>
      </div>
      
      {/* Save Prompt Dialog */}
      {showSavePrompt && (
        <div className="card save-prompt-card">
          <h3 className="card-subtitle">
            {t(language, 'cover.savePromptTitle')}
          </h3>
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
          <h3 className="card-subtitle">
            {t(language, 'cover.savedPrompts')}
          </h3>
          
          <div className="folder-selector">
            {folders.map(folder => (
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
            {filteredPrompts.map(prompt => (
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
                <div className="prompt-content">
                  {prompt.content}
                </div>
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
              <h3 className="subsection-title">
                {t(language, 'coverTemplates.title')}
              </h3>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setShowTemplateSelector(!showTemplateSelector)}
              >
                {showTemplateSelector ? '▼' : '▶'} {selectedTemplate?.preview} {selectedTemplate?.name}
              </button>
            </div>
            
            {showTemplateSelector && (
              <div className="template-grid">
                {defaultCoverLetterTemplates.map(template => (
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
                        <div className="template-name">{template.name}</div>
                        <div className="template-description">{template.description}</div>
                      </div>
                    </div>
                    <div className="template-features">
                      {template.features.map((feature, idx) => (
                        <span key={idx} className="feature-tag">✓ {feature}</span>
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
            <h3 className="subsection-title">
              {t(language, 'cover.preview')}
            </h3>
            
            <div 
              className="preview-container cover-letter-preview"
              style={{
                fontFamily: selectedTemplate?.style.fontFamily,
                fontSize: `${selectedTemplate?.style.fontSize}px`,
                lineHeight: selectedTemplate?.style.lineHeight,
                color: selectedTemplate?.colors.text
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
          <div className="empty-state-text">
            {t(language, 'cover.emptyState')}
          </div>
        </div>
      )}
    </div>
  );
};
