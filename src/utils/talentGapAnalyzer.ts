import { CVData } from '../types';

export interface SkillGap {
  skill: string;
  required: boolean; // Is this a required skill for the job?
  hasSkill: boolean; // Does the candidate have this skill?
  proficiencyLevel?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  matchType: 'exact' | 'partial' | 'missing';
  suggestions?: string[];
}

export interface TalentGapAnalysis {
  overallMatch: number; // Percentage 0-100
  matchedSkills: SkillGap[];
  missingSkills: SkillGap[];
  additionalSkills: string[]; // Skills candidate has but not in job description
  recommendations: string[];
  strengthAreas: string[];
  improvementAreas: string[];
}

/**
 * Analyze talent gaps between CV and job requirements
 */
export function analyzeTalentGap(
  cvData: CVData,
  jobDescription: string
): TalentGapAnalysis {
  // Extract required skills from job description
  const requiredSkills = extractSkillsFromJobDescription(jobDescription);
  
  // Get candidate's skills
  const candidateSkills = cvData.skills || [];
  
  // Analyze skill matches
  const skillGaps = analyzeSkillMatches(candidateSkills, requiredSkills);
  
  // Separate matched and missing skills
  const matchedSkills = skillGaps.filter(sg => sg.hasSkill);
  const missingSkills = skillGaps.filter(sg => !sg.hasSkill);
  
  // Find additional skills
  const additionalSkills = findAdditionalSkills(candidateSkills, requiredSkills);
  
  // Calculate overall match percentage
  const overallMatch = calculateOverallMatch(matchedSkills, skillGaps);
  
  // Generate recommendations
  const recommendations = generateRecommendations(missingSkills, matchedSkills, overallMatch);
  
  // Identify strength and improvement areas
  const strengthAreas = identifyStrengthAreas(matchedSkills, cvData, jobDescription);
  const improvementAreas = identifyImprovementAreas(missingSkills, cvData);
  
  return {
    overallMatch,
    matchedSkills,
    missingSkills,
    additionalSkills,
    recommendations,
    strengthAreas,
    improvementAreas,
  };
}

/**
 * Extract skills from job description using keyword matching
 */
function extractSkillsFromJobDescription(jobDescription: string): Map<string, boolean> {
  const skillsMap = new Map<string, boolean>();
  const lowerDesc = jobDescription.toLowerCase();
  
  // Common tech skills to look for
  const commonSkills = [
    // Programming Languages
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
    
    // Frontend
    'react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt', 'html', 'css', 'sass', 'tailwind',
    
    // Backend
    'node.js', 'express', 'django', 'flask', 'spring', 'asp.net', 'laravel', 'rails',
    
    // Database
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'oracle',
    
    // Cloud & DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'gitlab', 'github actions',
    
    // Tools & Methods
    'git', 'agile', 'scrum', 'jira', 'ci/cd', 'tdd', 'rest api', 'graphql', 'microservices',
    
    // Soft Skills
    'leadership', 'communication', 'problem solving', 'teamwork', 'project management',
    'analytical', 'critical thinking', 'time management', 'adaptability',
  ];
  
  // Check for each skill
  commonSkills.forEach(skill => {
    if (lowerDesc.includes(skill)) {
      // Check if it's required or preferred
      const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const skillPattern = new RegExp(`(required|must have|essential|mandatory)[^.]*${escapedSkill}`, 'i');
      const isRequired = skillPattern.test(jobDescription);
      skillsMap.set(skill, isRequired);
    }
  });
  
  // Look for "required" and "preferred" sections
  const requiredMatch = jobDescription.match(/required[^:]*:([\s\S]*?)(?:preferred|qualifications|responsibilities|$)/i);
  if (requiredMatch && requiredMatch[1]) {
    const requiredSection = requiredMatch[1].toLowerCase();
    commonSkills.forEach(skill => {
      if (requiredSection.includes(skill) && !skillsMap.has(skill)) {
        skillsMap.set(skill, true);
      }
    });
  }
  
  return skillsMap;
}

