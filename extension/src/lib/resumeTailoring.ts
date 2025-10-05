/**
 * Resume Tailoring Engine
 * Intelligently tailors resumes to specific job postings
 */

import type { ResumeProfile } from './types';
import { JobContext, SkillMatch, JobAnalysisResult, analyzeJobPosting } from './jobAnalyzer';

export interface TailoringResult {
  analysis: JobAnalysisResult;
  tailoredProfile: ResumeProfile;
  suggestions: TailoringSuggestion[];
  keywordGaps: string[];
  strengthAreas: string[];
}

export interface TailoringSuggestion {
  id: string;
  type: 'add' | 'modify' | 'remove' | 'reorder' | 'emphasize';
  section: 'summary' | 'skills' | 'experience' | 'education' | 'projects' | 'certifications';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  before?: string;
  after?: string;
  action?: () => void;
}

/**
 * Analyze a job posting against a candidate's profile
 */
export function analyzeJobMatch(
  profile: ResumeProfile,
  jobText: string,
  jobTitle?: string
): JobAnalysisResult {
  // Analyze the job posting
  const context = analyzeJobPosting(jobText, jobTitle);
  
  // Calculate skill matches
  const skillMatches = calculateSkillMatches(profile, context);
  
  // Calculate overall match score
  const overallMatchScore = calculateOverallMatchScore(profile, context, skillMatches);
  
  // Identify missing skills
  const missingSkills = identifyMissingSkills(profile, context);
  
  // Identify strong matches
  const strongMatches = identifyStrongMatches(profile, context);
  
  // Generate suggestions
  const suggestions = generateMatchSuggestions(profile, context, skillMatches, missingSkills);
  
  return {
    context,
    skillMatches,
    overallMatchScore,
    missingSkills,
    strongMatches,
    suggestions
  };
}

/**
 * Tailor a resume to a specific job
 */
export function tailorResumeToJob(
  profile: ResumeProfile,
  jobText: string,
  jobTitle?: string,
  autoApply: boolean = false
): TailoringResult {
  // Analyze the match
  const analysis = analyzeJobMatch(profile, jobText, jobTitle);
  
  // Create a tailored version of the profile
  const tailoredProfile = autoApply 
    ? applyTailoring(profile, analysis)
    : { ...profile }; // Don't modify if not auto-applying
  
  // Generate detailed suggestions
  const suggestions = generateDetailedSuggestions(profile, analysis);
  
  // Identify keyword gaps
  const keywordGaps = analysis.missingSkills.slice(0, 10);
  
  // Identify strength areas
  const strengthAreas = analysis.strongMatches.slice(0, 5);
  
  return {
    analysis,
    tailoredProfile,
    suggestions,
    keywordGaps,
    strengthAreas
  };
}

/**
 * Calculate skill matches between profile and job
 */
function calculateSkillMatches(profile: ResumeProfile, context: JobContext): SkillMatch[] {
  const matches: SkillMatch[] = [];
  const userSkills = profile.skills.map(s => s.toLowerCase());
  
  // Check required skills
  context.requiredSkills.forEach(skill => {
    const userHasIt = userSkills.some(us => 
      us === skill.toLowerCase() || 
      us.includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(us)
    );
    
    const category = context.technicalSkills.includes(skill) ? 'technical' : 
                     context.softSkills.includes(skill) ? 'soft' : 'domain';
    
    matches.push({
      skill,
      userHasIt,
      importance: 'required',
      category,
      matchScore: userHasIt ? 1.0 : 0.0
    });
  });
  
  // Check preferred skills
  context.preferredSkills.forEach(skill => {
    // Don't duplicate if already in required
    if (context.requiredSkills.includes(skill)) return;
    
    const userHasIt = userSkills.some(us => 
      us === skill.toLowerCase() || 
      us.includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(us)
    );
    
    const category = context.technicalSkills.includes(skill) ? 'technical' : 
                     context.softSkills.includes(skill) ? 'soft' : 'domain';
    
    matches.push({
      skill,
      userHasIt,
      importance: 'preferred',
      category,
      matchScore: userHasIt ? 0.7 : 0.0
    });
  });
  
  return matches;
}

