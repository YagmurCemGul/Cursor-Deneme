import { initializeATS } from '../ats/background/bootstrap';
import { initializeStorage } from '../lib/storage/migrate';

chrome.runtime.onInstalled.addListener(async () => {
  console.log("AI CV Optimizer installed");
  
  // Run migration first
  await initializeStorage();
  
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
        ai: {
          provider: 'openai',
          temperature: 0.7,
          apiKeys: {},
          fallbackChain: ['openai', 'gemini', 'anthropic'],
          timeout: 30000,
          maxRetries: 3,
        },
        google: {
          connected: false,
        },
        ui: {
          highlightOptimized: true,
          locale: 'en',
          theme: 'auto',
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
        ai: result.settings.ai || {
          provider: 'openai',
          temperature: 0.7,
          apiKeys: {},
          fallbackChain: ['openai', 'gemini', 'anthropic'],
          timeout: 30000,
          maxRetries: 3,
        },
        google: result.settings.google || {
          connected: false,
        },
        ui: result.settings.ui || {
          highlightOptimized: true,
          locale: 'en',
          theme: 'auto',
        },
      },
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "PING") {
    sendResponse({ ok: true });
  }
  return true;
});

// Initialize ATS features
initializeATS();
