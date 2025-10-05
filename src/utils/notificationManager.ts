/**
 * Notification Manager
 * Smart notifications for rate limits, budgets, and provider events
 * 
 * @module notificationManager
 * @description Proactive notification system with intelligent alerts
 */

import { logger } from './logger';
import { AIProvider } from './aiProviders';
import { BudgetAlert } from './budgetManager';
import { UsageStats } from './rateLimitTracker';

/**
 * Notification type
 */
export type NotificationType = 
  | 'rate_limit_warning'
  | 'rate_limit_critical'
  | 'rate_limit_exceeded'
  | 'budget_warning'
  | 'budget_critical'
  | 'budget_exceeded'
  | 'provider_fallback'
  | 'cost_saving_tip'
  | 'success'
  | 'error'
  | 'info';

/**
 * Notification level
 */
export type NotificationLevel = 'info' | 'success' | 'warning' | 'error';

/**
 * Notification
 */
export interface Notification {
  id: string;
  type: NotificationType;
  level: NotificationLevel;
  title: string;
  message: string;
  timestamp: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  autoDismiss?: number; // milliseconds
}

/**
 * Notification Manager
 * Manages and displays smart notifications
 */
export class NotificationManager {
  private notifications: Notification[] = [];
  private listeners: Set<(notifications: Notification[]) => void> = new Set();
  private shownAlerts = new Set<string>();
  private cooldowns = new Map<string, number>(); // Prevent notification spam

  constructor() {
    logger.info('Notification manager initialized');
    
    // Listen for budget alerts
    if (typeof window !== 'undefined') {
      window.addEventListener('budgetAlert', ((event: CustomEvent<BudgetAlert>) => {
        this.showBudgetAlert(event.detail);
      }) as EventListener);

      // Listen for provider fallback
      window.addEventListener('providerFallback', ((event: CustomEvent<any>) => {
        this.showProviderSwitch(event.detail.from, event.detail.to, event.detail.reason);
      }) as EventListener);
    }
  }

  /**
   * Show rate limit warning
   */
  showRateLimitWarning(stats: UsageStats, provider: string = 'API'): void {
    const maxUsage = Math.max(
      stats.rpmUsagePercent,
      stats.tpmUsagePercent,
      stats.rpdUsagePercent,
      stats.tpdUsagePercent
    );

    // Don't spam notifications
    const alertKey = `rate_limit_${Math.floor(maxUsage / 10)}`;
    if (this.isOnCooldown(alertKey, 60000)) { // 1 minute cooldown
      return;
    }

    let type: NotificationType;
    let level: NotificationLevel;
    let title: string;
    let message: string;

    if (maxUsage >= 95) {
      type = 'rate_limit_critical';
      level = 'error';
      title = '🚨 Rate Limit Critical';
      message = `${provider} rate limit at ${maxUsage.toFixed(0)}%! Next request may fail.`;
    } else if (maxUsage >= 80) {
      type = 'rate_limit_warning';
      level = 'warning';
      title = '⚠️ Rate Limit Warning';
      message = `${provider} rate limit at ${maxUsage.toFixed(0)}%. Please slow down requests.`;
    } else if (maxUsage >= 60) {
      type = 'rate_limit_warning';
      level = 'info';
      title = 'ℹ️ Rate Limit Notice';
      message = `${provider} rate limit at ${maxUsage.toFixed(0)}%. You're using resources quickly.`;
    } else {
      return; // Don't notify below 60%
    }

    this.addNotification({
      type,
      level,
      title,
      message,
      dismissible: true,
      autoDismiss: 10000
    });

    this.setCooldown(alertKey);
  }

  /**
   * Show budget alert
   */
  showBudgetAlert(alert: BudgetAlert): void {
    const alertKey = `budget_${alert.level}`;
    if (this.isOnCooldown(alertKey, 300000)) { // 5 minute cooldown
      return;
    }

    let type: NotificationType;
    let level: NotificationLevel;
    let icon: string;

    switch (alert.level) {
      case 'exceeded':
        type = 'budget_exceeded';
        level = 'error';
        icon = '🚫';
        break;
      case 'critical':
        type = 'budget_critical';
        level = 'error';
        icon = '⚠️';
        break;
      case 'warning':
        type = 'budget_warning';
        level = 'warning';
        icon = '💰';
        break;
      default:
        type = 'budget_warning';
        level = 'info';
        icon = 'ℹ️';
    }

    this.addNotification({
      type,
      level,
      title: `${icon} Budget ${alert.level === 'exceeded' ? 'Exceeded' : 'Alert'}`,
      message: alert.message,
      dismissible: true,
      autoDismiss: alert.level === 'exceeded' ? undefined : 15000,
      action: {
        label: 'View Details',
        onClick: () => {
          // Open usage dashboard or settings
          logger.info('Opening usage dashboard');
        }
      }
    });

    this.setCooldown(alertKey);
  }

  /**
   * Show provider switch notification
   */
  showProviderSwitch(from: AIProvider, to: AIProvider, reason: string): void {
    const alertKey = `provider_switch_${from}_${to}`;
    if (this.isOnCooldown(alertKey, 60000)) { // 1 minute cooldown
      return;
    }

    this.addNotification({
      type: 'provider_fallback',
      level: 'info',
      title: '🔄 Provider Switched',
      message: `Switched from ${from} to ${to} due to ${reason}. Your request is being processed.`,
      dismissible: true,
      autoDismiss: 8000
    });

    this.setCooldown(alertKey);
  }

