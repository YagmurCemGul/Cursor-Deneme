/**
 * ATS Background Bootstrap
 * Handles ATS-specific messaging, AI calls, and storage
 */

import { nonStreamChat } from './openai';
import { getAtsSettings, getProfile } from '../lib/storage';
import { logger } from '../lib/logger';
import { requestQueue } from './request-queue';

/**
 * Initialize ATS background features
 */
export function initializeATS() {
  logger.info('🦉 ATS background features initialized');
  
  // Listen for ATS-specific messages
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Verify sender is from this extension
    if (sender.id !== chrome.runtime.id) {
      return false;
    }

    if (message.type === 'ATS_PING') {
      sendResponse({ status: 'ok' });
      return false;
    }

    if (message.type === 'ATS_GET_PROFILE') {
      handleGetProfile(sendResponse);
      return true;
    }

    if (message.type === 'ATS_AI_SUGGEST') {
      handleAISuggest(message, sender, sendResponse);
      return true;
    }

    if (message.type === 'ATS_SAVE_JOB') {
      handleSaveJob(message, sendResponse);
      return true;
    }

    if (message.type === 'ATS_SCORE_CALCULATED') {
      // Forward to dashboard if open
      broadcastToDashboard(message);
      return false;
    }

    return false;
  });

  // Context menu for ATS
  chrome.contextMenus.create({
    id: 'ats-autofill',
    title: 'ATS Auto-Fill Form',
    contexts: ['page'],
    documentUrlPatterns: [
      '*://*.myworkdayjobs.com/*',
      '*://*.greenhouse.io/*',
      '*://*.lever.co/*',
      '*://*.ashbyhq.com/*',
      '*://*.smartrecruiters.com/*',
      '*://*.workable.com/*',
      '*://*.successfactors.com/*',
      '*://*.icims.com/*',
    ],
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'ats-autofill' && tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'ATS_AUTOFILL' });
    }
  });
}

/**
 * Handle get profile request
 */
async function handleGetProfile(sendResponse: (response: any) => void) {
  try {
    const profile = await getProfile();
    sendResponse({ profile });
  } catch (error: any) {
    sendResponse({ error: error.message });
  }
}

/**
 * Handle AI suggestion request
 */
async function handleAISuggest(
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void
) {
  try {
    const settings = await getAtsSettings();
    
    if (!settings.apiKey) {
      sendResponse({ error: 'API key not configured' });
      return;
    }

    const tabId = sender.tab?.id || 0;

    // Queue the request
    const result = await requestQueue.enqueue(
      tabId,
      async (signal) => {
        return await nonStreamChat({
          apiKey: settings.apiKey!,
          model: settings.model || 'gpt-4o-mini',
          messages: message.messages,
          temperature: 0.7,
          max_tokens: 2000,
          signal,
        });
      }
    );

    sendResponse({ result });
  } catch (error: any) {
    logger.error('AI suggestion error:', error);
    sendResponse({ error: error.message });
  }
}

/**
 * Handle save job request
 */
async function handleSaveJob(
  message: any,
  sendResponse: (response: any) => void
) {
  try {
    const { title, company, url, jobDescription } = message;
    
    // Save to storage (simplified version)
    const result = await chrome.storage.local.get(['settings']);
    const settings = result.settings || {};
    const ats = settings.ats || {};
    const trackedJobs = ats.trackedJobs || [];
    
    trackedJobs.push({
      id: crypto.randomUUID(),
      title,
      company,
      url,
      status: 'saved',
      savedAt: Date.now(),
      jobDescription,
    });
    
    await chrome.storage.local.set({
      settings: {
        ...settings,
        ats: { ...ats, trackedJobs },
      },
    });
    
    sendResponse({ success: true });
  } catch (error: any) {
    sendResponse({ error: error.message });
  }
}

/**
 * Broadcast message to all dashboard tabs
 */
async function broadcastToDashboard(message: any) {
  const dashboardUrl = chrome.runtime.getURL('newtab.html');
  const tabs = await chrome.tabs.query({ url: dashboardUrl });
  
  for (const tab of tabs) {
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, message).catch(() => {
        // Ignore errors if tab is closed
      });
    }
  }
}

/**
 * Clean up on tab close
 */
chrome.tabs.onRemoved.addListener((tabId) => {
  requestQueue.cancelTab(tabId);
});
