'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Badge variant style configuration.
 * Each variant defines background, text, border, and dark-mode overrides.
 */
const variantStyles = {
  default: 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  error: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
  info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  primary: 'bg-accent-50 text-accent-700 border-accent-200 dark:bg-accent-950 dark:text-accent-300 dark:border-accent-800',
  secondary: 'bg-secondary-50 text-secondary-700 border-secondary-200 dark:bg-secondary-950 dark:text-secondary-300 dark:border-secondary-800',
  outline: 'bg-transparent text-neutral-600 border-neutral-300 dark:text-neutral-400 dark:border-neutral-600',
} as const;

/** Dot indicator color per variant. */
const dotStyles = {
  default: 'bg-neutral-400 dark:bg-neutral-500',
  success: 'bg-emerald-500 dark:bg-emerald-400',
  warning: 'bg-amber-500 dark:bg-amber-400',
  error: 'bg-red-500 dark:bg-red-400',
  info: 'bg-blue-500 dark:bg-blue-400',
  primary: 'bg-accent-500 dark:bg-accent-400',
  secondary: 'bg-secondary-500 dark:bg-secondary-400',
  outline: 'bg-neutral-400 dark:bg-neutral-500',
} as const;

/** Size presets for padding, font-size, and dot dimensions. */
const sizeStyles = {
  sm: { badge: 'px-1.5 py-0.5 text-[10px] gap-1', dot: 'h-1.5 w-1.5', icon: 12 },
  md: { badge: 'px-2.5 py-0.5 text-xs gap-1.5', dot: 'h-2 w-2', icon: 14 },
  lg: { badge: 'px-3 py-1 text-sm gap-1.5', dot: 'h-2.5 w-2.5', icon: 16 },
} as const;

type BadgeVariant = keyof typeof variantStyles;
type BadgeSize = keyof typeof sizeStyles;

interface BadgeProps {
  /** Text content displayed inside the badge. */
  children: React.ReactNode;
  /** Visual style variant. */
  variant?: BadgeVariant;
  /** Badge sizing. */
  size?: BadgeSize;
  /** Show a colored dot indicator before the label. */
  dot?: boolean;
  /**
   * When provided, renders the badge as a circular count indicator.
   * The children value is displayed as a number inside a circle.
   */
  count?: boolean;
  /** Show a dismiss (X) button. Fires onRemove when clicked. */
  removable?: boolean;
  /** Callback when the remove button is clicked. */
  onRemove?: () => void;
  /** Additional class names. */
  className?: string;
}

/**
 * Badge - A versatile label component for status indicators, tags, and counts.
 *
 * @example
 * <Badge variant="success" dot>Active</Badge>
 * <Badge variant="error" count>5</Badge>
 * <Badge variant="info" removable onRemove={() => {}}>Filter</Badge>
 */
export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  count = false,
  removable = false,
  onRemove,
  className,
}: BadgeProps): React.ReactElement {
  const sizeConfig = sizeStyles[size];

  if (count) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full border font-semibold tabular-nums',
          'min-w-[20px] h-5 px-1.5 text-[10px]',
          size === 'lg' && 'min-w-[24px] h-6 px-2 text-xs',
          size === 'sm' && 'min-w-[16px] h-4 px-1 text-[9px]',
          variantStyles[variant],
          className,
        )}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium leading-none whitespace-nowrap',
        'transition-colors duration-micro',
        sizeConfig.badge,
        variantStyles[variant],
        className,
      )}
    >
      {dot && (
        <span
          className={cn('rounded-full shrink-0', sizeConfig.dot, dotStyles[variant])}
          aria-hidden="true"
        />
      )}
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className={cn(
            'inline-flex items-center justify-center rounded-full shrink-0',
            'hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-micro',
            '-mr-0.5 ml-0.5',
          )}
          aria-label="Remove"
        >
          <X size={sizeConfig.icon - 2} />
        </button>
      )}
    </span>
  );
}
