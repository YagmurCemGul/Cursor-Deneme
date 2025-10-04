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

// Template Enhancement Features
export interface TemplateMetadata {
  id: string;
  isFavorite: boolean;
  usageCount: number;
  lastUsed?: string;
  industry?: string;
  context?: string[];
  customFields?: Record<string, any>;
}

export interface EnhancedCVTemplate extends CVTemplate {
  metadata?: TemplateMetadata;
  industry?: string[];
  tags?: string[];
  contextRelevance?: number;
}

export interface TemplateUsageAnalytics {
  id: string;
  templateId: string;
  templateType: 'cv' | 'cover-letter' | 'description';
  timestamp: string;
  context?: {
    industry?: string;
    jobTitle?: string;
    section?: string;
  };
  userId?: string;
}

export interface CustomTemplate {
  id: string;
  name: string;
  type: 'cv' | 'cover-letter' | 'description';
  content: string;
  preview?: string;
  industry?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  metadata?: TemplateMetadata;
  category?: string;
  folderId?: string;
}

// Template Ratings and Reviews
export interface TemplateRating {
  id: string;
  templateId: string;
  rating: number; // 1-5 stars
  review?: string;
  createdAt: string;
  updatedAt?: string;
  helpful?: number; // helpful votes
  tags?: string[]; // e.g., ['professional', 'clean', 'modern']
}

export interface TemplateReview {
  id: string;
  templateId: string;
  userId?: string;
  rating: number;
  title: string;
  review: string;
  pros?: string[];
  cons?: string[];
  createdAt: string;
  updatedAt?: string;
  helpful: number;
  notHelpful: number;
  verified?: boolean; // verified user/purchase
}

// Job Application Success Tracking
export interface JobApplication {
  id: string;
  templateId: string;
  jobTitle: string;
  company: string;
  industry: string;
  appliedDate: string;
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'accepted' | 'withdrawn';
  statusDate: string;
  notes?: string;
  templateVersion?: string;
}

export interface TemplateSuccessMetrics {
  templateId: string;
  totalApplications: number;
  interviewRate: number; // percentage that got interviews
  offerRate: number; // percentage that got offers
  acceptanceRate: number; // percentage that were accepted
  averageResponseTime: number; // days
  topIndustries: string[];
  topCompanies: string[];
  lastUpdated: string;
}

// Template Categories and Folders
export interface TemplateFolder {
  id: string;
  name: string;
  description?: string;
  parentId?: string; // for nested folders
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  order: number;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  templates: string[]; // template IDs
  createdAt: string;
  updatedAt: string;
}

// Enhanced Analytics
export interface AnalyticsDateRange {
  start: string;
  end: string;
  preset?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all' | 'custom';
}

export interface AnalyticsExportOptions {
  format: 'json' | 'csv' | 'pdf' | 'excel';
  dateRange: AnalyticsDateRange;
  includeCharts?: boolean;
  sections?: ('summary' | 'usage' | 'success' | 'ratings' | 'trends')[];
}

export interface TemplateAnalyticsSummary {
  templateId: string;
  templateName: string;
  dateRange: AnalyticsDateRange;
  usage: {
    totalUses: number;
    uniqueUsers: number;
    averageUsesPerDay: number;
    peakUsageDate: string;
  };
  success: {
    applications: number;
    interviewRate: number;
    offerRate: number;
  };
  ratings: {
    averageRating: number;
    totalReviews: number;
    distribution: Record<number, number>; // rating -> count
  };
  trends: {
    usageGrowth: number; // percentage
    ratingTrend: 'up' | 'down' | 'stable';
    popularityRank: number;
  };
}
