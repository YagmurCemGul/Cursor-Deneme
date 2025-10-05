/**
 * Multi-AI Provider Support
 * Supports OpenAI, Google Gemini, and Anthropic Claude
 */

import { CVData, ATSOptimization } from '../types';
import { logger } from './logger';

export type AIProvider = 'openai' | 'gemini' | 'claude';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  temperature?: number;
}

export interface AIProviderAdapter {
  optimizeCV(cvData: CVData, jobDescription: string): Promise<{ optimizedCV: CVData; optimizations: ATSOptimization[] }>;
  generateCoverLetter(cvData: CVData, jobDescription: string, extraPrompt?: string): Promise<string>;
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

  async optimizeCV(cvData: CVData, jobDescription: string): Promise<{ optimizedCV: CVData; optimizations: ATSOptimization[] }> {
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
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: this.temperature,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = errorText;
        let errorType = 'unknown';
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error?.message || errorText;
          errorType = errorJson.error?.type || 'unknown';
        } catch (e) {
          // If not JSON, use text as-is
        }
        
        // Special handling for rate limit errors (429)
        if (response.status === 429) {
          // Distinguish between rate limit and insufficient quota
          if (errorMessage.includes('quota') || errorMessage.includes('insufficient_quota') || errorType === 'insufficient_quota') {
            throw new Error(
              `OpenAI quota exceeded: ${errorMessage}\n\n` +
              `Your account has insufficient quota/credits. Please:\n` +
              `1. Check your usage at https://platform.openai.com/usage\n` +
              `2. Add credits or upgrade your plan at https://platform.openai.com/account/billing\n` +
              `3. Wait for your monthly quota to reset if on free tier`
            );
          } else {
            // Rate limit (too many requests)
            throw new Error(
              `OpenAI rate limit exceeded (429): ${errorMessage}\n\n` +
              `You're sending requests too quickly. Please:\n` +
              `1. Wait 20-60 seconds before trying again\n` +
              `2. Reduce the frequency of your requests\n` +
              `3. Consider upgrading to a higher tier for increased rate limits at https://platform.openai.com/account/limits`
            );
          }
        }
        
