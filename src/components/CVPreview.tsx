import React from 'react';
import { CVData, ATSOptimization } from '../types';
import { DocumentGenerator } from '../utils/documentGenerator';
import { t, Lang } from '../i18n';

interface CVPreviewProps {
  cvData: CVData;
  optimizations: ATSOptimization[];
  language: Lang;
  focusedOptimizationId?: string | null;
  templateId?: string;
}

export const CVPreview: React.FC<CVPreviewProps> = ({ cvData, optimizations, language, focusedOptimizationId, templateId = 'classic' }) => {
  const [, setTemplate] = React.useState<'Classic' | 'Modern' | 'Compact'>('Classic');
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
    const applied = optimizations.filter(o => o.applied);
    if (applied.length === 0) return text;
    let parts: Array<string | React.ReactNode> = [text];
    applied.forEach((opt, idx) => {
      const nextParts: Array<string | React.ReactNode> = [];
      parts.forEach((p) => {
        if (typeof p !== 'string') { nextParts.push(p); return; }
        const segments = p.split(new RegExp(`(${escapeRegExp(opt.optimizedText)})`, 'i'));
        segments.forEach((seg, i) => {
          if (i % 2 === 1) {
            const isFocused = opt.id === focusedOptimizationId;
            nextParts.push(
              <mark 
                key={`opt-${idx}-${i}`} 
                ref={(el) => {
                  if (el && i === 1) { // Only set ref for the first occurrence
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
                  transition: 'all 0.3s ease'
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

  const handleGoogleDoc = () => {
    alert(t(language, 'common.googleDocsMsg'));
  };

  return (
    <div className="section">
      <h2 className="section-title">
        👁️ {t(language, 'preview.title')}
      </h2>
      
      <div className={`preview-container template-${templateId}`}>
        {/* Header */}
        <div className="preview-header">
          {cvData.personalInfo.photoDataUrl && (
            <div className="preview-photo-container">
              <img src={cvData.personalInfo.photoDataUrl} alt="Profile" className="preview-photo" />
            </div>
          )}
          <div className="preview-name">
            {cvData.personalInfo.firstName} {cvData.personalInfo.middleName} {cvData.personalInfo.lastName}
          </div>
          <div className="preview-contact">
            {cvData.personalInfo.email} | {cvData.personalInfo.countryCode}{cvData.personalInfo.phoneNumber}
          </div>
          {cvData.personalInfo.linkedInUsername && (
            <div className="preview-contact">
              linkedin.com/in/{cvData.personalInfo.linkedInUsername}
              {cvData.personalInfo.githubUsername && ` | github.com/${cvData.personalInfo.githubUsername}`}
            </div>
          )}
          {cvData.personalInfo.portfolioUrl && (
            <div className="preview-contact">
              {cvData.personalInfo.portfolioUrl}
            </div>
          )}
        </div>
        
        {/* Summary */}
        {cvData.personalInfo.summary && (
          <div className="preview-section">
            <div className="preview-section-title">{t(language, 'preview.summary')}</div>
            <div className="preview-item-description">{highlightOptimized(cvData.personalInfo.summary)}</div>
          </div>
        )}
        
        {/* Skills */}
        {cvData.skills.length > 0 && (
          <div className="preview-section">
            <div className="preview-section-title">{t(language, 'preview.skills')}</div>
            <div className="preview-item-description">
              {cvData.skills.join(' • ')}
            </div>
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
                  {exp.startDate} - {exp.endDate || 'Present'} | {exp.location}
                </div>
                {exp.description && (
                  <div className="preview-item-description">
                    {exp.description.split('\n').map((line, i) => line.trim().startsWith('•') ? (
                      <div key={i}>• {highlightOptimized(line.replace(/^•\s?/, ''))}</div>
                    ) : (
                      <div key={i}>{highlightOptimized(line)}</div>
                    ))}
                  </div>
                )}
                {exp.skills.length > 0 && (
                  <div className="preview-item-description" style={{ fontSize: '12px', fontStyle: 'italic' }}>
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
                <div className="preview-item-title">
                  {edu.school}
                </div>
                <div className="preview-item-description">
                  {edu.degree} in {edu.fieldOfStudy}
                </div>
                <div className="preview-item-subtitle">
                  {edu.startDate} - {edu.endDate}
                  {edu.grade && ` | GPA: ${edu.grade}`}
                </div>
                {edu.description && (
                  <div className="preview-item-description">
                    {edu.description.split('\n').map((line, i) => line.trim().startsWith('•') ? (
                      <div key={i}>• {highlightOptimized(line.replace(/^•\s?/, ''))}</div>
                    ) : (
                      <div key={i}>{highlightOptimized(line)}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Certifications */}
        {cvData.certifications.length > 0 && (
          <div className="preview-section">
            <div className="preview-section-title">{t(language, 'preview.certificationsTitle')}</div>
            {cvData.certifications.map((cert) => (
              <div key={cert.id} className="preview-item">
                <div className="preview-item-title">
                  {cert.name}
                </div>
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
                <div className="preview-item-title">
                  {proj.name}
                </div>
                {proj.associatedWith && (
                  <div className="preview-item-subtitle">
                    {proj.associatedWith}
                  </div>
                )}
                {proj.description && (
                  <div className="preview-item-description">
                    {proj.description.split('\n').map((line, i) => line.trim().startsWith('•') ? (
                      <div key={i}>• {highlightOptimized(line.replace(/^•\s?/, ''))}</div>
                    ) : (
                      <div key={i}>{highlightOptimized(line)}</div>
                    ))}
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
        <button className="btn btn-secondary" onClick={handleGoogleDoc}>
          📄 {t(language, 'preview.exportGoogleDocs')}
        </button>
      </div>
    </div>
  );
};
