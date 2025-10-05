import { ResumeProfile, JobPost } from './types';

export interface ATSScore {
  overallScore: number; // 0-100
  keywordScore: number; // 0-100
  formatScore: number; // 0-100
  completenessScore: number; // 0-100
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: ATSSuggestion[];
  categoryBreakdown: {
    skills: number;
    experience: number;
    education: number;
    formatting: number;
  };
}

export interface ATSSuggestion {
  type: 'critical' | 'important' | 'optional';
  category: 'keywords' | 'formatting' | 'content' | 'sections';
  message: string;
  impact: number; // Potential score increase
}

export function calculateATSScore(profile: ResumeProfile, jobPost: JobPost): ATSScore {
  const jobKeywords = extractKeywords(jobPost.pastedText);
  const profileKeywords = extractProfileKeywords(profile);
  
  const keywordScore = calculateKeywordMatch(profileKeywords, jobKeywords);
  const formatScore = calculateFormatScore(profile);
  const completenessScore = calculateCompletenessScore(profile);
  
  const overallScore = Math.round(
    keywordScore * 0.5 +
    formatScore * 0.25 +
    completenessScore * 0.25
  );
  
  const { matched, missing } = getKeywordMatches(profileKeywords, jobKeywords);
  const suggestions = generateSuggestions(profile, jobPost, missing, overallScore);
  
  const categoryBreakdown = calculateCategoryBreakdown(profile, jobKeywords);
  
  return {
    overallScore,
    keywordScore,
    formatScore,
    completenessScore,
    matchedKeywords: matched,
    missingKeywords: missing,
    suggestions,
    categoryBreakdown,
  };
}

