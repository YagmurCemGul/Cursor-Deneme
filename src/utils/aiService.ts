import { CVData, ATSOptimization } from '../types';
import { createAIProvider, AIConfig, AIProviderAdapter } from './aiProviders';

export class AIService {
  private provider: AIProviderAdapter | null = null;

  constructor(config?: AIConfig) {
    if (config && config.apiKey) {
      try {
        this.provider = createAIProvider(config);
      } catch (error) {
        console.error('Failed to initialize AI provider:', error);
        throw new Error('AI provider initialization failed. Please check your API configuration.');
      }
    }
  }

  /**
   * Update the AI provider configuration
   */
  updateConfig(config: AIConfig): void {
    try {
      this.provider = createAIProvider(config);
    } catch (error) {
      console.error('Failed to update AI provider:', error);
      throw error;
    }
  }

  /**
   * Check if AI provider is configured
   */
  isConfigured(): boolean {
    return this.provider !== null;
  }

  async optimizeCV(cvData: CVData, jobDescription: string): Promise<{ optimizedCV: CVData; optimizations: ATSOptimization[] }> {
    // Ensure provider is configured
    if (!this.provider) {
      throw new Error('AI provider not configured. Please set up your AI API key in settings.');
    }

    // Validate inputs
    if (!cvData || !jobDescription) {
      throw new Error('Invalid input: CV data and job description are required.');
    }

    if (jobDescription.trim().length < 50) {
      throw new Error('Job description is too short. Please provide a detailed job description.');
    }

    try {
      return await this.provider.optimizeCV(cvData, jobDescription);
    } catch (error) {
      console.error('AI provider error during CV optimization:', error);
      throw new Error(`Failed to optimize CV: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API key and try again.`);
    }
  }

  async generateCoverLetter(cvData: CVData, jobDescription: string, extraPrompt?: string): Promise<string> {
    // Ensure provider is configured
    if (!this.provider) {
      throw new Error('AI provider not configured. Please set up your AI API key in settings.');
    }

    // Validate inputs
    if (!cvData || !cvData.personalInfo || !cvData.personalInfo.firstName) {
      throw new Error('Invalid CV data: Personal information is required.');
    }

    if (!jobDescription || jobDescription.trim().length < 50) {
      throw new Error('Job description is too short. Please provide a detailed job description.');
    }

    try {
      return await this.provider.generateCoverLetter(cvData, jobDescription, extraPrompt);
    } catch (error) {
      console.error('AI provider error during cover letter generation:', error);
      throw new Error(`Failed to generate cover letter: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API key and try again.`);
    }
  }

}

// Export singleton instance (will be initialized with proper config from popup)
export const aiService = new AIService();