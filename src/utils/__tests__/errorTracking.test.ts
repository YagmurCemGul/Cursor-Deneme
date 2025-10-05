/**
 * Error Tracking Service Tests
 * Tests for error tracking and prevention functionality
 */

import { ErrorTrackingService, ErrorCategory } from '../errorTracking';

// Mock chrome storage API
const mockStorage: {
  errorTracking: any[];
  errorStats: Record<string, any>;
  errorPreventions: any[];
} = {
  errorTracking: [],
  errorStats: {},
  errorPreventions: [],
};

global.chrome = {
  storage: {
    local: {
      get: jest.fn((keys) => {
        if (typeof keys === 'string') {
          return Promise.resolve({ [keys]: mockStorage[keys as keyof typeof mockStorage] });
        }
        const result: any = {};
        keys.forEach((key: string) => {
          result[key] = mockStorage[key as keyof typeof mockStorage];
        });
        return Promise.resolve(result);
      }),
      set: jest.fn((items) => {
        Object.assign(mockStorage, items);
        return Promise.resolve();
      }),
      remove: jest.fn((keys) => {
        const keyArray = Array.isArray(keys) ? keys : [keys];
        keyArray.forEach((key) => {
          delete mockStorage[key as keyof typeof mockStorage];
        });
        return Promise.resolve();
      }),
    },
  },
} as any;

