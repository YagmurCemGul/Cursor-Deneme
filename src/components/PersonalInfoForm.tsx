import React, { useRef } from 'react';
import { PersonalInfo } from '../types';

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onChange({ ...data, photoDataUrl: result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="section">
      <h2 className="section-title">
        👤 Personal Information
      </h2>
      
      <div className="form-row-3">
        <div className="form-group">
          <label className="form-label">First Name *</label>
          <input
            type="text"
            className="form-input"
            value={data.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            placeholder="John"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Middle Name</label>
          <input
            type="text"
            className="form-input"
            value={data.middleName}
            onChange={(e) => handleChange('middleName', e.target.value)}
            placeholder="Michael"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Last Name *</label>
          <input
            type="text"
            className="form-input"
            value={data.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            placeholder="Doe"
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Email *</label>
          <input
            type="email"
            className="form-input"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="john.doe@email.com"
            autoComplete="email"
            onBlur={(e) => {
              const value = e.target.value.trim();
              const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
              if (!emailOk && value) {
                e.currentTarget.setCustomValidity('Invalid email address');
              } else {
                e.currentTarget.setCustomValidity('');
              }
            }}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Phone Number *</label>
          <div className="form-row" style={{ gap: '5px' }}>
            <input
              type="text"
              className="form-input"
              value={data.countryCode}
              onChange={(e) => handleChange('countryCode', e.target.value)}
              placeholder="+1"
              style={{ width: '70px' }}
            />
            <input
              type="tel"
              className="form-input"
              value={data.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              placeholder="(555) 123-4567"
              style={{ flex: 1 }}
            />
          </div>
        </div>
      </div>
      
      <div className="form-group">
        <label className="form-label">LinkedIn Profile</label>
        <div className="input-prefix">
          <span className="input-prefix-text">https://www.linkedin.com/in/</span>
          <input
            type="text"
            value={data.linkedInUsername}
            onChange={(e) => handleChange('linkedInUsername', e.target.value)}
            placeholder="your-username"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Profile Photo</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {data.photoDataUrl ? (
            <img src={data.photoDataUrl} alt="Profile" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', border: '1px solid #e2e8f0' }}>📷</div>
          )}
          <div>
            <button className="btn btn-secondary" onClick={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}>Upload</button>
            {data.photoDataUrl && (
              <button className="btn btn-danger" style={{ marginLeft: 8 }} onClick={(e) => { e.preventDefault(); onChange({ ...data, photoDataUrl: undefined }); }}>Remove</button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} style={{ display: 'none' }} />
          </div>
        </div>
      </div>
      
      <div className="form-group">
        <label className="form-label">GitHub Profile</label>
        <div className="input-prefix">
          <span className="input-prefix-text">https://github.com/</span>
          <input
            type="text"
            value={data.githubUsername}
            onChange={(e) => handleChange('githubUsername', e.target.value)}
            placeholder="your-username"
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Portfolio Website</label>
          <input
            type="url"
            className="form-input"
            value={data.portfolioUrl}
            onChange={(e) => handleChange('portfolioUrl', e.target.value)}
            placeholder="https://yourportfolio.com"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">WhatsApp Link</label>
          <input
            type="url"
            className="form-input"
            value={data.whatsappLink}
            onChange={(e) => handleChange('whatsappLink', e.target.value)}
            placeholder="https://wa.me/..."
          />
          <div style={{ marginTop: 6 }}>
            <button
              className="btn btn-secondary"
              onClick={(e) => {
                e.preventDefault();
                const digits = (data.phoneNumber || '').replace(/\D/g, '');
                const cc = (data.countryCode || '').replace(/\D/g, '');
                if (cc && digits) {
                  handleChange('whatsappLink', `https://wa.me/${cc}${digits}`);
                }
              }}
            >
              Build from phone
            </button>
          </div>
        </div>
      </div>
      
      <div className="form-group">
        <label className="form-label">Professional Summary</label>
        <textarea
          className="form-textarea"
          value={data.summary}
          onChange={(e) => handleChange('summary', e.target.value)}
          placeholder="Write a brief professional summary highlighting your key strengths and experience..."
          style={{ minHeight: '120px' }}
        />
      </div>
    </div>
  );
};
