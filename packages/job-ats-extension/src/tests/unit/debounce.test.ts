/**
 * Unit tests for debounced field detection
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DebouncedDetector } from '../../content/core/debounce';

describe('DebouncedDetector', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should debounce rapid calls', () => {
    const detector = new DebouncedDetector(300, 1000);
    const callback = vi.fn();

    // Schedule 5 rapid calls
    detector.schedule(callback);
    detector.schedule(callback);
    detector.schedule(callback);
    detector.schedule(callback);
    detector.schedule(callback);

    // None should execute yet
    expect(callback).not.toHaveBeenCalled();

    // Advance time
    vi.advanceTimersByTime(300);

    // Should execute only once
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should respect minimum interval', () => {
    const detector = new DebouncedDetector(100, 1000);
    const callback = vi.fn();

    // First call
    detector.schedule(callback);
    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(1);

    // Second call within min interval
    detector.schedule(callback);
    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(1); // Still 1, not 2

    // Wait for min interval
    vi.advanceTimersByTime(1000);
    detector.schedule(callback);
    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should cancel pending detection', () => {
    const detector = new DebouncedDetector(300);
    const callback = vi.fn();

    detector.schedule(callback);
    expect(detector.isPending()).toBe(true);

    detector.cancel();
    expect(detector.isPending()).toBe(false);

    vi.advanceTimersByTime(300);
    expect(callback).not.toHaveBeenCalled();
  });

  it('should flush immediately', () => {
    const detector = new DebouncedDetector(300);
    const callback = vi.fn();

    detector.schedule(callback);
    detector.flush(callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(detector.isPending()).toBe(false);
  });

  it('should handle multiple instances independently', () => {
    const detector1 = new DebouncedDetector(100);
    const detector2 = new DebouncedDetector(200);
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    detector1.schedule(callback1);
    detector2.schedule(callback2);

    vi.advanceTimersByTime(100);
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(callback2).toHaveBeenCalledTimes(1);
  });
});
