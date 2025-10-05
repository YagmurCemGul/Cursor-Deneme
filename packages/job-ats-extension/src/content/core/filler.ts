/**
 * Form field filling utilities
 * Handles value setting and event triggering for various frameworks
 */

/**
 * Set value on input element and trigger events
 * Works with React, Angular, and vanilla forms
 */
export function setInputValue(element: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  // Get the native setter
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  )?.set;

  const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    'value'
  )?.set;

  // Set value using native setter (bypasses React/Angular)
  if (element instanceof HTMLInputElement && nativeInputValueSetter) {
    nativeInputValueSetter.call(element, value);
  } else if (element instanceof HTMLTextAreaElement && nativeTextAreaValueSetter) {
    nativeTextAreaValueSetter.call(element, value);
  } else {
    element.value = value;
  }

  // Trigger events for framework detection
  triggerEvents(element);
}

/**
 * Set value on select element
 */
export function setSelectValue(element: HTMLSelectElement, value: string): void {
  // Try to find matching option
  const options = Array.from(element.options);
  const matchingOption = options.find(opt => 
    opt.value === value || 
    opt.text.toLowerCase() === value.toLowerCase() ||
    opt.text.toLowerCase().includes(value.toLowerCase())
  );

  if (matchingOption) {
    element.value = matchingOption.value;
    triggerEvents(element);
  }
}

/**
 * Trigger all necessary events for frameworks to detect changes
 */
function triggerEvents(element: HTMLElement): void {
  const events = [
    new Event('input', { bubbles: true, cancelable: true }),
    new Event('change', { bubbles: true, cancelable: true }),
    new Event('blur', { bubbles: true, cancelable: true }),
  ];

  for (const event of events) {
    element.dispatchEvent(event);
  }

  // Additional React-specific events
  const reactEvent = new Event('input', { bubbles: true });
  Object.defineProperty(reactEvent, 'simulated', { value: false });
  element.dispatchEvent(reactEvent);
}

/**
 * Check if file input can be programmatically filled
 * (Spoiler: it can't due to security restrictions)
 */
export function canFillFileInput(): boolean {
  return false;
}

/**
 * Show file upload guidance to user
 */
export function showFileUploadGuidance(element: HTMLInputElement, fileName: string): void {
  // Create a temporary tooltip
  const tooltip = document.createElement('div');
  tooltip.style.cssText = `
    position: absolute;
    background: #1a1a1a;
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    pointer-events: none;
    max-width: 300px;
  `;
  tooltip.textContent = `Please upload: ${fileName}`;

  const rect = element.getBoundingClientRect();
  tooltip.style.top = `${rect.top + window.scrollY - 50}px`;
  tooltip.style.left = `${rect.left + window.scrollX}px`;

  document.body.appendChild(tooltip);

  // Highlight the file input
  element.style.outline = '3px solid #4CAF50';
  element.style.outlineOffset = '2px';

  // Auto-remove after 5 seconds
  setTimeout(() => {
    tooltip.remove();
    element.style.outline = '';
    element.style.outlineOffset = '';
  }, 5000);

  // Click to focus
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  element.focus();
}

/**
 * Safely fill a field with error handling
 */
export function fillField(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value: string
): boolean {
  try {
    if (element instanceof HTMLSelectElement) {
      setSelectValue(element, value);
    } else if (element.type === 'file') {
      showFileUploadGuidance(element as HTMLInputElement, value);
      return false; // Can't programmatically fill
    } else {
      setInputValue(element as HTMLInputElement | HTMLTextAreaElement, value);
    }
    return true;
  } catch (error) {
    console.error('Failed to fill field:', error);
    return false;
  }
}

/**
 * Wait for element to be ready (not disabled, visible)
 */
export async function waitForElement(
  element: HTMLElement,
  timeout = 5000
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (
      element.offsetParent !== null &&
      !(element as HTMLInputElement).disabled &&
      !element.hasAttribute('readonly')
    ) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return false;
}

/**
 * Batch fill multiple fields with delay between each
 */
export async function batchFillFields(
  fields: Array<{ element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement; value: string }>,
  delayMs = 100
): Promise<number> {
  let successCount = 0;

  for (const { element, value } of fields) {
    await waitForElement(element, 2000);
    const success = fillField(element, value);
    if (success) successCount++;
    
    // Small delay to mimic human behavior
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  return successCount;
}
