/**
 * URL Validation Utility
 * Provides comprehensive URL validation with real-time feedback
 */

export interface ValidationResult {
  isValid: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | '';
}

/**
 * Validates a general URL
 */
export function validateUrl(url: string): ValidationResult {
  if (!url || url.trim() === '') {
    return { isValid: true, message: '', type: '' };
  }

  const trimmedUrl = url.trim();

  // Check if URL has protocol
  const hasProtocol = /^https?:\/\//i.test(trimmedUrl);
  
  // Comprehensive URL pattern
  const comprehensivePattern = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)$/;

  if (!comprehensivePattern.test(trimmedUrl)) {
    return {
      isValid: false,
      message: 'Please enter a valid URL (e.g., https://example.com)',
      type: 'error'
    };
  }

  // Warn if no protocol
  if (!hasProtocol) {
    return {
      isValid: true,
      message: 'Consider adding https:// at the beginning',
      type: 'warning'
    };
  }

  // Check for common mistakes
  if (trimmedUrl.includes(' ')) {
    return {
      isValid: false,
      message: 'URL cannot contain spaces',
      type: 'error'
    };
  }

  // Check for localhost or IP addresses (valid but warn)
  if (/localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\./.test(trimmedUrl)) {
    return {
      isValid: true,
      message: 'Local URL detected - ensure this is accessible to employers',
      type: 'warning'
    };
  }

  return {
    isValid: true,
    message: 'Valid URL',
    type: 'success'
  };
}

/**
 * Validates LinkedIn username
 */
