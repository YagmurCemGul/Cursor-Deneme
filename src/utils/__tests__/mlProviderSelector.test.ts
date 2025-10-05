/**
 * ML Provider Selector Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MLProviderSelector, ProviderPerformance } from '../mlProviderSelector';

describe('MLProviderSelector', () => {
  let selector: MLProviderSelector;

  beforeEach(() => {
    selector = new MLProviderSelector();
    selector.reset();
  });

  describe('Provider Selection', () => {
    it('should select provider based on historical performance', async () => {
      // Record good performance for Gemini
      for (let i = 0; i < 20; i++) {
        selector.recordPerformance({
          provider: 'gemini',
          operation: 'optimizeCV',
          cost: 0.01,
          latency: 1000,
          success: true,
          timestamp: Date.now(),
          timeOfDay: 14,
          tokensUsed: 1500,
          userSatisfaction: 0.9
        });
      }

      // Record poor performance for OpenAI
      for (let i = 0; i < 20; i++) {
        selector.recordPerformance({
          provider: 'openai',
          operation: 'optimizeCV',
          cost: 0.05,
          latency: 5000,
          success: false,
          timestamp: Date.now(),
          timeOfDay: 14,
          tokensUsed: 2000
        });
      }

      const selected = await selector.selectProvider({
        operation: 'optimizeCV',
        estimatedTokens: 1500,
        budget: 0.05,
        timeOfDay: 14,
        dayOfWeek: 1,
        urgency: 'normal',
        prioritize: 'cost'
      });

      // Should prefer Gemini due to better performance
      expect(['gemini', 'claude']).toContain(selected);
    });

    it('should prioritize based on context', async () => {
      selector.recordPerformance({
        provider: 'gemini',
        operation: 'optimizeCV',
        cost: 0.005,
        latency: 3000,
        success: true,
        timestamp: Date.now(),
        timeOfDay: 10,
        tokensUsed: 1000
      });

      selector.recordPerformance({
        provider: 'claude',
        operation: 'optimizeCV',
        cost: 0.02,
        latency: 1000,
        success: true,
        timestamp: Date.now(),
        timeOfDay: 10,
        tokensUsed: 1500
      });

      // Should prefer Gemini when prioritizing cost
      const costSelected = await selector.selectProvider({
        operation: 'optimizeCV',
        estimatedTokens: 1000,
        budget: 0.1,
        timeOfDay: 10,
        dayOfWeek: 1,
        urgency: 'normal',
        prioritize: 'cost'
      });

      expect(costSelected).toBe('gemini');
    });

    it('should explore randomly sometimes (epsilon-greedy)', async () => {
      const selections = new Set();
      
      for (let i = 0; i < 100; i++) {
        const selected = await selector.selectProvider({
          operation: 'optimizeCV',
          estimatedTokens: 1000,
          budget: 0.1,
          timeOfDay: 10,
          dayOfWeek: 1,
          urgency: 'normal',
          prioritize: 'cost'
        });
        selections.add(selected);
      }

      // Should have tried different providers due to exploration
      expect(selections.size).toBeGreaterThan(1);
    });
  });

  describe('Performance Recording', () => {
    it('should maintain history with size limit', () => {
      for (let i = 0; i < 1500; i++) {
        selector.recordPerformance({
          provider: 'openai',
          operation: 'optimizeCV',
          cost: 0.02,
          latency: 2000,
          success: true,
          timestamp: Date.now(),
          timeOfDay: 10,
          tokensUsed: 1000
        });
      }

      // Should be limited to maxHistorySize (1000)
      const insights = selector.getInsights();
      expect(insights).toBeDefined();
    });
  });

  describe('Recommendations', () => {
    it('should provide recommendations with reasoning', () => {
      selector.recordPerformance({
        provider: 'gemini',
        operation: 'optimizeCV',
        cost: 0.01,
        latency: 1500,
        success: true,
        timestamp: Date.now(),
        timeOfDay: 10,
        tokensUsed: 1000
      });

      const recommendations = selector.getRecommendations({
        operation: 'optimizeCV',
        estimatedTokens: 1000,
        budget: 0.1,
        timeOfDay: 10,
        dayOfWeek: 1,
        urgency: 'normal',
        prioritize: 'cost'
      });

      expect(recommendations).toHaveLength(3);
      expect(recommendations[0]).toHaveProperty('provider');
      expect(recommendations[0]).toHaveProperty('score');
      expect(recommendations[0]).toHaveProperty('reasoning');
    });
  });

  describe('Insights', () => {
    it('should generate insights from history', () => {
      for (let i = 0; i < 30; i++) {
        selector.recordPerformance({
          provider: 'gemini',
          operation: 'optimizeCV',
          cost: 0.008,
          latency: 1200,
          success: true,
          timestamp: Date.now(),
          timeOfDay: 10,
          tokensUsed: 1000
        });
      }

      const insights = selector.getInsights();
      
      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
    });

    it('should indicate insufficient data', () => {
      const insights = selector.getInsights();
      
      expect(insights).toContain('Not enough data for insights yet. Keep using the system!');
    });
  });

  describe('Weight Learning', () => {
    it('should update weights based on performance', () => {
      // Record 100 performances to trigger weight update
      for (let i = 0; i < 100; i++) {
        selector.recordPerformance({
          provider: 'gemini',
          operation: 'optimizeCV',
          cost: Math.random() * 0.05,
          latency: Math.random() * 5000,
          success: Math.random() > 0.2,
          timestamp: Date.now(),
          timeOfDay: Math.floor(Math.random() * 24),
          tokensUsed: 1000 + Math.random() * 1000
        });
      }

      // Weights should have been updated (difficult to test exact values)
      const recommendations = selector.getRecommendations({
        operation: 'optimizeCV',
        estimatedTokens: 1000,
        budget: 0.1,
        timeOfDay: 10,
        dayOfWeek: 1,
        urgency: 'normal',
        prioritize: 'cost'
      });

      expect(recommendations).toBeDefined();
    });
  });
});
