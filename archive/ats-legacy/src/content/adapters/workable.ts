/**
 * Workable ATS adapter
 */

import { type DetectedField, type FieldType } from '../core/detector';

export function isWorkablePage(): boolean {
  return (
    window.location.hostname.includes('workable.com') ||
    !!document.querySelector('[data-ui="form"]')
  );
}

export function detectWorkableFields(): DetectedField[] {
  const fields: DetectedField[] = [];
  const inputs = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
    'input[name], textarea[name]'
  );

  for (const input of inputs) {
    if (input.type === 'hidden') continue;
    
    const name = input.getAttribute('name') || '';
    const label = extractWorkableLabel(input);
    const type = mapWorkableField(name, label);

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

function extractWorkableLabel(element: HTMLElement): string {
  const label = element.closest('.form-field')?.querySelector('label');
  return label?.textContent?.trim() || '';
}

function mapWorkableField(name: string, label: string): FieldType {
  const combined = (name + ' ' + label).toLowerCase();

  if (combined.includes('firstname')) return 'first_name';
  if (combined.includes('lastname')) return 'last_name';
  if (combined.includes('email')) return 'email';
  if (combined.includes('phone')) return 'phone';

  return 'custom_question';
}
