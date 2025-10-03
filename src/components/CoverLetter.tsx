import React, { useState } from 'react';
import { CVData, SavedPrompt } from '../types';
import { DocumentGenerator } from '../utils/documentGenerator';
import { StorageService } from '../utils/storage';

interface CoverLetterProps {
  cvData: CVData;
  jobDescription: string;
  coverLetter: string;
  onGenerate: (extraPrompt: string) => void;
  isGenerating: boolean;
}

export const CoverLetter: React.FC<CoverLetterProps> = ({ 
  cvData, 
  jobDescription, 
  coverLetter, 
  onGenerate,
  isGenerating 
}) => {
  const [extraPrompt, setExtraPrompt] = useState('');
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [newPromptName, setNewPromptName] = useState('');
  const [newPromptFolder, setNewPromptFolder] = useState('General');
  const [selectedFolder, setSelectedFolder] = useState('All');

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
    alert('Cover letter copied to clipboard!');
  };

  const handleDownload = async (format: 'docx' | 'pdf') => {
    const fileName = DocumentGenerator.generateProfessionalFileName(cvData, 'cover-letter', format);
    const name = `${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}`;
    
    try {
      if (format === 'docx') {
        await DocumentGenerator.generateCoverLetterDOCX(coverLetter, name, fileName);
      } else if (format === 'pdf') {
        await DocumentGenerator.generateCoverLetterPDF(coverLetter, name, fileName);
      }
    } catch (error) {
      console.error('Error generating document:', error);
      alert('Error generating document. Please try again.');
    }
  };

  const handleGoogleDoc = () => {
    alert('Google Docs export: This feature requires Google Docs API integration. The DOCX file can be uploaded to Google Drive and opened with Google Docs.');
  };

  const folders = ['All', ...new Set(savedPrompts.map(p => p.folder))];
  const filteredPrompts = selectedFolder === 'All' 
    ? savedPrompts 
    : savedPrompts.filter(p => p.folder === selectedFolder);

  return (
    <div className="section">
      <h2 className="section-title">
        ✉️ Cover Letter
      </h2>
      
      {/* Extra Prompt Input */}
      <div className="form-group">
        <label className="form-label">
          Extra Instructions (Optional)
        </label>
        <textarea
          className="form-textarea"
          value={extraPrompt}
          onChange={(e) => setExtraPrompt(e.target.value)}
          placeholder="Add any specific requirements or tone preferences for the cover letter..."
          style={{ minHeight: '100px' }}
        />
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => onGenerate(extraPrompt)}
            disabled={isGenerating || !jobDescription}
          >
            {isGenerating ? '⏳ Generating...' : '✨ Generate Cover Letter'}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowSavePrompt(!showSavePrompt)}
          >
            💾 Save Prompt
          </button>
        </div>
      </div>
      
      {/* Save Prompt Dialog */}
      {showSavePrompt && (
        <div className="card" style={{ marginTop: '15px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
            Save Prompt
          </h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Prompt Name</label>
              <input
                type="text"
                className="form-input"
                value={newPromptName}
                onChange={(e) => setNewPromptName(e.target.value)}
                placeholder="e.g., Formal Tone"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Folder</label>
              <input
                type="text"
                className="form-input"
                value={newPromptFolder}
                onChange={(e) => setNewPromptFolder(e.target.value)}
                placeholder="e.g., General, Tech Jobs"
              />
            </div>
          </div>
          <button className="btn btn-success" onClick={handleSavePrompt}>
            ✓ Save
          </button>
        </div>
      )}
      
      {/* Saved Prompts */}
      {savedPrompts.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
            Saved Prompts
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
                      📥 Load
                    </button>
                    <button
                      className="btn btn-danger btn-icon"
                      onClick={() => handleDeletePrompt(prompt.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '10px' }}>
                  {prompt.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Cover Letter Preview */}
      {coverLetter && (
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '15px' }}>
            Preview
          </h3>
          
          <div className="preview-container" style={{ whiteSpace: 'pre-line' }}>
            {coverLetter}
          </div>
          
          <div className="download-options">
            <button className="btn btn-success" onClick={handleCopy}>
              📋 Copy to Clipboard
            </button>
            <button className="btn btn-primary" onClick={() => handleDownload('pdf')}>
              📥 Download PDF
            </button>
            <button className="btn btn-primary" onClick={() => handleDownload('docx')}>
              📥 Download DOCX
            </button>
            <button className="btn btn-secondary" onClick={handleGoogleDoc}>
              📄 Export to Google Docs
            </button>
          </div>
        </div>
      )}
      
      {!coverLetter && (
        <div className="empty-state" style={{ marginTop: '20px' }}>
          <div className="empty-state-icon">✉️</div>
          <div className="empty-state-text">
            No cover letter generated yet. Fill in your CV and job description, then click "Generate Cover Letter".
          </div>
        </div>
      )}
    </div>
  );
};
