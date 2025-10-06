// Extended schema with all new features
export type EmploymentType = "Full-time" | "Part-time" | "Contract" | "Internship" | "Temporary" | "Freelance" | "Volunteer" | "Other";
export type LocationType = "On-site" | "Hybrid" | "Remote";
export type QuestionType = "shortText" | "longText" | "singleSelect" | "multiSelect" | "yesNo" | "date" | "file" | "link" | "number";
export type CVTemplate = "modern" | "classic" | "minimal" | "ats";
export type CoverLetterTemplate = "standard" | "short" | "star" | "concise" | "managerial";
export type AIProvider = "openai" | "gemini" | "anthropic" | "azure";

export interface ResumeProfile {
  id: string;
  profileName: string;
  personal: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    linkedin?: string;
    portfolio?: string;
    github?: string;
    whatsapp?: string;
    phone?: string;
    phoneCountryCode?: string;
    location?: string;
    summary?: string;
    photoUrl?: string; // Base64 or blob URL
    photoMetadata?: {
      width: number;
      height: number;
      format: string;
      size: number;
    };
  };
  skills: string[];
  experience: Array<{
    title: string;
    employmentType?: EmploymentType;
    company: string;
    startDate: string;
    endDate?: string;
    isCurrent?: boolean;
    location?: string;
    locationType?: LocationType;
    country?: string; // Country code
    city?: string;
    description?: string;
    skills?: string[];
    bullets?: string[]; // For optimization tracking
  }>;
  education: Array<{
    school: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    expected?: boolean;
    grade?: string;
    activities?: string;
    description?: string;
    skills?: string[];
    country?: string;
    city?: string;
  }>;
  licenses: Array<{
    name: string;
    organization?: string;
    issueDate?: string;
    expirationDate?: string;
    credentialId?: string;
    credentialUrl?: string;
    skills?: string[];
    country?: string;
    city?: string;
  }>;
  projects: Array<{
    name: string;
    description?: string;
    skills?: string[];
    startDate?: string;
    endDate?: string;
    current?: boolean;
    associatedWith?: string[];
    country?: string;
    city?: string;
  }>;
  additionalAnswers: Array<AdditionalAnswer>;
  selectedCVTemplate?: CVTemplate;
  selectedCoverLetterTemplate?: CoverLetterTemplate;
}

export interface AdditionalAnswer {
  qId: string;
  label: string;
  type: QuestionType;
  value?: unknown;
  meta?: {
    options?: Array<{ label: string; value: string }>;
    fileName?: string; // For file type
    fileSize?: number;
    fileType?: string;
  };
}

export interface AISettings {
  provider: AIProvider;
  model?: string;
  temperature?: number;
  apiKeys: {
    openai?: string; // Encrypted
    gemini?: string; // Encrypted
    anthropic?: string; // Encrypted
    azure?: string; // Encrypted
  };
  fallbackChain?: AIProvider[];
  timeout?: number;
  maxRetries?: number;
}

export interface GoogleSettings {
  connected: boolean;
  tokenMetadata?: {
    expiresAt?: number;
    scopes?: string[];
  };
  // Encrypted tokens stored separately
}

export interface UISettings {
  highlightOptimized: boolean;
  locale: "en" | "tr";
  theme?: "light" | "dark" | "auto";
}

export interface AppSettings {
  ai: AISettings;
  google: GoogleSettings;
  ui: UISettings;
  version: number; // For migration tracking
}

export interface OptimizationHighlight {
  section: string;
  field?: string;
  index?: number;
}

export interface CoverLetterData {
  id: string;
  profileId: string;
  jobPostId?: string;
  content: string;
  template: CoverLetterTemplate;
  generatedAt: string;
  edited: boolean;
}

// Storage keys
export const STORAGE_KEYS = {
  PROFILES: "profiles",
  CURRENT_PROFILE: "currentProfile",
  SETTINGS: "settings",
  ENCRYPTED_TOKENS: "encryptedTokens",
  JOB_POSTS: "jobPosts",
  COVER_LETTERS: "coverLetters",
  APPLICATIONS: "applications",
} as const;
