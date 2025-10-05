/**
 * Keyboard Shortcuts Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KeyboardShortcutManager } from '../keyboardShortcuts';

describe('KeyboardShortcutManager', () => {
  let manager: KeyboardShortcutManager;

  beforeEach(() => {
    manager = new KeyboardShortcutManager();
  });

  describe('Shortcut Registration', () => {
    it('should register shortcuts', () => {
      const handler = vi.fn();
      manager.register('ctrl+t', 'Test shortcut', handler, 'Testing');

      // Simulate key press
      const event = new KeyboardEvent('keydown', {
        key: 't',
        ctrlKey: true
      });
      
      document.dispatchEvent(event);
      
      expect(handler).toHaveBeenCalled();
    });

    it('should unregister shortcuts', () => {
      const handler = vi.fn();
      manager.register('ctrl+u', 'Test', handler);
      manager.unregister('ctrl+u');

      const event = new KeyboardEvent('keydown', {
        key: 'u',
        ctrlKey: true
      });
      
      document.dispatchEvent(event);
      
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Shortcut Execution', () => {
    it('should execute single key shortcuts', () => {
      const handler = vi.fn();
      manager.register('j', 'Down', handler);

      const event = new KeyboardEvent('keydown', { key: 'j' });
      document.dispatchEvent(event);

      expect(handler).toHaveBeenCalled();
    });

    it('should execute modifier key shortcuts', () => {
      const handler = vi.fn();
      manager.register('ctrl+s', 'Save', handler);

      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true
      });
      document.dispatchEvent(event);

      expect(handler).toHaveBeenCalled();
    });

    it('should execute sequence shortcuts', async () => {
      const handler = vi.fn();
      manager.register('g h', 'Go home', handler);

      // First key
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'g' }));
      
      // Second key (within timeout)
      await new Promise(resolve => setTimeout(resolve, 50));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'h' }));

      expect(handler).toHaveBeenCalled();
    });

    it('should not execute if typing in input', () => {
      const handler = vi.fn();
      manager.register('a', 'Test', handler);

      const input = document.createElement('input');
      document.body.appendChild(input);

      const event = new KeyboardEvent('keydown', { key: 'a' });
      Object.defineProperty(event, 'target', { value: input });
      
      document.dispatchEvent(event);

      expect(handler).not.toHaveBeenCalled();
      
      document.body.removeChild(input);
    });
  });

  describe('Enable/Disable', () => {
    it('should disable shortcuts', () => {
      const handler = vi.fn();
      manager.register('ctrl+d', 'Test', handler);
      
      manager.disable();

      const event = new KeyboardEvent('keydown', {
        key: 'd',
        ctrlKey: true
      });
      document.dispatchEvent(event);

      expect(handler).not.toHaveBeenCalled();
    });

    it('should re-enable shortcuts', () => {
      const handler = vi.fn();
      manager.register('ctrl+e', 'Test', handler);
      
      manager.disable();
      manager.enable();

      const event = new KeyboardEvent('keydown', {
        key: 'e',
        ctrlKey: true
      });
      document.dispatchEvent(event);

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('Special Keys', () => {
    it('should handle Escape key', () => {
      const handler = vi.fn();
      manager.register('esc', 'Close', handler);

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      expect(handler).toHaveBeenCalled();
    });

    it('should handle Enter key', () => {
      const handler = vi.fn();
      manager.register('enter', 'Submit', handler);

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(event);

      expect(handler).toHaveBeenCalled();
    });

    it('should handle Space key', () => {
      const handler = vi.fn();
      manager.register('space', 'Toggle', handler);

      const event = new KeyboardEvent('keydown', { key: ' ' });
      document.dispatchEvent(event);

      expect(handler).toHaveBeenCalled();
    });
  });
});
