import React from 'react';
import { ResumeProfile } from '../lib/types';
import { formatDate, calculateDateDuration } from '../lib/validation';

interface CVPreviewProps {
  profile: ResumeProfile;
  template?: 'professional' | 'modern' | 'minimal';
}

export function CVPreview({ profile, template = 'professional' }: CVPreviewProps) {
  const { personal, skills, experience, education, projects, licenses } = profile;

  const styles = getTemplateStyles(template);

  return (
    <div style={styles.container}>
      <div style={styles.page}>
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
            <h2 style={styles.sectionTitle}>Professional Summary</h2>
            <p style={styles.summaryText}>{personal.summary}</p>
          </div>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Skills</h2>
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
            <h2 style={styles.sectionTitle}>Work Experience</h2>
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
                        {exp.isCurrent ? 'Present' : exp.endDate ? formatDate(exp.endDate) : 'Present'}
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
            <h2 style={styles.sectionTitle}>Education</h2>
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
            <h2 style={styles.sectionTitle}>Projects</h2>
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

function getTemplateStyles(template: 'professional' | 'modern' | 'minimal') {
  const baseStyles = {
    container: {
      width: '100%',
      height: '100%',
      background: '#f5f5f5',
      padding: '20px',
      overflowY: 'auto' as const,
    },
    page: {
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      background: 'white',
      padding: '40px',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)',
      minHeight: '1056px', // A4 height
      fontFamily: "'Arial', sans-serif",
      fontSize: '13px',
      lineHeight: '1.5',
      color: '#333',
    },
    header: {
      borderBottom: '2px solid #667eea',
      paddingBottom: '16px',
      marginBottom: '24px',
    },
    name: {
      margin: '0 0 8px 0',
      fontSize: '32px',
      fontWeight: 700,
      color: '#1e293b',
      letterSpacing: '-0.5px',
    },
    contactInfo: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '16px',
      fontSize: '12px',
      color: '#64748b',
      marginTop: '8px',
    },
    section: {
      marginBottom: '24px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 700,
      color: '#667eea',
      textTransform: 'uppercase' as const,
      letterSpacing: '1px',
      marginBottom: '12px',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '6px',
    },
    summaryText: {
      margin: 0,
      color: '#475569',
      lineHeight: '1.6',
    },
    skillsContainer: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '8px',
    },
    skillPill: {
      padding: '4px 12px',
      background: '#f1f5f9',
      border: '1px solid #cbd5e1',
      borderRadius: '4px',
      fontSize: '12px',
      color: '#475569',
    },
    experienceItem: {
      marginBottom: '20px',
    },
    expHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '8px',
    },
    expTitle: {
      margin: '0 0 4px 0',
      fontSize: '15px',
      fontWeight: 600,
      color: '#1e293b',
    },
    expCompany: {
      fontSize: '13px',
      color: '#64748b',
      fontWeight: 500,
    },
    expDate: {
      fontSize: '12px',
      color: '#64748b',
      textAlign: 'right' as const,
      minWidth: '140px',
    },
    expDuration: {
      fontSize: '11px',
      color: '#94a3b8',
      marginTop: '2px',
    },
    expDescription: {
      fontSize: '12px',
      color: '#475569',
      lineHeight: '1.6',
      marginTop: '8px',
    },
    educationItem: {
      marginBottom: '16px',
    },
    eduHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    eduTitle: {
      margin: '0 0 4px 0',
      fontSize: '14px',
      fontWeight: 600,
      color: '#1e293b',
    },
    eduSchool: {
      fontSize: '13px',
      color: '#64748b',
    },
    eduDate: {
      fontSize: '12px',
      color: '#64748b',
      textAlign: 'right' as const,
      minWidth: '140px',
    },
    eduGrade: {
      fontSize: '11px',
      color: '#94a3b8',
      marginTop: '2px',
    },
    projectItem: {
      marginBottom: '16px',
    },
    projectTitle: {
      margin: '0 0 4px 0',
      fontSize: '14px',
      fontWeight: 600,
      color: '#1e293b',
    },
    projectDesc: {
      margin: 0,
      fontSize: '12px',
      color: '#475569',
      lineHeight: '1.6',
    },
    certItem: {
      marginBottom: '12px',
    },
    certTitle: {
      margin: '0 0 4px 0',
      fontSize: '14px',
      fontWeight: 600,
      color: '#1e293b',
    },
    certOrg: {
      fontSize: '12px',
      color: '#64748b',
    },
    certId: {
      fontSize: '11px',
      color: '#94a3b8',
      marginTop: '2px',
    },
  };

  // Templates can be customized here
  if (template === 'modern') {
    return {
      ...baseStyles,
      header: {
        ...baseStyles.header,
        borderBottom: '3px solid #667eea',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '24px',
        margin: '-40px -40px 24px -40px',
      },
      name: {
        ...baseStyles.name,
        color: 'white',
      },
      contactInfo: {
        ...baseStyles.contactInfo,
        color: 'rgba(255,255,255,0.9)',
      },
      sectionTitle: {
        ...baseStyles.sectionTitle,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      },
    };
  }

  if (template === 'minimal') {
    return {
      ...baseStyles,
      header: {
        ...baseStyles.header,
        borderBottom: 'none',
        borderLeft: '4px solid #1e293b',
        paddingLeft: '16px',
      },
      sectionTitle: {
        ...baseStyles.sectionTitle,
        color: '#1e293b',
        borderBottom: 'none',
        fontSize: '14px',
        fontWeight: 600,
      },
      skillPill: {
        ...baseStyles.skillPill,
        background: 'transparent',
        border: 'none',
        padding: '0 8px 0 0',
      },
    };
  }

  return baseStyles;
}
