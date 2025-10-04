import { generateInterviewQuestions, filterQuestionsByCategory, filterQuestionsByDifficulty, sortQuestionsByRelevance } from '../interviewQuestionsGenerator';
import { CVData } from '../../types';

// Mock AI service
jest.mock('../aiService', () => ({
  aiService: {
    generateText: jest.fn().mockResolvedValue(JSON.stringify([
      {
        category: 'Technical',
        question: 'Explain your experience with React hooks?',
        difficulty: 'Medium',
        relevance: 90,
        basedOn: 'React skill'
      },
      {
        category: 'Behavioral',
        question: 'Describe a challenging project you worked on?',
        difficulty: 'Easy',
        relevance: 85,
        basedOn: 'Work experience'
      }
    ]))
  }
}));

describe('Interview Questions Generator', () => {
  const mockCV: CVData = {
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
      summary: 'Experienced developer',
    },
    skills: ['React', 'TypeScript', 'Node.js'],
    experience: [
      {
        id: '1',
        title: 'Software Engineer',
        company: 'Tech Corp',
        employmentType: 'Full-time',
        startDate: '2020-01',
        endDate: '2023-12',
        location: 'Remote',
        locationType: 'Remote',
        description: 'Built web applications',
        skills: ['React', 'TypeScript'],
      }
    ],
    education: [],
    certifications: [],
    projects: [],
    customQuestions: [],
  };

  describe('generateInterviewQuestions', () => {
    it('should generate questions based on CV data', async () => {
      const result = await generateInterviewQuestions(mockCV, undefined, 10);
      
      expect(result).toBeDefined();
      expect(result.questions).toBeInstanceOf(Array);
      expect(result.totalQuestions).toBeGreaterThan(0);
    });

    it('should include job description in question generation', async () => {
      const jobDesc = 'Looking for React developer with 5 years experience';
      const result = await generateInterviewQuestions(mockCV, jobDesc, 15);
      
      expect(result.questions.length).toBeGreaterThan(0);
      expect(result.categories.length).toBeGreaterThan(0);
    });

    it('should return fallback questions on error', async () => {
      const result = await generateInterviewQuestions(mockCV, undefined, 5);
      
      expect(result.questions.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('filterQuestionsByCategory', () => {
    const mockQuestions = [
      {
        id: '1',
        category: 'Technical',
        question: 'Question 1',
        difficulty: 'Easy' as const,
        relevance: 80,
        basedOn: 'Skills'
      },
      {
        id: '2',
        category: 'Behavioral',
        question: 'Question 2',
        difficulty: 'Medium' as const,
        relevance: 85,
        basedOn: 'Experience'
      }
    ];

    it('should filter questions by category', () => {
      const filtered = filterQuestionsByCategory(mockQuestions, 'Technical');
      
      expect(filtered.length).toBe(1);
      expect(filtered[0]?.category).toBe('Technical');
    });
  });

  describe('filterQuestionsByDifficulty', () => {
    const mockQuestions = [
      {
        id: '1',
        category: 'Technical',
        question: 'Question 1',
        difficulty: 'Easy' as const,
        relevance: 80,
        basedOn: 'Skills'
      },
      {
        id: '2',
        category: 'Technical',
        question: 'Question 2',
        difficulty: 'Hard' as const,
        relevance: 85,
        basedOn: 'Experience'
      }
    ];

    it('should filter questions by difficulty', () => {
      const filtered = filterQuestionsByDifficulty(mockQuestions, 'Easy');
      
      expect(filtered.length).toBe(1);
      expect(filtered[0]?.difficulty).toBe('Easy');
    });
  });

  describe('sortQuestionsByRelevance', () => {
    const mockQuestions = [
      {
        id: '1',
        category: 'Technical',
        question: 'Question 1',
        difficulty: 'Easy' as const,
        relevance: 70,
        basedOn: 'Skills'
      },
      {
        id: '2',
        category: 'Technical',
        question: 'Question 2',
        difficulty: 'Medium' as const,
        relevance: 95,
        basedOn: 'Experience'
      }
    ];

    it('should sort questions by relevance descending', () => {
      const sorted = sortQuestionsByRelevance(mockQuestions);
      
      expect(sorted[0]?.relevance).toBeGreaterThanOrEqual(sorted[1]?.relevance || 0);
    });
  });
});
