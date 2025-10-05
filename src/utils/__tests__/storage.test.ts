/**
 * Tests for Storage Service
 */

import { StorageService } from '../storage';

// Mock chrome.storage API
const mockStorage: { [key: string]: any } = {};

const mockStorageMethods = {
  get: jest.fn((keys) => {
    const result: { [key: string]: any } = {};
    if (Array.isArray(keys)) {
      keys.forEach((key) => {
        if (mockStorage[key]) {
          result[key] = mockStorage[key];
        }
      });
    } else if (typeof keys === 'string') {
      if (mockStorage[keys]) {
        result[keys] = mockStorage[keys];
      }
    } else {
      // If keys is an object with defaults
      Object.keys(keys).forEach((key) => {
        result[key] = mockStorage[key] ?? keys[key];
      });
    }
    return Promise.resolve(result);
  }),
  set: jest.fn((items) => {
    Object.assign(mockStorage, items);
    return Promise.resolve();
  }),
  remove: jest.fn((keys) => {
    if (Array.isArray(keys)) {
      keys.forEach((key) => delete mockStorage[key]);
    } else {
      delete mockStorage[keys];
    }
    return Promise.resolve();
  }),
};

global.chrome = {
  storage: {
    local: mockStorageMethods,
    sync: mockStorageMethods,
  },
} as any;

