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
      <form>
        <label for="fname">First Name</label>
        <input type="text" id="fname" />
      </form>
    `;

    const fields = detectFields();
    expect(fields.length).toBeGreaterThan(0);
    expect(fields[0].type).toBe('first_name');
  });

  it('should detect email field', () => {
    document.body.innerHTML = `
      <form>
        <input type="email" placeholder="Email Address" />
      </form>
    `;

    const fields = detectFields();
    expect(fields.length).toBeGreaterThan(0);
    expect(fields[0].type).toBe('email');
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
        <input type="text" aria-label="Phone Number" />
      </form>
    `;

    const fields = detectFields();
    expect(fields.length).toBeGreaterThan(0);
    expect(fields[0].type).toBe('phone');
  });
});
