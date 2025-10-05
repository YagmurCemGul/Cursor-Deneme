/**
 * Career Path Recommender
 * AI-powered career planning and growth strategies
 */

import type { ResumeProfile } from './types';
import { callOpenAI } from './ai';
import { getRecommendedModel } from './aiProviders';

export interface CareerPath {
  id: string;
  title: string;
  description: string;
  matchScore: number;
  timeToAchieve: string;
  salaryRange: { min: number; max: number };
  requiredSkills: SkillRequirement[];
  milestones: Milestone[];
  growthStrategy: GrowthStrategy;
  industryDemand: 'high' | 'medium' | 'low';
  workLifeBalance: 'excellent' | 'good' | 'moderate' | 'challenging';
  pros: string[];
  cons: string[];
}

export interface SkillRequirement {
  skill: string;
  currentLevel: 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
  requiredLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  priority: 'critical' | 'important' | 'nice-to-have';
  learningResources: string[];
  estimatedTimeToLearn: string;
}

export interface Milestone {
  title: string;
  description: string;
  timeframe: string;
  objectives: string[];
  successMetrics: string[];
  resources: string[];
}

export interface GrowthStrategy {
  shortTerm: ActionItem[]; // 0-6 months
  mediumTerm: ActionItem[]; // 6-18 months
  longTerm: ActionItem[]; // 18+ months
  continuousLearning: string[];
  networking: string[];
  certifications: string[];
}

export interface ActionItem {
  action: string;
  why: string;
  how: string;
  timeframe: string;
  priority: 'high' | 'medium' | 'low';
}

export interface CareerAnalysis {
  currentPosition: string;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  strengths: string[];
  skillGaps: string[];
  careerPaths: CareerPath[];
  recommendations: string[];
}

/**
 * Analyze career and recommend paths
 */
export async function analyzeCareer(profile: ResumeProfile): Promise<CareerAnalysis> {
  const currentPosition = profile.experience[0]?.title || 'Professional';
  const experienceLevel = determineExperienceLevel(profile);
  const strengths = identifyStrengths(profile);
  const skillGaps = await identifySkillGaps(profile);
  
  // Generate multiple career path options
  const careerPaths = await generateCareerPaths(profile, experienceLevel);
  
  // Generate personalized recommendations
  const recommendations = await generateCareerRecommendations(profile, careerPaths);
  
  return {
    currentPosition,
    experienceLevel,
    strengths,
    skillGaps,
    careerPaths,
    recommendations
  };
}

/**
 * Generate career path options
 */
async function generateCareerPaths(
  profile: ResumeProfile,
  experienceLevel: string
): Promise<CareerPath[]> {
  const systemPrompt = `You are an expert career counselor. Generate realistic, personalized career path options.`;

  const userPrompt = `
CURRENT PROFILE:
- Current Role: ${profile.experience[0]?.title || 'N/A'}
- Experience Level: ${experienceLevel}
- Skills: ${profile.skills.join(', ')}
- Education: ${profile.education.map(e => e.degree).join(', ')}
- Years of Experience: ${calculateYearsOfExperience(profile)}

Generate 4 different career path options:
1. Linear progression (next logical step)
2. Lateral move (different specialization)
3. Leadership track (management)
4. Entrepreneurial path (startup/consulting)

For each path provide:
- Title and description
- Match score (0-100)
- Time to achieve
- Salary range
- 5 required skills with learning time
- 3-5 milestones
- Pros and cons

Format as JSON array with all fields.`;

  const model = getRecommendedModel('resume');
  const response = await callOpenAI(systemPrompt, userPrompt, { temperature: 0.7, model });
  
  try {
    const paths = JSON.parse(response);
    return paths.map((path: any, index: number) => ({
      id: `path-${index}`,
      title: path.title,
      description: path.description,
      matchScore: path.matchScore || 75,
      timeToAchieve: path.timeToAchieve || '1-2 years',
      salaryRange: path.salaryRange || { min: 100000, max: 150000 },
      requiredSkills: (path.requiredSkills || []).map((skill: any) => ({
        skill: skill.skill || skill,
        currentLevel: assessSkillLevel(profile.skills, skill.skill || skill),
        requiredLevel: skill.requiredLevel || 'advanced',
        priority: skill.priority || 'important',
        learningResources: skill.learningResources || ['Online courses', 'Books', 'Practice'],
        estimatedTimeToLearn: skill.estimatedTimeToLearn || '3-6 months'
      })),
      milestones: path.milestones || generateDefaultMilestones(),
      growthStrategy: generateGrowthStrategy(path.title, profile),
      industryDemand: path.industryDemand || 'medium',
      workLifeBalance: path.workLifeBalance || 'good',
      pros: path.pros || ['Growth opportunity', 'Higher salary'],
      cons: path.cons || ['Requires additional skills', 'Competitive field']
    }));
  } catch (error) {
    console.error('Failed to parse career paths:', error);
    return generateFallbackCareerPaths(profile, experienceLevel);
  }
}

