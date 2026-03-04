'use client';

import { useEffect } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen, onClose, onConfirm, title, message,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'default', isLoading = false,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape' && !isLoading) onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', handleEsc); };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const confirmClass =
    variant === 'danger' ? 'btn-danger' :
    variant === 'warning' ? 'bg-yellow-500 text-white px-5 py-2 rounded font-medium hover:bg-yellow-600 transition-colors text-sm' :
    'btn-primary';

  const iconBg =
    variant === 'danger' ? 'bg-red-50' :
    variant === 'warning' ? 'bg-yellow-50' : 'bg-primary-50';

  const iconColor =
    variant === 'danger' ? 'text-red-500' :
    variant === 'warning' ? 'text-yellow-500' : 'text-imgc-orange';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={isLoading ? undefined : onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-lg shadow-xl w-full max-w-md animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className={`shrink-0 p-2 rounded-full ${iconBg}`}>
              <AlertTriangle size={20} className={iconColor} />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 mt-1">{message}</p>
            </div>
            <button onClick={onClose} disabled={isLoading} className="text-gray-400 hover:text-gray-600 disabled:opacity-50">
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-5 py-3 bg-gray-50 rounded-b-lg border-t border-gray-100">
          <button onClick={onClose} disabled={isLoading} className="btn-secondary">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} disabled={isLoading} className={`${confirmClass} inline-flex items-center gap-2`}>
            {isLoading && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
