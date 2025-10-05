/**
 * Keyboard Shortcuts Manager
 * Vim-like keyboard shortcuts for power users
 */

import { logger } from './logger';

export type ShortcutHandler = () => void | Promise<void>;

export interface Shortcut {
  key: string;
  description: string;
  handler: ShortcutHandler;
  category?: string;
}

export class KeyboardShortcutManager {
  private shortcuts = new Map<string, Shortcut>();
  private enabled = true;
  private modal: HTMLElement | null = null;

  constructor() {
    this.setupDefaultShortcuts();
    this.listen();
    logger.info('Keyboard shortcuts initialized');
  }

  register(key: string, description: string, handler: ShortcutHandler, category?: string): void {
    this.shortcuts.set(key, { key, description, handler, category });
  }

  unregister(key: string): void {
    this.shortcuts.delete(key);
  }

  private setupDefaultShortcuts(): void {
    // Global shortcuts
    this.register('ctrl+/', 'Show shortcuts', () => this.showHelp(), 'Help');
    this.register('esc', 'Close modal', () => this.hideHelp(), 'Navigation');
    
    // Navigation
    this.register('g h', 'Go to home', () => console.log('Home'), 'Navigation');
    this.register('g d', 'Go to dashboard', () => console.log('Dashboard'), 'Navigation');
    this.register('g s', 'Go to settings', () => console.log('Settings'), 'Navigation');
    
    // Actions
    this.register('ctrl+o', 'Optimize CV', () => console.log('Optimize'), 'Actions');
    this.register('ctrl+g', 'Generate cover letter', () => console.log('Generate'), 'Actions');
    this.register('ctrl+s', 'Save', () => console.log('Save'), 'Actions');
    this.register('ctrl+e', 'Export', () => console.log('Export'), 'Actions');
    
    // Selection (Vim-like)
    this.register('j', 'Select next', () => console.log('Next'), 'Selection');
    this.register('k', 'Select previous', () => console.log('Previous'), 'Selection');
    this.register('enter', 'Apply selected', () => console.log('Apply'), 'Selection');
    this.register('space', 'Toggle selected', () => console.log('Toggle'), 'Selection');
  }

  private listen(): void {
    let sequence = '';
    let sequenceTimer: NodeJS.Timeout;

    document.addEventListener('keydown', (e) => {
      if (!this.enabled) return;
      
      // Skip if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = this.getKeyCombo(e);
      
      // Handle sequence shortcuts (e.g., "g h")
      if (key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        clearTimeout(sequenceTimer);
        sequence += key;
        
        sequenceTimer = setTimeout(() => {
          sequence = '';
        }, 1000);

        // Check if sequence matches any shortcut
        if (this.shortcuts.has(sequence)) {
          e.preventDefault();
          const shortcut = this.shortcuts.get(sequence)!;
          shortcut.handler();
          sequence = '';
        }
      } else {
        // Single key shortcut
        if (this.shortcuts.has(key)) {
          e.preventDefault();
          const shortcut = this.shortcuts.get(key)!;
          shortcut.handler();
        }
      }
    });
  }

  private getKeyCombo(e: KeyboardEvent): string {
    const parts: string[] = [];
    
    if (e.ctrlKey || e.metaKey) parts.push('ctrl');
    if (e.altKey) parts.push('alt');
    if (e.shiftKey && e.key.length > 1) parts.push('shift');
    
    const key = e.key.toLowerCase();
    if (key === 'escape') return 'esc';
    if (key === ' ') return 'space';
    if (key === 'enter') return 'enter';
    if (key.startsWith('arrow')) return key.replace('arrow', '').toLowerCase();
    
    parts.push(key);
    
    return parts.join('+');
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  private showHelp(): void {
    if (this.modal) return;

    // Group shortcuts by category
    const grouped = new Map<string, Shortcut[]>();
    this.shortcuts.forEach(shortcut => {
      const category = shortcut.category || 'Other';
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(shortcut);
    });

    this.modal = document.createElement('div');
    this.modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 24px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    `;

    let html = '<h2 style="margin-top: 0;">Keyboard Shortcuts</h2>';
    
    grouped.forEach((shortcuts, category) => {
      html += `<h3 style="margin-top: 24px; color: #666;">${category}</h3>`;
      html += '<table style="width: 100%; border-collapse: collapse;">';
      
      shortcuts.forEach(shortcut => {
        html += `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px 0;">
              <kbd style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">
                ${shortcut.key}
              </kbd>
            </td>
            <td style="padding: 8px 0; padding-left: 16px;">${shortcut.description}</td>
          </tr>
        `;
      });
      
      html += '</table>';
    });

    html += '<p style="margin-top: 24px; color: #999; font-size: 14px;">Press ESC to close</p>';
    content.innerHTML = html;
    
    this.modal.appendChild(content);
    document.body.appendChild(this.modal);

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hideHelp();
      }
    });
  }

  private hideHelp(): void {
    if (this.modal) {
      document.body.removeChild(this.modal);
      this.modal = null;
    }
  }
}

let globalShortcutManager: KeyboardShortcutManager | null = null;

export function getShortcutManager(): KeyboardShortcutManager {
  if (!globalShortcutManager) {
    globalShortcutManager = new KeyboardShortcutManager();
  }
  return globalShortcutManager;
}

export const shortcuts = {
  register: (key: string, description: string, handler: ShortcutHandler, category?: string) =>
    getShortcutManager().register(key, description, handler, category),
  unregister: (key: string) =>
    getShortcutManager().unregister(key),
  enable: () =>
    getShortcutManager().enable(),
  disable: () =>
    getShortcutManager().disable()
};
