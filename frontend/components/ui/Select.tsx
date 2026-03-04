'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Size variant configuration for the Select component.
 * Maps each size to its corresponding height and font-size classes.
 */
const sizeClasses = {
  sm: 'h-8 text-body-sm',
  md: 'h-10 text-body-sm',
  lg: 'h-12 text-body',
} as const;

/** A single option entry for the Select component. */
export interface SelectOption {
  /** The value submitted with the form. */
  value: string;
  /** The human-readable label displayed in the dropdown. */
  label: string;
  /** Whether this option is disabled. */
  disabled?: boolean;
}

/** Props for the {@link Select} component. */
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Text label rendered above the select field. */
  label?: string;
  /** Helper text displayed below the select when there is no error. */
  helperText?: string;
  /** Error message displayed below the select. Triggers error styling when set. */
  error?: string;
  /** Placeholder text shown as the first disabled option. */
  placeholder?: string;
  /**
   * Options rendered inside the select.
   * When provided, these are rendered alongside any `children` passed to the component.
   * If both `options` and `children` are supplied, `options` are rendered first.
   */
  options?: SelectOption[];
  /** Size variant controlling select height and text size. Defaults to `"md"`. */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class names applied to the outermost wrapper element. */
  wrapperClassName?: string;
}

/**
 * A native select wrapper for the IMGC PAS enterprise insurance system.
 *
 * Provides consistent styling with labels, helper text, error states,
 * a custom Lucide chevron icon, size variants, and dark mode support.
 * Options can be passed either via the `options` prop or as `children`.
 *
 * @example
 * ```tsx
 * <Select
 *   label="Policy Type"
 *   placeholder="Select a policy type"
 *   required
 *   options={[
 *     { value: 'auto', label: 'Auto Insurance' },
 *     { value: 'home', label: 'Home Insurance' },
 *     { value: 'life', label: 'Life Insurance' },
 *   ]}
 *   error={errors.policyType}
 * />
 * ```
 *
 * @example
 * ```tsx
 * <Select label="Status" placeholder="Choose status">
 *   <option value="active">Active</option>
 *   <option value="inactive">Inactive</option>
 * </Select>
 * ```
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    helperText,
    error,
    placeholder,
    options,
    children,
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
  const selectId = id ?? (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const hasError = Boolean(error);

  return (
    <div className={cn('flex flex-col gap-1', wrapperClassName)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={selectId}
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

      {/* Select wrapper */}
      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={
            hasError
              ? `${selectId}-error`
              : helperText
                ? `${selectId}-helper`
                : undefined
          }
          className={cn(
            // Base
            'w-full appearance-none rounded-md border bg-white pl-3 pr-9 transition-colors duration-fast',
            // Size
            sizeClasses[size],
            // Default border
            'border-neutral-300 dark:border-neutral-600',
            // Dark mode background & text
            'dark:bg-neutral-800 dark:text-neutral-100',
            // Hover
            'hover:border-neutral-400 dark:hover:border-neutral-500',
            // Focus
            'focus:outline-none focus:border-primary-500 focus:shadow-focus-ring',
            'dark:focus:border-secondary-400 dark:focus:shadow-focus-ring-dark',
            // Error
            hasError && 'border-error hover:border-error focus:border-error focus:shadow-focus-error',
            // Disabled
            disabled && 'cursor-not-allowed bg-neutral-100 text-neutral-400 dark:bg-neutral-900 dark:text-neutral-500',
            className,
          )}
          {...rest}
        >
          {/* Placeholder option */}
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}

          {/* Options from prop */}
          {options?.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}

          {/* Options from children */}
          {children}
        </select>

        {/* Custom chevron icon */}
        <span
          className={cn(
            'pointer-events-none absolute right-3 flex items-center text-neutral-400',
            'dark:text-neutral-500',
            hasError && 'text-error',
          )}
        >
          <ChevronDown size={16} />
        </span>
      </div>

      {/* Error message */}
      {hasError && (
        <p id={`${selectId}-error`} role="alert" className="text-small text-error">
          {error}
        </p>
      )}

      {/* Helper text (hidden when error is shown) */}
      {!hasError && helperText && (
        <p id={`${selectId}-helper`} className="text-small text-neutral-500 dark:text-neutral-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Select;
