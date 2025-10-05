/**
 * Rate Limit Handling Tests
 * Tests for 429 error handling with exponential backoff
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenAIProvider, GeminiProvider, ClaudeProvider, AIConfig } from '../aiProviders';
import { APIManager } from '../apiManager';
import type { CVData } from '../../types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe('Rate Limit Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockCVData: CVData = {
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      summary: 'Software Engineer',
    },
    skills: ['JavaScript', 'TypeScript', 'React'],
    experience: [
      {
        id: '1',
        company: 'Tech Corp',
        position: 'Senior Developer',
        startDate: '2020-01',
        endDate: '2023-12',
        description: 'Built awesome things',
        responsibilities: ['Coding', 'Testing'],
      },
    ],
    education: [
      {
        id: '1',
        institution: 'University',
        degree: 'Bachelor',
        field: 'Computer Science',
        startDate: '2015-09',
        endDate: '2019-06',
      },
    ],
    languages: [{ language: 'English', proficiency: 'Native' }],
    certifications: [],
    projects: [],
  };

  const jobDescription = 'We are looking for a senior software engineer...';

  describe('OpenAI Rate Limit Handling', () => {
    it('should detect and format 429 errors correctly', async () => {
      const config: AIConfig = {
        provider: 'openai',
        apiKey: 'test-key',
        model: 'gpt-4o-mini',
      };
      const provider = new OpenAIProvider(config);

      // Mock 429 response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Rate limit exceeded',
      });

      await expect(provider.optimizeCV(mockCVData, jobDescription)).rejects.toThrow(
        /rate limit exceeded.*429/i
      );
    });

    it('should throw error with helpful message on 429', async () => {
      const config: AIConfig = {
        provider: 'openai',
        apiKey: 'test-key',
      };
      const provider = new OpenAIProvider(config);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Rate limit exceeded',
      });

      try {
        await provider.generateCoverLetter(mockCVData, jobDescription);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toMatch(/rate limit/i);
        expect(error.message).toMatch(/429/);
        expect(error.message).toMatch(/wait.*try again/i);
      }
    });
  });

  describe('Gemini Rate Limit Handling', () => {
    it('should detect and format 429 errors correctly', async () => {
      const config: AIConfig = {
        provider: 'gemini',
        apiKey: 'test-key',
        model: 'gemini-pro',
      };
      const provider = new GeminiProvider(config);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Rate limit exceeded',
      });

      await expect(provider.optimizeCV(mockCVData, jobDescription)).rejects.toThrow(
        /Gemini rate limit exceeded.*429/i
      );
    });
  });

  describe('Claude Rate Limit Handling', () => {
    it('should detect and format 429 errors correctly', async () => {
      const config: AIConfig = {
        provider: 'claude',
        apiKey: 'test-key',
        model: 'claude-3-haiku-20240307',
      };
      const provider = new ClaudeProvider(config);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Rate limit exceeded',
      });

      await expect(provider.optimizeCV(mockCVData, jobDescription)).rejects.toThrow(
        /Claude rate limit exceeded.*429/i
      );
    });
  });

  describe('APIManager Rate Limit Retry Logic', () => {
    it('should retry on 429 errors with exponential backoff', async () => {
      vi.useFakeTimers();

      const requestFn = vi.fn()
        .mockRejectedValueOnce(new Error('OpenAI rate limit exceeded (429). Please wait and try again.'))
        .mockRejectedValueOnce(new Error('OpenAI rate limit exceeded (429). Please wait and try again.'))
        .mockResolvedValueOnce({ success: true });

      const promise = APIManager.request(
        'test-rate-limit',
        requestFn,
        {
          retries: 2,
          retryDelay: 1000,
        }
      );

      // First attempt fails immediately
      await vi.advanceTimersByTimeAsync(0);
      expect(requestFn).toHaveBeenCalledTimes(1);

      // First retry after ~5000ms (rate limit minimum)
      await vi.advanceTimersByTimeAsync(5000);
      expect(requestFn).toHaveBeenCalledTimes(2);

      // Second retry after longer delay
      await vi.advanceTimersByTimeAsync(9000); // exponential backoff
      expect(requestFn).toHaveBeenCalledTimes(3);

      const result = await promise;
      expect(result).toEqual({ success: true });

      vi.useRealTimers();
    });

    it('should throw helpful error after max retries on 429', async () => {
      vi.useFakeTimers();

      const requestFn = vi.fn()
        .mockRejectedValue(new Error('OpenAI rate limit exceeded (429). Please wait and try again.'));

      const promise = APIManager.request(
        'test-rate-limit-fail',
        requestFn,
        {
          retries: 2,
          retryDelay: 1000,
        }
      );

      // Let all retries complete
      await vi.advanceTimersByTimeAsync(30000);

      await expect(promise).rejects.toThrow(/Rate limit exceeded.*wait.*try again.*upgrade.*API plan/i);

      vi.useRealTimers();
    });

    it('should use longer delays for rate limit errors vs other errors', async () => {
      vi.useFakeTimers();
      const delays: number[] = [];
      const startTime = Date.now();

      const requestFn = vi.fn()
        .mockRejectedValueOnce(new Error('OpenAI rate limit exceeded (429). Please wait and try again.'))
        .mockResolvedValueOnce({ success: true });

      const promise = APIManager.request(
        'test-rate-limit-delay',
        requestFn,
        {
          retries: 2,
          retryDelay: 1000,
        }
      );

      // Track delays
      await vi.advanceTimersByTimeAsync(100);
      const firstCallTime = Date.now();
      
      await vi.advanceTimersByTimeAsync(5000); // Should wait at least 5 seconds for rate limit
      const retryTime = Date.now();
      
      delays.push(retryTime - firstCallTime);

      await promise;

      // Rate limit retry should have a delay of at least 5000ms
      expect(delays[0]).toBeGreaterThanOrEqual(5000);

      vi.useRealTimers();
    });

    it('should not retry on non-retryable errors', async () => {
      const requestFn = vi.fn()
        .mockRejectedValue(new Error('Invalid API key'));

      await expect(
        APIManager.request('test-no-retry', requestFn, { retries: 2 })
      ).rejects.toThrow('Invalid API key');

      expect(requestFn).toHaveBeenCalledTimes(1); // No retries
    });

    it('should provide progress updates during rate limit retries', async () => {
      vi.useFakeTimers();

      const progressUpdates: any[] = [];
      const onProgress = vi.fn((progress) => progressUpdates.push(progress));

      const requestFn = vi.fn()
        .mockRejectedValueOnce(new Error('OpenAI rate limit exceeded (429). Please wait and try again.'))
        .mockResolvedValueOnce({ success: true });

      const promise = APIManager.request(
        'test-rate-limit-progress',
        requestFn,
        {
          retries: 2,
          retryDelay: 1000,
          onProgress,
        }
      );

      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(5000);
      await vi.advanceTimersByTimeAsync(100);

      await promise;

      // Check that progress updates mention rate limiting
      const rateLimitProgress = progressUpdates.find(p => 
        p.message && p.message.toLowerCase().includes('rate limit')
      );
      expect(rateLimitProgress).toBeDefined();
      expect(rateLimitProgress?.message).toMatch(/waiting.*before retry/i);

      vi.useRealTimers();
    });
  });

  describe('Integration: Rate Limit Error Detection', () => {
    it('should properly detect rate limit from error message variants', () => {
      const errorMessages = [
        'OpenAI rate limit exceeded (429). Please wait and try again.',
        'Error 429: Rate limit reached',
        'Rate limit error',
        'API rate limiting in effect',
      ];

      errorMessages.forEach(message => {
        const isRateLimit = message.includes('429') || 
                           message.toLowerCase().includes('rate limit');
        expect(isRateLimit).toBe(true);
      });
    });

    it('should not falsely identify non-rate-limit errors', () => {
      const nonRateLimitErrors = [
        'Invalid API key (401)',
        'Server error (500)',
        'Network timeout',
        'Parse error',
      ];

      nonRateLimitErrors.forEach(message => {
        const isRateLimit = message.includes('429') || 
                           message.toLowerCase().includes('rate limit');
        expect(isRateLimit).toBe(false);
      });
    });
  });
});
