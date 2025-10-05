/**
 * Circuit Breaker Pattern
 * Prevents cascading failures by breaking the circuit when error threshold is reached
 */

export enum CircuitState {
  CLOSED = 'CLOSED',      // Normal operation
  OPEN = 'OPEN',          // Failing, reject requests
  HALF_OPEN = 'HALF_OPEN' // Testing if service recovered
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  monitoringPeriod: number;
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: number | null;
  nextAttemptTime: number | null;
  totalRequests: number;
  totalFailures: number;
  totalSuccesses: number;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000,
  monitoringPeriod: 60000
};

/**
 * Circuit Breaker Class
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime: number | null = null;
  private nextAttemptTime: number | null = null;
  private config: CircuitBreakerConfig;
  
  // Stats
  private totalRequests: number = 0;
  private totalFailures: number = 0;
  private totalSuccesses: number = 0;
  private failureHistory: number[] = [];

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      // Check if timeout has passed
      if (this.shouldAttemptReset()) {
        console.log('[Circuit Breaker] Attempting to reset - entering HALF_OPEN state');
        this.state = CircuitState.HALF_OPEN;
        this.successes = 0;
      } else {
        const waitTime = this.nextAttemptTime ? Math.ceil((this.nextAttemptTime - Date.now()) / 1000) : 0;
        throw new Error(
          `Circuit breaker is OPEN. Service unavailable. Try again in ${waitTime}s.`
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful request
   */
  private onSuccess(): void {
    this.totalSuccesses++;
    this.failures = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      
      if (this.successes >= this.config.successThreshold) {
        console.log('[Circuit Breaker] Service recovered - circuit CLOSED');
        this.reset();
      }
    }
  }

  /**
   * Handle failed request
   */
  private onFailure(): void {
    this.totalFailures++;
    this.failures++;
    this.lastFailureTime = Date.now();
    this.failureHistory.push(Date.now());

    // Clean old failures outside monitoring period
    const cutoff = Date.now() - this.config.monitoringPeriod;
    this.failureHistory = this.failureHistory.filter(t => t > cutoff);

    if (this.state === CircuitState.HALF_OPEN) {
      // Failed during testing, re-open circuit
      console.log('[Circuit Breaker] Test failed - circuit re-OPEN');
      this.trip();
    } else if (this.failures >= this.config.failureThreshold) {
      // Too many failures, open circuit
      console.log(`[Circuit Breaker] Failure threshold reached (${this.failures}/${this.config.failureThreshold}) - circuit OPEN`);
      this.trip();
    }
  }

  /**
   * Trip the circuit (open it)
   */
  private trip(): void {
    this.state = CircuitState.OPEN;
    this.nextAttemptTime = Date.now() + this.config.timeout;
  }

  /**
   * Reset the circuit
   */
  private reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
  }

  /**
   * Check if we should attempt to reset
   */
  private shouldAttemptReset(): boolean {
    if (!this.nextAttemptTime) {
      return false;
    }
    return Date.now() >= this.nextAttemptTime;
  }

  /**
   * Get current statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses
    };
  }

  /**
   * Get failure rate in the monitoring period
   */
  getFailureRate(): number {
    if (this.failureHistory.length === 0) {
      return 0;
    }

    const cutoff = Date.now() - this.config.monitoringPeriod;
    const recentFailures = this.failureHistory.filter(t => t > cutoff).length;
    const total = this.totalRequests;

    return total > 0 ? (recentFailures / total) * 100 : 0;
  }

  /**
   * Force open the circuit (for testing/maintenance)
   */
  forceOpen(): void {
    console.log('[Circuit Breaker] Manually opened');
    this.trip();
  }

  /**
   * Force close the circuit (for testing/recovery)
   */
  forceClose(): void {
    console.log('[Circuit Breaker] Manually closed');
    this.reset();
  }

  /**
   * Check if circuit is available
   */
  isAvailable(): boolean {
    if (this.state === CircuitState.CLOSED) {
      return true;
    }
    
    if (this.state === CircuitState.HALF_OPEN) {
      return true;
    }
    
    if (this.state === CircuitState.OPEN && this.shouldAttemptReset()) {
      return true;
    }
    
    return false;
  }
}

/**
 * Circuit Breaker Manager
 * Manages multiple circuit breakers for different services
 */
export class CircuitBreakerManager {
  private breakers: Map<string, CircuitBreaker> = new Map();
  private config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get or create a circuit breaker for a service
   */
  getBreaker(serviceName: string): CircuitBreaker {
    if (!this.breakers.has(serviceName)) {
      this.breakers.set(serviceName, new CircuitBreaker(this.config));
    }
    return this.breakers.get(serviceName)!;
  }

  /**
   * Execute with circuit breaker for a specific service
   */
  async execute<T>(serviceName: string, fn: () => Promise<T>): Promise<T> {
    const breaker = this.getBreaker(serviceName);
    return breaker.execute(fn);
  }

  /**
   * Get stats for all services
   */
  getAllStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {};
    
    for (const [name, breaker] of this.breakers.entries()) {
      stats[name] = breaker.getStats();
    }
    
    return stats;
  }

  /**
   * Check health of all services
   */
  getHealthStatus(): {
    healthy: boolean;
    services: Record<string, { state: string; available: boolean; failureRate: number }>;
  } {
    const services: Record<string, any> = {};
    let allHealthy = true;

    for (const [name, breaker] of this.breakers.entries()) {
      const stats = breaker.getStats();
      const available = breaker.isAvailable();
      const failureRate = breaker.getFailureRate();
      
      services[name] = {
        state: stats.state,
        available,
        failureRate: Math.round(failureRate * 10) / 10
      };

      if (!available || stats.state === CircuitState.OPEN) {
        allHealthy = false;
      }
    }

    return {
      healthy: allHealthy,
      services
    };
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.forceClose();
    }
    console.log('[Circuit Breaker Manager] All circuits reset');
  }
}

// Global circuit breaker manager instance
export const circuitBreakerManager = new CircuitBreakerManager({
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000,
  monitoringPeriod: 60000
});
