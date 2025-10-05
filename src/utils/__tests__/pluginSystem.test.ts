/**
 * Plugin System Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PluginManager, Plugin } from '../pluginSystem';

// Mock plugin
class TestPlugin implements Plugin {
  name = 'test-plugin';
  version = '1.0.0';
  description = 'Test plugin';

  async init(): Promise<void> {
    // Initialized
  }

  async onOptimize(cvData: any, optimizations: any[]): Promise<any[]> {
    return [...optimizations, {
      id: 'plugin-opt',
      category: 'Plugin',
      change: 'Added by plugin',
      originalText: '',
      optimizedText: 'Plugin optimization',
      applied: false
    }];
  }

  async onGenerateCoverLetter(letter: string): Promise<string> {
    return letter + '\n\nP.S. Enhanced by plugin';
  }
}

describe('PluginManager', () => {
  let manager: PluginManager;

  beforeEach(() => {
    manager = new PluginManager();
  });

  describe('Plugin Loading', () => {
    it('should register plugin', async () => {
      const plugin = new TestPlugin();
      await plugin.init();
      
      (manager as any).plugins.set(plugin.name, plugin);
      (manager as any).enabled.add(plugin.name);

      const plugins = manager.getPlugins();
      expect(plugins).toHaveLength(1);
      expect(plugins[0].name).toBe('test-plugin');
    });

    it('should unload plugin', async () => {
      const plugin = new TestPlugin();
      await plugin.init();
      
      (manager as any).plugins.set(plugin.name, plugin);
      
      manager.unloadPlugin('test-plugin');

      const plugins = manager.getPlugins();
      expect(plugins).toHaveLength(0);
    });
  });

  describe('Plugin Hooks', () => {
    it('should execute onOptimize hook', async () => {
      const plugin = new TestPlugin();
      await plugin.init();
      
      (manager as any).plugins.set(plugin.name, plugin);
      (manager as any).enabled.add(plugin.name);

      const cvData = {};
      const optimizations: any[] = [];
      
      const result = await manager.executeHook('onOptimize', optimizations, cvData);

      expect(result).toHaveLength(1);
      expect(result[0].change).toBe('Added by plugin');
    });

    it('should execute onGenerateCoverLetter hook', async () => {
      const plugin = new TestPlugin();
      await plugin.init();
      
      (manager as any).plugins.set(plugin.name, plugin);
      (manager as any).enabled.add(plugin.name);

      const result = await manager.executeHook('onGenerateCoverLetter', 'Original letter');

      expect(result).toContain('Original letter');
      expect(result).toContain('Enhanced by plugin');
    });

    it('should skip disabled plugins', async () => {
      const plugin = new TestPlugin();
      await plugin.init();
      
      (manager as any).plugins.set(plugin.name, plugin);
      // Don't add to enabled set

      const result = await manager.executeHook('onGenerateCoverLetter', 'Original');

      expect(result).toBe('Original'); // Not modified
    });

    it('should handle plugin errors gracefully', async () => {
      const errorPlugin: Plugin = {
        name: 'error-plugin',
        version: '1.0.0',
        description: 'Error plugin',
        async init() {},
        async onOptimize() {
          throw new Error('Plugin error');
        }
      };

      (manager as any).plugins.set(errorPlugin.name, errorPlugin);
      (manager as any).enabled.add(errorPlugin.name);

      const optimizations: any[] = [];
      
      // Should not throw, just log error
      const result = await manager.executeHook('onOptimize', optimizations);
      expect(result).toEqual(optimizations);
    });
  });

  describe('Plugin Management', () => {
    it('should enable plugin', async () => {
      const plugin = new TestPlugin();
      (manager as any).plugins.set(plugin.name, plugin);

      manager.enablePlugin('test-plugin');

      const enabled = (manager as any).enabled;
      expect(enabled.has('test-plugin')).toBe(true);
    });

    it('should disable plugin', async () => {
      const plugin = new TestPlugin();
      (manager as any).plugins.set(plugin.name, plugin);
      (manager as any).enabled.add('test-plugin');

      manager.disablePlugin('test-plugin');

      const enabled = (manager as any).enabled;
      expect(enabled.has('test-plugin')).toBe(false);
    });
  });

  describe('Multiple Plugins', () => {
    it('should execute hooks in order', async () => {
      const plugin1: Plugin = {
        name: 'plugin-1',
        version: '1.0.0',
        description: 'First',
        async init() {},
        async onGenerateCoverLetter(letter: string) {
          return letter + ' [Plugin 1]';
        }
      };

      const plugin2: Plugin = {
        name: 'plugin-2',
        version: '1.0.0',
        description: 'Second',
        async init() {},
        async onGenerateCoverLetter(letter: string) {
          return letter + ' [Plugin 2]';
        }
      };

      (manager as any).plugins.set('plugin-1', plugin1);
      (manager as any).plugins.set('plugin-2', plugin2);
      (manager as any).enabled.add('plugin-1');
      (manager as any).enabled.add('plugin-2');

      const result = await manager.executeHook('onGenerateCoverLetter', 'Original');

      expect(result).toBe('Original [Plugin 1] [Plugin 2]');
    });
  });
});
