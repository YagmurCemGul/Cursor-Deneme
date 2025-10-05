/**
 * Theme Manager
 * Manages themes, dark mode, and user preferences
 * 
 * @module themeManager
 * @description Complete theme management system
 */

import { logger } from './logger';

/**
 * Theme configuration
 */
export interface Theme {
  name: string;
  colors: {
    // Primary
    primary: string;
    primaryHover: string;
    primaryLight: string;
    
    // Background
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;
    
    // Text
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    
    // Border
    border: string;
    borderLight: string;
    
    // Status
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // UI Elements
    shadow: string;
    overlay: string;
  };
}

/**
 * Built-in themes
 */
export const themes: Record<string, Theme> = {
  light: {
    name: 'Light',
    colors: {
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      primaryLight: '#dbeafe',
      background: '#ffffff',
      backgroundSecondary: '#f9fafb',
      backgroundTertiary: '#f3f4f6',
      textPrimary: '#111827',
      textSecondary: '#6b7280',
      textTertiary: '#9ca3af',
      border: '#e5e7eb',
      borderLight: '#f3f4f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      shadow: 'rgba(0, 0, 0, 0.1)',
      overlay: 'rgba(0, 0, 0, 0.5)'
    }
  },
  
  dark: {
    name: 'Dark',
    colors: {
      primary: '#60a5fa',
      primaryHover: '#3b82f6',
      primaryLight: '#1e3a8a',
      background: '#111827',
      backgroundSecondary: '#1f2937',
      backgroundTertiary: '#374151',
      textPrimary: '#f9fafb',
      textSecondary: '#d1d5db',
      textTertiary: '#9ca3af',
      border: '#374151',
      borderLight: '#4b5563',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
      shadow: 'rgba(0, 0, 0, 0.3)',
      overlay: 'rgba(0, 0, 0, 0.7)'
    }
  },
  
  highContrast: {
    name: 'High Contrast',
    colors: {
      primary: '#0066cc',
      primaryHover: '#0052a3',
      primaryLight: '#e6f2ff',
      background: '#000000',
      backgroundSecondary: '#1a1a1a',
      backgroundTertiary: '#333333',
      textPrimary: '#ffffff',
      textSecondary: '#cccccc',
      textTertiary: '#999999',
      border: '#ffffff',
      borderLight: '#666666',
      success: '#00ff00',
      warning: '#ffff00',
      error: '#ff0000',
      info: '#00ccff',
      shadow: 'rgba(255, 255, 255, 0.2)',
      overlay: 'rgba(0, 0, 0, 0.9)'
    }
  },
  
  solarized: {
    name: 'Solarized',
    colors: {
      primary: '#268bd2',
      primaryHover: '#2075c7',
      primaryLight: '#eee8d5',
      background: '#fdf6e3',
      backgroundSecondary: '#eee8d5',
      backgroundTertiary: '#93a1a1',
      textPrimary: '#073642',
      textSecondary: '#586e75',
      textTertiary: '#839496',
      border: '#93a1a1',
      borderLight: '#eee8d5',
      success: '#859900',
      warning: '#b58900',
      error: '#dc322f',
      info: '#268bd2',
      shadow: 'rgba(0, 0, 0, 0.1)',
      overlay: 'rgba(0, 0, 0, 0.5)'
    }
  }
};

/**
 * Theme Manager
 */
export class ThemeManager {
  private currentTheme: string = 'light';
  private customThemes = new Map<string, Theme>();
  private listeners = new Set<(theme: string) => void>();
  private autoSwitchEnabled = false;
  private autoSwitchTimes = { dark: 18, light: 6 }; // 18:00 to 6:00 is dark

  constructor() {
    this.loadPreferences();
    this.detectSystemPreference();
    this.setupSystemListener();
    
    if (this.autoSwitchEnabled) {
      this.setupAutoSwitch();
    }
    
    logger.info('Theme manager initialized');
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): string {
    return this.currentTheme;
  }

  /**
   * Set theme
   */
  setTheme(themeName: string): void {
    const theme = this.getTheme(themeName);
    
    if (!theme) {
      logger.error(`Theme not found: ${themeName}`);
      return;
    }

    this.currentTheme = themeName;
    this.applyTheme(theme);
    this.savePreferences();
    this.notifyListeners();
    
    logger.info(`Theme changed to: ${themeName}`);
  }

  /**
   * Get theme object
   */
  getTheme(name: string): Theme | undefined {
    return themes[name] || this.customThemes.get(name);
  }

  /**
   * Get all available themes
   */
  getAllThemes(): { name: string; label: string }[] {
    const builtIn = Object.keys(themes).map(name => ({
      name,
      label: themes[name].name
    }));
    
    const custom = Array.from(this.customThemes.keys()).map(name => ({
      name,
      label: this.customThemes.get(name)!.name
    }));
    
    return [...builtIn, ...custom];
  }

  /**
   * Register custom theme
   */
  registerTheme(name: string, theme: Theme): void {
    this.customThemes.set(name, theme);
    logger.info(`Custom theme registered: ${name}`);
  }

