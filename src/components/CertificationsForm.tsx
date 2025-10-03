import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Certification } from '../types';

interface CertificationsFormProps {
  certifications: Certification[];
  onChange: (certifications: Certification[]) => void;
}

export const CertificationsForm: React.FC<CertificationsFormProps> = ({ certifications, onChange }) => {
  const handleAdd = () => {
    const newCert: Certification = {
      id: uuidv4(),
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

  const handleUpdate = (id: string, field: keyof Certification, value: any) => {
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
        📜 Licenses & Certifications
        <button className="btn btn-primary btn-icon" onClick={handleAdd}>
          + Add Certification
        </button>
      </h2>
      
      {certifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📜</div>
          <div className="empty-state-text">No certifications added yet. Click "Add Certification" to get started!</div>
        </div>
      ) : (
        <div className="card-list">
          {certifications.map((cert, index) => (
            <div key={cert.id} className="experience-item">
              <div className="experience-item-header">
                <span style={{ fontWeight: 600, color: '#64748b' }}>
                  Certification #{index + 1}
                </span>
                <button 
                  className="btn btn-danger btn-icon"
                  onClick={() => handleRemove(cert.id)}
                >
                  🗑️ Remove
                </button>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={cert.name}
                    onChange={(e) => handleUpdate(cert.id, 'name', e.target.value)}
                    placeholder="AWS Certified Solutions Architect"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Issuing Organization *</label>
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
                  <label className="form-label">Issue Date</label>
                  <input
                    type="month"
                    className="form-input"
                    value={cert.issueDate}
                    onChange={(e) => handleUpdate(cert.id, 'issueDate', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Expiration Date</label>
                  <input
                    type="month"
                    className="form-input"
                    value={cert.expirationDate}
                    onChange={(e) => handleUpdate(cert.id, 'expirationDate', e.target.value)}
                    disabled={!!cert.noExpiration}
                    placeholder="No expiration"
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
                  <label htmlFor={`noexp-${cert.id}`}>Doesn't expire / Ongoing</label>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Credential ID</label>
                  <input
                    type="text"
                    className="form-input"
                    value={cert.credentialId}
                    onChange={(e) => handleUpdate(cert.id, 'credentialId', e.target.value)}
                    placeholder="ABC123XYZ"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Credential URL</label>
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
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={cert.description || ''}
                  onChange={(e) => handleUpdate(cert.id, 'description', e.target.value)}
                  placeholder={'Use bullets like:\n• Credential URL: ...\n• Skills gained: ...'}
                  onPaste={(e) => {
                    const text = e.clipboardData.getData('text');
                    if (text.includes('•') || text.includes('\n- ') || text.includes('\n* ')) {
                      e.preventDefault();
                      const normalized = text
                        .split(/\n|•|^-\s|^\*\s/m)
                        .map(s => s.trim())
                        .filter(Boolean)
                        .map(s => `• ${s}`)
                        .join('\n');
                      handleUpdate(cert.id, 'description', ((cert.description || '') ? cert.description + '\n' : '') + normalized);
                    }
                  }}
                />
                <div>
                  <button className="btn btn-secondary" onClick={(e) => { e.preventDefault(); handleUpdate(cert.id, 'description', ((cert.description || '') ? cert.description + '\n' : '') + '• '); }}>+ Add Bullet</button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Skills</label>
                <div className="skills-input-container">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Add a skill or paste: skill1, skill2"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const value = (e.target as HTMLInputElement).value;
                        value.split(',').map(s => s.trim()).filter(Boolean).forEach(s => handleUpdate(cert.id, 'skills', [...cert.skills, s]));
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    onPaste={(e) => {
                      const text = e.clipboardData.getData('text');
                      if (text.includes(',')) {
                        e.preventDefault();
                        text.split(',').map(s => s.trim()).filter(Boolean).forEach(s => handleUpdate(cert.id, 'skills', [...cert.skills, s]));
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
              <button className="btn btn-primary btn-icon" onClick={handleAdd}>+ Add Certification</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
