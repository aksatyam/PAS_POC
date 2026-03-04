'use client';

import { useMemo, useCallback, type ReactNode } from 'react';
import { X, Calendar } from 'lucide-react';
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  subMonths,
} from 'date-fns';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The value shape for a date range selection. */
interface DateRangeValue {
  from: string | null;
  to: string | null;
}

/** Definition for a quick-select preset chip. */
interface DatePresetDef {
  /** Display label on the chip. */
  label: string;
  /** Unique key for identifying the preset. */
  key: string;
  /** Returns the `from` and `to` ISO date strings for the preset. */
  getRange: () => { from: string; to: string };
}

/**
 * Props for the {@link DateRangePicker} component.
 *
 * @property value    - The currently selected date range.
 * @property onChange - Called when the range changes (via inputs, presets, or clear).
 * @property presets  - Optional array of custom preset definitions. If omitted, default insurance-oriented presets are used.
 * @property label    - Optional label rendered above the picker.
 * @property error    - Optional error message displayed below the picker.
 * @property disabled - Disables all interactive elements.
 * @property className - Additional class names forwarded to the root element.
 */
interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  presets?: DatePresetDef[];
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Formats a Date to `yyyy-MM-dd` for native `<input type="date">`. */
function toInputDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/** Formats a date string into a human-readable display label (e.g., "15 Mar 2024"). */
function toDisplayLabel(dateStr: string | null): string {
  if (!dateStr) return '--';
  return format(new Date(dateStr), 'dd MMM yyyy');
}

// ---------------------------------------------------------------------------
// Default Presets
// ---------------------------------------------------------------------------

