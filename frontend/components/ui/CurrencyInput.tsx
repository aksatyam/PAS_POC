'use client';

import {
  forwardRef,
  useCallback,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CurrencyInputSize = 'sm' | 'md' | 'lg';

/**
 * Props for the CurrencyInput component.
 *
 * @property label      - Label text displayed above the input.
 * @property helperText - Hint text displayed below the input.
 * @property error      - Error message. When provided, the input enters an error state.
 * @property size       - Predefined sizing tier. Defaults to `"md"`.
 * @property value      - Controlled numeric value (raw, unformatted).
 * @property onChange   - Callback receiving the raw numeric value on every edit.
 * @property currency   - ISO 4217 currency code. Defaults to `"INR"`.
 */
interface CurrencyInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'size' | 'value' | 'onChange' | 'type'
  > {
  label?: string;
  helperText?: string;
  error?: string;
  size?: CurrencyInputSize;
  value?: number | null;
  onChange?: (value: number | null) => void;
  currency?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SIZE_CLASSES: Record<CurrencyInputSize, string> = {
  sm: 'h-8 text-body-sm pl-8 pr-3',
  md: 'h-10 text-body-sm pl-10 pr-4',
  lg: 'h-12 text-body pl-12 pr-5',
};

const SYMBOL_SIZE_CLASSES: Record<CurrencyInputSize, string> = {
  sm: 'left-2.5 text-body-sm',
  md: 'left-3 text-body-sm',
  lg: 'left-4 text-body',
};

const LABEL_SIZE_CLASSES: Record<CurrencyInputSize, string> = {
  sm: 'text-small',
  md: 'text-body-sm',
  lg: 'text-body-sm',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

/**
 * Formats a numeric value using the Indian number system (e.g., 12,34,567.89).
 */
function formatIndianNumber(value: number): string {
  return INR_FORMATTER.format(value);
}

/**
 * Strips all non-numeric characters except the decimal point, then parses to
 * a floating-point number.
 */
function parseRawValue(display: string): number | null {
  const cleaned = display.replace(/[^0-9.]/g, '');
  if (cleaned === '' || cleaned === '.') return null;
  const parsed = parseFloat(cleaned);
  return Number.isNaN(parsed) ? null : parsed;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * INR-formatted currency input for the IMGC PAS enterprise system.
 *
 * Displays values in the Indian number system (e.g., `12,34,567.89`) with a
 * `₹` prefix. On every change the raw numeric value is emitted, keeping form
 * state free from display formatting.
 *
 * @example
 * ```tsx
 * const [premium, setPremium] = useState<number | null>(null);
 *
 * <CurrencyInput
 *   label="Sum Insured"
 *   value={premium}
 *   onChange={setPremium}
 *   placeholder="Enter amount"
 * />
 * ```
 */
const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput(
    {
      label,
      helperText,
      error,
      size = 'md',
      value,
      onChange,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved for future multi-currency support
      currency: _currency,
      disabled,
      className,
      id,
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) {
    // Track whether the user is actively editing so we can show raw input
    // instead of the formatted display value.
    const [isFocused, setIsFocused] = useState(false);
    const [displayValue, setDisplayValue] = useState('');

    const inputId = id ?? `currency-input-${label?.toLowerCase().replace(/\s+/g, '-') ?? 'field'}`;
    const hasError = Boolean(error);

    // Derive the formatted display value from the controlled `value` prop.
    const formattedValue =
      value != null ? formatIndianNumber(value) : '';

    // ------ Event handlers --------------------------------------------------

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;

        // Allow only digits, a single decimal point, and commas for
        // intermediate typing.
        const sanitised = raw.replace(/[^0-9.,]/g, '');
        setDisplayValue(sanitised);

        const parsed = parseRawValue(sanitised);
        onChange?.(parsed);
      },
      [onChange],
    );

    const handleFocus = useCallback(
      (e: FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);

        // Seed the editable value from the current formatted value, stripping
        // commas so the cursor lands in a predictable position.
        if (value != null) {
          setDisplayValue(String(value));
        } else {
          setDisplayValue('');
        }

        onFocus?.(e);
      },
      [value, onFocus],
    );

    const handleBlur = useCallback(
      (e: FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        onBlur?.(e);
      },
      [onBlur],
    );

    // ------ Render ----------------------------------------------------------

    return (
      <div className={cn('flex flex-col gap-1', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'font-medium text-neutral-700 dark:text-neutral-300',
              LABEL_SIZE_CLASSES[size],
              disabled && 'opacity-50',
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {/* Currency symbol */}
          <span
            className={cn(
              'absolute top-1/2 -translate-y-1/2 select-none font-medium',
              'text-neutral-500 dark:text-neutral-400',
              SYMBOL_SIZE_CLASSES[size],
              disabled && 'opacity-50',
            )}
            aria-hidden="true"
          >
            ₹
          </span>

          <input
            ref={ref}
            id={inputId}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={
              hasError
                ? `${inputId}-error`
                : helperText
                  ? `${inputId}-helper`
                  : undefined
            }
            value={isFocused ? displayValue : formattedValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
              // Base
              'w-full rounded-md border bg-white font-mono tabular-nums',
              'transition-colors duration-micro ease-out-custom',
              'placeholder:text-neutral-400',

              // Focus
              'focus:outline-none focus:shadow-focus-ring',
              'dark:focus:shadow-focus-ring-dark',

              // Dark mode
              'dark:bg-neutral-900 dark:text-neutral-100',
              'dark:border-neutral-700 dark:placeholder:text-neutral-500',

              // Disabled
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50',
              'dark:disabled:bg-neutral-800',

              // Error vs normal border
              hasError
                ? 'border-error focus:shadow-focus-error dark:border-red-500'
                : 'border-neutral-300 dark:border-neutral-600',

              // Size
              SIZE_CLASSES[size],
            )}
            {...rest}
          />
        </div>

        {/* Error message */}
        {hasError && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-small text-error dark:text-red-400"
          >
            {error}
          </p>
        )}

        {/* Helper text (only when there is no error) */}
        {!hasError && helperText && (
          <p
            id={`${inputId}-helper`}
            className="text-small text-neutral-500 dark:text-neutral-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };
export type { CurrencyInputProps, CurrencyInputSize };
export default CurrencyInput;
