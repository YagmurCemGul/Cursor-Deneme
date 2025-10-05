/**
 * AI Resume Tailoring
 * Automatically adjusts resume to match job requirements using AI
 */

import type { ResumeProfile, JobPost } from './types';
import { callOpenAI } from './ai';
import { analyzeJobPosting, type JobContext } from './jobAnalyzer';
import { tailorResumeToJob, type TailoringSuggestion } from './resumeTailoring';
import { getRecommendedModel } from './aiProviders';

export interface TailoredResume {
  summary: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    isCurrent?: boolean;
    description: string;
    highlights: string[];
  }>;
  education: Array<{
    school: string;
    degree: string;
    fieldOfStudy?: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    highlights: string[];
  }>;
  changes: TailoringChange[];
  matchScoreBefore: number;
  matchScoreAfter: number;
}

export interface TailoringChange {
  section: string;
  type: 'added' | 'modified' | 'reordered' | 'emphasized';
  description: string;
  before?: string;
  after?: string;
  reason: string;
}

/**
 * Auto-tailor resume to job posting using AI
 */
export async function autoTailorResume(
  profile: ResumeProfile,
  job: JobPost
): Promise<TailoredResume> {
  // 1. Analyze job and current match
  const jobContext = analyzeJobPosting(job.pastedText, job.title);
  const tailoringResult = tailorResumeToJob(profile, job.pastedText, job.title);
  const matchScoreBefore = tailoringResult.analysis.overallMatchScore;

  // 2. Generate AI-tailored content for each section
  const [tailoredSummary, tailoredSkills, tailoredExperience] = await Promise.all([
    tailorSummary(profile, jobContext),
    tailorSkills(profile, jobContext),
    tailorExperience(profile, jobContext)
  ]);

  // 3. Track changes
  const changes: TailoringChange[] = [];

  // Summary changes
  if (tailoredSummary !== profile.summary) {
    changes.push({
      section: 'summary',
      type: 'modified',
      description: 'Optimized professional summary with job-specific keywords',
      before: profile.summary || '',
      after: tailoredSummary,
      reason: `Incorporated ${jobContext.mustHaveKeywords.slice(0, 3).join(', ')} and emphasized relevant experience`
    });
  }

  // Skills changes
  const addedSkills = tailoredSkills.filter(s => !profile.skills.includes(s));
  if (addedSkills.length > 0) {
    changes.push({
      section: 'skills',
      type: 'added',
      description: `Added ${addedSkills.length} relevant skills`,
      after: addedSkills.join(', '),
      reason: `These skills match job requirements: ${jobContext.requiredSkills.slice(0, 3).join(', ')}`
    });
  }

  const reorderedSkills = tailoredSkills.filter(s => profile.skills.includes(s));
  if (reorderedSkills.length > 0 && reorderedSkills[0] !== profile.skills[0]) {
    changes.push({
      section: 'skills',
      type: 'reordered',
      description: 'Prioritized job-relevant skills',
      before: profile.skills.slice(0, 5).join(', '),
      after: reorderedSkills.slice(0, 5).join(', '),
      reason: 'Required skills now appear first for better ATS scanning'
    });
  }

  // Experience changes
  tailoredExperience.forEach((exp, index) => {
    const original = profile.experience[index];
    if (original && exp.description !== original.description) {
      changes.push({
        section: 'experience',
        type: 'modified',
        description: `Enhanced ${exp.title} description`,
        before: original.description?.substring(0, 100) + '...',
        after: exp.description.substring(0, 100) + '...',
        reason: 'Aligned with job responsibilities and added quantifiable metrics'
      });
    }
  });

  // Calculate new match score (estimate)
  const matchScoreAfter = estimateNewMatchScore(
    matchScoreBefore,
    changes.length,
    addedSkills.length
  );

  return {
    summary: tailoredSummary,
    skills: tailoredSkills,
    experience: tailoredExperience,
    education: profile.education,
    projects: profile.projects,
    changes,
    matchScoreBefore,
    matchScoreAfter
  };
}

/**
 * Tailor summary section using AI
 */
async function tailorSummary(
  profile: ResumeProfile,
  jobContext: JobContext
): Promise<string> {
  const systemPrompt = `You are an expert resume writer. Create a concise, impactful professional summary (2-3 sentences) tailored to the job.`;

  const userPrompt = `
CURRENT SUMMARY:
${profile.summary || 'No summary provided'}

CANDIDATE BACKGROUND:
- Name: ${profile.personal.firstName} ${profile.personal.lastName}
- Experience: ${profile.experience.map(exp => exp.title).join(', ')}
- Top Skills: ${profile.skills.slice(0, 8).join(', ')}
- Education: ${profile.education.map(edu => edu.degree).join(', ')}

JOB REQUIREMENTS:
- Title: ${jobContext.jobTitle}
- Required Skills: ${jobContext.requiredSkills.slice(0, 8).join(', ')}
- Must-Have Keywords: ${jobContext.mustHaveKeywords.slice(0, 5).join(', ')}
- Experience Level: ${jobContext.experienceLevel}
- Company Culture: ${jobContext.companyCulture.join(', ')}

INSTRUCTIONS:
1. Write a professional summary (2-3 sentences, max 100 words)
2. Naturally incorporate keywords: ${jobContext.mustHaveKeywords.slice(0, 5).join(', ')}
3. Highlight relevant experience and skills that match the job
4. Use action-oriented language
5. Quantify achievements when possible
6. Maintain professional tone

Return ONLY the summary text, no headers or formatting.`;

  const model = getRecommendedModel('resume');
  const summary = await callOpenAI(systemPrompt, userPrompt, { temperature: 0.6, model });
  
  return summary.trim();
}

