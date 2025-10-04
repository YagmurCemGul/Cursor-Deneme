/**
 * ATS Score Calculator
 * Analyzes CV and provides a numerical ATS compatibility score
 * 
 * @module atsScoreCalculator
 */

import { CVData } from '../types';

/**
 * Score breakdown by category
 */
export interface ATSScoreBreakdown {
  keywordMatch: number;
  formatScore: number;
  contentQuality: number;
  completeness: number;
  overall: number;
  recommendations: string[];
}

/**
 * Calculates keyword density between CV and job description
 */
function calculateKeywordMatch(cvData: CVData, jobDescription: string): number {
  if (!jobDescription.trim()) return 0;

  const jobKeywords = extractKeywords(jobDescription);
  const cvText = getCVText(cvData).toLowerCase();
  
  let matchedKeywords = 0;
  jobKeywords.forEach(keyword => {
    if (cvText.includes(keyword.toLowerCase())) {
      matchedKeywords++;
    }
  });

  return jobKeywords.length > 0 ? (matchedKeywords / jobKeywords.length) * 100 : 0;
}

/**
 * Extracts important keywords from text
 */
function extractKeywords(text: string): string[] {
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
    'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
  ]);

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word))
    .filter((word, index, self) => self.indexOf(word) === index);
}

/**
 * Converts CV data to searchable text
 */
function getCVText(cvData: CVData): string {
  const parts: string[] = [];

  // Personal info
  const { firstName, lastName, summary } = cvData.personalInfo;
  parts.push(firstName, lastName, summary);

  // Skills
  parts.push(...cvData.skills);

  // Experience
  cvData.experience.forEach(exp => {
    parts.push(exp.title, exp.company, exp.description);
    if (exp.skills) parts.push(...exp.skills);
  });

  // Education
  cvData.education.forEach(edu => {
    parts.push(edu.school, edu.degree, edu.fieldOfStudy, edu.description);
    if (edu.skills) parts.push(...edu.skills);
  });

  // Certifications
  cvData.certifications.forEach(cert => {
    parts.push(cert.name, cert.issuingOrganization);
    if (cert.skills) parts.push(...cert.skills);
  });

  // Projects
  cvData.projects.forEach(proj => {
    parts.push(proj.name, proj.description);
    if (proj.skills) parts.push(...proj.skills);
  });

  return parts.filter(Boolean).join(' ');
}

/**
 * Calculates format score (ATS-friendly formatting)
 */
function calculateFormatScore(cvData: CVData): number {
  let score = 0;
  const maxScore = 100;

  // Check if basic sections are present and formatted well
  if (cvData.personalInfo.email) score += 15;
  if (cvData.personalInfo.phoneNumber) score += 10;
  if (cvData.skills.length > 0) score += 20;
  if (cvData.experience.length > 0) score += 25;
  if (cvData.education.length > 0) score += 20;
  
  // Bonus points for optional sections
  if (cvData.certifications.length > 0) score += 5;
  if (cvData.projects.length > 0) score += 5;

  return Math.min(score, maxScore);
}

/**
 * Calculates content quality score
 */
function calculateContentQuality(cvData: CVData): number {
  let score = 0;
  const maxScore = 100;

  // Check summary quality
  const summaryLength = cvData.personalInfo.summary.length;
  if (summaryLength > 50 && summaryLength < 500) {
    score += 20;
  } else if (summaryLength > 0) {
    score += 10;
  }

  // Check experience descriptions
  let experienceScore = 0;
  cvData.experience.forEach(exp => {
    if (exp.description.length > 50) experienceScore += 5;
    if (exp.skills && exp.skills.length > 0) experienceScore += 3;
  });
  score += Math.min(experienceScore, 30);

  // Check skills diversity
  if (cvData.skills.length >= 5) score += 20;
  else if (cvData.skills.length >= 3) score += 10;

  // Check education details
  let educationScore = 0;
  cvData.education.forEach(edu => {
    if (edu.fieldOfStudy) educationScore += 5;
    if (edu.grade) educationScore += 3;
    if (edu.description) educationScore += 2;
  });
  score += Math.min(educationScore, 15);

  // Check for quantifiable achievements (numbers in descriptions)
  const hasNumbers = /\d+/.test(getCVText(cvData));
  if (hasNumbers) score += 15;

  return Math.min(score, maxScore);
}

/**
 * Calculates completeness score
 */
