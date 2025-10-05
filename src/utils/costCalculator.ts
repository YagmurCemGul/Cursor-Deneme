/**
 * Cost Calculator for AI API Usage
 * Calculates costs based on token usage and provider pricing
 */

import { logger } from './logger';

export interface PricingInfo {
  provider: string;
  model: string;
  inputCostPer1k: number; // Cost per 1000 input tokens in USD
  outputCostPer1k: number; // Cost per 1000 output tokens in USD
}

/**
 * Pricing information for various AI providers
 * Updated as of October 2025
 */
export const PRICING_TABLE: Record<string, PricingInfo> = {
  // OpenAI
  'gpt-4o': {
    provider: 'openai',
    model: 'gpt-4o',
    inputCostPer1k: 0.0025,
    outputCostPer1k: 0.01,
  },
  'gpt-4o-mini': {
    provider: 'openai',
    model: 'gpt-4o-mini',
    inputCostPer1k: 0.00015,
    outputCostPer1k: 0.0006,
  },
  'gpt-4-turbo': {
    provider: 'openai',
    model: 'gpt-4-turbo',
    inputCostPer1k: 0.01,
    outputCostPer1k: 0.03,
  },
  'gpt-4': {
    provider: 'openai',
    model: 'gpt-4',
    inputCostPer1k: 0.03,
    outputCostPer1k: 0.06,
  },
  'gpt-3.5-turbo': {
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    inputCostPer1k: 0.0005,
    outputCostPer1k: 0.0015,
  },
  
  // Anthropic Claude
  'claude-3-5-sonnet-20241022': {
    provider: 'claude',
    model: 'claude-3-5-sonnet-20241022',
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.015,
  },
  'claude-3-opus-20240229': {
    provider: 'claude',
    model: 'claude-3-opus-20240229',
    inputCostPer1k: 0.015,
    outputCostPer1k: 0.075,
  },
  'claude-3-haiku-20240307': {
    provider: 'claude',
    model: 'claude-3-haiku-20240307',
    inputCostPer1k: 0.00025,
    outputCostPer1k: 0.00125,
  },
  
  // Google Gemini
  'gemini-pro': {
    provider: 'gemini',
    model: 'gemini-pro',
    inputCostPer1k: 0.000125,
    outputCostPer1k: 0.000375,
  },
  'gemini-1.5-pro': {
    provider: 'gemini',
    model: 'gemini-1.5-pro',
    inputCostPer1k: 0.00125,
    outputCostPer1k: 0.005,
  },
  'gemini-1.5-flash': {
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    inputCostPer1k: 0.000075,
    outputCostPer1k: 0.0003,
  },
};

/**
 * Calculate cost for a single API call
 */
export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = PRICING_TABLE[model];
  
  if (!pricing) {
    // Azure OpenAI uses same pricing as OpenAI
    if (model.includes('gpt-4o-mini')) {
      return calculateCost('gpt-4o-mini', inputTokens, outputTokens);
    } else if (model.includes('gpt-4o')) {
      return calculateCost('gpt-4o', inputTokens, outputTokens);
    } else if (model.includes('gpt-4')) {
      return calculateCost('gpt-4', inputTokens, outputTokens);
    } else if (model.includes('gpt-3.5')) {
      return calculateCost('gpt-3.5-turbo', inputTokens, outputTokens);
    }
    
    // Ollama is free (local)
    if (model.includes('llama') || model.includes('mistral')) {
      return 0;
    }
    
    // Default fallback
    logger.warn(`No pricing info for model: ${model}, using default`);
    return 0;
  }
  
  const inputCost = (inputTokens / 1000) * pricing.inputCostPer1k;
  const outputCost = (outputTokens / 1000) * pricing.outputCostPer1k;
  
  return inputCost + outputCost;
}

/**
 * Calculate total cost for multiple API calls
 */
export function calculateTotalCost(
  usageRecords: Array<{
    model: string;
    inputTokens: number;
    outputTokens: number;
  }>
): number {
  return usageRecords.reduce((total, record) => {
    return total + calculateCost(record.model, record.inputTokens, record.outputTokens);
  }, 0);
}

/**
 * Estimate cost for a planned operation
 */
export function estimateOperationCost(
  model: string,
  estimatedInputTokens: number,
  estimatedOutputTokens: number
): {
  cost: number;
  formattedCost: string;
  breakdown: {
    inputCost: number;
    outputCost: number;
  };
} {
  const cost = calculateCost(model, estimatedInputTokens, estimatedOutputTokens);
  const pricing = PRICING_TABLE[model];
  
  const inputCost = pricing
    ? (estimatedInputTokens / 1000) * pricing.inputCostPer1k
    : 0;
  const outputCost = pricing
    ? (estimatedOutputTokens / 1000) * pricing.outputCostPer1k
    : 0;
  
  return {
    cost,
    formattedCost: formatCost(cost),
    breakdown: {
      inputCost,
      outputCost,
    },
  };
}

/**
 * Format cost for display
 */
export function formatCost(cost: number): string {
  if (cost === 0) {
    return '$0.00 (Free)';
  } else if (cost < 0.01) {
    return `$${cost.toFixed(4)}`;
  } else if (cost < 1) {
    return `$${cost.toFixed(3)}`;
  } else {
    return `$${cost.toFixed(2)}`;
  }
}

/**
 * Get pricing info for a model
 */
export function getPricingInfo(model: string): PricingInfo | null {
  return PRICING_TABLE[model] || null;
}

/**
 * Compare costs across different models for the same operation
 */
export function compareCosts(
  models: string[],
  inputTokens: number,
  outputTokens: number
): Array<{
  model: string;
  cost: number;
  formattedCost: string;
  savings?: number;
}> {
  const costs = models.map((model) => ({
    model,
    cost: calculateCost(model, inputTokens, outputTokens),
    formattedCost: '',
  }));
  
  // Sort by cost (lowest first)
  costs.sort((a, b) => a.cost - b.cost);
  
  // Calculate savings compared to cheapest option
  const cheapestCost = costs[0].cost;
  
  return costs.map((item) => ({
    ...item,
    formattedCost: formatCost(item.cost),
    savings: item.cost > cheapestCost ? item.cost - cheapestCost : 0,
  }));
}

/**
 * Calculate monthly cost projection
 */
export function projectMonthlyCost(
  averageDailyCalls: number,
  averageTokensPerCall: { input: number; output: number },
  model: string
): {
  daily: number;
  weekly: number;
  monthly: number;
  formatted: {
    daily: string;
    weekly: string;
    monthly: string;
  };
} {
  const costPerCall = calculateCost(
    model,
    averageTokensPerCall.input,
    averageTokensPerCall.output
  );
  
  const daily = costPerCall * averageDailyCalls;
  const weekly = daily * 7;
  const monthly = daily * 30;
  
  return {
    daily,
    weekly,
    monthly,
    formatted: {
      daily: formatCost(daily),
      weekly: formatCost(weekly),
      monthly: formatCost(monthly),
    },
  };
}
