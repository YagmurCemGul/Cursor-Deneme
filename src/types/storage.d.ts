// Chrome storage types and constants

export const STORAGE_KEYS = {
  PROFILE_DATA: 'profileData',
  API_KEYS: 'apiKeys',
  SETTINGS: 'settings',
  TEMPLATES: 'templates',
  APPLICATIONS: 'applications',
  SAVED_PROMPTS: 'savedPrompts',
  CV_PROFILES: 'cvProfiles',
  API_USAGE_STATS: 'apiUsageStats',
  CUSTOM_PROMPTS: 'customPrompts',
  AB_TEST_RESULTS: 'abTestResults',
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
  [STORAGE_KEYS.API_USAGE_STATS]?: APIUsageStats[];
  [STORAGE_KEYS.CUSTOM_PROMPTS]?: CustomPromptTemplate[];
  [STORAGE_KEYS.AB_TEST_RESULTS]?: ABTestResult[];
}

export interface AppSettings {
  language: 'en' | 'tr';
  theme: 'light' | 'dark';
  autoSave: boolean;
  defaultTemplate: string;
  aiProvider: 'openai' | 'gemini' | 'claude' | 'azure-openai' | 'ollama';
  aiModel?: string; // Optional model selection for the provider
  aiTemperature?: number; // Temperature setting for AI responses (0-1)
  azureEndpoint?: string; // Azure OpenAI endpoint
  azureDeployment?: string; // Azure OpenAI deployment name
  ollamaEndpoint?: string; // Ollama endpoint (default: http://localhost:11434)
}

export interface AIApiKeys {
  openai?: string;
  gemini?: string;
  claude?: string;
  azureOpenai?: string;
  ollama?: string; // Optional API key for secured Ollama instances
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

// API Usage Statistics
export interface APIUsageStats {
  id: string;
  provider: 'openai' | 'gemini' | 'claude' | 'azure-openai' | 'ollama';
  model: string;
  operation: 'optimize-cv' | 'generate-cover-letter' | 'batch-process' | 'ab-test';
  timestamp: string;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost: number; // in USD
  duration: number; // in milliseconds
  success: boolean;
  errorMessage?: string;
}

// Custom Prompt Templates
export interface CustomPromptTemplate {
  id: string;
  name: string;
  description: string;
  category: 'cv-optimization' | 'cover-letter' | 'general';
  systemPrompt: string;
  userPromptTemplate: string;
  variables: string[]; // Variables that can be replaced (e.g., {{jobDescription}}, {{cvData}})
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

// A/B Testing Results
export interface ABTestResult {
  id: string;
  testName: string;
  cvData: any; // Reference to CV data
  jobDescription: string;
  timestamp: string;
  providers: {
    provider: string;
    model: string;
    result: string;
    tokensUsed: number;
    cost: number;
    duration: number;
    rating?: number; // User rating 1-5
  }[];
  selectedProvider?: string; // Which provider user chose as best
  notes?: string;
}

// Batch Processing Job
export interface BatchProcessingJob {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  items: {
    cvId: string;
    jobDescription: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    result?: any;
    error?: string;
  }[];
  progress: {
    total: number;
    completed: number;
    failed: number;
  };
}
