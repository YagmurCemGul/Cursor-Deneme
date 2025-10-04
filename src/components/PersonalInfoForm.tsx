import React, { useRef, useState } from 'react';
import { PersonalInfo } from '../types';
import { t, Lang } from '../i18n';
import { PhotoCropper } from './PhotoCropper';

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
  language: Lang;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ data, onChange, language }) => {
  const [emailValidation, setEmailValidation] = useState<{ isValid: boolean; message: string }>({ isValid: true, message: '' });
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);
  const [photoError, setPhotoError] = useState<string>('');
  const [photoLoading, setPhotoLoading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [tempPhotoUrl, setTempPhotoUrl] = useState<string>('');
  
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
      setEmailValidation({ isValid: false, message: t(language, 'personal.invalidEmailFormat') });
      return;
    }
    
    // Check for common typos in domain
    const [localPart, domain] = email.split('@');
    if (!domain || !localPart) {
      setEmailValidation({ isValid: false, message: t(language, 'personal.invalidEmailFormat') });
      return;
    }
    
    const domainSuggestions = commonDomains.filter(d => 
      d.includes(domain) || domain.includes(d) || 
      calculateLevenshteinDistance(domain, d) <= 2
    );
    
    if (domainSuggestions.length > 0 && !commonDomains.includes(domain) && domainSuggestions[0]) {
      setEmailValidation({ 
        isValid: false, 
        message: `${t(language, 'personal.didYouMean')} ${localPart}@${domainSuggestions[0]}?` 
      });
      return;
    }
    
    setEmailValidation({ isValid: true, message: t(language, 'personal.validEmail') });
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

  const compressImage = (file: File, maxSizeMB: number = 0.5): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Maintain aspect ratio, max dimension 500px
          const maxDimension = 500;
          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Try different quality levels to meet size requirement
          let quality = 0.9;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          
          // Estimate size and reduce quality if needed
          while (dataUrl.length > maxSizeMB * 1024 * 1024 * 1.37 && quality > 0.1) {
            quality -= 0.1;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
          
          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setPhotoError('');
    setPhotoLoading(true);
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setPhotoError('Please upload a valid image file (JPEG, PNG, or WebP)');
      setPhotoLoading(false);
      return;
    }
    
    // Validate file size (max 10MB before compression)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setPhotoError('Image is too large. Please upload an image smaller than 10MB.');
      setPhotoLoading(false);
      return;
    }
    
    try {
      // Load image for cropping
      const reader = new FileReader();
      reader.onload = () => {
        setTempPhotoUrl(reader.result as string);
        setShowCropper(true);
        setPhotoLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setPhotoError('Error processing image. Please try another file.');
      console.error('Image processing error:', error);
      setPhotoLoading(false);
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCropComplete = async (croppedDataUrl: string) => {
    setShowCropper(false);
    setPhotoLoading(true);
    
    try {
      // Create a file from the cropped data URL for compression
      const response = await fetch(croppedDataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
      
      // Compress the cropped image
      const compressedDataUrl = await compressImage(file, 0.3);
      onChange({ ...data, photoDataUrl: compressedDataUrl });
    } catch (error) {
      setPhotoError('Error processing cropped image. Please try again.');
      console.error('Crop processing error:', error);
    } finally {
      setPhotoLoading(false);
      setTempPhotoUrl('');
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setTempPhotoUrl('');
    setPhotoLoading(false);
  };

  return (
    <div className="section">
      <h2 className="section-title">
        👤 {t(language, 'personal.section')}
      </h2>
      
      <div className="form-row-3">
        <div className="form-group">
          <label className="form-label">{t(language, 'personal.firstName')} *</label>
          <input
            type="text"
            className="form-input"
            value={data.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            placeholder="John"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">{t(language, 'personal.middleName')}</label>
          <input
            type="text"
            className="form-input"
            value={data.middleName}
            onChange={(e) => handleChange('middleName', e.target.value)}
            placeholder="Michael"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">{t(language, 'personal.lastName')} *</label>
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
        <label className="form-label">{t(language, 'personal.email')} *</label>
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
          <label className="form-label">{t(language, 'personal.phoneNumber')} *</label>
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
        <label className="form-label">{t(language, 'personal.linkedin')}</label>
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
        <label className="form-label">{t(language, 'personal.photo')}</label>
        <div className="photo-upload-container">
          {photoLoading ? (
            <div className="photo-preview-loading">
              <div className="spinner"></div>
            </div>
          ) : data.photoDataUrl ? (
            <img src={data.photoDataUrl} alt="Profile" className="photo-preview" />
          ) : (
            <div className="photo-placeholder">📷</div>
          )}
          <div className="photo-actions">
            <button 
              className="btn btn-secondary" 
              onClick={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}
              disabled={photoLoading}
            >
              {data.photoDataUrl ? '🔄 Change' : '📤 ' + t(language, 'personal.upload')}
            </button>
            {data.photoDataUrl && (
              <>
                <button 
                  className="btn btn-secondary" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    setTempPhotoUrl(data.photoDataUrl!);
                    setShowCropper(true);
                  }}
                  disabled={photoLoading}
                >
                  ✂️ Edit Photo
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    onChange({ ...data, photoDataUrl: undefined });
                    setPhotoError('');
                  }}
                  disabled={photoLoading}
                >
                  {t(language, 'personal.remove')}
                </button>
              </>
            )}
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/jpeg,image/jpg,image/png,image/webp" 
              onChange={handlePhotoSelect} 
              style={{ display: 'none' }} 
            />
          </div>
        </div>
        {photoError && (
          <div className="validation-message error" style={{ marginTop: '8px' }}>
            {photoError}
          </div>
        )}
        {data.photoDataUrl && !photoError && (
          <div className="validation-message success" style={{ marginTop: '8px' }}>
            ✓ Photo uploaded successfully (optimized for ATS)
          </div>
        )}
        {showCropper && tempPhotoUrl && (
          <PhotoCropper
            imageDataUrl={tempPhotoUrl}
            onCrop={handleCropComplete}
            onCancel={handleCropCancel}
          />
        )}
      </div>
      
      <div className="form-group">
        <label className="form-label">{t(language, 'personal.github')}</label>
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
          <label className="form-label">{t(language, 'personal.portfolio')}</label>
          <input
            type="url"
            className="form-input"
            value={data.portfolioUrl}
            onChange={(e) => handleChange('portfolioUrl', e.target.value)}
            placeholder="https://yourportfolio.com"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">{t(language, 'personal.whatsapp')}</label>
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
              {t(language, 'personal.buildFromPhone')}
            </button>
          </div>
        </div>
      </div>
      
      <div className="form-group">
        <label className="form-label">{t(language, 'personal.summary')}</label>
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
