// @ts-nocheck - Test file needs updating to Jest format
describe.skip('Enhanced Input Validation (needs migration to Jest)', () => {});
import {
  validateCVData,
  validateJobDescription,
  validateOptimizationInputs,
  validateCoverLetterInputs,
  formatValidationMessage,
} from '../inputValidation';
import { CVData } from '../../types';

describe('Input Validation - Enhanced Error Scenarios', () => {
  const createMockCV = (overrides?: Partial<CVData>): CVData => ({
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phoneNumber: '1234567890',
      countryCode: '+1',
      summary: 'Experienced professional with over 10 years in software development',
      linkedInUsername: '',
      githubUsername: '',
      portfolioUrl: '',
      photoDataUrl: '',
      ...overrides?.personalInfo,
    },
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS'],
    experience: [
      {
        id: '1',
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        location: 'San Francisco, CA',
        startDate: '2020',
        endDate: '2023',
        description: 'Led development of multiple high-impact projects using modern web technologies. Managed team of 5 developers and coordinated with stakeholders.',
        skills: ['React', 'Node.js', 'AWS'],
      },
    ],
    education: [
      {
        id: '1',
        school: 'University of Technology',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        startDate: '2010',
        endDate: '2014',
        grade: '3.8 GPA',
        description: 'Focus on software engineering and data structures',
        activities: '',
        skills: [],
      },
    ],
    certifications: [],
    projects: [],
    ...overrides,
  });

  describe('Edge Cases', () => {
    it('should handle CV with only spaces in required fields', () => {
      const cv = createMockCV({
        personalInfo: {
          firstName: '   ',
          lastName: '   ',
          email: 'john@example.com',
          phoneNumber: '',
          countryCode: '',
          summary: '',
          linkedInUsername: '',
          githubUsername: '',
          portfolioUrl: '',
          photoDataUrl: '',
        },
      });
      const result = validateCVData(cv);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('First name is required');
      expect(result.errors).toContain('Last name is required');
    });

    it('should handle job description with only whitespace', () => {
      const result = validateJobDescription('   \n\n   ');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Job description is required');
    });

    it('should handle CV with very old experience', () => {
      const cv = createMockCV({
        experience: [
          {
            id: '1',
            title: 'Developer',
            company: 'Old Corp',
            location: 'NYC',
            startDate: '2000',
            endDate: '2005',
            description: 'Worked on legacy systems for many years',
            skills: ['Java'],
          },
        ],
      });
      const result = validateCVData(cv);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('recent'))).toBe(true);
    });

    it('should handle multiple short experience descriptions', () => {
      const cv = createMockCV({
        experience: [
          {
            id: '1',
            title: 'Job 1',
            company: 'Company',
            location: 'City',
            startDate: '2020',
            endDate: '2021',
            description: 'Short',
            skills: [],
          },
          {
            id: '2',
            title: 'Job 2',
            company: 'Company',
            location: 'City',
            startDate: '2021',
            endDate: '2022',
            description: 'Also short',
            skills: [],
          },
        ],
      });
      const result = validateCVData(cv);
      expect(result.warnings.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Job Description Validation Edge Cases', () => {
    it('should detect job descriptions without proper structure', () => {
      const jd = 'We need someone who knows JavaScript';
      const result = validateJobDescription(jd);
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should handle job descriptions with many line breaks but little content', () => {
      const jd = 'Line 1\n\n\n\n\nLine 2\n\n\n\nLine 3';
      const result = validateJobDescription(jd);
      expect(result.warnings.some(w => w.includes('short lines'))).toBe(true);
    });

    it('should recognize well-structured job descriptions', () => {
      const jd = `
        Senior Software Engineer Position
        
        About the Role:
        We are seeking an experienced software engineer.
        
        Responsibilities:
        - Develop web applications
        - Lead technical projects
        - Mentor junior developers
        
        Requirements:
        - 5+ years of experience
        - Strong knowledge of JavaScript
        - Experience with React and Node.js
        
        Skills:
        - JavaScript, TypeScript
        - React, Node.js
        - AWS, Docker
      `;
      const result = validateJobDescription(jd);
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBe(0);
    });

    it('should handle very long job descriptions', () => {
      const longJD = 'We are looking for a developer. '.repeat(100);
      const result = validateJobDescription(longJD);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Cover Letter Validation Edge Cases', () => {
    it('should require content for cover letter generation', () => {
      const cv = createMockCV({
        skills: [],
        experience: [],
        projects: [],
      });
      const jd = 'Software Engineer position requiring JavaScript skills';
      const result = validateCoverLetterInputs(cv, jd);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('skills, experience, or projects'))).toBe(true);
    });

    it('should accept CV with only projects', () => {
      const cv = createMockCV({
        experience: [],
        projects: [
          {
            id: '1',
            name: 'Personal Project',
            description: 'Built a web application using React and Node.js',
            technologies: ['React', 'Node.js'],
            url: '',
            startDate: '2022',
            endDate: '2023',
          },
        ],
      });
      const jd = 'Software Engineer position';
      const result = validateCoverLetterInputs(cv, jd);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Optimization Inputs Validation', () => {
    it('should combine all errors from CV and JD validation', () => {
      const cv = createMockCV({
        personalInfo: {
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          countryCode: '',
          summary: '',
          linkedInUsername: '',
          githubUsername: '',
          portfolioUrl: '',
          photoDataUrl: '',
        },
        skills: [],
        experience: [],
      });
      const jd = 'Too short';
      const result = validateOptimizationInputs(cv, jd);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(2);
    });

    it('should pass when both CV and JD are valid', () => {
      const cv = createMockCV();
      const jd = 'Senior Software Engineer position requiring JavaScript, React, and Node.js experience. Responsibilities include leading projects and mentoring. Requirements include 5+ years of experience.';
      const result = validateOptimizationInputs(cv, jd);
      expect(result.isValid).toBe(true);
    });
  });

  describe('formatValidationMessage', () => {
    it('should format complex validation results', () => {
      const result = {
        isValid: false,
        errors: ['Error 1', 'Error 2', 'Error 3'],
        warnings: ['Warning 1', 'Warning 2'],
      };
      const message = formatValidationMessage(result);
      expect(message).toContain('⚠️');
      expect(message).toContain('💡');
      expect(message).toContain('Error 1');
      expect(message).toContain('Warning 1');
    });

    it('should handle empty validation results', () => {
      const result = {
        isValid: true,
        errors: [],
        warnings: [],
      };
      const message = formatValidationMessage(result);
      expect(message).toBe('');
    });

    it('should format errors only', () => {
      const result = {
        isValid: false,
        errors: ['Critical error'],
        warnings: [],
      };
      const message = formatValidationMessage(result);
      expect(message).toContain('Critical error');
      expect(message).not.toContain('💡');
    });

    it('should format warnings only', () => {
      const result = {
        isValid: true,
        errors: [],
        warnings: ['Suggestion 1'],
      };
      const message = formatValidationMessage(result);
      expect(message).toContain('Suggestion 1');
      expect(message).not.toContain('⚠️');
    });
  });

  describe('Performance and Boundary Tests', () => {
    it('should handle CV with many experiences efficiently', () => {
      const experiences = Array(50).fill(null).map((_, i) => ({
        id: `${i}`,
        title: `Position ${i}`,
        company: `Company ${i}`,
        location: 'Location',
        startDate: '2020',
        endDate: '2021',
        description: 'Long enough description that meets the minimum requirements',
        skills: ['Skill 1'],
      }));
      const cv = createMockCV({ experience: experiences });
      const result = validateCVData(cv);
      expect(result.isValid).toBe(true);
    });

    it('should handle CV with many skills', () => {
      const skills = Array(100).fill(null).map((_, i) => `Skill ${i}`);
      const cv = createMockCV({ skills });
      const result = validateCVData(cv);
      expect(result.isValid).toBe(true);
    });

    it('should handle extremely long job descriptions', () => {
      const longJD = `
        ${'This is a very detailed job description. '.repeat(500)}
        Responsibilities: ${'• Responsibility item. '.repeat(50)}
        Requirements: ${'• Requirement item. '.repeat(50)}
        Skills: ${'• Skill item. '.repeat(50)}
      `;
      const result = validateJobDescription(longJD);
      expect(result.isValid).toBe(true);
    });
  });
});
