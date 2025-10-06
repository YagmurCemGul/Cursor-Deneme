/**
 * iCIMS ATS adapter
 */

import { type DetectedField, type FieldType } from '../core/detector';

export function isIcimsPage(): boolean {
  return (
    window.location.hostname.includes('icims.com') ||
    !!document.querySelector('.icims-form')
  );
}

export function detectIcimsFields(): DetectedField[] {
  const fields: DetectedField[] = [];
  const inputs = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
    'input[name], textarea[name]'
  );

  for (const input of inputs) {
    if (input.type === 'hidden') continue;
    
    const name = input.getAttribute('name') || '';
    const label = extractIcimsLabel(input);
    const type = mapIcimsField(name, label);

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

function extractIcimsLabel(element: HTMLElement): string {
  const parent = element.closest('.iCIMS_InfoField, .form-field');
  if (parent) {
    const label = parent.querySelector('label, .iCIMS_InfoField_Label');
    if (label) return label.textContent?.trim() || '';
  }
  return element.getAttribute('placeholder') || '';
}

function mapIcimsField(name: string, label: string): FieldType {
  const combined = (name + ' ' + label).toLowerCase();

  if (combined.includes('firstname') || combined.includes('first name')) return 'first_name';
  if (combined.includes('lastname') || combined.includes('last name')) return 'last_name';
  if (combined.includes('email')) return 'email';
  if (combined.includes('phone')) return 'phone';

  return 'custom_question';
}
