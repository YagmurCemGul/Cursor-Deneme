/**
 * Tests for AI Service
 */

import { AIService } from '../aiService';
import { CVData } from '../../types';

describe('AIService', () => {
  let mockCVData: CVData;

  beforeEach(() => {
    mockCVData = {
      personalInfo: {
        firstName: 'John',
        middleName: '',
        lastName: 'Doe',
        email: 'john@example.com',
        linkedInUsername: 'johndoe',
        portfolioUrl: '',
        githubUsername: '',
        whatsappLink: '',
        phoneNumber: '1234567890',
        countryCode: '+1',
        summary: 'Experienced software developer',
      },
      skills: ['JavaScript', 'TypeScript', 'React'],
      experience: [
        {
          id: '1',
          title: 'Software Engineer',
          employmentType: 'Full-time',
          company: 'Tech Corp',
          startDate: '2020-01',
          endDate: '2023-12',
          location: 'San Francisco',
          country: 'USA',
          city: 'San Francisco',
          locationType: 'On-site',
          description: 'Developed web applications',
          skills: ['React', 'Node.js'],
        },
      ],
      education: [],
      certifications: [],
      projects: [],
      customQuestions: [],
    };
  });

  describe('optimizeCV', () => {
    it('should return mock optimizations when no API key is configured', async () => {
      const aiService = new AIService();
      const jobDescription = 'Looking for a React developer with TypeScript experience';

      const result = await aiService.optimizeCV(mockCVData, jobDescription);

      expect(result).toBeDefined();
      expect(result.optimizations).toBeDefined();
      expect(Array.isArray(result.optimizations)).toBe(true);
      expect(result.optimizations.length).toBeGreaterThan(0);
    });

    it('should include optimization categories', async () => {
      const aiService = new AIService();
      const jobDescription = 'Looking for a React developer';

      const result = await aiService.optimizeCV(mockCVData, jobDescription);

      result.optimizations.forEach((opt) => {
        expect(opt).toHaveProperty('id');
        expect(opt).toHaveProperty('category');
        expect(opt).toHaveProperty('change');
        expect(opt).toHaveProperty('originalText');
        expect(opt).toHaveProperty('optimizedText');
        expect(opt).toHaveProperty('applied');
        expect(opt).toHaveProperty('section');
      });
    });
  });

  describe('generateCoverLetter', () => {
    it('should generate a cover letter in mock mode', async () => {
      const aiService = new AIService();
      const jobDescription = 'We are looking for a talented Software Engineer to join our team.';

      const coverLetter = await aiService.generateCoverLetter(mockCVData, jobDescription);

      expect(coverLetter).toBeDefined();
      expect(typeof coverLetter).toBe('string');
      expect(coverLetter.length).toBeGreaterThan(100);
      expect(coverLetter).toContain(mockCVData.personalInfo.firstName);
      expect(coverLetter).toContain(mockCVData.personalInfo.lastName);
    });

    it('should validate job description length', async () => {
      const aiService = new AIService();
      const shortJobDescription = 'Short';

      await expect(
        aiService.generateCoverLetter(mockCVData, shortJobDescription)
      ).rejects.toThrow('Job description is too short');
    });

    it('should validate personal info', async () => {
      const aiService = new AIService();
      const jobDescription = 'Looking for a developer with great skills';
      const invalidCVData = {
        ...mockCVData,
        personalInfo: {
          ...mockCVData.personalInfo,
          firstName: '',
          lastName: '',
        },
      };

      await expect(aiService.generateCoverLetter(invalidCVData, jobDescription)).rejects.toThrow(
        'Please fill in your name'
      );
    });

    it('should validate email', async () => {
      const aiService = new AIService();
      const jobDescription = 'Looking for a developer with great skills';
      const invalidCVData = {
        ...mockCVData,
        personalInfo: {
          ...mockCVData.personalInfo,
          email: '',
        },
      };

      await expect(aiService.generateCoverLetter(invalidCVData, jobDescription)).rejects.toThrow(
        'Please fill in your email'
      );
    });

    it('should validate skills', async () => {
      const aiService = new AIService();
      const jobDescription = 'Looking for a developer with great skills';
      const invalidCVData = {
        ...mockCVData,
        skills: [],
      };

      await expect(aiService.generateCoverLetter(invalidCVData, jobDescription)).rejects.toThrow(
        'Please add at least one skill'
      );
    });

    it('should accept extra prompt parameter', async () => {
      const aiService = new AIService();
      const jobDescription = 'We are looking for a talented Software Engineer';
      const extraPrompt = 'Please emphasize my leadership experience';

      const coverLetter = await aiService.generateCoverLetter(
        mockCVData,
        jobDescription,
        extraPrompt
      );

      expect(coverLetter).toBeDefined();
      expect(typeof coverLetter).toBe('string');
    });
  });

  describe('updateConfig', () => {
    it('should throw error when config is invalid', () => {
      const aiService = new AIService();

      expect(() => {
        aiService.updateConfig({
          provider: 'openai',
          apiKey: '',
          temperature: 0.7,
        });
      }).toThrow();
    });
  });
});
