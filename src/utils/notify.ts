export type NotifyType = 'success' | 'error' | 'info' | 'warning';

export interface NotifyEventDetail {
  type: NotifyType;
  message: string;
}

export const NOTIFY_EVENT_NAME = 'app:notify';

export function notify(message: string, type: NotifyType = 'info'): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const detail: any = { type, message };
    window.dispatchEvent(new CustomEvent(NOTIFY_EVENT_NAME, { detail }));
  } catch {
    // Fallback to non-blocking console if CustomEvent unavailable
    // eslint-disable-next-line no-console
    console.warn(`[${type.toUpperCase()}] ${message}`);
  }
}

export const notifySuccess = (message: string): void => notify(message, 'success');
export const notifyError = (message: string): void => notify(message, 'error');
export const notifyInfo = (message: string): void => notify(message, 'info');
export const notifyWarning = (message: string): void => notify(message, 'warning');