        throw new Error(`OpenAI API error: ${response.status} - ${errorMessage}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const result = JSON.parse(content);
      const optimizations: ATSOptimization[] = result.optimizations.map((opt: any, index: number) => ({
        id: `opt-${Date.now()}-${index}`,
        category: opt.category,
        change: opt.change,
        originalText: opt.originalText,
        optimizedText: opt.optimizedText,
        applied: false
      }));

      return {
        optimizedCV: cvData,
        optimizations
      };
    } catch (error) {
      logger.error('OpenAI optimization error:', error);
      throw error;
    }
  }

  async generateCoverLetter(cvData: CVData, jobDescription: string, extraPrompt?: string): Promise<string> {
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
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: this.temperature
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = errorText;
        let errorType = 'unknown';
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error?.message || errorText;
          errorType = errorJson.error?.type || 'unknown';
        } catch (e) {
          // If not JSON, use text as-is
        }
        
        // Special handling for rate limit errors (429)
        if (response.status === 429) {
          // Distinguish between rate limit and insufficient quota
          if (errorMessage.includes('quota') || errorMessage.includes('insufficient_quota') || errorType === 'insufficient_quota') {
            throw new Error(
              `OpenAI quota exceeded: ${errorMessage}\n\n` +
              `Your account has insufficient quota/credits. Please:\n` +
              `1. Check your usage at https://platform.openai.com/usage\n` +
              `2. Add credits or upgrade your plan at https://platform.openai.com/account/billing\n` +
              `3. Wait for your monthly quota to reset if on free tier`
            );
          } else {
            // Rate limit (too many requests)
            throw new Error(
              `OpenAI rate limit exceeded (429): ${errorMessage}\n\n` +
              `You're sending requests too quickly. Please:\n` +
              `1. Wait 20-60 seconds before trying again\n` +
              `2. Reduce the frequency of your requests\n` +
              `3. Consider upgrading to a higher tier for increased rate limits at https://platform.openai.com/account/limits`
            );
          }
        }
        
        throw new Error(`OpenAI API error: ${response.status} - ${errorMessage}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return content.trim();
    } catch (error) {
      logger.error('OpenAI cover letter generation error:', error);
      throw error;
    }
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

  async optimizeCV(cvData: CVData, jobDescription: string): Promise<{ optimizedCV: CVData; optimizations: ATSOptimization[] }> {
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

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: this.temperature,
            topK: 40,
            topP: 0.95,
          }
        })
      });

      if (!response.ok) {
        const error = await response.text();
        
        // Special handling for rate limit errors
        if (response.status === 429) {
          throw new Error(`Gemini rate limit exceeded (429). Please wait and try again.`);
        }
        
        throw new Error(`Gemini API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        throw new Error('No response from Gemini');
      }

      // Extract JSON from markdown code blocks if present
      let jsonText = content;
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }

      const result = JSON.parse(jsonText);
      const optimizations: ATSOptimization[] = result.optimizations.map((opt: any, index: number) => ({
        id: `opt-${Date.now()}-${index}`,
        category: opt.category,
        change: opt.change,
        originalText: opt.originalText,
        optimizedText: opt.optimizedText,
        applied: false
      }));

      return {
        optimizedCV: cvData,
        optimizations
      };
    } catch (error) {
      logger.error('Gemini optimization error:', error);
      throw error;
    }
  }

  async generateCoverLetter(cvData: CVData, jobDescription: string, extraPrompt?: string): Promise<string> {
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

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: this.temperature,
            topK: 40,
            topP: 0.95,
          }
        })
      });

      if (!response.ok) {
        const error = await response.text();
        
        // Special handling for rate limit errors
        if (response.status === 429) {
          throw new Error(`Gemini rate limit exceeded (429). Please wait and try again.`);
        }
        
        throw new Error(`Gemini API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        throw new Error('No response from Gemini');
      }

      return content.trim();
    } catch (error) {
      logger.error('Gemini cover letter generation error:', error);
      throw error;
    }
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

  async optimizeCV(cvData: CVData, jobDescription: string): Promise<{ optimizedCV: CVData; optimizations: ATSOptimization[] }> {
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
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 2000,
          temperature: this.temperature,
          system: systemPrompt,
          messages: [
            { role: 'user', content: userPrompt }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.text();
        
        // Special handling for rate limit errors
        if (response.status === 429) {
          throw new Error(`Claude rate limit exceeded (429). Please wait and try again.`);
        }
        
        throw new Error(`Claude API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const content = data.content?.[0]?.text;
      
      if (!content) {
        throw new Error('No response from Claude');
      }

      // Extract JSON from markdown code blocks if present
      let jsonText = content;
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }

      const result = JSON.parse(jsonText);
      const optimizations: ATSOptimization[] = result.optimizations.map((opt: any, index: number) => ({
        id: `opt-${Date.now()}-${index}`,
        category: opt.category,
        change: opt.change,
        originalText: opt.originalText,
        optimizedText: opt.optimizedText,
        applied: false
      }));

      return {
        optimizedCV: cvData,
        optimizations
      };
    } catch (error) {
      logger.error('Claude optimization error:', error);
      throw error;
    }
  }

  async generateCoverLetter(cvData: CVData, jobDescription: string, extraPrompt?: string): Promise<string> {
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
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1500,
          temperature: this.temperature,
          system: systemPrompt,
          messages: [
            { role: 'user', content: userPrompt }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.text();
        
        // Special handling for rate limit errors
        if (response.status === 429) {
          throw new Error(`Claude rate limit exceeded (429). Please wait and try again.`);
        }
        
        throw new Error(`Claude API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const content = data.content?.[0]?.text;
      
      if (!content) {
        throw new Error('No response from Claude');
      }

      return content.trim();
    } catch (error) {
      logger.error('Claude cover letter generation error:', error);
      throw error;
    }
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
    default:
      throw new Error(`Unsupported AI provider: ${config.provider}`);
  }
}
