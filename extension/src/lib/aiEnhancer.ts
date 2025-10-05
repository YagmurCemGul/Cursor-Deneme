import { callOpenAI } from './ai';

export interface EnhancementOptions {
  tone?: 'professional' | 'friendly' | 'technical' | 'executive';
  length?: 'concise' | 'detailed' | 'extensive';
  focus?: 'achievements' | 'responsibilities' | 'skills' | 'impact';
  includeMetrics?: boolean;
  industryContext?: string;
}

export interface EnhancementResult {
  original: string;
  enhanced: string;
  suggestions: string[];
  improvements: string[];
}

export async function enhanceDescription(
  description: string,
  context: {
    type: 'experience' | 'project' | 'education' | 'summary';
    title?: string;
    company?: string;
    role?: string;
  },
  options: EnhancementOptions = {}
): Promise<EnhancementResult> {
  const {
    tone = 'professional',
    length = 'detailed',
    focus = 'achievements',
    includeMetrics = true,
    industryContext,
  } = options;

  const lengthGuide = {
    concise: '2-3 bullet points, each 1 sentence',
    detailed: '3-5 bullet points, each 1-2 sentences',
    extensive: '5-7 bullet points, each 2-3 sentences',
  };

  const toneGuide = {
    professional: 'formal, business-appropriate language',
    friendly: 'approachable yet professional language',
    technical: 'technical terminology and industry-specific language',
    executive: 'strategic, high-level language focusing on leadership and impact',
  };

  const prompt = `You are an expert resume writer. Enhance the following ${context.type} description.

CONTEXT:
- Type: ${context.type}
${context.title ? `- Title: ${context.title}` : ''}
${context.company ? `- Company: ${context.company}` : ''}
${context.role ? `- Role: ${context.role}` : ''}
${industryContext ? `- Industry: ${industryContext}` : ''}

ORIGINAL DESCRIPTION:
${description}

ENHANCEMENT REQUIREMENTS:
- Tone: ${tone} (${toneGuide[tone]})
- Length: ${length} (${lengthGuide[length]})
- Focus: ${focus}
${includeMetrics ? '- Include quantifiable metrics and numbers where possible' : ''}
- Use strong action verbs
- Highlight achievements and impact
- Make it ATS-friendly
- Format as bullet points starting with •

IMPORTANT:
1. Start each bullet with a strong action verb
2. Include specific achievements and results
3. Quantify impact with numbers/percentages when possible
4. Focus on what YOU did and the impact YOU made
5. Use past tense for completed work, present for current
6. Keep it concise and impactful
7. Avoid generic statements

Return ONLY the enhanced bullet points, nothing else.`;

  try {
    const enhanced = await callOpenAI('You are an expert resume writer.', prompt, { temperature: 0.7 });
    
    // Extract improvements made
    const improvements = analyzeImprovements(description, enhanced);
    
    // Generate additional suggestions
    const suggestions = generateSuggestions(description, enhanced, context);

    return {
      original: description,
      enhanced: enhanced.trim(),
      suggestions,
      improvements,
    };
  } catch (error) {
    console.error('Enhancement error:', error);
    throw new Error('Failed to enhance description. Please check your API key and try again.');
  }
}

export async function generateBulletPoints(
  role: string,
  company: string,
  achievements: string[] = [],
  options: EnhancementOptions = {}
): Promise<string[]> {
  const {
    tone = 'professional',
    length = 'detailed',
    industryContext,
  } = options;

  const prompt = `Generate professional bullet points for a resume.

ROLE: ${role}
COMPANY: ${company}
${industryContext ? `INDUSTRY: ${industryContext}` : ''}
${achievements.length > 0 ? `KEY ACHIEVEMENTS: ${achievements.join(', ')}` : ''}

Generate ${length === 'concise' ? '3' : length === 'detailed' ? '5' : '7'} impactful bullet points that:
1. Start with strong action verbs
2. Highlight achievements and impact
3. Include quantifiable metrics (use realistic numbers)
4. Use ${tone} tone
5. Are ATS-friendly

Format each bullet point starting with •
Return ONLY the bullet points, nothing else.`;

  try {
    const response = await callOpenAI('You are an expert resume writer.', prompt, { temperature: 0.8 });
    return response.trim().split('\n').filter(line => line.trim().startsWith('•'));
  } catch (error) {
    console.error('Bullet generation error:', error);
    throw new Error('Failed to generate bullet points.');
  }
}

