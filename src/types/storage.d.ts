export enum StorageKeys {
  PROFILE_DATA = 'profileData',
  API_KEYS = 'apiKeys',
  SETTINGS = 'settings',
  TEMPLATES = 'templates',
  JOB_DESCRIPTION = 'jobDescription',
  OPTIMIZATIONS = 'optimizations',
  LANGUAGE = 'language',
  THEME = 'theme',
  PROFILES = 'profiles',
  ACTIVE_PROFILE = 'activeProfile'
}

export interface StorageData {
  [StorageKeys.PROFILE_DATA]: CVData;
  [StorageKeys.API_KEYS]: APIKeys;
  [StorageKeys.SETTINGS]: AppSettings;
  [StorageKeys.TEMPLATES]: CVTemplate[];
  [StorageKeys.JOB_DESCRIPTION]: string;
  [StorageKeys.OPTIMIZATIONS]: ATSOptimization[];
  [StorageKeys.LANGUAGE]: Language;
  [StorageKeys.THEME]: Theme;
  [StorageKeys.PROFILES]: CVProfile[];
  [StorageKeys.ACTIVE_PROFILE]: string;
}

export interface APIKeys {
  openai?: string;
  gemini?: string;
  claude?: string;
}

export interface AppSettings {
  language: Language;
  theme: Theme;
  autoSave: boolean;
  apiProvider: AIProvider;
}

export interface CVTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  category: 'modern' | 'classic' | 'creative' | 'minimal' | 'professional';
  colors: ColorScheme;
  fonts: FontScheme;
  layout: LayoutConfig;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  text: string;
  background: string;
  accent?: string;
}

export interface FontScheme {
  heading: string;
  body: string;
  size: {
    small: number;
    medium: number;
    large: number;
  };
}

export interface LayoutConfig {
  columns: 1 | 2;
  sections: string[];
  spacing: 'compact' | 'normal' | 'spacious';
}

export type Language = 'en' | 'tr';
export type Theme = 'light' | 'dark' | 'system';
export type AIProvider = 'openai' | 'gemini' | 'claude';

// Import types from main types file
import type { CVData, ATSOptimization, CVProfile } from '../types';