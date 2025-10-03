// Type definitions for external libraries and Chrome APIs

// Storage types
export interface StorageKeys {
  readonly PROFILE_DATA: 'profileData';
  readonly API_KEYS: 'apiKeys';
  readonly SETTINGS: 'settings';
  readonly TEMPLATES: 'templates';
  readonly APPLICATIONS: 'applications';
}

export interface ChromeStorageData {
  profileData?: import('../types').CVData;
  apiKeys?: Record<string, string>;
  settings?: AppSettings;
  templates?: import('../types').CVTemplate[];
  applications?: JobApplication[];
}

export interface AppSettings {
  language: 'en' | 'tr';
  theme: 'light' | 'dark';
  autoSave: boolean;
  defaultTemplate: string;
}

export interface JobApplication {
  id: string;
  company: string;
  position: string;
  appliedDate: Date;
  status: 'applied' | 'interview' | 'offer' | 'rejected';
  cvVersion: string;
  coverLetter?: string;
  notes?: string;
  followUpDate?: Date;
}

// Event handler types
export type InputChangeHandler = React.ChangeEvent<HTMLInputElement>;
export type TextAreaChangeHandler = React.ChangeEvent<HTMLTextAreaElement>;
export type SelectChangeHandler = React.ChangeEvent<HTMLSelectElement>;
export type FormSubmitHandler = React.FormEvent<HTMLFormElement>;

// Template types
export type TemplateType = 'Classic' | 'Modern' | 'Creative' | 'Minimal' | 'Professional';

// File parser types
export interface ParsedTextItem {
  str: string;
  dir?: string;
  width?: number;
  height?: number;
}

export interface ParsedSection<T = any> {
  startIndex: number;
  endIndex: number;
  data: T[];
}