function extractKeywords(text: string): string[] {
  if (!text) return [];
  
  // Common words to ignore
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has',
    'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may',
    'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you',
    'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when', 'where',
    'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
    'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
    'so', 'than', 'too', 'very', 'as', 'from', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'up', 'down', 'out', 'off', 'over',
    'under', 'again', 'further', 'then', 'once', 'here', 'there', 'all',
    'any', 'our', 'their', 'work', 'experience', 'years', 'team', 'company',
  ]);
  
  // Extract words and phrases
  const words = text.toLowerCase()
    .replace(/[^\w\s\-\.]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
  
  // Also extract 2-3 word phrases (bigrams and trigrams)
  const phrases: string[] = [];
  const textWords = text.toLowerCase().match(/\b[\w\-\.]+\b/g) || [];
  
  for (let i = 0; i < textWords.length - 1; i++) {
    const bigram = `${textWords[i]} ${textWords[i + 1]}`;
    if (bigram.length > 5 && !stopWords.has(textWords[i]) && !stopWords.has(textWords[i + 1])) {
      phrases.push(bigram);
    }
    
    if (i < textWords.length - 2) {
      const trigram = `${textWords[i]} ${textWords[i + 1]} ${textWords[i + 2]}`;
      if (trigram.length > 8) {
        phrases.push(trigram);
      }
    }
  }
  
  // Combine and deduplicate
  const allKeywords = [...new Set([...words, ...phrases])];
  
  // Count frequency and sort
  const keywordFreq = new Map<string, number>();
  allKeywords.forEach(keyword => {
    const count = (text.toLowerCase().match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;
    keywordFreq.set(keyword, count);
  });
  
  // Return top keywords sorted by frequency
  return Array.from(keywordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([keyword]) => keyword)
    .slice(0, 50); // Top 50 keywords
}

function extractProfileKeywords(profile: ResumeProfile): string[] {
  const text = [
    profile.personal.summary || '',
    profile.skills.join(' '),
    profile.experience.map(exp => `${exp.title} ${exp.company} ${exp.description || ''}`).join(' '),
    profile.education.map(edu => `${edu.degree} ${edu.fieldOfStudy} ${edu.school}`).join(' '),
    profile.projects.map(proj => `${proj.name} ${proj.description || ''}`).join(' '),
    profile.licenses.map(lic => `${lic.name} ${lic.organization}`).join(' '),
  ].join(' ');
  
  return extractKeywords(text);
}

function calculateKeywordMatch(profileKeywords: string[], jobKeywords: string[]): number {
  if (jobKeywords.length === 0) return 100;
  
  const matched = profileKeywords.filter(pk =>
    jobKeywords.some(jk => 
      pk.includes(jk) || jk.includes(pk) || similarity(pk, jk) > 0.8
    )
  );
  
  const matchRate = matched.length / Math.min(jobKeywords.length, 30);
  return Math.min(Math.round(matchRate * 100), 100);
}

function similarity(s1: string, s2: string): number {
  // Simple Jaccard similarity
  const set1 = new Set(s1.split(''));
  const set2 = new Set(s2.split(''));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}

function calculateFormatScore(profile: ResumeProfile): number {
  let score = 100;
  
  // Check for common formatting issues
  if (!profile.personal.email) score -= 10;
  if (!profile.personal.phone) score -= 5;
  if (!profile.personal.location) score -= 5;
  
  // Check for consistent date formats
  const hasInconsistentDates = profile.experience.some(exp => 
    exp.startDate && exp.endDate && exp.startDate > exp.endDate
  );
  if (hasInconsistentDates) score -= 10;
  
  // Check for description quality
  const hasShortDescriptions = profile.experience.some(exp =>
    exp.description && exp.description.length < 50
  );
  if (hasShortDescriptions) score -= 10;
  
  // Check for bullet points
  const usesBulletPoints = profile.experience.some(exp =>
    exp.description && (exp.description.includes('•') || exp.description.includes('-'))
  );
  if (!usesBulletPoints && profile.experience.length > 0) score -= 10;
  
  return Math.max(score, 0);
}

function calculateCompletenessScore(profile: ResumeProfile): number {
  let score = 0;
  const maxScore = 100;
  
  // Personal info (30 points)
  if (profile.personal.firstName) score += 5;
  if (profile.personal.lastName) score += 5;
  if (profile.personal.email) score += 5;
  if (profile.personal.phone) score += 5;
  if (profile.personal.summary && profile.personal.summary.length > 50) score += 10;
  
  // Skills (20 points)
  if (profile.skills.length >= 5) score += 20;
  else if (profile.skills.length >= 3) score += 10;
  else if (profile.skills.length >= 1) score += 5;
  
  // Experience (30 points)
  if (profile.experience.length >= 2) score += 15;
  else if (profile.experience.length >= 1) score += 10;
  
  const hasDetailedExperience = profile.experience.some(exp => 
    exp.description && exp.description.length > 100
  );
  if (hasDetailedExperience) score += 15;
  
  // Education (15 points)
  if (profile.education.length >= 1) score += 15;
  
  // Optional sections (5 points)
  if (profile.projects.length > 0) score += 3;
  if (profile.licenses.length > 0) score += 2;
  
  return Math.min(Math.round((score / maxScore) * 100), 100);
}

function getKeywordMatches(profileKeywords: string[], jobKeywords: string[]): {
  matched: string[];
  missing: string[];
} {
  const matched: string[] = [];
  const missing: string[] = [];
  
  jobKeywords.forEach(jk => {
    const isMatched = profileKeywords.some(pk =>
      pk.includes(jk) || jk.includes(pk) || similarity(pk, jk) > 0.8
    );
    
    if (isMatched) {
      matched.push(jk);
    } else {
      missing.push(jk);
    }
  });
  
  return {
    matched: matched.slice(0, 20),
    missing: missing.slice(0, 15),
  };
}

function generateSuggestions(
  profile: ResumeProfile,
  jobPost: JobPost,
  missingKeywords: string[],
  currentScore: number
): ATSSuggestion[] {
  const suggestions: ATSSuggestion[] = [];
  
  // Critical suggestions (score < 50)
  if (currentScore < 50) {
    if (missingKeywords.length > 10) {
      suggestions.push({
        type: 'critical',
        category: 'keywords',
        message: `Add ${missingKeywords.length} missing keywords from the job description`,
        impact: 20,
      });
    }
    
    if (!profile.personal.summary || profile.personal.summary.length < 50) {
      suggestions.push({
        type: 'critical',
        category: 'content',
        message: 'Add a professional summary (150-200 words)',
        impact: 10,
      });
    }
  }
  
  // Important suggestions (score < 75)
  if (currentScore < 75) {
    if (missingKeywords.length > 5) {
      suggestions.push({
        type: 'important',
        category: 'keywords',
        message: `Include these key terms: ${missingKeywords.slice(0, 5).join(', ')}`,
        impact: 15,
      });
    }
    
    if (profile.experience.length > 0) {
      const needsImprovement = profile.experience.filter(exp =>
        !exp.description || exp.description.length < 100
      );
      if (needsImprovement.length > 0) {
        suggestions.push({
          type: 'important',
          category: 'content',
          message: 'Add more details to your work experience (100+ characters each)',
          impact: 10,
        });
      }
    }
  }
  
  // Optional suggestions
  if (profile.skills.length < 8) {
    suggestions.push({
      type: 'optional',
      category: 'content',
      message: 'Add more relevant skills (aim for 8-12)',
      impact: 5,
    });
  }
  
  if (profile.projects.length === 0) {
    suggestions.push({
      type: 'optional',
      category: 'sections',
      message: 'Add projects to showcase your work',
      impact: 3,
    });
  }
  
  if (!profile.personal.linkedin) {
    suggestions.push({
      type: 'optional',
      category: 'formatting',
      message: 'Add your LinkedIn profile URL',
      impact: 2,
    });
  }
  
  // Formatting suggestions
  const hasWeakActionVerbs = profile.experience.some(exp =>
    exp.description && !containsStrongActionVerbs(exp.description)
  );
  if (hasWeakActionVerbs) {
    suggestions.push({
      type: 'important',
      category: 'content',
      message: 'Use strong action verbs (Led, Developed, Implemented)',
      impact: 8,
    });
  }
  
  return suggestions.sort((a, b) => b.impact - a.impact);
}

function containsStrongActionVerbs(text: string): boolean {
  const strongVerbs = [
    'led', 'developed', 'implemented', 'created', 'designed', 'built',
    'managed', 'improved', 'increased', 'reduced', 'achieved', 'delivered',
    'launched', 'executed', 'optimized', 'streamlined', 'spearheaded',
  ];
  
  const lowerText = text.toLowerCase();
  return strongVerbs.some(verb => lowerText.includes(verb));
}

function calculateCategoryBreakdown(profile: ResumeProfile, jobKeywords: string[]): {
  skills: number;
  experience: number;
  education: number;
  formatting: number;
} {
  const skillsText = profile.skills.join(' ').toLowerCase();
  const skillMatches = jobKeywords.filter(kw => skillsText.includes(kw)).length;
  const skillsScore = jobKeywords.length > 0 
    ? Math.min((skillMatches / jobKeywords.length) * 100, 100) 
    : 100;
  
  const expText = profile.experience.map(e => 
    `${e.title} ${e.description || ''}`
  ).join(' ').toLowerCase();
  const expMatches = jobKeywords.filter(kw => expText.includes(kw)).length;
  const experienceScore = jobKeywords.length > 0
    ? Math.min((expMatches / jobKeywords.length) * 100, 100)
    : 100;
  
  const educationScore = profile.education.length > 0 ? 80 : 50;
  
  const formattingScore = calculateFormatScore(profile);
  
  return {
    skills: Math.round(skillsScore),
    experience: Math.round(experienceScore),
    education: educationScore,
    formatting: formattingScore,
  };
}
