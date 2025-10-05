/**
 * Job Board Integration
 * Interface with various job boards for searching and auto-syncing
 */

import { ResumeProfile } from './types';

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  type?: string;
  posted: string;
  url: string;
  source: 'linkedin' | 'indeed' | 'remote' | 'glassdoor';
  matchScore?: number;
  matchReasons?: string[];
}

export interface JobSearchParams {
  query: string;
  location?: string;
  remote?: boolean;
  type?: 'full-time' | 'part-time' | 'contract' | 'internship';
  experience?: 'entry' | 'mid' | 'senior';
  limit?: number;
}

/**
 * Calculate job match score based on profile
 */
export function calculateJobMatch(job: JobListing, profile: ResumeProfile): {
  score: number;
  reasons: string[];
} {
  let score = 0;
  const reasons: string[] = [];
  const maxScore = 100;

  // Normalize text for comparison
  const jobText = `${job.title} ${job.description}`.toLowerCase();
  const userSkills = profile.skills.map(s => s.toLowerCase());

  // 1. Skill matching (50 points max)
  let matchedSkills = 0;
  userSkills.forEach(skill => {
    if (jobText.includes(skill)) {
      matchedSkills++;
    }
  });

  if (matchedSkills > 0) {
    const skillScore = Math.min(50, (matchedSkills / userSkills.length) * 50);
    score += skillScore;
    reasons.push(`${matchedSkills}/${userSkills.length} skills matched`);
  }

  // 2. Experience level matching (20 points max)
  const hasExperience = profile.experience && profile.experience.length > 0;
  if (hasExperience) {
    const totalYears = profile.experience.reduce((acc, exp) => {
      const start = new Date(exp.startDate);
      const end = exp.current ? new Date() : new Date(exp.endDate);
      const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return acc + years;
    }, 0);

    if (totalYears > 0) {
      score += 20;
      reasons.push(`${Math.floor(totalYears)} years experience`);
    }
  }

  // 3. Job title similarity (15 points max)
  if (profile.experience && profile.experience.length > 0) {
    const recentTitle = profile.experience[0].title.toLowerCase();
    const jobTitle = job.title.toLowerCase();
    
    // Check for similar keywords
    const titleWords = recentTitle.split(/\s+/);
    const matchedWords = titleWords.filter(word => 
      word.length > 3 && jobTitle.includes(word)
    ).length;

    if (matchedWords > 0) {
      score += 15;
      reasons.push('Similar job title');
    }
  }

  // 4. Education match (15 points max)
  if (profile.education && profile.education.length > 0) {
    const hasDegree = profile.education.some(edu => 
      edu.degree.toLowerCase().includes('bachelor') ||
      edu.degree.toLowerCase().includes('master') ||
      edu.degree.toLowerCase().includes('phd')
    );

    if (hasDegree) {
      score += 15;
      reasons.push('Education requirements met');
    }
  }

  // Normalize score to 0-100
  score = Math.min(maxScore, Math.round(score));

  return { score, reasons };
}

/**
 * Mock LinkedIn job search
 * In production, this would use LinkedIn Jobs API
 */
export async function searchLinkedInJobs(params: JobSearchParams): Promise<JobListing[]> {
  // Mock data for demonstration
  return [
    {
      id: 'linkedin-1',
      title: 'Senior Frontend Developer',
      company: 'Tech Innovators Inc',
      location: 'San Francisco, CA',
      description: 'Looking for an experienced React developer with TypeScript expertise. Must have 5+ years of experience in modern web development.',
      salary: '$120k - $180k',
      type: 'Full-time',
      posted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      url: 'https://www.linkedin.com/jobs/view/12345',
      source: 'linkedin',
    },
    {
      id: 'linkedin-2',
      title: 'Full Stack Engineer',
      company: 'StartupX',
      location: 'Remote',
      description: 'Join our fast-growing startup. Experience with Node.js, React, and PostgreSQL required.',
      salary: '$100k - $150k',
      type: 'Full-time',
      posted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      url: 'https://www.linkedin.com/jobs/view/12346',
      source: 'linkedin',
    },
  ];
}

/**
 * Mock Indeed job search
 */
