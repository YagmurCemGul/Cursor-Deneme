/**
 * Tests for AI Providers
 */

import {
  OpenAIProvider,
  GeminiProvider,
  ClaudeProvider,
  createAIProvider,
  AIConfig,
} from '../aiProviders';
import { CVData } from '../../types';

describe('AI Providers', () => {
  let mockCVData: CVData;
  let jobDescription: string;

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

    jobDescription = 'Looking for a React developer with TypeScript experience';
  });

  describe('createAIProvider', () => {
    it('should create OpenAI provider', () => {
      const config: AIConfig = {
        provider: 'openai',
        apiKey: 'test-key',
        model: 'gpt-4o-mini',
        temperature: 0.3,
      };

      const provider = createAIProvider(config);
      expect(provider).toBeInstanceOf(OpenAIProvider);
    });

    it('should create Gemini provider', () => {
      const config: AIConfig = {
        provider: 'gemini',
        apiKey: 'test-key',
        model: 'gemini-pro',
        temperature: 0.3,
      };

      const provider = createAIProvider(config);
      expect(provider).toBeInstanceOf(GeminiProvider);
    });

    it('should create Claude provider', () => {
      const config: AIConfig = {
        provider: 'claude',
        apiKey: 'test-key',
        model: 'claude-3-haiku-20240307',
        temperature: 0.3,
      };

      const provider = createAIProvider(config);
      expect(provider).toBeInstanceOf(ClaudeProvider);
    });

    it('should throw error for unsupported provider', () => {
      const config = {
        provider: 'unsupported',
        apiKey: 'test-key',
      } as any;

      expect(() => createAIProvider(config)).toThrow('Unsupported AI provider');
    });
  });

  describe('OpenAIProvider', () => {
    let provider: OpenAIProvider;
    let mockFetch: jest.Mock;

    beforeEach(() => {
      const config: AIConfig = {
        provider: 'openai',
        apiKey: 'test-key',
        model: 'gpt-4o-mini',
        temperature: 0.3,
      };
      provider = new OpenAIProvider(config);

      // Mock global fetch
      mockFetch = jest.fn();
      global.fetch = mockFetch;
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('optimizeCV', () => {
      it('should handle successful optimization', async () => {
        const mockResponse = {
          optimizations: [
            {
              category: 'Keywords',
              change: 'Add React keywords',
              originalText: 'Developed applications',
              optimizedText: 'Developed React applications',
              section: 'experience',
            },
          ],
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [
              {
                message: {
                  content: JSON.stringify(mockResponse),
                },
              },
            ],
          }),
        });

        const result = await provider.optimizeCV(mockCVData, jobDescription);

        expect(result).toBeDefined();
        expect(result.optimizations).toHaveLength(1);
        expect(result.optimizations[0]?.category).toBe('Keywords');
        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.openai.com/v1/chat/completions',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              Authorization: 'Bearer test-key',
            }),
          })
        );
      });

      it('should handle 401 error', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 401,
          text: async () => JSON.stringify({ error: { message: 'Invalid API key' } }),
        });

        await expect(provider.optimizeCV(mockCVData, jobDescription)).rejects.toThrow(
          'Invalid API key'
        );
      });

      it('should handle 429 rate limit error', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 429,
          text: async () => JSON.stringify({ error: { message: 'Rate limit exceeded' } }),
        });

        await expect(provider.optimizeCV(mockCVData, jobDescription)).rejects.toThrow(
          'API rate limit exceeded'
        );
      });

      it('should handle invalid JSON response', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [
              {
                message: {
                  content: 'invalid json',
                },
              },
            ],
          }),
        });

        await expect(provider.optimizeCV(mockCVData, jobDescription)).rejects.toThrow(
          'Failed to parse AI response'
        );
      });
    });

    describe('generateCoverLetter', () => {
      it('should generate cover letter successfully', async () => {
        const mockCoverLetter = 'Dear Hiring Manager, I am excited to apply...';

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [
              {
                message: {
                  content: mockCoverLetter,
                },
              },
            ],
          }),
        });

        const result = await provider.generateCoverLetter(mockCVData, jobDescription);

        expect(result).toBe(mockCoverLetter);
        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.openai.com/v1/chat/completions',
          expect.objectContaining({
            method: 'POST',
          })
        );
      });

      it('should include extra prompt if provided', async () => {
        const mockCoverLetter = 'Dear Hiring Manager...';
        const extraPrompt = 'Focus on leadership';

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [
              {
                message: {
                  content: mockCoverLetter,
                },
              },
            ],
          }),
        });

        await provider.generateCoverLetter(mockCVData, jobDescription, extraPrompt);

        const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(callBody.messages[1].content).toContain(extraPrompt);
      });
    });
  });

  describe('GeminiProvider', () => {
    let provider: GeminiProvider;
    let mockFetch: jest.Mock;

    beforeEach(() => {
      const config: AIConfig = {
        provider: 'gemini',
        apiKey: 'test-key',
        model: 'gemini-pro',
        temperature: 0.3,
      };
      provider = new GeminiProvider(config);

      mockFetch = jest.fn();
      global.fetch = mockFetch;
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should handle successful optimization with JSON in markdown', async () => {
      const mockResponse = {
        optimizations: [
          {
            category: 'Keywords',
            change: 'Add keywords',
            originalText: 'Original',
            optimizedText: 'Optimized',
            section: 'summary',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: '```json\n' + JSON.stringify(mockResponse) + '\n```',
                  },
                ],
              },
            },
          ],
        }),
      });

      const result = await provider.optimizeCV(mockCVData, jobDescription);

      expect(result.optimizations).toHaveLength(1);
      expect(result.optimizations[0]?.category).toBe('Keywords');
    });

    it('should handle safety filter blocking', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            {
              finishReason: 'SAFETY',
            },
          ],
        }),
      });

      await expect(provider.optimizeCV(mockCVData, jobDescription)).rejects.toThrow(
        'blocked by safety filters'
      );
    });
  });

  describe('ClaudeProvider', () => {
    let provider: ClaudeProvider;
    let mockFetch: jest.Mock;

    beforeEach(() => {
      const config: AIConfig = {
        provider: 'claude',
        apiKey: 'test-key',
        model: 'claude-3-haiku-20240307',
        temperature: 0.3,
      };
      provider = new ClaudeProvider(config);

      mockFetch = jest.fn();
      global.fetch = mockFetch;
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should use correct API headers', async () => {
      const mockResponse = {
        optimizations: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [
            {
              text: JSON.stringify(mockResponse),
            },
          ],
        }),
      });

      await provider.optimizeCV(mockCVData, jobDescription);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-api-key': 'test-key',
            'anthropic-version': '2023-06-01',
          }),
        })
      );
    });

    it('should parse JSON from markdown blocks', async () => {
      const mockResponse = {
        optimizations: [
          {
            category: 'Skills',
            change: 'Test',
            originalText: 'Test',
            optimizedText: 'Test',
            section: 'skills',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [
            {
              text: '```\n' + JSON.stringify(mockResponse) + '\n```',
            },
          ],
        }),
      });

      const result = await provider.optimizeCV(mockCVData, jobDescription);

      expect(result.optimizations).toHaveLength(1);
    });
  });
});
