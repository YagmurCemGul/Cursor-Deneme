/**
 * Toast notification service for displaying user feedback messages
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

class ToastService {
  private container: HTMLDivElement | null = null;

  /**
   * Initialize toast container
   */
  private ensureContainer(): HTMLDivElement {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
      `;
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  /**
   * Show a toast notification
   */
  show({ message, type = 'info', duration = 3000 }: ToastOptions): void {
    const container = this.ensureContainer();
    const toast = document.createElement('div');
    
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      info: '#3b82f6',
      warning: '#f59e0b',
    };

    toast.style.cssText = `
      background: ${colors[type]};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 300px;
      word-wrap: break-word;
      animation: slideIn 0.3s ease-out;
      font-size: 14px;
      line-height: 1.5;
    `;
    
    toast.textContent = message;
    container.appendChild(toast);

    // Auto remove after duration
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        container.removeChild(toast);
      }, 300);
    }, duration);
  }

  /**
   * Show success toast
   */
  success(message: string, duration?: number): void {
    this.show({ message, type: 'success', duration });
  }

  /**
   * Show error toast
   */
  error(message: string, duration?: number): void {
    this.show({ message, type: 'error', duration });
  }

  /**
   * Show info toast
   */
  info(message: string, duration?: number): void {
    this.show({ message, type: 'info', duration });
  }

  /**
   * Show warning toast
   */
  warning(message: string, duration?: number): void {
    this.show({ message, type: 'warning', duration });
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

export const toastService = new ToastService();
