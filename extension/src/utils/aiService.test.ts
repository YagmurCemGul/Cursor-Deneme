import AIService from './aiService';

describe('AIService', () => {
  const mockApiKey = 'test-api-key';

  describe('constructor', () => {
    it('should initialize with API key', () => {
      const aiService = new AIService(mockApiKey);
      expect(aiService).toBeInstanceOf(AIService);
    });
  });

  describe('optimizeCV', () => {
    it('should fallback to template when API key is demo-key', async () => {
      const aiService = new AIService('demo-key');
      const cvData = {
        personalInfo: {
          firstName: 'John',
          middleName: '',
          lastName: 'Doe',
          email: 'john@example.com',
          linkedInUsername: '',
          portfolioUrl: '',
          githubUsername: '',
          whatsappLink: '',
          phoneNumber: '',
          countryCode: '',
          summary: 'Software developer'
        },
        skills: ['JavaScript', 'React'],
        experience: [],
        education: [],
        certifications: [],
        projects: [],
        customQuestions: []
      };

      const result = await aiService.optimizeCV(cvData, 'Software engineer position');
      expect(result).toHaveProperty('optimizedCV');
      expect(result).toHaveProperty('optimizations');
      expect(Array.isArray(result.optimizations)).toBe(true);
    });
  });

  describe('generateCoverLetter', () => {
    it('should fallback to template when API key is demo-key', async () => {
      const aiService = new AIService('demo-key');
      const cvData = {
        personalInfo: {
          firstName: 'John',
          middleName: '',
          lastName: 'Doe',
          email: 'john@example.com',
          linkedInUsername: '',
          portfolioUrl: '',
          githubUsername: '',
          whatsappLink: '',
          phoneNumber: '',
          countryCode: '',
          summary: 'Software developer'
        },
        skills: ['JavaScript', 'React'],
        experience: [],
        education: [],
        certifications: [],
        projects: [],
        customQuestions: []
      };

      const result = await aiService.generateCoverLetter(cvData, 'Software engineer position');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('John Doe');
    });
  });
});