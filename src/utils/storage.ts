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

  // Template Enhancement Features
  static async saveTemplateMetadata(templateId: string, metadata: import('../types').TemplateMetadata): Promise<void> {
    const { templatesMetadata = {} } = await chrome.storage.local.get('templatesMetadata');
    templatesMetadata[templateId] = metadata;
    await chrome.storage.local.set({ templatesMetadata });
  }

  static async getTemplateMetadata(templateId: string): Promise<import('../types').TemplateMetadata | null> {
    const { templatesMetadata = {} } = await chrome.storage.local.get('templatesMetadata');
    return templatesMetadata[templateId] || null;
  }

  static async getAllTemplatesMetadata(): Promise<Record<string, import('../types').TemplateMetadata>> {
    const { templatesMetadata = {} } = await chrome.storage.local.get('templatesMetadata');
    return templatesMetadata;
  }

  static async toggleTemplateFavorite(templateId: string): Promise<void> {
    const metadata = await this.getTemplateMetadata(templateId) || {
      id: templateId,
      isFavorite: false,
      usageCount: 0,
    };
    metadata.isFavorite = !metadata.isFavorite;
    await this.saveTemplateMetadata(templateId, metadata);
  }

  static async recordTemplateUsage(analytics: import('../types').TemplateUsageAnalytics): Promise<void> {
    const { templateUsageAnalytics = [] } = await chrome.storage.local.get('templateUsageAnalytics');
    templateUsageAnalytics.push(analytics);
    
    // Keep only last 500 analytics entries
    const trimmed = templateUsageAnalytics.slice(-500);
    await chrome.storage.local.set({ templateUsageAnalytics: trimmed });

    // Update template metadata usage count
    const metadata = await this.getTemplateMetadata(analytics.templateId) || {
      id: analytics.templateId,
      isFavorite: false,
      usageCount: 0,
    };
    metadata.usageCount = (metadata.usageCount || 0) + 1;
    metadata.lastUsed = analytics.timestamp;
    metadata.industry = analytics.context?.industry;
    await this.saveTemplateMetadata(analytics.templateId, metadata);
  }

  static async getTemplateUsageAnalytics(): Promise<import('../types').TemplateUsageAnalytics[]> {
    const { templateUsageAnalytics = [] } = await chrome.storage.local.get('templateUsageAnalytics');
    return templateUsageAnalytics.sort((a: import('../types').TemplateUsageAnalytics, b: import('../types').TemplateUsageAnalytics) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  static async saveCustomTemplate(template: import('../types').CustomTemplate): Promise<void> {
    const { customTemplates = [] } = await chrome.storage.local.get('customTemplates');
    const existingIndex = customTemplates.findIndex((t: import('../types').CustomTemplate) => t.id === template.id);

    if (existingIndex >= 0) {
      customTemplates[existingIndex] = { ...template, updatedAt: new Date().toISOString() };
    } else {
      customTemplates.push(template);
    }

    await chrome.storage.local.set({ customTemplates });
  }

  static async getCustomTemplates(type?: 'cv' | 'cover-letter' | 'description'): Promise<import('../types').CustomTemplate[]> {
    const { customTemplates = [] } = await chrome.storage.local.get('customTemplates');
    return type 
      ? customTemplates.filter((t: import('../types').CustomTemplate) => t.type === type)
      : customTemplates;
  }

  static async deleteCustomTemplate(templateId: string): Promise<void> {
    const { customTemplates = [] } = await chrome.storage.local.get('customTemplates');
    const filtered = customTemplates.filter((t: import('../types').CustomTemplate) => t.id !== templateId);
    await chrome.storage.local.set({ customTemplates: filtered });
  }

  // Template Ratings and Reviews
  static async saveTemplateRating(rating: import('../types').TemplateRating): Promise<void> {
    const { templateRatings = [] } = await chrome.storage.local.get('templateRatings');
    const existingIndex = templateRatings.findIndex((r: import('../types').TemplateRating) => r.id === rating.id);

    if (existingIndex >= 0) {
      templateRatings[existingIndex] = { ...rating, updatedAt: new Date().toISOString() };
    } else {
      templateRatings.push(rating);
    }

    await chrome.storage.local.set({ templateRatings });
  }

  static async getTemplateRatings(templateId?: string): Promise<import('../types').TemplateRating[]> {
    const { templateRatings = [] } = await chrome.storage.local.get('templateRatings');
    return templateId 
      ? templateRatings.filter((r: import('../types').TemplateRating) => r.templateId === templateId)
      : templateRatings;
  }

  static async getAverageRating(templateId: string): Promise<{ average: number; count: number }> {
    const ratings = await this.getTemplateRatings(templateId);
    if (ratings.length === 0) return { average: 0, count: 0 };
    
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return {
      average: sum / ratings.length,
      count: ratings.length
    };
  }

  static async saveTemplateReview(review: import('../types').TemplateReview): Promise<void> {
    const { templateReviews = [] } = await chrome.storage.local.get('templateReviews');
    const existingIndex = templateReviews.findIndex((r: import('../types').TemplateReview) => r.id === review.id);

    if (existingIndex >= 0) {
      templateReviews[existingIndex] = { ...review, updatedAt: new Date().toISOString() };
    } else {
      templateReviews.push(review);
    }

    await chrome.storage.local.set({ templateReviews });
  }

  static async getTemplateReviews(templateId?: string): Promise<import('../types').TemplateReview[]> {
    const { templateReviews = [] } = await chrome.storage.local.get('templateReviews');
    const filtered = templateId 
      ? templateReviews.filter((r: import('../types').TemplateReview) => r.templateId === templateId)
      : templateReviews;
    
    // Sort by helpful votes and date
    return filtered.sort((a: import('../types').TemplateReview, b: import('../types').TemplateReview) => {
      if (b.helpful !== a.helpful) return b.helpful - a.helpful;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  static async voteReviewHelpful(reviewId: string, helpful: boolean): Promise<void> {
    const { templateReviews = [] } = await chrome.storage.local.get('templateReviews');
    const review = templateReviews.find((r: import('../types').TemplateReview) => r.id === reviewId);
    
    if (review) {
      if (helpful) {
        review.helpful = (review.helpful || 0) + 1;
      } else {
        review.notHelpful = (review.notHelpful || 0) + 1;
      }
      await chrome.storage.local.set({ templateReviews });
    }
  }

  // Job Application Tracking
  static async saveJobApplication(application: import('../types').JobApplication): Promise<void> {
    const { jobApplications = [] } = await chrome.storage.local.get('jobApplications');
    const existingIndex = jobApplications.findIndex((a: import('../types').JobApplication) => a.id === application.id);

    if (existingIndex >= 0) {
      jobApplications[existingIndex] = application;
    } else {
      jobApplications.push(application);
    }

    await chrome.storage.local.set({ jobApplications });
    
    // Update success metrics
    await this.updateTemplateSuccessMetrics(application.templateId);
  }

  static async getJobApplications(templateId?: string): Promise<import('../types').JobApplication[]> {
    const { jobApplications = [] } = await chrome.storage.local.get('jobApplications');
    return templateId 
      ? jobApplications.filter((a: import('../types').JobApplication) => a.templateId === templateId)
      : jobApplications;
  }

  static async updateJobApplicationStatus(
    applicationId: string, 
    status: import('../types').JobApplication['status']
  ): Promise<void> {
    const { jobApplications = [] } = await chrome.storage.local.get('jobApplications');
    const application = jobApplications.find((a: import('../types').JobApplication) => a.id === applicationId);
    
    if (application) {
      application.status = status;
      application.statusDate = new Date().toISOString();
      await chrome.storage.local.set({ jobApplications });
      await this.updateTemplateSuccessMetrics(application.templateId);
    }
  }

  static async updateTemplateSuccessMetrics(templateId: string): Promise<void> {
    const applications = await this.getJobApplications(templateId);
    
    if (applications.length === 0) return;

    const interviews = applications.filter(a => 
      ['interview', 'offer', 'accepted'].includes(a.status)
    ).length;
    
    const offers = applications.filter(a => 
      ['offer', 'accepted'].includes(a.status)
    ).length;
    
    const accepted = applications.filter(a => a.status === 'accepted').length;

    const industries = applications.reduce((acc, app) => {
      acc[app.industry] = (acc[app.industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const companies = applications.reduce((acc, app) => {
      acc[app.company] = (acc[app.company] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const metrics: import('../types').TemplateSuccessMetrics = {
      templateId,
      totalApplications: applications.length,
      interviewRate: (interviews / applications.length) * 100,
      offerRate: (offers / applications.length) * 100,
      acceptanceRate: (accepted / applications.length) * 100,
      averageResponseTime: 0, // Calculate if needed
      topIndustries: Object.entries(industries)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([ind]) => ind),
      topCompanies: Object.entries(companies)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([comp]) => comp),
      lastUpdated: new Date().toISOString()
    };

    const { templateSuccessMetrics = {} } = await chrome.storage.local.get('templateSuccessMetrics');
    templateSuccessMetrics[templateId] = metrics;
    await chrome.storage.local.set({ templateSuccessMetrics });
  }

  static async getTemplateSuccessMetrics(templateId: string): Promise<import('../types').TemplateSuccessMetrics | null> {
    const { templateSuccessMetrics = {} } = await chrome.storage.local.get('templateSuccessMetrics');
    return templateSuccessMetrics[templateId] || null;
  }

  // Template Export/Import
  static async exportCustomTemplates(templateIds?: string[]): Promise<string> {
    const templates = await this.getCustomTemplates();
    const toExport = templateIds 
      ? templates.filter(t => templateIds.includes(t.id))
      : templates;

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      templates: toExport,
      metadata: {
        count: toExport.length,
        types: [...new Set(toExport.map(t => t.type))]
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  static async importCustomTemplates(jsonData: string): Promise<{ success: number; failed: number; errors: string[] }> {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.templates || !Array.isArray(importData.templates)) {
        throw new Error('Invalid template data format');
      }

      const results = { success: 0, failed: 0, errors: [] as string[] };
      
      for (const template of importData.templates) {
        try {
          // Validate required fields
          if (!template.name || !template.type || !template.content) {
            throw new Error(`Invalid template: ${template.name || 'unnamed'}`);
          }

          // Generate new ID to avoid conflicts
          const newTemplate = {
            ...template,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          await this.saveCustomTemplate(newTemplate);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`${template.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return results;
    } catch (error) {
      return {
        success: 0,
        failed: 1,
        errors: [error instanceof Error ? error.message : 'Failed to parse import data']
      };
    }
  }

  // Template Folders
  static async saveTemplateFolder(folder: import('../types').TemplateFolder): Promise<void> {
    const { templateFolders = [] } = await chrome.storage.local.get('templateFolders');
    const existingIndex = templateFolders.findIndex((f: import('../types').TemplateFolder) => f.id === folder.id);

    if (existingIndex >= 0) {
      templateFolders[existingIndex] = { ...folder, updatedAt: new Date().toISOString() };
    } else {
      templateFolders.push(folder);
    }

    await chrome.storage.local.set({ templateFolders });
  }

  static async getTemplateFolders(): Promise<import('../types').TemplateFolder[]> {
    const { templateFolders = [] } = await chrome.storage.local.get('templateFolders');
    return templateFolders.sort((a: import('../types').TemplateFolder, b: import('../types').TemplateFolder) => a.order - b.order);
  }

  static async deleteTemplateFolder(folderId: string): Promise<void> {
    const { templateFolders = [] } = await chrome.storage.local.get('templateFolders');
    const filtered = templateFolders.filter((f: import('../types').TemplateFolder) => f.id !== folderId);
    await chrome.storage.local.set({ templateFolders: filtered });

    // Remove folder reference from templates
    const templates = await this.getCustomTemplates();
    const updated = templates.map(t => {
      if (t.folderId === folderId) {
        return { ...t, folderId: undefined };
      }
      return t;
    });
    
    await chrome.storage.local.set({ customTemplates: updated });
  }

  // Template Categories
  static async saveTemplateCategory(category: import('../types').TemplateCategory): Promise<void> {
    const { templateCategories = [] } = await chrome.storage.local.get('templateCategories');
    const existingIndex = templateCategories.findIndex((c: import('../types').TemplateCategory) => c.id === category.id);

    if (existingIndex >= 0) {
      templateCategories[existingIndex] = { ...category, updatedAt: new Date().toISOString() };
    } else {
      templateCategories.push(category);
    }

    await chrome.storage.local.set({ templateCategories });
  }

  static async getTemplateCategories(): Promise<import('../types').TemplateCategory[]> {
    const { templateCategories = [] } = await chrome.storage.local.get('templateCategories');
    return templateCategories;
  }

  static async deleteTemplateCategory(categoryId: string): Promise<void> {
    const { templateCategories = [] } = await chrome.storage.local.get('templateCategories');
    const filtered = templateCategories.filter((c: import('../types').TemplateCategory) => c.id !== categoryId);
    await chrome.storage.local.set({ templateCategories: filtered });
  }

  // Enhanced Analytics
  static async getAnalyticsByDateRange(
    dateRange: import('../types').AnalyticsDateRange
  ): Promise<import('../types').TemplateUsageAnalytics[]> {
    const allAnalytics = await this.getTemplateUsageAnalytics();
    const start = new Date(dateRange.start).getTime();
    const end = new Date(dateRange.end).getTime();

    return allAnalytics.filter(a => {
      const timestamp = new Date(a.timestamp).getTime();
      return timestamp >= start && timestamp <= end;
    });
  }

  static async exportAnalytics(options: import('../types').AnalyticsExportOptions): Promise<string> {
    const analytics = await this.getAnalyticsByDateRange(options.dateRange);
    const metadata = await this.getAllTemplatesMetadata();
    
    if (options.format === 'json') {
      return JSON.stringify({
        dateRange: options.dateRange,
        exportDate: new Date().toISOString(),
        analytics,
        metadata,
        summary: {
          totalUsage: analytics.length,
          uniqueTemplates: new Set(analytics.map(a => a.templateId)).size,
          dateRange: options.dateRange
        }
      }, null, 2);
    } else if (options.format === 'csv') {
      const headers = ['Date', 'Template ID', 'Template Type', 'Industry', 'Job Title', 'Section'];
      const rows = analytics.map(a => [
        new Date(a.timestamp).toLocaleString(),
        a.templateId,
        a.templateType,
        a.context?.industry || '',
        a.context?.jobTitle || '',
        a.context?.section || ''
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    return JSON.stringify(analytics);
  }
}