/**
 * Calculate overall match score
 */
function calculateOverallMatchScore(
  profile: ResumeProfile,
  context: JobContext,
  skillMatches: SkillMatch[]
): number {
  let totalScore = 0;
  
  // 1. Skill Match Score (weighted)
  const requiredSkillMatches = skillMatches.filter(m => m.importance === 'required' && m.userHasIt).length;
  const totalRequiredSkills = skillMatches.filter(m => m.importance === 'required').length;
  const skillScore = totalRequiredSkills > 0 ? (requiredSkillMatches / totalRequiredSkills) : 0.5;
  totalScore += skillScore * context.skillMatchWeight;
  
  // 2. Experience Level Match
  const expScore = calculateExperienceScore(profile, context);
  totalScore += expScore * context.experienceWeight;
  
  // 3. Education Match
  const eduScore = calculateEducationScore(profile, context);
  totalScore += eduScore * context.educationWeight;
  
  // 4. Keyword Presence
  const keywordScore = calculateKeywordScore(profile, context);
  totalScore += keywordScore * context.keywordWeight;
  
  return Math.round(totalScore * 100);
}

/**
 * Calculate experience match score
 */
function calculateExperienceScore(profile: ResumeProfile, context: JobContext): number {
  if (!profile.experience || profile.experience.length === 0) return 0;
  
  // Calculate total years of experience
  const totalYears = profile.experience.reduce((sum, exp) => {
    const start = new Date(exp.startDate);
    const end = exp.isCurrent ? new Date() : new Date(exp.endDate || Date.now());
    const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return sum + years;
  }, 0);
  
  const requiredMin = context.yearsRequired.min;
  const requiredMax = context.yearsRequired.max;
  
  // Score based on years match
  if (requiredMax) {
    if (totalYears >= requiredMin && totalYears <= requiredMax) return 1.0;
    if (totalYears < requiredMin) return Math.max(0.3, totalYears / requiredMin);
    if (totalYears > requiredMax) return Math.max(0.7, 1 - ((totalYears - requiredMax) / requiredMax) * 0.3);
  } else {
    if (totalYears >= requiredMin) return 1.0;
    return Math.max(0.3, totalYears / requiredMin);
  }
  
  return 0.5;
}

/**
 * Calculate education match score
 */
function calculateEducationScore(profile: ResumeProfile, context: JobContext): number {
  if (!profile.education || profile.education.length === 0) return 0.5;
  
  // Check if any education matches typical requirements
  const hasBachelor = profile.education.some(edu => 
    edu.degree.toLowerCase().includes('bachelor')
  );
  const hasMaster = profile.education.some(edu => 
    edu.degree.toLowerCase().includes('master')
  );
  const hasPhd = profile.education.some(edu => 
    edu.degree.toLowerCase().includes('phd') || edu.degree.toLowerCase().includes('doctorate')
  );
  
  // Basic scoring
  if (hasPhd) return 1.0;
  if (hasMaster) return 0.9;
  if (hasBachelor) return 0.8;
  
  return 0.6; // Has some education
}

/**
 * Calculate keyword presence score
 */
function calculateKeywordScore(profile: ResumeProfile, context: JobContext): number {
  const profileText = JSON.stringify(profile).toLowerCase();
  const keywords = context.mustHaveKeywords.map(k => k.toLowerCase());
  
  if (keywords.length === 0) return 0.7;
  
  const matchedKeywords = keywords.filter(keyword => 
    profileText.includes(keyword)
  ).length;
  
  return matchedKeywords / keywords.length;
}

/**
 * Identify missing skills
 */
function identifyMissingSkills(profile: ResumeProfile, context: JobContext): string[] {
  const userSkills = profile.skills.map(s => s.toLowerCase());
  const missing: string[] = [];
  
  // Check required skills first
  context.requiredSkills.forEach(skill => {
    const hasSkill = userSkills.some(us => 
      us === skill.toLowerCase() || 
      us.includes(skill.toLowerCase())
    );
    if (!hasSkill) {
      missing.push(skill);
    }
  });
  
  // Then preferred skills
  context.preferredSkills.forEach(skill => {
    if (missing.includes(skill)) return;
    const hasSkill = userSkills.some(us => 
      us === skill.toLowerCase() || 
      us.includes(skill.toLowerCase())
    );
    if (!hasSkill && missing.length < 15) {
      missing.push(skill);
    }
  });
  
  return missing;
}

