/**
 * Content Script Main Entry
 * Orchestrates form detection, autofill, JD extraction, and messaging
 */

import { detectFields } from './core/detector';
import { batchFillFields } from './core/filler';
import { extractJobDescription, extractKeywords } from './core/extract-jd';
import { getProfile, addTrackedJob } from '../lib/storage';
import { jobCache } from '../lib/idb';

// Import adapters
import * as workday from './adapters/workday';
import * as greenhouse from './adapters/greenhouse';
import * as lever from './adapters/lever';
import * as ashby from './adapters/ashby';
import * as smartrecruiters from './adapters/smartrecruiters';
import * as workable from './adapters/workable';
import * as successfactors from './adapters/successfactors';
import * as icims from './adapters/icims';

console.log('🦉 Job ATS Extension content script loaded');

/**
 * Detect which ATS platform is being used
 */
function detectATS(): string | null {
  if (workday.isWorkdayPage()) return 'workday';
  if (greenhouse.isGreenhousePage()) return 'greenhouse';
  if (lever.isLeverPage()) return 'lever';
  if (ashby.isAshbyPage()) return 'ashby';
  if (smartrecruiters.isSmartRecruitersPage()) return 'smartrecruiters';
  if (workable.isWorkablePage()) return 'workable';
  if (successfactors.isSuccessFactorsPage()) return 'successfactors';
  if (icims.isIcimsPage()) return 'icims';
  return null;
}

/**
 * Get enhanced field detection based on ATS
 */
function getFieldsForATS(ats: string | null) {
  if (!ats) return detectFields();

  switch (ats) {
    case 'workday':
      return workday.detectWorkdayFields();
    case 'greenhouse':
      return greenhouse.detectGreenhouseFields();
    case 'lever':
      return lever.detectLeverFields();
    case 'ashby':
      return ashby.detectAshbyFields();
    case 'smartrecruiters':
      return smartrecruiters.detectSmartRecruitersFields();
    case 'workable':
      return workable.detectWorkableFields();
    case 'successfactors':
      return successfactors.detectSuccessFactorsFields();
    case 'icims':
      return icims.detectIcimsFields();
    default:
      return detectFields();
  }
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
    console.log('Detected ATS:', ats || 'generic');

    const fields = getFieldsForATS(ats);
    console.log('Detected fields:', fields.length);

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
        case 'resume':
          value = 'resume.pdf';
          break;
        case 'cover_letter':
          value = 'cover-letter.pdf';
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

    // Save JD to cache
    await jobCache.save({
      id: crypto.randomUUID(),
      url: jd.url,
      title: jd.title,
      company: jd.company,
      description: jd.description,
      requirements: jd.requirements,
      responsibilities: jd.responsibilities,
      benefits: jd.benefits,
      location: jd.location,
      salary: jd.salary,
      extractedAt: Date.now(),
    });

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

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

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
  if (message.type === 'START_AUTOFILL') {
    handleAutofill();
  } else if (message.type === 'CALCULATE_SCORE') {
    handleCalculateScore();
  } else if (message.type === 'TRACK_CURRENT_JOB') {
    handleTrackJob();
  } else if (message.type === 'EXTRACT_JD') {
    const jd = extractJobDescription();
    sendResponse({ jobDescription: jd });
  } else if (message.type === 'SUGGEST_ANSWER') {
    // Handle AI answer suggestion
    console.log('AI answer suggestion requested for:', message.question);
    sendResponse({ success: true });
  } else if (message.type === 'GENERATE_COVER_LETTER') {
    console.log('Cover letter generation requested');
    sendResponse({ success: true });
  }

  return true;
});

/**
 * Observe DOM changes for multi-step forms
 */
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.addedNodes.length > 0) {
      // Check if new form fields were added
      const hasNewInputs = Array.from(mutation.addedNodes).some(node => {
        if (node instanceof HTMLElement) {
          return node.querySelector('input, textarea, select') !== null;
        }
        return false;
      });

      if (hasNewInputs) {
        console.log('New form fields detected');
      }
    }
  }
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Auto-detect and cache job description on job pages
if (window.location.href.includes('job') || window.location.href.includes('career')) {
  setTimeout(() => {
    const jd = extractJobDescription();
    if (jd && jd.title) {
      console.log('Job description detected:', jd.title);
      
      // Cache it
      jobCache.save({
        id: crypto.randomUUID(),
        url: jd.url,
        title: jd.title,
        company: jd.company,
        description: jd.description,
        requirements: jd.requirements,
        responsibilities: jd.responsibilities,
        benefits: jd.benefits,
        location: jd.location,
        extractedAt: Date.now(),
      }).catch(console.error);
    }
  }, 2000);
}
