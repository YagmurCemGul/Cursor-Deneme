/**
 * Custom Prompts Manager
 * Manage and use custom prompt templates
 */

import { CustomPromptTemplate } from '../types/storage';
import { logger } from './logger';

export class CustomPromptsManager {
  /**
   * Get all custom prompts
   */
  static async getAllPrompts(): Promise<CustomPromptTemplate[]> {
    try {
      const result = await chrome.storage.local.get('customPrompts');
      return result.customPrompts || [];
    } catch (error) {
      logger.error('Failed to get custom prompts:', error);
      return [];
    }
  }

  /**
   * Get prompts by category
   */
  static async getPromptsByCategory(
    category: 'cv-optimization' | 'cover-letter' | 'general'
  ): Promise<CustomPromptTemplate[]> {
    const allPrompts = await this.getAllPrompts();
    return allPrompts.filter((p) => p.category === category);
  }

  /**
   * Get a specific prompt
   */
  static async getPrompt(id: string): Promise<CustomPromptTemplate | null> {
    const prompts = await this.getAllPrompts();
    return prompts.find((p) => p.id === id) || null;
  }

  /**
   * Create a new custom prompt
   */
  static async createPrompt(
    prompt: Omit<CustomPromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>
  ): Promise<string> {
    try {
      const newPrompt: CustomPromptTemplate = {
        id: `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...prompt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
      };

      const prompts = await this.getAllPrompts();
      prompts.push(newPrompt);
      
      await chrome.storage.local.set({ customPrompts: prompts });
      logger.info('Custom prompt created:', newPrompt.id);
      
      return newPrompt.id;
    } catch (error) {
      logger.error('Failed to create custom prompt:', error);
      throw error;
    }
  }

  /**
   * Update a custom prompt
   */
  static async updatePrompt(
    id: string,
    updates: Partial<Omit<CustomPromptTemplate, 'id' | 'createdAt' | 'usageCount'>>
  ): Promise<void> {
    try {
      const prompts = await this.getAllPrompts();
      const index = prompts.findIndex((p) => p.id === id);
      
      if (index === -1) {
        throw new Error('Prompt not found');
      }

      prompts[index] = {
        ...prompts[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await chrome.storage.local.set({ customPrompts: prompts });
      logger.info('Custom prompt updated:', id);
    } catch (error) {
      logger.error('Failed to update custom prompt:', error);
      throw error;
    }
  }

  /**
   * Delete a custom prompt
   */
  static async deletePrompt(id: string): Promise<void> {
    try {
      const prompts = await this.getAllPrompts();
      const filteredPrompts = prompts.filter((p) => p.id !== id);
      
      await chrome.storage.local.set({ customPrompts: filteredPrompts });
      logger.info('Custom prompt deleted:', id);
    } catch (error) {
      logger.error('Failed to delete custom prompt:', error);
      throw error;
    }
  }

  /**
   * Use a prompt and increment usage count
   */
  static async usePrompt(
    id: string,
    variables: Record<string, string>
  ): Promise<{ systemPrompt: string; userPrompt: string }> {
    const prompt = await this.getPrompt(id);
    
    if (!prompt) {
      throw new Error('Prompt not found');
    }

    // Replace variables in prompts
    let systemPrompt = prompt.systemPrompt;
    let userPrompt = prompt.userPromptTemplate;

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      systemPrompt = systemPrompt.replace(new RegExp(placeholder, 'g'), value);
      userPrompt = userPrompt.replace(new RegExp(placeholder, 'g'), value);
    });

    // Increment usage count
    try {
      const prompts = await this.getAllPrompts();
      const index = prompts.findIndex((p) => p.id === id);
      
      if (index >= 0) {
        prompts[index].usageCount++;
        await chrome.storage.local.set({ customPrompts: prompts });
      }
    } catch (error) {
      logger.error('Failed to increment usage count:', error);
    }

    return { systemPrompt, userPrompt };
  }

  /**
   * Export prompts to JSON
   */
  static async exportPrompts(): Promise<string> {
    const prompts = await this.getAllPrompts();
    return JSON.stringify(prompts, null, 2);
  }

  /**
   * Import prompts from JSON
   */
  static async importPrompts(jsonData: string, merge: boolean = false): Promise<number> {
    try {
      const importedPrompts: CustomPromptTemplate[] = JSON.parse(jsonData);
      
      if (!Array.isArray(importedPrompts)) {
        throw new Error('Invalid format: expected an array of prompts');
      }

      let existingPrompts = merge ? await this.getAllPrompts() : [];
      
      // Add imported prompts with new IDs to avoid conflicts
      const newPrompts = importedPrompts.map((p) => ({
        ...p,
        id: `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      existingPrompts.push(...newPrompts);
      
      await chrome.storage.local.set({ customPrompts: existingPrompts });
      logger.info(`Imported ${newPrompts.length} custom prompts`);
      
      return newPrompts.length;
    } catch (error) {
      logger.error('Failed to import custom prompts:', error);
      throw error;
    }
  }

  /**
   * Get default prompt templates
   */
  static getDefaultTemplates(): Array<Omit<CustomPromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>> {
    return [
      {
        name: 'Standard CV Optimization',
        description: 'Default CV optimization prompt with ATS focus',
        category: 'cv-optimization',
        systemPrompt: `You are an expert ATS optimizer and career consultant. Analyze CVs and provide specific, actionable optimization suggestions.`,
        userPromptTemplate: `Job Description:
{{jobDescription}}

CV Data:
{{cvData}}

Analyze this CV against the job description and provide specific optimizations in JSON format with an "optimizations" array.`,
        variables: ['jobDescription', 'cvData'],
      },
      {
        name: 'Senior Position CV Optimization',
        description: 'Optimized for senior and leadership roles',
        category: 'cv-optimization',
        systemPrompt: `You are an executive career consultant specializing in senior-level positions. Focus on leadership, strategic impact, and measurable business outcomes.`,
        userPromptTemplate: `Job Description for Senior Role:
{{jobDescription}}

CV Data:
{{cvData}}

Optimize this CV for a senior position, emphasizing leadership experience, strategic initiatives, and quantifiable business impact.`,
        variables: ['jobDescription', 'cvData'],
      },
      {
        name: 'Technical Role CV Optimization',
        description: 'Specialized for software engineering and technical positions',
        category: 'cv-optimization',
        systemPrompt: `You are a technical recruiter and engineering manager. Focus on technical skills, project complexity, technologies used, and technical impact.`,
        userPromptTemplate: `Technical Job Description:
{{jobDescription}}

CV Data:
{{cvData}}

Optimize this CV for a technical position, highlighting relevant technologies, architectural decisions, and technical achievements.`,
        variables: ['jobDescription', 'cvData'],
      },
      {
        name: 'Standard Cover Letter',
        description: 'Professional cover letter template',
        category: 'cover-letter',
        systemPrompt: `You are an expert cover letter writer. Create compelling, personalized cover letters that are concise (max 400 words) and professional.`,
        userPromptTemplate: `Job Description:
{{jobDescription}}

Candidate Information:
{{candidateInfo}}

{{extraInstructions}}

Write a professional cover letter that highlights relevant experience and shows enthusiasm for the role.`,
        variables: ['jobDescription', 'candidateInfo', 'extraInstructions'],
      },
      {
        name: 'Career Change Cover Letter',
        description: 'For candidates transitioning to a new field',
        category: 'cover-letter',
        systemPrompt: `You are a career transition specialist. Write cover letters that effectively communicate transferable skills and genuine motivation for career change.`,
        userPromptTemplate: `Job Description:
{{jobDescription}}

Candidate Background:
{{candidateInfo}}

Additional Context:
{{extraInstructions}}

Write a cover letter that addresses the career transition positively, highlighting transferable skills and genuine interest in the new field.`,
        variables: ['jobDescription', 'candidateInfo', 'extraInstructions'],
      },
    ];
  }

  /**
   * Initialize with default templates if none exist
   */
  static async initializeDefaults(): Promise<void> {
    const existing = await this.getAllPrompts();
    
    if (existing.length === 0) {
      const defaults = this.getDefaultTemplates();
      
      for (const template of defaults) {
        await this.createPrompt(template);
      }
      
      logger.info('Initialized default prompt templates');
    }
  }
}
