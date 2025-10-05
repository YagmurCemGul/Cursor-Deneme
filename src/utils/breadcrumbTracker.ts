/**
 * Breadcrumb tracker for capturing user actions
 * Helps understand the sequence of events leading to errors
 */

import { ErrorBreadcrumb } from '../types';
import { logger } from './logger';

const MAX_BREADCRUMBS = 50; // Keep last 50 breadcrumbs

class BreadcrumbTracker {
  private breadcrumbs: ErrorBreadcrumb[] = [];

  /**
   * Add a breadcrumb to the trail
   */
  addBreadcrumb(breadcrumb: Omit<ErrorBreadcrumb, 'timestamp'>): void {
    const fullBreadcrumb: ErrorBreadcrumb = {
      ...breadcrumb,
      timestamp: new Date().toISOString(),
    };

    this.breadcrumbs.push(fullBreadcrumb);

    // Keep only the last MAX_BREADCRUMBS
    if (this.breadcrumbs.length > MAX_BREADCRUMBS) {
      this.breadcrumbs = this.breadcrumbs.slice(-MAX_BREADCRUMBS);
    }

    logger.debug('Breadcrumb added:', fullBreadcrumb);
  }

  /**
   * Track navigation events
   */
  trackNavigation(to: string, from?: string): void {
    this.addBreadcrumb({
      type: 'navigation',
      category: 'navigation',
      message: `Navigated to ${to}`,
      data: { to, from },
    });
  }

  /**
   * Track click events
   */
  trackClick(element: string, label?: string): void {
    this.addBreadcrumb({
      type: 'click',
      category: 'user-interaction',
      message: `Clicked ${label || element}`,
      data: { element, label },
    });
  }

  /**
   * Track input events
   */
  trackInput(field: string, value?: any): void {
    this.addBreadcrumb({
      type: 'input',
      category: 'user-interaction',
      message: `Input to ${field}`,
      data: { field, hasValue: !!value },
    });
  }

  /**
   * Track API calls
   */
  trackAPI(method: string, url: string, status?: number): void {
    this.addBreadcrumb({
      type: 'api',
      category: 'network',
      message: `${method} ${url}`,
      data: { method, url, status },
    });
  }

  /**
   * Track errors
   */
  trackError(error: string, component?: string): void {
    this.addBreadcrumb({
      type: 'error',
      category: 'error',
      message: error,
      data: { component },
    });
  }

  /**
   * Get all breadcrumbs
   */
  getBreadcrumbs(): ErrorBreadcrumb[] {
    return [...this.breadcrumbs];
  }

  /**
   * Get breadcrumbs from the last N minutes
   */
  getRecentBreadcrumbs(minutes: number = 5): ErrorBreadcrumb[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.breadcrumbs.filter(
      (b) => new Date(b.timestamp) >= cutoff
    );
  }

  /**
   * Clear all breadcrumbs
   */
  clear(): void {
    this.breadcrumbs = [];
  }

  /**
   * Initialize automatic tracking
   */
  initializeAutoTracking(): void {
    // Track clicks
    if (typeof document !== 'undefined') {
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        const label =
          target.getAttribute('aria-label') ||
          target.textContent?.trim() ||
          target.tagName;
        this.trackClick(target.tagName, label);
      });

      // Track form inputs (debounced)
      let inputTimeout: NodeJS.Timeout;
      document.addEventListener('input', (event) => {
        const target = event.target as HTMLInputElement;
        clearTimeout(inputTimeout);
        inputTimeout = setTimeout(() => {
          this.trackInput(
            target.name || target.id || target.placeholder || 'unknown',
            target.value
          );
        }, 1000);
      });
    }

    logger.info('Breadcrumb auto-tracking initialized');
  }
}

// Export singleton instance
export const breadcrumbTracker = new BreadcrumbTracker();