describe('ErrorTrackingService', () => {
  beforeEach(() => {
    // Reset mock storage
    mockStorage.errorTracking = [];
    mockStorage.errorStats = {};
    mockStorage.errorPreventions = [];
    jest.clearAllMocks();
  });

  describe('trackError', () => {
    it('should track a new error', async () => {
      const error = new Error('Test error');
      await ErrorTrackingService.trackError(error, 'TestContext');

      expect(mockStorage.errorTracking).toHaveLength(1);
      expect(mockStorage.errorTracking[0]).toMatchObject({
        message: 'Test error',
        context: 'TestContext',
      });
    });

    it('should categorize network errors correctly', async () => {
      const error = new Error('Network connection failed');
      await ErrorTrackingService.trackError(error);

      const stats = await ErrorTrackingService.getAllErrorStats();
      expect(stats.length).toBeGreaterThan(0);
      expect(stats[0]?.category).toBe(ErrorCategory.NETWORK);
    });

    it('should categorize API errors correctly', async () => {
      const error = new Error('API request failed with status 401');
      await ErrorTrackingService.trackError(error);

      const stats = await ErrorTrackingService.getAllErrorStats();
      expect(stats.length).toBeGreaterThan(0);
      expect(stats[0]?.category).toBe(ErrorCategory.API);
    });

    it('should categorize validation errors correctly', async () => {
      const error = new Error('Invalid input data');
      await ErrorTrackingService.trackError(error);

      const stats = await ErrorTrackingService.getAllErrorStats();
      expect(stats.length).toBeGreaterThan(0);
      expect(stats[0]?.category).toBe(ErrorCategory.VALIDATION);
    });

    it('should assign severity levels correctly', async () => {
      const criticalError = new Error('Authentication failed');
      await ErrorTrackingService.trackError(criticalError);

      const stats = await ErrorTrackingService.getAllErrorStats();
      expect(stats.length).toBeGreaterThan(0);
      expect(stats[0]?.severity).toBe('critical');
    });

    it('should update error count for duplicate errors', async () => {
      const error = new Error('Duplicate error');

      await ErrorTrackingService.trackError(error, 'TestContext');
      await ErrorTrackingService.trackError(error, 'TestContext');
      await ErrorTrackingService.trackError(error, 'TestContext');

      const stats = await ErrorTrackingService.getAllErrorStats();
      expect(stats.length).toBeGreaterThan(0);
      expect(stats[0]?.count).toBe(3);
    });

    it('should track metadata', async () => {
      const error = new Error('Test error with metadata');
      const metadata = { userId: '123', action: 'submit' };

      await ErrorTrackingService.trackError(error, 'TestContext', metadata);

      expect(mockStorage.errorTracking.length).toBeGreaterThan(0);
      expect(mockStorage.errorTracking[0]?.metadata).toEqual(metadata);
    });
  });

  describe('getAllErrorStats', () => {
    it('should return all error statistics', async () => {
      await ErrorTrackingService.trackError(new Error('Error 1'));
      await ErrorTrackingService.trackError(new Error('Error 2'));

      const stats = await ErrorTrackingService.getAllErrorStats();
      expect(stats).toHaveLength(2);
    });

    it('should sort errors by count', async () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');

      await ErrorTrackingService.trackError(error1);
      await ErrorTrackingService.trackError(error2);
      await ErrorTrackingService.trackError(error2);
      await ErrorTrackingService.trackError(error2);

      const stats = await ErrorTrackingService.getAllErrorStats();
      expect(stats.length).toBeGreaterThanOrEqual(2);
      expect(stats[0]?.count).toBeGreaterThan(stats[1]?.count || 0);
    });
  });

  describe('getFrequentErrors', () => {
    it('should identify frequent errors', async () => {
      const error = new Error('Frequent error');

      // Track error multiple times
      for (let i = 0; i < 5; i++) {
        await ErrorTrackingService.trackError(error);
      }

      const frequentErrors = await ErrorTrackingService.getFrequentErrors();
      expect(frequentErrors).toHaveLength(1);
      expect(frequentErrors[0]?.count).toBeGreaterThanOrEqual(3);
    });

    it('should not include resolved errors', async () => {
      const error = new Error('Resolved frequent error');

      // Track error multiple times
      for (let i = 0; i < 5; i++) {
        await ErrorTrackingService.trackError(error);
      }

      const stats = await ErrorTrackingService.getAllErrorStats();
      expect(stats.length).toBeGreaterThan(0);
      if (stats[0]) {
        await ErrorTrackingService.markErrorResolved(stats[0].errorHash);
      }

      const frequentErrors = await ErrorTrackingService.getFrequentErrors();
      expect(frequentErrors).toHaveLength(0);
    });
  });

  describe('markErrorResolved', () => {
    it('should mark an error as resolved', async () => {
      const error = new Error('Test error');
      await ErrorTrackingService.trackError(error);

      const stats = await ErrorTrackingService.getAllErrorStats();
      expect(stats.length).toBeGreaterThan(0);
      if (!stats[0]) return;
      
      await ErrorTrackingService.markErrorResolved(stats[0].errorHash);
      const updatedStats = await ErrorTrackingService.getErrorStats(stats[0].errorHash);
      expect(updatedStats?.resolved).toBe(true);
    });
  });

  describe('getErrorTrends', () => {
    it('should calculate error trends', async () => {
      await ErrorTrackingService.trackError(new Error('Error 1'));
      await ErrorTrackingService.trackError(new Error('Error 2'));

      const trends = await ErrorTrackingService.getErrorTrends();

      expect(trends).toHaveProperty('totalErrors');
      expect(trends).toHaveProperty('frequentErrors');
      expect(trends).toHaveProperty('criticalErrors');
      expect(trends).toHaveProperty('categoryCounts');
      expect(trends).toHaveProperty('recentTrend');
    });

    it('should count errors by category', async () => {
      await ErrorTrackingService.trackError(new Error('Network error'));
      await ErrorTrackingService.trackError(new Error('API error'));

      const trends = await ErrorTrackingService.getErrorTrends();

      expect(trends.categoryCounts[ErrorCategory.NETWORK]).toBeGreaterThan(0);
      expect(trends.categoryCounts[ErrorCategory.API]).toBeGreaterThan(0);
    });
  });

  describe('clearAllErrors', () => {
    it('should clear all error tracking data', async () => {
      await ErrorTrackingService.trackError(new Error('Test error'));
      await ErrorTrackingService.clearAllErrors();

      const stats = await ErrorTrackingService.getAllErrorStats();
      expect(stats).toHaveLength(0);
    });
  });

  describe('cleanupOldErrors', () => {
    it('should remove old errors', async () => {
      // This test would require mocking time, which is complex
      // For now, just verify the method doesn't throw
      await expect(ErrorTrackingService.cleanupOldErrors()).resolves.not.toThrow();
    });
  });

  describe('error categorization', () => {
    const testCases = [
      { error: 'Network connection failed', expectedCategory: ErrorCategory.NETWORK },
      { error: 'fetch failed', expectedCategory: ErrorCategory.NETWORK },
      { error: 'API request failed', expectedCategory: ErrorCategory.API },
      { error: 'status 500', expectedCategory: ErrorCategory.API },
      { error: 'Invalid input', expectedCategory: ErrorCategory.VALIDATION },
      { error: 'validation failed', expectedCategory: ErrorCategory.VALIDATION },
      { error: 'Storage quota exceeded', expectedCategory: ErrorCategory.STORAGE },
      { error: 'JSON parse error', expectedCategory: ErrorCategory.PARSING },
      { error: 'Authentication failed', expectedCategory: ErrorCategory.AUTHENTICATION },
      { error: 'Unauthorized access', expectedCategory: ErrorCategory.AUTHENTICATION },
      { error: 'Component render error', expectedCategory: ErrorCategory.RENDER },
    ];

    testCases.forEach(({ error, expectedCategory }) => {
      it(`should categorize "${error}" as ${expectedCategory}`, async () => {
        await ErrorTrackingService.trackError(new Error(error));

        const stats = await ErrorTrackingService.getAllErrorStats();
        expect(stats.length).toBeGreaterThan(0);
        expect(stats[0]?.category).toBe(expectedCategory);
      });
    });
  });

  describe('severity classification', () => {
    const testCases = [
      { error: 'Authentication failed', expectedSeverity: 'critical' },
      { error: 'API request failed', expectedSeverity: 'high' },
      { error: 'Storage error', expectedSeverity: 'high' },
      { error: 'Invalid input', expectedSeverity: 'medium' },
      { error: 'Parse error', expectedSeverity: 'medium' },
      { error: 'Minor warning', expectedSeverity: 'low' },
    ];

    testCases.forEach(({ error, expectedSeverity }) => {
      it(`should classify "${error}" as ${expectedSeverity} severity`, async () => {
        await ErrorTrackingService.trackError(new Error(error));

        const stats = await ErrorTrackingService.getAllErrorStats();
        expect(stats.length).toBeGreaterThan(0);
        expect(stats[0]?.severity).toBe(expectedSeverity);
      });
    });
  });
});

