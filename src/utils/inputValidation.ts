/**
 * Input Validation Utilities
 * Validates CV data and job descriptions before sending to AI
 */

import { CVData } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate CV data before AI processing
 */
export function validateCVData(cvData: CVData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check personal info
  if (!cvData.personalInfo) {
    errors.push('Personal information is required');
  } else {
    if (!cvData.personalInfo.firstName || !cvData.personalInfo.firstName.trim()) {
      errors.push('First name is required');
    }
    if (!cvData.personalInfo.lastName || !cvData.personalInfo.lastName.trim()) {
      errors.push('Last name is required');
    }
    if (!cvData.personalInfo.email || !cvData.personalInfo.email.trim()) {
      warnings.push('Email is recommended for better CV quality');
    }
    if (!cvData.personalInfo.summary || cvData.personalInfo.summary.trim().length < 50) {
      warnings.push('A professional summary of at least 50 characters is recommended');
    }
  }

  // Check skills
  if (!cvData.skills || cvData.skills.length === 0) {
    warnings.push('Adding skills will help generate better optimizations');
  } else if (cvData.skills.length < 3) {
    warnings.push('Adding more skills (at least 3-5) will improve AI suggestions');
  }

  // Check experience
  if (!cvData.experience || cvData.experience.length === 0) {
    warnings.push('Adding work experience will significantly improve AI results');
  } else {
    const recentExp = cvData.experience.some(exp => {
      const year = parseInt(exp.startDate.match(/\d{4}/)?.[0] || '0');
      return year >= new Date().getFullYear() - 3;
    });
    if (!recentExp) {
      warnings.push('Adding recent work experience (within last 3 years) is recommended');
    }

    // Check experience descriptions
    cvData.experience.forEach((exp, index) => {
      if (!exp.description || exp.description.trim().length < 50) {
        warnings.push(
          `Experience #${index + 1} (${exp.title}) should have a detailed description (at least 50 characters)`
        );
      }
    });
  }

  // Check education
  if (!cvData.education || cvData.education.length === 0) {
    warnings.push('Adding education information is recommended');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate job description before AI processing
 */
export function validateJobDescription(jobDescription: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!jobDescription || !jobDescription.trim()) {
    errors.push('Job description is required');
    return { isValid: false, errors, warnings };
  }

  const trimmed = jobDescription.trim();
  const wordCount = trimmed.split(/\s+/).length;
  const lineCount = trimmed.split('\n').length;

  // Check minimum length
  if (trimmed.length < 50) {
    errors.push('Job description is too short. Please provide at least 50 characters');
  } else if (trimmed.length < 100) {
    warnings.push('Job description is quite short. More details will improve AI results');
  }

  // Check word count
  if (wordCount < 20) {
    warnings.push('Job description should contain at least 20 words for better results');
  }

  // Check if it looks like a real job description
  const hasJobKeywords = /\b(role|position|responsibilities|requirements|qualifications|experience|skills)\b/i.test(
    trimmed
  );
  if (!hasJobKeywords && trimmed.length > 50) {
    warnings.push(
      'Job description may be incomplete. Include responsibilities, requirements, and qualifications for best results'
    );
  }

  // Check for common sections
  const hasResponsibilities = /\b(responsibilities|duties|tasks|role)\b/i.test(trimmed);
  const hasRequirements = /\b(requirements|qualifications|must have|experience)\b/i.test(trimmed);
  const hasSkills = /\b(skills|technical|proficiency|knowledge)\b/i.test(trimmed);

  if (!hasResponsibilities) {
    warnings.push('Consider including job responsibilities for better CV optimization');
  }
  if (!hasRequirements) {
    warnings.push('Consider including job requirements for more accurate matching');
  }
  if (!hasSkills) {
    warnings.push('Consider including required skills for better keyword optimization');
  }

  // Check if suspiciously short given the line count
  if (lineCount > 5 && wordCount < 50) {
    warnings.push('Job description seems to have many short lines. Add more details for each section');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate inputs for CV optimization
 */
export function validateOptimizationInputs(
  cvData: CVData,
  jobDescription: string
): ValidationResult {
  const cvValidation = validateCVData(cvData);
  const jdValidation = validateJobDescription(jobDescription);

  return {
    isValid: cvValidation.isValid && jdValidation.isValid,
    errors: [...cvValidation.errors, ...jdValidation.errors],
    warnings: [...cvValidation.warnings, ...jdValidation.warnings],
  };
}

/**
 * Validate inputs for cover letter generation
 */
export function validateCoverLetterInputs(
  cvData: CVData,
  jobDescription: string
): ValidationResult {
  const cvValidation = validateCVData(cvData);
  const jdValidation = validateJobDescription(jobDescription);

  // Cover letter needs at least some experience or skills
  if (cvValidation.isValid && jdValidation.isValid) {
    const hasContent =
      (cvData.skills && cvData.skills.length > 0) ||
      (cvData.experience && cvData.experience.length > 0) ||
      (cvData.projects && cvData.projects.length > 0);

    if (!hasContent) {
      cvValidation.errors.push(
        'To generate a cover letter, please add skills, experience, or projects to your CV'
      );
      cvValidation.isValid = false;
    }
  }

  return {
    isValid: cvValidation.isValid && jdValidation.isValid,
    errors: [...cvValidation.errors, ...jdValidation.errors],
    warnings: [...cvValidation.warnings, ...jdValidation.warnings],
  };
}

/**
 * Format validation result as user-friendly message
 */
export function formatValidationMessage(result: ValidationResult): string {
  const messages: string[] = [];

  if (result.errors.length > 0) {
    messages.push('⚠️ Please fix the following issues:');
    result.errors.forEach((error) => {
      messages.push(`  • ${error}`);
    });
  }

  if (result.warnings.length > 0) {
    if (messages.length > 0) messages.push('');
    messages.push('💡 Recommendations:');
    result.warnings.forEach((warning) => {
      messages.push(`  • ${warning}`);
    });
  }

  return messages.join('\n');
}

/**
 * Check if AI provider is configured
 */
export function validateAIConfiguration(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // This would need to be imported from aiService
    // For now, just return a basic check
    warnings.push('Make sure your AI provider is configured in settings');
  } catch (error) {
    errors.push('AI provider configuration check failed');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
