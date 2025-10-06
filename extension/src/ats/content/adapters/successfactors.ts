/**
 * SAP SuccessFactors ATS adapter
 */

import { type DetectedField, type FieldType } from '../core/detector';

export function isSuccessFactorsPage(): boolean {
  return (
    window.location.hostname.includes('successfactors.com') ||
    !!document.querySelector('[data-sap-ui]')
  );
}

export function detectSuccessFactorsFields(): DetectedField[] {
  const fields: DetectedField[] = [];
  const inputs = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
    'input, textarea'
  );

  for (const input of inputs) {
    if (input.type === 'hidden' || !input.offsetParent) continue;
    
    const label = extractSuccessFactorsLabel(input);
    const type = mapSuccessFactorsField(label);

    if (type !== 'unknown') {
      fields.push({
        element: input,
        type,
        label,
        confidence: 0.75,
      });
    }
  }

  return fields;
}

function extractSuccessFactorsLabel(element: HTMLElement): string {
  const id = element.id;
  if (id) {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) return label.textContent?.trim() || '';
  }
  return element.getAttribute('aria-label') || '';
}

function mapSuccessFactorsField(label: string): FieldType {
  const l = label.toLowerCase();

  if (l.includes('first name')) return 'first_name';
  if (l.includes('last name')) return 'last_name';
  if (l.includes('email')) return 'email';
  if (l.includes('phone')) return 'phone';

  return 'custom_question';
}
