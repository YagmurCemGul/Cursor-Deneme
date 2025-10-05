/**
 * Provider Health Monitoring System
 * Tracks provider availability, response times, and error rates
 */

import { AIProvider } from './aiProviders';
import { logger } from './logger';

export interface ProviderHealth {
  provider: AIProvider;
  status: 'healthy' | 'degraded' | 'down';
  lastCheck: string;
  responseTime: number;
  errorRate: number;
  successCount: number;
  failureCount: number;
  consecutiveFailures: number;
}

export interface HealthAlert {
  id: string;
  provider: AIProvider;
  severity: 'warning' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

class HealthMonitorService {
  private healthStatus: Map<AIProvider, ProviderHealth> = new Map();
  private alerts: HealthAlert[] = [];
  private readonly MAX_CONSECUTIVE_FAILURES = 3;
  private readonly ERROR_RATE_THRESHOLD = 0.3; // 30%
  private readonly RESPONSE_TIME_THRESHOLD = 10000; // 10 seconds

  /**
   * Initialize health monitoring
   */
  initialize(): void {
    const providers: AIProvider[] = ['openai', 'gemini', 'claude'];
    providers.forEach((provider) => {
      this.healthStatus.set(provider, {
        provider,
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        responseTime: 0,
        errorRate: 0,
        successCount: 0,
        failureCount: 0,
        consecutiveFailures: 0,
      });
    });
    logger.info('Health monitor initialized');
  }

  /**
   * Record a successful API call
   */
  recordSuccess(provider: AIProvider, responseTime: number): void {
    const health = this.healthStatus.get(provider);
    if (!health) return;

    health.successCount++;
    health.consecutiveFailures = 0;
    health.responseTime = this.calculateMovingAverage(health.responseTime, responseTime);
    health.errorRate = this.calculateErrorRate(health);
    health.lastCheck = new Date().toISOString();
    health.status = this.determineStatus(health);

    // Resolve alerts if health improves
    if (health.status === 'healthy') {
      this.resolveAlerts(provider);
    }

    this.healthStatus.set(provider, health);
  }

  /**
   * Record a failed API call
   */
  recordFailure(provider: AIProvider, error: string): void {
    const health = this.healthStatus.get(provider);
    if (!health) return;

    health.failureCount++;
    health.consecutiveFailures++;
    health.errorRate = this.calculateErrorRate(health);
    health.lastCheck = new Date().toISOString();
    health.status = this.determineStatus(health);

    // Create alerts for critical issues
    if (health.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES) {
      this.createAlert(provider, 'critical', `${provider} has failed ${health.consecutiveFailures} times consecutively`);
    } else if (health.errorRate >= this.ERROR_RATE_THRESHOLD) {
      this.createAlert(provider, 'warning', `${provider} error rate is ${(health.errorRate * 100).toFixed(1)}%`);
    }

    this.healthStatus.set(provider, health);
    logger.warn(`Provider ${provider} failure recorded:`, error);
  }

  /**
   * Get health status for a provider
   */
  getProviderHealth(provider: AIProvider): ProviderHealth | null {
    return this.healthStatus.get(provider) || null;
  }

  /**
   * Get health status for all providers
   */
  getAllProvidersHealth(): ProviderHealth[] {
    return Array.from(this.healthStatus.values());
  }

  /**
   * Get the healthiest provider
   */
  getHealthiestProvider(): AIProvider | null {
    const providers = Array.from(this.healthStatus.values());
    
    // Filter out down providers
    const availableProviders = providers.filter((p) => p.status !== 'down');
    if (availableProviders.length === 0) return null;

    // Sort by health score
    const sorted = availableProviders.sort((a, b) => {
      const scoreA = this.calculateHealthScore(a);
      const scoreB = this.calculateHealthScore(b);
      return scoreB - scoreA;
    });

    return sorted[0]?.provider || 'openai';
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): HealthAlert[] {
    return this.alerts.filter((alert) => !alert.resolved);
  }

  /**
   * Get all alerts
   */
  getAllAlerts(): HealthAlert[] {
    return [...this.alerts];
  }

  /**
   * Clear resolved alerts
   */
  clearResolvedAlerts(): void {
    this.alerts = this.alerts.filter((alert) => !alert.resolved);
  }

  /**
   * Reset health statistics
   */
  resetStatistics(provider?: AIProvider): void {
    if (provider) {
      const health = this.healthStatus.get(provider);
      if (health) {
        health.successCount = 0;
        health.failureCount = 0;
        health.consecutiveFailures = 0;
        health.errorRate = 0;
        health.status = 'healthy';
        this.healthStatus.set(provider, health);
        this.resolveAlerts(provider);
      }
    } else {
      this.initialize();
      this.alerts = [];
    }
  }

  /**
   * Calculate health score (0-100)
   */
  private calculateHealthScore(health: ProviderHealth): number {
    let score = 100;

    // Deduct for error rate
    score -= health.errorRate * 50;

    // Deduct for consecutive failures
    score -= health.consecutiveFailures * 10;

    // Deduct for slow response time
    if (health.responseTime > this.RESPONSE_TIME_THRESHOLD) {
      score -= 20;
    } else if (health.responseTime > this.RESPONSE_TIME_THRESHOLD / 2) {
      score -= 10;
    }

    return Math.max(0, score);
  }

  /**
   * Calculate moving average for response time
   */
  private calculateMovingAverage(current: number, newValue: number, weight: number = 0.3): number {
    if (current === 0) return newValue;
    return current * (1 - weight) + newValue * weight;
  }

  /**
   * Calculate error rate
   */
  private calculateErrorRate(health: ProviderHealth): number {
    const total = health.successCount + health.failureCount;
    if (total === 0) return 0;
    return health.failureCount / total;
  }

  /**
   * Determine provider status based on health metrics
   */
  private determineStatus(health: ProviderHealth): 'healthy' | 'degraded' | 'down' {
    if (health.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES) {
      return 'down';
    }
    if (health.errorRate >= this.ERROR_RATE_THRESHOLD || health.responseTime > this.RESPONSE_TIME_THRESHOLD) {
      return 'degraded';
    }
    return 'healthy';
  }

  /**
   * Create a new alert
   */
  private createAlert(provider: AIProvider, severity: 'warning' | 'critical', message: string): void {
    // Check if similar alert already exists
    const existingAlert = this.alerts.find(
      (alert) => alert.provider === provider && alert.message === message && !alert.resolved
    );

    if (existingAlert) return;

    const alert: HealthAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      provider,
      severity,
      message,
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    this.alerts.push(alert);
    logger.warn(`Health alert created: ${severity} - ${message}`);
  }

  /**
   * Resolve alerts for a provider
   */
  private resolveAlerts(provider: AIProvider): void {
    this.alerts.forEach((alert) => {
      if (alert.provider === provider && !alert.resolved) {
        alert.resolved = true;
        logger.info(`Health alert resolved: ${alert.message}`);
      }
    });
  }
}

// Export singleton instance
export const healthMonitor = new HealthMonitorService();
healthMonitor.initialize();
