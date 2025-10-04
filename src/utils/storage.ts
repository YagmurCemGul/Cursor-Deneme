import { CVProfile, CVTemplate, SavedPrompt } from '../types';

export class StorageService {
  // Draft autosave/load for preserving work-in-progress across sessions
  static async saveDraft(draft: unknown): Promise<void> {
    await chrome.storage.local.set({ draft });
  }

  static async getDraft<T = unknown>(): Promise<T | null> {
    const { draft = null } = await chrome.storage.local.get('draft');
    return draft as T | null;
  }

  static async clearDraft(): Promise<void> {
    await chrome.storage.local.remove('draft');
  }

  // UI settings: theme, language, template selection, etc.
  static async saveSettings(settings: Record<string, unknown>): Promise<void> {
    await chrome.storage.local.set({ settings });
  }

  static async getSettings<T = Record<string, unknown>>(): Promise<T | null> {
    const { settings = null } = await chrome.storage.local.get('settings');
    return settings as T | null;
  }
  static async saveProfile(profile: CVProfile): Promise<void> {
    const { profiles = [] } = await chrome.storage.local.get('profiles');
    const existingIndex = profiles.findIndex((p: CVProfile) => p.id === profile.id);

    if (existingIndex >= 0) {
      profiles[existingIndex] = profile;
    } else {
      profiles.push(profile);
    }

    await chrome.storage.local.set({ profiles });
  }

  static async getProfiles(): Promise<CVProfile[]> {
    const { profiles = [] } = await chrome.storage.local.get('profiles');
    return profiles;
  }

  static async deleteProfile(profileId: string): Promise<void> {
    const { profiles = [] } = await chrome.storage.local.get('profiles');
    const filtered = profiles.filter((p: CVProfile) => p.id !== profileId);
    await chrome.storage.local.set({ profiles: filtered });
  }

  static async saveTemplate(template: CVTemplate): Promise<void> {
    const { templates = [] } = await chrome.storage.local.get('templates');
    const existingIndex = templates.findIndex((t: CVTemplate) => t.id === template.id);

    if (existingIndex >= 0) {
      templates[existingIndex] = template;
    } else {
      templates.push(template);
    }

    await chrome.storage.local.set({ templates });
  }

  static async getTemplates(): Promise<CVTemplate[]> {
    const { templates = [] } = await chrome.storage.local.get('templates');
    return templates;
  }

  static async savePrompt(prompt: SavedPrompt): Promise<void> {
    const { prompts = [] } = await chrome.storage.local.get('prompts');
    const existingIndex = prompts.findIndex((p: SavedPrompt) => p.id === prompt.id);

    if (existingIndex >= 0) {
      prompts[existingIndex] = prompt;
    } else {
      prompts.push(prompt);
    }

    await chrome.storage.local.set({ prompts });
  }

  static async getPrompts(): Promise<SavedPrompt[]> {
    const { prompts = [] } = await chrome.storage.local.get('prompts');
    return prompts;
  }

  static async deletePrompt(promptId: string): Promise<void> {
    const { prompts = [] } = await chrome.storage.local.get('prompts');
    const filtered = prompts.filter((p: SavedPrompt) => p.id !== promptId);
    await chrome.storage.local.set({ prompts: filtered });
  }

  /**
   * Saves an API key to storage
   * 
   * @param {string} apiKey - The API key to save
   * @returns {Promise<void>}
   * @public
   * @static
   * @async
   */
  static async saveAPIKey(apiKey: string): Promise<void> {
    await chrome.storage.local.set({ apiKey });
  }

  static async getAPIKey(): Promise<string | null> {
    const { apiKey = null } = await chrome.storage.local.get('apiKey');
    return apiKey;
  }

  // Multi-AI Provider API Keys
  static async saveAPIKeys(apiKeys: import('../types/storage').AIApiKeys): Promise<void> {
    await chrome.storage.local.set({ aiApiKeys: apiKeys });
  }

  static async getAPIKeys(): Promise<import('../types/storage').AIApiKeys> {
    const { aiApiKeys = {} } = await chrome.storage.local.get('aiApiKeys');
    return aiApiKeys;
  }

  static async saveAIProvider(provider: 'openai' | 'gemini' | 'claude'): Promise<void> {
    const settings = (await this.getSettings()) || {};
    settings.aiProvider = provider;
    await this.saveSettings(settings);
  }

  static async getAIProvider(): Promise<'openai' | 'gemini' | 'claude'> {
    const settings = (await this.getSettings()) as any;
    return settings?.aiProvider || 'openai';
  }

  static async saveAIModel(model: string): Promise<void> {
    const settings = (await this.getSettings()) || {};
    (settings as any).aiModel = model;
    await this.saveSettings(settings);
  }

  static async getAIModel(): Promise<string | undefined> {
    const settings = (await this.getSettings()) as any;
    return settings?.aiModel;
  }

  // Profile Version History
  static async saveProfileVersion(version: import('../types').ProfileVersion): Promise<void> {
    const { profileVersions = [] } = await chrome.storage.local.get('profileVersions');
    profileVersions.push(version);
    // Keep only last 20 versions per profile
    const filteredVersions = profileVersions
      .filter((v: any) => v.profileId === version.profileId)
      .sort((a: any, b: any) => b.versionNumber - a.versionNumber)
      .slice(0, 20);
    
    const otherVersions = profileVersions.filter((v: any) => v.profileId !== version.profileId);
    await chrome.storage.local.set({ profileVersions: [...otherVersions, ...filteredVersions] });
  }

