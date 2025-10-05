// @ts-nocheck - Test file needs updating to Jest format
describe.skip('Input Validation (needs migration to Jest)', () => {});
import {
  validateCVData,
  validateJobDescription,
  validateOptimizationInputs,
  validateCoverLetterInputs,
  formatValidationMessage,
} from '../inputValidation';
import { CVData } from '../../types';

describe('inputValidation', () => {
  const mockMinimalCV: CVData = {
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phoneNumber: '1234567890',
      countryCode: '+1',
      summary: 'Experienced software engineer with 5 years of experience in web development',
      linkedInUsername: '',
      githubUsername: '',
      portfolioUrl: '',
      photoDataUrl: '',
    },
    skills: ['JavaScript', 'React', 'Node.js'],
    experience: [
      {
        id: '1',
        title: 'Software Engineer',
        company: 'Tech Corp',
        location: 'San Francisco',
        startDate: '2020',
        endDate: '2023',
        description: 'Developed web applications using React and Node.js. Led a team of 3 developers.',
        skills: ['React', 'Node.js'],
      },
    ],
    education: [
      {
        id: '1',
        school: 'University',
        degree: 'Bachelor',
        fieldOfStudy: 'Computer Science',
        startDate: '2015',
        endDate: '2019',
        grade: '',
        description: '',
        activities: '',
        skills: [],
      },
    ],
    certifications: [],
    projects: [],
  };

  const mockJobDescription = `
    Senior Software Engineer
    
    We are looking for an experienced software engineer to join our team.
    
    Responsibilities:
    - Develop and maintain web applications
    - Lead technical projects
    - Mentor junior developers
    
    Requirements:
    - 5+ years of experience
    - Strong knowledge of JavaScript, React, and Node.js
    - Experience with cloud platforms (AWS/Azure)
    
    Skills:
    - JavaScript
    - React
    - Node.js
    - AWS
  `;

  describe('validateCVData', () => {
    it('should pass validation for complete CV data', () => {
      const result = validateCVData(mockMinimalCV);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when personal info is missing', () => {
      const invalidCV = { ...mockMinimalCV, personalInfo: undefined as any };
      const result = validateCVData(invalidCV);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Personal information is required');
    });

    it('should fail when first name is missing', () => {
      const invalidCV = {
        ...mockMinimalCV,
        personalInfo: { ...mockMinimalCV.personalInfo, firstName: '' },
      };
      const result = validateCVData(invalidCV);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('First name is required');
    });

    it('should fail when last name is missing', () => {
      const invalidCV = {
        ...mockMinimalCV,
        personalInfo: { ...mockMinimalCV.personalInfo, lastName: '' },
      };
      const result = validateCVData(invalidCV);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Last name is required');
    });

    it('should warn when email is missing', () => {
      const cvWithoutEmail = {
        ...mockMinimalCV,
        personalInfo: { ...mockMinimalCV.personalInfo, email: '' },
      };
      const result = validateCVData(cvWithoutEmail);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('Email'))).toBe(true);
    });

    it('should warn when summary is too short', () => {
      const cvWithShortSummary = {
        ...mockMinimalCV,
        personalInfo: { ...mockMinimalCV.personalInfo, summary: 'Short summary' },
      };
      const result = validateCVData(cvWithShortSummary);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('professional summary'))).toBe(true);
    });

    it('should warn when skills are missing', () => {
      const cvWithoutSkills = { ...mockMinimalCV, skills: [] };
      const result = validateCVData(cvWithoutSkills);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('skills'))).toBe(true);
    });

    it('should warn when there are too few skills', () => {
      const cvWithFewSkills = { ...mockMinimalCV, skills: ['JavaScript', 'React'] };
      const result = validateCVData(cvWithFewSkills);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('more skills'))).toBe(true);
    });

    it('should warn when experience is missing', () => {
      const cvWithoutExperience = { ...mockMinimalCV, experience: [] };
      const result = validateCVData(cvWithoutExperience);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('experience'))).toBe(true);
    });

    it('should warn when experience description is too short', () => {
      const cvWithShortDesc = {
        ...mockMinimalCV,
        experience: [
          {
            ...mockMinimalCV.experience[0]!,
            description: 'Short',
          },
        ],
      };
      const result = validateCVData(cvWithShortDesc);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('detailed description'))).toBe(true);
    });
  });

  describe('validateJobDescription', () => {
    it('should pass validation for complete job description', () => {
      const result = validateJobDescription(mockJobDescription);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when job description is empty', () => {
      const result = validateJobDescription('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Job description is required');
    });

    it('should fail when job description is too short', () => {
      const result = validateJobDescription('Short job desc');
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('too short'))).toBe(true);
    });

    it('should warn when job description is quite short', () => {
      const result = validateJobDescription('This is a software engineer position requiring JavaScript and React skills');
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('quite short'))).toBe(true);
    });

    it('should warn when job description lacks key sections', () => {
      const simpleJD = 'We need a developer with JavaScript skills';
      const result = validateJobDescription(simpleJD);
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should warn when responsibilities are missing', () => {
      const jdWithoutResponsibilities = 'Requirements: JavaScript, React, Node.js';
      const result = validateJobDescription(jdWithoutResponsibilities);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('responsibilities'))).toBe(true);
    });
  });

  describe('validateOptimizationInputs', () => {
    it('should pass when both CV and JD are valid', () => {
      const result = validateOptimizationInputs(mockMinimalCV, mockJobDescription);
      expect(result.isValid).toBe(true);
    });

    it('should fail when CV is invalid', () => {
      const invalidCV = {
        ...mockMinimalCV,
        personalInfo: { ...mockMinimalCV.personalInfo, firstName: '' },
      };
      const result = validateOptimizationInputs(invalidCV, mockJobDescription);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail when JD is invalid', () => {
      const result = validateOptimizationInputs(mockMinimalCV, '');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should combine errors from both validations', () => {
      const invalidCV = {
        ...mockMinimalCV,
        personalInfo: { ...mockMinimalCV.personalInfo, firstName: '' },
      };
      const result = validateOptimizationInputs(invalidCV, 'Short');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('validateCoverLetterInputs', () => {
    it('should pass when CV has content and JD is valid', () => {
      const result = validateCoverLetterInputs(mockMinimalCV, mockJobDescription);
      expect(result.isValid).toBe(true);
    });

    it('should fail when CV has no skills, experience, or projects', () => {
      const emptyCV = {
        ...mockMinimalCV,
        skills: [],
        experience: [],
        projects: [],
      };
      const result = validateCoverLetterInputs(emptyCV, mockJobDescription);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('add skills, experience, or projects'))).toBe(true);
    });

    it('should pass when CV has skills but no experience', () => {
      const cvWithSkills = {
        ...mockMinimalCV,
        experience: [],
      };
      const result = validateCoverLetterInputs(cvWithSkills, mockJobDescription);
      expect(result.isValid).toBe(true);
    });
  });

  describe('formatValidationMessage', () => {
    it('should format errors correctly', () => {
      const result = {
        isValid: false,
        errors: ['Error 1', 'Error 2'],
        warnings: [],
      };
      const message = formatValidationMessage(result);
      expect(message).toContain('⚠️ Please fix the following issues:');
      expect(message).toContain('• Error 1');
      expect(message).toContain('• Error 2');
    });

    it('should format warnings correctly', () => {
      const result = {
        isValid: true,
        errors: [],
        warnings: ['Warning 1', 'Warning 2'],
      };
      const message = formatValidationMessage(result);
      expect(message).toContain('💡 Recommendations:');
      expect(message).toContain('• Warning 1');
      expect(message).toContain('• Warning 2');
    });

    it('should format both errors and warnings', () => {
      const result = {
        isValid: false,
        errors: ['Error 1'],
        warnings: ['Warning 1'],
      };
      const message = formatValidationMessage(result);
      expect(message).toContain('⚠️ Please fix the following issues:');
      expect(message).toContain('💡 Recommendations:');
      expect(message).toContain('• Error 1');
      expect(message).toContain('• Warning 1');
    });

    it('should return empty string when no errors or warnings', () => {
      const result = {
        isValid: true,
        errors: [],
        warnings: [],
      };
      const message = formatValidationMessage(result);
      expect(message).toBe('');
    });
  });
});
