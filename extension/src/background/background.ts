/**
 * Background Service Worker
 * Handles context menus, page actions, and browser events
 */

// Create context menus on installation
chrome.runtime.onInstalled.addListener(() => {
  // Context menu for selected text
  chrome.contextMenus.create({
    id: 'add-to-applications',
    title: 'Add to Job Applications',
    contexts: ['selection', 'page'],
  });

  chrome.contextMenus.create({
    id: 'extract-job-data',
    title: 'Extract Job Details',
    contexts: ['page'],
  });

  chrome.contextMenus.create({
    id: 'save-to-cv',
    title: 'Save to CV Builder',
    contexts: ['selection'],
  });

  console.log('CV Builder extension installed');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;

  switch (info.menuItemId) {
    case 'add-to-applications':
      handleAddToApplications(info, tab);
      break;
    case 'extract-job-data':
      handleExtractJobData(tab);
      break;
    case 'save-to-cv':
      handleSaveToCV(info, tab);
      break;
  }
});

/**
 * Handle "Add to Job Applications" context menu
 */
async function handleAddToApplications(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) {
  try {
    // Execute content script to extract job data
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: () => {
        // This function runs in the page context
        const url = window.location.href;
        const selection = window.getSelection()?.toString() || '';
        
        // Try to extract job data
        let title = '';
        let company = '';
        
        // LinkedIn
        if (url.includes('linkedin.com/jobs')) {
          const titleEl = document.querySelector('h1.job-details-jobs-unified-top-card__job-title');
          const companyEl = document.querySelector('a.job-details-jobs-unified-top-card__company-name');
          if (titleEl) title = titleEl.textContent?.trim() || '';
          if (companyEl) company = companyEl.textContent?.trim() || '';
        }
        // Indeed
        else if (url.includes('indeed.com')) {
          const titleEl = document.querySelector('h1.jobsearch-JobInfoHeader-title');
          const companyEl = document.querySelector('[data-company-name="true"]');
          if (titleEl) title = titleEl.textContent?.trim() || '';
          if (companyEl) company = companyEl.textContent?.trim() || '';
        }
        // Generic
        else {
          const h1 = document.querySelector('h1');
          if (h1) title = h1.textContent?.trim() || '';
        }
        
        return {
          title: title || document.title,
          company: company || new URL(url).hostname.replace('www.', ''),
          url,
          description: selection || document.body.textContent?.substring(0, 500) || '',
        };
      },
    });

    const jobData = results[0]?.result;

    if (jobData) {
      // Store the job data
      await chrome.storage.local.set({
        pendingJobApplication: {
          ...jobData,
          timestamp: Date.now(),
        },
      });

      // Open the extension in a new tab
      const extensionUrl = chrome.runtime.getURL('newtab.html');
      await chrome.tabs.create({ url: extensionUrl });
    }
  } catch (error) {
    console.error('Error adding to applications:', error);
  }
}

/**
 * Handle "Extract Job Details" context menu
 */
async function handleExtractJobData(tab: chrome.tabs.Tab) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: () => {
        const url = window.location.href;
        const data: any = {
          url,
          title: '',
          company: '',
          location: '',
          description: '',
        };

        // LinkedIn extraction
        if (url.includes('linkedin.com/jobs')) {
          const titleEl = document.querySelector('h1.job-details-jobs-unified-top-card__job-title');
          const companyEl = document.querySelector('a.job-details-jobs-unified-top-card__company-name');
          const locationEl = document.querySelector('.job-details-jobs-unified-top-card__bullet');
          const descEl = document.querySelector('.jobs-description__content');
          
          if (titleEl) data.title = titleEl.textContent?.trim();
          if (companyEl) data.company = companyEl.textContent?.trim();
          if (locationEl) data.location = locationEl.textContent?.trim();
          if (descEl) data.description = descEl.textContent?.trim().substring(0, 2000);
        }
        // Indeed extraction
        else if (url.includes('indeed.com')) {
          const titleEl = document.querySelector('h1.jobsearch-JobInfoHeader-title');
          const companyEl = document.querySelector('[data-company-name="true"]');
          const locationEl = document.querySelector('[data-testid="job-location"]');
          const descEl = document.querySelector('#jobDescriptionText');
          
          if (titleEl) data.title = titleEl.textContent?.trim();
          if (companyEl) data.company = companyEl.textContent?.trim();
          if (locationEl) data.location = locationEl.textContent?.trim();
          if (descEl) data.description = descEl.textContent?.trim().substring(0, 2000);
        }
        // Generic extraction
        else {
          const h1 = document.querySelector('h1');
          if (h1) data.title = h1.textContent?.trim();
          data.company = new URL(url).hostname.replace('www.', '');
          data.description = document.body.textContent?.trim().substring(0, 2000);
        }

        return data;
      },
    });

    const jobData = results[0]?.result;

    if (jobData && jobData.title) {
      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon128.png'),
        title: 'Job Details Extracted',
        message: `${jobData.title} at ${jobData.company}`,
        priority: 2,
      });

      // Store the extracted data
      await chrome.storage.local.set({
        extractedJobData: {
          ...jobData,
          timestamp: Date.now(),
        },
      });
    }
  } catch (error) {
    console.error('Error extracting job data:', error);
  }
}

/**
 * Handle "Save to CV" context menu
 */
async function handleSaveToCV(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) {
  const selectedText = info.selectionText;

  if (selectedText) {
    await chrome.storage.local.set({
      clipboardText: selectedText,
      clipboardTimestamp: Date.now(),
    });

    chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon128.png'),
      title: 'Saved to Clipboard',
      message: 'Text saved. Open CV Builder to use it.',
      priority: 1,
    });
  }
}

// Listen for tab updates to show page action on job pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const isJobPage = 
      tab.url.includes('linkedin.com/jobs') ||
      tab.url.includes('indeed.com/viewjob') ||
      tab.url.includes('glassdoor.com/job') ||
      tab.url.includes('remote.co/job');

    if (isJobPage) {
      // Show page action badge
      chrome.action.setBadgeText({ text: '!', tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#667eea', tabId });
    } else {
      chrome.action.setBadgeText({ text: '', tabId });
    }
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'JOB_PAGE_DETECTED') {
    // Job page detected, update badge
    if (sender.tab?.id) {
      chrome.action.setBadgeText({ text: '!', tabId: sender.tab.id });
      chrome.action.setBadgeBackgroundColor({ color: '#667eea', tabId: sender.tab.id });
    }
    sendResponse({ success: true });
  } else if (request.type === 'EXTRACT_JOB_DATA') {
    // Return extracted job data
    chrome.storage.local.get(['extractedJobData'], (result) => {
      sendResponse(result.extractedJobData || null);
    });
    return true; // Keep channel open for async response
  }
});

export {};
