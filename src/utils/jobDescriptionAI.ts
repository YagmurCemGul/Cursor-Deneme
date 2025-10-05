import { AIService } from './aiService';
import { logger } from './logger';

/**
 * Generate AI-powered suggestions for job descriptions
 */
export async function generateDescriptionSuggestions(
  context: {
    role?: string;
    company?: string;
    industry?: string;
    skills?: string[];
    experience?: string;
  },
  apiKey: string,
  provider: 'openai' | 'gemini' | 'claude'
): Promise<string[]> {
  const prompt = buildSuggestionPrompt(context);
  
  try {
    const response = await AIService.generateText(prompt, apiKey, provider);
    return parseSuggestions(response);
  } catch (error) {
    logger.error('Failed to generate AI suggestions:', error);
    throw error;
  }
}

/**
 * Build prompt for AI suggestion generation
 */
function buildSuggestionPrompt(context: {
  role?: string;
  company?: string;
  industry?: string;
  skills?: string[];
  experience?: string;
}): string {
  const parts = [
    'Generate 5 professional job description snippets for:',
  ];

  if (context.role) {
    parts.push(`Role: ${context.role}`);
  }

  if (context.company) {
    parts.push(`Company: ${context.company}`);
  }

  if (context.industry) {
    parts.push(`Industry: ${context.industry}`);
  }

  if (context.skills && context.skills.length > 0) {
    parts.push(`Required Skills: ${context.skills.join(', ')}`);
  }

  if (context.experience) {
    parts.push(`Experience Level: ${context.experience}`);
  }

  parts.push('');
  parts.push('Each description should:');
  parts.push('- Be concise and professional');
  parts.push('- Use action verbs');
  parts.push('- Include quantifiable metrics where applicable');
  parts.push('- Be ATS-optimized with relevant keywords');
  parts.push('- Be between 100-200 words');
  parts.push('');
  parts.push('Format each suggestion as a numbered list (1. 2. 3. etc.)');

  return parts.join('\n');
}

/**
 * Parse AI response into individual suggestions
 */
function parseSuggestions(response: string): string[] {
  // Try to split by numbered list format
  const numberPattern = /^\d+\.\s+/gm;
  const parts = response.split(numberPattern).filter(s => s.trim());

  if (parts.length > 1) {
    return parts.map(s => s.trim()).filter(Boolean);
  }

  // Fallback: split by double newlines
  const paragraphs = response
    .split(/\n\n+/)
    .map(s => s.trim())
    .filter(Boolean);

  return paragraphs.length > 0 ? paragraphs : [response.trim()];
}

/**
 * Optimize existing job description with AI
 */
export async function optimizeDescription(
  description: string,
  targetKeywords: string[],
  apiKey: string,
  provider: 'openai' | 'gemini' | 'claude'
): Promise<string> {
  const prompt = `
Optimize the following job description to be more ATS-friendly and include these keywords naturally: ${targetKeywords.join(', ')}

Original Description:
${description}

Provide an improved version that:
- Includes the target keywords naturally
- Uses strong action verbs
- Is well-structured and professional
- Maintains the original meaning
- Is optimized for ATS scanning

Optimized Description:
`.trim();

  try {
    return await AIService.generateText(prompt, apiKey, provider);
  } catch (error) {
    console.error('Failed to optimize description:', error);
    throw error;
  }
}

/**
 * Extract keywords from job description using AI
 */
export async function extractKeywords(
  description: string,
  apiKey: string,
  provider: 'openai' | 'gemini' | 'claude'
): Promise<string[]> {
  const prompt = `
Extract the most important keywords and skills from this job description. 
Focus on technical skills, qualifications, and key requirements.

Job Description:
${description}

Provide a comma-separated list of keywords (10-15 keywords).
`.trim();

  try {
    const response = await AIService.generateText(prompt, apiKey, provider);
    return response
      .split(',')
      .map(k => k.trim())
      .filter(Boolean)
      .slice(0, 15);
  } catch (error) {
    console.error('Failed to extract keywords:', error);
    throw error;
  }
}

/**
 * Generate template variables suggestions based on description
 */
export async function suggestTemplateVariables(
  description: string,
  apiKey: string,
  provider: 'openai' | 'gemini' | 'claude'
): Promise<Record<string, string[]>> {
  const prompt = `
Analyze this job description and suggest template variables that could be parameterized.

Job Description:
${description}

Suggest variables in the format:
{{variable_name}}: [suggestion1, suggestion2, suggestion3]

Focus on: company names, role titles, locations, departments, technologies, etc.
`.trim();

  try {
    const response = await AIService.generateText(prompt, apiKey, provider);
    return parseVariableSuggestions(response);
  } catch (error) {
    console.error('Failed to suggest variables:', error);
    return {};
  }
}

/**
 * Parse variable suggestions from AI response
 */
function parseVariableSuggestions(response: string): Record<string, string[]> {
  const suggestions: Record<string, string[]> = {};
  const lines = response.split('\n').filter(line => line.trim());

  lines.forEach(line => {
    const match = line.match(/\{\{(\w+)\}\}:\s*\[([^\]]+)\]/);
    if (match) {
      const varName = match[1];
      const values = match[2].split(',').map(v => v.trim());
      suggestions[varName] = values;
    }
  });

  return suggestions;
}