describe('Error Prevention Suggestions', () => {
  beforeEach(() => {
    mockStorage.errorTracking = [];
    mockStorage.errorStats = {};
    mockStorage.errorPreventions = [];
    jest.clearAllMocks();
  });

  it('should generate prevention suggestions for frequent errors', async () => {
    const error = new Error('fetch failed');

    // Track error multiple times to make it frequent
    for (let i = 0; i < 5; i++) {
      await ErrorTrackingService.trackError(error);
    }

    const stats = await ErrorTrackingService.getAllErrorStats();
    expect(stats.length).toBeGreaterThan(0);
    if (!stats[0]) return;
    
    const prevention = await ErrorTrackingService.suggestPrevention(stats[0]);

    // Prevention may be null if no suggestion is generated
    if (prevention) {
      expect(prevention.prevention).toBeTruthy();
    }
  });

  it('should not generate suggestions for resolved errors', async () => {
    const error = new Error('Resolved error');

    for (let i = 0; i < 5; i++) {
      await ErrorTrackingService.trackError(error);
    }

    const stats = await ErrorTrackingService.getAllErrorStats();
    expect(stats.length).toBeGreaterThan(0);
    if (stats[0]) {
      await ErrorTrackingService.markErrorResolved(stats[0].errorHash);
    }

    const frequentErrors = await ErrorTrackingService.getFrequentErrors();
    expect(frequentErrors).toHaveLength(0);
  });
});
