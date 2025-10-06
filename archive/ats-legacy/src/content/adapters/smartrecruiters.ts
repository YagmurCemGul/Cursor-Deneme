/**
 * SmartRecruiters ATS adapter
 */

import { type DetectedField, type FieldType } from '../core/detector';

/**
 * Detect if current page is SmartRecruiters
 */
export function isSmartRecruitersPage(): boolean {
  return (
    window.location.hostname.includes('smartrecruiters.com') ||
    !!document.querySelector('[data-test*="application"]')
  );
}

/**
 * Enhanced field detection for SmartRecruiters
 */
export function detectSmartRecruitersFields(): DetectedField[] {
  const fields: DetectedField[] = [];
  const inputs = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
    'input[data-test], textarea[data-test]'
  );

  for (const input of inputs) {
    const testAttr = input.getAttribute('data-test') || '';
    const label = extractSmartRecruitersLabel(input);
    const type = mapSmartRecruitersField(testAttr, label);

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

function extractSmartRecruitersLabel(element: HTMLElement): string {
  const label = element.closest('.form-group')?.querySelector('label');
  return label?.textContent?.trim() || '';
}

function mapSmartRecruitersField(testAttr: string, label: string): FieldType {
  const combined = (testAttr + ' ' + label).toLowerCase();

  if (combined.includes('first') && combined.includes('name')) return 'first_name';
  if (combined.includes('last') && combined.includes('name')) return 'last_name';
  if (combined.includes('email')) return 'email';
  if (combined.includes('phone')) return 'phone';

  return 'custom_question';
}
