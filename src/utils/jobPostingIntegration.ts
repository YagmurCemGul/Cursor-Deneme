/**
 * Job Posting Site Integration
 * Provides utilities to scrape and integrate with popular job posting sites
 */

import { logger } from './logger';

export interface JobPosting {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  skills: string[];
  url: string;
  source: 'linkedin' | 'indeed' | 'glassdoor' | 'other';
}

/**
 * Detect if the current page is a job posting site
 */
export function detectJobPostingSite(): 'linkedin' | 'indeed' | 'glassdoor' | null {
  const hostname = window.location.hostname;
  
  if (hostname.includes('linkedin.com')) {
    return 'linkedin';
  } else if (hostname.includes('indeed.com')) {
    return 'indeed';
  } else if (hostname.includes('glassdoor.com')) {
    return 'glassdoor';
  }
  
  return null;
}

/**
 * Extract job posting data from LinkedIn
 */
export function extractLinkedInJobData(): Partial<JobPosting> | null {
  try {
    const selectors = {
      title: '.jobs-unified-top-card__job-title, .job-details-jobs-unified-top-card__job-title',
      company: '.jobs-unified-top-card__company-name, .job-details-jobs-unified-top-card__company-name',
      location: '.jobs-unified-top-card__bullet, .job-details-jobs-unified-top-card__bullet',
      description: '.jobs-description__content, .jobs-box__html-content',
    };

    const title = document.querySelector(selectors.title)?.textContent?.trim();
    const company = document.querySelector(selectors.company)?.textContent?.trim();
    const location = document.querySelector(selectors.location)?.textContent?.trim();
    const descriptionElement = document.querySelector(selectors.description);
    const description = descriptionElement?.textContent?.trim() || '';

    if (!title || !description) {
      return null;
    }

    // Extract skills and requirements from description
    const { skills, requirements } = parseJobDescription(description);

    return {
      title,
      company,
      location,
      description,
      skills,
      requirements,
      url: window.location.href,
      source: 'linkedin',
    };
  } catch (error) {
    logger.error('Failed to extract LinkedIn job data:', error);
    return null;
  }
}

/**
 * Extract job posting data from Indeed
 */
export function extractIndeedJobData(): Partial<JobPosting> | null {
  try {
    const selectors = {
      title: '.jobsearch-JobInfoHeader-title, h1.jobTitle',
      company: '.jobsearch-InlineCompanyRating > div > div, .jobsearch-CompanyInfoContainer span',
      location: '.jobsearch-JobInfoHeader-subtitle > div:last-child, div[data-testid="job-location"]',
      description: '#jobDescriptionText, .jobsearch-jobDescriptionText',
    };

    const title = document.querySelector(selectors.title)?.textContent?.trim();
    const company = document.querySelector(selectors.company)?.textContent?.trim();
    const location = document.querySelector(selectors.location)?.textContent?.trim();
    const descriptionElement = document.querySelector(selectors.description);
    const description = descriptionElement?.textContent?.trim() || '';

    if (!title || !description) {
      return null;
    }

    const { skills, requirements } = parseJobDescription(description);

    return {
      title,
      company,
      location,
      description,
      skills,
      requirements,
      url: window.location.href,
      source: 'indeed',
    };
  } catch (error) {
    logger.error('Failed to extract Indeed job data:', error);
    return null;
  }
}

/**
 * Extract job posting data from Glassdoor
 */
export function extractGlassdoorJobData(): Partial<JobPosting> | null {
  try {
    const selectors = {
      title: '.job-title, .jobTitle',
      company: '.job-company, .employerName',
      location: '.job-location, .location',
      description: '.jobDescriptionContent, .desc',
    };

    const title = document.querySelector(selectors.title)?.textContent?.trim();
    const company = document.querySelector(selectors.company)?.textContent?.trim();
    const location = document.querySelector(selectors.location)?.textContent?.trim();
    const descriptionElement = document.querySelector(selectors.description);
    const description = descriptionElement?.textContent?.trim() || '';

    if (!title || !description) {
      return null;
    }

    const { skills, requirements } = parseJobDescription(description);

    return {
      title,
      company,
      location,
      description,
      skills,
      requirements,
      url: window.location.href,
      source: 'glassdoor',
    };
  } catch (error) {
    logger.error('Failed to extract Glassdoor job data:', error);
    return null;
  }
}

/**
 * Parse job description to extract skills and requirements
 */
