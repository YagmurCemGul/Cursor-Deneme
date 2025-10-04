import React, { useRef, useState } from 'react';
import { PersonalInfo, PhotoFilters, PhotoHistoryItem } from '../types';
import { logger } from '../utils/logger';
import { t, Lang } from '../i18n';
import { PhotoCropper } from './PhotoCropper';
import {
  validateLinkedInUsername,
  validateGitHubUsername,
  validatePortfolioUrl,
  validateWhatsAppLink,
  extractLinkedInUsername,
  extractGitHubUsername,
  buildWhatsAppLink,
  ValidationResult,
} from '../utils/urlValidation';

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
  language: Lang;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ data, onChange, language }) => {
  const [emailValidation, setEmailValidation] = useState<{ isValid: boolean; message: string }>({
    isValid: true,
    message: '',
  });
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);
  const [photoError, setPhotoError] = useState<string>('');
  const [photoLoading, setPhotoLoading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [tempPhotoUrl, setTempPhotoUrl] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);
  const [showBatchUpload, setShowBatchUpload] = useState(false);
  const [batchPhotos, setBatchPhotos] = useState<string[]>([]);
  const [removingBg, setRemovingBg] = useState(false);

  // URL validation states
  const [linkedInValidation, setLinkedInValidation] = useState<ValidationResult>({
    isValid: true,
    message: '',
    type: '',
  });
  const [githubValidation, setGithubValidation] = useState<ValidationResult>({
    isValid: true,
    message: '',
    type: '',
  });
  const [portfolioValidation, setPortfolioValidation] = useState<ValidationResult>({
    isValid: true,
    message: '',
    type: '',
  });
  const [whatsappValidation, setWhatsappValidation] = useState<ValidationResult>({
    isValid: true,
    message: '',
    type: '',
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (field: keyof PersonalInfo, value: string) => {
    let processedValue = value;

    // Handle URL field validations and auto-extraction
    if (field === 'linkedInUsername') {
      processedValue = extractLinkedInUsername(value);
      setLinkedInValidation(validateLinkedInUsername(processedValue));
    } else if (field === 'githubUsername') {
      processedValue = extractGitHubUsername(value);
      setGithubValidation(validateGitHubUsername(processedValue));
    } else if (field === 'portfolioUrl') {
      setPortfolioValidation(validatePortfolioUrl(value));
    } else if (field === 'whatsappLink') {
      setWhatsappValidation(validateWhatsAppLink(value));
    }

    onChange({ ...data, [field]: processedValue });

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

    const domainSuggestions = commonDomains.filter(
      (d) =>
        d.includes(domain) || domain.includes(d) || calculateLevenshteinDistance(domain, d) <= 2
    );

    if (domainSuggestions.length > 0 && !commonDomains.includes(domain) && domainSuggestions[0]) {
      setEmailValidation({
        isValid: false,
        message: `${t(language, 'personal.didYouMean')} ${localPart}@${domainSuggestions[0]}?`,
      });
      return;
    }

    setEmailValidation({ isValid: true, message: t(language, 'personal.validEmail') });
  };

  const calculateLevenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(0));

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
      const suggestions = commonDomains.map((d) => `${localPart}@${d}`);
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

    // Validate file type (including AVIF)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
    if (!validTypes.includes(file.type)) {
      setPhotoError(t(language, 'personal.photoInvalidType'));
      setPhotoLoading(false);
      return;
    }

    // Validate file size (max 10MB before compression)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setPhotoError(t(language, 'personal.photoTooLarge'));
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
      setPhotoError(t(language, 'personal.photoProcessError'));
      logger.error('Image processing error:', error);
      setPhotoLoading(false);
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleBatchPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setPhotoLoading(true);
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
    const photos: string[] = [];

    for (let i = 0; i < Math.min(files.length, 10); i++) {
      const file = files[i];
      if (!file) continue;

      if (!validTypes.includes(file.type) || file.size > 10 * 1024 * 1024) {
        continue;
      }

      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        photos.push(dataUrl);
      } catch (error) {
        logger.error('Error loading batch photo:', error);
      }
    }

    setBatchPhotos(photos);
    setShowBatchUpload(true);
    setPhotoLoading(false);
  };

  const selectBatchPhoto = (photoUrl: string) => {
    setTempPhotoUrl(photoUrl);
    setShowCropper(true);
    setShowBatchUpload(false);
  };

  const addToHistory = (dataUrl: string, filters?: PhotoFilters) => {
    const history = data.photoHistory || [];
    const newItem: PhotoHistoryItem = {
      id: Date.now().toString(),
      dataUrl,
      timestamp: Date.now(),
      ...(filters ? { filters } : {}),
    };
    // Keep last 10 items
    const updatedHistory = [newItem, ...history].slice(0, 10);
    onChange({ ...data, photoHistory: updatedHistory });
  };

  const restoreFromHistory = (item: PhotoHistoryItem) => {
    const updates: Partial<PersonalInfo> = {
      photoDataUrl: item.dataUrl,
    };
    if (item.filters) {
      updates.photoFilters = item.filters;
    }
    onChange({ 
      ...data,
      ...updates,
    });
    setShowHistory(false);
  };

  const removeBackground = async () => {
    if (!data.photoDataUrl) return;

    setRemovingBg(true);
    try {
      // This is a placeholder for AI background removal
      // In a real implementation, this would call an API like remove.bg or use a local model
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would integrate with remove.bg API or similar:
      // const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      //   method: 'POST',
      //   headers: {
      //     'X-Api-Key': 'YOUR_API_KEY',
      //   },
      //   body: formData,
      // });
      
      setPhotoError('AI background removal requires API integration. This is a placeholder.');
    } catch (error) {
      setPhotoError(t(language, 'personal.photoProcessError'));
      logger.error('Background removal error:', error);
    } finally {
      setRemovingBg(false);
    }
  };

  const handleCropComplete = async (croppedDataUrl: string, filters?: PhotoFilters) => {
    setShowCropper(false);
    setPhotoLoading(true);

    try {
      // Create a file from the cropped data URL for compression
      const response = await fetch(croppedDataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });

      // Compress the cropped image
      const compressedDataUrl = await compressImage(file, 0.3);
      
      // Add to history if we had a previous photo
      if (data.photoDataUrl) {
        addToHistory(data.photoDataUrl, data.photoFilters);
      }
      
      const updates: Partial<PersonalInfo> = {
        photoDataUrl: compressedDataUrl,
      };
      if (filters) {
        updates.photoFilters = filters;
      }
      onChange({ 
        ...data,
        ...updates,
      });
    } catch (error) {
      setPhotoError(t(language, 'personal.photoProcessError'));
      logger.error('Crop processing error:', error);
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
      <h2 className="section-title">👤 {t(language, 'personal.section')}</h2>

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
              <div
                className={`validation-message ${emailValidation.isValid ? 'success' : 'error'}`}
              >
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
            className={linkedInValidation.type === 'error' ? 'error' : ''}
            value={data.linkedInUsername}
            onChange={(e) => handleChange('linkedInUsername', e.target.value)}
            placeholder="your-username"
          />
        </div>
        {linkedInValidation.message && (
          <div className={`validation-message ${linkedInValidation.type}`}>
            {linkedInValidation.message}
          </div>
        )}
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
              onClick={(e) => {
                e.preventDefault();
                fileInputRef.current?.click();
              }}
              disabled={photoLoading}
            >
              {data.photoDataUrl
                ? '🔄 ' + t(language, 'personal.change')
                : '📤 ' + t(language, 'personal.upload')}
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
                  ✂️ {t(language, 'personal.editPhoto')}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={(e) => {
                    e.preventDefault();
                    const { photoDataUrl, ...rest } = data;
                    onChange(rest as PersonalInfo);
                    setPhotoError('');
                  }}
                  disabled={photoLoading}
                >
                  {t(language, 'personal.remove')}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    removeBackground();
                  }}
                  disabled={photoLoading || removingBg}
                >
                  {removingBg ? t(language, 'personal.photoRemovingBg') : '✨ ' + t(language, 'personal.photoRemoveBg')}
                </button>
              </>
            )}
            <button
              className="btn btn-secondary"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('batch-photo-input')?.click();
              }}
              disabled={photoLoading}
            >
              📁 {t(language, 'personal.photoBatchUpload')}
            </button>
            {data.photoHistory && data.photoHistory.length > 0 && (
              <button
                className="btn btn-secondary"
                onClick={(e) => {
                  e.preventDefault();
                  setShowHistory(!showHistory);
                }}
              >
                🕐 {t(language, 'personal.photoHistory')}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
              onChange={handlePhotoSelect}
              style={{ display: 'none' }}
            />
            <input
              id="batch-photo-input"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
              onChange={handleBatchPhotoSelect}
              multiple
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
            ✓ {t(language, 'personal.photoUploadSuccess')}
          </div>
        )}
        {showCropper && tempPhotoUrl && (
          <PhotoCropper
            imageDataUrl={tempPhotoUrl}
            onCrop={handleCropComplete}
            onCancel={handleCropCancel}
            language={language}
            {...(data.photoFilters ? { initialFilters: data.photoFilters } : {})}
          />
        )}
        {showHistory && (
          <div className="photo-history-overlay" onClick={() => setShowHistory(false)}>
            <div className="photo-history-modal" onClick={(e) => e.stopPropagation()}>
              <div className="photo-history-header">
                <h3>🕐 {t(language, 'personal.photoHistoryTitle')}</h3>
                <button className="btn btn-secondary btn-icon" onClick={() => setShowHistory(false)}>
                  ×
                </button>
              </div>
              <div className="photo-history-content">
                {data.photoHistory && data.photoHistory.length > 0 ? (
                  <div className="photo-history-grid">
                    {data.photoHistory.map((item) => (
                      <div key={item.id} className="photo-history-item">
                        <img src={item.dataUrl} alt="History" />
                        <div className="photo-history-item-date">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </div>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => restoreFromHistory(item)}
                        >
                          {t(language, 'personal.photoRestore')}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>{t(language, 'personal.photoHistoryEmpty')}</p>
                )}
              </div>
            </div>
          </div>
        )}
        {showBatchUpload && (
          <div className="photo-batch-overlay" onClick={() => setShowBatchUpload(false)}>
            <div className="photo-batch-modal" onClick={(e) => e.stopPropagation()}>
              <div className="photo-batch-header">
                <h3>📁 {t(language, 'personal.photoBatchUpload')}</h3>
                <button className="btn btn-secondary btn-icon" onClick={() => setShowBatchUpload(false)}>
                  ×
                </button>
              </div>
              <div className="photo-batch-content">
                <div className="photo-batch-grid">
                  {batchPhotos.map((photo, index) => (
                    <div key={index} className="photo-batch-item" onClick={() => selectBatchPhoto(photo)}>
                      <img src={photo} alt={`Photo ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">{t(language, 'personal.github')}</label>
        <div className="input-prefix">
          <span className="input-prefix-text">https://github.com/</span>
          <input
            type="text"
            className={githubValidation.type === 'error' ? 'error' : ''}
            value={data.githubUsername}
            onChange={(e) => handleChange('githubUsername', e.target.value)}
            placeholder="your-username"
          />
        </div>
        {githubValidation.message && (
          <div className={`validation-message ${githubValidation.type}`}>
            {githubValidation.message}
          </div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t(language, 'personal.portfolio')}</label>
          <input
            type="url"
            className={`form-input ${portfolioValidation.type === 'error' ? 'error' : ''}`}
            value={data.portfolioUrl}
            onChange={(e) => handleChange('portfolioUrl', e.target.value)}
            placeholder="https://yourportfolio.com"
          />
          {portfolioValidation.message && (
            <div className={`validation-message ${portfolioValidation.type}`}>
              {portfolioValidation.message}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">{t(language, 'personal.whatsapp')}</label>
          <input
            type="url"
            className={`form-input ${whatsappValidation.type === 'error' ? 'error' : ''}`}
            value={data.whatsappLink}
            onChange={(e) => handleChange('whatsappLink', e.target.value)}
            placeholder="https://wa.me/..."
          />
          {whatsappValidation.message && (
            <div className={`validation-message ${whatsappValidation.type}`}>
              {whatsappValidation.message}
            </div>
          )}
          <div className="whatsapp-helper">
            <button
              className="btn btn-secondary"
              onClick={(e) => {
                e.preventDefault();
                const link = buildWhatsAppLink(data.countryCode, data.phoneNumber);
                if (link) {
                  handleChange('whatsappLink', link);
                  setWhatsappValidation(validateWhatsAppLink(link));
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
