'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Variant + Size class maps
// ---------------------------------------------------------------------------

const variantClasses: Record<ButtonVariant, string> = {
  primary: cn(
    'bg-accent-500 text-white',
    'hover:bg-accent-600',
    'active:bg-accent-700',
    'dark:bg-accent-400 dark:text-accent-950 dark:hover:bg-accent-300',
  ),
  secondary: cn(
    'bg-secondary-500 text-white',
    'hover:bg-secondary-600',
    'active:bg-secondary-700',
    'dark:bg-secondary-400 dark:text-secondary-950 dark:hover:bg-secondary-300',
  ),
  outline: cn(
    'border border-accent-300 text-accent-600 bg-transparent',
    'hover:bg-accent-50 hover:border-accent-400',
    'active:bg-accent-100',
    'dark:border-accent-500 dark:text-accent-200',
    'dark:hover:bg-accent-900/40 dark:hover:border-accent-400',
  ),
  ghost: cn(
    'bg-transparent text-neutral-700',
    'hover:bg-neutral-100',
    'active:bg-neutral-200',
    'dark:text-neutral-200 dark:hover:bg-neutral-800 dark:active:bg-neutral-700',
  ),
  destructive: cn(
    'bg-red-600 text-white',
    'hover:bg-red-700',
    'active:bg-red-800',
    'dark:bg-red-500 dark:hover:bg-red-400',
  ),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-body-sm gap-1.5 rounded-md',
  md: 'h-10 px-4 text-body-sm gap-2 rounded-md',
  lg: 'h-12 px-6 text-body gap-2.5 rounded-lg',
};

const iconSizes: Record<ButtonSize, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Props for the Button component.
 *
 * @property variant   - Visual style of the button. Defaults to `"primary"`.
 * @property size      - Predefined sizing tier. Defaults to `"md"`.
 * @property isLoading - When `true`, shows a spinner and disables interaction.
 * @property leftIcon  - A React node rendered before the label.
 * @property rightIcon - A React node rendered after the label.
 * @property fullWidth - Stretches the button to 100% of its container.
 */
interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Production-grade Button with variant theming, loading state, icon slots,
 * keyboard-accessible focus rings, dark mode support, and Framer Motion
 * press animation.
 *
 * @example
 * ```tsx
 * <Button variant="primary" leftIcon={<Plus size={16} />}>
 *   New Policy
 * </Button>
 *
 * <Button variant="destructive" isLoading>
 *   Deleting...
 * </Button>
 * ```
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    className,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || isLoading;

  // We cast the motion.button props because forwardRef + motion.button
  // requires aligning native HTML attrs with Framer Motion's types.
  const motionProps: HTMLMotionProps<'button'> = {
    whileTap: isDisabled ? undefined : { scale: 0.98 },
    transition: { type: 'spring', stiffness: 500, damping: 30 },
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      aria-busy={isLoading || undefined}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center font-medium',
        'select-none whitespace-nowrap',
        'transition-colors duration-micro ease-out-custom',

        // Focus ring (keyboard accessible)
        'focus-visible:outline-none focus-visible:shadow-focus-ring',
        'dark:focus-visible:shadow-focus-ring-dark',

        // Disabled
        'disabled:pointer-events-none disabled:opacity-50',

        // Variant + size
        variantClasses[variant],
        sizeClasses[size],

        // Full width
        fullWidth && 'w-full',

        // Caller overrides
        className,
      )}
      {...motionProps}
      {...(rest as HTMLMotionProps<'button'>)}
    >
      {isLoading && (
        <Loader2
          size={iconSizes[size]}
          className="animate-spin shrink-0"
          aria-hidden="true"
        />
      )}

      {!isLoading && leftIcon && (
        <span className="shrink-0" aria-hidden="true">
          {leftIcon}
        </span>
      )}

      <span className={cn(isLoading && 'opacity-0 w-0 overflow-hidden')}>
        {children}
      </span>

      {!isLoading && rightIcon && (
        <span className="shrink-0" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
export default Button;
