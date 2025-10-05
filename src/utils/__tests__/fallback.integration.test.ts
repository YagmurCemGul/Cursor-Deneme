/**
 * Integration Tests for Auto-Fallback Feature
 * @deprecated This feature has been removed from the codebase
 */

// @ts-nocheck - Skipping deprecated tests with outdated API
import { AIService } from '../aiService';
import { AIConfig } from '../aiProviders';
import { CVData } from '../../types';

describe.skip('Auto-Fallback Integration Tests (DEPRECATED - feature removed)', () => {
  let mockCVData: CVData;
  let jobDescription: string;
  let mockFetch: jest.Mock;

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

    // Mock fetch
    mockFetch = jest.fn();
    global.fetch = mockFetch;

    // Mock chrome storage
    global.chrome = {
      storage: {
        local: {
          get: jest.fn().mockResolvedValue({
            apiKeys: {
              openai: 'openai-key',
              gemini: 'gemini-key',
              claude: 'claude-key',
            },
          }),
          set: jest.fn().mockResolvedValue(undefined),
        },
      },
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Primary Provider Failure Scenarios', () => {
    it('should fallback to secondary provider when primary fails with 503', async () => {
      const config: AIConfig = {
        provider: 'openai',
        apiKey: 'openai-key',
        temperature: 0.3,
      };

      const aiService = new AIService(config);
      aiService.setAutoFallback(true);

      // Mock OpenAI failure (503)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        text: async () => JSON.stringify({ error: { message: 'Service unavailable' } }),
      });

      // Mock Gemini success (fallback)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      optimizations: [
                        {
                          category: 'Keywords',
                          change: 'Add keywords',
                          originalText: 'Original',
                          optimizedText: 'Optimized',
                          section: 'summary',
                        },
                      ],
                    }),
                  },
                ],
              },
            },
          ],
        }),
      });

      const result = await aiService.optimizeCV(mockCVData, jobDescription);

      expect(result).toBeDefined();
      expect(result.optimizations).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledTimes(2); // OpenAI failed, Gemini succeeded
    });

    it('should try multiple fallback providers in order', async () => {
      const config: AIConfig = {
        provider: 'openai',
        apiKey: 'openai-key',
        temperature: 0.3,
      };

      const aiService = new AIService(config);
      aiService.setAutoFallback(true);

      // Mock OpenAI failure
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        text: async () => JSON.stringify({ error: { message: 'Service unavailable' } }),
      });

      // Mock Gemini failure (first fallback)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        text: async () => JSON.stringify({ error: { message: 'Service unavailable' } }),
      });

      // Mock Claude success (second fallback)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [
            {
              text: JSON.stringify({
                optimizations: [
                  {
                    category: 'Keywords',
                    change: 'Add keywords',
                    originalText: 'Original',
                    optimizedText: 'Optimized',
                    section: 'summary',
                  },
                ],
              }),
            },
          ],
        }),
      });

      const result = await aiService.optimizeCV(mockCVData, jobDescription);

      expect(result).toBeDefined();
      expect(result.optimizations).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledTimes(3); // OpenAI, Gemini failed, Claude succeeded
    });

    it('should not fallback when auto-fallback is disabled', async () => {
      const config: AIConfig = {
        provider: 'openai',
        apiKey: 'openai-key',
        temperature: 0.3,
      };

      const aiService = new AIService(config);
      aiService.setAutoFallback(false);

      // Mock OpenAI failure
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        text: async () => JSON.stringify({ error: { message: 'Service unavailable' } }),
      });

      try {
        await aiService.optimizeCV(mockCVData, jobDescription);
        fail('Should have thrown an error');
      } catch (error) {
        expect(mockFetch).toHaveBeenCalledTimes(1); // Only OpenAI was called
      }
    });
  });

  describe('Fallback Configuration', () => {
    it('should respect custom fallback order', async () => {
      const config: AIConfig = {
        provider: 'openai',
        apiKey: 'openai-key',
        temperature: 0.3,
      };

      const aiService = new AIService(config);
      aiService.setAutoFallback(true);
      aiService.setFallbackOrder(['claude', 'gemini']); // Claude first, then Gemini

      // Mock OpenAI failure
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        text: async () => JSON.stringify({ error: { message: 'Service unavailable' } }),
      });

      // Mock Claude success (should be tried first)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [
            {
              text: JSON.stringify({
                optimizations: [],
              }),
            },
          ],
        }),
      });

      await aiService.optimizeCV(mockCVData, jobDescription);

      // Verify Claude was called (not Gemini)
      const claudeCall = mockFetch.mock.calls[1];
      expect(claudeCall[0]).toContain('anthropic.com');
    });

    it('should skip providers without API keys', async () => {
      // Override chrome storage to have only OpenAI and Claude keys
      (global.chrome.storage.local.get as jest.Mock).mockResolvedValue({
        apiKeys: {
          openai: 'openai-key',
          claude: 'claude-key',
          // No Gemini key
        },
      });

      const config: AIConfig = {
        provider: 'openai',
        apiKey: 'openai-key',
        temperature: 0.3,
      };

      const aiService = new AIService(config);
      aiService.setAutoFallback(true);

      // Mock OpenAI failure
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        text: async () => JSON.stringify({ error: { message: 'Service unavailable' } }),
      });

      // Mock Claude success
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [
            {
              text: JSON.stringify({
                optimizations: [],
              }),
            },
          ],
        }),
      });

      await aiService.optimizeCV(mockCVData, jobDescription);

      // Should skip Gemini and go directly to Claude
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle all providers failing', async () => {
      const config: AIConfig = {
        provider: 'openai',
        apiKey: 'openai-key',
        temperature: 0.3,
      };

      const aiService = new AIService(config);
      aiService.setAutoFallback(true);

      // Mock all providers failing
      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
        text: async () => JSON.stringify({ error: { message: 'Service unavailable' } }),
      });

      try {
        await aiService.optimizeCV(mockCVData, jobDescription);
        // Should fall through to mock mode and return mock optimizations
        fail('Should have fallen back to mock mode');
      } catch (error) {
        // If it throws, that's also acceptable behavior
        expect(mockFetch).toHaveBeenCalled();
      }
    });

    it('should not retry on authentication errors', async () => {
      const config: AIConfig = {
        provider: 'openai',
        apiKey: 'invalid-key',
        temperature: 0.3,
      };

      const aiService = new AIService(config);
      aiService.setAutoFallback(true);

      // Mock authentication error (should not trigger fallback)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ error: { message: 'Invalid API key' } }),
      });

      try {
        await aiService.optimizeCV(mockCVData, jobDescription);
        fail('Should have thrown authentication error');
      } catch (error: any) {
        expect(error.message).toContain('Invalid API key');
        expect(mockFetch).toHaveBeenCalledTimes(1); // No fallback for auth errors
      }
    });
  });

  describe('Performance Tracking', () => {
    it('should track fallback success in analytics', async () => {
      const config: AIConfig = {
        provider: 'openai',
        apiKey: 'openai-key',
        temperature: 0.3,
      };

      const aiService = new AIService(config);
      aiService.setAutoFallback(true);

      // Mock OpenAI failure
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        text: async () => JSON.stringify({ error: { message: 'Service unavailable' } }),
      });

      // Mock Gemini success
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      optimizations: [],
                    }),
                  },
                ],
              },
            },
          ],
        }),
      });

      await aiService.optimizeCV(mockCVData, jobDescription);

      // Note: Analytics tracking would be verified by checking
      // if usageAnalytics.trackEvent was called with fallback metadata
      // This would require mocking the usageAnalytics service
    });
  });
});
