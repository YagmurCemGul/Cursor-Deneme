import { SavedJobDescription } from '../types';
import { AIService } from './aiService';
import { logger } from './logger';

/**
 * Multi-Language Job Description Support
 * Manage and translate job descriptions across multiple languages
 */

export type SupportedLanguage = 'en' | 'tr' | 'es' | 'fr' | 'de' | 'pt' | 'it' | 'ja' | 'zh' | 'ko' | 'ar' | 'ru';

export interface MultiLanguageDescription extends Omit<SavedJobDescription, 'description'> {
  descriptions: Record<SupportedLanguage, string>;
  primaryLanguage: SupportedLanguage;
  translatedLanguages: SupportedLanguage[];
  autoTranslated: Partial<Record<SupportedLanguage, boolean>>;
  translationQuality: Partial<Record<SupportedLanguage, number>>;
}

export const LANGUAGE_NAMES: Record<SupportedLanguage, { native: string; english: string }> = {
  en: { native: 'English', english: 'English' },
  tr: { native: 'Türkçe', english: 'Turkish' },
  es: { native: 'Español', english: 'Spanish' },
  fr: { native: 'Français', english: 'French' },
  de: { native: 'Deutsch', english: 'German' },
  pt: { native: 'Português', english: 'Portuguese' },
  it: { native: 'Italiano', english: 'Italian' },
  ja: { native: '日本語', english: 'Japanese' },
  zh: { native: '中文', english: 'Chinese' },
  ko: { native: '한국어', english: 'Korean' },
  ar: { native: 'العربية', english: 'Arabic' },
  ru: { native: 'Русский', english: 'Russian' },
};

/**
 * Create a multi-language description from single language
 */
export function createMultiLanguageDescription(
  description: SavedJobDescription,
  language: SupportedLanguage
): MultiLanguageDescription {
  return {
    ...description,
    descriptions: {
      [language]: description.description,
    } as Record<SupportedLanguage, string>,
    primaryLanguage: language,
    translatedLanguages: [language],
    autoTranslated: {},
    translationQuality: {},
  };
}

/**
 * Translate description to target language using AI
 */
