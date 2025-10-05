import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// All AI routes require authentication
router.use(authMiddleware);

/**
 * POST /api/ai/generate
 * Generate AI response (OpenAI, Claude, or Gemini)
 * 
 * API keys are stored server-side for security!
 */
router.post('/generate', async (req: AuthRequest, res: Response) => {
  try {
    const { prompt, provider = 'openai', model, systemPrompt, temperature = 0.7 } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Prompt is required'
      });
    }

    // Determine which API to use
    let apiKey: string | undefined;
    let apiUrl: string;
    let requestBody: any;
    let actualModel: string;

    switch (provider) {
      case 'openai':
        apiKey = process.env.OPENAI_API_KEY;
        apiUrl = 'https://api.openai.com/v1/chat/completions';
        actualModel = model || 'gpt-3.5-turbo';
        requestBody = {
          model: actualModel,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt }
          ],
          temperature
        };
        break;

      case 'anthropic':
        apiKey = process.env.ANTHROPIC_API_KEY;
        apiUrl = 'https://api.anthropic.com/v1/messages';
        actualModel = model || 'claude-3-haiku-20240307';
        requestBody = {
          model: actualModel,
          max_tokens: 2000,
          temperature,
          ...(systemPrompt && { system: systemPrompt }),
          messages: [
            { role: 'user', content: prompt }
          ]
        };
        break;

      case 'google':
        apiKey = process.env.GOOGLE_API_KEY;
        actualModel = model || 'gemini-pro';
        apiUrl = `https://generativelanguage.googleapis.com/v1/models/${actualModel}:generateContent?key=${apiKey}`;
        requestBody = {
          contents: [{
            parts: [{
              text: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt
            }]
          }],
          generationConfig: {
            temperature,
            maxOutputTokens: 2000
          }
        };
        break;

      default:
        return res.status(400).json({
          error: 'Invalid Provider',
          message: 'Provider must be openai, anthropic, or google'
        });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'Configuration Error',
        message: `${provider} API key not configured on server`
      });
    }

    // Make API call
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (provider === 'openai') {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (provider === 'anthropic') {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
    }
    // Google uses API key in URL

    const startTime = Date.now();
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error(`[AI ${provider}] Error:`, error);
      
      return res.status(response.status).json({
        error: `${provider} API Error`,
        message: error.error?.message || error.message || 'Unknown error',
        statusCode: response.status
      });
    }

    const data = await response.json();

    // Extract content based on provider
    let content: string;
    let usage: any = {};

    switch (provider) {
      case 'openai':
        content = data.choices?.[0]?.message?.content || '';
        usage = data.usage || {};
        break;

      case 'anthropic':
        content = data.content?.[0]?.text || '';
        usage = data.usage || {};
        break;

      case 'google':
        content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        // Gemini doesn't provide usage in response, estimate it
        usage = {
          prompt_tokens: Math.ceil(prompt.length / 4),
          completion_tokens: Math.ceil(content.length / 4)
        };
        break;
    }

    // Track usage in database
    const inputTokens = usage.prompt_tokens || usage.input_tokens || 0;
    const outputTokens = usage.completion_tokens || usage.output_tokens || 0;
    const totalCost = calculateCost(provider, actualModel, inputTokens, outputTokens);

    await prisma.apiUsage.create({
      data: {
        userId: req.userId!,
        provider,
        model: actualModel,
        inputTokens,
        outputTokens,
        totalCost
      }
    });

    res.json({
      content,
      provider,
      model: actualModel,
      usage: {
        inputTokens,
        outputTokens,
        totalCost
      },
      latency
    });
  } catch (error: any) {
    console.error('[AI Generate] Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to generate AI response'
    });
  }
});

/**
 * Calculate API cost based on provider and usage
 */
function calculateCost(provider: string, model: string, inputTokens: number, outputTokens: number): number {
  const costs: Record<string, { input: number; output: number }> = {
    // OpenAI pricing (per 1k tokens)
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    
    // Anthropic pricing
    'claude-3-opus': { input: 0.015, output: 0.075 },
    'claude-3-sonnet': { input: 0.003, output: 0.015 },
    'claude-3-haiku': { input: 0.00025, output: 0.00125 },
    
    // Google pricing
    'gemini-pro': { input: 0.00025, output: 0.0005 },
    'gemini-1.5-pro': { input: 0.00125, output: 0.005 }
  };

  const pricing = costs[model] || { input: 0, output: 0 };
  
  return (inputTokens / 1000) * pricing.input + (outputTokens / 1000) * pricing.output;
}

export default router;
