/**
 * Theme Manager Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeManager, themes } from '../themeManager';

describe('ThemeManager', () => {
  let themeManager: ThemeManager;

  beforeEach(() => {
    localStorage.clear();
    themeManager = new ThemeManager();
  });

  describe('Theme Management', () => {
    it('should initialize with light theme by default', () => {
      expect(themeManager.getCurrentTheme()).toBe('light');
    });

    it('should switch themes', () => {
      themeManager.setTheme('dark');
      expect(themeManager.getCurrentTheme()).toBe('dark');

      themeManager.setTheme('highContrast');
      expect(themeManager.getCurrentTheme()).toBe('highContrast');
    });

    it('should get all available themes', () => {
      const allThemes = themeManager.getAllThemes();
      
      expect(allThemes).toHaveLength(4);
      expect(allThemes.map(t => t.name)).toContain('light');
      expect(allThemes.map(t => t.name)).toContain('dark');
      expect(allThemes.map(t => t.name)).toContain('highContrast');
      expect(allThemes.map(t => t.name)).toContain('solarized');
    });

    it('should register custom theme', () => {
      const customTheme = {
        name: 'Custom',
        colors: {
          ...themes.light.colors,
          primary: '#ff0000'
        }
      };

      themeManager.registerTheme('custom', customTheme);
      
      const allThemes = themeManager.getAllThemes();
      expect(allThemes.map(t => t.name)).toContain('custom');
    });

    it('should persist theme preference', () => {
      themeManager.setTheme('dark');
      
      // Create new instance to test persistence
      const newManager = new ThemeManager();
      expect(newManager.getCurrentTheme()).toBe('dark');
    });
  });

  describe('System Preference Detection', () => {
    it('should detect system preference', () => {
      const preference = themeManager.detectSystemPreference();
      expect(['light', 'dark']).toContain(preference);
    });
  });

  describe('Auto Theme Switching', () => {
    it('should enable auto switch', () => {
      themeManager.enableAutoSwitch(18, 6);
      
      // Save preference
      const stored = localStorage.getItem('theme_preferences');
      expect(stored).toBeDefined();
      
      const prefs = JSON.parse(stored!);
      expect(prefs.autoSwitch).toBe(true);
      expect(prefs.autoSwitchTimes).toEqual({ dark: 18, light: 6 });
    });

    it('should disable auto switch', () => {
      themeManager.enableAutoSwitch();
      themeManager.disableAutoSwitch();
      
      const stored = localStorage.getItem('theme_preferences');
      const prefs = JSON.parse(stored!);
      expect(prefs.autoSwitch).toBe(false);
    });
  });

  describe('Theme Subscription', () => {
    it('should notify subscribers on theme change', () => {
      const listener = vi.fn();
      themeManager.subscribe(listener);

      themeManager.setTheme('dark');

      expect(listener).toHaveBeenCalledWith('dark');
    });

    it('should unsubscribe correctly', () => {
      const listener = vi.fn();
      const unsubscribe = themeManager.subscribe(listener);

      unsubscribe();
      themeManager.setTheme('dark');

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('CSS Generation', () => {
    it('should generate CSS variables', () => {
      const css = themeManager.generateCSS();
      
      expect(css).toContain(':root');
      expect(css).toContain('--color-primary');
      expect(css).toContain('--color-background');
    });
  });

  describe('Theme Import/Export', () => {
    it('should export theme', () => {
      const exported = themeManager.exportTheme('light');
      const parsed = JSON.parse(exported);
      
      expect(parsed).toHaveProperty('name');
      expect(parsed).toHaveProperty('colors');
      expect(parsed.colors).toHaveProperty('primary');
    });

    it('should import theme', () => {
      const customTheme = JSON.stringify({
        name: 'Imported',
        colors: themes.light.colors
      });

      themeManager.importTheme('imported', customTheme);
      
      const allThemes = themeManager.getAllThemes();
      expect(allThemes.map(t => t.name)).toContain('imported');
    });

    it('should reject invalid theme JSON', () => {
      expect(() => {
        themeManager.importTheme('invalid', 'not json');
      }).toThrow('Invalid theme JSON');
    });
  });
});
