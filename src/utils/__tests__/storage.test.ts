/**
 * Tests for Storage Service
 */

import { StorageService } from '../storage';

// Mock chrome.storage API
const mockStorage: { [key: string]: any } = {};

global.chrome = {
  storage: {
    sync: {
      get: jest.fn((keys, callback) => {
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
        }
        callback(result);
      }),
      set: jest.fn((items, callback) => {
        Object.assign(mockStorage, items);
        if (callback) callback();
      }),
      remove: jest.fn((keys, callback) => {
        if (Array.isArray(keys)) {
          keys.forEach((key) => delete mockStorage[key]);
        } else {
          delete mockStorage[keys];
        }
        if (callback) callback();
      }),
    },
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
});
