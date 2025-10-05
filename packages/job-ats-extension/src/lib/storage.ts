/**
 * Chrome Storage API utilities with TypeScript support
 */

export interface Settings {
  model: string;
  language: string;
  encryptionEnabled: boolean;
  encryptionPassword?: string;
  apiKey?: string;
}

export interface Profile {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    country: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  workAuth: {
    authorized: boolean;
    needsVisa: boolean;
    canRelocate: boolean;
  };
  preferences: {
    salaryExpectation?: string;
    noticePeriod?: string;
    preferredLocations: string[];
  };
  resume?: {
    education: Education[];
    experience: Experience[];
    skills: string[];
    languages: Language[];
    projects?: Project[];
  };
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

export interface CoverLetterTemplate {
  id: string;
  name: string;
  tone: string;
  template: string;
}

/**
 * Get settings from storage
 */
export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.local.get(['settings']);
  return result.settings || {
    model: 'gpt-4o-mini',
    language: 'en',
    encryptionEnabled: false,
  };
}

/**
 * Save settings to storage
 */
export async function saveSettings(settings: Partial<Settings>): Promise<void> {
  const current = await getSettings();
  await chrome.storage.local.set({
    settings: { ...current, ...settings },
  });
}

/**
 * Get profile from storage
 */
export async function getProfile(): Promise<Profile | null> {
  const result = await chrome.storage.local.get(['profile']);
  return result.profile || null;
}

/**
 * Save profile to storage
 */
export async function saveProfile(profile: Profile): Promise<void> {
  await chrome.storage.local.set({ profile });
}

/**
 * Get tracked jobs from storage
 */
export async function getTrackedJobs(): Promise<TrackedJob[]> {
  const result = await chrome.storage.local.get(['trackedJobs']);
  return result.trackedJobs || [];
}

/**
 * Save tracked jobs to storage
 */
export async function saveTrackedJobs(jobs: TrackedJob[]): Promise<void> {
  await chrome.storage.local.set({ trackedJobs: jobs });
}

/**
 * Add a tracked job
 */
export async function addTrackedJob(job: Omit<TrackedJob, 'id' | 'savedAt'>): Promise<TrackedJob> {
  const jobs = await getTrackedJobs();
  const newJob: TrackedJob = {
    ...job,
    id: crypto.randomUUID(),
    savedAt: Date.now(),
  };
  jobs.push(newJob);
  await saveTrackedJobs(jobs);
  return newJob;
}

/**
 * Update a tracked job
 */
export async function updateTrackedJob(id: string, updates: Partial<TrackedJob>): Promise<void> {
  const jobs = await getTrackedJobs();
  const index = jobs.findIndex(j => j.id === id);
  if (index !== -1) {
    jobs[index] = { ...jobs[index], ...updates };
    await saveTrackedJobs(jobs);
  }
}

/**
 * Delete a tracked job
 */
export async function deleteTrackedJob(id: string): Promise<void> {
  const jobs = await getTrackedJobs();
  const filtered = jobs.filter(j => j.id !== id);
  await saveTrackedJobs(filtered);
}

/**
 * Get cover letter templates
 */
export async function getCoverLetterTemplates(): Promise<CoverLetterTemplate[]> {
  const result = await chrome.storage.local.get(['coverLetterTemplates']);
  return result.coverLetterTemplates || getDefaultCoverLetterTemplates();
}

/**
 * Default cover letter templates
 */
function getDefaultCoverLetterTemplates(): CoverLetterTemplate[] {
  return [
    {
      id: 'short',
      name: 'Short & Direct',
      tone: 'professional',
      template: 'Brief introduction highlighting key qualifications (120-150 words)',
    },
    {
      id: 'standard',
      name: 'Standard',
      tone: 'professional',
      template: 'Standard cover letter with introduction, body, and conclusion (180-250 words)',
    },
    {
      id: 'star',
      name: 'STAR Method',
      tone: 'achievement-focused',
      template: 'Cover letter using STAR (Situation, Task, Action, Result) examples',
    },
  ];
}
