import { AIService } from './aiService';
import { AIConfig } from './aiProviders';
import { logger } from './logger';

export interface AnalysisResult {
  grammarIssues: GrammarIssue[];
  toneAnalysis: ToneAnalysis;
  suggestions: string[];
  readabilityScore: number;
  keywords: string[];
}

export interface GrammarIssue {
  text: string;
  suggestion: string;
  type: 'grammar' | 'spelling' | 'punctuation';
  position: { start: number; end: number };
}

export interface ToneAnalysis {
  overall: 'professional' | 'casual' | 'formal' | 'technical';
  score: number;
  recommendations: string[];
}

export class JobDescriptionAnalyzer {
  private aiService: AIService | null = null;

  constructor(aiConfig?: AIConfig) {
    if (aiConfig && aiConfig.apiKey) {
      this.aiService = new AIService(aiConfig);
    }
  }

  /**
   * Analyze job description text
   */
  async analyze(text: string): Promise<AnalysisResult> {
    if (!text.trim()) {
      return this.getEmptyResult();
    }

    // If AI service is available, use it for analysis
    if (this.aiService) {
      return this.analyzeWithAI(text);
    }

    // Otherwise use rule-based analysis
    return this.analyzeWithRules(text);
  }

  /**
   * AI-powered analysis
   */
  private async analyzeWithAI(text: string): Promise<AnalysisResult> {
    try {
      const prompt = `Analyze the following job description and provide:
1. Grammar and spelling issues with suggestions
2. Tone analysis (professional/casual/formal/technical)
3. Improvement suggestions
4. Key skills/requirements mentioned

Job Description:
${text}

Return a JSON response with this structure:
{
  "grammarIssues": [{"text": "issue", "suggestion": "fix", "type": "grammar|spelling|punctuation"}],
  "tone": {"overall": "professional|casual|formal|technical", "score": 0-100, "recommendations": []},
  "suggestions": ["suggestion 1", "suggestion 2"],
  "keywords": ["keyword1", "keyword2"]
}`;

      // Use the existing cover letter generation endpoint for analysis
      const response = await (this.aiService as any).provider?.complete(prompt, {
        temperature: 0.3,
        maxTokens: 1500,
      });

      if (response) {
        const parsed = this.parseAIResponse(response);
        return {
          ...parsed,
          readabilityScore: this.calculateReadability(text),
        };
      }
    } catch (error) {
      logger.error('AI analysis failed, falling back to rules:', error);
    }

    return this.analyzeWithRules(text);
  }

