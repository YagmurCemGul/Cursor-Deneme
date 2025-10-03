import React from 'react';
import { Certification } from '../types';

interface CertificationsFormProps {
  certifications: Certification[];
  onChange: (certifications: Certification[]) => void;
}

export const CertificationsForm: React.FC<CertificationsFormProps> = ({ certifications, onChange }) => {
  const handleAdd = () => {
    const newCert: Certification = {
      id: Date.now().toString(),
      name: '',
      issuingOrganization: '',
      issueDate: '',
      expirationDate: '',
      credentialId: '',
      credentialUrl: '',
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
                    placeholder="No expiration"
                  />
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
