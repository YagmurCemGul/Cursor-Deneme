/**
 * Job Description extraction utilities
 * Extracts structured data from job posting pages
 */

export interface ExtractedJobDescription {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  salary?: string;
  jobType?: string;
  experienceLevel?: string;
  postedDate?: string;
  url: string;
}

/**
 * Extract job description from current page
 */
export function extractJobDescription(): ExtractedJobDescription | null {
  const url = window.location.href;

  // Try site-specific extractors first
  if (url.includes('linkedin.com')) {
    return extractLinkedInJob();
  } else if (url.includes('indeed.com')) {
    return extractIndeedJob();
  } else if (url.includes('glassdoor.com')) {
    return extractGlassdoorJob();
  } else {
    return extractGenericJob();
  }
}

/**
 * Extract from LinkedIn job page
 */
function extractLinkedInJob(): ExtractedJobDescription | null {
  try {
    const title = document.querySelector('.job-details-jobs-unified-top-card__job-title')?.textContent?.trim() || '';
    const company = document.querySelector('.job-details-jobs-unified-top-card__company-name')?.textContent?.trim() || '';
    const location = document.querySelector('.job-details-jobs-unified-top-card__bullet')?.textContent?.trim() || '';
    
    const descriptionElement = document.querySelector('.jobs-description__content');
    const description = descriptionElement?.textContent?.trim() || '';

    const requirements = extractListItems(descriptionElement, ['requirements', 'qualifications', 'you have', 'you bring']);
    const responsibilities = extractListItems(descriptionElement, ['responsibilities', 'you will', 'your role', 'what you\'ll do']);
    const benefits = extractListItems(descriptionElement, ['benefits', 'we offer', 'perks', 'what we offer']);

    return {
      title,
      company,
      location,
      description,
      requirements,
      responsibilities,
      benefits,
      url: window.location.href,
    };
  } catch (error) {
    console.error('Failed to extract LinkedIn job:', error);
    return null;
  }
}

/**
 * Extract from Indeed job page
 */
function extractIndeedJob(): ExtractedJobDescription | null {
  try {
    const title = document.querySelector('[class*="jobsearch-JobInfoHeader-title"]')?.textContent?.trim() || '';
    const company = document.querySelector('[class*="jobsearch-CompanyInfoContainer"]')?.textContent?.trim() || '';
    const location = document.querySelector('[class*="jobsearch-JobInfoHeader-subtitle"] div')?.textContent?.trim() || '';
    
    const descriptionElement = document.querySelector('#jobDescriptionText');
    const description = descriptionElement?.textContent?.trim() || '';

    const requirements = extractListItems(descriptionElement, ['requirements', 'qualifications', 'skills']);
    const responsibilities = extractListItems(descriptionElement, ['responsibilities', 'duties', 'you will']);
    const benefits = extractListItems(descriptionElement, ['benefits', 'we offer', 'perks']);

    return {
      title,
      company,
      location,
      description,
      requirements,
      responsibilities,
      benefits,
      url: window.location.href,
    };
  } catch (error) {
    console.error('Failed to extract Indeed job:', error);
    return null;
  }
}

/**
 * Extract from Glassdoor job page
 */
function extractGlassdoorJob(): ExtractedJobDescription | null {
  try {
    const title = document.querySelector('[data-test="job-title"]')?.textContent?.trim() || '';
    const company = document.querySelector('[data-test="employer-name"]')?.textContent?.trim() || '';
    const location = document.querySelector('[data-test="location"]')?.textContent?.trim() || '';
    
    const descriptionElement = document.querySelector('[class*="JobDetails_jobDescription"]');
    const description = descriptionElement?.textContent?.trim() || '';

    const requirements = extractListItems(descriptionElement, ['requirements', 'qualifications']);
    const responsibilities = extractListItems(descriptionElement, ['responsibilities', 'duties']);
    const benefits = extractListItems(descriptionElement, ['benefits', 'perks']);

    return {
      title,
      company,
      location,
      description,
      requirements,
      responsibilities,
      benefits,
      url: window.location.href,
    };
  } catch (error) {
    console.error('Failed to extract Glassdoor job:', error);
    return null;
  }
}

/**
 * Generic job description extraction for ATS pages
 */
function extractGenericJob(): ExtractedJobDescription | null {
  try {
    // Try common patterns for title
    const title = 
      document.querySelector('h1')?.textContent?.trim() ||
      document.querySelector('[class*="job-title"]')?.textContent?.trim() ||
      document.querySelector('[class*="position"]')?.textContent?.trim() ||
      document.title.split('|')[0].trim();

    // Try common patterns for company
    const company =
      document.querySelector('[class*="company"]')?.textContent?.trim() ||
      document.querySelector('[class*="employer"]')?.textContent?.trim() ||
      '';

    // Try common patterns for location
    const location =
      document.querySelector('[class*="location"]')?.textContent?.trim() ||
      document.querySelector('[class*="office"]')?.textContent?.trim() ||
      '';

    // Get main content
    const descriptionElement = 
      document.querySelector('[class*="description"]') ||
      document.querySelector('[class*="content"]') ||
      document.querySelector('main') ||
      document.body;

    const description = descriptionElement?.textContent?.trim() || '';

    const requirements = extractListItems(descriptionElement, ['requirements', 'qualifications', 'must have', 'required']);
    const responsibilities = extractListItems(descriptionElement, ['responsibilities', 'duties', 'you will', 'role']);
    const benefits = extractListItems(descriptionElement, ['benefits', 'we offer', 'perks', 'compensation']);

    return {
      title,
      company,
      location,
      description,
      requirements,
      responsibilities,
      benefits,
      url: window.location.href,
    };
  } catch (error) {
    console.error('Failed to extract generic job:', error);
    return null;
  }
}

/**
 * Extract list items from a section containing keywords
 */
function extractListItems(container: Element | null, keywords: string[]): string[] {
  if (!container) return [];

  const items: string[] = [];
  const text = container.textContent?.toLowerCase() || '';

  // Find sections that match keywords
  for (const keyword of keywords) {
    if (text.includes(keyword)) {
      // Try to find list items near this keyword
      const lists = container.querySelectorAll('ul, ol');
      for (const list of lists) {
        // Check if this list is near the keyword
        const parentText = list.parentElement?.textContent?.toLowerCase() || '';
        if (parentText.includes(keyword)) {
          const listItems = list.querySelectorAll('li');
          for (const item of listItems) {
            const itemText = item.textContent?.trim();
            if (itemText && itemText.length > 10) {
              items.push(itemText);
            }
          }
        }
      }
    }
  }

  // Remove duplicates
  return Array.from(new Set(items));
}

/**
 * Extract keywords from job description for ATS matching
 */
export function extractKeywords(jd: ExtractedJobDescription): string[] {
  const allText = [
    jd.description,
    ...jd.requirements,
    ...jd.responsibilities,
  ].join(' ').toLowerCase();

  // Simple tokenization
  const words = allText.split(/\W+/).filter(w => w.length > 2);
  
  // Count frequency
  const frequency: Record<string, number> = {};
  for (const word of words) {
    frequency[word] = (frequency[word] || 0) + 1;
  }

  // Get top keywords (mentioned at least twice)
  const topKeywords = Object.entries(frequency)
    .filter(([_, count]) => count >= 2)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 50)
    .map(([word]) => word);

  return topKeywords;
}
