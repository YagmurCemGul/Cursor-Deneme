/**
 * Health Check System
 * Monitors system health and service availability
 */

import { AICache } from './aiCache';
import { RateLimiter } from './rateLimiter';
import { circuitBreakerManager } from './circuitBreaker';
import { getProviderConfig } from './aiProviders.improved';

export interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  checks: {
    api: HealthCheckResult;
    cache: HealthCheckResult;
    rateLimiter: HealthCheckResult;
    circuitBreakers: HealthCheckResult;
    storage: HealthCheckResult;
  };
}

export interface HealthCheckResult {
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details?: Record<string, any>;
  responseTime?: number;
}

/**
 * Perform comprehensive health check
 */
export async function performHealthCheck(): Promise<HealthStatus> {
  const startTime = Date.now();
  
  console.log('[Health Check] Starting system health check...');

  const checks = {
    api: await checkAPIConnection(),
    cache: await checkCache(),
    rateLimiter: await checkRateLimiter(),
    circuitBreakers: await checkCircuitBreakers(),
    storage: await checkStorage()
  };

  // Determine overall health
  const failCount = Object.values(checks).filter(c => c.status === 'fail').length;
  const warnCount = Object.values(checks).filter(c => c.status === 'warn').length;

  let overall: 'healthy' | 'degraded' | 'unhealthy';
  if (failCount > 0) {
    overall = 'unhealthy';
  } else if (warnCount > 0) {
    overall = 'degraded';
  } else {
    overall = 'healthy';
  }

  const healthStatus: HealthStatus = {
    overall,
    timestamp: new Date(),
    checks
  };

  const duration = Date.now() - startTime;
  console.log(`[Health Check] Completed in ${duration}ms - Status: ${overall.toUpperCase()}`);

  return healthStatus;
}

/**
 * Check API connection
 */
