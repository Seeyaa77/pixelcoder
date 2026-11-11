import { createContext, useContext, useMemo, useRef } from 'react';

export const ToastContext = createContext(null);

/**
 * Access the toast queue. Safe to call outside a provider: notifications
 * become no-ops and a single console warning is emitted.
 *
 * @returns {{
 *   toast: (options: string | {message: string, description?: string, variant?: 'success'|'error'|'warning'|'info', duration?: number, action?: React.ReactNode}) => number,
 *   success: (message: string, options?: object) => number,
 *   error: (message: string, options?: object) => number,
 *   warning: (message: string, options?: object) => number,
 *   info: (message: string, options?: object) => number,
 *   dismiss: (id: number) => void,
 * }}
 */
export function useToast() {
  const context = useContext(ToastContext);
  const fallbackWarned = useRef(false);

  const fallback = useMemo(() => {
    const warn = () => {
      if (!fallbackWarned.current) {
        fallbackWarned.current = true;
        console.warn('useToast() was called outside of <ToastProvider>; notifications are disabled.');
      }
    };
    const noop = () => {
      warn();
      return -1;
    };
    return { toast: noop, success: noop, error: noop, warning: noop, info: noop, dismiss: () => {} };
  }, []);

  return context || fallback;
}