/**
 * Generate growth strategy for a career path
 */
function generateGrowthStrategy(
  targetRole: string,
  profile: ResumeProfile
): GrowthStrategy {
  return {
    shortTerm: [
      {
        action: 'Identify skill gaps',
        why: 'Understand what you need to learn',
        how: 'Compare your skills to job postings for target role',
        timeframe: '1 month',
        priority: 'high'
      },
      {
        action: 'Start online course',
        why: 'Begin building required skills',
        how: 'Enroll in Coursera, Udemy, or LinkedIn Learning',
        timeframe: '2-3 months',
        priority: 'high'
      },
      {
        action: 'Build portfolio project',
        why: 'Demonstrate new skills',
        how: 'Create a project showcasing target role skills',
        timeframe: '3-4 months',
        priority: 'medium'
      }
    ],
    mediumTerm: [
      {
        action: 'Seek stretch assignments',
        why: 'Gain relevant experience in current role',
        how: 'Volunteer for projects aligned with target role',
        timeframe: '6-12 months',
        priority: 'high'
      },
      {
        action: 'Build professional network',
        why: 'Learn from others and find opportunities',
        how: 'Attend meetups, conferences, join communities',
        timeframe: '6-18 months',
        priority: 'medium'
      },
      {
        action: 'Get certified',
        why: 'Validate skills with credentials',
        how: 'Pursue relevant certifications',
        timeframe: '12-18 months',
        priority: 'medium'
      }
    ],
    longTerm: [
      {
        action: 'Apply for target roles',
        why: 'Make the career transition',
        how: 'Target companies and roles aligned with path',
        timeframe: '18-24 months',
        priority: 'high'
      },
      {
        action: 'Mentor others',
        why: 'Solidify expertise and give back',
        how: 'Mentor junior professionals in your field',
        timeframe: '24+ months',
        priority: 'low'
      }
    ],
    continuousLearning: [
      'Stay updated with industry trends and news',
      'Read books and blogs by industry leaders',
      'Follow thought leaders on social media',
      'Experiment with new tools and technologies',
      'Contribute to open source projects'
    ],
    networking: [
      'Join professional associations',
      'Attend industry conferences and meetups',
      'Participate in online communities',
      'Connect with alumni from your school',
      'Reach out to professionals for informational interviews'
    ],
    certifications: generateRelevantCertifications(targetRole)
  };
}

/**
 * Identify skill gaps for career growth
 */
async function identifySkillGaps(profile: ResumeProfile): Promise<string[]> {
  const systemPrompt = `You are a career advisor. Identify key skill gaps for career advancement.`;

  const userPrompt = `
CURRENT SKILLS:
${profile.skills.join(', ')}

CURRENT ROLE:
${profile.experience[0]?.title || 'Professional'}

Identify 5 critical skills this professional should develop for career growth.
Consider:
- Emerging technologies
- Leadership skills
- Technical depth
- Business skills

Return only a comma-separated list of skills.`;

  const model = getRecommendedModel('quick-qa');
  const response = await callOpenAI(systemPrompt, userPrompt, { temperature: 0.6, model });
  
  return response.split(',').map(s => s.trim()).filter(s => s.length > 0).slice(0, 5);
}

/**
 * Generate career recommendations
 */
