/**
 * Ashby ATS adapter
 */

import { type DetectedField, type FieldType } from '../core/detector';

/**
 * Detect if current page is Ashby
 */
export function isAshbyPage(): boolean {
  return (
    window.location.hostname.includes('ashbyhq.com') ||
    !!document.querySelector('[data-testid*="application"]') ||
    !!document.querySelector('[class*="ashby"]')
  );
}

/**
 * Enhanced field detection for Ashby
 */
export function detectAshbyFields(): DetectedField[] {
  const fields: DetectedField[] = [];
  const inputs = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
    'input[data-testid], textarea[data-testid]'
  );

  for (const input of inputs) {
    const testId = input.getAttribute('data-testid') || '';
    const label = extractAshbyLabel(input);
    const type = mapAshbyField(testId, label);

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
 * Extract label from Ashby field
 */
function extractAshbyLabel(element: HTMLElement): string {
  const label = element.closest('[class*="field"]')?.querySelector('label');
  return label?.textContent?.trim() || element.getAttribute('aria-label') || '';
}

/**
 * Map Ashby test ID to field type
 */
function mapAshbyField(testId: string, label: string): FieldType {
  const combined = (testId + ' ' + label).toLowerCase();

  if (combined.includes('firstname') || combined.includes('first-name')) return 'first_name';
  if (combined.includes('lastname') || combined.includes('last-name')) return 'last_name';
  if (combined.includes('email')) return 'email';
  if (combined.includes('phone')) return 'phone';
  if (combined.includes('resume')) return 'resume';
  if (combined.includes('cover')) return 'cover_letter';

  return 'custom_question';
}
