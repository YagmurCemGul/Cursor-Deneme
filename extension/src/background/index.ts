import { initializeATS } from '../ats/background/bootstrap';

chrome.runtime.onInstalled.addListener(async () => {
  console.log("AI CV Optimizer installed");
  
  // Set up default settings if not exists
  const result = await chrome.storage.local.get(['settings']);
  if (!result.settings) {
    await chrome.storage.local.set({
      settings: {
        version: 2,
        ats: {
          enabled: false,
          model: 'gpt-4o-mini',
          language: 'en',
          encryptionEnabled: false,
          debugLogs: false,
          autoOpenPanel: false,
          adapterSettings: {},
          customDomains: {},
        },
      },
    });
  } else if (!result.settings.ats) {
    // Migrate old settings
    await chrome.storage.local.set({
      settings: {
        ...result.settings,
        version: 2,
        ats: {
          enabled: false,
          model: 'gpt-4o-mini',
          language: 'en',
          encryptionEnabled: false,
          debugLogs: false,
          autoOpenPanel: false,
          adapterSettings: {},
          customDomains: {},
        },
      },
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "PING") {
    sendResponse({ ok: true });
  }
});

// Initialize ATS features
initializeATS();
