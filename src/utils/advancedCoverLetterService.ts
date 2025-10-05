/**
 * Advanced Cover Letter Service
 * 
 * Provides enhanced cover letter generation with:
 * - Multi-language support
 * - Industry-specific templates
 * - Tone adjustment
 * - Achievement quantification
 * - Company research integration
 * - A/B testing (multiple versions)
 * - Learning from user edits
 */

import { CVData } from '../types';
import { logger } from './logger';
import { AIProviderAdapter } from './aiProviders';

export type CoverLetterLanguage = 'en' | 'tr' | 'es' | 'fr' | 'de' | 'pt' | 'it' | 'nl' | 'pl' | 'ja' | 'zh' | 'ko';

export type IndustryType = 
  | 'technology'
  | 'finance'
  | 'healthcare'
  | 'education'
  | 'marketing'
  | 'consulting'
  | 'manufacturing'
  | 'retail'
  | 'hospitality'
  | 'legal'
  | 'nonprofit'
  | 'government'
  | 'media'
  | 'real-estate'
  | 'automotive'
  | 'general';

export type ToneType = 
  | 'formal'
  | 'professional'
  | 'friendly'
  | 'enthusiastic'
  | 'conservative'
  | 'innovative'
  | 'academic';

export type CompanyCulture = 
  | 'corporate'
  | 'startup'
  | 'creative'
  | 'traditional'
  | 'innovative'
  | 'casual'
  | 'remote-first';

export interface CompanyResearch {
  name: string;
  industry?: string;
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  culture?: CompanyCulture;
  values?: string[];
  recentNews?: string[];
  products?: string[];
  competitors?: string[];
}

export interface CoverLetterOptions {
  language: CoverLetterLanguage;
  industry?: IndustryType;
  tone?: ToneType;
  companyResearch?: CompanyResearch;
  emphasizeQuantification?: boolean;
  maxLength?: number; // in words
  includeCallToAction?: boolean;
  customInstructions?: string;
}

export interface CoverLetterVersion {
  id: string;
  content: string;
  variant: 'standard' | 'brief' | 'detailed' | 'creative';
  tone: ToneType;
  generatedAt: string;
  wordCount: number;
  score?: number; // Optional quality score
}

export interface UserEdit {
  originalText: string;
  editedText: string;
  section: 'opening' | 'body' | 'closing' | 'overall';
  timestamp: string;
  feedbackType?: 'positive' | 'negative';
}

export interface LearningData {
  userId?: string;
  industry?: IndustryType;
  successfulPhrases: string[];
  avoidedPhrases: string[];
  preferredTone?: ToneType;
  averageLength?: number;
  commonEdits: UserEdit[];
}

/**
 * Industry-specific guidance and keywords
 */
