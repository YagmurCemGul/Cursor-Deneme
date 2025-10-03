import React from 'react';
import { PersonalInfo } from '../types';

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...data, [field]: value });
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
