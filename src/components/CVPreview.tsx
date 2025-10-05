import React from 'react';
import { CVData, ATSOptimization } from '../types';
import { DocumentGenerator } from '../utils/documentGenerator';
import { GoogleDriveService } from '../utils/googleDriveService';
import { t, Lang } from '../i18n';

interface CVPreviewProps {
  cvData: CVData;
  optimizations: ATSOptimization[];
  language: Lang;
  focusedOptimizationId?: string | null;
  templateId?: string;
}

export const CVPreview: React.FC<CVPreviewProps> = ({
  cvData,
  optimizations,
  language,
  focusedOptimizationId,
  templateId = 'classic',
}) => {
  const highlightRefs = React.useRef<Map<string, HTMLElement>>(new Map());

  // Scroll to focused optimization
  React.useEffect(() => {
    if (focusedOptimizationId) {
      const element = highlightRefs.current.get(focusedOptimizationId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [focusedOptimizationId]);

  const highlightOptimized = (text: string): React.ReactNode => {
    if (!text) return null;
    const applied = optimizations.filter((o) => o.applied);
    if (applied.length === 0) return text;
    let parts: Array<string | React.ReactNode> = [text];
    applied.forEach((opt, idx) => {
      const nextParts: Array<string | React.ReactNode> = [];
      parts.forEach((p) => {
        if (typeof p !== 'string') {
          nextParts.push(p);
          return;
        }
        const segments = p.split(new RegExp(`(${escapeRegExp(opt.optimizedText)})`, 'i'));
        segments.forEach((seg, i) => {
          if (i % 2 === 1) {
            const isFocused = opt.id === focusedOptimizationId;
            nextParts.push(
              <mark
                key={`opt-${idx}-${i}`}
                ref={(el) => {
                  if (el && i === 1) {
                    // Only set ref for the first occurrence
                    highlightRefs.current.set(opt.id, el);
                  }
                }}
                className={isFocused ? 'highlight-focused' : 'highlight-default'}
                style={{
                  backgroundColor: isFocused ? '#10b981' : '#fef08a',
                  color: isFocused ? 'white' : 'inherit',
                  fontWeight: isFocused ? '600' : 'normal',
                  padding: isFocused ? '2px 4px' : '0',
                  borderRadius: isFocused ? '3px' : '0',
                  transition: 'all 0.3s ease',
                }}
              >
                {seg}
              </mark>
            );
          } else {
            nextParts.push(seg);
          }
        });
      });
      parts = nextParts;
    });
    return parts;
  };

  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const handleDownload = async (format: 'docx' | 'pdf') => {
    const fileName = DocumentGenerator.generateProfessionalFileName(cvData, 'cv', format);

    try {
      if (format === 'docx') {
        await DocumentGenerator.generateDOCX(cvData, optimizations, fileName, templateId);
      } else if (format === 'pdf') {
        await DocumentGenerator.generatePDF(cvData, optimizations, fileName, templateId);
      }
    } catch (error) {
      console.error('Error generating document:', error);
      alert(t(language, 'common.errorGeneratingDoc'));
    }
  };

  const [isExportingToGoogle, setIsExportingToGoogle] = React.useState(false);
  const [showGoogleOptions, setShowGoogleOptions] = React.useState(false);

  const handleGoogleExport = async (exportType: 'docs' | 'sheets' | 'slides') => {
    setIsExportingToGoogle(true);
    try {
      let result;

      switch (exportType) {
        case 'docs':
          result = await GoogleDriveService.exportToGoogleDocs(cvData, optimizations, templateId);
          alert(
            `${t(language, 'googleDrive.exportSuccess')}\n${t(language, 'googleDrive.openFile')}`
          );
          window.open(result.webViewLink, '_blank');
          break;

        case 'sheets':
          result = await GoogleDriveService.exportToGoogleSheets(cvData);
          alert(
            `${t(language, 'googleDrive.exportSuccessSheets')}\n${t(language, 'googleDrive.openFile')}`
          );
          window.open(result.webViewLink, '_blank');
          break;

        case 'slides':
          result = await GoogleDriveService.exportToGoogleSlides(cvData);
          alert(
            `${t(language, 'googleDrive.exportSuccessSlides')}\n${t(language, 'googleDrive.openFile')}`
          );
          window.open(result.webViewLink, '_blank');
          break;
      }
    } catch (error: any) {
      console.error('Error exporting to Google:', error);
      if (error.message?.includes('authentication') || error.message?.includes('token')) {
        alert(t(language, 'googleDrive.authRequired'));
      } else {
        alert(t(language, 'googleDrive.exportError') + '\n' + error.message);
      }
    } finally {
      setIsExportingToGoogle(false);
      setShowGoogleOptions(false);
    }
  };

  return (
    <div className="section">
      <h2 className="section-title">👁️ {t(language, 'preview.title')}</h2>

      <div className={`preview-container template-${templateId}`}>
        {/* Header */}
        <div className="preview-header">
          {cvData.personalInfo.photoDataUrl && (
            <div className="preview-photo-container">
              <img src={cvData.personalInfo.photoDataUrl} alt="Profile" className="preview-photo" />
            </div>
          )}
          <div className="preview-name">
            {cvData.personalInfo.firstName} {cvData.personalInfo.middleName}{' '}
            {cvData.personalInfo.lastName}
          </div>
          <div className="preview-contact">
            {cvData.personalInfo.email} | {cvData.personalInfo.countryCode}
            {cvData.personalInfo.phoneNumber}
          </div>
          {cvData.personalInfo.linkedInUsername && (
            <div className="preview-contact">
              linkedin.com/in/{cvData.personalInfo.linkedInUsername}
              {cvData.personalInfo.githubUsername &&
                ` | github.com/${cvData.personalInfo.githubUsername}`}
            </div>
          )}
          {cvData.personalInfo.portfolioUrl && (
            <div className="preview-contact">{cvData.personalInfo.portfolioUrl}</div>
          )}
        </div>

        {/* Summary */}
        {cvData.personalInfo.summary && (
          <div className="preview-section">
            <div className="preview-section-title">{t(language, 'preview.summary')}</div>
            <div className="preview-item-description">
              {highlightOptimized(cvData.personalInfo.summary)}
            </div>
          </div>
        )}

        {/* Skills */}
        {cvData.skills.length > 0 && (
          <div className="preview-section">
            <div className="preview-section-title">{t(language, 'preview.skills')}</div>
            <div className="preview-item-description">{cvData.skills.join(' • ')}</div>
          </div>
        )}

        {/* Experience */}
        {cvData.experience.length > 0 && (
          <div className="preview-section">
            <div className="preview-section-title">{t(language, 'preview.experienceTitle')}</div>
            {cvData.experience.map((exp) => (
              <div key={exp.id} className="preview-item">
                <div className="preview-item-title">
                  {exp.title} | {exp.company}
                </div>
                <div className="preview-item-subtitle">
                  {exp.startDate} -{' '}
                  {exp.currentlyWorking
                    ? t(language, 'experience.present')
                    : exp.endDate || t(language, 'experience.present')}{' '}
                  | {exp.location}
                </div>
                {exp.description && (
                  <div className="preview-item-description">
                    {exp.description
                      .split('\n')
                      .map((line, i) =>
                        line.trim().startsWith('•') ? (
                          <div key={i}>• {highlightOptimized(line.replace(/^•\s?/, ''))}</div>
                        ) : (
                          <div key={i}>{highlightOptimized(line)}</div>
                        )
                      )}
                  </div>
                )}
                {exp.skills.length > 0 && (
                  <div
                    className="preview-item-description"
                    style={{ fontSize: '12px', fontStyle: 'italic' }}
                  >
                    Skills: {exp.skills.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {cvData.education.length > 0 && (
          <div className="preview-section">
            <div className="preview-section-title">{t(language, 'preview.educationTitle')}</div>
            {cvData.education.map((edu) => (
              <div key={edu.id} className="preview-item">
                <div className="preview-item-title">{edu.school}</div>
                <div className="preview-item-description">
                  {edu.degree} in {edu.fieldOfStudy}
                </div>
                <div className="preview-item-subtitle">
                  {edu.startDate} -{' '}
                  {edu.currentlyStudying ? t(language, 'education.expected') : edu.endDate}
                  {edu.grade && ` | GPA: ${edu.grade}`}
                </div>
                {edu.description && (
                  <div className="preview-item-description">
                    {edu.description
                      .split('\n')
                      .map((line, i) =>
                        line.trim().startsWith('•') ? (
                          <div key={i}>• {highlightOptimized(line.replace(/^•\s?/, ''))}</div>
                        ) : (
                          <div key={i}>{highlightOptimized(line)}</div>
                        )
                      )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {cvData.certifications.length > 0 && (
          <div className="preview-section">
            <div className="preview-section-title">
              {t(language, 'preview.certificationsTitle')}
            </div>
            {cvData.certifications.map((cert) => (
              <div key={cert.id} className="preview-item">
                <div className="preview-item-title">{cert.name}</div>
                <div className="preview-item-subtitle">
                  {cert.issuingOrganization}
                  {cert.issueDate && ` | ${t(language, 'preview.issued')}: ${cert.issueDate}`}
                  {cert.credentialId && ` | ${t(language, 'preview.id')}: ${cert.credentialId}`}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {cvData.projects.length > 0 && (
          <div className="preview-section">
            <div className="preview-section-title">{t(language, 'preview.projectsTitle')}</div>
            {cvData.projects.map((proj) => (
              <div key={proj.id} className="preview-item">
                <div className="preview-item-title">{proj.name}</div>
                {(proj.startDate || proj.endDate || proj.associatedWith) && (
                  <div className="preview-item-subtitle">
                    {proj.startDate &&
                      `${proj.startDate} - ${proj.currentlyWorking ? t(language, 'experience.present') : proj.endDate || t(language, 'experience.present')}`}
                    {proj.startDate && proj.associatedWith && ' | '}
                    {proj.associatedWith}
                  </div>
                )}
                {proj.description && (
                  <div className="preview-item-description">
                    {proj.description
                      .split('\n')
                      .map((line, i) =>
                        line.trim().startsWith('•') ? (
                          <div key={i}>• {highlightOptimized(line.replace(/^•\s?/, ''))}</div>
                        ) : (
                          <div key={i}>{highlightOptimized(line)}</div>
                        )
                      )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="download-options">
        <button className="btn btn-primary" onClick={() => handleDownload('pdf')}>
          📥 {t(language, 'preview.downloadPdf')}
        </button>
        <button className="btn btn-primary" onClick={() => handleDownload('docx')}>
          📥 {t(language, 'preview.downloadDocx')}
        </button>
        <div
          className="google-export-container"
          style={{ position: 'relative', display: 'inline-block' }}
        >
          <button
            className="btn btn-secondary"
            onClick={() => setShowGoogleOptions(!showGoogleOptions)}
            disabled={isExportingToGoogle}
          >
            {isExportingToGoogle ? '⏳' : '☁️'} {t(language, 'preview.exportGoogle')}
          </button>
          {showGoogleOptions && (
            <div
              className="google-export-dropdown"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 1000,
                minWidth: '200px',
                padding: '8px',
              }}
            >
              <button
                className="btn btn-secondary"
                style={{ width: '100%', marginBottom: '4px', justifyContent: 'flex-start' }}
                onClick={() => handleGoogleExport('docs')}
              >
                📄 {t(language, 'preview.exportGoogleDocs')}
              </button>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', marginBottom: '4px', justifyContent: 'flex-start' }}
                onClick={() => handleGoogleExport('sheets')}
              >
                📊 {t(language, 'preview.exportGoogleSheets')}
              </button>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start' }}
                onClick={() => handleGoogleExport('slides')}
              >
                📽️ {t(language, 'preview.exportGoogleSlides')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