/**
 * Tailor skills section using AI
 */
async function tailorSkills(
  profile: ResumeProfile,
  jobContext: JobContext
): Promise<string[]> {
  const systemPrompt = `You are an expert at optimizing resume skills for ATS and recruiters.`;

  const userPrompt = `
CURRENT SKILLS:
${profile.skills.join(', ')}

JOB REQUIREMENTS:
- Required Skills: ${jobContext.requiredSkills.join(', ')}
- Preferred Skills: ${jobContext.preferredSkills.join(', ')}
- Technical Skills: ${jobContext.technicalSkills.join(', ')}

INSTRUCTIONS:
1. Prioritize required skills that candidate has
2. Add missing required skills if they're closely related to candidate's skills
3. Remove skills that are irrelevant to the job
4. Keep the most important 15-20 skills
5. Order: Required skills first, then preferred, then additional relevant skills

Return a comma-separated list of skills ONLY, no explanations.`;

  const model = getRecommendedModel('quick-qa');
  const skillsText = await callOpenAI(systemPrompt, userPrompt, { temperature: 0.4, model });
  
  return skillsText.split(',').map(s => s.trim()).filter(s => s.length > 0);
}

/**
 * Tailor experience section using AI
 */
async function tailorExperience(
  profile: ResumeProfile,
  jobContext: JobContext
): Promise<ResumeProfile['experience']> {
  const tailoredExperience = await Promise.all(
    profile.experience.map(async (exp) => {
      const systemPrompt = `You are an expert resume writer. Enhance job experience descriptions to match target role.`;

      const userPrompt = `
CURRENT EXPERIENCE:
Title: ${exp.title}
Company: ${exp.company}
Description: ${exp.description || 'No description'}

TARGET JOB:
- Title: ${jobContext.jobTitle}
- Required Skills: ${jobContext.requiredSkills.slice(0, 5).join(', ')}
- Key Responsibilities: ${jobContext.responsibilities.slice(0, 3).join('; ')}
- Important Phrases: ${jobContext.importantPhrases.slice(0, 2).join('; ')}

INSTRUCTIONS:
1. Rewrite the experience description (3-5 bullet points)
2. Use similar language to the job posting
3. Emphasize achievements that relate to target role
4. Include quantifiable metrics (numbers, percentages, timeframes)
5. Start each bullet with strong action verbs
6. Incorporate relevant keywords naturally
7. Keep it concise and impactful

Return ONLY the bullet points (use • prefix), no headers.`;

      const model = getRecommendedModel('resume');
      const enhancedDescription = await callOpenAI(systemPrompt, userPrompt, { 
        temperature: 0.5, 
        model 
      });

      // Extract highlights from bullet points
      const highlights = enhancedDescription
        .split('\n')
        .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'))
        .map(line => line.replace(/^[•\-]\s*/, '').trim())
        .filter(line => line.length > 0);

      return {
        ...exp,
        description: enhancedDescription.trim(),
        highlights
      };
    })
  );

  return tailoredExperience;
}

/**
 * Estimate new match score after tailoring
 */
function estimateNewMatchScore(
  currentScore: number,
  changesCount: number,
  addedSkillsCount: number
): number {
  // Each change adds ~2-3 points, added skills add ~3-5 points
  const changeBonus = Math.min(changesCount * 2.5, 15);
  const skillBonus = Math.min(addedSkillsCount * 4, 10);
  
  const newScore = Math.min(currentScore + changeBonus + skillBonus, 98);
  return Math.round(newScore);
}

/**
 * Generate tailoring preview (before/after comparison)
 */
export function generateTailoringPreview(
  original: ResumeProfile,
  tailored: TailoredResume
): string {
  let preview = `# Resume Tailoring Preview\n\n`;
  
  preview += `## Match Score Improvement\n`;
  preview += `Before: ${tailored.matchScoreBefore}%\n`;
  preview += `After: ${tailored.matchScoreAfter}% (+${tailored.matchScoreAfter - tailored.matchScoreBefore}%)\n\n`;
  
  preview += `## Changes Applied (${tailored.changes.length})\n\n`;
  tailored.changes.forEach((change, index) => {
    preview += `${index + 1}. **${change.section.toUpperCase()}** - ${change.type}\n`;
    preview += `   ${change.description}\n`;
    preview += `   Reason: ${change.reason}\n\n`;
  });

  return preview;
}

/**
 * Apply tailored resume to profile
 */
export function applyTailoredResume(
  profile: ResumeProfile,
  tailored: TailoredResume
): ResumeProfile {
  return {
    ...profile,
    summary: tailored.summary,
    skills: tailored.skills,
    experience: tailored.experience.map((exp, index) => ({
      ...profile.experience[index],
      description: exp.description
    })),
    // Keep original education and certifications
    education: profile.education,
    certifications: profile.certifications
  };
}

/**
 * Batch tailor multiple profiles
 */
export async function batchTailorResumes(
  profiles: ResumeProfile[],
  job: JobPost,
  onProgress?: (current: number, total: number) => void
): Promise<Map<string, TailoredResume>> {
  const results = new Map<string, TailoredResume>();
  
  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    if (onProgress) onProgress(i + 1, profiles.length);
    
    try {
      const tailored = await autoTailorResume(profile, job);
      results.set(profile.id || `profile-${i}`, tailored);
    } catch (error) {
      console.error(`Failed to tailor profile ${i}:`, error);
    }
  }
  
  return results;
}
