import React from 'react';
import { NOTIFY_EVENT_NAME, NotifyEventDetail } from '../utils/notify';
import { v4 as uuidv4 } from 'uuid';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

const typeToColors: Record<Toast['type'], { bg: string; color: string; border: string }> = {
  success: { bg: '#ecfdf5', color: '#065f46', border: '#10b981' },
  error: { bg: '#fef2f2', color: '#991b1b', border: '#ef4444' },
  info: { bg: '#eff6ff', color: '#1e3a8a', border: '#3b82f6' },
  warning: { bg: '#fffbeb', color: '#92400e', border: '#f59e0b' },
};

export const Notifications: React.FC = () => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  React.useEffect(() => {
    function onNotify(e: Event) {
      const detail = (e as CustomEvent<NotifyEventDetail>).detail;
      if (!detail) return;
      const id = uuidv4();
      const toast: Toast = { id, type: detail.type, message: detail.message };
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    }

    window.addEventListener(NOTIFY_EVENT_NAME, onNotify as EventListener);
    return () => window.removeEventListener(NOTIFY_EVENT_NAME, onNotify as EventListener);
  }, []);

  return (
    <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map((t) => {
        const colors = typeToColors[t.type];
        return (
          <div key={t.id} style={{ background: colors.bg, color: colors.color, borderLeft: `4px solid ${colors.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: '10px 12px', borderRadius: 8, minWidth: 260, maxWidth: 420 }}>
            {t.message}
          </div>
        );
      })}
    </div>
  );
};
