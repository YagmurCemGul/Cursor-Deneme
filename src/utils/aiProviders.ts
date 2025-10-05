/**
 * Multi-AI Provider Support
 * Supports OpenAI, Google Gemini, and Anthropic Claude
 */

import { CVData, ATSOptimization } from '../types';
import { logger } from './logger';

/**
 * Retry helper for API calls with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry on authentication or validation errors
      if (
        error.message?.includes('Invalid API key') ||
        error.message?.includes('Invalid request') ||
        error.message?.includes('blocked by safety') ||
        error.message?.includes('parse')
      ) {
        throw error;
      }

      // Only retry on network errors or server errors
      const shouldRetry =
        error.message?.includes('network') ||
        error.message?.includes('temporarily unavailable') ||
        error.message?.includes('503') ||
        error.message?.includes('502') ||
        error.message?.includes('504');

      if (!shouldRetry || attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      logger.info(`Retrying after ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Retry failed');
}

export type AIProvider = 'openai' | 'gemini' | 'claude' | 'azure-openai' | 'ollama';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  temperature?: number;
  azureEndpoint?: string; // For Azure OpenAI
  azureDeployment?: string; // For Azure OpenAI
  ollamaEndpoint?: string; // For Ollama (default: http://localhost:11434)
}

export interface AIProviderAdapter {
  optimizeCV(
    cvData: CVData,
    jobDescription: string
  ): Promise<{ optimizedCV: CVData; optimizations: ATSOptimization[] }>;
  generateCoverLetter(
    cvData: CVData,
    jobDescription: string,
    extraPrompt?: string
  ): Promise<string>;
}

/**
 * OpenAI Provider Implementation
 */
export class OpenAIProvider implements AIProviderAdapter {
  private apiKey: string;
  private model: string;
  private temperature: number;

  constructor(config: AIConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'gpt-4o-mini';
    this.temperature = config.temperature || 0.3;
  }

