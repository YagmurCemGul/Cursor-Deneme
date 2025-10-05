/**
 * Streaming AI Provider
 * Real-time streaming responses for better UX
 * 
 * @module streamingAI
 * @description Provides streaming capabilities for AI responses
 */

import { logger } from './logger';
import { CVData, ATSOptimization } from '../types';
import { AIProvider } from './aiProviders';

/**
 * Stream chunk
 */
export interface StreamChunk {
  type: 'start' | 'chunk' | 'complete' | 'error';
  content?: string;
  progress?: number;
  metadata?: any;
  error?: string;
}

/**
 * Stream options
 */
export interface StreamOptions {
  onChunk?: (chunk: StreamChunk) => void;
  onProgress?: (progress: number) => void;
  onComplete?: (result: any) => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}

/**
 * Streaming AI Provider
 * Supports Server-Sent Events and chunked responses
 */
export class StreamingAIProvider {
  private provider: AIProvider;
  private apiKey: string;
  private model: string;

  constructor(provider: AIProvider, apiKey: string, model?: string) {
    this.provider = provider;
    this.apiKey = apiKey;
    this.model = model || this.getDefaultModel(provider);
  }

  /**
   * Stream CV optimization
   */
  async *streamOptimizeCV(
    cvData: CVData,
    jobDescription: string,
    options: StreamOptions = {}
  ): AsyncGenerator<StreamChunk, void, unknown> {
    try {
      yield { type: 'start', progress: 0 };

      const prompt = this.buildOptimizationPrompt(cvData, jobDescription);
      
      // Stream based on provider
      if (this.provider === 'openai') {
        yield* this.streamOpenAI(prompt, options);
      } else if (this.provider === 'gemini') {
        yield* this.streamGemini(prompt, options);
      } else if (this.provider === 'claude') {
        yield* this.streamClaude(prompt, options);
      } else {
        throw new Error(`Streaming not supported for ${this.provider}`);
      }

      yield { type: 'complete', progress: 100 };
    } catch (error: any) {
      logger.error('Streaming error:', error);
      yield { type: 'error', error: error.message };
      
      if (options.onError) {
        options.onError(error);
      }
    }
  }

  /**
   * Stream cover letter generation
   */
  async *streamGenerateCoverLetter(
    cvData: CVData,
    jobDescription: string,
    extraPrompt?: string,
    options: StreamOptions = {}
  ): AsyncGenerator<StreamChunk, void, unknown> {
    try {
      yield { type: 'start', progress: 0 };

      const prompt = this.buildCoverLetterPrompt(cvData, jobDescription, extraPrompt);
      
      if (this.provider === 'openai') {
        yield* this.streamOpenAI(prompt, options);
      } else if (this.provider === 'gemini') {
        yield* this.streamGemini(prompt, options);
      } else if (this.provider === 'claude') {
        yield* this.streamClaude(prompt, options);
      }

      yield { type: 'complete', progress: 100 };
    } catch (error: any) {
      logger.error('Streaming error:', error);
      yield { type: 'error', error: error.message };
    }
  }

  /**
   * Stream from OpenAI
   */
  private async *streamOpenAI(
    prompt: string,
    options: StreamOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        temperature: 0.7
      }),
      signal: options.signal
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let progress = 0;

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;

            if (content) {
              progress += 1;
              
              yield {
                type: 'chunk',
                content,
                progress: Math.min(progress, 95)
              };

              if (options.onChunk) {
                options.onChunk({ type: 'chunk', content, progress });
              }
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }
  }

  /**
   * Stream from Gemini
   */
  private async *streamGemini(
    prompt: string,
    options: StreamOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:streamGenerateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        }),
        signal: options.signal
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let progress = 0;

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text;

          if (content) {
            progress += 5;
            
            yield {
              type: 'chunk',
              content,
              progress: Math.min(progress, 95)
            };

            if (options.onChunk) {
              options.onChunk({ type: 'chunk', content, progress });
            }
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }

  /**
   * Stream from Claude
   */
  private async *streamClaude(
    prompt: string,
    options: StreamOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        max_tokens: 2048,
        temperature: 0.7
      }),
      signal: options.signal
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let progress = 0;

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

      for (const line of lines) {
        const data = line.slice(6);
        
        try {
          const parsed = JSON.parse(data);
          
          if (parsed.type === 'content_block_delta') {
            const content = parsed.delta?.text;
            
            if (content) {
              progress += 2;
              
              yield {
                type: 'chunk',
                content,
                progress: Math.min(progress, 95)
              };

              if (options.onChunk) {
                options.onChunk({ type: 'chunk', content, progress });
              }
            }
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }

  /**
   * Build optimization prompt
   */
  private buildOptimizationPrompt(cvData: CVData, jobDescription: string): string {
    return `You are an expert ATS optimizer. Analyze this CV against the job description and provide specific optimizations.

Job Description:
${jobDescription}

CV Data:
${JSON.stringify(cvData, null, 2)}

Provide optimizations as JSON with this structure:
{
  "optimizations": [
    {
      "category": "Keywords|Action Verbs|Quantification|Formatting|Skills",
      "change": "Brief description",
      "originalText": "Original text",
      "optimizedText": "Improved text",
      "section": "CV section"
    }
  ]
}`;
  }

  /**
   * Build cover letter prompt
   */
  private buildCoverLetterPrompt(
    cvData: CVData,
    jobDescription: string,
    extraPrompt?: string
  ): string {
    return `You are an expert cover letter writer. Create a compelling, personalized cover letter.

Job Description:
${jobDescription}

Candidate:
Name: ${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}
Email: ${cvData.personalInfo.email}
Summary: ${cvData.personalInfo.summary}
Skills: ${cvData.skills.join(', ')}

${extraPrompt ? `Additional Instructions: ${extraPrompt}` : ''}

Write a professional cover letter (max 400 words) with:
- Proper greeting
- Strong opening paragraph
- 2-3 body paragraphs highlighting relevant experience
- Professional closing

Return only the cover letter text.`;
  }

  /**
   * Get default model for provider
   */
  private getDefaultModel(provider: AIProvider): string {
    const models: Record<AIProvider, string> = {
      'openai': 'gpt-4o-mini',
      'gemini': 'gemini-pro',
      'claude': 'claude-3-haiku-20240307'
    };
    return models[provider];
  }
}

/**
 * Helper function to collect stream into full result
 */
export async function collectStream(
  stream: AsyncGenerator<StreamChunk, void, unknown>
): Promise<string> {
  let result = '';
  
  for await (const chunk of stream) {
    if (chunk.type === 'chunk' && chunk.content) {
      result += chunk.content;
    }
  }
  
  return result;
}

/**
 * Helper to stream with progress callback
 */
export async function streamWithProgress<T>(
  generator: AsyncGenerator<StreamChunk, void, unknown>,
  onProgress: (content: string, progress: number) => void
): Promise<string> {
  let fullContent = '';
  
  for await (const chunk of generator) {
    if (chunk.type === 'chunk' && chunk.content) {
      fullContent += chunk.content;
      onProgress(fullContent, chunk.progress || 0);
    } else if (chunk.type === 'error') {
      throw new Error(chunk.error);
    }
  }
  
  return fullContent;
}

/**
 * Create streaming provider instance
 */
export function createStreamingProvider(
  provider: AIProvider,
  apiKey: string,
  model?: string
): StreamingAIProvider {
  return new StreamingAIProvider(provider, apiKey, model);
}
