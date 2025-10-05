/**
 * Streaming AI Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StreamingAIProvider, collectStream, streamWithProgress } from '../streamingAI';

describe('StreamingAIProvider', () => {
  let provider: StreamingAIProvider;
  const mockApiKey = 'test-key';

  beforeEach(() => {
    provider = new StreamingAIProvider('openai', mockApiKey);
  });

  describe('Stream Generation', () => {
    it('should yield chunks progressively', async () => {
      const chunks: string[] = [];
      
      // Mock fetch for streaming
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n')
              })
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":" World"}}]}\n')
              })
              .mockResolvedValueOnce({ done: true })
          })
        }
      });

      const cvData = {
        personalInfo: { firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '', summary: '' },
        experience: [],
        education: [],
        skills: [],
        certifications: [],
        projects: [],
        customSections: []
      };

      const stream = provider.streamGenerateCoverLetter(cvData, 'Job description');

      for await (const chunk of stream) {
        if (chunk.type === 'chunk' && chunk.content) {
          chunks.push(chunk.content);
        }
      }

      expect(chunks).toContain('Hello');
      expect(chunks).toContain(' World');
    });

    it('should handle errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const cvData = {
        personalInfo: { firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '', summary: '' },
        experience: [],
        education: [],
        skills: [],
        certifications: [],
        projects: [],
        customSections: []
      };

      const stream = provider.streamOptimizeCV(cvData, 'Job description');
      const chunks = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const errorChunk = chunks.find(c => c.type === 'error');
      expect(errorChunk).toBeDefined();
    });

    it('should support cancellation', async () => {
      const controller = new AbortController();
      
      global.fetch = vi.fn().mockImplementation(() => 
        new Promise((resolve) => setTimeout(resolve, 1000))
      );

      const cvData = {
        personalInfo: { firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '', summary: '' },
        experience: [],
        education: [],
        skills: [],
        certifications: [],
        projects: [],
        customSections: []
      };

      const streamPromise = (async () => {
        const chunks = [];
        const stream = provider.streamOptimizeCV(cvData, 'Job', {
          signal: controller.signal
        });
        
        for await (const chunk of stream) {
          chunks.push(chunk);
        }
        return chunks;
      })();

      // Cancel after 100ms
      setTimeout(() => controller.abort(), 100);

      await expect(streamPromise).rejects.toThrow();
    });
  });

  describe('Helper Functions', () => {
    it('collectStream should combine all chunks', async () => {
      async function* mockStream() {
        yield { type: 'start' as const, progress: 0 };
        yield { type: 'chunk' as const, content: 'Hello', progress: 50 };
        yield { type: 'chunk' as const, content: ' World', progress: 100 };
        yield { type: 'complete' as const, progress: 100 };
      }

      const result = await collectStream(mockStream());
      expect(result).toBe('Hello World');
    });

    it('streamWithProgress should call progress callback', async () => {
      const progressUpdates: Array<{ content: string; progress: number }> = [];

      async function* mockStream() {
        yield { type: 'chunk' as const, content: 'A', progress: 25 };
        yield { type: 'chunk' as const, content: 'B', progress: 50 };
        yield { type: 'chunk' as const, content: 'C', progress: 75 };
      }

      await streamWithProgress(mockStream(), (content, progress) => {
        progressUpdates.push({ content, progress });
      });

      expect(progressUpdates.length).toBe(3);
      expect(progressUpdates[0]).toEqual({ content: 'A', progress: 25 });
      expect(progressUpdates[2].content).toBe('ABC');
    });
  });
});
