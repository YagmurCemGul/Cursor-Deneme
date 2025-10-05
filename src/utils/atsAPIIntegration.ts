/**
 * ATS (Applicant Tracking System) API Integration
 * Connect with popular ATS platforms to post jobs and manage applications
 */

export type ATSProvider = 'greenhouse' | 'lever' | 'workday' | 'bamboohr' | 'jobvite' | 'smartrecruiters';

export interface ATSConfig {
  provider: ATSProvider;
  apiKey: string;
  apiSecret?: string;
  baseUrl?: string;
  organizationId?: string;
}

export interface ATSJob {
  id: string;
  title: string;
  description: string;
  location: string;
  department: string;
  status: 'draft' | 'open' | 'closed' | 'archived';
  createdAt: string;
  updatedAt: string;
  applications: number;
  url?: string;
}

export interface ATSPostJobRequest {
  title: string;
  description: string;
  location: string;
  department: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  remote: boolean;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  requirements: string[];
  benefits?: string[];
  customFields?: Record<string, any>;
}

/**
 * Post job to ATS
 */
export async function postJobToATS(
  config: ATSConfig,
  jobData: ATSPostJobRequest
): Promise<ATSJob> {
  const endpoint = getATSEndpoint(config.provider, 'post-job');
  
  try {
    const response = await fetch(`${config.baseUrl || endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        ...getProviderHeaders(config),
      },
      body: JSON.stringify(formatJobForATS(config.provider, jobData)),
    });

    if (!response.ok) {
      throw new Error(`ATS API error: ${response.statusText}`);
    }

    const data = await response.json();
    return parseATSResponse(config.provider, data);
  } catch (error) {
    throw new Error(`Failed to post job: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get jobs from ATS
 */
export async function getATSJobs(
  config: ATSConfig,
  filters?: {
    status?: ATSJob['status'];
    department?: string;
    limit?: number;
  }
): Promise<ATSJob[]> {
  const endpoint = getATSEndpoint(config.provider, 'get-jobs');
  const params = new URLSearchParams();
  
  if (filters?.status) params.append('status', filters.status);
  if (filters?.department) params.append('department', filters.department);
  if (filters?.limit) params.append('limit', filters.limit.toString());

  try {
    const response = await fetch(`${config.baseUrl || endpoint}?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        ...getProviderHeaders(config),
      },
    });

    if (!response.ok) {
      throw new Error(`ATS API error: ${response.statusText}`);
    }

    const data = await response.json();
    return parseATSJobsList(config.provider, data);
  } catch (error) {
    throw new Error(`Failed to fetch jobs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update job in ATS
 */
export async function updateATSJob(
  config: ATSConfig,
  jobId: string,
  updates: Partial<ATSPostJobRequest>
): Promise<ATSJob> {
  const endpoint = getATSEndpoint(config.provider, 'update-job');
  
  try {
    const response = await fetch(`${config.baseUrl || endpoint}/${jobId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        ...getProviderHeaders(config),
      },
      body: JSON.stringify(formatJobForATS(config.provider, updates)),
    });

    if (!response.ok) {
      throw new Error(`ATS API error: ${response.statusText}`);
    }

    const data = await response.json();
    return parseATSResponse(config.provider, data);
  } catch (error) {
    throw new Error(`Failed to update job: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Close/archive job in ATS
 */
export async function closeATSJob(
  config: ATSConfig,
  jobId: string
): Promise<boolean> {
  const endpoint = getATSEndpoint(config.provider, 'close-job');
  
  try {
    const response = await fetch(`${config.baseUrl || endpoint}/${jobId}/close`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        ...getProviderHeaders(config),
      },
    });

    return response.ok;
  } catch (error) {
    throw new Error(`Failed to close job: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get ATS endpoint for provider
 */
function getATSEndpoint(provider: ATSProvider, action: string): string {
  const endpoints: Record<ATSProvider, Record<string, string>> = {
    greenhouse: {
      'post-job': 'https://harvest.greenhouse.io/v1/jobs',
      'get-jobs': 'https://harvest.greenhouse.io/v1/jobs',
      'update-job': 'https://harvest.greenhouse.io/v1/jobs',
      'close-job': 'https://harvest.greenhouse.io/v1/jobs',
    },
    lever: {
      'post-job': 'https://api.lever.co/v1/postings',
      'get-jobs': 'https://api.lever.co/v1/postings',
      'update-job': 'https://api.lever.co/v1/postings',
      'close-job': 'https://api.lever.co/v1/postings',
    },
    workday: {
      'post-job': 'https://wd2-impl.workday.com/api/v1/jobs',
      'get-jobs': 'https://wd2-impl.workday.com/api/v1/jobs',
      'update-job': 'https://wd2-impl.workday.com/api/v1/jobs',
      'close-job': 'https://wd2-impl.workday.com/api/v1/jobs',
    },
    bamboohr: {
      'post-job': 'https://api.bamboohr.com/api/gateway.php/{company}/v1/applicant_tracking/jobs',
      'get-jobs': 'https://api.bamboohr.com/api/gateway.php/{company}/v1/applicant_tracking/jobs',
      'update-job': 'https://api.bamboohr.com/api/gateway.php/{company}/v1/applicant_tracking/jobs',
      'close-job': 'https://api.bamboohr.com/api/gateway.php/{company}/v1/applicant_tracking/jobs',
    },
    jobvite: {
      'post-job': 'https://api.jobvite.com/api/v2/jobs',
      'get-jobs': 'https://api.jobvite.com/api/v2/jobs',
      'update-job': 'https://api.jobvite.com/api/v2/jobs',
      'close-job': 'https://api.jobvite.com/api/v2/jobs',
    },
    smartrecruiters: {
      'post-job': 'https://api.smartrecruiters.com/postings',
      'get-jobs': 'https://api.smartrecruiters.com/postings',
      'update-job': 'https://api.smartrecruiters.com/postings',
      'close-job': 'https://api.smartrecruiters.com/postings',
    },
  };

  return endpoints[provider][action];
}

/**
 * Get provider-specific headers
 */
function getProviderHeaders(config: ATSConfig): Record<string, string> {
  const headers: Record<string, string> = {};

  switch (config.provider) {
    case 'greenhouse':
      headers['On-Behalf-Of'] = config.organizationId || '';
      break;
    case 'workday':
      if (config.apiSecret) {
        headers['Authorization'] = `Basic ${btoa(`${config.apiKey}:${config.apiSecret}`)}`;
      }
      break;
    case 'bamboohr':
      headers['Accept'] = 'application/json';
      break;
  }

  return headers;
}

/**
 * Format job data for specific ATS provider
 */
function formatJobForATS(provider: ATSProvider, jobData: Partial<ATSPostJobRequest>): any {
  // Each ATS has its own format - normalize here
  const baseFormat = {
    title: jobData.title,
    description: jobData.description,
    location: jobData.location,
    department: jobData.department,
  };

  switch (provider) {
    case 'greenhouse':
      return {
        ...baseFormat,
        employment_type: jobData.employmentType,
        remote: jobData.remote,
      };
    case 'lever':
      return {
        ...baseFormat,
        workplaceType: jobData.remote ? 'remote' : 'onsite',
        commitment: jobData.employmentType,
      };
    default:
      return baseFormat;
  }
}

/**
 * Parse ATS response to standard format
 */
function parseATSResponse(provider: ATSProvider, data: any): ATSJob {
  // Normalize different ATS response formats
  return {
    id: data.id || data.job_id || data.posting_id,
    title: data.title || data.name,
    description: data.description || data.content,
    location: data.location || data.office,
    department: data.department || data.team,
    status: normalizeStatus(data.status || data.state),
    createdAt: data.created_at || data.createdAt || new Date().toISOString(),
    updatedAt: data.updated_at || data.updatedAt || new Date().toISOString(),
    applications: data.applications_count || data.candidateCount || 0,
    url: data.url || data.absolute_url || data.hostedUrl,
  };
}

/**
 * Parse ATS jobs list
 */
function parseATSJobsList(provider: ATSProvider, data: any): ATSJob[] {
  const jobs = data.jobs || data.postings || data.data || data;
  
  if (!Array.isArray(jobs)) {
    return [];
  }

  return jobs.map(job => parseATSResponse(provider, job));
}

/**
 * Normalize job status across different ATS
 */
function normalizeStatus(status: string): ATSJob['status'] {
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('open') || statusLower.includes('active')) {
    return 'open';
  } else if (statusLower.includes('draft') || statusLower.includes('pending')) {
    return 'draft';
  } else if (statusLower.includes('closed') || statusLower.includes('filled')) {
    return 'closed';
  } else if (statusLower.includes('archive')) {
    return 'archived';
  }

  return 'draft';
}

/**
 * Validate ATS configuration
 */
export function validateATSConfig(config: ATSConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.apiKey) {
    errors.push('API key is required');
  }

  if (config.provider === 'workday' && !config.apiSecret) {
    errors.push('API secret is required for Workday');
  }

  if (config.provider === 'bamboohr' && !config.organizationId) {
    errors.push('Organization ID is required for BambooHR');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Test ATS connection
 */
export async function testATSConnection(config: ATSConfig): Promise<boolean> {
  try {
    await getATSJobs(config, { limit: 1 });
    return true;
  } catch (error) {
    console.error('ATS connection test failed:', error);
    return false;
  }
}
