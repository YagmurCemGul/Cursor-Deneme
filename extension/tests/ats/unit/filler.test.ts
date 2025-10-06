/**
 * Unit tests for field filler
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { setInputValue, fillField } from '../../content/core/filler';

describe('Field Filler', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should set value on input element', () => {
    const input = document.createElement('input');
    input.type = 'text';
    document.body.appendChild(input);

    setInputValue(input, 'Test Value');
    expect(input.value).toBe('Test Value');
  });

  it('should set value on textarea', () => {
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    setInputValue(textarea, 'Long text content');
    expect(textarea.value).toBe('Long text content');
  });

  it('should trigger events', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);

    let inputFired = false;
    let changeFired = false;

    input.addEventListener('input', () => { inputFired = true; });
    input.addEventListener('change', () => { changeFired = true; });

    setInputValue(input, 'Test');

    expect(inputFired).toBe(true);
    expect(changeFired).toBe(true);
  });

  it('should return false for file inputs', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    document.body.appendChild(fileInput);

    const result = fillField(fileInput, 'resume.pdf');
    expect(result).toBe(false);
  });
});
