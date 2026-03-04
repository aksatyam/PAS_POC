'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
  createdAt: number;
}

interface ToastAPI {
  /** Show a success toast notification. */
  success: (message: string, duration?: number) => void;
  /** Show an error toast notification. */
  error: (message: string, duration?: number) => void;
  /** Show a warning toast notification. */
  warning: (message: string, duration?: number) => void;
  /** Show an informational toast notification. */
  info: (message: string, duration?: number) => void;
  /** Dismiss a specific toast by ID. */
  dismiss: (id: string) => void;
  /** Dismiss all active toasts. */
  dismissAll: () => void;
}

// ── Constants ──────────────────────────────────────────────────────

const MAX_VISIBLE_TOASTS = 5;
const DEFAULT_DURATION = 5000;

const TOAST_ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
} as const;

const TOAST_STYLES = {
  success: {
    container:
      'border-l-4 border-l-success bg-green-50 dark:bg-green-950/40 dark:border-l-green-400',
    icon: 'text-success dark:text-green-400',
    progress: 'bg-success dark:bg-green-400',
  },
  error: {
    container:
      'border-l-4 border-l-error bg-red-50 dark:bg-red-950/40 dark:border-l-red-400',
    icon: 'text-error dark:text-red-400',
    progress: 'bg-error dark:bg-red-400',
  },
  warning: {
    container:
      'border-l-4 border-l-warning bg-amber-50 dark:bg-amber-950/40 dark:border-l-amber-400',
    icon: 'text-warning dark:text-amber-400',
    progress: 'bg-warning dark:bg-amber-400',
  },
  info: {
    container:
      'border-l-4 border-l-info bg-blue-50 dark:bg-blue-950/40 dark:border-l-blue-400',
    icon: 'text-info dark:text-blue-400',
    progress: 'bg-info dark:bg-blue-400',
  },
} as const;

// ── Context ────────────────────────────────────────────────────────

const ToastContext = createContext<ToastAPI | null>(null);

/**
 * Access the toast notification API.
 *
 * Must be called within a `<ToastProvider>`.
 *
 * @example
 * ```tsx
 * const toast = useToast();
 * toast.success('Policy created');
 * toast.error('Failed to save endorsement');
 * ```
 */
function useToast(): ToastAPI {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// ── Progress Bar ───────────────────────────────────────────────────

interface ProgressBarProps {
  duration: number;
  createdAt: number;
  type: ToastType;
  onComplete: () => void;
}

function ProgressBar({ duration, createdAt, type, onComplete }: ProgressBarProps): ReactNode {
  const [progress, setProgress] = useState(100);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    function tick(): void {
      const elapsed = Date.now() - createdAt;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        onComplete();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [duration, createdAt, onComplete]);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-200 dark:bg-neutral-700 overflow-hidden rounded-b-lg">
      <div
        className={cn('h-full transition-none', TOAST_STYLES[type].progress)}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// ── Single Toast Item ──────────────────────────────────────────────

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps): ReactNode {
  const Icon = TOAST_ICONS[toast.type];
  const styles = TOAST_STYLES[toast.type];

  const handleDismiss = useCallback(() => {
    onDismiss(toast.id);
  }, [onDismiss, toast.id]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      role="alert"
      aria-live="polite"
      className={cn(
        'relative w-80 rounded-lg shadow-elevation-3 overflow-hidden pointer-events-auto',
        'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700',
        styles.container,
      )}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <Icon size={18} className={cn('shrink-0 mt-0.5', styles.icon)} />
        <p className="flex-1 text-body-sm text-neutral-800 dark:text-neutral-100">
          {toast.message}
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          className={cn(
            'shrink-0 p-0.5 rounded-md transition-colors',
            'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100',
            'dark:text-neutral-500 dark:hover:text-neutral-300 dark:hover:bg-neutral-700',
          )}
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      </div>
      <ProgressBar
        duration={toast.duration}
        createdAt={toast.createdAt}
        type={toast.type}
        onComplete={handleDismiss}
      />
    </motion.div>
  );
}

// ── Provider ───────────────────────────────────────────────────────

interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Provides the toast notification context to the application.
 *
 * Wrap your root layout with this provider to enable toast notifications
 * throughout the application.
 *
 * @example
 * ```tsx
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * ```
 */
function ToastProvider({ children }: ToastProviderProps): ReactNode {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration: number = DEFAULT_DURATION) => {
      counterRef.current += 1;
      const id = `toast-${counterRef.current}-${Date.now()}`;

      const newToast: Toast = {
        id,
        type,
        message,
        duration,
        createdAt: Date.now(),
      };

      setToasts((prev) => {
        const next = [...prev, newToast];
        if (next.length > MAX_VISIBLE_TOASTS) {
          return next.slice(next.length - MAX_VISIBLE_TOASTS);
        }
        return next;
      });
    },
    [],
  );

  const api = useRef<ToastAPI>({
    success: (message, duration) => addToast('success', message, duration),
    error: (message, duration) => addToast('error', message, duration),
    warning: (message, duration) => addToast('warning', message, duration),
    info: (message, duration) => addToast('info', message, duration),
    dismiss,
    dismissAll,
  });

  // Keep the ref callbacks in sync without recreating the object
  useEffect(() => {
    api.current.success = (message, duration) => addToast('success', message, duration);
    api.current.error = (message, duration) => addToast('error', message, duration);
    api.current.warning = (message, duration) => addToast('warning', message, duration);
    api.current.info = (message, duration) => addToast('info', message, duration);
    api.current.dismiss = dismiss;
    api.current.dismissAll = dismissAll;
  }, [addToast, dismiss, dismissAll]);

  return (
    <ToastContext.Provider value={api.current}>
      {children}
      <div
        aria-label="Notifications"
        className="fixed top-4 right-4 z-toast flex flex-col gap-3 pointer-events-none"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export { ToastProvider, useToast };
export type { ToastType, ToastAPI };
