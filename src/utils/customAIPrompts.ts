import { AIService } from './aiService';

/**
 * Custom AI Prompts System
 * Allows users to create and manage custom AI prompts for job descriptions
 */

export interface CustomPrompt {
  id: string;
  name: string;
  description: string;
  category: 'generation' | 'optimization' | 'analysis' | 'transformation';
  promptTemplate: string;
  variables: PromptVariable[];
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  isPublic?: boolean;
  rating?: number;
  author?: string;
}

export interface PromptVariable {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  required: boolean;
  defaultValue?: string;
  options?: string[];
  placeholder?: string;
  description?: string;
}

export interface PromptExecution {
  promptId: string;
  variables: Record<string, string>;
  result: string;
  executedAt: string;
  provider: 'openai' | 'gemini' | 'claude';
  error?: string;
}

/**
 * Built-in prompt templates
 */
export const BUILTIN_PROMPTS: CustomPrompt[] = [
  {
    id: 'job-description-generator',
    name: 'Job Description Generator',
    description: 'Generate a complete job description from basic information',
    category: 'generation',
    promptTemplate: `Create a professional job description for a {{role}} position at {{company}}.

Company Context: {{company_context}}
Role Level: {{level}}
Department: {{department}}
Location: {{location}}
Remote Options: {{remote_options}}

Key Responsibilities (one per line):
{{responsibilities}}

Required Qualifications:
{{qualifications}}

Nice to Have:
{{nice_to_have}}

Benefits:
{{benefits}}

Generate a compelling, ATS-optimized job description that:
- Uses action verbs and clear language
- Highlights company culture and values
- Includes specific requirements
- Is structured with clear sections
- Appeals to qualified candidates
- Is 300-500 words`,
    variables: [
      { name: 'role', label: 'Job Title', type: 'text', required: true, placeholder: 'e.g., Senior Software Engineer' },
      { name: 'company', label: 'Company Name', type: 'text', required: true },
      { name: 'company_context', label: 'Company Context', type: 'textarea', required: true, placeholder: 'Brief description of company, industry, and mission' },
      { name: 'level', label: 'Level', type: 'select', required: true, options: ['Entry', 'Mid', 'Senior', 'Lead', 'Executive'] },
      { name: 'department', label: 'Department', type: 'text', required: true },
      { name: 'location', label: 'Location', type: 'text', required: true },
      { name: 'remote_options', label: 'Remote Options', type: 'select', required: true, options: ['On-site', 'Hybrid', 'Remote', 'Flexible'] },
      { name: 'responsibilities', label: 'Key Responsibilities', type: 'textarea', required: true, description: 'List 5-7 main responsibilities, one per line' },
      { name: 'qualifications', label: 'Required Qualifications', type: 'textarea', required: true, description: 'List required skills and experience' },
      { name: 'nice_to_have', label: 'Nice to Have', type: 'textarea', required: false, description: 'Optional qualifications' },
      { name: 'benefits', label: 'Benefits', type: 'textarea', required: false, description: 'Company benefits and perks' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: 'diversity-optimizer',
    name: 'Diversity & Inclusion Optimizer',
    description: 'Optimize job description for inclusive language',
    category: 'optimization',
    promptTemplate: `Review and optimize this job description for diversity and inclusion:

{{job_description}}

Optimization Goals:
- Remove gender-coded language
- Replace aggressive/militaristic terms with inclusive alternatives
- Ensure accessibility considerations
- Broaden qualification language to reduce bias
- Include diversity statement
- Use gender-neutral pronouns
- Avoid age-related implications

Provide the optimized version with explanations of key changes.`,
    variables: [
      { name: 'job_description', label: 'Job Description', type: 'textarea', required: true, placeholder: 'Paste the job description to optimize' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: 'salary-recommender',
    name: 'Salary Range Recommender',
    description: 'Get AI-powered salary recommendations based on role and market data',
    category: 'analysis',
    promptTemplate: `Analyze and recommend a competitive salary range for this position:

Role: {{role}}
Level: {{level}}
Location: {{location}}
Industry: {{industry}}
Company Size: {{company_size}}
Required Experience: {{experience_years}} years

Skills Required:
{{required_skills}}

Provide:
1. Recommended salary range (low, mid, high)
2. Market analysis
3. Factors affecting the range
4. Regional considerations
5. Benefits to stay competitive

Base recommendations on current market data and industry standards.`,
    variables: [
      { name: 'role', label: 'Job Title', type: 'text', required: true },
      { name: 'level', label: 'Level', type: 'select', required: true, options: ['Entry', 'Mid', 'Senior', 'Lead', 'Executive'] },
      { name: 'location', label: 'Location', type: 'text', required: true },
      { name: 'industry', label: 'Industry', type: 'text', required: true },
      { name: 'company_size', label: 'Company Size', type: 'select', required: true, options: ['Startup (<50)', 'Small (50-200)', 'Medium (200-1000)', 'Large (1000-5000)', 'Enterprise (5000+)'] },
      { name: 'experience_years', label: 'Years of Experience Required', type: 'number', required: true },
      { name: 'required_skills', label: 'Required Skills', type: 'textarea', required: true, description: 'List key technical and soft skills' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: 'skills-extractor',
    name: 'Skills Extractor & Categorizer',
    description: 'Extract and categorize all skills from a job description',
    category: 'analysis',
    promptTemplate: `Analyze this job description and extract all skills mentioned:

{{job_description}}

Categorize skills into:
1. Technical Skills (programming languages, frameworks, tools)
2. Soft Skills (communication, leadership, etc.)
3. Domain Knowledge (industry-specific)
4. Certifications & Qualifications
5. Years of Experience Requirements

For each skill, indicate:
- Skill name
- Category
- Whether it's required or nice-to-have
- Proficiency level mentioned (if any)

Provide the results in a structured format.`,
    variables: [
      { name: 'job_description', label: 'Job Description', type: 'textarea', required: true, placeholder: 'Paste the complete job description' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: 'tone-transformer',
    name: 'Tone Transformer',
    description: 'Transform job description tone (formal, casual, inspiring, etc.)',
    category: 'transformation',
    promptTemplate: `Transform this job description to match the target tone:

Original Description:
{{job_description}}

Target Tone: {{target_tone}}
Target Audience: {{target_audience}}
Company Voice: {{company_voice}}

Transform the description while:
- Maintaining all essential information
- Preserving key requirements
- Matching the target tone
- Appealing to the target audience
- Reflecting company voice and culture

Provide the transformed version.`,
    variables: [
      { name: 'job_description', label: 'Job Description', type: 'textarea', required: true },
      { name: 'target_tone', label: 'Target Tone', type: 'select', required: true, options: ['Professional/Formal', 'Casual/Friendly', 'Inspiring/Motivational', 'Technical/Precise', 'Creative/Fun', 'Urgent/Action-oriented'] },
      { name: 'target_audience', label: 'Target Audience', type: 'text', required: true, placeholder: 'e.g., Recent graduates, Senior professionals, Career changers' },
      { name: 'company_voice', label: 'Company Voice', type: 'textarea', required: false, description: 'Describe your company\'s communication style' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0,
  },
];

/**
 * Execute a custom prompt with variables
 */
export async function executeCustomPrompt(
  prompt: CustomPrompt,
  variables: Record<string, string>,
  apiKey: string,
  provider: 'openai' | 'gemini' | 'claude'
): Promise<string> {
  // Validate required variables
  const missingVars = prompt.variables
    .filter(v => v.required && !variables[v.name])
    .map(v => v.label);

  if (missingVars.length > 0) {
    throw new Error(`Missing required variables: ${missingVars.join(', ')}`);
  }

  // Replace variables in template
  let processedPrompt = prompt.promptTemplate;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    processedPrompt = processedPrompt.replace(regex, value || '');
  });

  // Execute with AI
  try {
    const result = await AIService.generateText(processedPrompt, apiKey, provider);
    return result;
  } catch (error) {
    throw new Error(`Failed to execute prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate prompt template
 */
export function validatePromptTemplate(template: string, variables: PromptVariable[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for empty template
  if (!template.trim()) {
    errors.push('Prompt template cannot be empty');
  }

  // Extract variable references from template
  const variableMatches = template.match(/\{\{([^}]+)\}\}/g) || [];
  const referencedVars = variableMatches.map(match => 
    match.replace(/\{\{|\}\}/g, '').trim()
  );

  // Check if all referenced variables are defined
  const definedVarNames = variables.map(v => v.name);
  referencedVars.forEach(ref => {
    if (!definedVarNames.includes(ref)) {
      errors.push(`Variable {{${ref}}} is referenced but not defined`);
    }
  });

  // Check if all defined variables are used
  definedVarNames.forEach(name => {
    if (!referencedVars.includes(name)) {
      errors.push(`Variable ${name} is defined but never used in template`);
    }
  });

  // Check for duplicate variable names
  const varNames = variables.map(v => v.name);
  const duplicates = varNames.filter((name, index) => varNames.indexOf(name) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate variable names: ${duplicates.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create a new custom prompt
 */
export function createCustomPrompt(
  data: Omit<CustomPrompt, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>
): CustomPrompt {
  // Validate before creating
  const validation = validatePromptTemplate(data.promptTemplate, data.variables);
  if (!validation.valid) {
    throw new Error(`Invalid prompt template: ${validation.errors.join(', ')}`);
  }

  return {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0,
  };
}

/**
 * Get prompt suggestions based on description content
 */
export function suggestPrompts(
  description: string,
  availablePrompts: CustomPrompt[]
): CustomPrompt[] {
  const suggestions: Array<{ prompt: CustomPrompt; score: number }> = [];

  availablePrompts.forEach(prompt => {
    let score = 0;

    // Score based on category relevance
    if (description.length < 100 && prompt.category === 'generation') {
      score += 5;
    } else if (description.length >= 100 && prompt.category === 'optimization') {
      score += 3;
    } else if (prompt.category === 'analysis') {
      score += 2;
    }

    // Score based on keyword matches
    const descLower = description.toLowerCase();
    const promptLower = prompt.description.toLowerCase();
    
    const keywords = ['diversity', 'inclusive', 'salary', 'skills', 'tone', 'ats'];
    keywords.forEach(keyword => {
      if (descLower.includes(keyword) && promptLower.includes(keyword)) {
        score += 2;
      }
    });

    // Score based on usage count (popular prompts)
    score += Math.min(prompt.usageCount * 0.1, 3);

    suggestions.push({ prompt, score });
  });

  // Sort by score and return top suggestions
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.prompt);
}

/**
 * Export custom prompts
 */
export function exportCustomPrompts(prompts: CustomPrompt[]): string {
  return JSON.stringify(prompts, null, 2);
}

/**
 * Import custom prompts
 */
export function importCustomPrompts(jsonString: string): CustomPrompt[] {
  try {
    const data = JSON.parse(jsonString);
    if (!Array.isArray(data)) {
      throw new Error('Invalid prompts format');
    }

    // Validate each prompt
    return data.map(prompt => {
      const validation = validatePromptTemplate(prompt.promptTemplate, prompt.variables);
      if (!validation.valid) {
        throw new Error(`Invalid prompt "${prompt.name}": ${validation.errors.join(', ')}`);
      }
      return prompt;
    });
  } catch (error) {
    throw new Error(`Failed to import prompts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Duplicate a prompt with modifications
 */
export function duplicatePrompt(
  original: CustomPrompt,
  modifications?: Partial<CustomPrompt>
): CustomPrompt {
  return {
    ...original,
    ...modifications,
    id: crypto.randomUUID(),
    name: modifications?.name || `${original.name} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0,
  };
}

/**
 * Get prompt usage statistics
 */
export function getPromptStatistics(
  prompts: CustomPrompt[]
): {
  totalPrompts: number;
  totalUsage: number;
  mostUsedPrompt: string;
  byCategory: Record<string, number>;
  averageUsage: number;
} {
  const totalPrompts = prompts.length;
  const totalUsage = prompts.reduce((sum, p) => sum + p.usageCount, 0);
  const mostUsed = prompts.reduce((max, p) => p.usageCount > max.usageCount ? p : max, prompts[0]);
  
  const byCategory: Record<string, number> = {};
  prompts.forEach(p => {
    byCategory[p.category] = (byCategory[p.category] || 0) + 1;
  });

  return {
    totalPrompts,
    totalUsage,
    mostUsedPrompt: mostUsed?.name || 'None',
    byCategory,
    averageUsage: totalPrompts > 0 ? totalUsage / totalPrompts : 0,
  };
}