async function generateCareerRecommendations(
  profile: ResumeProfile,
  careerPaths: CareerPath[]
): Promise<string[]> {
  const topPath = careerPaths[0];
  
  return [
    `🎯 Best Fit: ${topPath.title} - ${topPath.matchScore}% match based on your skills`,
    `📚 Focus on developing: ${topPath.requiredSkills.slice(0, 3).map(s => s.skill).join(', ')}`,
    `💰 Expected salary growth: ${((topPath.salaryRange.max - 80000) / 80000 * 100).toFixed(0)}% increase potential`,
    `⏱️ Timeline: ${topPath.timeToAchieve} to be ready for ${topPath.title} roles`,
    `🌟 Key next step: ${topPath.milestones[0]?.title || 'Start learning required skills'}`,
    `🤝 Network with professionals in ${topPath.title} positions`,
    `📈 Industry demand for ${topPath.title} is ${topPath.industryDemand}`
  ];
}

/**
 * Generate skill development plan
 */
export async function generateSkillDevelopmentPlan(
  skill: string,
  currentLevel: string,
  targetLevel: string,
  timeframe: string
): Promise<{
  skill: string;
  learningPath: LearningPathItem[];
  resources: LearningResource[];
  practiceProjects: string[];
  estimatedTime: string;
}> {
  const systemPrompt = `You are a learning advisor. Create a structured skill development plan.`;

  const userPrompt = `
SKILL: ${skill}
CURRENT LEVEL: ${currentLevel}
TARGET LEVEL: ${targetLevel}
TIMEFRAME: ${timeframe}

Create a detailed learning path with:
1. 5-7 learning steps (progressive)
2. Recommended resources (courses, books, videos)
3. 3 practice projects
4. Time estimate for each step

Format as JSON: { learningPath: [{step, description, duration}], resources: [{type, name, url}], practiceProjects: [] }`;

  const model = getRecommendedModel('resume');
  const response = await callOpenAI(systemPrompt, userPrompt, { temperature: 0.6, model });
  
  try {
    const plan = JSON.parse(response);
    return {
      skill,
      learningPath: plan.learningPath || [],
      resources: plan.resources || [],
      practiceProjects: plan.practiceProjects || [],
      estimatedTime: timeframe
    };
  } catch (error) {
    return {
      skill,
      learningPath: [
        { step: 'Learn fundamentals', description: `Study ${skill} basics`, duration: '2 weeks' },
        { step: 'Practice basics', description: 'Complete tutorials and exercises', duration: '2 weeks' },
        { step: 'Build project', description: 'Create a real-world project', duration: '4 weeks' }
      ],
      resources: [
        { type: 'Course', name: `${skill} Complete Guide`, url: 'Udemy/Coursera' },
        { type: 'Book', name: `Learning ${skill}`, url: 'Amazon' },
        { type: 'Documentation', name: `Official ${skill} Docs`, url: 'Official website' }
      ],
      practiceProjects: [
        `Build a simple ${skill} application`,
        `Contribute to ${skill} open source project`,
        `Create a tutorial about ${skill}`
      ],
      estimatedTime: timeframe
    };
  }
}

// Helper functions

interface LearningPathItem {
  step: string;
  description: string;
  duration: string;
}

interface LearningResource {
  type: 'Course' | 'Book' | 'Video' | 'Documentation' | 'Tutorial';
  name: string;
  url: string;
}

function determineExperienceLevel(profile: ResumeProfile): 'entry' | 'mid' | 'senior' | 'lead' | 'executive' {
  const years = calculateYearsOfExperience(profile);
  
  if (years < 2) return 'entry';
  if (years < 5) return 'mid';
  if (years < 8) return 'senior';
  if (years < 12) return 'lead';
  return 'executive';
}

function calculateYearsOfExperience(profile: ResumeProfile): number {
  if (!profile.experience || profile.experience.length === 0) return 0;
  
  const totalMonths = profile.experience.reduce((sum, exp) => {
    const start = new Date(exp.startDate);
    const end = exp.isCurrent ? new Date() : new Date(exp.endDate || Date.now());
    const months = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return sum + months;
  }, 0);
  
  return Math.round(totalMonths / 12);
}