const industryGuidance: Record<IndustryType, {
  keywords: string[];
  tone: ToneType;
  emphasis: string[];
  avoidTerms?: string[];
}> = {
  technology: {
    keywords: ['innovation', 'scalable', 'agile', 'cutting-edge', 'digital transformation'],
    tone: 'innovative',
    emphasis: ['technical skills', 'problem-solving', 'continuous learning'],
    avoidTerms: ['traditional', 'conventional'],
  },
  finance: {
    keywords: ['analytical', 'compliance', 'risk management', 'strategic', 'detail-oriented'],
    tone: 'professional',
    emphasis: ['accuracy', 'regulatory knowledge', 'quantitative skills'],
  },
  healthcare: {
    keywords: ['patient-centered', 'compassionate', 'clinical excellence', 'evidence-based'],
    tone: 'professional',
    emphasis: ['patient care', 'medical knowledge', 'empathy'],
  },
  education: {
    keywords: ['pedagogical', 'student-centered', 'curriculum development', 'mentoring'],
    tone: 'academic',
    emphasis: ['teaching philosophy', 'student outcomes', 'collaboration'],
  },
  marketing: {
    keywords: ['creative', 'data-driven', 'brand strategy', 'engagement', 'ROI'],
    tone: 'enthusiastic',
    emphasis: ['campaign results', 'creativity', 'market insights'],
  },
  consulting: {
    keywords: ['strategic', 'analytical', 'client-focused', 'problem-solving', 'deliverables'],
    tone: 'professional',
    emphasis: ['business impact', 'stakeholder management', 'strategic thinking'],
  },
  manufacturing: {
    keywords: ['operational excellence', 'lean', 'quality control', 'efficiency', 'safety'],
    tone: 'professional',
    emphasis: ['process improvement', 'safety record', 'productivity'],
  },
  retail: {
    keywords: ['customer service', 'sales', 'merchandising', 'inventory management'],
    tone: 'friendly',
    emphasis: ['customer satisfaction', 'sales performance', 'team leadership'],
  },
  hospitality: {
    keywords: ['guest experience', 'service excellence', 'hospitality', 'attention to detail'],
    tone: 'friendly',
    emphasis: ['customer satisfaction', 'service quality', 'cultural sensitivity'],
  },
  legal: {
    keywords: ['analytical', 'research', 'advocacy', 'compliance', 'precedent'],
    tone: 'formal',
    emphasis: ['legal expertise', 'attention to detail', 'case outcomes'],
  },
  nonprofit: {
    keywords: ['mission-driven', 'community', 'impact', 'fundraising', 'advocacy'],
    tone: 'enthusiastic',
    emphasis: ['social impact', 'stakeholder engagement', 'fundraising success'],
  },
  government: {
    keywords: ['public service', 'policy', 'compliance', 'stakeholder management', 'transparency'],
    tone: 'formal',
    emphasis: ['public service', 'regulatory knowledge', 'process improvement'],
  },
  media: {
    keywords: ['creative', 'storytelling', 'content', 'audience engagement', 'trends'],
    tone: 'enthusiastic',
    emphasis: ['portfolio', 'audience growth', 'creative vision'],
  },
  'real-estate': {
    keywords: ['market knowledge', 'client relationships', 'negotiation', 'investment'],
    tone: 'professional',
    emphasis: ['sales record', 'market expertise', 'client satisfaction'],
  },
  automotive: {
    keywords: ['engineering', 'quality', 'innovation', 'manufacturing', 'safety'],
    tone: 'professional',
    emphasis: ['technical expertise', 'quality standards', 'innovation'],
  },
  general: {
    keywords: ['professional', 'experienced', 'skilled', 'dedicated', 'results-oriented'],
    tone: 'professional',
    emphasis: ['relevant experience', 'key skills', 'achievements'],
  },
};

/**
 * Language-specific guidelines
 */
const languageGuidelines: Record<CoverLetterLanguage, {
  formalGreeting: string;
  informalGreeting: string;
  closingFormal: string;
  closingInformal: string;
  culturalNotes: string[];
}> = {
  en: {
    formalGreeting: 'Dear Hiring Manager',
    informalGreeting: 'Hello',
    closingFormal: 'Sincerely',
    closingInformal: 'Best regards',
    culturalNotes: ['Be direct and concise', 'Quantify achievements', 'Show enthusiasm'],
  },
  tr: {
    formalGreeting: 'Sayın Yetkili',
    informalGreeting: 'Merhaba',
    closingFormal: 'Saygılarımla',
    closingInformal: 'İyi çalışmalar',
    culturalNotes: ['Resmi dil kullanın', 'Eğitim geçmişine vurgu yapın', 'Saygılı olun'],
  },
  es: {
    formalGreeting: 'Estimado/a responsable de contratación',
    informalGreeting: 'Hola',
    closingFormal: 'Atentamente',
    closingInformal: 'Un cordial saludo',
    culturalNotes: ['Use formal language', 'Emphasize personal connection', 'Show passion'],
  },
  fr: {
    formalGreeting: 'Madame, Monsieur',
    informalGreeting: 'Bonjour',
    closingFormal: 'Je vous prie d\'agréer, Madame, Monsieur, l\'expression de mes salutations distinguées',
    closingInformal: 'Cordialement',
    culturalNotes: ['Very formal structure', 'Emphasize education', 'Professional tone'],
  },
  de: {
    formalGreeting: 'Sehr geehrte Damen und Herren',
    informalGreeting: 'Hallo',
    closingFormal: 'Mit freundlichen Grüßen',
    closingInformal: 'Beste Grüße',
    culturalNotes: ['Formal and structured', 'Emphasize qualifications', 'Be precise'],
  },
  pt: {
    formalGreeting: 'Prezado(a) responsável pela contratação',
    informalGreeting: 'Olá',
    closingFormal: 'Atenciosamente',
    closingInformal: 'Cordialmente',
    culturalNotes: ['Formal tone', 'Show enthusiasm', 'Emphasize teamwork'],
  },
  it: {
    formalGreeting: 'Egregio responsabile delle assunzioni',
    informalGreeting: 'Salve',
    closingFormal: 'Cordiali saluti',
    closingInformal: 'Distinti saluti',
    culturalNotes: ['Formal and elegant', 'Show personality', 'Emphasize passion'],
  },
  nl: {
    formalGreeting: 'Geachte heer/mevrouw',
    informalGreeting: 'Hallo',
    closingFormal: 'Met vriendelijke groet',
    closingInformal: 'Groeten',
    culturalNotes: ['Direct communication', 'Be modest', 'Focus on results'],
  },
  pl: {
    formalGreeting: 'Szanowni Państwo',
    informalGreeting: 'Cześć',
    closingFormal: 'Z poważaniem',
    closingInformal: 'Pozdrawiam',
    culturalNotes: ['Formal tone', 'Emphasize education', 'Show respect'],
  },
  ja: {
    formalGreeting: '拝啓 採用担当者様',
    informalGreeting: 'こんにちは',
    closingFormal: '敬具',
    closingInformal: 'よろしくお願いいたします',
    culturalNotes: ['Very formal', 'Show humility', 'Emphasize team harmony'],
  },
  zh: {
    formalGreeting: '尊敬的招聘经理',
    informalGreeting: '您好',
    closingFormal: '此致敬礼',
    closingInformal: '祝好',
    culturalNotes: ['Formal and respectful', 'Show dedication', 'Emphasize harmony'],
  },
  ko: {
    formalGreeting: '채용 담당자님께',
    informalGreeting: '안녕하세요',
    closingFormal: '감사합니다',
    closingInformal: '좋은 하루 되세요',
    culturalNotes: ['Very formal and respectful', 'Show humility', 'Emphasize teamwork'],
  },
};

