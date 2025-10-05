/**
 * Advanced Analytics Engine
 * AI-powered resume analytics, insights, and recommendations
 */

import type { ResumeProfile, JobPost } from './types';
import { analyzeJobPosting } from './jobAnalyzer';
import { tailorResumeToJob } from './resumeTailoring';
import { calculateATSScore } from './atsScoring';

export interface ResumeAnalytics {
  overallScore: number;
  sections: SectionAnalytics[];
  strengths: AnalyticsInsight[];
  weaknesses: AnalyticsInsight[];
  opportunities: AnalyticsInsight[];
  competitorComparison: CompetitorAnalysis;
  industryBenchmark: IndustryBenchmark;
  improvementRoadmap: ImprovementItem[];
  predictions: CareerPrediction[];
}

export interface SectionAnalytics {
  section: string;
  score: number;
  completeness: number;
  quality: number;
  atsOptimization: number;
  issues: string[];
  recommendations: string[];
}

export interface AnalyticsInsight {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  quickFix?: string;
  estimatedImprovement: number;
}

export interface CompetitorAnalysis {
  percentile: number;
  comparedTo: number;
  strongerAreas: string[];
  weakerAreas: string[];
  competitiveEdge: string[];
}

export interface IndustryBenchmark {
  industry: string;
  averageScore: number;
  yourScore: number;
  topPerformers: {
    skillsCount: number;
    experienceYears: number;
    certificationsCount: number;
  };
  industryTrends: string[];
}

export interface ImprovementItem {
  priority: number;
  title: string;
  currentState: string;
  targetState: string;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  timeToComplete: string;
  steps: string[];
}

export interface CareerPrediction {
  metric: string;
  prediction: string;
  confidence: number;
  factors: string[];
  timeline: string;
}

export interface PerformanceMetrics {
  viewsPerJob: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
  avgTimeToResponse: number;
  recommendations: string[];
}

/**
 * Analyze resume comprehensively
 */
export function analyzeResume(profile: ResumeProfile, job?: JobPost): ResumeAnalytics {
  // Section-by-section analysis
  const sections: SectionAnalytics[] = [
    analyzeSummarySection(profile),
    analyzeSkillsSection(profile, job),
    analyzeExperienceSection(profile, job),
    analyzeEducationSection(profile),
    analyzeProjectsSection(profile),
    analyzeCertificationsSection(profile)
  ];

  // Calculate overall score
  const overallScore = calculateOverallScore(sections);

  // Identify strengths, weaknesses, opportunities
  const strengths = identifyStrengths(profile, sections);
  const weaknesses = identifyWeaknesses(profile, sections);
  const opportunities = identifyOpportunities(profile, sections, job);

  // Competitor comparison
  const competitorComparison = compareToCompetitors(profile, sections);

  // Industry benchmark
  const industryBenchmark = benchmarkAgainstIndustry(profile, sections);

  // Improvement roadmap
  const improvementRoadmap = generateImprovementRoadmap(weaknesses, opportunities);

  // Career predictions
  const predictions = generateCareerPredictions(profile, sections);

  return {
    overallScore,
    sections,
    strengths,
    weaknesses,
    opportunities,
    competitorComparison,
    industryBenchmark,
    improvementRoadmap,
    predictions
  };
}

/**
 * Analyze summary section
 */
function analyzeSummarySection(profile: ResumeProfile): SectionAnalytics {
  const summary = profile.summary || '';
  const wordCount = summary.split(/\s+/).filter(w => w.length > 0).length;
  
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  if (!summary) {
    issues.push('No professional summary');
    recommendations.push('Add a 2-3 sentence professional summary');
  } else if (wordCount < 30) {
    issues.push('Summary too short');
    recommendations.push('Expand summary to 50-100 words');
  } else if (wordCount > 150) {
    issues.push('Summary too long');
    recommendations.push('Condense summary to 50-100 words');
  }
  
  // Check for quantifiable achievements
  const hasNumbers = /\d+/.test(summary);
  if (!hasNumbers) {
    issues.push('No quantifiable achievements');
    recommendations.push('Include metrics (e.g., "increased by 40%")');
  }

  const completeness = summary ? (wordCount >= 30 && wordCount <= 150 ? 100 : 70) : 0;
  const quality = hasNumbers ? 80 : 60;
  const atsOptimization = summary.length > 0 ? 75 : 0;
  const score = Math.round((completeness + quality + atsOptimization) / 3);

  return {
    section: 'Professional Summary',
    score,
    completeness,
    quality,
    atsOptimization,
    issues,
    recommendations
  };
}

