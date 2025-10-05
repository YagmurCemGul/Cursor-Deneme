import React from 'react';
import { ResumeProfile } from '../lib/types';
import { formatDate, calculateDateDuration } from '../lib/validation';
import { getTemplateStyles, TemplateType, TemplateColors, TemplateFonts } from '../lib/templates';
import { Language } from '../lib/i18n';

interface CVPreviewProps {
  profile: ResumeProfile;
  template?: TemplateType;
  customColors?: Partial<TemplateColors>;
  customFonts?: Partial<TemplateFonts>;
  language?: Language;
}

export function CVPreview({ profile, template = 'professional', customColors, customFonts, language = 'en' }: CVPreviewProps) {
  const { personal, skills, experience, education, projects, licenses } = profile;

  const styles = getTemplateStyles(template, customColors, customFonts);
  
  // Translation helper for section titles
  const sectionTitle = (key: string) => {
    const titles: Record<string, { en: string; tr: string }> = {
      summary: { en: 'Professional Summary', tr: 'Profesyonel Özet' },
      skills: { en: 'Skills', tr: 'Yetenekler' },
      experience: { en: 'Work Experience', tr: 'İş Deneyimi' },
      education: { en: 'Education', tr: 'Eğitim' },
      projects: { en: 'Projects', tr: 'Projeler' },
      certificates: { en: 'Licenses & Certifications', tr: 'Lisanslar ve Sertifikalar' },
      present: { en: 'Present', tr: 'Devam Ediyor' }
    };
    return titles[key]?.[language] || titles[key]?.en || key;
  };

  return (
    <div style={styles.container}>
      <div id="cv-preview-content" style={styles.page}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.name}>
            {personal.firstName} {personal.middleName} {personal.lastName}
          </h1>
          <div style={styles.contactInfo}>
            {personal.email && <span>📧 {personal.email}</span>}
            {personal.phone && <span>📱 {personal.phone}</span>}
            {personal.location && <span>📍 {personal.location}</span>}
          </div>
          <div style={styles.contactInfo}>
            {personal.linkedin && (
              <span>💼 linkedin.com/in/{personal.linkedin}</span>
            )}
            {personal.github && (
              <span>💻 github.com/{personal.github}</span>
            )}
            {personal.portfolio && (
              <span>🌐 {personal.portfolio}</span>
            )}
          </div>
        </div>

        {/* Professional Summary */}
        {personal.summary && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>{sectionTitle('summary')}</h2>
            <p style={styles.summaryText}>{personal.summary}</p>
          </div>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>{sectionTitle('skills')}</h2>
            <div style={styles.skillsContainer}>
              {skills.filter(s => s.trim()).map((skill, i) => (
                <span key={i} style={styles.skillPill}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>{sectionTitle('experience')}</h2>
            {experience.map((exp, i) => (
              <div key={i} style={styles.experienceItem}>
                <div style={styles.expHeader}>
                  <div>
                    <h3 style={styles.expTitle}>{exp.title || 'Position Title'}</h3>
                    <div style={styles.expCompany}>
                      {exp.company || 'Company Name'}
                      {exp.employmentType && ` • ${exp.employmentType}`}
                      {exp.locationType && ` • ${exp.locationType}`}
                    </div>
                  </div>
                  <div style={styles.expDate}>
                    {exp.startDate ? (
                      <>
                        {formatDate(exp.startDate)} -{' '}
                        {exp.isCurrent ? sectionTitle('present') : exp.endDate ? formatDate(exp.endDate) : sectionTitle('present')}
                        <div style={styles.expDuration}>
                          {calculateDateDuration(exp.startDate, exp.endDate, exp.isCurrent)}
                        </div>
                      </>
                    ) : (
                      'Date'
                    )}
                  </div>
                </div>
                {exp.description && (
                  <div style={styles.expDescription}>
                    {exp.description.split('\n').map((line, idx) => (
                      <div key={idx} style={{ marginBottom: 4 }}>
                        {line.trim().startsWith('•') || line.trim().startsWith('-') 
                          ? line 
                          : line.trim() ? `• ${line}` : ''}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>{sectionTitle('education')}</h2>
            {education.map((edu, i) => (
              <div key={i} style={styles.educationItem}>
                <div style={styles.eduHeader}>
                  <div>
                    <h3 style={styles.eduTitle}>
                      {edu.degree || 'Degree'}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                    </h3>
                    <div style={styles.eduSchool}>{edu.school || 'School Name'}</div>
                  </div>
                  <div style={styles.eduDate}>
                    {edu.startDate && edu.endDate ? (
                      <>
                        {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                      </>
                    ) : (
                      'Date'
                    )}
                    {edu.grade && <div style={styles.eduGrade}>GPA: {edu.grade}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>{sectionTitle('projects')}</h2>
            {projects.map((proj, i) => (
              <div key={i} style={styles.projectItem}>
                <h3 style={styles.projectTitle}>{proj.name || 'Project Name'}</h3>
                {proj.description && (
                  <p style={styles.projectDesc}>{proj.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {licenses && licenses.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Certifications & Licenses</h2>
            {licenses.map((lic, i) => (
              <div key={i} style={styles.certItem}>
                <h3 style={styles.certTitle}>{lic.name || 'Certification Name'}</h3>
                <div style={styles.certOrg}>{lic.organization || 'Organization'}</div>
                {lic.credentialId && (
                  <div style={styles.certId}>ID: {lic.credentialId}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
