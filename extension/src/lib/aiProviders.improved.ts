/**
 * IMPROVED AI Providers with Retry, Cache, Rate Limiting
 * Production-ready implementation with all best practices
 */

import { retryWithBackoff, SmartRetryHandler } from './retryHandler';
import { RateLimiter, withRateLimit } from './rateLimiter';
import { AICache, generateCacheKey } from './aiCache';
import { handleError, createAppError, formatErrorForDisplay } from './errorHandler';

export type AIProvider = 'openai' | 'anthropic' | 'google';

export type AIModel = 
  | 'gpt-4-turbo'
  | 'gpt-4'
  | 'gpt-3.5-turbo'
  | 'claude-3-opus'
  | 'claude-3-sonnet'
  | 'claude-3-haiku'
  | 'gemini-pro'
  | 'gemini-1.5-pro';

export interface AIModelConfig {
  id: AIModel;
  provider: AIProvider;
  name: string;
  description: string;
  contextWindow: number;
  maxOutputTokens: number;
  costPer1kInputTokens: number;
  costPer1kOutputTokens: number;
  strengths: string[];
  bestFor: string[];
  speed: 'fast' | 'medium' | 'slow';
  quality: 'excellent' | 'good' | 'fair';
}

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  model: AIModel;
  temperature: number;
  maxTokens: number;
}

export interface AIResponse {
  content: string;
  model: AIModel;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalCost: number;
  };
  provider: AIProvider;
  cached?: boolean;
  retryCount?: number;
}

/**
 * Available AI Models Database
 */
export const AI_MODELS: Record<AIModel, AIModelConfig> = {
  'gpt-4-turbo': {
    id: 'gpt-4-turbo',
    provider: 'openai',
    name: 'GPT-4 Turbo',
    description: 'Most capable OpenAI model with 128K context',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    costPer1kInputTokens: 0.01,
    costPer1kOutputTokens: 0.03,
    strengths: ['Complex reasoning', 'Long context', 'Instruction following'],
    bestFor: ['Resume generation', 'Complex analysis', 'Multi-turn conversations'],
    speed: 'medium',
    quality: 'excellent'
  },
  'gpt-4': {
    id: 'gpt-4',
    provider: 'openai',
    name: 'GPT-4',
    description: 'Standard GPT-4 with 8K context',
    contextWindow: 8192,
    maxOutputTokens: 4096,
    costPer1kInputTokens: 0.03,
    costPer1kOutputTokens: 0.06,
    strengths: ['Reliable', 'High quality', 'Precise'],
    bestFor: ['Professional writing', 'Quality over speed'],
    speed: 'slow',
    quality: 'excellent'
  },
  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    provider: 'openai',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and cost-effective',
    contextWindow: 16385,
    maxOutputTokens: 4096,
    costPer1kInputTokens: 0.0005,
    costPer1kOutputTokens: 0.0015,
    strengths: ['Very fast', 'Very cheap', 'Good quality'],
    bestFor: ['Quick Q&A', 'Simple tasks', 'Budget-conscious'],
    speed: 'fast',
    quality: 'good'
  },
  'claude-3-opus': {
    id: 'claude-3-opus',
    provider: 'anthropic',
    name: 'Claude 3 Opus',
    description: 'Most intelligent Claude model',
    contextWindow: 200000,
    maxOutputTokens: 4096,
    costPer1kInputTokens: 0.015,
    costPer1kOutputTokens: 0.075,
    strengths: ['Nuanced reasoning', 'Excellent writing', 'Very large context'],
    bestFor: ['Creative writing', 'Complex analysis', 'Long documents'],
    speed: 'slow',
    quality: 'excellent'
  },
  'claude-3-sonnet': {
    id: 'claude-3-sonnet',
    provider: 'anthropic',
    name: 'Claude 3 Sonnet',
    description: 'Balanced performance and cost',
    contextWindow: 200000,
    maxOutputTokens: 4096,
    costPer1kInputTokens: 0.003,
    costPer1kOutputTokens: 0.015,
    strengths: ['Balanced', 'Good reasoning', 'Cost-effective'],
    bestFor: ['Cover letters', 'General tasks', 'Good balance'],
    speed: 'medium',
    quality: 'excellent'
  },
  'claude-3-haiku': {
    id: 'claude-3-haiku',
    provider: 'anthropic',
    name: 'Claude 3 Haiku',
    description: 'Fastest Claude model',
    contextWindow: 200000,
    maxOutputTokens: 4096,
    costPer1kInputTokens: 0.00025,
    costPer1kOutputTokens: 0.00125,
    strengths: ['Very fast', 'Very cheap', 'Large context'],
    bestFor: ['Quick responses', 'Simple Q&A', 'Budget-friendly'],
    speed: 'fast',
    quality: 'good'
  },
  'gemini-pro': {
    id: 'gemini-pro',
    provider: 'google',
    name: 'Gemini Pro',
    description: 'Google\'s capable AI model',
    contextWindow: 32760,
    maxOutputTokens: 2048,
    costPer1kInputTokens: 0.00025,
    costPer1kOutputTokens: 0.0005,
    strengths: ['Very affordable', 'Fast', 'Good reasoning'],
    bestFor: ['Cost-effective tasks', 'Quick generation', 'Simple analysis'],
    speed: 'fast',
    quality: 'good'
  },
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    provider: 'google',
    name: 'Gemini 1.5 Pro',
    description: 'Advanced Gemini with huge context',
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    costPer1kInputTokens: 0.00125,
    costPer1kOutputTokens: 0.005,
    strengths: ['Massive context', 'Multimodal', 'Good value'],
    bestFor: ['Very long documents', 'Complex analysis', 'Multi-document tasks'],
    speed: 'medium',
    quality: 'excellent'
  }
};