/**
 * Analyze skills section
 */
function analyzeSkillsSection(profile: ResumeProfile, job?: JobPost): SectionAnalytics {
  const skills = profile.skills;
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (skills.length === 0) {
    issues.push('No skills listed');
    recommendations.push('Add at least 10 relevant skills');
  } else if (skills.length < 8) {
    issues.push('Too few skills');
    recommendations.push(`Add ${8 - skills.length} more relevant skills`);
  } else if (skills.length > 25) {
    issues.push('Too many skills (quality over quantity)');
    recommendations.push('Focus on top 15-20 most relevant skills');
  }

  // Check if job-relevant
  if (job) {
    const jobContext = analyzeJobPosting(job.pastedText, job.title);
    const matchedRequired = jobContext.requiredSkills.filter(req => 
      skills.some(s => s.toLowerCase().includes(req.toLowerCase()))
    ).length;
    const matchRate = matchedRequired / Math.max(jobContext.requiredSkills.length, 1);
    
    if (matchRate < 0.5) {
      issues.push(`Only ${Math.round(matchRate * 100)}% of required skills present`);
      recommendations.push('Add missing required skills from job posting');
    }
  }

  const completeness = Math.min(100, (skills.length / 15) * 100);
  const quality = skills.length >= 8 && skills.length <= 25 ? 90 : 70;
  const atsOptimization = job ? 75 : 80;
  const score = Math.round((completeness + quality + atsOptimization) / 3);

  return {
    section: 'Skills',
    score,
    completeness,
    quality,
    atsOptimization,
    issues,
    recommendations
  };
}

/**
 * Analyze experience section
 */
function analyzeExperienceSection(profile: ResumeProfile, job?: JobPost): SectionAnalytics {
  const experience = profile.experience;
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (experience.length === 0) {
    issues.push('No work experience listed');
    recommendations.push('Add at least one work experience');
  }

  let totalQuality = 0;
  experience.forEach((exp, index) => {
    if (!exp.description || exp.description.length < 50) {
      issues.push(`Experience #${index + 1} has minimal description`);
      recommendations.push(`Add detailed bullet points for ${exp.title}`);
    }
    
    const hasMetrics = /\d+%|\d+\+|increased|reduced|improved/i.test(exp.description || '');
    if (!hasMetrics) {
      issues.push(`Experience #${index + 1} lacks quantifiable achievements`);
      recommendations.push(`Add metrics to ${exp.title} accomplishments`);
    }
    
    totalQuality += (exp.description && exp.description.length >= 100 ? 1 : 0.5);
  });

  const completeness = experience.length > 0 ? Math.min(100, (experience.length / 3) * 100) : 0;
  const quality = experience.length > 0 ? (totalQuality / experience.length) * 100 : 0;
  const atsOptimization = 80;
  const score = Math.round((completeness + quality + atsOptimization) / 3);

  return {
    section: 'Work Experience',
    score,
    completeness,
    quality,
    atsOptimization,
    issues,
    recommendations
  };
}

/**
 * Analyze education section
 */
function analyzeEducationSection(profile: ResumeProfile): SectionAnalytics {
  const education = profile.education;
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (education.length === 0) {
    issues.push('No education listed');
    recommendations.push('Add educational background');
  }

  const hasDegree = education.some(edu => 
    edu.degree.toLowerCase().includes('bachelor') || 
    edu.degree.toLowerCase().includes('master')
  );

  if (!hasDegree && education.length > 0) {
    recommendations.push('Consider adding degree information if applicable');
  }

  const completeness = education.length > 0 ? 100 : 0;
  const quality = hasDegree ? 90 : 70;
  const atsOptimization = 85;
  const score = Math.round((completeness + quality + atsOptimization) / 3);

  return {
    section: 'Education',
    score,
    completeness,
    quality,
    atsOptimization,
    issues,
    recommendations
  };
}

/**
 * Analyze projects section
 */