/**
 * Identify strong matching areas
 */
function identifyStrongMatches(profile: ResumeProfile, context: JobContext): string[] {
  const userSkills = profile.skills.map(s => s.toLowerCase());
  const matches: string[] = [];
  
  // Find required skills that user has
  context.requiredSkills.forEach(skill => {
    const hasSkill = userSkills.some(us => 
      us === skill.toLowerCase() || 
      us.includes(skill.toLowerCase())
    );
    if (hasSkill) {
      matches.push(skill);
    }
  });
  
  return matches;
}

/**
 * Generate match suggestions
 */
function generateMatchSuggestions(
  profile: ResumeProfile,
  context: JobContext,
  skillMatches: SkillMatch[],
  missingSkills: string[]
): string[] {
  const suggestions: string[] = [];
  
  // Missing critical skills
  const missingRequired = skillMatches.filter(m => m.importance === 'required' && !m.userHasIt);
  if (missingRequired.length > 0) {
    suggestions.push(`Add ${missingRequired.length} required skills: ${missingRequired.slice(0, 3).map(m => m.skill).join(', ')}`);
  }
  
  // Experience mismatch
  if (context.yearsRequired.min > 0) {
    suggestions.push(`Highlight ${context.yearsRequired.min}+ years of relevant experience`);
  }
  
  // Keyword optimization
  if (context.mustHaveKeywords.length > 0) {
    suggestions.push(`Include keywords: ${context.mustHaveKeywords.slice(0, 5).join(', ')}`);
  }
  
  // Soft skills
  const missingSoftSkills = context.softSkills.filter(skill => 
    !profile.skills.some(us => us.toLowerCase().includes(skill.toLowerCase()))
  );
  if (missingSoftSkills.length > 0) {
    suggestions.push(`Emphasize soft skills: ${missingSoftSkills.slice(0, 3).join(', ')}`);
  }
  
  return suggestions.slice(0, 8);
}

/**
 * Generate detailed tailoring suggestions
 */
