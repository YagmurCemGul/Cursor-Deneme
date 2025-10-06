/**
 * Background Service Worker
 * Handles API calls, encryption, context menus, commands, and messaging
 */

import { streamChat, nonStreamChat } from './openai';
import { encrypt, decrypt } from './crypto';

// Context menu IDs
const MENU_IDS = {
  SUGGEST_ANSWER: 'suggest-answer',
  GENERATE_CL: 'generate-cover-letter',
  TRACK_JOB: 'track-job',
};

/**
 * Initialize extension on install
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Set default settings
    await chrome.storage.local.set({
      settings: {
        model: 'gpt-4o-mini',
        language: 'en',
        encryptionEnabled: false,
      },
      profile: null,
      trackedJobs: [],
    });

    // Open onboarding
    chrome.tabs.create({
      url: chrome.runtime.getURL('src/tab/index.html#/onboarding'),
    });
  }

  // Create context menus
  chrome.contextMenus.create({
    id: MENU_IDS.SUGGEST_ANSWER,
    title: chrome.i18n.getMessage('contextMenuSuggest') || 'AI Suggest Answer',
    contexts: ['selection'],
  });

  chrome.contextMenus.create({
    id: MENU_IDS.GENERATE_CL,
    title: chrome.i18n.getMessage('contextMenuCoverLetter') || 'Generate Cover Letter',
    contexts: ['page'],
  });

  chrome.contextMenus.create({
    id: MENU_IDS.TRACK_JOB,
    title: chrome.i18n.getMessage('contextMenuTrack') || 'Track This Job',
    contexts: ['page'],
  });
});

/**
 * Handle extension icon click - open dashboard in new tab
 */
chrome.action.onClicked.addListener(async () => {
  const url = chrome.runtime.getURL('src/tab/index.html');
  
  // Check if dashboard is already open
  const tabs = await chrome.tabs.query({ url });
  
  if (tabs.length > 0) {
    // Focus existing tab
    await chrome.tabs.update(tabs[0].id!, { active: true });
    await chrome.windows.update(tabs[0].windowId!, { focused: true });
  } else {
    // Create new tab
    await chrome.tabs.create({ url });
  }
});

/**
 * Handle keyboard commands
 */
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  switch (command) {
    case 'autofill':
      chrome.tabs.sendMessage(tab.id, { type: 'START_AUTOFILL' });
      break;
    case 'score':
      chrome.tabs.sendMessage(tab.id, { type: 'CALCULATE_SCORE' });
      break;
    case 'toggle_panel':
      // Toggle side panel
      const window = await chrome.windows.getCurrent();
      chrome.sidePanel.setOptions({
        tabId: tab.id,
        enabled: true,
        path: 'src/tab/index.html#/panel',
      });
      chrome.sidePanel.open({ windowId: window.id! });
      break;
  }
});

/**
 * Handle context menu clicks
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;

  switch (info.menuItemId) {
    case MENU_IDS.SUGGEST_ANSWER:
      if (info.selectionText) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'SUGGEST_ANSWER',
          question: info.selectionText,
        });
      }
      break;
    case MENU_IDS.GENERATE_CL:
      chrome.tabs.sendMessage(tab.id, { type: 'GENERATE_COVER_LETTER' });
      break;
    case MENU_IDS.TRACK_JOB:
      chrome.tabs.sendMessage(tab.id, { type: 'TRACK_CURRENT_JOB' });
      break;
  }
});

/**
 * Verify message sender is from extension, not a web page
 */
function isValidSender(sender: chrome.runtime.MessageSender): boolean {
  // Sender must be from this extension
  if (sender.id !== chrome.runtime.id) {
    logger.warn('Rejected message from unknown sender:', sender.id);
    return false;
  }

  // If from a web page (content script), verify URL is allowed
  if (sender.url) {
    const url = new URL(sender.url);
    // Extension pages are always allowed
    if (url.protocol === 'chrome-extension:') {
      return true;
    }
    
    // For content scripts, they're already validated by manifest matches
    return true;
  }

  return true;
}

/**
 * Message handler for API calls and crypto operations
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Verify sender
  if (!isValidSender(sender)) {
    sendResponse({ error: 'Unauthorized sender' });
    return false;
  }

  if (message.type === 'CHAT_COMPLETION') {
    handleChatCompletion(message, sendResponse);
    return true; // Keep channel open for async
  }

  if (message.type === 'ENCRYPT_DATA') {
    handleEncryption(message, sendResponse);
    return true;
  }

  if (message.type === 'DECRYPT_DATA') {
    handleDecryption(message, sendResponse);
    return true;
  }

  if (message.type === 'GET_SETTINGS') {
    chrome.storage.local.get(['settings'], (result) => {
      sendResponse({ settings: result.settings || {} });
    });
    return true;
  }
});

/**
 * Handle streaming chat completion via port
 */
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'chat-stream') {
    port.onMessage.addListener(async (msg) => {
      if (msg.type === 'START_STREAM') {
        try {
          const { apiKey, model, messages, temperature, max_tokens } = msg;
          const controller = new AbortController();

          // Handle disconnect
          port.onDisconnect.addListener(() => controller.abort());

          // Stream response
          for await (const chunk of streamChat({
            apiKey,
            model,
            messages,
            temperature,
            max_tokens,
            signal: controller.signal,
          })) {
            port.postMessage({ type: 'CHUNK', content: chunk });
          }

          port.postMessage({ type: 'DONE' });
        } catch (error: any) {
          port.postMessage({ type: 'ERROR', error: error.message });
        }
      }
    });
  }
});

/**
 * Handle non-streaming chat completion
 */
async function handleChatCompletion(message: any, sendResponse: (response: any) => void) {
  try {
    const settings = await chrome.storage.local.get(['settings']);
    const { apiKey, model = settings.settings?.model || 'gpt-4o-mini' } = message;

    if (!apiKey) {
      sendResponse({ error: 'API key not configured' });
      return;
    }

    const result = await nonStreamChat({
      apiKey,
      model,
      messages: message.messages,
      temperature: message.temperature,
      max_tokens: message.max_tokens,
    });

    sendResponse({ result });
  } catch (error: any) {
    sendResponse({ error: error.message });
  }
}

/**
 * Handle encryption request
 */
async function handleEncryption(message: any, sendResponse: (response: any) => void) {
  try {
    const { plaintext, password } = message;
    const encrypted = await encrypt(plaintext, password);
    sendResponse({ encrypted });
  } catch (error: any) {
    sendResponse({ error: error.message });
  }
}

/**
 * Handle decryption request
 */
async function handleDecryption(message: any, sendResponse: (response: any) => void) {
  try {
    const { encrypted, password } = message;
    const plaintext = await decrypt(encrypted, password);
    sendResponse({ plaintext });
  } catch (error: any) {
    sendResponse({ error: error.message });
  }
}

import { logger } from '../lib/logger';

logger.info('🦉 Job ATS Extension background worker initialized');