function analyzeProjectsSection(profile: ResumeProfile): SectionAnalytics {
  const projects = profile.projects || [];
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (projects.length === 0) {
    recommendations.push('Add 2-3 portfolio projects to showcase skills');
  } else if (projects.length < 2) {
    recommendations.push('Add 1-2 more projects');
  }

  const completeness = Math.min(100, (projects.length / 3) * 100);
  const quality = projects.length > 0 ? 85 : 0;
  const atsOptimization = 75;
  const score = Math.round((completeness + quality + atsOptimization) / 3);

  return {
    section: 'Projects',
    score,
    completeness,
    quality,
    atsOptimization,
    issues,
    recommendations
  };
}

/**
 * Analyze certifications section
 */
function analyzeCertificationsSection(profile: ResumeProfile): SectionAnalytics {
  const certifications = profile.certifications || [];
  const recommendations: string[] = [];

  if (certifications.length === 0) {
    recommendations.push('Consider adding relevant certifications');
  }

  const completeness = Math.min(100, (certifications.length / 2) * 100);
  const quality = certifications.length > 0 ? 90 : 0;
  const atsOptimization = 80;
  const score = Math.round((completeness + quality + atsOptimization) / 3);

  return {
    section: 'Certifications',
    score,
    completeness,
    quality,
    atsOptimization,
    issues: [],
    recommendations
  };
}

/**
 * Calculate overall score
 */
function calculateOverallScore(sections: SectionAnalytics[]): number {
  const weights = {
    'Professional Summary': 0.15,
    'Skills': 0.25,
    'Work Experience': 0.35,
    'Education': 0.15,
    'Projects': 0.07,
    'Certifications': 0.03
  };

  const weightedScore = sections.reduce((sum, section) => {
    const weight = weights[section.section as keyof typeof weights] || 0.1;
    return sum + (section.score * weight);
  }, 0);

  return Math.round(weightedScore);
}

/**
 * Identify strengths
 */
function identifyStrengths(profile: ResumeProfile, sections: SectionAnalytics[]): AnalyticsInsight[] {
  const strengths: AnalyticsInsight[] = [];

  sections.forEach(section => {
    if (section.score >= 80) {
      strengths.push({
        title: `Strong ${section.section}`,
        description: `Your ${section.section.toLowerCase()} is well-optimized with a score of ${section.score}/100`,
        impact: 'high',
        actionable: false,
        estimatedImprovement: 0
      });
    }
  });

  if (profile.skills.length >= 15) {
    strengths.push({
      title: 'Comprehensive Skill Set',
      description: `You have ${profile.skills.length} skills listed, showing breadth of expertise`,
      impact: 'medium',
      actionable: false,
      estimatedImprovement: 0
    });
  }

  return strengths.slice(0, 5);
}

/**
 * Identify weaknesses
 */
function identifyWeaknesses(profile: ResumeProfile, sections: SectionAnalytics[]): AnalyticsInsight[] {
  const weaknesses: AnalyticsInsight[] = [];

  sections.forEach(section => {
    if (section.score < 60 && section.issues.length > 0) {
      weaknesses.push({
        title: `Improve ${section.section}`,
        description: section.issues[0],
        impact: 'high',
        actionable: true,
        quickFix: section.recommendations[0],
        estimatedImprovement: 15
      });
    }
  });

  return weaknesses;
}

/**
 * Identify opportunities
 */
function identifyOpportunities(
  profile: ResumeProfile,
  sections: SectionAnalytics[],
  job?: JobPost
): AnalyticsInsight[] {
  const opportunities: AnalyticsInsight[] = [];

  if (job) {
    opportunities.push({
      title: 'Tailor Resume to Job',
      description: 'AI can auto-optimize your resume for this specific job posting',
      impact: 'high',
      actionable: true,
      quickFix: 'Use AI Resume Tailoring feature',
      estimatedImprovement: 20
    });
  }

  if (!profile.projects || profile.projects.length < 2) {
    opportunities.push({
      title: 'Add Portfolio Projects',
      description: 'Showcase your skills with 2-3 portfolio projects',
      impact: 'medium',
      actionable: true,
      quickFix: 'Add projects from your GitHub or past work',
      estimatedImprovement: 10
    });
  }

  return opportunities;
}