  async optimizeCV(
    cvData: CVData,
    jobDescription: string
  ): Promise<{ optimizedCV: CVData; optimizations: ATSOptimization[] }> {
    return retryWithBackoff(async () => {
      try {
        const systemPrompt = `You are an expert ATS (Applicant Tracking System) optimizer and career consultant. 
Your task is to analyze a CV against a job description and suggest specific, actionable optimizations that will:
1. Increase keyword match with the job description
2. Improve ATS compatibility
3. Enhance readability and impact
4. Quantify achievements where possible
5. Use strong action verbs

Return your response as a JSON object with this structure:
{
  "optimizations": [
    {
      "category": "Keywords|Action Verbs|Quantification|Formatting|Skills",
      "change": "Brief description of the change",
      "originalText": "The original text",
      "optimizedText": "The improved text",
      "section": "Which section this applies to (summary|experience|skills|education)"
    }
  ]
}`;

        const userPrompt = `Job Description:
${jobDescription}

Current CV Data:
${JSON.stringify(cvData, null, 2)}

Please analyze this CV against the job description and provide specific optimizations.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: this.temperature,
            response_format: { type: 'json_object' },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `OpenAI API error (${response.status})`;

          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error?.message) {
              errorMessage += `: ${errorData.error.message}`;
            }
          } catch {
            errorMessage += `: ${errorText.substring(0, 200)}`;
          }

          if (response.status === 401) {
            throw new Error('Invalid API key. Please check your OpenAI API key in Settings.');
          } else if (response.status === 429) {
            throw new Error('API rate limit exceeded. Please wait a moment and try again.');
          } else if (response.status === 400) {
            throw new Error('Invalid request. Please check your CV data and job description.');
          } else if (response.status >= 500) {
            throw new Error('OpenAI service is temporarily unavailable. Please try again later.');
          }

          throw new Error(errorMessage);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          throw new Error('No response from OpenAI. Please try again.');
        }

        let result;
        try {
          result = JSON.parse(content);
        } catch (parseError) {
          logger.error('Failed to parse OpenAI response:', content);
          throw new Error(
            'Failed to parse AI response. The response format was invalid. Please try again.'
          );
        }

        if (!result.optimizations || !Array.isArray(result.optimizations)) {
          throw new Error('Invalid response format from AI. Please try again.');
        }

        const optimizations: ATSOptimization[] = result.optimizations.map(
          (opt: any, index: number) => ({
            id: `opt-${Date.now()}-${index}`,
            category: opt.category || 'General',
            change: opt.change || 'Optimization',
            originalText: opt.originalText || '',
            optimizedText: opt.optimizedText || '',
            applied: false,
            section: opt.section || undefined,
          })
        );

        return {
          optimizedCV: cvData,
          optimizations,
        };
      } catch (error: any) {
        logger.error('OpenAI optimization error:', error);
        // Re-throw with more context if it's a generic error
        if (error.message?.includes('fetch') || error.message?.includes('network')) {
          throw new Error(
            'Network error: Unable to connect to OpenAI API. Please check your internet connection.'
          );
        }
        throw error;
      }
    });
  }

  async generateCoverLetter(
    cvData: CVData,
    jobDescription: string,
    extraPrompt?: string
  ): Promise<string> {
    return retryWithBackoff(async () => {
      try {
        const systemPrompt = `You are an expert cover letter writer. Create compelling, personalized cover letters that:
1. Are concise and professional (max 400 words)
2. Highlight relevant experience and skills from the CV
3. Match the job requirements
4. Show enthusiasm and cultural fit
5. Include specific examples and achievements
6. Avoid clichés and generic phrases
7. Use a professional but engaging tone`;

        const userPrompt = `Job Description:
${jobDescription}

Candidate CV Data:
Name: ${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}
Email: ${cvData.personalInfo.email}
Summary: ${cvData.personalInfo.summary}
Skills: ${cvData.skills.join(', ')}
Experience: ${JSON.stringify(cvData.experience.slice(0, 3), null, 2)}
Education: ${JSON.stringify(cvData.education.slice(0, 2), null, 2)}

${extraPrompt ? `Additional Instructions: ${extraPrompt}` : ''}

Please write a professional cover letter for this candidate. Include:
- Proper greeting
- Strong opening paragraph
- 2-3 body paragraphs highlighting relevant experience and skills
- Professional closing

Return only the cover letter text, no additional formatting or explanations.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: this.temperature,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `OpenAI API error (${response.status})`;

          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error?.message) {
              errorMessage += `: ${errorData.error.message}`;
            }
          } catch {
            errorMessage += `: ${errorText.substring(0, 200)}`;
          }

          if (response.status === 401) {
            throw new Error('Invalid API key. Please check your OpenAI API key in Settings.');
          } else if (response.status === 429) {
            throw new Error('API rate limit exceeded. Please wait a moment and try again.');
          } else if (response.status === 400) {
            throw new Error('Invalid request. Please check your CV data and job description.');
          } else if (response.status >= 500) {
            throw new Error('OpenAI service is temporarily unavailable. Please try again later.');
          }

          throw new Error(errorMessage);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          throw new Error('No response from OpenAI. Please try again.');
        }

        return content.trim();
      } catch (error: any) {
        logger.error('OpenAI cover letter generation error:', error);
        // Re-throw with more context if it's a generic error
        if (error.message?.includes('fetch') || error.message?.includes('network')) {
          throw new Error(
            'Network error: Unable to connect to OpenAI API. Please check your internet connection.'
          );
        }
        throw error;
      }
    });
  }
}

/**
 * Google Gemini Provider Implementation
 */
export class GeminiProvider implements AIProviderAdapter {
  private apiKey: string;
  private model: string;
  private temperature: number;

  constructor(config: AIConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'gemini-pro';
    this.temperature = config.temperature || 0.3;
  }

