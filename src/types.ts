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

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  industry?: string[];
  style?: string[];
}

export interface TemplateRating {
  id: string;
  templateId: string;
  rating: number; // 1-5 stars
  review?: string;
  userId?: string;
  createdAt: string;
}

export interface CustomCVTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  categoryId?: string;
  colors: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  layout: {
    headerAlign: 'left' | 'center' | 'right';
    sectionSpacing: number;
    columnLayout: 'single' | 'two-column';
  };
  features: string[];
  isCustom: boolean;
  createdAt: string;
  updatedAt?: string;
  averageRating?: number;
  totalRatings?: number;
}

export interface CustomCoverLetterTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  categoryId?: string;
  style: {
    fontSize: number;
    fontFamily: string;
    lineHeight: number;
    paragraphSpacing: number;
    headerFormat: 'left' | 'center' | 'right';
    includeDate: boolean;
    includeAddress: boolean;
    signatureStyle: 'formal' | 'casual' | 'modern';
  };
  colors: {
    primary: string;
    text: string;
    accent: string;
  };
  tone: 'formal' | 'professional' | 'modern' | 'creative' | 'executive' | 'friendly';
  features: string[];
  isCustom: boolean;
  createdAt: string;
  updatedAt?: string;
  averageRating?: number;
  totalRatings?: number;
}

export interface AITemplateSuggestion {
  templateId: string;
  confidence: number; // 0-1
  reason: string;
  matchedKeywords: string[];
}