/**
 * Compare to competitors
 */
function compareToCompetitors(profile: ResumeProfile, sections: SectionAnalytics[]): CompetitorAnalysis {
  const overallScore = calculateOverallScore(sections);
  const percentile = Math.min(95, Math.round(overallScore * 0.9));

  return {
    percentile,
    comparedTo: 1000,
    strongerAreas: sections
      .filter(s => s.score >= 80)
      .map(s => s.section)
      .slice(0, 3),
    weakerAreas: sections
      .filter(s => s.score < 60)
      .map(s => s.section)
      .slice(0, 3),
    competitiveEdge: [
      `${profile.skills.length} technical skills`,
      `${profile.experience.length} work experiences`,
      `${calculateYearsOfExperience(profile)} years experience`
    ]
  };
}

/**
 * Benchmark against industry
 */
function benchmarkAgainstIndustry(profile: ResumeProfile, sections: SectionAnalytics[]): IndustryBenchmark {
  const industry = 'Technology';
  const yourScore = calculateOverallScore(sections);
  const averageScore = 68;

  return {
    industry,
    averageScore,
    yourScore,
    topPerformers: {
      skillsCount: 18,
      experienceYears: 5,
      certificationsCount: 2
    },
    industryTrends: [
      'AI/ML skills in high demand',
      'Cloud certifications valuable',
      'Remote work experience preferred'
    ]
  };
}

/**
 * Generate improvement roadmap
 */
function generateImprovementRoadmap(
  weaknesses: AnalyticsInsight[],
  opportunities: AnalyticsInsight[]
): ImprovementItem[] {
  const items: ImprovementItem[] = [];
  let priority = 1;

  [...weaknesses, ...opportunities].forEach(insight => {
    if (insight.actionable) {
      items.push({
        priority: priority++,
        title: insight.title,
        currentState: 'Needs improvement',
        targetState: 'Optimized',
        effort: insight.impact === 'high' ? 'medium' : 'low',
        impact: insight.impact,
        timeToComplete: insight.impact === 'high' ? '1-2 hours' : '30 minutes',
        steps: [
          insight.quickFix || 'Review and update section',
          'Test ATS compatibility',
          'Get feedback'
        ]
      });
    }
  });

  return items.slice(0, 5);
}

/**
 * Generate career predictions
 */
function generateCareerPredictions(profile: ResumeProfile, sections: SectionAnalytics[]): CareerPrediction[] {
  const overallScore = calculateOverallScore(sections);
  
  return [
    {
      metric: 'Interview Rate',
      prediction: overallScore >= 75 ? '15-20% response rate' : '8-12% response rate',
      confidence: 0.75,
      factors: ['Resume quality', 'Skills match', 'Experience level'],
      timeline: 'Next 3 months'
    },
    {
      metric: 'Salary Growth',
      prediction: `${Math.round(overallScore * 0.3)}% increase potential`,
      confidence: 0.65,
      factors: ['Market demand', 'Skills alignment', 'Experience'],
      timeline: 'Next role'
    }
  ];
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

/**
 * Track application performance
 */
export function trackApplicationPerformance(
  applications: Array<{ status: string; appliedAt: Date; respondedAt?: Date }>
): PerformanceMetrics {
  const total = applications.length;
  const responded = applications.filter(a => a.respondedAt).length;
  const interviews = applications.filter(a => a.status === 'interview').length;
  const offers = applications.filter(a => a.status === 'offer').length;

  const responseRate = total > 0 ? (responded / total) * 100 : 0;
  const interviewRate = total > 0 ? (interviews / total) * 100 : 0;
  const offerRate = total > 0 ? (offers / total) * 100 : 0;

  const recommendations: string[] = [];
  if (responseRate < 10) {
    recommendations.push('Your response rate is low. Consider improving resume quality.');
  }
  if (interviewRate < 5) {
    recommendations.push('Low interview rate. Tailor resumes more specifically to each job.');
  }

  return {
    viewsPerJob: Math.round(total * 0.3),
    responseRate: Math.round(responseRate),
    interviewRate: Math.round(interviewRate),
    offerRate: Math.round(offerRate),
    avgTimeToResponse: 7,
    recommendations
  };
}
