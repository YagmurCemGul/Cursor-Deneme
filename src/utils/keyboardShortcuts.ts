/**
 * Keyboard Shortcuts Manager
 * Provides global keyboard shortcuts for the application
 * 
 * @module keyboardShortcuts
 */

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
}

class KeyboardShortcutsManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private enabled: boolean = true;

  constructor() {
    this.init();
  }

  /**
   * Initialize keyboard event listeners
   */
  private init(): void {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * Handle keydown events
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.enabled) return;

    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Exception: allow some shortcuts even in input fields
      if (!this.isGlobalShortcut(event)) {
        return;
      }
    }

    const key = this.getShortcutKey(event);
    const shortcut = this.shortcuts.get(key);

    if (shortcut) {
      event.preventDefault();
      shortcut.action();
    }
  }

  /**
   * Check if a shortcut should work globally (even in input fields)
   */
  private isGlobalShortcut(event: KeyboardEvent): boolean {
    // Ctrl+S, Ctrl+P should work everywhere
    if ((event.ctrlKey || event.metaKey) && (event.key === 's' || event.key === 'p')) {
      return true;
    }
    return false;
  }

  /**
   * Generate a unique key for a shortcut
   */
  private getShortcutKey(event: KeyboardEvent | Partial<KeyboardShortcut>): string {
    const parts: string[] = [];
    
    if ('ctrlKey' in event && event.ctrlKey) parts.push('ctrl');
    if ('shiftKey' in event && event.shiftKey) parts.push('shift');
    if ('altKey' in event && event.altKey) parts.push('alt');
    if ('metaKey' in event && event.metaKey) parts.push('meta');
    
    const key = 'key' in event ? event.key.toLowerCase() : '';
    parts.push(key);
    
    return parts.join('+');
  }

  /**
   * Register a keyboard shortcut
   */
  register(shortcut: KeyboardShortcut): void {
    const key = this.getShortcutKey(shortcut);
    this.shortcuts.set(key, shortcut);
  }

  /**
   * Unregister a keyboard shortcut
   */
  unregister(shortcut: Partial<KeyboardShortcut>): void {
    const key = this.getShortcutKey(shortcut);
    this.shortcuts.delete(key);
  }

  /**
   * Get all registered shortcuts
   */
  getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Clear all shortcuts
   */
  clear(): void {
    this.shortcuts.clear();
  }

  /**
   * Enable or disable shortcuts
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Format shortcut for display
   */
  formatShortcut(shortcut: KeyboardShortcut): string {
    const parts: string[] = [];
    
    if (shortcut.ctrlKey || shortcut.metaKey) {
      parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
    }
    if (shortcut.shiftKey) parts.push('Shift');
    if (shortcut.altKey) parts.push('Alt');
    
    parts.push(shortcut.key.toUpperCase());
    
    return parts.join('+');
  }
}

// Export singleton instance
export const keyboardShortcuts = new KeyboardShortcutsManager();

/**
 * React hook for using keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]): void {
  React.useEffect(() => {
    shortcuts.forEach(shortcut => {
      keyboardShortcuts.register(shortcut);
    });

    return () => {
      shortcuts.forEach(shortcut => {
        keyboardShortcuts.unregister(shortcut);
      });
    };
  }, [shortcuts]);
}

// We need to import React for the hook
import React from 'react';
