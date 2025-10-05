/**
 * Budget Manager Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BudgetManager, getBudgetManager } from '../budgetManager';

describe('BudgetManager', () => {
  let budgetManager: BudgetManager;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    budgetManager = new BudgetManager({
      period: 'daily',
      limit: 10.0,
      alertThresholds: [0.5, 0.8, 0.95]
    });
  });

  describe('Cost Tracking', () => {
    it('should track costs', () => {
      budgetManager.trackCost({
        provider: 'openai',
        operation: 'optimize',
        inputTokens: 1000,
        outputTokens: 500,
        cost: 0.05,
        model: 'gpt-4'
      });

      expect(budgetManager.getCurrentSpending()).toBe(0.05);
    });

    it('should accumulate costs', () => {
      budgetManager.trackCost({
        provider: 'openai',
        operation: 'optimize',
        inputTokens: 1000,
        outputTokens: 500,
        cost: 0.05,
        model: 'gpt-4'
      });

      budgetManager.trackCost({
        provider: 'openai',
        operation: 'coverLetter',
        inputTokens: 500,
        outputTokens: 300,
        cost: 0.03,
        model: 'gpt-4'
      });

      expect(budgetManager.getCurrentSpending()).toBeCloseTo(0.08);
    });
  });

  describe('Budget Limits', () => {
    it('should allow spending under limit', () => {
      budgetManager.trackCost({
        provider: 'openai',
        operation: 'optimize',
        inputTokens: 1000,
        outputTokens: 500,
        cost: 5.0,
        model: 'gpt-4'
      });

      expect(budgetManager.canSpend()).toBe(true);
      expect(budgetManager.canSpend(4.0)).toBe(true);
    });

    it('should block spending over limit', () => {
      budgetManager.trackCost({
        provider: 'openai',
        operation: 'optimize',
        inputTokens: 1000,
        outputTokens: 500,
        cost: 9.0,
        model: 'gpt-4'
      });

      expect(budgetManager.canSpend(2.0)).toBe(false);
    });

    it('should respect auto-stop threshold', () => {
      const manager = new BudgetManager({
        period: 'daily',
        limit: 10.0,
        autoStopAt: 0.9
      });

      manager.trackCost({
        provider: 'openai',
        operation: 'optimize',
        inputTokens: 1000,
        outputTokens: 500,
        cost: 9.0,
        model: 'gpt-4'
      });

      expect(manager.canSpend()).toBe(false);
    });
  });

  describe('Budget Alerts', () => {
    it('should generate alert at 50% threshold', () => {
      budgetManager.trackCost({
        provider: 'openai',
        operation: 'optimize',
        inputTokens: 1000,
        outputTokens: 500,
        cost: 5.0,
        model: 'gpt-4'
      });

      const alert = budgetManager.checkBudgetAlert();
      
      expect(alert).not.toBeNull();
      expect(alert?.level).toBe('info');
      expect(alert?.percentage).toBeCloseTo(50);
    });

    it('should generate warning at 80% threshold', () => {
      budgetManager.trackCost({
        provider: 'openai',
        operation: 'optimize',
        inputTokens: 1000,
        outputTokens: 500,
        cost: 8.0,
        model: 'gpt-4'
      });

      const alert = budgetManager.checkBudgetAlert();
      
      expect(alert).not.toBeNull();
      expect(alert?.level).toBe('warning');
    });

    it('should generate critical alert at 95% threshold', () => {
      budgetManager.trackCost({
        provider: 'openai',
        operation: 'optimize',
        inputTokens: 1000,
        outputTokens: 500,
        cost: 9.5,
        model: 'gpt-4'
      });

      const alert = budgetManager.checkBudgetAlert();
      
      expect(alert).not.toBeNull();
      expect(alert?.level).toBe('critical');
    });

    it('should generate exceeded alert when over limit', () => {
      budgetManager.trackCost({
        provider: 'openai',
        operation: 'optimize',
        inputTokens: 1000,
        outputTokens: 500,
        cost: 10.5,
        model: 'gpt-4'
      });

      const alert = budgetManager.checkBudgetAlert();
      
      expect(alert).not.toBeNull();
      expect(alert?.level).toBe('exceeded');
    });
  });

  describe('Cost Reports', () => {
    it('should generate cost report', () => {
      budgetManager.trackCost({
        provider: 'openai',
        operation: 'optimize',
        inputTokens: 1000,
        outputTokens: 500,
        cost: 2.0,
        model: 'gpt-4'
      });

      budgetManager.trackCost({
        provider: 'gemini',
        operation: 'coverLetter',
        inputTokens: 500,
        outputTokens: 300,
        cost: 0.5,
        model: 'gemini-pro'
      });

      const report = budgetManager.getCostReport();

      expect(report.totalCost).toBeCloseTo(2.5);
      expect(report.remaining).toBeCloseTo(7.5);
      expect(report.percentage).toBeCloseTo(25);
      expect(report.totalRequests).toBe(2);
      expect(report.byProvider.openai).toBeCloseTo(2.0);
      expect(report.byProvider.gemini).toBeCloseTo(0.5);
    });

    it('should calculate projected cost', () => {
      // Simulate some spending over time
      budgetManager.trackCost({
        provider: 'openai',
        operation: 'optimize',
        inputTokens: 1000,
        outputTokens: 500,
        cost: 2.0,
        model: 'gpt-4'
      });

      const report = budgetManager.getCostReport();

      // With limited data, projection might not be available
      // This is expected behavior
      expect(report).toHaveProperty('projectedCost');
    });
  });

  describe('Cost Breakdown', () => {
    it('should break down cost by provider', () => {
      budgetManager.trackCost({
        provider: 'openai',
        operation: 'optimize',
        inputTokens: 1000,
        outputTokens: 500,
        cost: 2.0,
        model: 'gpt-4'
      });

      budgetManager.trackCost({
        provider: 'gemini',
        operation: 'coverLetter',
        inputTokens: 500,
        outputTokens: 300,
        cost: 0.5,
        model: 'gemini-pro'
      });

      const breakdown = budgetManager.getCostByProvider();

      expect(breakdown.openai.cost).toBeCloseTo(2.0);
      expect(breakdown.openai.requests).toBe(1);
      expect(breakdown.openai.percentage).toBeCloseTo(80);
      
      expect(breakdown.gemini.cost).toBeCloseTo(0.5);
      expect(breakdown.gemini.requests).toBe(1);
      expect(breakdown.gemini.percentage).toBeCloseTo(20);
    });
  });

  describe('Period Management', () => {
    it('should clean old records outside period', () => {
      const manager = new BudgetManager({
        period: 'hourly',
        limit: 10.0
      });

      // Add old record (2 hours ago)
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
      (manager as any).costHistory.push({
        timestamp: twoHoursAgo,
        provider: 'openai',
        operation: 'optimize',
        inputTokens: 1000,
        outputTokens: 500,
        cost: 5.0,
        model: 'gpt-4'
      });

      // Clean should remove old records
      (manager as any).cleanOldRecords();

      expect(manager.getCurrentSpending()).toBe(0);
    });
  });

  describe('Global Instance', () => {
    it('should return same global instance', () => {
      const manager1 = getBudgetManager();
      const manager2 = getBudgetManager();
      
      expect(manager1).toBe(manager2);
    });

    it('should update global instance config', () => {
      const manager = getBudgetManager({ limit: 20.0 });
      const config = manager.getConfig();
      
      expect(config.limit).toBe(20.0);
    });
  });

  describe('Reset', () => {
    it('should reset budget and history', () => {
      budgetManager.trackCost({
        provider: 'openai',
        operation: 'optimize',
        inputTokens: 1000,
        outputTokens: 500,
        cost: 5.0,
        model: 'gpt-4'
      });

      budgetManager.reset();

      expect(budgetManager.getCurrentSpending()).toBe(0);
      expect(budgetManager.getCostReport().totalRequests).toBe(0);
    });
  });
});
