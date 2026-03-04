'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Size variant configuration for the Input component.
 * Maps each size to its corresponding height and font-size classes.
 */
const sizeClasses = {
  sm: 'h-8 text-body-sm',
  md: 'h-10 text-body-sm',
  lg: 'h-12 text-body',
} as const;

/** Props for the {@link Input} component. */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Text label rendered above the input field. */
  label?: string;
  /** Helper text displayed below the input when there is no error. */
  helperText?: string;
  /** Error message displayed below the input. Triggers error styling when set. */
  error?: string;
  /** Icon or element rendered inside the input on the left side. */
  leftIcon?: React.ReactNode;
  /** Icon or element rendered inside the input on the right side. */
  rightIcon?: React.ReactNode;
  /** Size variant controlling input height and text size. Defaults to `"md"`. */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class names applied to the outermost wrapper element. */
  wrapperClassName?: string;
}

/**
 * A form input component for the IMGC PAS enterprise insurance system.
 *
 * Supports labels, helper text, error states, left/right icons, size variants,
 * disabled states, required indicators, and dark mode.
 *
 * @example
 * ```tsx
 * <Input
 *   label="Policy Number"
 *   placeholder="Enter policy number"
 *   required
 *   leftIcon={<FileText size={16} />}
 *   error={errors.policyNumber}
 * />
 * ```
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    helperText,
    error,
    leftIcon,
    rightIcon,
    size = 'md',
    disabled,
    required,
    className,
    wrapperClassName,
    id,
    ...rest
  },
  ref,
) {
  const inputId = id ?? (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const hasError = Boolean(error);

  return (
    <div className={cn('flex flex-col gap-1', wrapperClassName)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            'text-body-sm font-medium text-neutral-700',
            'dark:text-neutral-300',
            disabled && 'text-neutral-400 dark:text-neutral-500',
          )}
        >
          {label}
          {required && <span className="ml-0.5 text-error">*</span>}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative flex items-center">
        {/* Left icon */}
        {leftIcon && (
          <span
            className={cn(
              'pointer-events-none absolute left-3 flex items-center text-neutral-400',
              'dark:text-neutral-500',
              hasError && 'text-error',
            )}
          >
            {leftIcon}
          </span>
        )}

        {/* Input element */}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={
            hasError
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
          className={cn(
            // Base
            'w-full rounded-md border bg-white px-3 transition-colors duration-fast',
            'placeholder:text-neutral-400',
            // Size
            sizeClasses[size],
            // Default border
            'border-neutral-300 dark:border-neutral-600',
            // Dark mode background & text
            'dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500',
            // Hover
            'hover:border-neutral-400 dark:hover:border-neutral-500',
            // Focus
            'focus:outline-none focus:border-primary-500 focus:shadow-focus-ring',
            'dark:focus:border-secondary-400 dark:focus:shadow-focus-ring-dark',
            // Error
            hasError && 'border-error hover:border-error focus:border-error focus:shadow-focus-error',
            // Disabled
            disabled && 'cursor-not-allowed bg-neutral-100 text-neutral-400 dark:bg-neutral-900 dark:text-neutral-500',
            // Icon padding adjustments
            leftIcon && 'pl-9',
            rightIcon && 'pr-9',
            className,
          )}
          {...rest}
        />

        {/* Right icon */}
        {rightIcon && (
          <span
            className={cn(
              'pointer-events-none absolute right-3 flex items-center text-neutral-400',
              'dark:text-neutral-500',
              hasError && 'text-error',
            )}
          >
            {rightIcon}
          </span>
        )}
      </div>

      {/* Error message */}
      {hasError && (
        <p id={`${inputId}-error`} role="alert" className="text-small text-error">
          {error}
        </p>
      )}

      {/* Helper text (hidden when error is shown) */}
      {!hasError && helperText && (
        <p id={`${inputId}-helper`} className="text-small text-neutral-500 dark:text-neutral-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Input;
