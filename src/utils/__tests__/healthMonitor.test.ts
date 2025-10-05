/**
 * Tests for Health Monitor Service
 */

import { healthMonitor } from '../healthMonitor';
import { AIProvider } from '../aiProviders';

describe('Health Monitor Service', () => {
  beforeEach(() => {
    // Reset health monitor before each test
    healthMonitor.resetStatistics();
  });

  describe('recordSuccess', () => {
    it('should record successful API calls', () => {
      healthMonitor.recordSuccess('openai', 1000);
      
      const health = healthMonitor.getProviderHealth('openai');
      expect(health).toBeDefined();
      expect(health?.successCount).toBe(1);
      expect(health?.failureCount).toBe(0);
      expect(health?.consecutiveFailures).toBe(0);
      expect(health?.status).toBe('healthy');
    });

    it('should calculate moving average for response time', () => {
      healthMonitor.recordSuccess('openai', 1000);
      healthMonitor.recordSuccess('openai', 2000);
      
      const health = healthMonitor.getProviderHealth('openai');
      expect(health?.responseTime).toBeGreaterThan(1000);
      expect(health?.responseTime).toBeLessThan(2000);
    });

    it('should reset consecutive failures on success', () => {
      healthMonitor.recordFailure('openai', 'Test error');
      healthMonitor.recordFailure('openai', 'Test error');
      healthMonitor.recordSuccess('openai', 1000);
      
      const health = healthMonitor.getProviderHealth('openai');
      expect(health?.consecutiveFailures).toBe(0);
    });
  });

  describe('recordFailure', () => {
    it('should record failed API calls', () => {
      healthMonitor.recordFailure('openai', 'API Error');
      
      const health = healthMonitor.getProviderHealth('openai');
      expect(health).toBeDefined();
      expect(health?.failureCount).toBe(1);
      expect(health?.consecutiveFailures).toBe(1);
    });

    it('should increment consecutive failures', () => {
      healthMonitor.recordFailure('openai', 'Error 1');
      healthMonitor.recordFailure('openai', 'Error 2');
      healthMonitor.recordFailure('openai', 'Error 3');
      
      const health = healthMonitor.getProviderHealth('openai');
      expect(health?.consecutiveFailures).toBe(3);
    });

    it('should mark provider as down after max consecutive failures', () => {
      // Record 3 consecutive failures (threshold)
      healthMonitor.recordFailure('openai', 'Error 1');
      healthMonitor.recordFailure('openai', 'Error 2');
      healthMonitor.recordFailure('openai', 'Error 3');
      
      const health = healthMonitor.getProviderHealth('openai');
      expect(health?.status).toBe('down');
    });

    it('should create critical alert after consecutive failures', () => {
      healthMonitor.recordFailure('openai', 'Error 1');
      healthMonitor.recordFailure('openai', 'Error 2');
      healthMonitor.recordFailure('openai', 'Error 3');
      
      const alerts = healthMonitor.getActiveAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.some(a => a.severity === 'critical')).toBe(true);
    });

    it('should calculate error rate correctly', () => {
      healthMonitor.recordSuccess('openai', 1000);
      healthMonitor.recordFailure('openai', 'Error');
      
      const health = healthMonitor.getProviderHealth('openai');
      expect(health?.errorRate).toBe(0.5); // 1 failure out of 2 total
    });
  });

  describe('getHealthiestProvider', () => {
    it('should return provider with best health score', () => {
      // OpenAI: all successes
      healthMonitor.recordSuccess('openai', 1000);
      healthMonitor.recordSuccess('openai', 1000);
      healthMonitor.recordSuccess('openai', 1000);
      
      // Gemini: mixed results
      healthMonitor.recordSuccess('gemini', 2000);
      healthMonitor.recordFailure('gemini', 'Error');
      
      // Claude: failures
      healthMonitor.recordFailure('claude', 'Error');
      healthMonitor.recordFailure('claude', 'Error');
      
      const healthiest = healthMonitor.getHealthiestProvider();
      expect(healthiest).toBe('openai');
    });

    it('should exclude down providers', () => {
      // OpenAI: down
      healthMonitor.recordFailure('openai', 'Error 1');
      healthMonitor.recordFailure('openai', 'Error 2');
      healthMonitor.recordFailure('openai', 'Error 3');
      
      // Gemini: healthy
      healthMonitor.recordSuccess('gemini', 1000);
      
      const healthiest = healthMonitor.getHealthiestProvider();
      expect(healthiest).toBe('gemini');
    });

    it('should return null if all providers are down', () => {
      const providers: AIProvider[] = ['openai', 'gemini', 'claude'];
      
      providers.forEach(provider => {
        healthMonitor.recordFailure(provider, 'Error 1');
        healthMonitor.recordFailure(provider, 'Error 2');
        healthMonitor.recordFailure(provider, 'Error 3');
      });
      
      const healthiest = healthMonitor.getHealthiestProvider();
      expect(healthiest).toBeNull();
    });
  });

  describe('alerts', () => {
    it('should create warning alert for high error rate', () => {
      // Create high error rate (40%)
      healthMonitor.recordSuccess('openai', 1000);
      healthMonitor.recordSuccess('openai', 1000);
      healthMonitor.recordSuccess('openai', 1000);
      healthMonitor.recordFailure('openai', 'Error 1');
      healthMonitor.recordFailure('openai', 'Error 2');
      
      const alerts = healthMonitor.getActiveAlerts();
      expect(alerts.some(a => a.severity === 'warning')).toBe(true);
    });

    it('should resolve alerts when health improves', () => {
      // Create failures
      healthMonitor.recordFailure('openai', 'Error 1');
      healthMonitor.recordFailure('openai', 'Error 2');
      healthMonitor.recordFailure('openai', 'Error 3');
      
      // Recover
      healthMonitor.recordSuccess('openai', 1000);
      healthMonitor.recordSuccess('openai', 1000);
      healthMonitor.recordSuccess('openai', 1000);
      
      const health = healthMonitor.getProviderHealth('openai');
      expect(health?.status).toBe('healthy');
      
      const activeAlerts = healthMonitor.getActiveAlerts();
      expect(activeAlerts.filter(a => a.provider === 'openai' && !a.resolved).length).toBe(0);
    });

    it('should not create duplicate alerts', () => {
      healthMonitor.recordFailure('openai', 'Error 1');
      healthMonitor.recordFailure('openai', 'Error 2');
      healthMonitor.recordFailure('openai', 'Error 3');
      healthMonitor.recordFailure('openai', 'Error 4');
      
      const alerts = healthMonitor.getActiveAlerts().filter(a => a.provider === 'openai');
      const criticalAlerts = alerts.filter(a => a.severity === 'critical');
      
      // Should have only one critical alert despite multiple failures
      expect(criticalAlerts.length).toBe(1);
    });
  });

  describe('status determination', () => {
    it('should mark as degraded with high error rate', () => {
      // Create 40% error rate
      healthMonitor.recordSuccess('openai', 1000);
      healthMonitor.recordSuccess('openai', 1000);
      healthMonitor.recordSuccess('openai', 1000);
      healthMonitor.recordFailure('openai', 'Error 1');
      healthMonitor.recordFailure('openai', 'Error 2');
      
      const health = healthMonitor.getProviderHealth('openai');
      expect(health?.status).toBe('degraded');
    });

    it('should mark as degraded with slow response time', () => {
      healthMonitor.recordSuccess('openai', 15000); // 15 seconds (above threshold)
      
      const health = healthMonitor.getProviderHealth('openai');
      expect(health?.status).toBe('degraded');
    });
  });

  describe('resetStatistics', () => {
    it('should reset specific provider statistics', () => {
      healthMonitor.recordSuccess('openai', 1000);
      healthMonitor.recordFailure('openai', 'Error');
      
      healthMonitor.resetStatistics('openai');
      
      const health = healthMonitor.getProviderHealth('openai');
      expect(health?.successCount).toBe(0);
      expect(health?.failureCount).toBe(0);
      expect(health?.status).toBe('healthy');
    });

    it('should reset all providers when no specific provider given', () => {
      const providers: AIProvider[] = ['openai', 'gemini', 'claude'];
      
      providers.forEach(provider => {
        healthMonitor.recordSuccess(provider, 1000);
        healthMonitor.recordFailure(provider, 'Error');
      });
      
      healthMonitor.resetStatistics();
      
      providers.forEach(provider => {
        const health = healthMonitor.getProviderHealth(provider);
        expect(health?.successCount).toBe(0);
        expect(health?.failureCount).toBe(0);
      });
    });
  });
});