export async function translateDescription(
  text: string,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage,
  apiKey: string,
  provider: 'openai' | 'gemini' | 'claude'
): Promise<string> {
  const sourceLang = LANGUAGE_NAMES[sourceLanguage].english;
  const targetLang = LANGUAGE_NAMES[targetLanguage].english;

  const prompt = `Translate this job description from ${sourceLang} to ${targetLang}.

Maintain:
- Professional tone
- Technical terminology
- Formatting (bullets, numbers, sections)
- Meaning and nuance
- Cultural appropriateness

Source text (${sourceLang}):
${text}

Provide only the translated text in ${targetLang}, maintaining the same structure.`;

  try {
    const translated = await AIService.generateText(prompt, apiKey, provider);
    return translated;
  } catch (error) {
    throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Add translation to multi-language description
 */
export async function addTranslation(
  multiLangDesc: MultiLanguageDescription,
  targetLanguage: SupportedLanguage,
  apiKey: string,
  provider: 'openai' | 'gemini' | 'claude',
  manualTranslation?: string
): Promise<MultiLanguageDescription> {
  let translation: string;
  let isAutoTranslated = false;

  if (manualTranslation) {
    translation = manualTranslation;
  } else {
    translation = await translateDescription(
      multiLangDesc.descriptions[multiLangDesc.primaryLanguage],
      multiLangDesc.primaryLanguage,
      targetLanguage,
      apiKey,
      provider
    );
    isAutoTranslated = true;
  }

  return {
    ...multiLangDesc,
    descriptions: {
      ...multiLangDesc.descriptions,
      [targetLanguage]: translation,
    },
    translatedLanguages: [...new Set([...multiLangDesc.translatedLanguages, targetLanguage])],
    autoTranslated: {
      ...multiLangDesc.autoTranslated,
      [targetLanguage]: isAutoTranslated,
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Detect language of text
 */
export function detectLanguage(text: string): SupportedLanguage {
  // Simple heuristic-based detection
  // In production, use a proper language detection library or API
  
  const patterns: Array<[SupportedLanguage, RegExp]> = [
    ['ar', /[\u0600-\u06FF]/], // Arabic characters
    ['zh', /[\u4E00-\u9FFF]/], // Chinese characters
    ['ja', /[\u3040-\u309F\u30A0-\u30FF]/], // Japanese hiragana/katakana
    ['ko', /[\uAC00-\uD7AF]/], // Korean characters
    ['ru', /[\u0400-\u04FF]/], // Cyrillic
  ];

  for (const [lang, pattern] of patterns) {
    if (pattern.test(text)) {
      return lang;
    }
  }

  // European language detection
  const words = text.toLowerCase().split(/\s+/);
  const commonWords: Record<string, SupportedLanguage> = {
    'the': 'en', 'and': 'en', 'for': 'en',
    'der': 'de', 'die': 'de', 'und': 'de',
    'le': 'fr', 'la': 'fr', 'et': 'fr',
    'el': 'es', 'la': 'es', 'y': 'es',
    'o': 'pt', 'e': 'pt', 'para': 'pt',
    've': 'tr', 'ile': 'tr', 'için': 'tr',
  };

  for (const word of words) {
    if (commonWords[word]) {
      return commonWords[word];
    }
  }

  return 'en'; // Default to English
}

/**
 * Validate translation quality
 */
export async function validateTranslationQuality(
  sourceText: string,
  translatedText: string,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage,
  apiKey: string,
  provider: 'openai' | 'gemini' | 'claude'
): Promise<number> {
  const prompt = `Evaluate the quality of this translation from ${LANGUAGE_NAMES[sourceLanguage].english} to ${LANGUAGE_NAMES[targetLanguage].english}.

Source (${LANGUAGE_NAMES[sourceLanguage].english}):
${sourceText}

Translation (${LANGUAGE_NAMES[targetLanguage].english}):
${translatedText}

Rate the translation quality on a scale of 0-100 considering:
- Accuracy of meaning
- Professional terminology
- Cultural appropriateness
- Grammatical correctness
- Completeness

Respond with only a number between 0 and 100.`;

  try {
    const result = await AIService.generateText(prompt, apiKey, provider);
    const score = parseInt(result.match(/\d+/)?.[0] || '0');
    return Math.min(Math.max(score, 0), 100);
  } catch (error) {
    logger.error('Quality validation failed:', error);
    return 50; // Default middle score
  }
}

/**
 * Get description in preferred language with fallback
 */
export function getDescriptionInLanguage(
  multiLangDesc: MultiLanguageDescription,
  preferredLanguage: SupportedLanguage,
  fallbackLanguages: SupportedLanguage[] = ['en']
): { text: string; language: SupportedLanguage; isFallback: boolean } {
  if (multiLangDesc.descriptions[preferredLanguage]) {
    return {
      text: multiLangDesc.descriptions[preferredLanguage],
      language: preferredLanguage,
      isFallback: false,
    };
  }

  for (const fallback of fallbackLanguages) {
    if (multiLangDesc.descriptions[fallback]) {
      return {
        text: multiLangDesc.descriptions[fallback],
        language: fallback,
        isFallback: true,
      };
    }
  }

  // Return primary language as last resort
  return {
    text: multiLangDesc.descriptions[multiLangDesc.primaryLanguage],
    language: multiLangDesc.primaryLanguage,
    isFallback: true,
  };
}

/**
 * Batch translate to multiple languages
 */
export async function batchTranslate(
  multiLangDesc: MultiLanguageDescription,
  targetLanguages: SupportedLanguage[],
  apiKey: string,
  provider: 'openai' | 'gemini' | 'claude',
  onProgress?: (completed: number, total: number) => void
): Promise<MultiLanguageDescription> {
  let updated = { ...multiLangDesc };
  
  for (let i = 0; i < targetLanguages.length; i++) {
    const targetLang = targetLanguages[i];
    
    // Skip if already exists
    if (updated.descriptions[targetLang]) {
      continue;
    }

    updated = await addTranslation(updated, targetLang, apiKey, provider);
    
    if (onProgress) {
      onProgress(i + 1, targetLanguages.length);
    }
  }

  return updated;
}

/**
 * Compare translations for consistency
 */
export function compareTranslations(
  multiLangDesc: MultiLanguageDescription,
  languages: SupportedLanguage[]
): {
  consistencyScore: number;
  issues: Array<{
    language: SupportedLanguage;
    issue: string;
  }>;
} {
  const issues: Array<{ language: SupportedLanguage; issue: string }> = [];
  
  const primaryLength = multiLangDesc.descriptions[multiLangDesc.primaryLanguage].length;
  
  languages.forEach(lang => {
    const translation = multiLangDesc.descriptions[lang];
    if (!translation) {
      issues.push({ language: lang, issue: 'Missing translation' });
      return;
    }

    // Check length ratio (translations shouldn't be dramatically different in length)
    const ratio = translation.length / primaryLength;
    if (ratio < 0.7 || ratio > 1.5) {
      issues.push({ 
        language: lang, 
        issue: `Length ratio ${ratio.toFixed(2)} may indicate translation issue` 
      });
    }

    // Check for untranslated placeholders
    const placeholders = translation.match(/\{\{[^}]+\}\}/g);
    const primaryPlaceholders = multiLangDesc.descriptions[multiLangDesc.primaryLanguage]
      .match(/\{\{[^}]+\}\}/g);
    
    if (placeholders?.length !== primaryPlaceholders?.length) {
      issues.push({ 
        language: lang, 
        issue: 'Placeholder count mismatch' 
      });
    }
  });

  const consistencyScore = Math.max(0, 100 - (issues.length * 10));

  return { consistencyScore, issues };
}

/**
 * Export multi-language description
 */
export function exportMultiLanguage(multiLangDesc: MultiLanguageDescription): string {
  return JSON.stringify(multiLangDesc, null, 2);
}

/**
 * Import multi-language description
 */
export function importMultiLanguage(jsonString: string): MultiLanguageDescription {
  try {
    const data = JSON.parse(jsonString);
    
    if (!data.descriptions || !data.primaryLanguage) {
      throw new Error('Invalid multi-language description format');
    }

    return data as MultiLanguageDescription;
  } catch (error) {
    throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get translation statistics
 */
export function getTranslationStats(
  multiLangDesc: MultiLanguageDescription
): {
  totalLanguages: number;
  autoTranslated: number;
  manualTranslated: number;
  averageQuality: number;
  completeness: number;
} {
  const totalLanguages = multiLangDesc.translatedLanguages.length;
  const autoTranslated = Object.values(multiLangDesc.autoTranslated).filter(Boolean).length;
  const manualTranslated = totalLanguages - autoTranslated;
  
  const qualityScores = Object.values(multiLangDesc.translationQuality).filter(Boolean);
  const averageQuality = qualityScores.length > 0
    ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
    : 0;

  const totalPossibleLanguages = Object.keys(LANGUAGE_NAMES).length;
  const completeness = (totalLanguages / totalPossibleLanguages) * 100;

  return {
    totalLanguages,
    autoTranslated,
    manualTranslated,
    averageQuality,
    completeness,
  };
}
