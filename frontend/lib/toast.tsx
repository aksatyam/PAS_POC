'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration: number;
  dismissing?: boolean;
}

interface ToastContextType {
  addToast: (toast: { type: ToastType; title: string; message?: string; duration?: number }) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} className="text-green-600 shrink-0" />,
  error: <XCircle size={18} className="text-red-600 shrink-0" />,
  warning: <AlertTriangle size={18} className="text-yellow-600 shrink-0" />,
  info: <Info size={18} className="text-blue-600 shrink-0" />,
};

const bgColors: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  warning: 'bg-yellow-50 border-yellow-200',
  info: 'bg-blue-50 border-blue-200',
};

const progressColors: Record<ToastType, string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, dismissing: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }, []);

  const addToast = useCallback(
    (opts: { type: ToastType; title: string; message?: string; duration?: number }) => {
      const id = `toast-${Date.now()}-${++counter.current}`;
      const duration = opts.duration ?? 4000;
      const toast: Toast = { id, type: opts.type, title: opts.title, message: opts.message, duration };

      setToasts((prev) => {
        const next = [...prev, toast];
        return next.length > 5 ? next.slice(-5) : next;
      });

      setTimeout(() => removeToast(id), duration);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: 380 }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto border rounded-lg shadow-enterprise-md p-3 flex items-start gap-3 ${bgColors[toast.type]} ${
              toast.dismissing ? 'animate-slide-out-right' : 'animate-slide-in-right'
            }`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
              {toast.message && <p className="text-xs text-gray-600 mt-0.5">{toast.message}</p>}
              {/* Progress bar */}
              <div className="mt-2 h-0.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${progressColors[toast.type]} rounded-full`}
                  style={{ animation: `progressShrink ${toast.duration}ms linear forwards` }}
                />
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