  /**
   * Parse AI response
   */
  private parseAIResponse(response: string): Omit<AnalysisResult, 'readabilityScore'> {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return {
          grammarIssues: (data.grammarIssues || []).map((issue: any) => ({
            text: issue.text || '',
            suggestion: issue.suggestion || '',
            type: issue.type || 'grammar',
            position: { start: 0, end: 0 },
          })),
          toneAnalysis: {
            overall: data.tone?.overall || 'professional',
            score: data.tone?.score || 70,
            recommendations: data.tone?.recommendations || [],
          },
          suggestions: data.suggestions || [],
          keywords: data.keywords || [],
        };
      }
    } catch (error) {
      logger.error('Failed to parse AI response:', error);
    }

    return {
      grammarIssues: [],
      toneAnalysis: {
        overall: 'professional',
        score: 70,
        recommendations: ['Consider using more action-oriented language'],
      },
      suggestions: [
        'Add specific qualifications and requirements',
        'Include salary range if possible',
        'Highlight company culture and benefits',
      ],
      keywords: [],
    };
  }

  /**
   * Rule-based analysis (fallback)
   */
  private analyzeWithRules(text: string): AnalysisResult {
    const grammarIssues = this.detectGrammarIssues(text);
    const toneAnalysis = this.analyzeTone(text);
    const suggestions = this.generateSuggestions(text);
    const keywords = this.extractKeywords(text);
    const readabilityScore = this.calculateReadability(text);

    return {
      grammarIssues,
      toneAnalysis,
      suggestions,
      keywords,
      readabilityScore,
    };
  }

  /**
   * Detect basic grammar and spelling issues
   */
  private detectGrammarIssues(text: string): GrammarIssue[] {
    const issues: GrammarIssue[] = [];

    // Check for common errors
    const patterns = [
      {
        regex: /\b(teh|recieve|seperate|occured|acheive)\b/gi,
        type: 'spelling' as const,
        suggestions: {
          teh: 'the',
          recieve: 'receive',
          seperate: 'separate',
          occured: 'occurred',
          acheive: 'achieve',
        },
      },
      {
        regex: /\s{2,}/g,
        type: 'punctuation' as const,
        suggestion: 'Remove extra spaces',
      },
      {
        regex: /\.\./g,
        type: 'punctuation' as const,
        suggestion: 'Use single period',
      },
    ];

    patterns.forEach((pattern) => {
      let match;
      const regex = new RegExp(pattern.regex);
      while ((match = regex.exec(text)) !== null) {
        const matchText = match[0].toLowerCase().trim();
        issues.push({
          text: match[0],
          suggestion:
            'suggestions' in pattern
              ? pattern.suggestions[matchText as keyof typeof pattern.suggestions] || match[0]
              : pattern.suggestion,
          type: pattern.type,
          position: {
            start: match.index,
            end: match.index + match[0].length,
          },
        });
      }
    });

    return issues;
  }

  /**
   * Analyze tone of the text
   */
  private analyzeTone(text: string): ToneAnalysis {
    const lowerText = text.toLowerCase();

    // Count indicators
    const formalWords = ['pursuant', 'therefore', 'hereby', 'henceforth'].filter((w) =>
      lowerText.includes(w),
    ).length;
    const casualWords = ['cool', 'awesome', 'fun', 'chill', 'hey'].filter((w) =>
      lowerText.includes(w),
    ).length;
    const technicalWords = [
      'algorithm',
      'framework',
      'architecture',
      'optimization',
      'implementation',
    ].filter((w) => lowerText.includes(w)).length;

    let overall: ToneAnalysis['overall'] = 'professional';
    const recommendations: string[] = [];

    if (formalWords > 2) {
      overall = 'formal';
      recommendations.push('Consider using more accessible language for broader appeal');
    } else if (casualWords > 2) {
      overall = 'casual';
      recommendations.push('Consider using more professional terminology');
    } else if (technicalWords > 3) {
      overall = 'technical';
      recommendations.push('Balance technical terms with plain language explanations');
    } else {
      recommendations.push('Tone is appropriate for a job description');
    }

    const score = Math.min(
      100,
      Math.max(50, 85 - formalWords * 5 - casualWords * 10 + technicalWords * 2),
    );

    return { overall, score, recommendations };
  }

  /**
   * Generate improvement suggestions
   */
  private generateSuggestions(text: string): string[] {
    const suggestions: string[] = [];
    const lowerText = text.toLowerCase();

    if (!lowerText.includes('experience') && !lowerText.includes('year')) {
      suggestions.push('Consider specifying required years of experience');
    }

    if (!lowerText.includes('skill') && !lowerText.includes('qualification')) {
      suggestions.push('Add specific required skills and qualifications');
    }

    if (!lowerText.includes('benefit') && !lowerText.includes('salary')) {
      suggestions.push('Include compensation or benefits information if possible');
    }

    if (text.length < 200) {
      suggestions.push('Job description is quite short - consider adding more details');
    }

    if (text.length > 2000) {
      suggestions.push('Job description is lengthy - consider being more concise');
    }

    const sentences = text.split(/[.!?]+/).filter(Boolean);
    const avgSentenceLength =
      sentences.reduce((acc, s) => acc + s.split(/\s+/).length, 0) / sentences.length;

    if (avgSentenceLength > 25) {
      suggestions.push('Some sentences are long - consider breaking them into shorter ones');
    }

    return suggestions;
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    const commonSkills = [
      'JavaScript',
      'TypeScript',
      'React',
      'Node.js',
      'Python',
      'Java',
      'C++',
      'SQL',
      'AWS',
      'Docker',
      'Kubernetes',
      'Agile',
      'Scrum',
      'Git',
      'CI/CD',
      'API',
      'REST',
      'GraphQL',
      'leadership',
      'communication',
      'teamwork',
      'problem solving',
      'analytical',
    ];

    const keywords = commonSkills.filter((skill) =>
      text.toLowerCase().includes(skill.toLowerCase()),
    );

    return [...new Set(keywords)];
  }

  /**
   * Calculate readability score (Flesch Reading Ease approximation)
   */
  private calculateReadability(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(Boolean).length;
    const words = text.split(/\s+/).filter(Boolean).length;
    const syllables = this.countSyllables(text);

    if (sentences === 0 || words === 0) return 0;

    const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Count syllables in text (approximation)
   */
  private countSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let count = 0;

    words.forEach((word) => {
      word = word.replace(/[^a-z]/g, '');
      if (word.length <= 3) {
        count += 1;
      } else {
        const vowels = word.match(/[aeiouy]+/g);
        count += vowels ? vowels.length : 1;
      }
    });

    return count;
  }

  /**
   * Get empty result
   */
  private getEmptyResult(): AnalysisResult {
    return {
      grammarIssues: [],
      toneAnalysis: {
        overall: 'professional',
        score: 0,
        recommendations: [],
      },
      suggestions: [],
      keywords: [],
      readabilityScore: 0,
    };
  }
}