/**
 * Analyze skill matches between candidate and requirements
 */
function analyzeSkillMatches(
  candidateSkills: string[],
  requiredSkills: Map<string, boolean>
): SkillGap[] {
  const gaps: SkillGap[] = [];
  const lowerCandidateSkills = candidateSkills.map(s => s.toLowerCase());
  
  // Check each required skill
  requiredSkills.forEach((isRequired, skill) => {
    const hasExactMatch = lowerCandidateSkills.includes(skill);
    const partialMatch = !hasExactMatch && lowerCandidateSkills.some(cs => 
      cs.includes(skill) || skill.includes(cs)
    );
    
    const gapItem: SkillGap = {
      skill: skill.charAt(0).toUpperCase() + skill.slice(1), // Capitalize
      required: isRequired,
      hasSkill: hasExactMatch || partialMatch,
      matchType: hasExactMatch ? 'exact' : (partialMatch ? 'partial' : 'missing'),
    };
    
    if (!hasExactMatch && !partialMatch) {
      gapItem.suggestions = generateSkillSuggestions(skill);
    }
    
    gaps.push(gapItem);
  });
  
  return gaps;
}

/**
 * Find skills candidate has that aren't in job requirements
 */
function findAdditionalSkills(
  candidateSkills: string[],
  requiredSkills: Map<string, boolean>
): string[] {
  const lowerRequiredSkills = Array.from(requiredSkills.keys());
  
  return candidateSkills.filter(skill => {
    const lowerSkill = skill.toLowerCase();
    return !lowerRequiredSkills.some(rs => 
      rs === lowerSkill || rs.includes(lowerSkill) || lowerSkill.includes(rs)
    );
  });
}

/**
 * Calculate overall match percentage
 */
function calculateOverallMatch(
  _matchedSkills: SkillGap[],
  allGaps: SkillGap[]
): number {
  if (allGaps.length === 0) return 100;
  
  // Weight required skills more heavily
  let totalWeight = 0;
  let matchedWeight = 0;
  
  allGaps.forEach(gap => {
    const weight = gap.required ? 2 : 1;
    totalWeight += weight;
    
    if (gap.hasSkill) {
      const matchWeight = gap.matchType === 'exact' ? 1 : 0.5;
      matchedWeight += weight * matchWeight;
    }
  });
  
  return Math.round((matchedWeight / totalWeight) * 100);
}

/**
 * Generate recommendations based on gaps
 */
function generateRecommendations(
  missingSkills: SkillGap[],
  matchedSkills: SkillGap[],
  overallMatch: number
): string[] {
  const recommendations: string[] = [];
  
  // Overall assessment
  if (overallMatch >= 80) {
    recommendations.push('Excellent match! Your skills align very well with the job requirements.');
  } else if (overallMatch >= 60) {
    recommendations.push('Good match! You meet most of the job requirements with some areas for improvement.');
  } else if (overallMatch >= 40) {
    recommendations.push('Moderate match. Consider highlighting transferable skills and addressing key gaps.');
  } else {
    recommendations.push('Consider gaining more experience in the required areas before applying.');
  }
  
  // Priority missing skills
  const requiredMissing = missingSkills.filter(s => s.required);
  if (requiredMissing.length > 0) {
    recommendations.push(
      `Priority: Develop skills in ${requiredMissing.slice(0, 3).map(s => s.skill).join(', ')}. These are required for the role.`
    );
  }
  
  // Leverage strengths
  const exactMatches = matchedSkills.filter(s => s.matchType === 'exact');
  if (exactMatches.length > 0) {
    recommendations.push(
      `Highlight your expertise in ${exactMatches.slice(0, 3).map(s => s.skill).join(', ')} in your application.`
    );
  }
  
  // Learning path
  if (missingSkills.length > 0 && missingSkills.length <= 5) {
    recommendations.push(
      'Consider taking online courses or working on projects to develop the missing skills.'
    );
  }
  
  return recommendations;
}

/**
 * Generate suggestions for acquiring a skill
 */