/**
 * Advanced Cover Letter Service Class
 */
export class AdvancedCoverLetterService {
  private learningData: Map<string, LearningData> = new Map();
  private provider: AIProviderAdapter | null;

  constructor(provider: AIProviderAdapter | null = null) {
    this.provider = provider;
  }

  /**
   * Generate multiple versions of a cover letter for A/B testing
   */
  async generateMultipleVersions(
    cvData: CVData,
    jobDescription: string,
    options: CoverLetterOptions,
    count: number = 3
  ): Promise<CoverLetterVersion[]> {
    logger.info('Generating multiple cover letter versions', { count, options });

    const variants: Array<'standard' | 'brief' | 'detailed' | 'creative'> = ['standard', 'brief', 'detailed'];
    const tones: ToneType[] = ['professional', 'enthusiastic', 'formal'];

    if (count > 3) {
      variants.push('creative');
      tones.push('friendly');
    }

    const versions: CoverLetterVersion[] = [];

    try {
      for (let i = 0; i < Math.min(count, variants.length); i++) {
        const variantOptions = {
          ...options,
          tone: tones[i] || options.tone,
          maxLength: variants[i] === 'brief' ? 250 : variants[i] === 'detailed' ? 500 : 350,
        };

        const content = await this.generateAdvancedCoverLetter(
          cvData,
          jobDescription,
          variantOptions
        );

        versions.push({
          id: `version-${Date.now()}-${i}`,
          content,
          variant: variants[i],
          tone: tones[i],
          generatedAt: new Date().toISOString(),
          wordCount: content.split(/\s+/).length,
          score: this.calculateQualityScore(content, jobDescription, cvData),
        });
      }

      return versions;
    } catch (error) {
      logger.error('Error generating multiple versions:', error);
      throw error;
    }
  }

  /**
   * Generate an advanced cover letter with all enhancements
   */
  async generateAdvancedCoverLetter(
    cvData: CVData,
    jobDescription: string,
    options: CoverLetterOptions
  ): Promise<string> {
    try {
      // Extract company and job information
      const jobInfo = this.analyzeJobDescription(jobDescription);
      
      // Get industry-specific guidance
      const industry = options.industry || this.detectIndustry(jobDescription);
      const guidance = industryGuidance[industry];
      
      // Get language guidelines
      const langGuidelines = languageGuidelines[options.language];
      
      // Determine tone
      const tone = options.tone || this.determineTone(options.companyResearch, guidance.tone);
      
      // Extract and quantify achievements
      const quantifiedAchievements = this.extractQuantifiedAchievements(cvData);
      
      // Build enhanced prompt for AI
      const prompt = this.buildEnhancedPrompt(
        cvData,
        jobDescription,
        jobInfo,
        guidance,
        langGuidelines,
        tone,
        quantifiedAchievements,
        options
      );

      // Generate using AI provider if available
      if (this.provider) {
        return await this.provider.generateCoverLetter(cvData, jobDescription, prompt);
      }

      // Fallback to enhanced template-based generation
      return this.generateFromTemplate(
        cvData,
        jobInfo,
        guidance,
        langGuidelines,
        tone,
        quantifiedAchievements,
        options
      );
    } catch (error) {
      logger.error('Error generating advanced cover letter:', error);
      throw error;
    }
  }

