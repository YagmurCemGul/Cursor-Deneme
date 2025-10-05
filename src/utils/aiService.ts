import { CVData, ATSOptimization } from '../types';
import { createAIProvider, AIConfig, AIProviderAdapter } from './aiProviders';
import { logger } from './logger';
import { StorageService } from './storage';

export class AIService {
  private provider: AIProviderAdapter | null = null;

  constructor(config?: AIConfig) {
    if (config && config.apiKey) {
      try {
        this.provider = createAIProvider(config);
      } catch (error) {
        logger.error('Failed to initialize AI provider:', error);
        throw new Error('AI provider initialization failed. Please check your API configuration.');
      }
    }
  }

  /**
   * Initialize from storage (for use in popup/background)
   */
  static async initFromStorage(): Promise<AIService> {
    const provider = await StorageService.getAIProvider();
    const apiKeys = await StorageService.getAPIKeys();
    const apiKey = apiKeys[provider];

    if (!apiKey) {
      throw new Error(`No API key found for ${provider}. Please configure your API key in settings.`);
    }

    const config: AIConfig = {
      provider,
      apiKey
    };

    return new AIService(config);
  }

  /**
   * Update the AI provider configuration
   */
  updateConfig(config: AIConfig): void {
    try {
      this.provider = createAIProvider(config);
    } catch (error) {
      logger.error('Failed to update AI provider:', error);
      throw error;
    }
  }

  /**
   * Simple text generation utility for one-shot prompts
   * Used across modules for lightweight tasks (translation, suggestions, etc.)
   */
  static async generateText(
    prompt: string,
    apiKey: string,
    provider: 'openai' | 'gemini' | 'claude',
    options?: {
      systemPrompt?: string;
      model?: string;
      temperature?: number;
      maxTokens?: number;
      signal?: AbortSignal;
    }
  ): Promise<string> {
    const systemPrompt = options?.systemPrompt;
    const model = options?.model || (
      provider === 'openai'
        ? 'gpt-4o-mini'
        : provider === 'gemini'
          ? 'gemini-pro'
          : 'claude-3-haiku-20240307'
    );
    const temperature = options?.temperature ?? 0.3;
    const maxTokens = options?.maxTokens ?? 1500;

    try {
      if (provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model,
            messages: [
              ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
              { role: 'user', content: prompt }
            ],
            temperature,
            max_tokens: maxTokens
          }),
          signal: options?.signal
        });

        const errorText = !response.ok ? await response.text().catch(() => '') : '';
        if (!response.ok) {
          let errorMessage = errorText;
          let errorType = 'unknown';
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error?.message || errorText;
            errorType = errorJson.error?.type || 'unknown';
          } catch { /* noop */ }

          if (response.status === 429) {
            if (
              errorMessage.includes('quota') ||
              errorMessage.includes('insufficient_quota') ||
              errorType === 'insufficient_quota'
            ) {
              throw new Error(
                `OpenAI quota exceeded: ${errorMessage}\n\n` +
                `Check usage at https://platform.openai.com/usage and billing at https://platform.openai.com/account/billing`
              );
            }
            throw new Error(
              `OpenAI rate limit exceeded (429): ${errorMessage}. Please slow down or upgrade limits.`
            );
          }

          if (response.status === 401) {
            throw new Error('Invalid API key (401). Please verify your OpenAI API key.');
          }

          if (response.status === 503) {
            throw new Error('OpenAI service unavailable (503). Please try again later.');
          }

          throw new Error(`OpenAI API error (${response.status}): ${errorMessage || response.statusText}`);
        }

        const data = await response.json();
        const content: string | undefined = data.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error('No response from OpenAI');
        }
        return content.trim();
      }

      if (provider === 'gemini') {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt }] }],
            generationConfig: {
              temperature,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: maxTokens
            }
          }),
          signal: options?.signal
        });

        if (!response.ok) {
          const error = await response.text().catch(() => '');
          if (response.status === 429) {
            throw new Error('Gemini rate limit exceeded (429). Please wait and try again.');
          }
          if (response.status === 401) {
            throw new Error('Invalid API key (401). Please verify your Google API key.');
          }
          throw new Error(`Gemini API error (${response.status}): ${error || response.statusText}`);
        }

        const data = await response.json();
        const content: string | undefined = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!content) {
          throw new Error('No response from Gemini');
        }
        return content.trim();
      }

      // provider === 'claude'
      {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model,
            max_tokens: maxTokens,
            temperature,
            ...(systemPrompt ? { system: systemPrompt } : {}),
            messages: [{ role: 'user', content: prompt }]
          }),
          signal: options?.signal
        });

        if (!response.ok) {
          const error = await response.text().catch(() => '');
          if (response.status === 429) {
            throw new Error('Claude rate limit exceeded (429). Please wait and try again.');
          }
          if (response.status === 401) {
            throw new Error('Invalid API key (401). Please verify your Anthropic API key.');
          }
          throw new Error(`Claude API error (${response.status}): ${error || response.statusText}`);
        }

        const data = await response.json();
        const content: string | undefined = data.content?.[0]?.text;
        if (!content) {
          throw new Error('No response from Claude');
        }
        return content.trim();
      }
    } catch (error) {
      logger.error('AIService.generateText error:', error);
      throw error instanceof Error ? error : new Error('Unknown error generating text');
    }
  }

  /**
   * Clear the configured AI provider (used when API keys are removed)
   */
  clearConfig(): void {
    this.provider = null;
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
      logger.error('AI provider error during CV optimization:', error);
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
      logger.error('AI provider error during cover letter generation:', error);
      throw new Error(`Failed to generate cover letter: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API key and try again.`);
    }
  }

}

// Export singleton instance (will be initialized with proper config from popup)
export const aiService = new AIService();