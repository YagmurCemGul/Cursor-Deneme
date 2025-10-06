/**
 * Greenhouse ATS adapter
 */

import { type DetectedField, type FieldType } from '../core/detector';

export const GREENHOUSE_SELECTORS = {
  form: '#application_form, .application-form',
  input: 'input[name], textarea[name]',
  nextButton: 'input[type="submit"], button[type="submit"]',
};

/**
 * Detect if current page is Greenhouse
 */
export function isGreenhousePage(): boolean {
  return (
    window.location.hostname.includes('greenhouse.io') ||
    !!document.querySelector('#application_form') ||
    !!document.querySelector('.greenhouse-application')
  );
}

/**
 * Enhanced field detection for Greenhouse
 */
export function detectGreenhouseFields(): DetectedField[] {
  const fields: DetectedField[] = [];
  const form = document.querySelector(GREENHOUSE_SELECTORS.form);
  if (!form) return fields;

  const inputs = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
    GREENHOUSE_SELECTORS.input
  );

  for (const input of inputs) {
    const name = input.getAttribute('name') || '';
    const label = extractGreenhouseLabel(input);
    const type = mapGreenhouseField(name, label);

    if (type !== 'unknown') {
      fields.push({
        element: input,
        type,
        label,
        confidence: 0.85,
      });
    }
  }

  return fields;
}

/**
 * Extract label from Greenhouse field
 */
function extractGreenhouseLabel(element: HTMLElement): string {
  const parent = element.closest('.field');
  if (parent) {
    const label = parent.querySelector('label');
    if (label) return label.textContent?.trim() || '';
  }
  return element.getAttribute('placeholder') || '';
}

/**
 * Map Greenhouse field name to field type
 */
function mapGreenhouseField(name: string, label: string): FieldType {
  const n = name.toLowerCase();
  const l = label.toLowerCase();

  if (n.includes('first_name') || l.includes('first name')) return 'first_name';
  if (n.includes('last_name') || l.includes('last name')) return 'last_name';
  if (n.includes('email') || l.includes('email')) return 'email';
  if (n.includes('phone') || l.includes('phone')) return 'phone';
  if (n.includes('location') || l.includes('location')) return 'city';
  if (n.includes('resume') || l.includes('resume')) return 'resume';
  if (n.includes('cover_letter') || l.includes('cover letter')) return 'cover_letter';
  if (n.includes('linkedin') || l.includes('linkedin')) return 'linkedin';

  return 'custom_question';
}
