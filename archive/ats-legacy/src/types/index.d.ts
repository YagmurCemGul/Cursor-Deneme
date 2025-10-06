/**
 * Type definitions for the extension
 */

export interface AppSettings {
  model: string;
  language: string;
  encryptionEnabled: boolean;
  encryptionPassword?: string;
  apiKey?: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface WorkAuthorization {
  authorized: boolean;
  needsVisa: boolean;
  canRelocate: boolean;
}

export interface UserPreferences {
  salaryExpectation?: string;
  noticePeriod?: string;
  preferredLocations: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  gpa?: string;
}

export interface Experience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements: string[];
}

export interface Language {
  name: string;
  level: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface Resume {
  education: Education[];
  experience: Experience[];
  skills: string[];
  languages: Language[];
  projects?: Project[];
}

export interface UserProfile {
  personalInfo: PersonalInfo;
  workAuth: WorkAuthorization;
  preferences: UserPreferences;
  resume?: Resume;
}

export interface TrackedJob {
  id: string;
  title: string;
  company: string;
  url: string;
  status: 'saved' | 'applied' | 'interview' | 'offered' | 'rejected';
  savedAt: number;
  appliedAt?: number;
  notes?: string;
  jobDescription?: string;
  atsScore?: number;
}

export interface JobDescription {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  salary?: string;
  jobType?: string;
  experienceLevel?: string;
  postedDate?: string;
  url: string;
}

export interface ATSScore {
  score: number;
  matchingKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

export interface CoverLetter {
  id: string;
  jobId: string;
  content: string;
  createdAt: number;
}

declare global {
  interface Window {
    chrome: typeof chrome;
  }
}
