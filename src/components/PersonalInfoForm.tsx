import React, { useRef, useState } from 'react';
import { PersonalInfo } from '../types';

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ data, onChange }) => {
  const [emailValidation, setEmailValidation] = useState<{ isValid: boolean; message: string }>({ isValid: true, message: '' });
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...data, [field]: value });
    
    // Enhanced email validation and suggestions
    if (field === 'email') {
      validateEmail(value);
      generateEmailSuggestions(value);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
    
    if (!email) {
      setEmailValidation({ isValid: true, message: '' });
      return;
    }
    
    if (!emailRegex.test(email)) {
      setEmailValidation({ isValid: false, message: 'Invalid email format' });
      return;
    }
    
    // Check for common typos in domain
    const [localPart, domain] = email.split('@');
    if (!domain || !localPart) {
      setEmailValidation({ isValid: false, message: 'Invalid email format' });
      return;
    }
    
    const domainSuggestions = commonDomains.filter(d => 
      d.includes(domain) || domain.includes(d) || 
      calculateLevenshteinDistance(domain, d) <= 2
    );
    
    if (domainSuggestions.length > 0 && !commonDomains.includes(domain) && domainSuggestions[0]) {
      setEmailValidation({ 
        isValid: false, 
        message: `Did you mean ${localPart}@${domainSuggestions[0]}?` 
      });
      return;
    }
    
    setEmailValidation({ isValid: true, message: 'Valid email address' });
  };

  const calculateLevenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(0));
    
    for (let i = 0; i <= str1.length; i++) {
      const row = matrix[0];
      if (row) row[i] = i;
    }
    for (let j = 0; j <= str2.length; j++) {
      const row = matrix[j];
      if (row) row[0] = j;
    }
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        const currentRow = matrix[j];
        const prevRow = matrix[j - 1];
        if (currentRow && prevRow) {
          currentRow[i] = Math.min(
            (currentRow[i - 1] ?? 0) + 1,
            (prevRow[i] ?? 0) + 1,
            (prevRow[i - 1] ?? 0) + indicator
          );
        }
      }
    }
    
    const lastRow = matrix[str2.length];
    return lastRow?.[str1.length] ?? 0;
  };

  const generateEmailSuggestions = (email: string) => {
    if (!email || !email.includes('@')) {
      setEmailSuggestions([]);
      setShowEmailSuggestions(false);
      return;
    }
    
    const [localPart, domain] = email.split('@');
    const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
    
    if (domain && localPart && !commonDomains.includes(domain)) {
      const suggestions = commonDomains.map(d => `${localPart}@${d}`);
      setEmailSuggestions(suggestions);
      setShowEmailSuggestions(true);
    } else {
      setEmailSuggestions([]);
      setShowEmailSuggestions(false);
    }
  };

  const handleEmailSuggestionClick = (suggestion: string) => {
    onChange({ ...data, email: suggestion });
    setShowEmailSuggestions(false);
    validateEmail(suggestion);
  };

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
        <div className="email-input-wrapper">
          <input
            type="email"
            className={`form-input ${!emailValidation.isValid ? 'error' : ''}`}
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onFocus={() => setShowEmailSuggestions(emailSuggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowEmailSuggestions(false), 200)}
            placeholder="john.doe@email.com"
            autoComplete="email"
          />
          {emailValidation.message && (
            <div className={`validation-message ${emailValidation.isValid ? 'success' : 'error'}`}>
              {emailValidation.message}
            </div>
          )}
          {showEmailSuggestions && emailSuggestions.length > 0 && (
            <div className="email-suggestions">
              {emailSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleEmailSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
        
        <div className="form-group">
          <label className="form-label">Phone Number *</label>
          <div className="phone-input-group">
            <input
              type="text"
              className="form-input country-code-input"
              value={data.countryCode}
              onChange={(e) => handleChange('countryCode', e.target.value)}
              placeholder="+1"
            />
            <input
              type="tel"
              className="form-input flex-input"
              value={data.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              placeholder="(555) 123-4567"
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
        <div className="photo-upload-container">
          {data.photoDataUrl ? (
            <img src={data.photoDataUrl} alt="Profile" className="photo-preview" />
          ) : (
            <div className="photo-placeholder">📷</div>
          )}
          <div className="photo-actions">
            <button className="btn btn-secondary" onClick={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}>Upload</button>
            {data.photoDataUrl && (
              <button className="btn btn-danger danger-btn-spacing" onClick={(e) => { e.preventDefault(); onChange({ ...data }); }}>Remove</button>
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
          <div className="whatsapp-helper">
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
