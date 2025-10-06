/**
 * Debounced field detection utility
 * Prevents duplicate detections during rapid DOM mutations
 */

export class DebouncedDetector {
  private timeoutId: number | null = null;
  private lastDetection: number = 0;
  private readonly delay: number;
  private readonly minInterval: number;

  constructor(delay = 300, minInterval = 1000) {
    this.delay = delay;
    this.minInterval = minInterval;
  }

  /**
   * Schedule a detection callback with debounce
   */
  schedule(callback: () => void): void {
    // Clear existing timeout
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }

    // Check minimum interval
    const now = Date.now();
    if (now - this.lastDetection < this.minInterval) {
      // Too soon, schedule for later
      this.timeoutId = window.setTimeout(() => {
        this.execute(callback);
      }, this.delay);
      return;
    }

    // Schedule with delay
    this.timeoutId = window.setTimeout(() => {
      this.execute(callback);
    }, this.delay);
  }

  /**
   * Execute the callback and update last detection time
   */
  private execute(callback: () => void): void {
    this.lastDetection = Date.now();
    this.timeoutId = null;
    callback();
  }

  /**
   * Cancel pending detection
   */
  cancel(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Force immediate execution
   */
  flush(callback: () => void): void {
    this.cancel();
    this.execute(callback);
  }

  /**
   * Check if detection is pending
   */
  isPending(): boolean {
    return this.timeoutId !== null;
  }
}
