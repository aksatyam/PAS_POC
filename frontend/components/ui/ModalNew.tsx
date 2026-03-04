'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────

type ModalVariant = 'standard' | 'drawer';
type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface ModalNewProps {
  /** Whether the modal is visible. */
  isOpen: boolean;
  /** Callback fired when the modal requests to close. */
  onClose: () => void;
  /** Modal title displayed in the header. */
  title: string;
  /** Optional description rendered below the title. */
  description?: string;
  /** Primary body content. */
  children: ReactNode;
  /** Optional footer content (e.g. action buttons). */
  footer?: ReactNode;
  /**
   * Display variant.
   * - `standard`: centered dialog (default)
   * - `drawer`: slides in from the right edge
   */
  variant?: ModalVariant;
  /** Width preset for the dialog panel. */
  size?: ModalSize;
  /** Additional class names for the dialog panel. */
  className?: string;
}

// ── Constants ──────────────────────────────────────────────────────

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-[400px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[720px]',
  xl: 'max-w-[960px]',
};

const DRAWER_SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'w-[400px]',
  md: 'w-[560px]',
  lg: 'w-[720px]',
  xl: 'w-[960px]',
};

// ── Overlay Animation ──────────────────────────────────────────────

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// ── Standard (Centered) Animation ──────────────────────────────────

const standardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 8 },
};

// ── Drawer (Right-side) Animation ──────────────────────────────────

const drawerVariants = {
  hidden: { x: '100%' },
  visible: { x: 0 },
  exit: { x: '100%' },
};

// ── Focus Management ───────────────────────────────────────────────

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

function focusFirstElement(container: HTMLElement): void {
  const focusable = container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
  if (focusable) {
    // Defer to ensure the DOM has settled after animation start
    requestAnimationFrame(() => focusable.focus());
  }
}

// ── Component ──────────────────────────────────────────────────────

/**
 * Enhanced modal dialog with standard (centered) and drawer (right-side) variants.
 *
 * Features:
 * - Animated enter/exit via framer-motion
 * - Closes on backdrop click and Escape key
 * - Focus-traps the first focusable element on open
 * - Locks body scroll while open
 * - Supports dark mode
 *
 * @example
 * ```tsx
 * <ModalNew isOpen={open} onClose={() => setOpen(false)} title="Create Policy">
 *   <PolicyForm />
 * </ModalNew>
 *
 * <ModalNew variant="drawer" size="lg" isOpen={open} onClose={close} title="Details">
 *   <DetailPanel />
 * </ModalNew>
 * ```
 */
function ModalNew({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  variant = 'standard',
  size = 'md',
  className,
}: ModalNewProps): ReactNode {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2, 8)}`).current;

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Focus first focusable element when modal opens
  useEffect(() => {
    if (isOpen && panelRef.current) {
      focusFirstElement(panelRef.current);
    }
  }, [isOpen]);

  const handleOverlayClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const isDrawer = variant === 'drawer';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-modal">
          {/* Backdrop overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 dark:bg-black/70"
            aria-hidden="true"
          />

          {/* Positioning container */}
          <div
            className={cn(
              'absolute inset-0 overflow-y-auto',
              isDrawer
                ? 'flex justify-end'
                : 'flex items-center justify-center p-4',
            )}
            onClick={handleOverlayClick}
          >
            {/* Dialog panel */}
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              variants={isDrawer ? drawerVariants : standardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={
                isDrawer
                  ? { type: 'spring', stiffness: 400, damping: 35 }
                  : { type: 'spring', stiffness: 500, damping: 30, duration: 0.2 }
              }
              className={cn(
                'relative flex flex-col bg-white dark:bg-neutral-900',
                'shadow-elevation-4 overflow-hidden',
                isDrawer
                  ? cn('h-full', DRAWER_SIZE_CLASSES[size])
                  : cn('w-full rounded-xl', SIZE_CLASSES[size]),
                className,
              )}
            >
              {/* Header */}
              <div
                className={cn(
                  'shrink-0 flex items-start justify-between gap-4 px-6 py-4',
                  'border-b border-neutral-200 dark:border-neutral-700',
                  'bg-neutral-50 dark:bg-neutral-800/50',
                )}
              >
                <div className="min-w-0">
                  <h2
                    id={titleId}
                    className="text-h4 font-semibold text-neutral-900 dark:text-neutral-50 truncate"
                  >
                    {title}
                  </h2>
                  {description && (
                    <p className="mt-1 text-body-sm text-neutral-500 dark:text-neutral-400">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className={cn(
                    'shrink-0 p-1.5 rounded-lg transition-colors',
                    'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200',
                    'dark:text-neutral-500 dark:hover:text-neutral-300 dark:hover:bg-neutral-700',
                  )}
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div
                  className={cn(
                    'shrink-0 flex items-center justify-end gap-3 px-6 py-4',
                    'border-t border-neutral-200 dark:border-neutral-700',
                    'bg-neutral-50 dark:bg-neutral-800/50',
                  )}
                >
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ModalNew;
export type { ModalNewProps, ModalVariant, ModalSize };
