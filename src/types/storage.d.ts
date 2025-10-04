// Chrome storage types and constants

export const STORAGE_KEYS = {
  PROFILE_DATA: 'profileData',
  API_KEYS: 'apiKeys',
  SETTINGS: 'settings',
  TEMPLATES: 'templates',
  APPLICATIONS: 'applications',
  SAVED_PROMPTS: 'savedPrompts',
  CV_PROFILES: 'cvProfiles',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export interface ChromeStorageData {
  [STORAGE_KEYS.PROFILE_DATA]?: import('../types').CVData;
  [STORAGE_KEYS.API_KEYS]?: AIApiKeys;
  [STORAGE_KEYS.SETTINGS]?: AppSettings;
  [STORAGE_KEYS.TEMPLATES]?: import('../types').CVTemplate[];
  [STORAGE_KEYS.APPLICATIONS]?: JobApplication[];
  [STORAGE_KEYS.SAVED_PROMPTS]?: import('../types').SavedPrompt[];
  [STORAGE_KEYS.CV_PROFILES]?: import('../types').CVProfile[];
}

export interface AppSettings {
  language: 'en' | 'tr';
  theme: 'light' | 'dark';
  autoSave: boolean;
  defaultTemplate: string;
  aiProvider: 'openai' | 'gemini' | 'claude';
  aiModel?: string; // Optional model selection for the provider
  aiTemperature?: number; // Temperature setting for AI responses (0-1)
}

export interface AIApiKeys {
  openai?: string;
  gemini?: string;
  claude?: string;
}

export interface ProviderUsageAnalytics {
  id: string;
  provider: 'openai' | 'gemini' | 'claude';
  operation: 'optimizeCV' | 'generateCoverLetter';
  timestamp: string;
  success: boolean;
  duration: number; // in milliseconds
  errorMessage?: string;
}

export interface PerformanceMetrics {
  id: string;
  provider: 'openai' | 'gemini' | 'claude';
  operation: 'optimizeCV' | 'generateCoverLetter';
  timestamp: string;
  duration: number; // in milliseconds
  success: boolean;
  errorMessage?: string;
  tokensUsed?: number;
  costEstimate?: number;
}

export interface JobApplication {
  id: string;
  company: string;
  position: string;
  appliedDate: string;
  status: 'applied' | 'interview' | 'offer' | 'rejected';
  cvVersion: string;
  coverLetter?: string;
  notes?: string;
  followUpDate?: string;
}

// Chrome storage API wrapper types
export interface StorageResult<T> {
  [key: string]: T;
}

export interface StorageChangeEvent {
  [key: string]: {
    oldValue?: any;
    newValue?: any;
  };
}

export type StorageArea = 'sync' | 'local' | 'managed';
