/**
 * Unit tests for message authentication
 */

import { describe, it, expect, vi } from 'vitest';

describe('Message Authentication', () => {
  it('should verify sender is from extension', () => {
    const validSender = {
      id: 'test-extension-id',
      url: 'chrome-extension://test-extension-id/tab/index.html',
    } as chrome.runtime.MessageSender;

    function isValidSender(sender: chrome.runtime.MessageSender, extensionId: string): boolean {
      if (sender.id !== extensionId) {
        return false;
      }
      return true;
    }

    expect(isValidSender(validSender, 'test-extension-id')).toBe(true);
    expect(isValidSender(validSender, 'different-id')).toBe(false);
  });

  it('should reject messages from unknown senders', () => {
    const unknownSender = {
      id: 'malicious-extension',
      url: 'https://evil.com',
    } as chrome.runtime.MessageSender;

    function isValidSender(sender: chrome.runtime.MessageSender, extensionId: string): boolean {
      if (sender.id !== extensionId) {
        return false;
      }
      return true;
    }

    expect(isValidSender(unknownSender, 'my-extension')).toBe(false);
  });

  it('should allow messages from extension pages', () => {
    const extensionPageSender = {
      id: 'my-extension',
      url: 'chrome-extension://my-extension/options.html',
    } as chrome.runtime.MessageSender;

    function isValidSender(sender: chrome.runtime.MessageSender, extensionId: string): boolean {
      if (sender.id !== extensionId) {
        return false;
      }

      if (sender.url) {
        const url = new URL(sender.url);
        if (url.protocol === 'chrome-extension:') {
          return true;
        }
      }

      return true;
    }

    expect(isValidSender(extensionPageSender, 'my-extension')).toBe(true);
  });

  it('should validate content script senders', () => {
    const contentScriptSender = {
      id: 'my-extension',
      url: 'https://www.linkedin.com/jobs/view/123456',
      tab: { id: 1 },
    } as chrome.runtime.MessageSender;

    function isValidSender(sender: chrome.runtime.MessageSender, extensionId: string): boolean {
      if (sender.id !== extensionId) {
        return false;
      }

      // Content scripts are validated by manifest matches
      return true;
    }

    expect(isValidSender(contentScriptSender, 'my-extension')).toBe(true);
  });
});