describe('StorageService', () => {
  beforeEach(() => {
    // Clear mock storage before each test
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    jest.clearAllMocks();
  });

  describe('getAPIKey', () => {
    it('should return API key if stored', async () => {
      mockStorage.apiKey = 'test-api-key';
      const apiKey = await StorageService.getAPIKey();
      expect(apiKey).toBe('test-api-key');
    });

    it('should return null if no API key stored', async () => {
      const apiKey = await StorageService.getAPIKey();
      expect(apiKey).toBeNull();
    });
  });

  describe('saveAPIKey', () => {
    it('should save API key', async () => {
      await StorageService.saveAPIKey('new-api-key');
      expect(mockStorage.apiKey).toBe('new-api-key');
    });
  });

  describe('getSettings', () => {
    it('should return settings if stored', async () => {
      const testSettings = { theme: 'dark', language: 'en' };
      mockStorage.settings = testSettings;
      const settings = await StorageService.getSettings();
      expect(settings).toEqual(testSettings);
    });

    it('should return null if no settings stored', async () => {
      const settings = await StorageService.getSettings();
      expect(settings).toBeNull();
    });
  });

  describe('saveSettings', () => {
    it('should save settings', async () => {
      const testSettings = { theme: 'dark', language: 'tr' };
      await StorageService.saveSettings(testSettings);
      expect(mockStorage.settings).toEqual(testSettings);
    });
  });

  describe('getDraft', () => {
    it('should return draft if stored', async () => {
      const testDraft = { jobDescription: 'Test job', cvData: {} };
      mockStorage.draft = testDraft;
      const draft = await StorageService.getDraft();
      expect(draft).toEqual(testDraft);
    });
  });

  describe('saveDraft', () => {
    it('should save draft', async () => {
      const testDraft = { jobDescription: 'Test job', cvData: {} };
      await StorageService.saveDraft(testDraft);
      expect(mockStorage.draft).toEqual(testDraft);
    });
  });

  describe('AI Provider Management', () => {
    it('should get and set AI provider', async () => {
      await StorageService.saveAIProvider('gemini');
      const provider = await StorageService.getAIProvider();
      expect(provider).toBe('gemini');
    });

    it('should default to openai if no provider set', async () => {
      const provider = await StorageService.getAIProvider();
      expect(provider).toBe('openai');
    });

    it('should get and set API keys for all providers', async () => {
      const apiKeys = {
        openai: 'openai-key',
        gemini: 'gemini-key',
        claude: 'claude-key',
      };
      await StorageService.saveAPIKeys(apiKeys);
      const storedKeys = await StorageService.getAPIKeys();
      expect(storedKeys).toEqual(apiKeys);
    });

    it('should get and set AI model', async () => {
      await StorageService.saveAIModel('gpt-4o');
      const model = await StorageService.getAIModel();
      expect(model).toBe('gpt-4o');
    });
  });

  describe('Profile Management', () => {
    it('should save and get profiles', async () => {
      const testProfile = {
        id: '1',
        name: 'Test Profile',
        data: { 
          personalInfo: {
            firstName: '',
            middleName: '',
            lastName: '',
            email: '',
            linkedInUsername: '',
            portfolioUrl: '',
            githubUsername: '',
            whatsappLink: '',
            phoneNumber: '',
            countryCode: '',
            summary: '',
          }, 
          skills: [], 
          experience: [],
          education: [],
          certifications: [],
          projects: [],
          customQuestions: [],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await StorageService.saveProfile(testProfile);
      const profiles = await StorageService.getProfiles();
      expect(profiles).toHaveLength(1);
      expect(profiles[0]).toEqual(testProfile);
    });

    it('should delete profile', async () => {
      const testProfile = {
        id: '1',
        name: 'Test Profile',
        data: { 
          personalInfo: {
            firstName: '',
            middleName: '',
            lastName: '',
            email: '',
            linkedInUsername: '',
            portfolioUrl: '',
            githubUsername: '',
            whatsappLink: '',
            phoneNumber: '',
            countryCode: '',
            summary: '',
          }, 
          skills: [], 
          experience: [],
          education: [],
          certifications: [],
          projects: [],
          customQuestions: [],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await StorageService.saveProfile(testProfile);
      await StorageService.deleteProfile('1');
      const profiles = await StorageService.getProfiles();
      expect(profiles).toHaveLength(0);
    });
  });

  describe.skip('Provider Usage Analytics (DEPRECATED - feature removed)', () => {
    it('should track and retrieve provider usage', async () => {
      const usage = {
        id: '1',
        provider: 'openai' as const,
        operation: 'optimizeCV' as const,
        timestamp: new Date().toISOString(),
        success: true,
        duration: 1500,
      };

      await StorageService.saveProviderUsage(usage);
      const analytics = await StorageService.getProviderAnalytics();
      expect(analytics).toHaveLength(1);
      expect(analytics[0]).toEqual(usage);
    });

    it('should limit analytics to last 100 entries', async () => {
      // Add 150 entries
      for (let i = 0; i < 150; i++) {
        await StorageService.saveProviderUsage({
          id: `${i}`,
          provider: 'openai' as const,
          operation: 'optimizeCV' as const,
          timestamp: new Date().toISOString(),
          success: true,
          duration: 1000,
        });
      }

      const analytics = await StorageService.getProviderAnalytics();
      expect(analytics.length).toBeLessThanOrEqual(100);
    });

    it('should clear all analytics', async () => {
      await StorageService.saveProviderUsage({
        id: '1',
        provider: 'gemini' as const,
        operation: 'generateCoverLetter' as const,
        timestamp: new Date().toISOString(),
        success: true,
        duration: 2000,
      });

      await StorageService.clearProviderAnalytics();
      const analytics = await StorageService.getProviderAnalytics();
      expect(analytics).toHaveLength(0);
    });
  });

  describe.skip('Performance Metrics (DEPRECATED - feature removed)', () => {
    it('should track and retrieve performance metrics', async () => {
      const metrics = {
        id: '1',
        provider: 'claude' as const,
        operation: 'optimizeCV' as const,
        timestamp: new Date().toISOString(),
        duration: 1800,
        success: true,
        tokensUsed: 1500,
      };

      await StorageService.savePerformanceMetrics(metrics);
      const allMetrics = await StorageService.getPerformanceMetrics();
      expect(allMetrics).toHaveLength(1);
      expect(allMetrics[0]).toEqual(metrics);
    });

    it('should calculate average performance by provider', async () => {
      // Add metrics for different providers
      await StorageService.savePerformanceMetrics({
        id: '1',
        provider: 'openai' as const,
        operation: 'optimizeCV' as const,
        timestamp: new Date().toISOString(),
        duration: 1000,
        success: true,
        tokensUsed: 1000,
      });

      await StorageService.savePerformanceMetrics({
        id: '2',
        provider: 'openai' as const,
        operation: 'optimizeCV' as const,
        timestamp: new Date().toISOString(),
        duration: 2000,
        success: true,
        tokensUsed: 1500,
      });

      const metrics = await StorageService.getPerformanceMetrics();
      const openaiMetrics = metrics.filter(m => m.provider === 'openai');
      const avgDuration = openaiMetrics.reduce((sum, m) => sum + m.duration, 0) / openaiMetrics.length;
      expect(avgDuration).toBe(1500);
    });

    it('should clear performance metrics', async () => {
      await StorageService.savePerformanceMetrics({
        id: '1',
        provider: 'gemini' as const,
        operation: 'generateCoverLetter' as const,
        timestamp: new Date().toISOString(),
        duration: 2500,
        success: true,
        tokensUsed: 2000,
      });

      await StorageService.clearPerformanceMetrics();
      const metrics = await StorageService.getPerformanceMetrics();
      expect(metrics).toHaveLength(0);
    });
  });

  describe('Persistence Edge Cases', () => {
    it('should handle concurrent saves', async () => {
      const saves = [];
      for (let i = 0; i < 10; i++) {
        saves.push(StorageService.saveSettings({ test: i }));
      }
      await Promise.all(saves);
      
      const settings = await StorageService.getSettings();
      expect(settings).toBeDefined();
    });

    it('should handle empty/null values gracefully', async () => {
      await StorageService.saveAPIKeys({});
      const keys = await StorageService.getAPIKeys();
      expect(keys).toEqual({});
    });

    it('should preserve data types after save/load cycle', async () => {
      const testData = {
        string: 'test',
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        object: { nested: 'value' },
        null: null,
      };

      await StorageService.saveSettings(testData);
      const loaded = await StorageService.getSettings();
      expect(loaded).toEqual(testData);
    });
  });
});