  /**
   * Learn from user edits to improve future generations
   */
  recordUserEdit(edit: UserEdit, userId?: string): void {
    const key = userId || 'default';
    const existing = this.learningData.get(key) || {
      successfulPhrases: [],
      avoidedPhrases: [],
      commonEdits: [],
    };

    existing.commonEdits.push(edit);

    // Analyze the edit to learn patterns
    if (edit.feedbackType === 'positive') {
      const phrases = this.extractKeyPhrases(edit.editedText);
      existing.successfulPhrases.push(...phrases);
    } else if (edit.feedbackType === 'negative') {
      const phrases = this.extractKeyPhrases(edit.originalText);
      existing.avoidedPhrases.push(...phrases);
    }

    this.learningData.set(key, existing);
    
    // Persist to storage
    this.saveLearningData();
  }

  /**
   * Get learning insights for a user
   */
  getLearningInsights(userId?: string): LearningData | null {
    return this.learningData.get(userId || 'default') || null;
  }

  /**
   * Analyze job description to extract key information
   */
  private analyzeJobDescription(jobDescription: string): {
    companyName: string;
    position: string;
    requiredSkills: string[];
    preferredSkills: string[];
    responsibilities: string[];
    benefits: string[];
    culture: CompanyCulture;
  } {
    const companyPatterns = [
      /(?:at|@|for|join)\s+([A-Z][A-Za-z0-9\s&,.']+?)(?:\s+is|\s+we|\s+are|,|\.|$)/i,
      /([A-Z][A-Za-z0-9\s&,.']+?)\s+is\s+(?:hiring|looking|seeking)/i,
    ];

    let companyName = 'the company';
    for (const pattern of companyPatterns) {
      const match = jobDescription.match(pattern);
      if (match && match[1] && match[1].trim().length < 50) {
        companyName = match[1].trim();
        break;
      }
    }

    const positionPatterns = [
      /(?:position|role|job|title)[:\s]+([^\n]+)/i,
      /(?:hiring|seeking|looking for)\s+(?:a|an)\s+([A-Z][A-Za-z\s]+?)(?:\s+to|\s+who|,|\.|$)/,
    ];

    let position = 'this position';
    for (const pattern of positionPatterns) {
      const match = jobDescription.match(pattern);
      if (match && match[1]) {
        position = match[1].trim();
        break;
      }
    }

    // Detect culture from keywords
    let culture: CompanyCulture = 'corporate';
    if (/startup|fast-paced|dynamic|agile/i.test(jobDescription)) culture = 'startup';
    else if (/creative|design|artistic/i.test(jobDescription)) culture = 'creative';
    else if (/remote|distributed|work from home/i.test(jobDescription)) culture = 'remote-first';
    else if (/innovative|cutting-edge|disruptive/i.test(jobDescription)) culture = 'innovative';
    else if (/casual|relaxed|flexible/i.test(jobDescription)) culture = 'casual';

    return {
      companyName,
      position,
      requiredSkills: this.extractSkills(jobDescription, 'required'),
      preferredSkills: this.extractSkills(jobDescription, 'preferred'),
      responsibilities: this.extractResponsibilities(jobDescription),
      benefits: this.extractBenefits(jobDescription),
      culture,
    };
  }

  /**
   * Extract quantified achievements from CV
   */
  private extractQuantifiedAchievements(cvData: CVData): Array<{
    text: string;
    metric: string;
    value: string;
    context: string;
  }> {
    const achievements: Array<{ text: string; metric: string; value: string; context: string }> = [];
    
    // Pattern to match numbers with context
    const patterns = [
      /(\d+%|\d+x|\$\d+[KMB]?|\d+\+)\s+([^.!?]+)/g,
      /(?:increased|improved|reduced|decreased|grew|generated|saved)\s+([^.!?]*?(?:\d+%|\d+x|\$\d+[KMB]?|\d+\+)[^.!?]*)/gi,
    ];

    const sources = [
      ...cvData.experience.map(e => ({ text: e.description, context: e.title })),
      ...cvData.projects.map(p => ({ text: p.description, context: p.name })),
    ];

    for (const source of sources) {
      for (const pattern of patterns) {
        const matches = Array.from(source.text.matchAll(pattern));
        for (const match of matches) {
          if (match[0].length > 10 && match[0].length < 200) {
            achievements.push({
              text: match[0].trim(),
              metric: match[1] || '',
              value: match[2] || match[0],
              context: source.context,
            });
          }
        }
      }
    }

    return achievements.slice(0, 5); // Top 5 achievements
  }

  /**
   * Detect industry from job description
   */
  private detectIndustry(jobDescription: string): IndustryType {
    const text = jobDescription.toLowerCase();
    
    if (/software|tech|engineer|developer|IT|cloud|SaaS/i.test(text)) return 'technology';
    if (/finance|bank|investment|trading|accounting/i.test(text)) return 'finance';
    if (/health|medical|clinical|patient|hospital/i.test(text)) return 'healthcare';
    if (/education|teacher|professor|school|university/i.test(text)) return 'education';
    if (/marketing|brand|advertising|digital|social media/i.test(text)) return 'marketing';
    if (/consulting|advisory|strategy|management/i.test(text)) return 'consulting';
    if (/manufacturing|production|factory|assembly/i.test(text)) return 'manufacturing';
    if (/retail|sales|store|merchandising/i.test(text)) return 'retail';
    if (/hospitality|hotel|restaurant|travel|tourism/i.test(text)) return 'hospitality';
    if (/legal|lawyer|attorney|law|paralegal/i.test(text)) return 'legal';
    if (/nonprofit|NGO|charity|foundation/i.test(text)) return 'nonprofit';
    if (/government|public sector|civil service/i.test(text)) return 'government';
    if (/media|journalism|publishing|broadcasting/i.test(text)) return 'media';
    if (/real estate|property|realtor/i.test(text)) return 'real-estate';
    if (/automotive|car|vehicle/i.test(text)) return 'automotive';
    
    return 'general';
  }

  /**
   * Determine appropriate tone based on company research and industry
   */
  private determineTone(companyResearch?: CompanyResearch, defaultTone?: ToneType): ToneType {
    if (companyResearch?.culture) {
      const cultureToTone: Record<CompanyCulture, ToneType> = {
        corporate: 'formal',
        startup: 'enthusiastic',
        creative: 'friendly',
        traditional: 'conservative',
        innovative: 'innovative',
        casual: 'friendly',
        'remote-first': 'professional',
      };
      return cultureToTone[companyResearch.culture];
    }
    
    return defaultTone || 'professional';
  }

  /**
   * Build enhanced prompt for AI generation
   */
  private buildEnhancedPrompt(
    cvData: CVData,
    jobDescription: string,
    jobInfo: any,
    guidance: any,
    langGuidelines: any,
    tone: ToneType,
    achievements: any[],
    options: CoverLetterOptions
  ): string {
    let prompt = `Generate a professional cover letter with the following specifications:\n\n`;
    
    prompt += `LANGUAGE: ${options.language.toUpperCase()}\n`;
    prompt += `TONE: ${tone}\n`;
    prompt += `INDUSTRY: ${options.industry || 'general'}\n`;
    prompt += `MAX LENGTH: ${options.maxLength || 350} words\n\n`;
    
    prompt += `LANGUAGE GUIDELINES:\n`;
    prompt += `- Greeting: ${langGuidelines.formalGreeting}\n`;
    prompt += `- Closing: ${langGuidelines.closingFormal}\n`;
    prompt += `- Cultural notes: ${langGuidelines.culturalNotes.join(', ')}\n\n`;
    
    prompt += `INDUSTRY-SPECIFIC REQUIREMENTS:\n`;
    prompt += `- Keywords to include: ${guidance.keywords.join(', ')}\n`;
    prompt += `- Emphasis areas: ${guidance.emphasis.join(', ')}\n`;
    if (guidance.avoidTerms) {
      prompt += `- Avoid: ${guidance.avoidTerms.join(', ')}\n`;
    }
    prompt += `\n`;
    
    if (achievements.length > 0) {
      prompt += `QUANTIFIED ACHIEVEMENTS TO HIGHLIGHT:\n`;
      achievements.forEach((ach, i) => {
        prompt += `${i + 1}. ${ach.text} (from ${ach.context})\n`;
      });
      prompt += `\n`;
    }
    
    if (options.companyResearch) {
      prompt += `COMPANY RESEARCH:\n`;
      prompt += `- Company: ${options.companyResearch.name}\n`;
      if (options.companyResearch.values) {
        prompt += `- Values: ${options.companyResearch.values.join(', ')}\n`;
      }
      if (options.companyResearch.culture) {
        prompt += `- Culture: ${options.companyResearch.culture}\n`;
      }
      prompt += `\n`;
    }
    
    prompt += `STRUCTURE:\n`;
    prompt += `1. Opening: Strong hook that shows genuine interest in the company\n`;
    prompt += `2. Body paragraphs: Link specific achievements to job requirements\n`;
    prompt += `3. Company fit: Show understanding of company culture and values\n`;
    prompt += `4. Closing: ${options.includeCallToAction !== false ? 'Include clear call to action' : 'Professional closing'}\n\n`;
    
    if (options.customInstructions) {
      prompt += `ADDITIONAL INSTRUCTIONS:\n${options.customInstructions}\n\n`;
    }
    
    // Add learning insights if available
    const insights = this.getLearningInsights();
    if (insights && insights.successfulPhrases.length > 0) {
      prompt += `LEARNED PREFERENCES:\n`;
      prompt += `- Successful phrases from past: ${insights.successfulPhrases.slice(0, 5).join(', ')}\n`;
      if (insights.avoidedPhrases.length > 0) {
        prompt += `- Phrases to avoid: ${insights.avoidedPhrases.slice(0, 5).join(', ')}\n`;
      }
    }
    
    return prompt;
  }

  /**
   * Generate from template (fallback when no AI provider)
   */
  private generateFromTemplate(
    cvData: CVData,
    jobInfo: any,
    guidance: any,
    langGuidelines: any,
    tone: ToneType,
    achievements: any[],
    options: CoverLetterOptions
  ): string {
    const fullName = `${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}`.trim();
    const date = new Date().toLocaleDateString(options.language === 'en' ? 'en-US' : options.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let letter = `${date}\n\n`;
    letter += `${langGuidelines.formalGreeting},\n\n`;
    
    // Opening paragraph
    letter += this.generateOpening(jobInfo, cvData, tone, guidance, options.language);
    letter += `\n\n`;
    
    // Achievement paragraphs
    letter += this.generateAchievementParagraphs(achievements, jobInfo, guidance, options.language);
    letter += `\n\n`;
    
    // Skills and fit paragraph
    letter += this.generateSkillsParagraph(cvData, jobInfo, guidance, options.language);
    letter += `\n\n`;
    
    // Company fit paragraph (if company research available)
    if (options.companyResearch) {
      letter += this.generateCompanyFitParagraph(options.companyResearch, options.language);
      letter += `\n\n`;
    }
    
    // Closing
    letter += this.generateClosing(jobInfo, tone, langGuidelines, options.language);
    letter += `\n\n${langGuidelines.closingFormal},\n${fullName}`;
    
    return letter;
  }

  /**
   * Helper methods for template generation
   */
  private generateOpening(jobInfo: any, cvData: CVData, tone: ToneType, guidance: any, language: CoverLetterLanguage): string {
    const templates = {
      en: {
        enthusiastic: `I am thrilled to apply for the ${jobInfo.position} position at ${jobInfo.companyName}. With my expertise in ${cvData.skills.slice(0, 3).join(', ')}, I am excited about the opportunity to contribute to your innovative team.`,
        professional: `I am writing to express my strong interest in the ${jobInfo.position} position at ${jobInfo.companyName}. My background in ${cvData.skills.slice(0, 3).join(', ')} aligns perfectly with the requirements outlined in your job posting.`,
        formal: `I am pleased to submit my application for the ${jobInfo.position} position at ${jobInfo.companyName}. My professional experience in ${cvData.skills.slice(0, 3).join(', ')} makes me a strong candidate for this role.`,
      },
      tr: {
        enthusiastic: `${jobInfo.companyName} bünyesinde yer alan ${jobInfo.position} pozisyonu için başvurmaktan büyük heyecan duyuyorum. ${cvData.skills.slice(0, 3).join(', ')} konularındaki uzmanlığımla ekibinize katkıda bulunmak için sabırsızlanıyorum.`,
        professional: `${jobInfo.companyName} bünyesindeki ${jobInfo.position} pozisyonu için güçlü ilgimi ifade etmek üzere yazıyorum. ${cvData.skills.slice(0, 3).join(', ')} alanlarındaki deneyimim, iş ilanınızda belirtilen gereksinimlerle mükemmel bir şekilde örtüşmektedir.`,
        formal: `${jobInfo.companyName} bünyesindeki ${jobInfo.position} pozisyonu için başvurumu sunmaktan memnuniyet duyuyorum. ${cvData.skills.slice(0, 3).join(', ')} alanlarındaki profesyonel deneyimim, bu rol için güçlü bir aday olmamı sağlamaktadır.`,
      },
    };
    
    const langTemplates = templates[language] || templates.en;
    return langTemplates[tone as keyof typeof langTemplates] || langTemplates.professional;
  }

  private generateAchievementParagraphs(achievements: any[], jobInfo: any, guidance: any, language: CoverLetterLanguage): string {
    if (achievements.length === 0) {
      return language === 'en' 
        ? `Throughout my career, I have consistently delivered results and exceeded expectations in challenging environments.`
        : `Kariyerim boyunca, zorlu ortamlarda sürekli olarak sonuç verdim ve beklentilerin üzerinde performans gösterdim.`;
    }
    
    const intro = language === 'en'
      ? `In my most recent role, I have achieved significant results:`
      : `En son görevimde önemli sonuçlar elde ettim:`;
    
    const achievementTexts = achievements.slice(0, 2).map(ach => `• ${ach.text}`).join('\n');
    
    return `${intro}\n${achievementTexts}`;
  }

  private generateSkillsParagraph(cvData: CVData, jobInfo: any, guidance: any, language: CoverLetterLanguage): string {
    const skills = cvData.skills.slice(0, 6).join(', ');
    
    return language === 'en'
      ? `My technical proficiency includes ${skills}, which are directly relevant to the requirements of this position. I am confident that my skill set and experience make me an excellent fit for the ${jobInfo.position} role at ${jobInfo.companyName}.`
      : `Teknik yetkinliğim ${skills} alanlarını kapsamaktadır ve bu pozisyonun gereklilikleriyle doğrudan ilgilidir. Beceri setimin ve deneyimimin ${jobInfo.companyName} bünyesindeki ${jobInfo.position} rolü için mükemmel bir uyum sağladığına eminim.`;
  }

  private generateCompanyFitParagraph(research: CompanyResearch, language: CoverLetterLanguage): string {
    const values = research.values?.slice(0, 3).join(', ') || '';
    
    return language === 'en'
      ? `I am particularly drawn to ${research.name}'s commitment to ${values || 'innovation and excellence'}. Your company culture resonates with my professional values, and I am excited about the possibility of contributing to your team's success.`
      : `${research.name}'in ${values || 'yenilikçilik ve mükemmellik'} konusundaki bağlılığı özellikle ilgimi çekiyor. Şirket kültürünüz profesyonel değerlerimle örtüşüyor ve ekibinizin başarısına katkıda bulunma olasılığından heyecan duyuyorum.`;
  }

  private generateClosing(jobInfo: any, tone: ToneType, langGuidelines: any, language: CoverLetterLanguage): string {
    const templates = {
      en: {
        enthusiastic: `I would be thrilled to discuss how my skills and enthusiasm can contribute to ${jobInfo.companyName}'s continued success. Thank you for considering my application. I look forward to the opportunity to speak with you soon.`,
        professional: `I would welcome the opportunity to discuss how my background and skills align with ${jobInfo.companyName}'s needs. Thank you for your time and consideration. I look forward to hearing from you.`,
        formal: `I would be honored to discuss my qualifications further at your convenience. Thank you for considering my application. I await your response with great interest.`,
      },
      tr: {
        enthusiastic: `Becerilerimin ve heyecanımın ${jobInfo.companyName}'in sürekli başarısına nasıl katkıda bulunabileceğini tartışmaktan mutluluk duyarım. Başvurumu değerlendirdiğiniz için teşekkür ederim. Yakında sizinle konuşma fırsatını dört gözle bekliyorum.`,
        professional: `Geçmişimin ve becerilerimin ${jobInfo.companyName}'in ihtiyaçlarıyla nasıl örtüştüğünü tartışma fırsatını memnuniyetle karşılarım. Zaman ayırdığınız ve değerlendirdiğiniz için teşekkür ederim. Sizden haber almayı dört gözle bekliyorum.`,
        formal: `Niteliklerimi uygun bir zamanda daha detaylı olarak tartışmaktan onur duyarım. Başvurumu değerlendirdiğiniz için teşekkür ederim. Yanıtınızı büyük bir ilgiyle bekliyorum.`,
      },
    };
    
    const langTemplates = templates[language] || templates.en;
    return langTemplates[tone as keyof typeof langTemplates] || langTemplates.professional;
  }

  /**
   * Extract skills from job description
   */
  private extractSkills(text: string, type: 'required' | 'preferred'): string[] {
    // Simplified skill extraction
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Angular', 'Vue', 'Node.js',
      'AWS', 'Azure', 'Docker', 'Kubernetes', 'SQL', 'MongoDB', 'Git',
      'Leadership', 'Communication', 'Problem-solving', 'Teamwork', 'Agile'
    ];
    
    const found: string[] = [];
    for (const skill of commonSkills) {
      if (new RegExp(`\\b${skill}\\b`, 'i').test(text)) {
        found.push(skill);
      }
    }
    
    return found;
  }

  /**
   * Extract responsibilities
   */
  private extractResponsibilities(text: string): string[] {
    const patterns = [/[•\-*]\s*([A-Z][^\n•\-*]+)/g, /\d+\.\s*([A-Z][^\n\d]+)/g];
    const responsibilities: string[] = [];
    
    for (const pattern of patterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches) {
        if (match[1] && match[1].length > 20 && match[1].length < 200) {
          responsibilities.push(match[1].trim());
        }
      }
    }
    
    return responsibilities.slice(0, 5);
  }

  /**
   * Extract benefits
   */
  private extractBenefits(text: string): string[] {
    const benefitKeywords = ['health insurance', 'dental', 'vision', '401k', 'retirement', 'vacation', 'pto', 'bonus', 'equity', 'stock options', 'remote', 'flexible'];
    const benefits: string[] = [];
    
    for (const keyword of benefitKeywords) {
      if (new RegExp(keyword, 'i').test(text)) {
        benefits.push(keyword);
      }
    }
    
    return benefits;
  }

  /**
   * Extract key phrases from text
   */
  private extractKeyPhrases(text: string): string[] {
    // Simple phrase extraction - in production, use NLP library
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20 && s.length < 100);
    return sentences.slice(0, 3);
  }

  /**
   * Calculate quality score for a cover letter
   */
  private calculateQualityScore(coverLetter: string, jobDescription: string, cvData: CVData): number {
    let score = 0;
    
    // Length check (ideal 250-400 words)
    const wordCount = coverLetter.split(/\s+/).length;
    if (wordCount >= 250 && wordCount <= 400) score += 20;
    else if (wordCount >= 200 && wordCount <= 500) score += 15;
    else score += 10;
    
    // Skill matching
    const jobSkills = this.extractSkills(jobDescription, 'required');
    const mentionedSkills = jobSkills.filter(skill => 
      new RegExp(skill, 'i').test(coverLetter)
    );
    score += Math.min((mentionedSkills.length / Math.max(jobSkills.length, 1)) * 30, 30);
    
    // Quantification check
    const hasNumbers = /\d+%|\d+x|\$\d+|increased|improved|reduced/i.test(coverLetter);
    if (hasNumbers) score += 20;
    
    // Personal touch check
    const hasPersonalization = cvData.personalInfo.firstName && 
      coverLetter.includes(cvData.personalInfo.firstName);
    if (hasPersonalization) score += 10;
    
    // Action verbs check
    const actionVerbs = ['achieved', 'led', 'developed', 'improved', 'created', 'managed', 'increased'];
    const actionVerbCount = actionVerbs.filter(verb => 
      new RegExp(verb, 'i').test(coverLetter)
    ).length;
    score += Math.min(actionVerbCount * 4, 20);
    
    return Math.min(score, 100);
  }

  /**
   * Save learning data to storage
   */
  private async saveLearningData(): Promise<void> {
    try {
      const data: Record<string, LearningData> = {};
      this.learningData.forEach((value, key) => {
        data[key] = value;
      });
      
      await chrome.storage.local.set({ coverLetterLearningData: data });
      logger.info('Learning data saved');
    } catch (error) {
      logger.error('Error saving learning data:', error);
    }
  }

  /**
   * Load learning data from storage
   */
  async loadLearningData(): Promise<void> {
    try {
      const result = await chrome.storage.local.get('coverLetterLearningData');
      if (result.coverLetterLearningData) {
        Object.entries(result.coverLetterLearningData).forEach(([key, value]) => {
          this.learningData.set(key, value as LearningData);
        });
        logger.info('Learning data loaded');
      }
    } catch (error) {
      logger.error('Error loading learning data:', error);
    }
  }
}