function calculateCompleteness(cvData: CVData): number {
  let score = 0;
  const fields = [
    cvData.personalInfo.firstName,
    cvData.personalInfo.lastName,
    cvData.personalInfo.email,
    cvData.personalInfo.phoneNumber,
    cvData.personalInfo.summary,
    cvData.skills.length > 0,
    cvData.experience.length > 0,
    cvData.education.length > 0,
  ];

  const filledFields = fields.filter(Boolean).length;
  score = (filledFields / fields.length) * 100;

  return Math.round(score);
}

/**
 * Generates recommendations based on the CV analysis
 */
function generateRecommendations(
  cvData: CVData,
  _jobDescription: string,
  scores: Omit<ATSScoreBreakdown, 'recommendations'>
): string[] {
  const recommendations: string[] = [];

  // Keyword match recommendations
  if (scores.keywordMatch < 50) {
    recommendations.push('Add more relevant keywords from the job description to your CV');
    recommendations.push('Ensure your skills section includes key technologies mentioned in the job posting');
  } else if (scores.keywordMatch < 70) {
    recommendations.push('Good keyword match, but consider adding a few more relevant terms from the job description');
  }

  // Format recommendations
  if (scores.formatScore < 80) {
    if (!cvData.personalInfo.email) {
      recommendations.push('Add your email address for better ATS compatibility');
    }
    if (!cvData.personalInfo.phoneNumber) {
      recommendations.push('Add your phone number to make it easier for recruiters to contact you');
    }
    if (cvData.skills.length < 5) {
      recommendations.push('Add more skills to strengthen your profile');
    }
  }

  // Content quality recommendations
  if (scores.contentQuality < 70) {
    if (cvData.personalInfo.summary.length < 50) {
      recommendations.push('Add a professional summary to introduce yourself effectively');
    }
    if (!getCVText(cvData).match(/\d+/)) {
      recommendations.push('Include quantifiable achievements (numbers, percentages, metrics) in your experience descriptions');
    }
    cvData.experience.forEach((exp) => {
      if (exp.description.length < 50) {
        recommendations.push(`Expand the description for your ${exp.title} role with more details and achievements`);
      }
    });
  }

  // Completeness recommendations
  if (scores.completeness < 90) {
    if (!cvData.personalInfo.linkedInUsername) {
      recommendations.push('Add your LinkedIn profile for better professional presence');
    }
    if (cvData.certifications.length === 0) {
      recommendations.push('Consider adding relevant certifications to strengthen your profile');
    }
    if (cvData.projects.length === 0) {
      recommendations.push('Add notable projects to showcase your practical experience');
    }
  }

  // General recommendations
  if (recommendations.length === 0) {
    recommendations.push('Excellent! Your CV is well-optimized for ATS systems');
    recommendations.push('Continue to tailor your CV for each specific job application');
  }

  return recommendations;
}

/**
 * Calculates comprehensive ATS score for a CV
 */
export function calculateATSScore(cvData: CVData, _jobDescription: string = ''): ATSScoreBreakdown {
  const keywordMatch = _jobDescription ? calculateKeywordMatch(cvData, _jobDescription) : 0;
  const formatScore = calculateFormatScore(cvData);
  const contentQuality = calculateContentQuality(cvData);
  const completeness = calculateCompleteness(cvData);

  // Weight different factors
  const weights = {
    keywordMatch: _jobDescription ? 0.3 : 0,
    formatScore: _jobDescription ? 0.25 : 0.35,
    contentQuality: _jobDescription ? 0.25 : 0.35,
    completeness: 0.2,
  };

  const overall = Math.round(
    keywordMatch * weights.keywordMatch +
    formatScore * weights.formatScore +
    contentQuality * weights.contentQuality +
    completeness * weights.completeness
  );

  const scores = {
    keywordMatch: Math.round(keywordMatch),
    formatScore: Math.round(formatScore),
    contentQuality: Math.round(contentQuality),
    completeness: Math.round(completeness),
    overall,
  };

  const recommendations = generateRecommendations(cvData, _jobDescription, scores);

  return {
    ...scores,
    recommendations,
  };
}

/**
 * Gets a color code based on score
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981'; // green
  if (score >= 60) return '#f59e0b'; // amber
  if (score >= 40) return '#f97316'; // orange
  return '#ef4444'; // red
}

/**
 * Gets a label based on score
 */
export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Needs Improvement';
  return 'Poor';
}