/**
 * Calculate cost for a request
 */
export function calculateCost(model: AIModel, inputTokens: number, outputTokens: number): number {
  const config = AI_MODELS[model];
  const inputCost = (inputTokens / 1000) * config.costPer1kInputTokens;
  const outputCost = (outputTokens / 1000) * config.costPer1kOutputTokens;
  return inputCost + outputCost;
}

/**
 * Estimate tokens from text (rough approximation)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * IMPROVED: Call OpenAI API with retry, cache, rate limiting
 */
async function callOpenAI(
  systemPrompt: string,
  userPrompt: string,
  config: AIProviderConfig
): Promise<AIResponse> {
  const model = config.model;
  const cache = AICache.getInstance();
  const limiter = RateLimiter.getInstance();
  
  // 1. Check cache first
  const cacheKey = generateCacheKey(systemPrompt, userPrompt, model);
  const cached = await cache.get<AIResponse>(cacheKey);
  if (cached) {
    console.log(`[Cache HIT] OpenAI ${model}`);
    return { ...cached, cached: true };
  }
  
  // 2. Check rate limit
  const limitStatus = await limiter.checkLimit();
  if (!limitStatus.allowed) {
    const error = new Error(limitStatus.reason!);
    const appError = handleError(error, 'en');
    throw new Error(formatErrorForDisplay(appError));
  }
  
  // 3. Call API with retry and timeout
  let retryCount = 0;
  const apiResponse = await retryWithBackoff(
    async () => {
      retryCount++;
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: model === 'gpt-4-turbo' ? 'gpt-4-turbo-preview' : model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: config.temperature,
          max_tokens: config.maxTokens
        }),
        signal: AbortSignal.timeout(60000) // 60 second timeout
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        
        // Throw specific errors for retry logic
        if (response.status === 401) {
          const err = new Error('Invalid API key (401). Please check your OpenAI API key in settings.');
          (err as any).retryable = false;
          throw err;
        } else if (response.status === 429) {
          throw new Error('OpenAI rate limit exceeded (429). Please wait and try again.');
        } else if (response.status === 503) {
          throw new Error('OpenAI service unavailable (503). Please try again later.');
        }
        
        throw new Error(`OpenAI API error (${response.status}): ${error.error?.message || 'Unknown error'}`);
      }

      return response.json();
    },
    {
      maxAttempts: 3,
      initialDelay: 1000,
      onRetry: (error, attempt, delay) => {
        console.log(`[Retry ${attempt}/3] OpenAI ${model} after ${delay}ms: ${error.message}`);
      }
    }
  );

  const content = apiResponse.choices[0]?.message?.content || '';
  const usage = apiResponse.usage || {};

  const aiResponse: AIResponse = {
    content,
    model,
    usage: {
      inputTokens: usage.prompt_tokens || 0,
      outputTokens: usage.completion_tokens || 0,
      totalCost: calculateCost(model, usage.prompt_tokens || 0, usage.completion_tokens || 0)
    },
    provider: 'openai',
    retryCount
  };

  // 4. Cache the response
  await cache.set(cacheKey, aiResponse, 60); // Cache for 1 hour
  
  // 5. Record rate limit usage
  await limiter.recordRequest(aiResponse.usage.totalCost);

  return aiResponse;
}

/**
 * IMPROVED: Call Anthropic Claude API with retry, cache, rate limiting
 */