async function checkAPIConnection(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    // Try to get provider config
    const config = await getProviderConfig();
    
    if (!config.apiKey) {
      return {
        status: 'fail',
        message: 'No API key configured',
        responseTime: Date.now() - startTime
      };
    }

    // Test a simple API call with timeout
    const testPromise = fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`
      },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    const response = await testPromise;
    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        status: 'pass',
        message: 'API connection successful',
        details: {
          provider: config.provider,
          model: config.model
        },
        responseTime
      };
    } else if (response.status === 401) {
      return {
        status: 'fail',
        message: 'Invalid API key',
        details: {
          statusCode: response.status
        },
        responseTime
      };
    } else {
      return {
        status: 'warn',
        message: `API returned ${response.status}`,
        details: {
          statusCode: response.status
        },
        responseTime
      };
    }
  } catch (error: any) {
    return {
      status: 'fail',
      message: `API connection failed: ${error.message}`,
      responseTime: Date.now() - startTime
    };
  }
}

/**
 * Check cache system
 */
async function checkCache(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    const cache = AICache.getInstance();
    const stats = cache.getStats();

    const status: HealthCheckResult = {
      status: 'pass',
      message: 'Cache system operational',
      details: {
        entries: stats.totalEntries,
        hitRate: `${stats.hitRate}%`,
        hits: stats.totalHits,
        misses: stats.totalMisses
      },
      responseTime: Date.now() - startTime
    };

    // Warning if hit rate is too low
    if (stats.hitRate < 20 && stats.totalHits + stats.totalMisses > 10) {
      status.status = 'warn';
      status.message = 'Cache hit rate is low';
    }

    return status;
  } catch (error: any) {
    return {
      status: 'fail',
      message: `Cache check failed: ${error.message}`,
      responseTime: Date.now() - startTime
    };
  }
}

/**
 * Check rate limiter
 */
async function checkRateLimiter(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    const limiter = RateLimiter.getInstance();
    const stats = limiter.getUsageStats();

    const status: HealthCheckResult = {
      status: 'pass',
      message: 'Rate limiter operational',
      details: {
        minute: `${stats.minute.used}/${stats.minute.limit} (${stats.minute.percentage}%)`,
        hour: `${stats.hour.used}/${stats.hour.limit} (${stats.hour.percentage}%)`,
        day: `${stats.day.used}/${stats.day.limit} (${stats.day.percentage}%)`,
        cost: `$${stats.cost.used.toFixed(2)}/$${stats.cost.limit.toFixed(2)} (${stats.cost.percentage}%)`
      },
      responseTime: Date.now() - startTime
    };

    // Warning if approaching limits
    if (stats.minute.percentage > 80 || stats.hour.percentage > 80 || stats.day.percentage > 80) {
      status.status = 'warn';
      status.message = 'Approaching rate limits';
    }

    // Fail if limit exceeded
    if (stats.minute.percentage >= 100 || stats.hour.percentage >= 100 || stats.day.percentage >= 100) {
      status.status = 'fail';
      status.message = 'Rate limit exceeded';
    }

    return status;
  } catch (error: any) {
    return {
      status: 'fail',
      message: `Rate limiter check failed: ${error.message}`,
      responseTime: Date.now() - startTime
    };
  }
}

/**
 * Check circuit breakers
 */
async function checkCircuitBreakers(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    const health = circuitBreakerManager.getHealthStatus();
    const allStats = circuitBreakerManager.getAllStats();

    const status: HealthCheckResult = {
      status: health.healthy ? 'pass' : 'fail',
      message: health.healthy ? 'All circuits healthy' : 'Some circuits are open',
      details: health.services,
      responseTime: Date.now() - startTime
    };

    // Check for degraded state
    const hasWarnings = Object.values(health.services).some(
      s => s.failureRate > 10 && s.failureRate < 50
    );

    if (hasWarnings && health.healthy) {
      status.status = 'warn';
      status.message = 'High failure rate detected';
    }

    return status;
  } catch (error: any) {
    return {
      status: 'fail',
      message: `Circuit breaker check failed: ${error.message}`,
      responseTime: Date.now() - startTime
    };
  }
}

/**
 * Check Chrome storage
 */
async function checkStorage(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    // Test read/write
    const testKey = 'health_check_test';
    const testValue = { test: true, timestamp: Date.now() };

    await chrome.storage.local.set({ [testKey]: testValue });
    const result = await chrome.storage.local.get(testKey);

    // Clean up
    await chrome.storage.local.remove(testKey);

    if (result[testKey]?.test === true) {
      // Check storage usage
      const bytesInUse = await chrome.storage.local.getBytesInUse(null);
      const quota = chrome.storage.local.QUOTA_BYTES;
      const usagePercentage = (bytesInUse / quota) * 100;

      const status: HealthCheckResult = {
        status: 'pass',
        message: 'Storage operational',
        details: {
          bytesInUse,
          quota,
          usagePercentage: `${usagePercentage.toFixed(2)}%`
        },
        responseTime: Date.now() - startTime
      };

      // Warning if storage is getting full
      if (usagePercentage > 80) {
        status.status = 'warn';
        status.message = 'Storage usage is high';
      }

      return status;
    } else {
      return {
        status: 'fail',
        message: 'Storage read/write test failed',
        responseTime: Date.now() - startTime
      };
    }
  } catch (error: any) {
    return {
      status: 'fail',
      message: `Storage check failed: ${error.message}`,
      responseTime: Date.now() - startTime
    };
  }
}

/**
 * Perform quick health check (subset of checks)
 */
export async function performQuickHealthCheck(): Promise<{
  healthy: boolean;
  message: string;
}> {
  try {
    const config = await getProviderConfig();
    const cache = AICache.getInstance();
    const limiter = RateLimiter.getInstance();

    const hasApiKey = !!config.apiKey;
    const cacheWorking = cache.getStats().totalEntries >= 0;
    const limitStatus = await limiter.checkLimit();

    if (!hasApiKey) {
      return {
        healthy: false,
        message: 'No API key configured'
      };
    }

    if (!limitStatus.allowed) {
      return {
        healthy: false,
        message: limitStatus.reason || 'Rate limit exceeded'
      };
    }

    return {
      healthy: true,
      message: 'System operational'
    };
  } catch (error: any) {
    return {
      healthy: false,
      message: `Health check failed: ${error.message}`
    };
  }
}

/**
 * Format health status for display
 */
export function formatHealthStatus(status: HealthStatus): string {
  const symbol = {
    healthy: '✅',
    degraded: '⚠️',
    unhealthy: '❌'
  }[status.overall];

  let output = `${symbol} System Health: ${status.overall.toUpperCase()}\n`;
  output += `Checked at: ${status.timestamp.toISOString()}\n\n`;

  for (const [name, check] of Object.entries(status.checks)) {
    const checkSymbol = {
      pass: '✅',
      warn: '⚠️',
      fail: '❌'
    }[check.status];

    output += `${checkSymbol} ${name}: ${check.message}`;
    
    if (check.responseTime) {
      output += ` (${check.responseTime}ms)`;
    }
    
    output += '\n';

    if (check.details) {
      for (const [key, value] of Object.entries(check.details)) {
        output += `   ${key}: ${JSON.stringify(value)}\n`;
      }
    }
  }

  return output;
}

/**
 * Schedule periodic health checks
 */
export function startHealthMonitoring(intervalMinutes: number = 5): number {
  console.log(`[Health Monitor] Starting periodic checks every ${intervalMinutes} minutes`);

  const intervalId = window.setInterval(async () => {
    const status = await performHealthCheck();
    
    if (status.overall !== 'healthy') {
      console.warn('[Health Monitor] System unhealthy:', formatHealthStatus(status));
      
      // Could send notification to user here
      if (status.overall === 'unhealthy') {
        console.error('[Health Monitor] CRITICAL: System is unhealthy!');
      }
    }
  }, intervalMinutes * 60 * 1000);

  return intervalId;
}

/**
 * Stop health monitoring
 */
export function stopHealthMonitoring(intervalId: number): void {
  clearInterval(intervalId);
  console.log('[Health Monitor] Periodic checks stopped');
}
