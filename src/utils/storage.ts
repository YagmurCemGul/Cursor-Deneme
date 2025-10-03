import { CVProfile, CVTemplate, SavedPrompt } from '../types';

export class StorageService {
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

  static async saveAPIKey(apiKey: string): Promise<void> {
    await chrome.storage.local.set({ apiKey });
  }

  static async getAPIKey(): Promise<string | null> {
    const { apiKey = null } = await chrome.storage.local.get('apiKey');
    return apiKey;
  }
}