export async function quantifyAchievement(achievement: string): Promise<string> {
  const prompt = `Add quantifiable metrics to this achievement statement. If the original has numbers, improve them. If not, add realistic metrics.

ORIGINAL: ${achievement}

Return ONLY the enhanced version with metrics, nothing else.
Example: "Improved performance" → "Improved application performance by 45%, reducing load time from 3s to 1.6s"`;

  try {
    const response = await callOpenAI('You are an expert resume writer.', prompt, { temperature: 0.7 });
    return response.trim();
  } catch (error) {
    console.error('Quantification error:', error);
    return achievement;
  }
}

export const ACTION_VERBS = {
  leadership: [
    'Led', 'Directed', 'Managed', 'Coordinated', 'Supervised',
    'Oversaw', 'Mentored', 'Coached', 'Guided', 'Spearheaded',
    'Championed', 'Initiated', 'Orchestrated', 'Delegated', 'Motivated'
  ],
  achievement: [
    'Achieved', 'Accomplished', 'Attained', 'Delivered', 'Exceeded',
    'Surpassed', 'Completed', 'Reached', 'Fulfilled', 'Realized',
    'Succeeded', 'Won', 'Earned', 'Secured', 'Obtained'
  ],
  technical: [
    'Developed', 'Engineered', 'Built', 'Designed', 'Implemented',
    'Coded', 'Programmed', 'Architected', 'Deployed', 'Integrated',
    'Automated', 'Optimized', 'Debugged', 'Migrated', 'Configured'
  ],
  improvement: [
    'Improved', 'Enhanced', 'Optimized', 'Streamlined', 'Upgraded',
    'Refined', 'Increased', 'Reduced', 'Accelerated', 'Strengthened',
    'Transformed', 'Modernized', 'Revamped', 'Boosted', 'Advanced'
  ],
  analysis: [
    'Analyzed', 'Evaluated', 'Assessed', 'Examined', 'Investigated',
    'Researched', 'Studied', 'Measured', 'Identified', 'Determined',
    'Diagnosed', 'Reviewed', 'Audited', 'Tested', 'Validated'
  ],
  communication: [
    'Presented', 'Communicated', 'Collaborated', 'Liaised', 'Negotiated',
    'Facilitated', 'Articulated', 'Documented', 'Reported', 'Conveyed',
    'Demonstrated', 'Explained', 'Briefed', 'Consulted', 'Advised'
  ],
  creation: [
    'Created', 'Established', 'Founded', 'Launched', 'Introduced',
    'Pioneered', 'Originated', 'Instituted', 'Formulated', 'Devised',
    'Invented', 'Crafted', 'Produced', 'Generated', 'Composed'
  ],
  growth: [
    'Expanded', 'Grew', 'Scaled', 'Multiplied', 'Extended',
    'Broadened', 'Enlarged', 'Amplified', 'Increased', 'Raised',
    'Escalated', 'Maximized', 'Augmented', 'Widened', 'Spread'
  ]
};

export function suggestActionVerbs(description: string): string[] {
  const suggestions: string[] = [];
  const lowerDesc = description.toLowerCase();

  // Check which categories are relevant
  if (lowerDesc.match(/team|manage|lead|supervis/)) {
    suggestions.push(...ACTION_VERBS.leadership.slice(0, 5));
  }
  if (lowerDesc.match(/develop|build|code|program|design/)) {
    suggestions.push(...ACTION_VERBS.technical.slice(0, 5));
  }
  if (lowerDesc.match(/improv|optimi|enhanc|better/)) {
    suggestions.push(...ACTION_VERBS.improvement.slice(0, 5));
  }
  if (lowerDesc.match(/analyz|evaluat|research|study/)) {
    suggestions.push(...ACTION_VERBS.analysis.slice(0, 5));
  }
  if (lowerDesc.match(/present|communicat|collaborat/)) {
    suggestions.push(...ACTION_VERBS.communication.slice(0, 5));
  }
  if (lowerDesc.match(/creat|establish|launch|start/)) {
    suggestions.push(...ACTION_VERBS.creation.slice(0, 5));
  }
  if (lowerDesc.match(/grow|expand|scale|increase/)) {
    suggestions.push(...ACTION_VERBS.growth.slice(0, 5));
  }
  if (lowerDesc.match(/achiev|accomplish|deliver|exceed/)) {
    suggestions.push(...ACTION_VERBS.achievement.slice(0, 5));
  }

  // Remove duplicates and limit to 10
  return [...new Set(suggestions)].slice(0, 10);
}

