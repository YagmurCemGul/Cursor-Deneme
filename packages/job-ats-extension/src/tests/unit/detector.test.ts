/**
 * Unit tests for field detector
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { detectFields } from '../../content/core/detector';

describe('Field Detector', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should detect first name field', () => {
    document.body.innerHTML = `
      <form style="display: block;">
        <label for="fname">First Name</label>
        <input type="text" id="fname" style="display: block;" />
      </form>
    `;

    // Manually set offsetParent (happy-dom limitation)
    const input = document.getElementById('fname') as any;
    if (input) {
      Object.defineProperty(input, 'offsetParent', { value: document.body, configurable: true });
    }

    const fields = detectFields();
    expect(fields.length).toBeGreaterThan(0);
    if (fields.length > 0) {
      expect(fields[0].type).toBe('first_name');
    }
  });

  it('should detect email field', () => {
    document.body.innerHTML = `
      <form>
        <input type="email" placeholder="Email Address" id="email-field" />
      </form>
    `;

    const input = document.getElementById('email-field') as any;
    if (input) {
      Object.defineProperty(input, 'offsetParent', { value: document.body, configurable: true });
    }

    const fields = detectFields();
    expect(fields.length).toBeGreaterThan(0);
    if (fields.length > 0) {
      expect(fields[0].type).toBe('email');
    }
  });

  it('should skip hidden fields', () => {
    document.body.innerHTML = `
      <form>
        <input type="hidden" name="token" />
        <input type="text" name="name" />
      </form>
    `;

    const fields = detectFields();
    expect(fields.every(f => f.element.type !== 'hidden')).toBe(true);
  });

  it('should detect fields by aria-label', () => {
    document.body.innerHTML = `
      <form>
        <input type="text" aria-label="Phone Number" id="phone-field" />
      </form>
    `;

    const input = document.getElementById('phone-field') as any;
    if (input) {
      Object.defineProperty(input, 'offsetParent', { value: document.body, configurable: true });
    }

    const fields = detectFields();
    expect(fields.length).toBeGreaterThan(0);
    if (fields.length > 0) {
      expect(fields[0].type).toBe('phone');
    }
  });
});