export function validateLinkedInUsername(username: string): ValidationResult {
  if (!username || username.trim() === '') {
    return { isValid: true, message: '', type: '' };
  }

  const trimmedUsername = username.trim();

  // Remove any protocol or domain if user pasted full URL
  let cleanUsername = trimmedUsername
    .replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, '')
    .replace(/^linkedin\.com\/in\//i, '')
    .replace(/^www\.linkedin\.com\/in\//i, '')
    .replace(/\/+$/, ''); // Remove trailing slashes

  // LinkedIn username pattern: alphanumeric, hyphens, 3-100 characters
  const linkedInPattern = /^[a-zA-Z0-9_-]{3,100}$/;

  if (!linkedInPattern.test(cleanUsername)) {
    return {
      isValid: false,
      message: 'LinkedIn username should be 3-100 characters (letters, numbers, hyphens, underscores)',
      type: 'error'
    };
  }

  return {
    isValid: true,
    message: 'Valid LinkedIn username',
    type: 'success'
  };
}

/**
 * Validates GitHub username
 */
export function validateGitHubUsername(username: string): ValidationResult {
  if (!username || username.trim() === '') {
    return { isValid: true, message: '', type: '' };
  }

  const trimmedUsername = username.trim();

  // Remove any protocol or domain if user pasted full URL
  let cleanUsername = trimmedUsername
    .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
    .replace(/^github\.com\//i, '')
    .replace(/^www\.github\.com\//i, '')
    .replace(/\/+$/, ''); // Remove trailing slashes

  // GitHub username pattern: alphanumeric and hyphens, cannot start/end with hyphen, max 39 chars
  const githubPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

  if (!githubPattern.test(cleanUsername)) {
    return {
      isValid: false,
      message: 'GitHub username should be 1-39 characters, alphanumeric and hyphens only',
      type: 'error'
    };
  }

  // Check for consecutive hyphens (not allowed by GitHub)
  if (cleanUsername.includes('--')) {
    return {
      isValid: false,
      message: 'GitHub username cannot contain consecutive hyphens',
      type: 'error'
    };
  }

  return {
    isValid: true,
    message: 'Valid GitHub username',
    type: 'success'
  };
}

/**
 * Validates WhatsApp link
 */
export function validateWhatsAppLink(link: string): ValidationResult {
  if (!link || link.trim() === '') {
    return { isValid: true, message: '', type: '' };
  }

  const trimmedLink = link.trim();

  // WhatsApp link pattern with optional plus sign
  const waPatternWithPlus = /^https?:\/\/(wa\.me|api\.whatsapp\.com\/send\?phone=)\+?\d{7,15}$/i;

  if (!waPatternWithPlus.test(trimmedLink)) {
    return {
      isValid: false,
      message: 'WhatsApp link should be in format: https://wa.me/1234567890',
      type: 'error'
    };
  }

  // Check if it has protocol
  if (!/^https?:\/\//i.test(trimmedLink)) {
    return {
      isValid: false,
      message: 'WhatsApp link must start with https://',
      type: 'error'
    };
  }

  return {
    isValid: true,
    message: 'Valid WhatsApp link',
    type: 'success'
  };
}

/**
 * Validates portfolio/website URL
 */
export function validatePortfolioUrl(url: string): ValidationResult {
  if (!url || url.trim() === '') {
    return { isValid: true, message: '', type: '' };
  }

  const result = validateUrl(url);
  
  // Additional checks for portfolio URLs
  if (result.isValid && result.type !== 'error') {
    const trimmedUrl = url.trim().toLowerCase();
    
    // Warn if it's a social media link (should use dedicated fields)
    if (trimmedUrl.includes('linkedin.com') || trimmedUrl.includes('github.com')) {
      return {
        isValid: true,
        message: 'Consider using dedicated LinkedIn/GitHub fields instead',
        type: 'warning'
      };
    }

    // Check for common portfolio platforms
    const portfolioPlatforms = ['github.io', 'netlify.app', 'vercel.app', 'herokuapp.com', 'wixsite.com', 'wordpress.com', 'medium.com'];
    const isKnownPlatform = portfolioPlatforms.some(platform => trimmedUrl.includes(platform));
    
    if (isKnownPlatform && result.type === '') {
      return {
        isValid: true,
        message: 'Valid portfolio URL',
        type: 'success'
      };
    }
  }

  return result;
}

/**
 * Validates credential URL (for certifications)
 */
export function validateCredentialUrl(url: string): ValidationResult {
  if (!url || url.trim() === '') {
    return { isValid: true, message: '', type: '' };
  }

  const result = validateUrl(url);
  
  // Additional checks for credential URLs
  if (result.isValid && result.type !== 'error') {
    const trimmedUrl = url.trim().toLowerCase();
    
    // Check for common certification platforms
    const certPlatforms = [
      'credly.com',
      'coursera.org',
      'udemy.com',
      'linkedin.com/learning',
      'certmetrics.com',
      'microsoft.com/learn',
      'aws.amazon.com',
      'cloud.google.com',
      'acclaim.com'
    ];
    
    const isKnownPlatform = certPlatforms.some(platform => trimmedUrl.includes(platform));
    
    if (isKnownPlatform) {
      return {
        isValid: true,
        message: 'Valid certification URL',
        type: 'success'
      };
    }
  }

  return result;
}

/**
 * Cleans and normalizes a URL by adding protocol if missing
 */
export function normalizeUrl(url: string): string {
  if (!url || url.trim() === '') {
    return url;
  }

  let normalized = url.trim();
  
  // Add https:// if no protocol
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = 'https://' + normalized;
  }

  return normalized;
}

/**
 * Extracts username from LinkedIn URL
 */
export function extractLinkedInUsername(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, '')
    .replace(/^linkedin\.com\/in\//i, '')
    .replace(/^www\.linkedin\.com\/in\//i, '')
    .replace(/\/+$/, '');
}

/**
 * Extracts username from GitHub URL
 */
export function extractGitHubUsername(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
    .replace(/^github\.com\//i, '')
    .replace(/^www\.github\.com\//i, '')
    .replace(/\/+$/, '');
}

/**
 * Formats phone number for WhatsApp link
 */
export function buildWhatsAppLink(countryCode: string, phoneNumber: string): string {
  const cc = countryCode.replace(/\D/g, '');
  const phone = phoneNumber.replace(/\D/g, '');
  
  if (!cc || !phone) {
    return '';
  }
  
  return `https://wa.me/${cc}${phone}`;
}