async function callClaude(
  systemPrompt: string,
  userPrompt: string,
  config: AIProviderConfig
): Promise<AIResponse> {
  const model = config.model;
  const cache = AICache.getInstance();
  const limiter = RateLimiter.getInstance();
  
  // 1. Check cache
  const cacheKey = generateCacheKey(systemPrompt, userPrompt, model);
  const cached = await cache.get<AIResponse>(cacheKey);
  if (cached) {
    console.log(`[Cache HIT] Claude ${model}`);
    return { ...cached, cached: true };
  }
  
  // 2. Check rate limit
  const limitStatus = await limiter.checkLimit();
  if (!limitStatus.allowed) {
    throw new Error(limitStatus.reason!);
  }
  
  // 3. Call API with retry
  let retryCount = 0;
  const apiResponse = await retryWithBackoff(
    async () => {
      retryCount++;
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model.replace('claude-3-', 'claude-3-') + '-20240229',
          system: systemPrompt,
          messages: [
            { role: 'user', content: userPrompt }
          ],
          temperature: config.temperature,
          max_tokens: config.maxTokens
        }),
        signal: AbortSignal.timeout(60000)
      });

      if (!response.ok) {
        const error = await response.json();
        
        if (response.status === 401) {
          const err = new Error('Invalid Anthropic API key (401)');
          (err as any).retryable = false;
          throw err;
        } else if (response.status === 429) {
          throw new Error('Claude rate limit exceeded (429)');
        }
        
        throw new Error(`Claude API error: ${error.error?.message || 'Unknown error'}`);
      }
      
      return response.json();
    },
    { maxAttempts: 3 }
  );

  const content = apiResponse.content[0]?.text || '';
  const usage = apiResponse.usage || {};

  const aiResponse: AIResponse = {
    content,
    model,
    usage: {
      inputTokens: usage.input_tokens || 0,
      outputTokens: usage.output_tokens || 0,
      totalCost: calculateCost(model, usage.input_tokens || 0, usage.output_tokens || 0)
    },
    provider: 'anthropic',
    retryCount
  };

  // Cache and record
  await cache.set(cacheKey, aiResponse, 60);
  await limiter.recordRequest(aiResponse.usage.totalCost);

  return aiResponse;
}

/**
 * IMPROVED: Call Google Gemini API with retry, cache, rate limiting
 */
async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  config: AIProviderConfig
): Promise<AIResponse> {
  const model = config.model;
  const cache = AICache.getInstance();
  const limiter = RateLimiter.getInstance();
  
  // 1. Check cache
  const cacheKey = generateCacheKey(systemPrompt, userPrompt, model);
  const cached = await cache.get<AIResponse>(cacheKey);
  if (cached) {
    console.log(`[Cache HIT] Gemini ${model}`);
    return { ...cached, cached: true };
  }
  
  // 2. Check rate limit
  const limitStatus = await limiter.checkLimit();
  if (!limitStatus.allowed) {
    throw new Error(limitStatus.reason!);
  }
  
  // 3. Call API with retry
  let retryCount = 0;
  const modelName = model === 'gemini-pro' ? 'gemini-pro' : 'gemini-1.5-pro-latest';
  
  const apiResponse = await retryWithBackoff(
    async () => {
      retryCount++;
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `${systemPrompt}\n\n${userPrompt}`
              }]
            }],
            generationConfig: {
              temperature: config.temperature,
              maxOutputTokens: config.maxTokens
            }
          }),
          signal: AbortSignal.timeout(60000)
        }
      );

      if (!response.ok) {
        const error = await response.json();
        
        if (response.status === 401 || response.status === 403) {
          const err = new Error('Invalid Google API key (401/403)');
          (err as any).retryable = false;
          throw err;
        } else if (response.status === 429) {
          throw new Error('Gemini rate limit exceeded (429)');
        }
        
        throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
      }
      
      return response.json();
    },
    { maxAttempts: 3 }
  );

  const content = apiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Gemini doesn't provide token usage, estimate it
  const inputTokens = estimateTokens(systemPrompt + userPrompt);
  const outputTokens = estimateTokens(content);

  const aiResponse: AIResponse = {
    content,
    model,
    usage: {
      inputTokens,
      outputTokens,
      totalCost: calculateCost(model, inputTokens, outputTokens)
    },
    provider: 'google',
    retryCount
  };

  // Cache and record
  await cache.set(cacheKey, aiResponse, 60);
  await limiter.recordRequest(aiResponse.usage.totalCost);

  return aiResponse;
}

/**
 * Universal AI call function with all improvements
 */
export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  config: AIProviderConfig
): Promise<AIResponse> {
  const modelConfig = AI_MODELS[config.model];
  
  try {
    switch (modelConfig.provider) {
      case 'openai':
        return await callOpenAI(systemPrompt, userPrompt, config);
      case 'anthropic':
        return await callClaude(systemPrompt, userPrompt, config);
      case 'google':
        return await callGemini(systemPrompt, userPrompt, config);
      default:
        throw new Error(`Unknown provider: ${modelConfig.provider}`);
    }
  } catch (error: any) {
    const appError = handleError(error, 'en', {
      model: config.model,
      provider: modelConfig.provider
    });
    
    // Log error with context
    console.error(`[AI Call Failed] ${modelConfig.provider}/${config.model}:`, appError);
    
    throw error;
  }
}

