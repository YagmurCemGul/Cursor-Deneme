/**
 * Domain allowlist for ATS platforms and job sites
 * Used for least-privilege host permissions
 */

export interface AdapterConfig {
  id: string;
  name: string;
  domains: string[];
  enabled: boolean;
}

export const ATS_DOMAINS: Record<string, AdapterConfig> = {
  workday: {
    id: 'workday',
    name: 'Workday',
    domains: [
      '*://*.myworkdayjobs.com/*',
      '*://*.workday.com/*',
    ],
    enabled: true,
  },
  greenhouse: {
    id: 'greenhouse',
    name: 'Greenhouse',
    domains: [
      '*://*.greenhouse.io/*',
      '*://boards.greenhouse.io/*',
    ],
    enabled: true,
  },
  lever: {
    id: 'lever',
    name: 'Lever',
    domains: [
      '*://*.lever.co/*',
      '*://jobs.lever.co/*',
    ],
    enabled: true,
  },
  ashby: {
    id: 'ashby',
    name: 'Ashby',
    domains: [
      '*://*.ashbyhq.com/*',
      '*://jobs.ashbyhq.com/*',
    ],
    enabled: true,
  },
  smartrecruiters: {
    id: 'smartrecruiters',
    name: 'SmartRecruiters',
    domains: [
      '*://*.smartrecruiters.com/*',
      '*://jobs.smartrecruiters.com/*',
    ],
    enabled: true,
  },
  successfactors: {
    id: 'successfactors',
    name: 'SAP SuccessFactors',
    domains: [
      '*://*.successfactors.com/*',
      '*://*.successfactors.eu/*',
    ],
    enabled: true,
  },
  workable: {
    id: 'workable',
    name: 'Workable',
    domains: [
      '*://*.workable.com/*',
      '*://apply.workable.com/*',
    ],
    enabled: true,
  },
  icims: {
    id: 'icims',
    name: 'iCIMS',
    domains: [
      '*://*.icims.com/*',
      '*://careers.icims.com/*',
    ],
    enabled: true,
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    domains: [
      '*://*.linkedin.com/*',
    ],
    enabled: true,
  },
  indeed: {
    id: 'indeed',
    name: 'Indeed',
    domains: [
      '*://*.indeed.com/*',
      '*://*.indeed.co.uk/*',
      '*://*.indeed.ca/*',
    ],
    enabled: true,
  },
  glassdoor: {
    id: 'glassdoor',
    name: 'Glassdoor',
    domains: [
      '*://*.glassdoor.com/*',
      '*://*.glassdoor.co.uk/*',
    ],
    enabled: true,
  },
};

/**
 * Get all enabled domains
 */
export function getEnabledDomains(): string[] {
  return Object.values(ATS_DOMAINS)
    .filter(adapter => adapter.enabled)
    .flatMap(adapter => adapter.domains);
}

/**
 * Get all domains (for manifest.json)
 */
export function getAllDomains(): string[] {
  return Object.values(ATS_DOMAINS)
    .flatMap(adapter => adapter.domains);
}

/**
 * Check if URL matches any enabled adapter
 */
export function matchesEnabledAdapter(url: string): string | null {
  const urlObj = new URL(url);
  
  for (const [key, adapter] of Object.entries(ATS_DOMAINS)) {
    if (!adapter.enabled) continue;
    
    for (const pattern of adapter.domains) {
      // Convert match pattern to regex
      const regex = pattern
        .replace(/\*/g, '.*')
        .replace(/\./g, '\\.');
      
      if (new RegExp(regex).test(urlObj.href)) {
        return key;
      }
    }
  }
  
  return null;
}

/**
 * Get adapter config by ID
 */
export function getAdapterConfig(id: string): AdapterConfig | undefined {
  return ATS_DOMAINS[id];
}

/**
 * Update adapter enabled status
 */
export async function setAdapterEnabled(id: string, enabled: boolean): Promise<void> {
  const config = ATS_DOMAINS[id];
  if (!config) return;
  
  config.enabled = enabled;
  
  // Persist to chrome.storage
  const { adapterSettings = {} } = await chrome.storage.sync.get('adapterSettings');
  adapterSettings[id] = enabled;
  await chrome.storage.sync.set({ adapterSettings });
}

/**
 * Load adapter settings from storage
 */
export async function loadAdapterSettings(): Promise<void> {
  const { adapterSettings = {} } = await chrome.storage.sync.get('adapterSettings');
  
  for (const [id, enabled] of Object.entries(adapterSettings)) {
    if (ATS_DOMAINS[id]) {
      ATS_DOMAINS[id].enabled = enabled as boolean;
    }
  }
}