  async optimizeCV(
    cvData: CVData,
    jobDescription: string
  ): Promise<{ optimizedCV: CVData; optimizations: ATSOptimization[] }> {
    return retryWithBackoff(async () => {
      try {
        const prompt = `You are an expert ATS optimizer. Analyze this CV against the job description and provide specific optimizations.

Job Description:
${jobDescription}

CV Data:
${JSON.stringify(cvData, null, 2)}

Provide your response as a JSON object with an "optimizations" array. Each optimization should have:
- category: "Keywords", "Action Verbs", "Quantification", "Formatting", or "Skills"
- change: Brief description
- originalText: The original text
- optimizedText: The improved text
- section: Which CV section this applies to`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }],
                },
              ],
              generationConfig: {
                temperature: this.temperature,
                topK: 40,
                topP: 0.95,
              },
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `Gemini API error (${response.status})`;

          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error?.message) {
              errorMessage += `: ${errorData.error.message}`;
            }
          } catch {
            errorMessage += `: ${errorText.substring(0, 200)}`;
          }

          if (response.status === 401 || response.status === 403) {
            throw new Error('Invalid API key. Please check your Gemini API key in Settings.');
          } else if (response.status === 429) {
            throw new Error('API rate limit exceeded. Please wait a moment and try again.');
          } else if (response.status >= 500) {
            throw new Error('Gemini service is temporarily unavailable. Please try again later.');
          }

          throw new Error(errorMessage);
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!content) {
          // Check for blocked content
          if (data.candidates?.[0]?.finishReason === 'SAFETY') {
            throw new Error(
              'Content was blocked by safety filters. Please try with different content.'
            );
          }
          throw new Error('No response from Gemini. Please check your input and try again.');
        }

        // Extract JSON from markdown code blocks if present
        let jsonText = content;
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1];
        } else {
          // Try to extract just the JSON object
          const directJsonMatch = content.match(/\{[\s\S]*\}/);
          if (directJsonMatch) {
            jsonText = directJsonMatch[0];
          }
        }

        let result;
        try {
          result = JSON.parse(jsonText);
        } catch (parseError) {
          logger.error('Failed to parse Gemini response:', content);
          throw new Error(
            'Failed to parse AI response. The response format was invalid. Please try again.'
          );
        }

        if (!result.optimizations || !Array.isArray(result.optimizations)) {
          throw new Error('Invalid response format from AI. Please try again.');
        }

        const optimizations: ATSOptimization[] = result.optimizations.map(
          (opt: any, index: number) => ({
            id: `opt-${Date.now()}-${index}`,
            category: opt.category || 'General',
            change: opt.change || 'Optimization',
            originalText: opt.originalText || '',
            optimizedText: opt.optimizedText || '',
            applied: false,
            section: opt.section || undefined,
          })
        );

        return {
          optimizedCV: cvData,
          optimizations,
        };
      } catch (error: any) {
        logger.error('Gemini optimization error:', error);
        // Re-throw with more context if it's a generic error
        if (error.message?.includes('fetch') || error.message?.includes('network')) {
          throw new Error(
            'Network error: Unable to connect to Gemini API. Please check your internet connection.'
          );
        }
        throw error;
      }
    });
  }

  async generateCoverLetter(
    cvData: CVData,
    jobDescription: string,
    extraPrompt?: string
  ): Promise<string> {
    return retryWithBackoff(async () => {
      try {
        const prompt = `You are an expert cover letter writer. Create a professional, compelling cover letter.

Job Description:
${jobDescription}

Candidate Information:
Name: ${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}
Email: ${cvData.personalInfo.email}
Summary: ${cvData.personalInfo.summary}
Skills: ${cvData.skills.join(', ')}
Recent Experience: ${JSON.stringify(cvData.experience.slice(0, 2), null, 2)}
Education: ${JSON.stringify(cvData.education.slice(0, 1), null, 2)}

${extraPrompt ? `Additional Instructions: ${extraPrompt}` : ''}

Write a professional cover letter (max 400 words) that:
- Has a proper greeting
- Highlights relevant experience and skills
- Shows enthusiasm for the role
- Includes specific achievements
- Has a professional closing

Return only the cover letter text.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }],
                },
              ],
              generationConfig: {
                temperature: this.temperature,
                topK: 40,
                topP: 0.95,
              },
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `Gemini API error (${response.status})`;

          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error?.message) {
              errorMessage += `: ${errorData.error.message}`;
            }
          } catch {
            errorMessage += `: ${errorText.substring(0, 200)}`;
          }

          if (response.status === 401 || response.status === 403) {
            throw new Error('Invalid API key. Please check your Gemini API key in Settings.');
          } else if (response.status === 429) {
            throw new Error('API rate limit exceeded. Please wait a moment and try again.');
          } else if (response.status >= 500) {
            throw new Error('Gemini service is temporarily unavailable. Please try again later.');
          }

          throw new Error(errorMessage);
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!content) {
          // Check for blocked content
          if (data.candidates?.[0]?.finishReason === 'SAFETY') {
            throw new Error(
              'Content was blocked by safety filters. Please try with different content.'
            );
          }
          throw new Error('No response from Gemini. Please check your input and try again.');
        }

        return content.trim();
      } catch (error: any) {
        logger.error('Gemini cover letter generation error:', error);
        // Re-throw with more context if it's a generic error
        if (error.message?.includes('fetch') || error.message?.includes('network')) {
          throw new Error(
            'Network error: Unable to connect to Gemini API. Please check your internet connection.'
          );
        }
        throw error;
      }
    });
  }
}

/**
 * Anthropic Claude Provider Implementation
 */
export class ClaudeProvider implements AIProviderAdapter {
  private apiKey: string;
  private model: string;
  private temperature: number;

  constructor(config: AIConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'claude-3-haiku-20240307';
    this.temperature = config.temperature || 0.3;
  }

  async optimizeCV(
    cvData: CVData,
    jobDescription: string
  ): Promise<{ optimizedCV: CVData; optimizations: ATSOptimization[] }> {
    return retryWithBackoff(async () => {
      try {
        const systemPrompt = `You are an expert ATS optimizer and career consultant. Analyze CVs and provide specific, actionable optimization suggestions in JSON format.`;

        const userPrompt = `Analyze this CV against the job description and provide optimizations.

Job Description:
${jobDescription}

CV Data:
${JSON.stringify(cvData, null, 2)}

Respond with a JSON object containing an "optimizations" array. Each item should have:
{
  "category": "Keywords|Action Verbs|Quantification|Formatting|Skills",
  "change": "Brief description",
  "originalText": "Original text",
  "optimizedText": "Improved text",
  "section": "CV section name"
}`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: this.model,
            max_tokens: 2000,
            temperature: this.temperature,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `Claude API error (${response.status})`;

          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error?.message) {
              errorMessage += `: ${errorData.error.message}`;
            }
          } catch {
            errorMessage += `: ${errorText.substring(0, 200)}`;
          }

          if (response.status === 401 || response.status === 403) {
            throw new Error('Invalid API key. Please check your Claude API key in Settings.');
          } else if (response.status === 429) {
            throw new Error('API rate limit exceeded. Please wait a moment and try again.');
          } else if (response.status === 400) {
            throw new Error('Invalid request. Please check your CV data and job description.');
          } else if (response.status >= 500) {
            throw new Error('Claude service is temporarily unavailable. Please try again later.');
          }

          throw new Error(errorMessage);
        }

        const data = await response.json();
        const content = data.content?.[0]?.text;

        if (!content) {
          throw new Error('No response from Claude. Please try again.');
        }

        // Extract JSON from markdown code blocks if present
        let jsonText = content;
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1];
        } else {
          // Try to extract just the JSON object
          const directJsonMatch = content.match(/\{[\s\S]*\}/);
          if (directJsonMatch) {
            jsonText = directJsonMatch[0];
          }
        }

        let result;
        try {
          result = JSON.parse(jsonText);
        } catch (parseError) {
          logger.error('Failed to parse Claude response:', content);
          throw new Error(
            'Failed to parse AI response. The response format was invalid. Please try again.'
          );
        }

        if (!result.optimizations || !Array.isArray(result.optimizations)) {
          throw new Error('Invalid response format from AI. Please try again.');
        }

        const optimizations: ATSOptimization[] = result.optimizations.map(
          (opt: any, index: number) => ({
            id: `opt-${Date.now()}-${index}`,
            category: opt.category || 'General',
            change: opt.change || 'Optimization',
            originalText: opt.originalText || '',
            optimizedText: opt.optimizedText || '',
            applied: false,
            section: opt.section || undefined,
          })
        );

        return {
          optimizedCV: cvData,
          optimizations,
        };
      } catch (error: any) {
        logger.error('Claude optimization error:', error);
        // Re-throw with more context if it's a generic error
        if (error.message?.includes('fetch') || error.message?.includes('network')) {
          throw new Error(
            'Network error: Unable to connect to Claude API. Please check your internet connection.'
          );
        }
        throw error;
      }
    });
  }

  async generateCoverLetter(
    cvData: CVData,
    jobDescription: string,
    extraPrompt?: string
  ): Promise<string> {
    return retryWithBackoff(async () => {
      try {
        const systemPrompt = `You are an expert cover letter writer specializing in creating compelling, personalized cover letters.`;

        const userPrompt = `Write a professional cover letter for this candidate.

Job Description:
${jobDescription}

Candidate:
Name: ${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}
Email: ${cvData.personalInfo.email}
Summary: ${cvData.personalInfo.summary}
Key Skills: ${cvData.skills.slice(0, 8).join(', ')}
Recent Experience: ${JSON.stringify(cvData.experience.slice(0, 2), null, 2)}
Education: ${JSON.stringify(cvData.education.slice(0, 1), null, 2)}

${extraPrompt ? `Additional Instructions: ${extraPrompt}` : ''}

Create a professional cover letter (max 400 words) with:
- Proper greeting
- Strong opening
- 2-3 paragraphs highlighting relevant experience
- Professional closing

Return only the cover letter text, no additional commentary.`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: this.model,
            max_tokens: 1500,
            temperature: this.temperature,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `Claude API error (${response.status})`;

          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error?.message) {
              errorMessage += `: ${errorData.error.message}`;
            }
          } catch {
            errorMessage += `: ${errorText.substring(0, 200)}`;
          }

          if (response.status === 401 || response.status === 403) {
            throw new Error('Invalid API key. Please check your Claude API key in Settings.');
          } else if (response.status === 429) {
            throw new Error('API rate limit exceeded. Please wait a moment and try again.');
          } else if (response.status === 400) {
            throw new Error('Invalid request. Please check your CV data and job description.');
          } else if (response.status >= 500) {
            throw new Error('Claude service is temporarily unavailable. Please try again later.');
          }

          throw new Error(errorMessage);
        }

        const data = await response.json();
        const content = data.content?.[0]?.text;

        if (!content) {
          throw new Error('No response from Claude. Please try again.');
        }

        return content.trim();
      } catch (error: any) {
        logger.error('Claude cover letter generation error:', error);
        // Re-throw with more context if it's a generic error
        if (error.message?.includes('fetch') || error.message?.includes('network')) {
          throw new Error(
            'Network error: Unable to connect to Claude API. Please check your internet connection.'
          );
        }
        throw error;
      }
    });
  }
}

/**
 * Azure OpenAI Provider Implementation
 */
export class AzureOpenAIProvider implements AIProviderAdapter {
  private apiKey: string;
  private endpoint: string;
  private deployment: string;
  private temperature: number;

  constructor(config: AIConfig) {
    this.apiKey = config.apiKey;
    this.endpoint = config.azureEndpoint || '';
    this.deployment = config.azureDeployment || 'gpt-4';
    this.temperature = config.temperature || 0.3;

    if (!this.endpoint) {
      throw new Error('Azure endpoint is required for Azure OpenAI provider');
    }
  }

  async optimizeCV(
    cvData: CVData,
    jobDescription: string
  ): Promise<{ optimizedCV: CVData; optimizations: ATSOptimization[] }> {
    return retryWithBackoff(async () => {
      try {
        const systemPrompt = `You are an expert ATS (Applicant Tracking System) optimizer and career consultant. 
Your task is to analyze a CV against a job description and suggest specific, actionable optimizations that will:
1. Increase keyword match with the job description
2. Improve ATS compatibility
3. Enhance readability and impact
4. Quantify achievements where possible
5. Use strong action verbs

Return your response as a JSON object with this structure:
{
  "optimizations": [
    {
      "category": "Keywords|Action Verbs|Quantification|Formatting|Skills",
      "change": "Brief description of the change",
      "originalText": "The original text",
      "optimizedText": "The improved text",
      "section": "Which section this applies to (summary|experience|skills|education)"
    }
  ]
}`;

        const userPrompt = `Job Description:
${jobDescription}

Current CV Data:
${JSON.stringify(cvData, null, 2)}

Please analyze this CV against the job description and provide specific optimizations.`;

        const apiVersion = '2024-02-15-preview';
        const url = `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=${apiVersion}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.apiKey,
          },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: this.temperature,
            response_format: { type: 'json_object' },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `Azure OpenAI API error (${response.status})`;

          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error?.message) {
              errorMessage += `: ${errorData.error.message}`;
            }
          } catch {
            errorMessage += `: ${errorText.substring(0, 200)}`;
          }

          if (response.status === 401) {
            throw new Error('Invalid API key. Please check your Azure OpenAI API key in Settings.');
          } else if (response.status === 429) {
            throw new Error('API rate limit exceeded. Please wait a moment and try again.');
          } else if (response.status === 400) {
            throw new Error('Invalid request. Please check your CV data and job description.');
          } else if (response.status >= 500) {
            throw new Error('Azure OpenAI service is temporarily unavailable. Please try again later.');
          }

          throw new Error(errorMessage);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          throw new Error('No response from Azure OpenAI. Please try again.');
        }

        let result;
        try {
          result = JSON.parse(content);
        } catch (parseError) {
          logger.error('Failed to parse Azure OpenAI response:', content);
          throw new Error(
            'Failed to parse AI response. The response format was invalid. Please try again.'
          );
        }

        if (!result.optimizations || !Array.isArray(result.optimizations)) {
          throw new Error('Invalid response format from AI. Please try again.');
        }

        const optimizations: ATSOptimization[] = result.optimizations.map(
          (opt: any, index: number) => ({
            id: `opt-${Date.now()}-${index}`,
            category: opt.category || 'General',
            change: opt.change || 'Optimization',
            originalText: opt.originalText || '',
            optimizedText: opt.optimizedText || '',
            applied: false,
            section: opt.section || undefined,
          })
        );

        return {
          optimizedCV: cvData,
          optimizations,
        };
      } catch (error: any) {
        logger.error('Azure OpenAI optimization error:', error);
        if (error.message?.includes('fetch') || error.message?.includes('network')) {
          throw new Error(
            'Network error: Unable to connect to Azure OpenAI API. Please check your internet connection.'
          );
        }
        throw error;
      }
    });
  }

  async generateCoverLetter(
    cvData: CVData,
    jobDescription: string,
    extraPrompt?: string
  ): Promise<string> {
    return retryWithBackoff(async () => {
      try {
        const systemPrompt = `You are an expert cover letter writer. Create compelling, personalized cover letters that:
1. Are concise and professional (max 400 words)
2. Highlight relevant experience and skills from the CV
3. Match the job requirements
4. Show enthusiasm and cultural fit
5. Include specific examples and achievements
6. Avoid clichés and generic phrases
7. Use a professional but engaging tone`;

        const userPrompt = `Job Description:
${jobDescription}

Candidate CV Data:
Name: ${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}
Email: ${cvData.personalInfo.email}
Summary: ${cvData.personalInfo.summary}
Skills: ${cvData.skills.join(', ')}
Experience: ${JSON.stringify(cvData.experience.slice(0, 3), null, 2)}
Education: ${JSON.stringify(cvData.education.slice(0, 2), null, 2)}

${extraPrompt ? `Additional Instructions: ${extraPrompt}` : ''}

Please write a professional cover letter for this candidate.`;

        const apiVersion = '2024-02-15-preview';
        const url = `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=${apiVersion}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.apiKey,
          },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: this.temperature,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Azure OpenAI API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          throw new Error('No response from Azure OpenAI. Please try again.');
        }

        return content.trim();
      } catch (error: any) {
        logger.error('Azure OpenAI cover letter generation error:', error);
        throw error;
      }
    });
  }
}

/**
 * Ollama Provider Implementation (Local AI)
 */
export class OllamaProvider implements AIProviderAdapter {
  private endpoint: string;
  private model: string;
  private temperature: number;
  private apiKey?: string;

  constructor(config: AIConfig) {
    this.endpoint = config.ollamaEndpoint || 'http://localhost:11434';
    this.model = config.model || 'llama2';
    this.temperature = config.temperature || 0.3;
    this.apiKey = config.apiKey; // Optional for secured instances
  }

  async optimizeCV(
    cvData: CVData,
    jobDescription: string
  ): Promise<{ optimizedCV: CVData; optimizations: ATSOptimization[] }> {
    return retryWithBackoff(async () => {
      try {
        const prompt = `You are an expert ATS optimizer. Analyze this CV against the job description and provide specific optimizations.

Job Description:
${jobDescription}

CV Data:
${JSON.stringify(cvData, null, 2)}

Provide your response as a JSON object with an "optimizations" array. Each optimization should have:
- category: "Keywords", "Action Verbs", "Quantification", "Formatting", or "Skills"
- change: Brief description
- originalText: The original text
- optimizedText: The improved text
- section: Which CV section this applies to

Respond ONLY with valid JSON, no markdown or additional text.`;

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (this.apiKey) {
          headers['Authorization'] = `Bearer ${this.apiKey}`;
        }

        const response = await fetch(`${this.endpoint}/api/generate`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: this.model,
            prompt: prompt,
            stream: false,
            options: {
              temperature: this.temperature,
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Ollama API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        const content = data.response;

        if (!content) {
          throw new Error('No response from Ollama. Is Ollama running?');
        }

        // Extract JSON from response
        let jsonText = content;
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1];
        } else {
          const directJsonMatch = content.match(/\{[\s\S]*\}/);
          if (directJsonMatch) {
            jsonText = directJsonMatch[0];
          }
        }

        let result;
        try {
          result = JSON.parse(jsonText);
        } catch (parseError) {
          logger.error('Failed to parse Ollama response:', content);
          throw new Error(
            'Failed to parse AI response. The response format was invalid. Please try again.'
          );
        }

        if (!result.optimizations || !Array.isArray(result.optimizations)) {
          throw new Error('Invalid response format from AI. Please try again.');
        }

        const optimizations: ATSOptimization[] = result.optimizations.map(
          (opt: any, index: number) => ({
            id: `opt-${Date.now()}-${index}`,
            category: opt.category || 'General',
            change: opt.change || 'Optimization',
            originalText: opt.originalText || '',
            optimizedText: opt.optimizedText || '',
            applied: false,
            section: opt.section || undefined,
          })
        );

        return {
          optimizedCV: cvData,
          optimizations,
        };
      } catch (error: any) {
        logger.error('Ollama optimization error:', error);
        if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
          throw new Error(
            'Unable to connect to Ollama. Please make sure Ollama is running at ' + this.endpoint
          );
        }
        throw error;
      }
    });
  }

  async generateCoverLetter(
    cvData: CVData,
    jobDescription: string,
    extraPrompt?: string
  ): Promise<string> {
    return retryWithBackoff(async () => {
      try {
        const prompt = `You are an expert cover letter writer. Create a professional, compelling cover letter.

Job Description:
${jobDescription}

Candidate Information:
Name: ${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}
Email: ${cvData.personalInfo.email}
Summary: ${cvData.personalInfo.summary}
Skills: ${cvData.skills.join(', ')}
Recent Experience: ${JSON.stringify(cvData.experience.slice(0, 2), null, 2)}
Education: ${JSON.stringify(cvData.education.slice(0, 1), null, 2)}

${extraPrompt ? `Additional Instructions: ${extraPrompt}` : ''}

Write a professional cover letter (max 400 words) that:
- Has a proper greeting
- Highlights relevant experience and skills
- Shows enthusiasm for the role
- Includes specific achievements
- Has a professional closing

Return only the cover letter text.`;

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (this.apiKey) {
          headers['Authorization'] = `Bearer ${this.apiKey}`;
        }

        const response = await fetch(`${this.endpoint}/api/generate`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: this.model,
            prompt: prompt,
            stream: false,
            options: {
              temperature: this.temperature,
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Ollama API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        const content = data.response;

        if (!content) {
          throw new Error('No response from Ollama. Is Ollama running?');
        }

        return content.trim();
      } catch (error: any) {
        logger.error('Ollama cover letter generation error:', error);
        if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
          throw new Error(
            'Unable to connect to Ollama. Please make sure Ollama is running at ' + this.endpoint
          );
        }
        throw error;
      }
    });
  }
}

/**
 * Factory function to create the appropriate AI provider
 */
export function createAIProvider(config: AIConfig): AIProviderAdapter {
  switch (config.provider) {
    case 'openai':
      return new OpenAIProvider(config);
    case 'gemini':
      return new GeminiProvider(config);
    case 'claude':
      return new ClaudeProvider(config);
    case 'azure-openai':
      return new AzureOpenAIProvider(config);
    case 'ollama':
      return new OllamaProvider(config);
    default:
      throw new Error(`Unsupported AI provider: ${config.provider}`);
  }
}