export async function searchIndeedJobs(params: JobSearchParams): Promise<JobListing[]> {
  return [
    {
      id: 'indeed-1',
      title: 'Software Engineer',
      company: 'Global Tech Corp',
      location: 'New York, NY',
      description: 'Seeking talented software engineers with experience in JavaScript, Python, and cloud technologies.',
      salary: '$110k - $160k',
      type: 'Full-time',
      posted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      url: 'https://www.indeed.com/viewjob?jk=abc123',
      source: 'indeed',
    },
  ];
}

/**
 * Mock remote job board search
 */
export async function searchRemoteJobs(params: JobSearchParams): Promise<JobListing[]> {
  return [
    {
      id: 'remote-1',
      title: 'Remote Developer',
      company: 'Digital Nomad Co',
      location: 'Remote (Worldwide)',
      description: 'Fully remote position for experienced developers. Work from anywhere!',
      salary: '$90k - $140k',
      type: 'Full-time',
      posted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      url: 'https://remote.co/job/developer-123',
      source: 'remote',
    },
  ];
}

/**
 * Search all job boards
 */
export async function searchAllJobBoards(
  params: JobSearchParams,
  profile?: ResumeProfile
): Promise<JobListing[]> {
  const [linkedinJobs, indeedJobs, remoteJobs] = await Promise.all([
    searchLinkedInJobs(params),
    searchIndeedJobs(params),
    searchRemoteJobs(params),
  ]);

  let allJobs = [...linkedinJobs, ...indeedJobs, ...remoteJobs];

  // Calculate match scores if profile provided
  if (profile) {
    allJobs = allJobs.map(job => {
      const match = calculateJobMatch(job, profile);
      return {
        ...job,
        matchScore: match.score,
        matchReasons: match.reasons,
      };
    });

    // Sort by match score
    allJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  } else {
    // Sort by posted date
    allJobs.sort((a, b) => new Date(b.posted).getTime() - new Date(a.posted).getTime());
  }

  return allJobs.slice(0, params.limit || 20);
}

/**
 * Get recommended jobs based on profile
 */
export async function getRecommendedJobs(profile: ResumeProfile, limit: number = 10): Promise<JobListing[]> {
  // Build search query from profile
  const skills = profile.skills.slice(0, 3).join(' ');
  const recentJob = profile.experience?.[0]?.title || '';
  const query = `${recentJob} ${skills}`.trim() || 'developer';

  const params: JobSearchParams = {
    query,
    remote: true,
    limit,
  };

  const jobs = await searchAllJobBoards(params, profile);
  
  // Filter by minimum match score
  return jobs.filter(job => (job.matchScore || 0) >= 30);
}

/**
 * Check for new jobs matching profile
 */
export async function checkForNewJobs(profile: ResumeProfile): Promise<{
  newJobs: JobListing[];
  count: number;
}> {
  const jobs = await getRecommendedJobs(profile, 5);
  
  // Get previously seen job IDs
  const result = await chrome.storage.local.get(['seenJobIds']);
  const seenIds = new Set(result.seenJobIds || []);
  
  // Filter new jobs
  const newJobs = jobs.filter(job => !seenIds.has(job.id));
  
  // Update seen IDs
  const allSeenIds = [...Array.from(seenIds), ...newJobs.map(j => j.id)];
  await chrome.storage.local.set({ seenJobIds: allSeenIds });
  
  return {
    newJobs,
    count: newJobs.length,
  };
}

/**
 * Get job board statistics
 */
export async function getJobBoardStats(): Promise<{
  totalJobs: number;
  bySource: Record<string, number>;
  avgMatchScore: number;
}> {
  const params: JobSearchParams = { query: 'developer', limit: 50 };
  const jobs = await searchAllJobBoards(params);
  
  const bySource: Record<string, number> = {};
  jobs.forEach(job => {
    bySource[job.source] = (bySource[job.source] || 0) + 1;
  });
  
  const avgMatchScore = jobs.reduce((sum, job) => sum + (job.matchScore || 0), 0) / jobs.length;
  
  return {
    totalJobs: jobs.length,
    bySource,
    avgMatchScore: Math.round(avgMatchScore),
  };
}
