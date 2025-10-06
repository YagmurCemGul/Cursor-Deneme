/**
 * Domain allowlist for programmatic content script injection
 * Users can extend this with custom domains in settings
 */

export const ADAPTER_ALLOWLIST = {
  workday: ['*.myworkdayjobs.com', '*.workday.com'],
  greenhouse: ['*.greenhouse.io', 'boards.greenhouse.io'],
  lever: ['*.lever.co', 'jobs.lever.co'],
  ashby: ['*.ashbyhq.com', 'jobs.ashbyhq.com'],
  smartrecruiters: ['*.smartrecruiters.com', 'jobs.smartrecruiters.com'],
  successfactors: ['*.successfactors.com', '*.successfactors.eu'],
  workable: ['*.workable.com', 'apply.workable.com'],
  icims: ['*.icims.com', 'careers.icims.com'],
  linkedin: ['*.linkedin.com'],
  indeed: ['*.indeed.com', '*.indeed.co.uk', '*.indeed.ca'],
  glassdoor: ['*.glassdoor.com', '*.glassdoor.co.uk'],
} as const;

export type AdapterId = keyof typeof ADAPTER_ALLOWLIST;

/**
 * Load custom domains from storage and merge with defaults
 */
export async function getEffectiveAllowlist(): Promise<Record<AdapterId, string[]>> {
  const { customDomains = {} } = await chrome.storage.sync.get('customDomains');
  
  const merged: Record<string, string[]> = {};
  
  for (const [adapter, defaults] of Object.entries(ADAPTER_ALLOWLIST)) {
    const custom = customDomains[adapter] || [];
    merged[adapter] = [...defaults, ...custom];
  }
  
  return merged as Record<AdapterId, string[]>;
}

/**
 * Get all domains as match patterns
 */
export async function getAllMatchPatterns(): Promise<string[]> {
  const allowlist = await getEffectiveAllowlist();
  const patterns: string[] = [];
  
  for (const domains of Object.values(allowlist)) {
    for (const domain of domains) {
      patterns.push(`*://${domain}/*`);
    }
  }
  
  return patterns;
}

/**
 * Check if URL matches allowlist
 */
export async function isUrlAllowed(url: string): Promise<boolean> {
  try {
    const urlObj = new URL(url);
    const allowlist = await getEffectiveAllowlist();
    
    for (const domains of Object.values(allowlist)) {
      for (const pattern of domains) {
        if (matchesPattern(urlObj.hostname, pattern)) {
          return true;
        }
      }
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Match hostname against pattern (supports wildcards)
 */
function matchesPattern(hostname: string, pattern: string): boolean {
  // Convert pattern to regex
  const regexPattern = pattern
    .replace(/\./g, '\\.')
    .replace(/\*/g, '.*');
  
  const regex = new RegExp(`^${regexPattern}$`, 'i');
  return regex.test(hostname);
}

/**
 * Add custom domain for adapter
 */
export async function addCustomDomain(adapter: AdapterId, domain: string): Promise<void> {
  const { customDomains = {} } = await chrome.storage.sync.get('customDomains');
  
  if (!customDomains[adapter]) {
    customDomains[adapter] = [];
  }
  
  if (!customDomains[adapter].includes(domain)) {
    customDomains[adapter].push(domain);
    await chrome.storage.sync.set({ customDomains });
  }
}

/**
 * Remove custom domain for adapter
 */
export async function removeCustomDomain(adapter: AdapterId, domain: string): Promise<void> {
  const { customDomains = {} } = await chrome.storage.sync.get('customDomains');
  
  if (customDomains[adapter]) {
    customDomains[adapter] = customDomains[adapter].filter((d: string) => d !== domain);
    await chrome.storage.sync.set({ customDomains });
  }
}

/**
 * Get custom domains for adapter
 */
export async function getCustomDomains(adapter: AdapterId): Promise<string[]> {
  const { customDomains = {} } = await chrome.storage.sync.get('customDomains');
  return customDomains[adapter] || [];
}
