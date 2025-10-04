import React, { useState } from 'react';
import { t, Lang } from '../i18n';

interface LinkedInImporterProps {
  language: Lang;
  onImport: (jobDescription: string) => void;
  onClose: () => void;
}

export const LinkedInImporter: React.FC<LinkedInImporterProps> = ({
  language,
  onImport,
  onClose,
}) => {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pastedContent, setPastedContent] = useState('');

  const validateLinkedInUrl = (url: string): boolean => {
    const patterns = [
      /^https?:\/\/(www\.)?linkedin\.com\/jobs\/view\/\d+/,
      /^https?:\/\/(www\.)?linkedin\.com\/jobs\/collections\/recommended\/\?currentJobId=\d+/,
    ];
    
    return patterns.some(pattern => pattern.test(url));
  };

  const handleImportFromUrl = async () => {
    if (!linkedinUrl.trim()) {
      setError(t(language, 'linkedinImport.urlRequired'));
      return;
    }

    if (!validateLinkedInUrl(linkedinUrl)) {
      setError(t(language, 'linkedinImport.invalidUrl'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Note: Direct scraping of LinkedIn is blocked by CORS
      // This would require a backend proxy or browser extension with permissions
      // For now, we show instructions for manual copy-paste
      
      setError(t(language, 'linkedinImport.useManualCopy'));
      
      // Optionally open the URL in a new tab
      window.open(linkedinUrl, '_blank');
      
    } catch (err) {
      setError(t(language, 'linkedinImport.importError'));
      console.error('LinkedIn import error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportFromPaste = () => {
    if (!pastedContent.trim()) {
      setError(t(language, 'linkedinImport.contentRequired'));
      return;
    }

    // Clean up the pasted content
    const cleaned = cleanLinkedInContent(pastedContent);
    onImport(cleaned);
    onClose();
  };

  const cleanLinkedInContent = (content: string): string => {
    // Remove common LinkedIn artifacts
    let cleaned = content
      // Remove "See more" / "Show less" buttons
      .replace(/see more|show less|see all|show all/gi, '')
      // Remove LinkedIn UI elements
      .replace(/\b(posted|reposted|ago|applicants?|be among the first)\b/gi, '')
      // Remove excessive whitespace
      .replace(/\s{3,}/g, '\n\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Try to extract structured sections
    const sections = extractSections(cleaned);
    
    if (sections.length > 0) {
      return sections.join('\n\n');
    }

    return cleaned;
  };

  const extractSections = (content: string): string[] => {
    const sections: string[] = [];
    const commonHeaders = [
      'about',
      'description',
      'responsibilities',
      'requirements',
      'qualifications',
      'skills',
      'experience',
      'education',
      'benefits',
      'about us',
      'about the role',
      'what you\'ll do',
      'what we\'re looking for',
      'nice to have',
      'preferred',
    ];

    // Split by potential headers
    const lines = content.split('\n');
    let currentSection = '';

    for (const line of lines) {
      const lowerLine = line.toLowerCase().trim();
      
      // Check if line is a header
      const isHeader = commonHeaders.some(header => 
        lowerLine === header || 
        lowerLine === header + ':' ||
        lowerLine.startsWith(header + ' ')
      );

      if (isHeader && currentSection) {
        sections.push(currentSection.trim());
        currentSection = line + '\n';
      } else {
        currentSection += line + '\n';
      }
    }

    if (currentSection) {
      sections.push(currentSection.trim());
    }

    return sections;
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setPastedContent(text);
    } catch (err) {
      console.error('Clipboard access denied:', err);
      setError(t(language, 'linkedinImport.clipboardError'));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content linkedin-importer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔗 {t(language, 'linkedinImport.title')}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Instructions */}
          <div className="alert alert-info">
            <strong>{t(language, 'linkedinImport.howTo')}</strong>
            <ol style={{ marginTop: '10px', paddingLeft: '20px' }}>
              <li>{t(language, 'linkedinImport.step1')}</li>
              <li>{t(language, 'linkedinImport.step2')}</li>
              <li>{t(language, 'linkedinImport.step3')}</li>
            </ol>
          </div>

          {/* Method 1: URL Import */}
          <div className="import-section">
            <h4>📋 {t(language, 'linkedinImport.method1')}</h4>
            <div className="form-group">
              <label className="form-label">{t(language, 'linkedinImport.urlLabel')}</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://www.linkedin.com/jobs/view/..."
                value={linkedinUrl}
                onChange={(e) => {
                  setLinkedinUrl(e.target.value);
                  setError('');
                }}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={handleImportFromUrl}
              disabled={isLoading || !linkedinUrl.trim()}
            >
              {isLoading ? t(language, 'linkedinImport.opening') : t(language, 'linkedinImport.openJob')}
            </button>
          </div>

          <div className="divider-text">
            <span>{t(language, 'common.or')}</span>
          </div>

          {/* Method 2: Paste Content */}
          <div className="import-section">
            <h4>📝 {t(language, 'linkedinImport.method2')}</h4>
            <div className="form-group">
              <label className="form-label">{t(language, 'linkedinImport.pasteLabel')}</label>
              <div className="button-group">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handlePasteFromClipboard}
                >
                  📋 {t(language, 'linkedinImport.pasteFromClipboard')}
                </button>
              </div>
              <textarea
                className="form-textarea"
                style={{ minHeight: '200px', marginTop: '10px' }}
                placeholder={t(language, 'linkedinImport.pastePlaceholder')}
                value={pastedContent}
                onChange={(e) => {
                  setPastedContent(e.target.value);
                  setError('');
                }}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={handleImportFromPaste}
              disabled={!pastedContent.trim()}
            >
              {t(language, 'linkedinImport.import')}
            </button>
          </div>

          {error && (
            <div className={`alert ${error.includes('manual') ? 'alert-info' : 'alert-error'}`}>
              {error}
            </div>
          )}

          {/* Tips */}
          <div className="tips-section">
            <h5>💡 {t(language, 'linkedinImport.tips')}</h5>
            <ul>
              <li>{t(language, 'linkedinImport.tip1')}</li>
              <li>{t(language, 'linkedinImport.tip2')}</li>
              <li>{t(language, 'linkedinImport.tip3')}</li>
            </ul>
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
