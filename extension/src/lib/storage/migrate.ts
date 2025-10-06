// Safe storage migration with versioning
import type { ResumeProfile, AppSettings } from "./schema";

const CURRENT_VERSION = 2;

export async function migrateStorage(): Promise<void> {
  const stored = await chrome.storage.local.get(["settings", "profiles"]);
  const settings: AppSettings = stored.settings || {};
  const currentVersion = settings.version || 1;

  if (currentVersion >= CURRENT_VERSION) {
    return; // Already up to date
  }

  console.log(`Migrating from version ${currentVersion} to ${CURRENT_VERSION}`);

  // Migrate profiles
  if (stored.profiles) {
    const profiles: ResumeProfile[] = stored.profiles;
    for (const profile of profiles) {
      migrateProfile(profile, currentVersion);
    }
    await chrome.storage.local.set({ profiles });
  }

  // Update settings version
  settings.version = CURRENT_VERSION;
  
  // Initialize new settings if missing
  if (!settings.ai) {
    settings.ai = {
      provider: "openai",
      temperature: 0.7,
      apiKeys: {},
      fallbackChain: ["openai", "gemini", "anthropic"],
      timeout: 30000,
      maxRetries: 3,
    };
  }

  if (!settings.google) {
    settings.google = {
      connected: false,
    };
  }

  if (!settings.ui) {
    settings.ui = {
      highlightOptimized: true,
      locale: "en",
      theme: "auto",
    };
  }

  await chrome.storage.local.set({ settings });
  console.log("Migration complete");
}

function migrateProfile(profile: ResumeProfile, fromVersion: number): void {
  if (fromVersion < 2) {
    // Add country/city fields with null defaults
    if (profile.experience) {
      for (const exp of profile.experience) {
        if (!exp.country) exp.country = undefined;
        if (!exp.city) exp.city = undefined;
        if (!exp.bullets) exp.bullets = [];
      }
    }

    if (profile.education) {
      for (const edu of profile.education) {
        if (!edu.country) edu.country = undefined;
        if (!edu.city) edu.city = undefined;
      }
    }

    if (profile.licenses) {
      for (const lic of profile.licenses) {
        if (!lic.country) lic.country = undefined;
        if (!lic.city) lic.city = undefined;
      }
    }

    if (profile.projects) {
      for (const proj of profile.projects) {
        if (!proj.country) proj.country = undefined;
        if (!proj.city) proj.city = undefined;
      }
    }

    // Initialize new fields
    if (!profile.additionalAnswers) {
      profile.additionalAnswers = [];
    }

    if (!profile.selectedCVTemplate) {
      profile.selectedCVTemplate = "modern";
    }

    if (!profile.selectedCoverLetterTemplate) {
      profile.selectedCoverLetterTemplate = "standard";
    }

    if (!profile.personal.photoUrl) {
      profile.personal.photoUrl = undefined;
      profile.personal.photoMetadata = undefined;
    }
  }
}

// Call this on extension startup
export async function initializeStorage(): Promise<void> {
  await migrateStorage();
}
