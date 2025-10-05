/**
 * Plugin System
 * Extensible plugin architecture
 */

import { CVData, ATSOptimization } from '../types';
import { logger } from './logger';

export interface Plugin {
  name: string;
  version: string;
  description: string;
  author?: string;
  
  init(): Promise<void>;
  destroy?(): Promise<void>;
  
  // Hooks
  onOptimize?(cvData: CVData, optimizations: ATSOptimization[]): Promise<ATSOptimization[]>;
  onGenerateCoverLetter?(letter: string, cvData: CVData): Promise<string>;
  onParse?(cvData: CVData): Promise<CVData>;
  onExport?(cvData: CVData, format: string): Promise<CVData>;
  
  // Settings
  getSettings?(): PluginSettings;
  updateSettings?(settings: any): Promise<void>;
}

export interface PluginSettings {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'select';
    label: string;
    default: any;
    options?: any[];
  };
}

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  main: string;
  permissions: string[];
}

export class PluginManager {
  private plugins = new Map<string, Plugin>();
  private enabled = new Set<string>();

  async loadPlugin(url: string): Promise<void> {
    try {
      const module = await import(/* @vite-ignore */ url);
      const PluginClass = module.default;
      const plugin: Plugin = new PluginClass();
      
      await plugin.init();
      
      this.plugins.set(plugin.name, plugin);
      this.enabled.add(plugin.name);
      
      logger.info(`Plugin loaded: ${plugin.name} v${plugin.version}`);
    } catch (error) {
      logger.error('Failed to load plugin:', error);
      throw error;
    }
  }

  unloadPlugin(name: string): void {
    const plugin = this.plugins.get(name);
    if (plugin && plugin.destroy) {
      plugin.destroy();
    }
    this.plugins.delete(name);
    this.enabled.delete(name);
    logger.info(`Plugin unloaded: ${name}`);
  }

  async executeHook<T>(hook: keyof Plugin, ...args: any[]): Promise<T> {
    let result = args[0];
    
    for (const [name, plugin] of this.plugins) {
      if (!this.enabled.has(name)) continue;
      
      const hookFn = plugin[hook] as any;
      if (hookFn) {
        try {
          result = await hookFn.apply(plugin, [result, ...args.slice(1)]);
        } catch (error) {
          logger.error(`Plugin ${name} hook error:`, error);
        }
      }
    }
    
    return result;
  }

  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  enablePlugin(name: string): void {
    this.enabled.add(name);
  }

  disablePlugin(name: string): void {
    this.enabled.delete(name);
  }
}

// Global plugin manager
let globalPluginManager: PluginManager | null = null;

export function getPluginManager(): PluginManager {
  if (!globalPluginManager) {
    globalPluginManager = new PluginManager();
  }
  return globalPluginManager;
}

// Example plugin
export class GrammarCheckPlugin implements Plugin {
  name = 'grammar-check';
  version = '1.0.0';
  description = 'Check grammar and spelling';

  async init(): Promise<void> {
    logger.info('Grammar check plugin initialized');
  }

  async onGenerateCoverLetter(letter: string): Promise<string> {
    // Simple grammar fixes (in real app, use proper library)
    return letter
      .replace(/\s+/g, ' ')
      .replace(/\s([.,!?])/g, '$1')
      .replace(/i\b/g, 'I');
  }
}
