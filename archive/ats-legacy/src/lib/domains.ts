/**
 * Domain allowlist for ATS platforms and job sites
 * Used for least-privilege host permissions
 * Note: Default domains are defined in src/content/allowlist.ts
 */

import { ADAPTER_ALLOWLIST } from '../content/allowlist';

export interface AdapterConfig {
  id: string;
  name: string;
  domains: string[];
  customDomains: string[];
  enabled: boolean;
}

export const ATS_DOMAINS: Record<string, AdapterConfig> = {
  workday: {
    id: 'workday',
    name: 'Workday',
    domains: [...ADAPTER_ALLOWLIST.workday],
    customDomains: [],
    enabled: true,
  },
  greenhouse: {
    id: 'greenhouse',
    name: 'Greenhouse',
    domains: [...ADAPTER_ALLOWLIST.greenhouse],
    customDomains: [],
    enabled: true,
  },
  lever: {
    id: 'lever',
    name: 'Lever',
    domains: [...ADAPTER_ALLOWLIST.lever],
    customDomains: [],
    enabled: true,
  },
  ashby: {
    id: 'ashby',
    name: 'Ashby',
    domains: [...ADAPTER_ALLOWLIST.ashby],
    customDomains: [],
    enabled: true,
  },
  smartrecruiters: {
    id: 'smartrecruiters',
    name: 'SmartRecruiters',
    domains: [...ADAPTER_ALLOWLIST.smartrecruiters],
    customDomains: [],
    enabled: true,
  },
  successfactors: {
    id: 'successfactors',
    name: 'SAP SuccessFactors',
    domains: [...ADAPTER_ALLOWLIST.successfactors],
    customDomains: [],
    enabled: true,
  },
  workable: {
    id: 'workable',
    name: 'Workable',
    domains: [...ADAPTER_ALLOWLIST.workable],
    customDomains: [],
    enabled: true,
  },
  icims: {
    id: 'icims',
    name: 'iCIMS',
    domains: [...ADAPTER_ALLOWLIST.icims],
    customDomains: [],
    enabled: true,
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    domains: [...ADAPTER_ALLOWLIST.linkedin],
    customDomains: [],
    enabled: true,
  },
  indeed: {
    id: 'indeed',
    name: 'Indeed',
    domains: [...ADAPTER_ALLOWLIST.indeed],
    customDomains: [],
    enabled: true,
  },
  glassdoor: {
    id: 'glassdoor',
    name: 'Glassdoor',
    domains: [...ADAPTER_ALLOWLIST.glassdoor],
    customDomains: [],
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
  const { adapterSettings = {}, customDomains = {} } = await chrome.storage.sync.get([
    'adapterSettings',
    'customDomains',
  ]);
  
  for (const [id, enabled] of Object.entries(adapterSettings)) {
    if (ATS_DOMAINS[id]) {
      ATS_DOMAINS[id].enabled = enabled as boolean;
    }
  }
  
  // Load custom domains
  for (const [id, domains] of Object.entries(customDomains)) {
    if (ATS_DOMAINS[id]) {
      ATS_DOMAINS[id].customDomains = domains as string[];
    }
  }
}