function generateDetailedSuggestions(
  profile: ResumeProfile,
  analysis: JobAnalysisResult
): TailoringSuggestion[] {
  const suggestions: TailoringSuggestion[] = [];
  const context = analysis.context;
  
  // 1. Add missing critical skills
  const missingRequired = analysis.skillMatches.filter(m => m.importance === 'required' && !m.userHasIt);
  if (missingRequired.length > 0) {
    suggestions.push({
      id: crypto.randomUUID(),
      type: 'add',
      section: 'skills',
      priority: 'critical',
      title: `Add ${missingRequired.length} Required Skills`,
      description: `The job requires: ${missingRequired.map(m => m.skill).join(', ')}. Consider adding these if you have experience with them.`,
      after: missingRequired.map(m => m.skill).join(', ')
    });
  }
  
  // 2. Emphasize matching experience
  if (analysis.strongMatches.length > 0) {
    suggestions.push({
      id: crypto.randomUUID(),
      type: 'emphasize',
      section: 'experience',
      priority: 'high',
      title: 'Emphasize Relevant Experience',
      description: `Highlight your experience with: ${analysis.strongMatches.slice(0, 5).join(', ')}`,
      after: `Lead with these skills in your experience descriptions`
    });
  }
  
  // 3. Add keywords to summary
  if (context.mustHaveKeywords.length > 0) {
    suggestions.push({
      id: crypto.randomUUID(),
      type: 'modify',
      section: 'summary',
      priority: 'high',
      title: 'Optimize Professional Summary',
      description: `Include these keywords naturally: ${context.mustHaveKeywords.slice(0, 5).join(', ')}`,
      before: profile.summary || '(No summary)',
      after: 'Add keywords to summary for ATS optimization'
    });
  }
  
  // 4. Reorder skills to match job priorities
  suggestions.push({
    id: crypto.randomUUID(),
    type: 'reorder',
    section: 'skills',
    priority: 'medium',
    title: 'Reorder Skills by Job Priority',
    description: `List required skills first: ${context.requiredSkills.slice(0, 5).join(', ')}`,
    after: 'Prioritize job-relevant skills at the top'
  });
  
  // 5. Add relevant soft skills
  const missingSoftSkills = context.softSkills.filter(skill => 
    !profile.skills.some(us => us.toLowerCase().includes(skill.toLowerCase()))
  ).slice(0, 3);
  
  if (missingSoftSkills.length > 0) {
    suggestions.push({
      id: crypto.randomUUID(),
      type: 'add',
      section: 'skills',
      priority: 'medium',
      title: 'Add Soft Skills',
      description: `Consider adding: ${missingSoftSkills.join(', ')}`,
      after: missingSoftSkills.join(', ')
    });
  }
  
  // 6. Tailor experience descriptions
  if (context.responsibilities.length > 0) {
    suggestions.push({
      id: crypto.randomUUID(),
      type: 'modify',
      section: 'experience',
      priority: 'high',
      title: 'Align Experience with Job Responsibilities',
      description: `Match your experience descriptions to: ${context.responsibilities.slice(0, 2).join('; ')}`,
      after: 'Use similar language and focus areas'
    });
  }
  
  // 7. Highlight relevant projects
  if (profile.projects && profile.projects.length > 0) {
    suggestions.push({
      id: crypto.randomUUID(),
      type: 'emphasize',
      section: 'projects',
      priority: 'medium',
      title: 'Emphasize Relevant Projects',
      description: `Highlight projects using: ${analysis.strongMatches.slice(0, 3).join(', ')}`,
      after: 'Feature most relevant projects prominently'
    });
  }
  
  // 8. Add missing certifications
  if (context.qualifications.some(q => q.toLowerCase().includes('certification'))) {
    suggestions.push({
      id: crypto.randomUUID(),
      type: 'add',
      section: 'certifications',
      priority: 'low',
      title: 'Consider Relevant Certifications',
      description: 'Job mentions certifications as a qualification',
      after: 'Add any relevant certifications you have'
    });
  }
  
  return suggestions.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Apply tailoring suggestions automatically
 */
function applyTailoring(
  profile: ResumeProfile,
  analysis: JobAnalysisResult
): ResumeProfile {
  const tailored = { ...profile };
  
  // 1. Add missing required skills (if reasonable)
  const missingRequired = analysis.missingSkills.slice(0, 5);
  missingRequired.forEach(skill => {
    if (!tailored.skills.includes(skill)) {
      tailored.skills.push(skill);
    }
  });
  
  // 2. Reorder skills to prioritize job-relevant ones
  const requiredSkills = analysis.context.requiredSkills;
  tailored.skills.sort((a, b) => {
    const aIsRequired = requiredSkills.some(rs => a.toLowerCase().includes(rs.toLowerCase()));
    const bIsRequired = requiredSkills.some(rs => b.toLowerCase().includes(rs.toLowerCase()));
    if (aIsRequired && !bIsRequired) return -1;
    if (!aIsRequired && bIsRequired) return 1;
    return 0;
  });
  
  // 3. Enhance summary with keywords (if summary exists)
  if (tailored.summary && analysis.context.mustHaveKeywords.length > 0) {
    const keywords = analysis.context.mustHaveKeywords.slice(0, 3).join(', ');
    if (!tailored.summary.toLowerCase().includes(keywords.toLowerCase())) {
      tailored.summary = `${tailored.summary} Experienced with ${keywords}.`;
    }
  }
  
  return tailored;
}

/**
 * Generate a keyword-optimized summary
 */
export function generateOptimizedSummary(
  profile: ResumeProfile,
  context: JobContext
): string {
  const name = `${profile.personal.firstName} ${profile.personal.lastName}`;
  const topSkills = profile.skills.slice(0, 5).join(', ');
  const experience = profile.experience.length > 0 ? profile.experience[0].title : 'Professional';
  const keywords = context.mustHaveKeywords.slice(0, 3).join(', ');
  
  return `${experience} with expertise in ${topSkills}. ${keywords}. ${profile.summary || ''}`.trim();
}