function identifyStrengths(profile: ResumeProfile): string[] {
  const strengths: string[] = [];
  
  // Years of experience
  const years = calculateYearsOfExperience(profile);
  if (years >= 5) strengths.push(`${years} years of professional experience`);
  
  // Education
  if (profile.education.some(e => e.degree.toLowerCase().includes('master'))) {
    strengths.push('Advanced degree (Master\'s)');
  } else if (profile.education.some(e => e.degree.toLowerCase().includes('bachelor'))) {
    strengths.push('Bachelor\'s degree');
  }
  
  // Skills breadth
  if (profile.skills.length >= 10) {
    strengths.push(`Diverse skill set (${profile.skills.length} skills)`);
  }
  
  // Projects
  if (profile.projects && profile.projects.length >= 3) {
    strengths.push('Strong project portfolio');
  }
  
  // Certifications
  if (profile.certifications && profile.certifications.length > 0) {
    strengths.push(`${profile.certifications.length} professional certification(s)`);
  }
  
  return strengths.slice(0, 5);
}

function assessSkillLevel(
  currentSkills: string[],
  targetSkill: string
): 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert' {
  const hasSkill = currentSkills.some(skill => 
    skill.toLowerCase().includes(targetSkill.toLowerCase()) ||
    targetSkill.toLowerCase().includes(skill.toLowerCase())
  );
  
  return hasSkill ? 'intermediate' : 'none';
}

function generateDefaultMilestones(): Milestone[] {
  return [
    {
      title: 'Skill Development',
      description: 'Learn and practice required skills',
      timeframe: '0-6 months',
      objectives: ['Complete 2-3 online courses', 'Build portfolio projects', 'Practice daily'],
      successMetrics: ['Completed projects', 'Certifications earned'],
      resources: ['Online courses', 'Books', 'Tutorials']
    },
    {
      title: 'Experience Building',
      description: 'Gain relevant experience',
      timeframe: '6-12 months',
      objectives: ['Seek relevant projects', 'Contribute to open source', 'Build network'],
      successMetrics: ['GitHub contributions', 'Network connections'],
      resources: ['GitHub', 'LinkedIn', 'Meetups']
    },
    {
      title: 'Career Transition',
      description: 'Apply for target roles',
      timeframe: '12-18 months',
      objectives: ['Update resume', 'Apply to jobs', 'Interview preparation'],
      successMetrics: ['Interview invitations', 'Job offers'],
      resources: ['Job boards', 'Recruiters', 'Network']
    }
  ];
}

function generateRelevantCertifications(targetRole: string): string[] {
  const certMap: { [key: string]: string[] } = {
    'developer': ['AWS Certified Developer', 'Professional Scrum Developer', 'Microsoft Certified'],
    'manager': ['PMP', 'Certified Scrum Master', 'Agile Certified Practitioner'],
    'data': ['AWS Machine Learning', 'Google Data Engineer', 'Microsoft Azure Data Scientist'],
    'security': ['CISSP', 'CEH', 'Security+'],
    'architect': ['AWS Solutions Architect', 'TOGAF', 'Azure Solutions Architect']
  };
  
  const roleLower = targetRole.toLowerCase();
  for (const [key, certs] of Object.entries(certMap)) {
    if (roleLower.includes(key)) return certs;
  }
  
  return ['Industry-specific certifications', 'Leadership training', 'Technical certifications'];
}

function generateFallbackCareerPaths(
  profile: ResumeProfile,
  experienceLevel: string
): CareerPath[] {
  const currentRole = profile.experience[0]?.title || 'Professional';
  
  return [
    {
      id: 'path-1',
      title: `Senior ${currentRole}`,
      description: 'Natural progression in your current field',
      matchScore: 85,
      timeToAchieve: '1-2 years',
      salaryRange: { min: 110000, max: 150000 },
      requiredSkills: [
        {
          skill: 'Advanced technical skills',
          currentLevel: 'intermediate',
          requiredLevel: 'advanced',
          priority: 'critical',
          learningResources: ['Online courses', 'Books'],
          estimatedTimeToLearn: '6-12 months'
        }
      ],
      milestones: generateDefaultMilestones(),
      growthStrategy: generateGrowthStrategy(`Senior ${currentRole}`, profile),
      industryDemand: 'high',
      workLifeBalance: 'good',
      pros: ['Natural progression', 'Clear path', 'Higher salary'],
      cons: ['May require additional skills', 'Competitive']
    }
  ];
}
