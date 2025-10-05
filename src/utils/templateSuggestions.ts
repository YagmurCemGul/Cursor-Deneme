import { AITemplateSuggestion } from '../types';
import { defaultCVTemplates } from '../data/cvTemplates';
import { defaultCoverLetterTemplates } from '../data/coverLetterTemplates';

interface TemplateKeywords {
  templateId: string;
  keywords: string[];
  industries: string[];
  tones: string[];
}

// Template keyword mappings for better suggestions
const cvTemplateKeywords: TemplateKeywords[] = [
  {
    templateId: 'classic',
    keywords: ['traditional', 'corporate', 'formal', 'standard', 'professional', 'business'],
    industries: ['finance', 'banking', 'insurance', 'accounting', 'corporate'],
    tones: ['formal', 'professional', 'traditional'],
  },
  {
    templateId: 'modern',
    keywords: ['modern', 'contemporary', 'clean', 'minimalist', 'tech', 'startup'],
    industries: ['technology', 'startup', 'digital', 'saas', 'software'],
    tones: ['modern', 'fresh', 'contemporary'],
  },
  {
    templateId: 'executive',
    keywords: ['executive', 'senior', 'leadership', 'ceo', 'director', 'vp', 'manager', 'head'],
    industries: ['executive', 'leadership', 'management', 'c-level'],
    tones: ['executive', 'authoritative', 'sophisticated'],
  },
  {
    templateId: 'creative',
    keywords: ['creative', 'design', 'artistic', 'portfolio', 'visual', 'ux', 'ui', 'graphic'],
    industries: ['design', 'creative', 'marketing', 'advertising', 'media', 'arts'],
    tones: ['creative', 'expressive', 'unique'],
  },
  {
    templateId: 'tech',
    keywords: ['developer', 'software', 'engineer', 'programming', 'coding', 'github', 'technical'],
    industries: ['software', 'development', 'engineering', 'it', 'tech'],
    tones: ['technical', 'modern', 'developer-focused'],
  },
  {
    templateId: 'academic',
    keywords: ['research', 'academic', 'professor', 'phd', 'postdoc', 'faculty', 'scholar', 'publication'],
    industries: ['academic', 'research', 'education', 'university', 'teaching'],
    tones: ['formal', 'scholarly', 'academic'],
  },
  {
    templateId: 'startup',
    keywords: ['startup', 'entrepreneur', 'fast-paced', 'dynamic', 'agile', 'innovation', 'venture'],
    industries: ['startup', 'venture', 'innovation', 'entrepreneurship'],
    tones: ['dynamic', 'energetic', 'bold'],
  },
  {
    templateId: 'finance',
    keywords: ['finance', 'banking', 'investment', 'analyst', 'accounting', 'auditing', 'cpa'],
    industries: ['finance', 'banking', 'investment', 'accounting', 'audit'],
    tones: ['conservative', 'professional', 'trustworthy'],
  },
  {
    templateId: 'marketing',
    keywords: ['marketing', 'brand', 'campaign', 'social media', 'digital marketing', 'seo', 'content'],
    industries: ['marketing', 'advertising', 'brand', 'digital', 'social'],
    tones: ['creative', 'dynamic', 'results-driven'],
  },
  {
    templateId: 'healthcare',
    keywords: ['healthcare', 'medical', 'nurse', 'doctor', 'physician', 'clinical', 'patient', 'hospital'],
    industries: ['healthcare', 'medical', 'nursing', 'pharmaceutical', 'biotech'],
    tones: ['professional', 'caring', 'clean'],
  },
  {
    templateId: 'legal',
    keywords: ['legal', 'lawyer', 'attorney', 'law', 'compliance', 'contract', 'litigation', 'counsel'],
    industries: ['legal', 'law', 'compliance', 'regulatory'],
    tones: ['formal', 'authoritative', 'detail-oriented'],
  },
  {
    templateId: 'education',
    keywords: ['teacher', 'educator', 'teaching', 'curriculum', 'instructor', 'training', 'tutor'],
    industries: ['education', 'teaching', 'training', 'k-12', 'elearning'],
    tones: ['professional', 'friendly', 'educational'],
  },
  {
    templateId: 'engineering',
    keywords: ['engineer', 'engineering', 'mechanical', 'electrical', 'civil', 'chemical', 'industrial'],
    industries: ['engineering', 'manufacturing', 'construction', 'industrial'],
    tones: ['technical', 'precise', 'professional'],
  },
  {
    templateId: 'sales',
    keywords: ['sales', 'business development', 'account manager', 'revenue', 'quota', 'client', 'deal'],
    industries: ['sales', 'business-development', 'account-management', 'retail'],
    tones: ['results-driven', 'achievement-focused', 'dynamic'],
  },
  {
    templateId: 'consulting',
    keywords: ['consulting', 'consultant', 'strategy', 'advisory', 'mbb', 'mckinsey', 'bain', 'bcg'],
    industries: ['consulting', 'advisory', 'strategy', 'management'],
    tones: ['strategic', 'professional', 'impact-driven'],
  },
  {
    templateId: 'data-science',
    keywords: ['data', 'analytics', 'machine learning', 'ai', 'ml', 'python', 'r', 'statistics', 'model'],
    industries: ['data-science', 'analytics', 'ai', 'ml', 'research'],
    tones: ['technical', 'analytical', 'data-focused'],
  },
];