function parseJobDescription(description: string): {
  skills: string[];
  requirements: string[];
} {
  const skills: string[] = [];
  const requirements: string[] = [];

  // Common technical skills patterns
  const skillPatterns = [
    /\b(JavaScript|TypeScript|Python|Java|C\+\+|C#|Ruby|PHP|Go|Rust|Swift|Kotlin)\b/gi,
    /\b(React|Angular|Vue|Node\.js|Express|Django|Flask|Spring|\.NET)\b/gi,
    /\b(SQL|MongoDB|PostgreSQL|MySQL|Redis|Elasticsearch)\b/gi,
    /\b(AWS|Azure|GCP|Docker|Kubernetes|Jenkins|CI\/CD)\b/gi,
    /\b(Git|Agile|Scrum|REST|GraphQL|API)\b/gi,
  ];

  skillPatterns.forEach((pattern) => {
    const matches = description.match(pattern);
    if (matches) {
      matches.forEach((match) => {
        const normalized = match.trim();
        if (!skills.includes(normalized)) {
          skills.push(normalized);
        }
      });
    }
  });

  // Extract requirements (lines starting with bullets or numbers)
  const lines = description.split('\n');
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (
      /^[•\-\*]\s/.test(trimmed) ||
      /^\d+[\.\)]\s/.test(trimmed)
    ) {
      const requirement = trimmed.replace(/^[•\-\*\d\.\)]+\s*/, '').trim();
      if (requirement.length > 10 && requirement.length < 200) {
        requirements.push(requirement);
      }
    }
  });

  return { skills, requirements };
}

/**
 * Auto-detect and extract job posting from current page
 */
export function autoExtractJobPosting(): Partial<JobPosting> | null {
  const site = detectJobPostingSite();
  
  switch (site) {
    case 'linkedin':
      return extractLinkedInJobData();
    case 'indeed':
      return extractIndeedJobData();
    case 'glassdoor':
      return extractGlassdoorJobData();
    default:
      return null;
  }
}

/**
 * Create a content script message to extract job data
 */
export function createJobExtractionMessage(): { type: string; action: string } {
  return {
    type: 'JOB_EXTRACTION',
    action: 'EXTRACT_JOB_DATA',
  };
}

/**
 * Format job posting as a description template
 */
export function formatJobPostingAsDescription(jobData: Partial<JobPosting>): string {
  const parts: string[] = [];

  if (jobData.title) {
    parts.push(`Role: ${jobData.title}`);
  }

  if (jobData.company) {
    parts.push(`Company: ${jobData.company}`);
  }

  if (jobData.location) {
    parts.push(`Location: ${jobData.location}`);
  }

  if (jobData.description) {
    parts.push('');
    parts.push('Description:');
    parts.push(jobData.description);
  }

  if (jobData.requirements && jobData.requirements.length > 0) {
    parts.push('');
    parts.push('Requirements:');
    jobData.requirements.forEach((req) => {
      parts.push(`• ${req}`);
    });
  }

  if (jobData.skills && jobData.skills.length > 0) {
    parts.push('');
    parts.push(`Skills: ${jobData.skills.join(', ')}`);
  }

  if (jobData.url) {
    parts.push('');
    parts.push(`Source: ${jobData.url}`);
  }

  return parts.join('\n');
}

/**
 * Quick apply helper for job sites
 */
export function getQuickApplySelectors(site: string): {
  applyButton: string;
  resumeUpload: string;
  coverLetterField: string;
} | null {
  switch (site) {
    case 'linkedin':
      return {
        applyButton: '.jobs-apply-button, button[aria-label*="Apply"]',
        resumeUpload: 'input[type="file"][name*="resume"], input[type="file"][id*="resume"]',
        coverLetterField: 'textarea[name*="coverLetter"], textarea[id*="coverLetter"]',
      };
    case 'indeed':
      return {
        applyButton: '.ia-BasePage-footer button, #indeedApplyButton',
        resumeUpload: 'input[type="file"][name*="resume"]',
        coverLetterField: 'textarea[name*="coverLetter"]',
      };
    case 'glassdoor':
      return {
        applyButton: '.apply-btn, button[data-test="applyButton"]',
        resumeUpload: 'input[type="file"][name="resume"]',
        coverLetterField: 'textarea[name="coverLetter"]',
      };
    default:
      return null;
  }
}

/**
 * Check if we're on a job application page
 */
export function isJobApplicationPage(): boolean {
  const url = window.location.href.toLowerCase();
  const keywords = ['apply', 'application', 'job', 'career', 'position'];
  
  return keywords.some(keyword => url.includes(keyword));
}

/**
 * Get job board name from URL
 */
export function getJobBoardName(url: string): string {
  const hostname = new URL(url).hostname.toLowerCase();
  
  if (hostname.includes('linkedin.com')) return 'LinkedIn';
  if (hostname.includes('indeed.com')) return 'Indeed';
  if (hostname.includes('glassdoor.com')) return 'Glassdoor';
  if (hostname.includes('monster.com')) return 'Monster';
  if (hostname.includes('ziprecruiter.com')) return 'ZipRecruiter';
  if (hostname.includes('dice.com')) return 'Dice';
  if (hostname.includes('careerbuilder.com')) return 'CareerBuilder';
  
  return 'Unknown';
}
