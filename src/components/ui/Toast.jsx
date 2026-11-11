import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { ToastContext } from './toast-context';

// Re-exported for existing imports (`import { useToast } from './ui/Toast'`).
// eslint-disable-next-line react/only-export-components
export { useToast } from './toast-context';

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    panel: 'bg-[#ECFDF5]',
    iconClass: 'text-[#059669]',
  },
  error: {
    icon: XCircle,
    panel: 'bg-[#FEE2E2]',
    iconClass: 'text-[#DC2626]',
  },
  warning: {
    icon: AlertTriangle,
    panel: 'bg-[#FEF3C7]',
    iconClass: 'text-[#B45309]',
  },
  info: {
    icon: Info,
    panel: 'bg-white',
    iconClass: 'text-[#2563EB]',
  },
};

const DEFAULT_DURATION = 4500;
let toastId = 0;

function ToastItem({ item, onDismiss }) {
  const variant = VARIANTS[item.variant] || VARIANTS.info;
  const Icon = variant.icon;
  const live = item.variant === 'error' ? 'assertive' : 'polite';

  return (
    <div
      role={item.variant === 'error' ? 'alert' : 'status'}
      aria-live={live}
      className={[
        'neo-toast pointer-events-auto flex w-full items-start gap-2.5 rounded-md border-3 border-[#1E2522] p-3 shadow-[4px_4px_0px_#1E2522]',
        variant.panel,
      ].join(' ')}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${variant.iconClass}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="break-words font-mono text-xs font-bold text-[#1E2522]">{item.message}</p>
        {item.description ? (
          <p className="mt-0.5 break-words font-mono text-[11px] text-gray-600">{item.description}</p>
        ) : null}
        {item.action ? <div className="mt-2">{item.action}</div> : null}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss notification"
        className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-transparent text-gray-600 transition-colors hover:border-[#1E2522] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E2522]"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * Provides the toast queue. Mount once near the app root.
 */
export function ToastProvider({ children, max = 4 }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const dismiss = useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (options) => {
      const normalized = typeof options === 'string' ? { message: options } : options || {};
      const id = (toastId += 1);
      const item = {
        id,
        message: normalized.message || '',
        description: normalized.description,
        action: normalized.action,
        variant: normalized.variant || 'info',
        duration: normalized.duration ?? DEFAULT_DURATION,
      };

      setToasts((prev) => [...prev, item].slice(-max));

      if (item.duration > 0) {
        const timer = setTimeout(() => dismiss(id), item.duration);
        timersRef.current.set(id, timer);
      }
      return id;
    },
    [dismiss, max],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const api = useMemo(() => {
    const variantToast = (variant) => (message, options = {}) => toast({ ...options, message, variant });
    return {
      toast,
      success: variantToast('success'),
      error: variantToast('error'),
      warning: variantToast('warning'),
      info: variantToast('info'),
      dismiss,
    };
  }, [toast, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex flex-col items-end gap-2 p-3 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-96"
          aria-label="Notifications"
        >
          {toasts.map((item) => (
            <ToastItem key={item.id} item={item} onDismiss={dismiss} />
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}
