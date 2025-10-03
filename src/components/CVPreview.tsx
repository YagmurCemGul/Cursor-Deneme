import React from 'react';
import { CVData, ATSOptimization } from '../types';
import { DocumentGenerator } from '../utils/documentGenerator';
import { notifyError, notifyInfo } from '../utils/notify';
import { t } from '../i18n';

interface CVPreviewProps {
  cvData: CVData;
  optimizations: ATSOptimization[];
}

export const CVPreview: React.FC<CVPreviewProps> = ({ cvData, optimizations }) => {
  const [template, setTemplate] = React.useState<'Classic' | 'Modern' | 'Compact'>('Classic');
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
            nextParts.push(<mark key={`opt-${idx}-${i}`} style={{ backgroundColor: '#fef08a' }}>{seg}</mark>);
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
        await DocumentGenerator.generateDOCX(cvData, optimizations, fileName);
      } else if (format === 'pdf') {
        await DocumentGenerator.generatePDF(cvData, optimizations, fileName);
      }
    } catch (error) {
      console.error('Error generating document:', error);
      notifyError(t((document.body.dataset.lang as any) || 'en', 'msg.docGenError'));
    }
  };

  const handleGoogleDoc = () => {
    notifyInfo(t((document.body.dataset.lang as any) || 'en', 'msg.docGoogleInfo'));
  };

  return (
    <div className="section">
      <h2 className="section-title">
        👁️ CV Preview
      </h2>
      
      <div className={`preview-container template-${template.toLowerCase()}`}>
        {/* Header */}
        <div className="preview-header">
          {cvData.personalInfo.photoDataUrl && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <img src={cvData.personalInfo.photoDataUrl} alt="Profile" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
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
            <div className="preview-section-title">Summary</div>
            <div className="preview-item-description">{highlightOptimized(cvData.personalInfo.summary)}</div>
          </div>
        )}
        
        {/* Skills */}
        {cvData.skills.length > 0 && (
          <div className="preview-section">
            <div className="preview-section-title">Skills</div>
            <div className="preview-item-description">
              {cvData.skills.join(' • ')}
            </div>
          </div>
        )}
        
        {/* Experience */}
        {cvData.experience.length > 0 && (
          <div className="preview-section">
            <div className="preview-section-title">Experience</div>
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
            <div className="preview-section-title">Education</div>
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
            <div className="preview-section-title">Certifications</div>
            {cvData.certifications.map((cert) => (
              <div key={cert.id} className="preview-item">
                <div className="preview-item-title">
                  {cert.name}
                </div>
                <div className="preview-item-subtitle">
                  {cert.issuingOrganization}
                  {cert.issueDate && ` | Issued: ${cert.issueDate}`}
                  {cert.credentialId && ` | ID: ${cert.credentialId}`}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Projects */}
        {cvData.projects.length > 0 && (
          <div className="preview-section">
            <div className="preview-section-title">Projects</div>
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
          📥 Download PDF
        </button>
        <button className="btn btn-primary" onClick={() => handleDownload('docx')}>
          📥 Download DOCX
        </button>
        {/* Template selector */}
        <select className="form-select" style={{ minWidth: 180 }} title="Template" value={template} onChange={(e) => setTemplate(e.target.value as any)}>
          <option value="Classic">Classic</option>
          <option value="Modern">Modern</option>
          <option value="Compact">Compact</option>
        </select>
        <button className="btn btn-secondary" onClick={handleGoogleDoc}>
          📄 Export to Google Docs
        </button>
      </div>
    </div>
  );
};