function generateSkillSuggestions(skill: string): string[] {
  const suggestions: string[] = [];
  
  // Generic suggestions
  suggestions.push(`Take an online course on ${skill}`);
  suggestions.push(`Build a project using ${skill}`);
  suggestions.push(`Contribute to open-source projects involving ${skill}`);
  
  return suggestions;
}

/**
 * Identify strength areas based on matches
 */
function identifyStrengthAreas(
  matchedSkills: SkillGap[],
  cvData: CVData,
  jobDescription: string
): string[] {
  const strengths: string[] = [];
  
  // Skills strengths
  const exactMatches = matchedSkills.filter(s => s.matchType === 'exact');
  if (exactMatches.length >= 5) {
    strengths.push(`Strong technical skill alignment with ${exactMatches.length} exact matches`);
  }
  
  // Experience level
  if (cvData.experience && cvData.experience.length >= 3) {
    strengths.push('Substantial work experience');
  }
  
  // Education
  if (cvData.education && cvData.education.length > 0) {
    const relevantEducation = cvData.education.some(edu => {
      const lowerField = edu.fieldOfStudy?.toLowerCase() || '';
      const lowerDesc = jobDescription.toLowerCase();
      return lowerDesc.includes(lowerField) || lowerField.length > 0;
    });
    if (relevantEducation) {
      strengths.push('Relevant educational background');
    }
  }
  
  // Projects
  if (cvData.projects && cvData.projects.length >= 3) {
    strengths.push('Demonstrated practical experience through projects');
  }
  
  return strengths;
}

/**
 * Identify improvement areas
 */
function identifyImprovementAreas(
  missingSkills: SkillGap[],
  cvData: CVData
): string[] {
  const areas: string[] = [];
  
  // Missing required skills
  const requiredMissing = missingSkills.filter(s => s.required);
  if (requiredMissing.length > 0) {
    areas.push(`Develop required skills: ${requiredMissing.map(s => s.skill).join(', ')}`);
  }
  
  // Missing preferred skills
  const preferredMissing = missingSkills.filter(s => !s.required);
  if (preferredMissing.length > 0 && preferredMissing.length <= 5) {
    areas.push(`Consider learning: ${preferredMissing.map(s => s.skill).join(', ')}`);
  }
  
  // Experience gaps
  if (!cvData.experience || cvData.experience.length < 2) {
    areas.push('Gain more professional work experience');
  }
  
  // Project portfolio
  if (!cvData.projects || cvData.projects.length < 2) {
    areas.push('Build a stronger project portfolio');
  }
  
  return areas;
}

/**
 * Get skill match percentage for a specific skill
 */
export function getSkillMatchPercentage(skill: SkillGap): number {
  if (!skill.hasSkill) return 0;
  if (skill.matchType === 'exact') return 100;
  if (skill.matchType === 'partial') return 50;
  return 0;
}

/**
 * Group skills by category
 */
export function groupSkillsByCategory(skills: SkillGap[]): Map<string, SkillGap[]> {
  const categories = new Map<string, SkillGap[]>();
  
  const techSkills: SkillGap[] = [];
  const softSkills: SkillGap[] = [];
  const otherSkills: SkillGap[] = [];
  
  const softSkillKeywords = ['leadership', 'communication', 'teamwork', 'management', 'analytical'];
  
  skills.forEach(skill => {
    const lowerSkill = skill.skill.toLowerCase();
    if (softSkillKeywords.some(keyword => lowerSkill.includes(keyword))) {
      softSkills.push(skill);
    } else if (lowerSkill.match(/[a-z]+\.(js|py|net|io)/i) || 
               lowerSkill.match(/(script|sql|api|cloud)/i)) {
      techSkills.push(skill);
    } else {
      otherSkills.push(skill);
    }
  });
  
  if (techSkills.length > 0) categories.set('Technical Skills', techSkills);
  if (softSkills.length > 0) categories.set('Soft Skills', softSkills);
  if (otherSkills.length > 0) categories.set('Other Skills', otherSkills);
  
  return categories;
}