const coverLetterTemplateKeywords: TemplateKeywords[] = [
  {
    templateId: 'classic',
    keywords: ['traditional', 'formal', 'corporate', 'business'],
    industries: ['finance', 'banking', 'corporate'],
    tones: ['formal', 'professional'],
  },
  {
    templateId: 'modern',
    keywords: ['modern', 'tech', 'startup', 'contemporary'],
    industries: ['technology', 'startup', 'digital'],
    tones: ['modern', 'professional'],
  },
  {
    templateId: 'executive',
    keywords: ['executive', 'senior', 'leadership', 'director'],
    industries: ['executive', 'leadership'],
    tones: ['executive', 'authoritative'],
  },
  {
    templateId: 'creative',
    keywords: ['creative', 'design', 'artistic', 'portfolio'],
    industries: ['design', 'creative', 'marketing'],
    tones: ['creative', 'expressive'],
  },
  {
    templateId: 'startup',
    keywords: ['startup', 'fast-paced', 'dynamic', 'agile'],
    industries: ['startup', 'venture'],
    tones: ['energetic', 'friendly'],
  },
  {
    templateId: 'academic',
    keywords: ['research', 'academic', 'professor', 'faculty'],
    industries: ['academic', 'research', 'education'],
    tones: ['formal', 'scholarly'],
  },
  {
    templateId: 'tech',
    keywords: ['developer', 'software', 'engineer', 'technical'],
    industries: ['software', 'development', 'tech'],
    tones: ['technical', 'professional'],
  },
  {
    templateId: 'consulting',
    keywords: ['consulting', 'strategy', 'advisory'],
    industries: ['consulting', 'advisory'],
    tones: ['strategic', 'professional'],
  },
  {
    templateId: 'sales',
    keywords: ['sales', 'business development', 'revenue'],
    industries: ['sales', 'business-development'],
    tones: ['results-driven', 'professional'],
  },
];

/**
 * Analyzes job description text and suggests appropriate templates
 */
export function suggestCVTemplates(jobDescription: string): AITemplateSuggestion[] {
  const normalizedText = jobDescription.toLowerCase();
  const suggestions: AITemplateSuggestion[] = [];

  for (const mapping of cvTemplateKeywords) {
    const matchedKeywords: string[] = [];
    let matchScore = 0;

    // Check keyword matches
    for (const keyword of mapping.keywords) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
        matchScore += 1;
      }
    }

    // Check industry matches (higher weight)
    for (const industry of mapping.industries) {
      if (normalizedText.includes(industry.toLowerCase())) {
        matchedKeywords.push(industry);
        matchScore += 2;
      }
    }

    // Check tone matches
    for (const tone of mapping.tones) {
      if (normalizedText.includes(tone.toLowerCase())) {
        matchedKeywords.push(tone);
        matchScore += 0.5;
      }
    }

    if (matchScore > 0) {
      const template = defaultCVTemplates.find((t) => t.id === mapping.templateId);
      if (template) {
        const confidence = Math.min(matchScore / 10, 1); // Normalize to 0-1
        suggestions.push({
          templateId: mapping.templateId,
          confidence,
          reason: generateReason(template.name, matchedKeywords),
          matchedKeywords: matchedKeywords.slice(0, 5), // Top 5 keywords
        });
      }
    }
  }

  // Sort by confidence (highest first) and return top 3
  return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
}

/**
 * Analyzes job description text and suggests appropriate cover letter templates
 */
export function suggestCoverLetterTemplates(jobDescription: string): AITemplateSuggestion[] {
  const normalizedText = jobDescription.toLowerCase();
  const suggestions: AITemplateSuggestion[] = [];

  for (const mapping of coverLetterTemplateKeywords) {
    const matchedKeywords: string[] = [];
    let matchScore = 0;

    // Check keyword matches
    for (const keyword of mapping.keywords) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
        matchScore += 1;
      }
    }

    // Check industry matches (higher weight)
    for (const industry of mapping.industries) {
      if (normalizedText.includes(industry.toLowerCase())) {
        matchedKeywords.push(industry);
        matchScore += 2;
      }
    }

    // Check tone matches
    for (const tone of mapping.tones) {
      if (normalizedText.includes(tone.toLowerCase())) {
        matchedKeywords.push(tone);
        matchScore += 0.5;
      }
    }

    if (matchScore > 0) {
      const template = defaultCoverLetterTemplates.find((t) => t.id === mapping.templateId);
      if (template) {
        const confidence = Math.min(matchScore / 10, 1); // Normalize to 0-1
        suggestions.push({
          templateId: mapping.templateId,
          confidence,
          reason: generateReason(template.name, matchedKeywords),
          matchedKeywords: matchedKeywords.slice(0, 5), // Top 5 keywords
        });
      }
    }
  }

  // Sort by confidence (highest first) and return top 3
  return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
}

/**
 * Generates a human-readable reason for template suggestion
 */
function generateReason(templateName: string, matchedKeywords: string[]): string {
  if (matchedKeywords.length === 0) {
    return `${templateName} could work well for this position.`;
  }

  const keywordList = matchedKeywords.slice(0, 3).join(', ');
  return `${templateName} matches the job's ${keywordList} focus.`;
}

/**
 * Gets template confidence level label
 */
export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.7) return 'Excellent Match';
  if (confidence >= 0.5) return 'Good Match';
  if (confidence >= 0.3) return 'Fair Match';
  return 'Possible Match';
}

/**
 * Gets color for confidence level
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.7) return '#10b981'; // green
  if (confidence >= 0.5) return '#3498db'; // blue
  if (confidence >= 0.3) return '#f59e0b'; // amber
  return '#6b7280'; // gray
}
