export interface PhotoFilters {
  brightness: number; // 0-200, default 100
  contrast: number; // 0-200, default 100
  saturation: number; // 0-200, default 100
  grayscale: number; // 0-100, default 0 (0 = color, 100 = full grayscale)
}

export interface PhotoHistoryItem {
  id: string;
  dataUrl: string;
  timestamp: number;
  filters?: PhotoFilters;
}

export interface PersonalInfo {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  linkedInUsername: string;
  portfolioUrl: string;
  githubUsername: string;
  whatsappLink: string;
  phoneNumber: string;
  countryCode: string;
  summary: string;
  photoDataUrl?: string; // base64 data URL for profile photo
  photoFilters?: PhotoFilters; // Applied filters
  photoHistory?: PhotoHistoryItem[]; // History of uploaded photos
}

export interface Experience {
  id: string;
  title: string;
  employmentType: string;
  company: string;
  startDate: string;
  endDate: string;
  currentlyWorking?: boolean;
  location: string; // backward compatibility string
  country?: string; // ISO country name
  city?: string;
  locationType: string;
  description: string;
  skills: string[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  currentlyStudying?: boolean;
  grade: string;
  activities: string;
  description: string;
  skills: string[];
  country?: string;
  city?: string;
  location?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate: string;
  noExpiration?: boolean;
  credentialId: string;
  credentialUrl: string;
  description?: string;
  skills: string[];
  country?: string;
  city?: string;
  location?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  skills: string[];
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  associatedWith: string;
  country?: string;
  city?: string;
  location?: string;
}

export interface CVData {
  personalInfo: PersonalInfo;
  skills: string[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  projects: Project[];
  customQuestions: CustomQuestion[];
}

export interface CustomQuestion {
  id: string;
  question: string;
  type: 'text' | 'form_group' | 'choice' | 'fieldset' | 'selection' | 'checkbox';
  options?: string[] | undefined;
  answer: string | string[];
}

export interface ATSOptimization {
  id: string;
  category: string;
  change: string;
  originalText: string;
  optimizedText: string;
  applied: boolean;
  section?: string; // Which CV section this applies to (e.g., 'summary', 'experience', 'skills')
}

export interface SavedPrompt {
  id: string;
  name: string;
  folder: string;
  content: string;
  createdAt: string;
}

export interface CVProfile {
  id: string;
  name: string;
  data: CVData;
  createdAt: string;
  updatedAt: string;
}

export interface CVTemplate {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

export interface CoverLetterTemplateSelection {
  id: string;
  name: string;
  selected: boolean;
}

export interface ProfileVersion {
  id: string;
  profileId: string;
  versionNumber: number;
  data: CVData;
  createdAt: string;
  description?: string;
  changesSummary?: string;
}

export interface HistoryState {
  cvData: CVData;
  timestamp: number;
}

export interface OptimizationAnalytics {
  id: string;
  timestamp: string;
  profileId?: string;
  optimizationsApplied: number;
  categoriesOptimized: string[];
  jobDescriptionLength: number;
  cvSections: string[];
  aiProvider: 'openai' | 'gemini' | 'claude';
  changes: Array<{
    section: string;
    category: string;
    applied: boolean;
  }>;
}

export interface ProfileFilter {
  searchQuery: string;
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy: 'name' | 'updatedAt' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

export interface SavedJobDescription {
  id: string;
  name: string;
  description: string;
  category?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  usageCount?: number;
}
