import type { ResumeProfile, TemplateMeta, JobPost, AtsOptimization, JobApplication } from './types';

const STORAGE_KEYS = {
  PROFILES: 'profiles',
  ACTIVE_PROFILE_ID: 'activeProfileId',
  JOB_POST: 'jobPost',
  OPTS: 'options',
  OPTIMIZATIONS: 'optimizations',
  COVER_LETTER_PROMPTS: 'coverLetterPrompts',
  GENERATED_RESUME: 'generatedResume',
  GENERATED_COVER_LETTER: 'generatedCoverLetter',
  JOB_APPLICATIONS: 'jobApplications'
} as const;

type Options = {
  apiProvider?: 'openai' | 'azure' | 'gemini' | 'claude';
  apiKey?: string;
  language?: 'tr' | 'en';
  aiModel?: string;
  aiTemperature?: number;
};

export const storage = {
  async get<T>(key: string): Promise<T | undefined> {
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (res) => {
        resolve(res[key] as T | undefined);
      });
    });
  },
  async set<T>(key: string, value: T): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => resolve());
    });
  },
  keys: STORAGE_KEYS,
};

export async function getActiveProfile(): Promise<ResumeProfile | undefined> {
  const profiles = (await storage.get<ResumeProfile[]>(STORAGE_KEYS.PROFILES)) ?? [];
  const activeId = await storage.get<string>(STORAGE_KEYS.ACTIVE_PROFILE_ID);
  return profiles.find((p) => p.id === activeId) ?? profiles[0];
}

export async function saveOrUpdateProfile(profile: ResumeProfile): Promise<void> {
  const profiles = (await storage.get<ResumeProfile[]>(STORAGE_KEYS.PROFILES)) ?? [];
  const idx = profiles.findIndex((p) => p.id === profile.id);
  if (idx >= 0) profiles[idx] = profile; else profiles.push(profile);
  await storage.set(STORAGE_KEYS.PROFILES, profiles);
  await storage.set(STORAGE_KEYS.ACTIVE_PROFILE_ID, profile.id);
}

export async function saveTemplate(meta: TemplateMeta): Promise<void> {
  const profile = await getActiveProfile();
  if (!profile) return;
  const existing = profile.templates.find((t) => t.id === meta.id);
  if (existing) Object.assign(existing, meta); else profile.templates.push(meta);
  await saveOrUpdateProfile(profile);
}

export async function saveJobPost(job: JobPost): Promise<void> {
  await storage.set(STORAGE_KEYS.JOB_POST, job);
}

export async function loadJobPost(): Promise<JobPost | undefined> {
  return storage.get<JobPost>(STORAGE_KEYS.JOB_POST);
}

export async function saveOptimizations(list: AtsOptimization[]): Promise<void> {
  await storage.set(STORAGE_KEYS.OPTIMIZATIONS, list);
}

export async function loadOptimizations(): Promise<AtsOptimization[]> {
  return (await storage.get<AtsOptimization[]>(STORAGE_KEYS.OPTIMIZATIONS)) ?? [];
}

export async function saveOptions(opts: Options): Promise<void> {
  await storage.set(STORAGE_KEYS.OPTS, opts);
}

export async function loadOptions(): Promise<Options | undefined> {
  return storage.get<Options>(STORAGE_KEYS.OPTS);
}

export async function saveGeneratedResume(markdown: string): Promise<void> {
  await storage.set(STORAGE_KEYS.GENERATED_RESUME, markdown);
}

export async function loadGeneratedResume(): Promise<string | undefined> {
  return storage.get<string>(STORAGE_KEYS.GENERATED_RESUME);
}

export async function saveGeneratedCoverLetter(markdown: string): Promise<void> {
  await storage.set(STORAGE_KEYS.GENERATED_COVER_LETTER, markdown);
}

export async function loadGeneratedCoverLetter(): Promise<string | undefined> {
  return storage.get<string>(STORAGE_KEYS.GENERATED_COVER_LETTER);
}

// Job Applications
export async function loadJobApplications(): Promise<JobApplication[]> {
  return (await storage.get<JobApplication[]>(STORAGE_KEYS.JOB_APPLICATIONS)) ?? [];
}

export async function saveJobApplication(application: JobApplication): Promise<void> {
  const applications = await loadJobApplications();
  const idx = applications.findIndex((a) => a.id === application.id);
  
  application.updatedAt = new Date().toISOString();
  
  if (idx >= 0) {
    applications[idx] = application;
  } else {
    application.createdAt = new Date().toISOString();
    applications.push(application);
  }
  
  await storage.set(STORAGE_KEYS.JOB_APPLICATIONS, applications);
}

export async function deleteJobApplication(id: string): Promise<void> {
  const applications = await loadJobApplications();
  const filtered = applications.filter((a) => a.id !== id);
  await storage.set(STORAGE_KEYS.JOB_APPLICATIONS, filtered);
}

export async function getJobApplication(id: string): Promise<JobApplication | undefined> {
  const applications = await loadJobApplications();
  return applications.find((a) => a.id === id);
}

export async function updateApplicationStatus(
  id: string,
  status: JobApplication['status'],
  note?: string
): Promise<void> {
  const application = await getJobApplication(id);
  if (!application) return;

  application.status = status;
  application.updatedAt = new Date().toISOString();

  // Add to timeline
  if (!application.timeline) application.timeline = [];
  application.timeline.push({
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    status,
    note,
    type: 'status_change',
  });

  await saveJobApplication(application);
}
