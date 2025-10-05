/**
 * Content Script
 * Runs on all pages to detect job postings and enable quick actions
 */

import { isJobPage, extractJobData } from '../lib/jobExtractor';

// Detect if current page is a job posting
if (isJobPage()) {
  // Notify background script
  chrome.runtime.sendMessage({ type: 'JOB_PAGE_DETECTED' });

  // Add floating action button for quick capture
  createFloatingButton();
}

/**
 * Create a floating action button on job pages
 */
function createFloatingButton() {
  // Check if button already exists
  if (document.getElementById('cv-builder-fab')) return;

  const button = document.createElement('div');
  button.id = 'cv-builder-fab';
  button.innerHTML = `
    <div style="
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 999999;
      transition: all 0.3s ease;
      font-size: 24px;
    " title="Add to CV Builder">
      📋
    </div>
  `;

  // Add hover effect
  const fabElement = button.firstElementChild as HTMLElement;
  fabElement.addEventListener('mouseenter', () => {
    fabElement.style.transform = 'scale(1.1)';
    fabElement.style.boxShadow = '0 6px 30px rgba(102, 126, 234, 0.6)';
  });
  fabElement.addEventListener('mouseleave', () => {
    fabElement.style.transform = 'scale(1)';
    fabElement.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.4)';
  });

  // Handle click
  fabElement.addEventListener('click', async () => {
    // Extract job data
    const jobData = extractJobData();

    if (jobData) {
      // Store the job data
      await chrome.storage.local.set({
        pendingJobApplication: {
          ...jobData,
          timestamp: Date.now(),
        },
      });

      // Show confirmation
      showConfirmation('Job details captured! Opening CV Builder...');

      // Open CV Builder in new tab
      setTimeout(() => {
        const extensionUrl = chrome.runtime.getURL('newtab.html');
        window.open(extensionUrl, '_blank');
      }, 1000);
    } else {
      showConfirmation('Could not extract job details. Please try again.', 'error');
    }
  });

  document.body.appendChild(button);
}

/**
 * Show a temporary confirmation message
 */
function showConfirmation(message: string, type: 'success' | 'error' = 'success') {
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 24px;
      right: 24px;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      z-index: 9999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 500;
      animation: slideIn 0.3s ease;
    ">
      ${type === 'success' ? '✅' : '❌'} ${message}
    </div>
  `;

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.remove();
    style.remove();
  }, 3000);
}

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'EXTRACT_JOB_FROM_PAGE') {
    const jobData = extractJobData();
    sendResponse({ jobData });
  }
});

export {};
