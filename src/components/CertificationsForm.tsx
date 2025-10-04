import React from 'react';
import { Certification } from '../types';
import { t, Lang } from '../i18n';
import { RichTextEditor } from './RichTextEditor';

interface CertificationsFormProps {
  certifications: Certification[];
  onChange: (certifications: Certification[]) => void;
  language: Lang;
}

export const CertificationsForm: React.FC<CertificationsFormProps> = ({ certifications, onChange, language }) => {
  const handleAdd = () => {
    const newCert: Certification = {
      id: Date.now().toString(),
      name: '',
      issuingOrganization: '',
      issueDate: '',
      expirationDate: '',
      noExpiration: false,
      credentialId: '',
      credentialUrl: '',
      description: '',
      skills: []
    };
    onChange([...certifications, newCert]);
  };

  const handleUpdate = (id: string, field: keyof Certification, value: string | string[] | boolean) => {
    onChange(certifications.map(cert => 
      cert.id === id ? { ...cert, [field]: value } : cert
    ));
  };

  const handleRemove = (id: string) => {
    onChange(certifications.filter(cert => cert.id !== id));
  };

  const removeSkill = (id: string, skillToRemove: string) => {
    const cert = certifications.find(c => c.id === id);
    if (!cert) return;
    const updated = certifications.map(c => c.id === id ? { ...c, skills: c.skills.filter(s => s !== skillToRemove) } : c);
    onChange(updated);
  };

  return (
    <div className="section">
      <h2 className="section-title">
        📜 {t(language, 'certs.section')}
        <button className="btn btn-primary btn-icon" onClick={handleAdd}>
          + {t(language, 'certs.add')}
        </button>
      </h2>
      
      {certifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📜</div>
          <div className="empty-state-text">{t(language, 'certs.emptyState')}</div>
        </div>
      ) : (
        <div className="card-list">
          {certifications.map((cert, index) => (
            <div key={cert.id} className="experience-item">
              <div className="experience-item-header">
                <span style={{ fontWeight: 600, color: '#64748b' }}>
                  {t(language, 'certs.number')} #{index + 1}
                </span>
                <button 
                  className="btn btn-danger btn-icon"
                  onClick={() => handleRemove(cert.id)}
                >
                  🗑️ {t(language, 'common.remove')}
                </button>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t(language, 'certs.name')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={cert.name}
                    onChange={(e) => handleUpdate(cert.id, 'name', e.target.value)}
                    placeholder="AWS Certified Solutions Architect"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t(language, 'certs.org')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={cert.issuingOrganization}
                    onChange={(e) => handleUpdate(cert.id, 'issuingOrganization', e.target.value)}
                    placeholder="Amazon Web Services"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t(language, 'certs.issue')}</label>
                  <input
                    type="month"
                    className="form-input"
                    value={cert.issueDate}
                    onChange={(e) => handleUpdate(cert.id, 'issueDate', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t(language, 'certs.expiration')}</label>
                  <input
                    type="month"
                    className="form-input"
                    value={cert.expirationDate}
                    onChange={(e) => handleUpdate(cert.id, 'expirationDate', e.target.value)}
                    disabled={!!cert.noExpiration}
                    placeholder={t(language, 'certs.expiration')}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`noexp-${cert.id}`}
                    checked={!!cert.noExpiration}
                    onChange={(e) => handleUpdate(cert.id, 'noExpiration', e.target.checked)}
                  />
                  <label htmlFor={`noexp-${cert.id}`}>{t(language, 'certs.noExpiration')}</label>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t(language, 'certs.credId')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={cert.credentialId}
                    onChange={(e) => handleUpdate(cert.id, 'credentialId', e.target.value)}
                    placeholder="ABC123XYZ"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t(language, 'certs.credUrl')}</label>
                  <input
                    type="url"
                    className="form-input"
                    value={cert.credentialUrl}
                    onChange={(e) => handleUpdate(cert.id, 'credentialUrl', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t(language, 'certs.description')}</label>
                <RichTextEditor
                  value={cert.description || ''}
                  onChange={(value) => handleUpdate(cert.id, 'description', value)}
                  placeholder={t(language, 'certs.descriptionPlaceholder')}
                  language={language}
                  maxLength={2000}
                  showWordCount={true}
                  templateType="certification"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t(language, 'certs.skills')}</label>
                <div className="skills-input-container">
                  <input
                    type="text"
                    className="form-input"
                    placeholder={t(language, 'experience.skillsPlaceholder')}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const value = (e.target as HTMLInputElement).value;
                        const newSkills = value.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
                        const uniqueSkills = Array.from(new Set([...cert.skills, ...newSkills]));
                        handleUpdate(cert.id, 'skills', uniqueSkills);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    onPaste={(e) => {
                      const text = e.clipboardData.getData('text');
                      if (text.includes(',') || text.includes(';') || text.includes('|')) {
                        e.preventDefault();
                        const newSkills = text.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
                        const uniqueSkills = Array.from(new Set([...cert.skills, ...newSkills]));
                        handleUpdate(cert.id, 'skills', uniqueSkills);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    style={{ flex: 1 }}
                  />
                </div>
                {cert.skills.length > 0 && (
                  <div className="skills-tags">
                    {cert.skills.map((skill, idx) => (
                      <div key={idx} className="skill-tag">
                        {skill}
                        <span className="skill-tag-remove" onClick={() => removeSkill(cert.id, skill)}>✕</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {certifications.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary btn-icon" onClick={handleAdd}>+ {t(language, 'certs.add')}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