/**
 * Get provider configuration from storage
 */
export async function getProviderConfig(preferredModel?: AIModel): Promise<AIProviderConfig> {
  const stored = await chrome.storage.local.get([
    'openai_api_key', 'anthropic_api_key', 'google_api_key',
    'encrypted_openai_api_key', 'encrypted_anthropic_api_key', 'encrypted_google_api_key',
    'preferred_model'
  ]);
  
  let model: AIModel = preferredModel || stored.preferred_model || 'gpt-4-turbo';
  const modelConfig = AI_MODELS[model];
  
  // Get API key for the provider (try encrypted first, fallback to unencrypted)
  let apiKey: string = '';
  switch (modelConfig.provider) {
    case 'openai':
      apiKey = stored.encrypted_openai_api_key || stored.openai_api_key || '';
      break;
    case 'anthropic':
      apiKey = stored.encrypted_anthropic_api_key || stored.anthropic_api_key || '';
      if (!apiKey) {
        console.warn('Anthropic API key not found, falling back to OpenAI');
        model = 'gpt-4-turbo';
        apiKey = stored.encrypted_openai_api_key || stored.openai_api_key || '';
      }
      break;
    case 'google':
      apiKey = stored.encrypted_google_api_key || stored.google_api_key || '';
      if (!apiKey) {
        console.warn('Google API key not found, falling back to OpenAI');
        model = 'gpt-4-turbo';
        apiKey = stored.encrypted_openai_api_key || stored.openai_api_key || '';
      }
      break;
  }

  if (!apiKey) {
    throw new Error('No API key found. Please configure your API keys in settings.');
  }

  return {
    provider: AI_MODELS[model].provider,
    apiKey,
    model,
    temperature: 0.7,
    maxTokens: 4096
  };
}

/**
 * Get recommended model for a task
 */
export function getRecommendedModel(task: 'resume' | 'cover-letter' | 'chat' | 'quick-qa' | 'analysis'): AIModel {
  const recommendations: Record<string, AIModel> = {
    'resume': 'gpt-4-turbo',
    'cover-letter': 'claude-3-sonnet',
    'chat': 'gpt-4-turbo',
    'quick-qa': 'gpt-3.5-turbo',
    'analysis': 'claude-3-opus'
  };
  return recommendations[task] || 'gpt-4-turbo';
}

/**
 * Usage statistics
 */
export interface UsageStats {
  totalCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  requestsByModel: Record<AIModel, number>;
  costByModel: Record<AIModel, number>;
  cacheHits: number;
  cacheMisses: number;
  totalRequests: number;
}

const USAGE_STATS_KEY = 'ai_usage_stats';

export async function trackUsage(response: AIResponse): Promise<void> {
  const stored = await chrome.storage.local.get(USAGE_STATS_KEY);
  const stats: UsageStats = stored[USAGE_STATS_KEY] || {
    totalCost: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    requestsByModel: {},
    costByModel: {},
    cacheHits: 0,
    cacheMisses: 0,
    totalRequests: 0
  };

  stats.totalCost += response.usage.totalCost;
  stats.totalInputTokens += response.usage.inputTokens;
  stats.totalOutputTokens += response.usage.outputTokens;
  stats.requestsByModel[response.model] = (stats.requestsByModel[response.model] || 0) + 1;
  stats.costByModel[response.model] = (stats.costByModel[response.model] || 0) + response.usage.totalCost;
  stats.totalRequests += 1;
  
  if (response.cached) {
    stats.cacheHits += 1;
  } else {
    stats.cacheMisses += 1;
  }

  await chrome.storage.local.set({ [USAGE_STATS_KEY]: stats });
}

export async function getUsageStats(): Promise<UsageStats> {
  const stored = await chrome.storage.local.get(USAGE_STATS_KEY);
  return stored[USAGE_STATS_KEY] || {
    totalCost: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    requestsByModel: {},
    costByModel: {},
    cacheHits: 0,
    cacheMisses: 0,
    totalRequests: 0
  };
}

export async function resetUsageStats(): Promise<void> {
  await chrome.storage.local.remove(USAGE_STATS_KEY);
}

/**
 * Get models by provider
 */
export function getModelsByProvider(provider: AIProvider): AIModelConfig[] {
  return Object.values(AI_MODELS).filter(m => m.provider === provider);
}
