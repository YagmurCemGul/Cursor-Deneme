// Chrome storage API type definitions
export interface StorageKeys {
  PROFILE_DATA: 'profileData';
  API_KEYS: 'apiKeys';
  SETTINGS: 'settings';
  TEMPLATES: 'templates';
}

export const STORAGE_KEYS: StorageKeys;

export interface ChromeStorage {
  get(keys: string | string[] | null): Promise<{ [key: string]: any }>;
  set(items: { [key: string]: any }): Promise<void>;
  remove(keys: string | string[]): Promise<void>;
  clear(): Promise<void>;
}

export interface ProfileData {
  id: string;
  name: string;
  data: import('../types').CVData;
  createdAt: string;
  updatedAt: string;
}

export interface APIKeys {
  openai?: string;
  gemini?: string;
  claude?: string;
}

export interface Settings {
  theme: 'light' | 'dark';
  language: 'tr' | 'en';
  autoSave: boolean;
  notifications: boolean;
}

export interface Templates {
  [key: string]: import('../types').CVTemplate;
}