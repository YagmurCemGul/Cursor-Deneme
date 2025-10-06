/**
 * ATS Content Script Main Entry
 * Orchestrates form detection, autofill, JD extraction, and messaging
 * Only runs if ATS is enabled in settings
 */

import { detectFields } from './core/detector';
import { batchFillFields } from './core/filler';
import { extractJobDescription, extractKeywords } from './core/extract-jd';
import { getProfile, addTrackedJob, getAtsSettings } from '../lib/storage';
import { logger } from '../lib/logger';

// Check kill switch before doing anything
chrome.storage.local.get(['settings'], (result) => {
  const atsEnabled = result.settings?.ats?.enabled;
  
  if (!atsEnabled) {
    logger.debug('ATS features disabled in settings');
    return;
  }
  
  logger.info('🦉 ATS Content Script loaded');
  initializeContentScript();
});

function initializeContentScript() {
  /**
   * Detect which ATS platform is being used
   */
  function detectATS(): string | null {
    const url = window.location.hostname;
    
    if (url.includes('workday')) return 'workday';
    if (url.includes('greenhouse')) return 'greenhouse';
    if (url.includes('lever')) return 'lever';
    if (url.includes('ashby')) return 'ashby';
    if (url.includes('smartrecruiters')) return 'smartrecruiters';
    if (url.includes('workable')) return 'workable';
    if (url.includes('successfactors')) return 'successfactors';
    if (url.includes('icims')) return 'icims';
    
    return null;
  }

  /**
   * Auto-fill form with profile data
   */
  async function handleAutofill() {
    try {
      showNotification('Starting autofill...', 'info');

      const profile = await getProfile();
      if (!profile) {
        showNotification('Please set up your profile first', 'error');
        return;
      }

      const ats = detectATS();
      logger.debug('Detected ATS:', ats || 'generic');

      const fields = detectFields();
      logger.debug('Detected fields:', fields.length);

      // Map fields to values
      const fillData = fields.map(field => {
        let value = '';

        switch (field.type) {
          case 'first_name':
            value = profile.personalInfo.firstName;
            break;
          case 'last_name':
            value = profile.personalInfo.lastName;
            break;
          case 'email':
            value = profile.personalInfo.email;
            break;
          case 'phone':
            value = profile.personalInfo.phone;
            break;
          case 'city':
            value = profile.personalInfo.city;
            break;
          case 'country':
            value = profile.personalInfo.country;
            break;
          case 'linkedin':
            value = profile.personalInfo.linkedin || '';
            break;
          case 'github':
            value = profile.personalInfo.github || '';
            break;
          case 'portfolio':
            value = profile.personalInfo.portfolio || '';
            break;
          case 'salary_expectation':
            value = profile.preferences.salaryExpectation || '';
            break;
          case 'notice_period':
            value = profile.preferences.noticePeriod || '';
            break;
          case 'work_auth':
            value = profile.workAuth.authorized ? 'Yes' : 'No';
            break;
          case 'visa_sponsorship':
            value = profile.workAuth.needsVisa ? 'Yes' : 'No';
            break;
          case 'relocation':
            value = profile.workAuth.canRelocate ? 'Yes' : 'No';
            break;
        }

        return { element: field.element, value };
      }).filter(item => item.value);

      const filled = await batchFillFields(fillData, 150);
      showNotification(`Filled ${filled} fields successfully`, 'success');
    } catch (error) {
      console.error('Autofill error:', error);
      showNotification('Autofill failed', 'error');
    }
  }

  /**
   * Calculate ATS match score
   */
  async function handleCalculateScore() {
    try {
      showNotification('Calculating ATS score...', 'info');

      const jd = extractJobDescription();
      if (!jd) {
        showNotification('Could not extract job description', 'error');
        return;
      }

      const profile = await getProfile();
      if (!profile) {
        showNotification('Please set up your profile first', 'error');
        return;
      }

      // Calculate simple score
      const jdKeywords = extractKeywords(jd);
      const resumeText = JSON.stringify(profile.resume).toLowerCase();
      const matchingKeywords = jdKeywords.filter(kw => resumeText.includes(kw));
      const score = Math.round((matchingKeywords.length / jdKeywords.length) * 100);

      showNotification(`ATS Match Score: ${score}%`, 'success');
      
      // Send to dashboard
      chrome.runtime.sendMessage({
        type: 'ATS_SCORE_CALCULATED',
        score,
        jobDescription: jd,
      });
    } catch (error) {
      console.error('Score calculation error:', error);
      showNotification('Score calculation failed', 'error');
    }
  }

  /**
   * Track current job
   */
  async function handleTrackJob() {
    try {
      const jd = extractJobDescription();
      if (!jd) {
        showNotification('Could not extract job details', 'error');
        return;
      }

      await addTrackedJob({
        title: jd.title,
        company: jd.company,
        url: jd.url,
        status: 'saved',
        jobDescription: jd.description,
      });

      showNotification('Job saved to tracker', 'success');
    } catch (error) {
      console.error('Track job error:', error);
      showNotification('Failed to track job', 'error');
    }
  }

  /**
   * Show notification to user
   */
  function showNotification(message: string, type: 'info' | 'success' | 'error') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 999999;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 300px;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transition = 'opacity 0.3s';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  /**
   * Message listener
   */
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'START_AUTOFILL' || message.type === 'ATS_AUTOFILL') {
      handleAutofill();
    } else if (message.type === 'CALCULATE_SCORE' || message.type === 'ATS_CALCULATE_SCORE') {
      handleCalculateScore();
    } else if (message.type === 'TRACK_CURRENT_JOB' || message.type === 'ATS_TRACK_JOB') {
      handleTrackJob();
    } else if (message.type === 'EXTRACT_JD' || message.type === 'ATS_EXTRACT_JD') {
      const jd = extractJobDescription();
      sendResponse({ jobDescription: jd });
    } else if (message.type === 'ATS_PING') {
      sendResponse({ status: 'ok', ats: detectATS() });
    }

    return true;
  });

  /**
   * Observe DOM changes for multi-step forms
   */
  let observer: MutationObserver | null = null;
  let observerActive = false;

  function startObserver() {
    if (observerActive || observer) return;

    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          const hasNewInputs = Array.from(mutation.addedNodes).some(node => {
            if (node instanceof HTMLElement) {
              return node.querySelector('input, textarea, select') !== null;
            }
            return false;
          });

          if (hasNewInputs) {
            logger.debug('New form fields detected');
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    observerActive = true;
    logger.debug('MutationObserver started');
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
      observerActive = false;
      logger.debug('MutationObserver stopped');
    }
  }

  // Start observing
  startObserver();

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    stopObserver();
  });

  // Auto-detect and cache job description on job pages
  if (window.location.href.includes('job') || window.location.href.includes('career')) {
    setTimeout(async () => {
      const jd = extractJobDescription();
      if (jd && jd.title) {
        logger.info('Job description detected:', jd.title);
        
        // Auto-open panel if enabled
        const settings = await getAtsSettings();
        if (settings?.autoOpenPanel) {
          chrome.runtime.sendMessage({ type: 'AUTO_OPEN_PANEL' });
        }
      }
    }, 2000);
  }
}
