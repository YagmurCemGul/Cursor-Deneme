/**
 * Job Data Extractor
 * Extract job details from various job board pages
 */

export interface ExtractedJobData {
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  requirements?: string[];
  salary?: string;
  type?: string;
  url?: string;
  source?: 'linkedin' | 'indeed' | 'glassdoor' | 'remote' | 'generic';
}

/**
 * Extract job data from LinkedIn job page
 */
function extractLinkedInJob(): ExtractedJobData | null {
  try {
    const data: ExtractedJobData = { source: 'linkedin' };

    // Job title
    const titleEl = document.querySelector('h1.job-details-jobs-unified-top-card__job-title, h1.t-24');
    if (titleEl) data.title = titleEl.textContent?.trim();

    // Company
    const companyEl = document.querySelector('a.job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name a');
    if (companyEl) data.company = companyEl.textContent?.trim();

    // Location
    const locationEl = document.querySelector('.job-details-jobs-unified-top-card__bullet, .jobs-unified-top-card__bullet');
    if (locationEl) data.location = locationEl.textContent?.trim();

    // Job type
    const typeEl = document.querySelector('.job-details-jobs-unified-top-card__job-insight span');
    if (typeEl) data.type = typeEl.textContent?.trim();

    // Description
    const descEl = document.querySelector('.jobs-description__content, article.jobs-description');
    if (descEl) {
      data.description = descEl.textContent?.trim().substring(0, 3000);
    }

    // URL
    data.url = window.location.href;

    return data.title || data.company ? data : null;
  } catch (error) {
    console.error('LinkedIn extraction error:', error);
    return null;
  }
}

/**
 * Extract job data from Indeed job page
 */
function extractIndeedJob(): ExtractedJobData | null {
  try {
    const data: ExtractedJobData = { source: 'indeed' };

    // Job title
    const titleEl = document.querySelector('h1.jobsearch-JobInfoHeader-title, h2.jobsearch-JobInfoHeader-title');
    if (titleEl) data.title = titleEl.textContent?.trim();

    // Company
    const companyEl = document.querySelector('[data-company-name="true"], .jobsearch-InlineCompanyRating-companyHeader a');
    if (companyEl) data.company = companyEl.textContent?.trim();

    // Location
    const locationEl = document.querySelector('[data-testid="job-location"], .jobsearch-JobInfoHeader-subtitle div');
    if (locationEl) data.location = locationEl.textContent?.trim();

    // Salary
    const salaryEl = document.querySelector('[data-testid="attribute_snippet_testid"]');
    if (salaryEl) data.salary = salaryEl.textContent?.trim();

    // Description
    const descEl = document.querySelector('#jobDescriptionText, .jobsearch-jobDescriptionText');
    if (descEl) {
      data.description = descEl.textContent?.trim().substring(0, 3000);
    }

    // URL
    data.url = window.location.href;

    return data.title || data.company ? data : null;
  } catch (error) {
    console.error('Indeed extraction error:', error);
    return null;
  }
}

/**
 * Extract job data from Glassdoor job page
 */
function extractGlassdoorJob(): ExtractedJobData | null {
  try {
    const data: ExtractedJobData = { source: 'glassdoor' };

    // Job title
    const titleEl = document.querySelector('[data-test="job-title"], h1.heading');
    if (titleEl) data.title = titleEl.textContent?.trim();

    // Company
    const companyEl = document.querySelector('[data-test="employer-name"], .employerName');
    if (companyEl) data.company = companyEl.textContent?.trim();

    // Location
    const locationEl = document.querySelector('[data-test="location"], .location');
    if (locationEl) data.location = locationEl.textContent?.trim();

    // Salary
    const salaryEl = document.querySelector('[data-test="salary-estimate"]');
    if (salaryEl) data.salary = salaryEl.textContent?.trim();

    // Description
    const descEl = document.querySelector('[data-test="job-description"], .jobDescriptionContent');
    if (descEl) {
      data.description = descEl.textContent?.trim().substring(0, 3000);
    }

    // URL
    data.url = window.location.href;

    return data.title || data.company ? data : null;
  } catch (error) {
    console.error('Glassdoor extraction error:', error);
    return null;
  }
}

/**
 * Extract job data from Remote.co or other remote job boards
 */
function extractRemoteJob(): ExtractedJobData | null {
  try {
    const data: ExtractedJobData = { source: 'remote' };

    // Generic selectors that work on many remote job boards
    const titleEl = document.querySelector('h1, .job-title, [class*="title"]');
    if (titleEl) data.title = titleEl.textContent?.trim();

    const companyEl = document.querySelector('.company-name, [class*="company"]');
    if (companyEl) data.company = companyEl.textContent?.trim();

    const locationEl = document.querySelector('.location, [class*="location"]');
    if (locationEl) data.location = locationEl.textContent?.trim();

    data.url = window.location.href;

    return data.title || data.company ? data : null;
  } catch (error) {
    console.error('Remote job extraction error:', error);
    return null;
  }
}

/**
 * Generic job data extraction using common patterns
 */
function extractGenericJob(): ExtractedJobData | null {
  try {
    const data: ExtractedJobData = { source: 'generic' };

    // Try to find job title
    const h1 = document.querySelector('h1');
    if (h1) data.title = h1.textContent?.trim();

    // Try to find company in meta tags
    const companyMeta = document.querySelector('meta[property="og:site_name"], meta[name="author"]');
    if (companyMeta) {
      data.company = companyMeta.getAttribute('content')?.trim();
    }

    // Get page URL
    data.url = window.location.href;

    // Get full page text as description (limited)
    const bodyText = document.body.textContent?.trim();
    if (bodyText) {
      data.description = bodyText.substring(0, 3000);
    }

    return data.title ? data : null;
  } catch (error) {
    console.error('Generic extraction error:', error);
    return null;
  }
}

/**
 * Detect current job board and extract data accordingly
 */
export function extractJobData(): ExtractedJobData | null {
  const url = window.location.href;

  if (url.includes('linkedin.com/jobs')) {
    return extractLinkedInJob();
  } else if (url.includes('indeed.com')) {
    return extractIndeedJob();
  } else if (url.includes('glassdoor.com')) {
    return extractGlassdoorJob();
  } else if (url.includes('remote.co') || url.includes('weworkremotely.com') || url.includes('remoteok.com')) {
    return extractRemoteJob();
  } else {
    // Try generic extraction as fallback
    return extractGenericJob();
  }
}

/**
 * Check if current page is a job posting
 */
export function isJobPage(): boolean {
  const url = window.location.href;
  
  // Known job boards
  if (
    url.includes('linkedin.com/jobs') ||
    url.includes('indeed.com/viewjob') ||
    url.includes('glassdoor.com/job') ||
    url.includes('remote.co/job') ||
    url.includes('weworkremotely.com/jobs') ||
    url.includes('remoteok.com/remote-jobs')
  ) {
    return true;
  }

  // Generic heuristics
  const hasJobKeywords = document.title.toLowerCase().includes('job') ||
    document.title.toLowerCase().includes('career') ||
    document.title.toLowerCase().includes('position');

  const hasJobElements = !!(
    document.querySelector('h1') &&
    (document.querySelector('.company, [class*="company"]') ||
     document.querySelector('.location, [class*="location"]'))
  );

  return hasJobKeywords && hasJobElements;
}

/**
 * Extract text from selected content
 */
export function extractSelectedText(): string {
  const selection = window.getSelection();
  return selection?.toString().trim() || '';
}
