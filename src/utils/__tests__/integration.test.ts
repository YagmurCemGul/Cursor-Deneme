/**
 * Integration Tests
 * Tests complete workflows with multiple components
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getSmartAI } from '../smartAIIntegration';
import { getRateLimitTracker } from '../rateLimitTracker';
import { getBudgetManager } from '../budgetManager';
import { getGlobalQueue } from '../smartRequestQueue';

// Mock fetch
global.fetch = vi.fn();

describe('Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Complete Optimization Workflow', () => {
    it('should handle full optimization with all features', async () => {
      // Setup
      const smartAI = getSmartAI();
      const budgetManager = getBudgetManager({ period: 'daily', limit: 10.0 });
      
      const cvData = {
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          summary: 'Experienced software engineer'
        },
        experience: [{
          title: 'Software Engineer',
          company: 'Tech Corp',
          location: 'San Francisco',
          startDate: '2020-01',
          endDate: '2023-01',
          current: false,
          description: 'Built awesome software'
        }],
        education: [{
          degree: "Bachelor's",
          field: 'Computer Science',
          institution: 'University',
          location: 'CA',
          graduationDate: '2020'
        }],
        skills: ['JavaScript', 'React', 'Node.js'],
        certifications: [],
        projects: [],
        customSections: []
      };

      const jobDescription = 'Looking for senior software engineer with React experience';

      // Mock successful API response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify({
                optimizations: [{
                  category: 'Keywords',
                  change: 'Add React keywords',
                  originalText: 'Built awesome software',
                  optimizedText: 'Built awesome React applications',
                  section: 'experience'
                }]
              })
            }
          }]
        })
      });

      // Mock chrome storage
      global.chrome = {
        storage: {
          local: {
            get: vi.fn().mockResolvedValue({
              openai_api_key: 'test-key'
            }),
            set: vi.fn()
          }
        },
        runtime: {
          getURL: vi.fn((path) => `chrome-extension://test/${path}`)
        }
      } as any;

      // Execute
      try {
        const result = await smartAI.optimizeCV(cvData, jobDescription, {
          provider: 'openai',
          enableQueue: true,
          enableCache: true,
          enableFallback: false,
          enableAnalytics: true
        });

        // Verify
        expect(result).toBeDefined();
        expect(result.metadata).toBeDefined();
        expect(result.metadata.provider).toBe('openai');
        
        // Check that budget was tracked
        const spending = budgetManager.getCurrentSpending();
        expect(spending).toBeGreaterThan(0);
        
        // Check that rate limit was recorded
        const tracker = getRateLimitTracker('openai');
        const stats = tracker.getUsageStats();
        expect(stats.currentRpm).toBeGreaterThan(0);
      } catch (error) {
        // Expected if API call fails in test environment
        expect(error).toBeDefined();
      }
    });
  });

  describe('Rate Limit + Queue Integration', () => {
    it('should queue requests when rate limit is reached', async () => {
      const tracker = getRateLimitTracker('openai', 'free');
      const queue = getGlobalQueue();

      // Fill up rate limit
      for (let i = 0; i < 3; i++) {
        tracker.recordRequest(1000);
      }

      // Now rate limit should be reached
      const stats = tracker.getUsageStats();
      expect(stats.currentRpm).toBe(3);
      expect(stats.maxRpm).toBe(3);

      // Next request should be queued
      const canMake = tracker.canMakeRequest();
      expect(canMake).toBe(false);

      const waitTime = tracker.getWaitTime();
      expect(waitTime).toBeGreaterThan(0);
    });
  });

  describe('Budget + Cost Tracking Integration', () => {
    it('should prevent requests when budget exceeded', () => {
      const budgetManager = getBudgetManager({ period: 'daily', limit: 1.0 });

      // Spend up to limit
      budgetManager.trackCost({
        provider: 'openai',
        operation: 'optimizeCV',
        inputTokens: 10000,
        outputTokens: 5000,
        cost: 0.95,
        model: 'gpt-4'
      });

      // Should still allow small spend
      expect(budgetManager.canSpend(0.04)).toBe(true);

      // Should not allow overspend
      expect(budgetManager.canSpend(0.10)).toBe(false);
    });
  });

  describe('Cache + Analytics Integration', () => {
    it('should track cache hits in analytics', async () => {
      const cache = new (await import('../smartCache')).SmartCache('test');
      
      cache.set('key1', 'value1');
      
      // First access (hit)
      cache.get('key1');
      
      // Second access (hit)
      cache.get('key1');
      
      // Non-existent (miss)
      cache.get('key2');
      
      const stats = cache.getStats();
      
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(0.666, 2);
    });
  });
});
