/**
 * Lever ATS adapter
 */

import { type DetectedField, type FieldType } from '../core/detector';

export const LEVER_SELECTORS = {
  form: '.application-form, form.lever-form',
  input: 'input, textarea',
  nextButton: 'button[type="submit"]',
};

/**
 * Detect if current page is Lever
 */
export function isLeverPage(): boolean {
  return (
    window.location.hostname.includes('lever.co') ||
    !!document.querySelector('.lever-jobs') ||
    !!document.querySelector('[class*="lever"]')
  );
}

/**
 * Enhanced field detection for Lever
 */
export function detectLeverFields(): DetectedField[] {
  const fields: DetectedField[] = [];
  const inputs = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
    LEVER_SELECTORS.input
  );

  for (const input of inputs) {
    if (input.type === 'hidden' || input.type === 'submit') continue;
    
    const label = extractLeverLabel(input);
    const type = mapLeverField(input.name, label);

    if (type !== 'unknown') {
      fields.push({
        element: input,
        type,
        label,
        confidence: 0.8,
      });
    }
  }

  return fields;
}

/**
 * Extract label from Lever field
 */
function extractLeverLabel(element: HTMLElement): string {
  const parent = element.closest('.application-question');
  if (parent) {
    const label = parent.querySelector('label, .label');
    if (label) return label.textContent?.trim() || '';
  }
  return element.getAttribute('placeholder') || element.getAttribute('name') || '';
}

/**
 * Map Lever field to field type
 */
function mapLeverField(name: string, label: string): FieldType {
  const combined = (name + ' ' + label).toLowerCase();

  if (combined.includes('first') && combined.includes('name')) return 'first_name';
  if (combined.includes('last') && combined.includes('name')) return 'last_name';
  if (combined.includes('email')) return 'email';
  if (combined.includes('phone')) return 'phone';
  if (combined.includes('resume')) return 'resume';
  if (combined.includes('cover')) return 'cover_letter';
  if (combined.includes('linkedin')) return 'linkedin';

  return 'custom_question';
}