  static async getProfileVersions(profileId: string): Promise<import('../types').ProfileVersion[]> {
    const { profileVersions = [] } = await chrome.storage.local.get('profileVersions');
    return profileVersions
      .filter((v: import('../types').ProfileVersion) => v.profileId === profileId)
      .sort((a: import('../types').ProfileVersion, b: import('../types').ProfileVersion) => 
        b.versionNumber - a.versionNumber
      );
  }

  static async deleteProfileVersions(profileId: string): Promise<void> {
    const { profileVersions = [] } = await chrome.storage.local.get('profileVersions');
    const filtered = profileVersions.filter((v: import('../types').ProfileVersion) => v.profileId !== profileId);
    await chrome.storage.local.set({ profileVersions: filtered });
  }

  // Optimization Analytics
  static async saveAnalytics(analytics: import('../types').OptimizationAnalytics): Promise<void> {
    const { analyticsData = [] } = await chrome.storage.local.get('analyticsData');
    analyticsData.push(analytics);
    // Keep only last 100 analytics entries
    const trimmed = analyticsData.slice(-100);
    await chrome.storage.local.set({ analyticsData: trimmed });
  }

  static async getAnalytics(): Promise<import('../types').OptimizationAnalytics[]> {
    const { analyticsData = [] } = await chrome.storage.local.get('analyticsData');
    return analyticsData.sort((a: import('../types').OptimizationAnalytics, b: import('../types').OptimizationAnalytics) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  static async clearAnalytics(): Promise<void> {
    await chrome.storage.local.set({ analyticsData: [] });
  }

  // Job Description Library
  static async saveJobDescription(jobDesc: import('../types').SavedJobDescription): Promise<void> {
    const { jobDescriptions = [] } = await chrome.storage.local.get('jobDescriptions');
    const existingIndex = jobDescriptions.findIndex((j: import('../types').SavedJobDescription) => j.id === jobDesc.id);

    if (existingIndex >= 0) {
      jobDescriptions[existingIndex] = { ...jobDesc, updatedAt: new Date().toISOString() };
    } else {
      jobDescriptions.push(jobDesc);
    }

    await chrome.storage.local.set({ jobDescriptions });
  }

  static async getJobDescriptions(): Promise<import('../types').SavedJobDescription[]> {
    const { jobDescriptions = [] } = await chrome.storage.local.get('jobDescriptions');
    return jobDescriptions.sort((a: import('../types').SavedJobDescription, b: import('../types').SavedJobDescription) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  static async deleteJobDescription(jobDescId: string): Promise<void> {
    const { jobDescriptions = [] } = await chrome.storage.local.get('jobDescriptions');
    const filtered = jobDescriptions.filter((j: import('../types').SavedJobDescription) => j.id !== jobDescId);
    await chrome.storage.local.set({ jobDescriptions: filtered });
  }

  static async incrementJobDescriptionUsage(jobDescId: string): Promise<void> {
    const { jobDescriptions = [] } = await chrome.storage.local.get('jobDescriptions');
    const jobDesc = jobDescriptions.find((j: import('../types').SavedJobDescription) => j.id === jobDescId);
    
    if (jobDesc) {
      jobDesc.usageCount = (jobDesc.usageCount || 0) + 1;
      jobDesc.updatedAt = new Date().toISOString();
      await chrome.storage.local.set({ jobDescriptions });
    }
  }

  // Error Analytics
  static async saveError(error: import('../types').ErrorLog): Promise<void> {
    const { errorLogs = [] } = await chrome.storage.local.get('errorLogs');
    errorLogs.push(error);
    // Keep only last 500 error logs
    const trimmed = errorLogs.slice(-500);
    await chrome.storage.local.set({ errorLogs: trimmed });
  }

  static async getErrorLogs(): Promise<import('../types').ErrorLog[]> {
    const { errorLogs = [] } = await chrome.storage.local.get('errorLogs');
    return errorLogs.sort((a: import('../types').ErrorLog, b: import('../types').ErrorLog) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  static async clearErrorLogs(): Promise<void> {
    await chrome.storage.local.set({ errorLogs: [] });
  }

  static async markErrorResolved(errorId: string): Promise<void> {
    const { errorLogs = [] } = await chrome.storage.local.get('errorLogs');
    const error = errorLogs.find((e: import('../types').ErrorLog) => e.id === errorId);
    
    if (error) {
      error.resolved = true;
      await chrome.storage.local.set({ errorLogs });
    }
  }

  static async getErrorAnalytics(): Promise<import('../types').ErrorAnalytics> {
    const errorLogs = await this.getErrorLogs();
    
    const totalErrors = errorLogs.length;
    const errorsByType: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};
    const errorsByComponent: Record<string, number> = {};
    const errorTrendsMap: Record<string, number> = {};

    errorLogs.forEach((error) => {
      // Count by type
      errorsByType[error.errorType] = (errorsByType[error.errorType] || 0) + 1;
      
      // Count by severity
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
      
      // Count by component
      if (error.component) {
        errorsByComponent[error.component] = (errorsByComponent[error.component] || 0) + 1;
      }
      
      // Count by date for trends
      const date = new Date(error.timestamp).toISOString().split('T')[0];
      errorTrendsMap[date] = (errorTrendsMap[date] || 0) + 1;
    });

    const errorTrends = Object.entries(errorTrendsMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalErrors,
      errorsByType,
      errorsBySeverity,
      errorsByComponent,
      recentErrors: errorLogs.slice(0, 20),
      errorTrends,
    };
  }
}