  /**
   * Show cost saving tip
   */
  showCostSavingTip(message: string, potentialSaving: number): void {
    const alertKey = 'cost_saving_tip';
    if (this.isOnCooldown(alertKey, 3600000)) { // 1 hour cooldown
      return;
    }

    this.addNotification({
      type: 'cost_saving_tip',
      level: 'info',
      title: '💡 Cost Saving Tip',
      message: `${message} (Save ~$${potentialSaving.toFixed(2)})`,
      dismissible: true,
      autoDismiss: 20000
    });

    this.setCooldown(alertKey);
  }

  /**
   * Show success notification
   */
  showSuccess(title: string, message: string, autoDismiss: number = 5000): void {
    this.addNotification({
      type: 'success',
      level: 'success',
      title: `✅ ${title}`,
      message,
      dismissible: true,
      autoDismiss
    });
  }

  /**
   * Show error notification
   */
  showError(title: string, message: string, dismissible: boolean = true): void {
    this.addNotification({
      type: 'error',
      level: 'error',
      title: `❌ ${title}`,
      message,
      dismissible
    });
  }

  /**
   * Show info notification
   */
  showInfo(title: string, message: string, autoDismiss: number = 8000): void {
    this.addNotification({
      type: 'info',
      level: 'info',
      title,
      message,
      dismissible: true,
      autoDismiss
    });
  }

  /**
   * Show request completed notification
   */
  showRequestCompleted(operation: string, cost: number, duration: number): void {
    this.showSuccess(
      'Request Completed',
      `${operation} completed in ${duration}ms. Cost: $${cost.toFixed(4)}`,
      3000
    );
  }

  /**
   * Show rate limit wait notification
   */
  showRateLimitWait(waitTimeMs: number): void {
    const seconds = Math.ceil(waitTimeMs / 1000);
    this.showInfo(
      '⏱️ Rate Limit Wait',
      `Waiting ${seconds} second${seconds !== 1 ? 's' : ''} to respect rate limits...`,
      waitTimeMs
    );
  }

  /**
   * Add notification
   */
  private addNotification(config: Omit<Notification, 'id' | 'timestamp'>): void {
    const notification: Notification = {
      id: this.generateId(),
      timestamp: Date.now(),
      ...config
    };

    this.notifications.push(notification);
    this.notifyListeners();

    logger.debug(`Notification added: ${notification.title}`);

    // Auto-dismiss if configured
    if (notification.autoDismiss) {
      setTimeout(() => {
        this.dismiss(notification.id);
      }, notification.autoDismiss);
    }

    // Emit browser notification if supported
    if (this.shouldShowBrowserNotification(notification.level)) {
      this.showBrowserNotification(notification);
    }
  }

  /**
   * Dismiss notification
   */
  dismiss(id: string): void {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.notifyListeners();
      logger.debug(`Notification dismissed: ${id}`);
    }
  }

  /**
   * Dismiss all notifications
   */
  dismissAll(): void {
    this.notifications = [];
    this.notifyListeners();
    logger.debug('All notifications dismissed');
  }

  /**
   * Get all notifications
   */
  getAll(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Subscribe to notifications
   */
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener([...this.notifications]);
      } catch (error) {
        logger.error('Error in notification listener:', error);
      }
    });
  }

  /**
   * Check if alert is on cooldown
   */
  private isOnCooldown(key: string, cooldownMs: number): boolean {
    const lastShown = this.cooldowns.get(key);
    if (!lastShown) return false;
    
    return (Date.now() - lastShown) < cooldownMs;
  }

  /**
   * Set cooldown for alert
   */
  private setCooldown(key: string): void {
    this.cooldowns.set(key, Date.now());
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if browser notification should be shown
   */
  private shouldShowBrowserNotification(level: NotificationLevel): boolean {
    // Only show browser notifications for warnings and errors
    return (level === 'warning' || level === 'error') && 
           typeof Notification !== 'undefined' &&
           Notification.permission === 'granted';
  }

  /**
   * Show browser notification
   */
  private showBrowserNotification(notification: Notification): void {
    try {
      new Notification(notification.title, {
        body: notification.message,
        icon: chrome.runtime?.getURL('icons/icon128.png'),
        badge: chrome.runtime?.getURL('icons/icon48.png')
      });
    } catch (error) {
      logger.debug('Failed to show browser notification:', error);
    }
  }
}

/**
 * Global instance
 */
let globalNotificationManager: NotificationManager | null = null;

/**
 * Get or create global notification manager
 */
export function getNotificationManager(): NotificationManager {
  if (!globalNotificationManager) {
    globalNotificationManager = new NotificationManager();
  }
  return globalNotificationManager;
}

/**
 * Helper functions
 */
export const notifications = {
  showRateLimitWarning: (stats: UsageStats, provider?: string) => 
    getNotificationManager().showRateLimitWarning(stats, provider),
  
  showBudgetAlert: (alert: BudgetAlert) => 
    getNotificationManager().showBudgetAlert(alert),
  
  showProviderSwitch: (from: AIProvider, to: AIProvider, reason: string) => 
    getNotificationManager().showProviderSwitch(from, to, reason),
  
  showCostSavingTip: (message: string, potentialSaving: number) => 
    getNotificationManager().showCostSavingTip(message, potentialSaving),
  
  showSuccess: (title: string, message: string, autoDismiss?: number) => 
    getNotificationManager().showSuccess(title, message, autoDismiss),
  
  showError: (title: string, message: string, dismissible?: boolean) => 
    getNotificationManager().showError(title, message, dismissible),
  
  showInfo: (title: string, message: string, autoDismiss?: number) => 
    getNotificationManager().showInfo(title, message, autoDismiss),
  
  showRequestCompleted: (operation: string, cost: number, duration: number) => 
    getNotificationManager().showRequestCompleted(operation, cost, duration),
  
  showRateLimitWait: (waitTimeMs: number) => 
    getNotificationManager().showRateLimitWait(waitTimeMs)
};