function analyzeImprovements(original: string, enhanced: string): string[] {
  const improvements: string[] = [];

  // Check for action verbs
  const actionVerbPattern = /^[A-Z][a-z]+ed\b/gm;
  const enhancedVerbs = enhanced.match(actionVerbPattern);
  if (enhancedVerbs && enhancedVerbs.length > 0) {
    improvements.push('✓ Added strong action verbs');
  }

  // Check for metrics
  const numberPattern = /\d+[%]?|\$\d+[KM]?/g;
  const originalNumbers = (original.match(numberPattern) || []).length;
  const enhancedNumbers = (enhanced.match(numberPattern) || []).length;
  if (enhancedNumbers > originalNumbers) {
    improvements.push('✓ Added quantifiable metrics');
  }

  // Check for bullet points
  if (enhanced.includes('•')) {
    improvements.push('✓ Formatted as bullet points');
  }

  // Check for length
  if (enhanced.length > original.length * 1.2) {
    improvements.push('✓ Expanded with more details');
  }

  // Check for specificity
  const specificWords = ['implemented', 'developed', 'achieved', 'increased', 'reduced', 'improved'];
  const hasSpecifics = specificWords.some(word => enhanced.toLowerCase().includes(word));
  if (hasSpecifics) {
    improvements.push('✓ Made more specific and concrete');
  }

  return improvements;
}

function generateSuggestions(
  original: string,
  enhanced: string,
  context: { type: string; title?: string; company?: string }
): string[] {
  const suggestions: string[] = [];

  // Check if metrics could be added
  if (!enhanced.match(/\d+[%]?/)) {
    suggestions.push('Consider adding specific numbers or percentages to quantify impact');
  }

  // Check for passive voice
  if (enhanced.match(/was |were |been /i)) {
    suggestions.push('Try converting passive voice to active voice for stronger impact');
  }

  // Check for soft language
  if (enhanced.match(/helped|assisted|contributed/i)) {
    suggestions.push('Use more assertive action verbs like "Led", "Drove", or "Implemented"');
  }

  // Context-specific suggestions
  if (context.type === 'experience' && !enhanced.match(/team|collaborat/i)) {
    suggestions.push('Mention team collaboration or cross-functional work if applicable');
  }

  if (context.type === 'project' && !enhanced.match(/technolog|stack|tool/i)) {
    suggestions.push('Include technologies or tools used in the project');
  }

  return suggestions.slice(0, 3); // Limit to 3 suggestions
}

export async function improveWithActionVerb(sentence: string, newVerb: string): Promise<string> {
  // Simple replacement of the first verb with the new one
  const words = sentence.trim().split(' ');
  if (words.length > 0) {
    // Find the first verb (usually first or second word)
    const firstVerb = words.findIndex(word => 
      word.match(/^[A-Z]?[a-z]+(ed|ing|es|s)?$/i)
    );
    
    if (firstVerb >= 0) {
      words[firstVerb] = newVerb;
      return words.join(' ');
    }
  }
  
  return `${newVerb} ${sentence}`;
}

export function detectWeakPhrases(text: string): Array<{ phrase: string; suggestion: string }> {
  const weakPhrases = [
    { phrase: 'responsible for', suggestion: 'Led, Managed, or Oversaw' },
    { phrase: 'worked on', suggestion: 'Developed, Built, or Implemented' },
    { phrase: 'helped with', suggestion: 'Contributed, Assisted, or Supported' },
    { phrase: 'was involved in', suggestion: 'Participated, Collaborated, or Engaged' },
    { phrase: 'duties included', suggestion: 'Key achievements:' },
    { phrase: 'experience with', suggestion: 'Expertise in, Proficient in' },
    { phrase: 'knowledge of', suggestion: 'Skilled in, Proficient with' },
    { phrase: 'familiar with', suggestion: 'Experienced in, Skilled with' },
    { phrase: 'participated in', suggestion: 'Contributed to, Led, Drove' },
    { phrase: 'assisted with', suggestion: 'Supported, Enabled, Facilitated' },
  ];

  const found: Array<{ phrase: string; suggestion: string }> = [];
  const lowerText = text.toLowerCase();

  for (const { phrase, suggestion } of weakPhrases) {
    if (lowerText.includes(phrase)) {
      found.push({ phrase, suggestion });
    }
  }

  return found;
}
