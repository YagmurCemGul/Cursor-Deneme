/**
 * Workday ATS adapter
 * Handles Workday-specific form detection and filling
 */

import { type DetectedField, type FieldType } from '../core/detector';

export const WORKDAY_SELECTORS = {
  form: '[data-automation-id="formField"]',
  input: 'input[data-automation-id], textarea[data-automation-id]',
  select: 'select[data-automation-id]',
  nextButton: '[data-automation-id="bottom-navigation-next-button"]',
  continueButton: '[data-automation-id="continueButton"]',
  fileUpload: 'input[type="file"][data-automation-id]',
};

/**
 * Detect if current page is Workday
 */
export function isWorkdayPage(): boolean {
  return (
    window.location.hostname.includes('workday') ||
    !!document.querySelector('[data-automation-id]') ||
    !!document.querySelector('.WD')
  );
}

/**
 * Enhanced field detection for Workday
 */
export function detectWorkdayFields(): DetectedField[] {
  const fields: DetectedField[] = [];
  const inputs = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
    WORKDAY_SELECTORS.input
  );

  for (const input of inputs) {
    const automationId = input.getAttribute('data-automation-id') || '';
    const label = extractWorkdayLabel(input);
    const type = mapWorkdayField(automationId, label);

    if (type !== 'unknown') {
      fields.push({
        element: input,
        type,
        label,
        confidence: 0.9,
      });
    }
  }

  return fields;
}

/**
 * Extract label from Workday form field
 */
function extractWorkdayLabel(element: HTMLElement): string {
  const parent = element.closest('[data-automation-id="formField"]');
  if (parent) {
    const label = parent.querySelector('label');
    if (label) return label.textContent?.trim() || '';
  }
  return element.getAttribute('aria-label') || '';
}

/**
 * Map Workday automation ID to field type
 */
function mapWorkdayField(automationId: string, label: string): FieldType {
  const id = automationId.toLowerCase();
  const lbl = label.toLowerCase();

  if (id.includes('firstname') || lbl.includes('first name')) return 'first_name';
  if (id.includes('lastname') || lbl.includes('last name')) return 'last_name';
  if (id.includes('email') || lbl.includes('email')) return 'email';
  if (id.includes('phone') || lbl.includes('phone')) return 'phone';
  if (id.includes('city') || lbl.includes('city')) return 'city';
  if (id.includes('country') || lbl.includes('country')) return 'country';
  if (id.includes('linkedin') || lbl.includes('linkedin')) return 'linkedin';
  if (id.includes('resume') || lbl.includes('resume')) return 'resume';
  if (id.includes('coverletter') || lbl.includes('cover letter')) return 'cover_letter';

  return 'custom_question';
}

/**
 * Click next/continue button if available
 */
export function clickNextButton(): boolean {
  const nextBtn = document.querySelector<HTMLButtonElement>(WORKDAY_SELECTORS.nextButton);
  const continueBtn = document.querySelector<HTMLButtonElement>(WORKDAY_SELECTORS.continueButton);
  
  const button = nextBtn || continueBtn;
  if (button && !button.disabled) {
    button.click();
    return true;
  }
  return false;
}

/**
 * Wait for Workday page transition
 */
export async function waitForPageTransition(timeout = 3000): Promise<boolean> {
  const startTime = Date.now();
  const initialUrl = window.location.href;

  while (Date.now() - startTime < timeout) {
    if (window.location.href !== initialUrl) return true;
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return false;
}
