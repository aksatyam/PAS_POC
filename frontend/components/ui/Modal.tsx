'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

const sizeClasses = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export default function Modal({ isOpen, onClose, title, children, size = 'md', footer }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', handleEsc); };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="absolute inset-0 bg-black/50" />
      <div className={cn('relative bg-white rounded shadow-xl w-full overflow-hidden animate-scale-in', sizeClasses[size])}>
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-imgc-orange to-imgc-orange-light">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded text-white"><X size={18} /></button>
        </div>
        <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 px-5 py-3 bg-gray-50 border-t border-gray-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
