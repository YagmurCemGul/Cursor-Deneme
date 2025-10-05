/**
 * Token Counter Utility
 * Estimates token count for various AI providers
 */

export interface TokenCount {
  prompt: number;
  completion: number;
  total: number;
}

/**
 * Simple token estimator based on word count and characters
 * More accurate tokenizers would require provider-specific libraries
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  
  // Average estimation: ~4 characters per token for English text
  // This is a rough approximation, actual tokenization varies by model
  const charCount = text.length;
  const wordCount = text.split(/\s+/).length;
  
  // Use character-based estimation with word adjustment
  return Math.ceil((charCount / 4) + (wordCount * 0.3));
}

/**
 * Count tokens for a conversation with system and user messages
 */
export function countConversationTokens(
  systemPrompt: string,
  userPrompt: string,
  completion?: string
): TokenCount {
  const promptTokens = estimateTokens(systemPrompt) + estimateTokens(userPrompt);
  const completionTokens = completion ? estimateTokens(completion) : 0;
  
  // Add overhead for message formatting (~3 tokens per message)
  const overhead = 6; // 3 tokens * 2 messages
  
  return {
    prompt: promptTokens + overhead,
    completion: completionTokens,
    total: promptTokens + completionTokens + overhead,
  };
}

/**
 * More accurate token counting for OpenAI models using tiktoken-like logic
 * This is a simplified version - for production, consider using the actual tiktoken library
 */
export function countTokensAdvanced(text: string, model: string = 'gpt-4'): number {
  if (!text) return 0;
  
  // Different models have different token characteristics
  const baseEstimate = estimateTokens(text);
  
  // Adjust based on model type
  if (model.includes('gpt-4')) {
    return Math.ceil(baseEstimate * 1.0); // GPT-4 tokenization
  } else if (model.includes('gpt-3.5')) {
    return Math.ceil(baseEstimate * 0.95);
  } else if (model.includes('claude')) {
    return Math.ceil(baseEstimate * 1.05);
  } else if (model.includes('gemini')) {
    return Math.ceil(baseEstimate * 0.9);
  }
  
  return baseEstimate;
}

/**
 * Estimate tokens for CV data
 */
export function estimateCVTokens(cvData: any): number {
  const cvString = JSON.stringify(cvData, null, 2);
  return estimateTokens(cvString);
}

/**
 * Check if token count is within limits
 */
export function checkTokenLimit(
  tokenCount: number,
  model: string
): { withinLimit: boolean; limit: number; usage: number } {
  const limits: Record<string, number> = {
    'gpt-4o': 128000,
    'gpt-4o-mini': 128000,
    'gpt-4-turbo': 128000,
    'gpt-4': 8192,
    'gpt-3.5-turbo': 16385,
    'claude-3-5-sonnet': 200000,
    'claude-3-opus': 200000,
    'claude-3-haiku': 200000,
    'gemini-pro': 32768,
    'gemini-1.5-pro': 1000000,
    'gemini-1.5-flash': 1000000,
  };
  
  const limit = limits[model] || 8192; // Default to 8K if unknown
  const usage = (tokenCount / limit) * 100;
  
  return {
    withinLimit: tokenCount <= limit,
    limit,
    usage,
  };
}

/**
 * Format token count for display
 */
export function formatTokenCount(count: number): string {
  if (count < 1000) {
    return count.toString();
  } else if (count < 1000000) {
    return `${(count / 1000).toFixed(1)}K`;
  } else {
    return `${(count / 1000000).toFixed(2)}M`;
  }
}