  /**
   * Apply theme to DOM
   */
  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--color-${cssVar}`, value);
    });

    // Add theme class to body
    document.body.className = document.body.className
      .split(' ')
      .filter(c => !c.startsWith('theme-'))
      .join(' ');
    
    document.body.classList.add(`theme-${this.currentTheme}`);
  }

  /**
   * Detect system preference
   */
  detectSystemPreference(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  /**
   * Setup system preference listener
   */
  private setupSystemListener(): void {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
      if (this.currentTheme === 'system') {
        const theme = e.matches ? 'dark' : 'light';
        this.setTheme(theme);
      }
    });
  }

  /**
   * Enable auto theme switching based on time
   */
  enableAutoSwitch(darkHour: number = 18, lightHour: number = 6): void {
    this.autoSwitchEnabled = true;
    this.autoSwitchTimes = { dark: darkHour, light: lightHour };
    this.setupAutoSwitch();
    this.savePreferences();
  }

  /**
   * Disable auto theme switching
   */
  disableAutoSwitch(): void {
    this.autoSwitchEnabled = false;
    this.savePreferences();
  }

  /**
   * Setup automatic theme switching
   */
  private setupAutoSwitch(): void {
    // Check immediately
    this.checkAutoSwitch();
    
    // Check every minute
    setInterval(() => {
      if (this.autoSwitchEnabled) {
        this.checkAutoSwitch();
      }
    }, 60000);
  }

  /**
   * Check if theme should auto-switch
   */
  private checkAutoSwitch(): void {
    const hour = new Date().getHours();
    const { dark, light } = this.autoSwitchTimes;
    
    const shouldBeDark = hour >= dark || hour < light;
    const targetTheme = shouldBeDark ? 'dark' : 'light';
    
    if (this.currentTheme !== targetTheme) {
      logger.info(`Auto-switching theme to ${targetTheme} (hour: ${hour})`);
      this.setTheme(targetTheme);
    }
  }

  /**
   * Subscribe to theme changes
   */
  subscribe(listener: (theme: string) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentTheme);
      } catch (error) {
        logger.error('Error in theme listener:', error);
      }
    });
  }

  /**
   * Load preferences from storage
   */
  private loadPreferences(): void {
    try {
      const stored = localStorage.getItem('theme_preferences');
      if (stored) {
        const prefs = JSON.parse(stored);
        this.currentTheme = prefs.theme || 'light';
        this.autoSwitchEnabled = prefs.autoSwitch || false;
        this.autoSwitchTimes = prefs.autoSwitchTimes || { dark: 18, light: 6 };
      }
    } catch (error) {
      logger.error('Failed to load theme preferences:', error);
    }
  }

  /**
   * Save preferences to storage
   */
  private savePreferences(): void {
    try {
      const prefs = {
        theme: this.currentTheme,
        autoSwitch: this.autoSwitchEnabled,
        autoSwitchTimes: this.autoSwitchTimes
      };
      localStorage.setItem('theme_preferences', JSON.stringify(prefs));
    } catch (error) {
      logger.error('Failed to save theme preferences:', error);
    }
  }

  /**
   * Generate CSS variables
   */
  generateCSS(): string {
    const theme = this.getTheme(this.currentTheme);
    if (!theme) return '';

    let css = ':root {\n';
    
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      css += `  --color-${cssVar}: ${value};\n`;
    });
    
    css += '}\n';
    return css;
  }

  /**
   * Export theme
   */
  exportTheme(themeName: string): string {
    const theme = this.getTheme(themeName);
    if (!theme) throw new Error(`Theme not found: ${themeName}`);
    
    return JSON.stringify(theme, null, 2);
  }

  /**
   * Import theme
   */
  importTheme(name: string, themeJson: string): void {
    try {
      const theme: Theme = JSON.parse(themeJson);
      this.registerTheme(name, theme);
    } catch (error) {
      throw new Error('Invalid theme JSON');
    }
  }
}

/**
 * Global theme manager instance
 */
let globalThemeManager: ThemeManager | null = null;

/**
 * Get or create global theme manager
 */
export function getThemeManager(): ThemeManager {
  if (!globalThemeManager) {
    globalThemeManager = new ThemeManager();
  }
  return globalThemeManager;
}

/**
 * Helper functions
 */
export const theme = {
  setTheme: (themeName: string) => getThemeManager().setTheme(themeName),
  getCurrentTheme: () => getThemeManager().getCurrentTheme(),
  getAllThemes: () => getThemeManager().getAllThemes(),
  detectSystemPreference: () => getThemeManager().detectSystemPreference(),
  enableAutoSwitch: (darkHour?: number, lightHour?: number) => 
    getThemeManager().enableAutoSwitch(darkHour, lightHour),
  disableAutoSwitch: () => getThemeManager().disableAutoSwitch(),
  subscribe: (listener: (theme: string) => void) => 
    getThemeManager().subscribe(listener)
};
