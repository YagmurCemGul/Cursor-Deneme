export type StorageKey =
  | 'profiles'
  | 'activeProfileId'
  | 'jobPost'
  | 'options'
  | 'optimizations'
  | 'coverLetterPrompts';

export type StorageSchema = {
  profiles: unknown[];
  activeProfileId: string;
  jobPost: unknown;
  options: { apiProvider?: 'openai' | 'azure'; apiKey?: string; language?: 'tr' | 'en' };
  optimizations: unknown[];
  coverLetterPrompts: unknown[];
};

export {};