function getDefaultPresets(): DatePresetDef[] {
  return [
    {
      label: 'Today',
      key: 'today',
      getRange() {
        const now = new Date();
        return { from: toInputDate(startOfDay(now)), to: toInputDate(endOfDay(now)) };
      },
    },
    {
      label: 'This Week',
      key: 'this-week',
      getRange() {
        const now = new Date();
        return {
          from: toInputDate(startOfWeek(now, { weekStartsOn: 1 })),
          to: toInputDate(endOfWeek(now, { weekStartsOn: 1 })),
        };
      },
    },
    {
      label: 'This Month',
      key: 'this-month',
      getRange() {
        const now = new Date();
        return { from: toInputDate(startOfMonth(now)), to: toInputDate(endOfMonth(now)) };
      },
    },
    {
      label: 'Last Month',
      key: 'last-month',
      getRange() {
        const lastMonth = subMonths(new Date(), 1);
        return { from: toInputDate(startOfMonth(lastMonth)), to: toInputDate(endOfMonth(lastMonth)) };
      },
    },
    {
      label: 'This Quarter',
      key: 'this-quarter',
      getRange() {
        const now = new Date();
        return { from: toInputDate(startOfQuarter(now)), to: toInputDate(endOfQuarter(now)) };
      },
    },
    {
      label: 'YTD',
      key: 'ytd',
      getRange() {
        const now = new Date();
        return { from: toInputDate(startOfYear(now)), to: toInputDate(now) };
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// Sub-component: PresetChip
// ---------------------------------------------------------------------------

interface PresetChipProps {
  preset: DatePresetDef;
  isActive: boolean;
  disabled: boolean;
  onClick: () => void;
}

function PresetChip({ preset, isActive, disabled, onClick }: PresetChipProps): ReactNode {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'px-3 py-1 rounded-full text-small font-medium',
        'transition-colors duration-micro',
        'focus-visible:outline-none focus-visible:shadow-focus-ring',
        'dark:focus-visible:shadow-focus-ring-dark',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isActive
          ? 'bg-accent-500 text-white dark:bg-accent-400 dark:text-accent-950'
          : cn(
            'bg-neutral-100 text-neutral-600',
            'hover:bg-neutral-200',
            'dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
          ),
      )}
    >
      {preset.label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Date range picker with native date inputs and quick-select preset chips.
 *
 * Designed for insurance workflows that commonly filter by policy periods,
 * claim filing dates, and accounting quarters. Uses `date-fns` for all date
 * calculations.
 *
 * @example
 * ```tsx
 * const [range, setRange] = useState<DateRangeValue>({ from: null, to: null });
 *
 * <DateRangePicker
 *   label="Policy Period"
 *   value={range}
 *   onChange={setRange}
 *   error={range.from && range.to && range.from > range.to ? 'From date must be before To date' : undefined}
 * />
 * ```
 */
export default function DateRangePicker({
  value,
  onChange,
  presets,
  label,
  error,
  disabled = false,
  className,
}: DateRangePickerProps): ReactNode {
  const resolvedPresets = useMemo(
    () => presets ?? getDefaultPresets(),
    [presets],
  );

  /** Determine which preset (if any) matches the current value. */
  const activePresetKey = useMemo(() => {
    if (!value.from || !value.to) return null;
    for (const preset of resolvedPresets) {
      const range = preset.getRange();
      if (range.from === value.from && range.to === value.to) {
        return preset.key;
      }
    }
    return null;
  }, [value, resolvedPresets]);

  const handleFromChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...value, from: e.target.value || null });
    },
    [value, onChange],
  );

  const handleToChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...value, to: e.target.value || null });
    },
    [value, onChange],
  );

  const handlePresetClick = useCallback(
    (preset: DatePresetDef) => {
      const range = preset.getRange();
      onChange({ from: range.from, to: range.to });
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange({ from: null, to: null });
  }, [onChange]);

  const hasValue = value.from !== null || value.to !== null;

  const inputBaseClasses = cn(
    'w-full h-10 px-3 rounded-md text-body-sm',
    'border transition-colors duration-micro',
    'focus:outline-none focus:shadow-focus-ring',
    'dark:focus:shadow-focus-ring-dark',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    error
      ? 'border-error focus:shadow-focus-error dark:border-red-400'
      : 'border-neutral-300 dark:border-neutral-600',
    'bg-white dark:bg-neutral-800',
    'text-neutral-900 dark:text-neutral-100',
  );

  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      {label && (
        <label className="block text-body-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          {label}
        </label>
      )}

      {/* ── Date inputs ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none">
            <Calendar size={16} aria-hidden="true" />
          </span>
          <input
            type="date"
            value={value.from ?? ''}
            onChange={handleFromChange}
            disabled={disabled}
            aria-label="From date"
            className={cn(inputBaseClasses, 'pl-9')}
          />
        </div>

        <span
          className="text-body-sm text-neutral-400 dark:text-neutral-500 shrink-0 select-none"
          aria-hidden="true"
        >
          to
        </span>

        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none">
            <Calendar size={16} aria-hidden="true" />
          </span>
          <input
            type="date"
            value={value.to ?? ''}
            onChange={handleToChange}
            disabled={disabled}
            min={value.from ?? undefined}
            aria-label="To date"
            className={cn(inputBaseClasses, 'pl-9')}
          />
        </div>

        {/* Clear button */}
        {hasValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear date range"
            className={cn(
              'flex items-center justify-center',
              'w-10 h-10 rounded-md shrink-0',
              'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100',
              'dark:text-neutral-500 dark:hover:text-neutral-300 dark:hover:bg-neutral-800',
              'transition-colors duration-micro',
              'focus-visible:outline-none focus-visible:shadow-focus-ring',
              'dark:focus-visible:shadow-focus-ring-dark',
            )}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* ── Display labels ──────────────────────────────────────── */}
      {hasValue && (
        <p className="text-small text-neutral-500 dark:text-neutral-400 mt-1.5">
          {toDisplayLabel(value.from)} &mdash; {toDisplayLabel(value.to)}
        </p>
      )}

      {/* ── Preset chips ────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mt-3" role="group" aria-label="Quick date presets">
        {resolvedPresets.map((preset) => (
          <PresetChip
            key={preset.key}
            preset={preset}
            isActive={activePresetKey === preset.key}
            disabled={disabled}
            onClick={() => handlePresetClick(preset)}
          />
        ))}
      </div>

      {/* ── Error message ───────────────────────────────────────── */}
      {error && (
        <p className="text-small text-error dark:text-red-400 mt-1.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export type { DateRangePickerProps, DateRangeValue, DatePresetDef };
