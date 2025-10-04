/**
 * Tests for Performance Monitor
 */

import { PerformanceMonitor, PerformanceMetric } from '../performance';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
    monitor.setEnabled(true);
    monitor.clear();
  });

  describe('start and end', () => {
    it('should track metric duration', () => {
      monitor.start('test-metric');
      const duration = monitor.end('test-metric');

      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should return null for unknown metrics', () => {
      const duration = monitor.end('unknown-metric');
      expect(duration).toBeNull();
    });

    it('should store metadata', () => {
      monitor.start('test-metric', { key: 'value' });
      monitor.end('test-metric');

      const metric = monitor.getMetric('test-metric');
      expect(metric?.metadata).toEqual({ key: 'value' });
    });
  });

  describe('measure', () => {
    it('should measure async function execution', async () => {
      const fn = jest.fn().mockResolvedValue('result');

      const result = await monitor.measure('async-test', fn);

      expect(result).toBe('result');
      expect(fn).toHaveBeenCalled();

      const metric = monitor.getMetric('async-test');
      expect(metric).toBeDefined();
      expect(metric?.duration).toBeGreaterThanOrEqual(0);
    });

    it('should measure even if function throws', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Test error'));

      await expect(monitor.measure('async-error', fn)).rejects.toThrow('Test error');

      const metric = monitor.getMetric('async-error');
      expect(metric?.duration).toBeDefined();
    });
  });

  describe('measureSync', () => {
    it('should measure sync function execution', () => {
      const fn = jest.fn().mockReturnValue('result');

      const result = monitor.measureSync('sync-test', fn);

      expect(result).toBe('result');
      expect(fn).toHaveBeenCalled();

      const metric = monitor.getMetric('sync-test');
      expect(metric).toBeDefined();
      expect(metric?.duration).toBeGreaterThanOrEqual(0);
    });

    it('should measure even if function throws', () => {
      const fn = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });

      expect(() => monitor.measureSync('sync-error', fn)).toThrow('Test error');

      const metric = monitor.getMetric('sync-error');
      expect(metric?.duration).toBeDefined();
    });
  });

  describe('getMetrics', () => {
    it('should return all metrics', () => {
      monitor.start('metric1');
      monitor.end('metric1');
      monitor.start('metric2');
      monitor.end('metric2');

      const metrics = monitor.getMetrics();
      expect(metrics).toHaveLength(2);
      expect(metrics.map((m: PerformanceMetric) => m.name)).toContain('metric1');
      expect(metrics.map((m: PerformanceMetric) => m.name)).toContain('metric2');
    });

    it('should return empty array when no metrics', () => {
      const metrics = monitor.getMetrics();
      expect(metrics).toHaveLength(0);
    });
  });

  describe('clear', () => {
    it('should remove all metrics', () => {
      monitor.start('metric1');
      monitor.end('metric1');

      monitor.clear();

      const metrics = monitor.getMetrics();
      expect(metrics).toHaveLength(0);
    });
  });

  describe('setEnabled', () => {
    it('should disable tracking when set to false', () => {
      monitor.setEnabled(false);

      monitor.start('test');
      const duration = monitor.end('test');

      expect(duration).toBeNull();
    });

    it('should enable tracking when set to true', () => {
      monitor.setEnabled(true);

      monitor.start('test');
      const duration = monitor.end('test');

      expect(duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('generateReport', () => {
    it('should generate performance report', () => {
      monitor.start('metric1');
      monitor.end('metric1');
      monitor.start('metric2');
      monitor.end('metric2');

      const report = monitor.generateReport();

      expect(report).toContain('Performance Report');
      expect(report).toContain('metric1');
      expect(report).toContain('metric2');
      expect(report).toContain('Total operations: 2');
    });

    it('should return message when no metrics', () => {
      const report = monitor.generateReport();
      expect(report).toBe('No performance metrics recorded');
    });
  });

  describe('trackBundleSize', () => {
    it('should track bundle size', () => {
      // Just verify it doesn't throw
      expect(() => {
        monitor.trackBundleSize('main.js', 500000);
      }).not.toThrow();
    });
  });
});
