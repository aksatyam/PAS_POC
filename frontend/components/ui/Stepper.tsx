'use client';

import { type ReactNode } from 'react';
import { Check, AlertCircle, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single step definition for the Stepper component. */
interface StepDef {
  /** Primary label displayed below (or beside) the step circle. */
  label: string;
  /** Optional secondary description shown beneath the label. */
  description?: string;
  /** Optional Lucide icon override displayed inside the circle. */
  icon?: LucideIcon;
}

type StepStatus = 'completed' | 'active' | 'upcoming' | 'error';

/**
 * Props for the {@link Stepper} component.
 *
 * @property steps       - Ordered array of step definitions.
 * @property activeStep  - Zero-based index of the currently active step.
 * @property onStepClick - Callback when a *completed* step is clicked (navigation).
 * @property className   - Additional class names forwarded to the root element.
 */
interface StepperProps {
  steps: StepDef[];
  activeStep: number;
  onStepClick?: (stepIndex: number) => void;
  /** Optional set of step indices that are in an error state. */
  errorSteps?: Set<number>;
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStepStatus(
  index: number,
  activeStep: number,
  errorSteps?: Set<number>,
): StepStatus {
  if (errorSteps?.has(index)) return 'error';
  if (index < activeStep) return 'completed';
  if (index === activeStep) return 'active';
  return 'upcoming';
}

/** Maps step status to the circle styling. */
const circleStyles: Record<StepStatus, string> = {
  completed: cn(
    'bg-success text-white',
    'dark:bg-emerald-400 dark:text-neutral-950',
  ),
  active: cn(
    'bg-accent-500 text-white ring-4 ring-accent-100',
    'dark:bg-accent-400 dark:text-accent-950 dark:ring-accent-800',
  ),
  upcoming: cn(
    'border-2 border-neutral-300 text-neutral-400 bg-white',
    'dark:border-neutral-600 dark:text-neutral-500 dark:bg-neutral-800',
  ),
  error: cn(
    'bg-error text-white',
    'dark:bg-red-400 dark:text-neutral-950',
  ),
};

/** Maps step status to the connecting line styling. */
const lineStyles: Record<StepStatus, string> = {
  completed: 'bg-success dark:bg-emerald-400',
  active: 'bg-neutral-300 dark:bg-neutral-600',
  upcoming: 'bg-neutral-300 dark:bg-neutral-600',
  error: 'bg-error dark:bg-red-400',
};

// ---------------------------------------------------------------------------
// Sub-component: StepCircle
// ---------------------------------------------------------------------------

interface StepCircleProps {
  index: number;
  step: StepDef;
  status: StepStatus;
}

function StepCircle({ index, step, status }: StepCircleProps): ReactNode {
  const Icon = step.icon;

  if (status === 'completed') {
    return <Check size={18} strokeWidth={2.5} aria-hidden="true" />;
  }
  if (status === 'error') {
    return <AlertCircle size={18} strokeWidth={2.5} aria-hidden="true" />;
  }
  if (Icon) {
    return <Icon size={18} aria-hidden="true" />;
  }
  return <span className="text-body-sm font-semibold">{index + 1}</span>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Multi-step wizard stepper for IMGC PAS workflows.
 *
 * Displays numbered circles connected by lines. Steps transition through
 * `completed`, `active`, `upcoming`, and `error` states. Completed steps
 * are clickable to allow backward navigation.
 *
 * Renders **horizontally** on `md+` breakpoints and **vertically** on
 * smaller screens.
 *
 * @example
 * ```tsx
 * <Stepper
 *   steps={[
 *     { label: 'Proposal', description: 'Basic details' },
 *     { label: 'Underwriting' },
 *     { label: 'Binding' },
 *     { label: 'Issuance' },
 *   ]}
 *   activeStep={1}
 *   onStepClick={(i) => setStep(i)}
 * />
 * ```
 */
export default function Stepper({
  steps,
  activeStep,
  onStepClick,
  errorSteps,
  className,
}: StepperProps): ReactNode {
  return (
    <nav
      aria-label="Progress"
      className={cn('w-full', className)}
    >
      {/* ── Horizontal layout (md+) ─────────────────────────────── */}
      <ol className="hidden md:flex items-start">
        {steps.map((step, index) => {
          const status = getStepStatus(index, activeStep, errorSteps);
          const isClickable = status === 'completed' && !!onStepClick;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={index}
              className={cn('flex items-start', !isLast && 'flex-1')}
            >
              <div className="flex flex-col items-center">
                {/* Circle */}
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={isClickable ? () => onStepClick(index) : undefined}
                  aria-current={status === 'active' ? 'step' : undefined}
                  className={cn(
                    'relative flex items-center justify-center',
                    'w-10 h-10 rounded-full shrink-0',
                    'transition-all duration-fast',
                    'focus-visible:outline-none focus-visible:shadow-focus-ring',
                    'dark:focus-visible:shadow-focus-ring-dark',
                    circleStyles[status],
                    isClickable && 'cursor-pointer hover:scale-110',
                    !isClickable && 'cursor-default',
                  )}
                >
                  <StepCircle index={index} step={step} status={status} />
                </button>

                {/* Label & description */}
                <div className="mt-2 text-center max-w-[120px]">
                  <p
                    className={cn(
                      'text-body-sm font-medium leading-tight',
                      status === 'active' && 'text-accent-600 dark:text-accent-300',
                      status === 'completed' && 'text-neutral-700 dark:text-neutral-300',
                      status === 'upcoming' && 'text-neutral-400 dark:text-neutral-500',
                      status === 'error' && 'text-error dark:text-red-400',
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-small text-neutral-400 dark:text-neutral-500 mt-0.5 leading-tight">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mt-5 mx-2',
                    'transition-colors duration-fast',
                    lineStyles[status],
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* ── Vertical layout (< md) ──────────────────────────────── */}
      <ol className="flex md:hidden flex-col gap-0">
        {steps.map((step, index) => {
          const status = getStepStatus(index, activeStep, errorSteps);
          const isClickable = status === 'completed' && !!onStepClick;
          const isLast = index === steps.length - 1;

          return (
            <li key={index} className="flex items-stretch">
              {/* Circle + vertical line column */}
              <div className="flex flex-col items-center mr-3">
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={isClickable ? () => onStepClick(index) : undefined}
                  aria-current={status === 'active' ? 'step' : undefined}
                  className={cn(
                    'relative flex items-center justify-center',
                    'w-9 h-9 rounded-full shrink-0',
                    'transition-all duration-fast',
                    'focus-visible:outline-none focus-visible:shadow-focus-ring',
                    'dark:focus-visible:shadow-focus-ring-dark',
                    circleStyles[status],
                    isClickable && 'cursor-pointer hover:scale-110',
                    !isClickable && 'cursor-default',
                  )}
                >
                  <StepCircle index={index} step={step} status={status} />
                </button>

                {/* Vertical connecting line */}
                {!isLast && (
                  <div
                    className={cn(
                      'w-0.5 flex-1 min-h-[24px]',
                      'transition-colors duration-fast',
                      lineStyles[status],
                    )}
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* Label & description */}
              <div className={cn('pb-6', isLast && 'pb-0')}>
                <p
                  className={cn(
                    'text-body-sm font-medium mt-2',
                    status === 'active' && 'text-accent-600 dark:text-accent-300',
                    status === 'completed' && 'text-neutral-700 dark:text-neutral-300',
                    status === 'upcoming' && 'text-neutral-400 dark:text-neutral-500',
                    status === 'error' && 'text-error dark:text-red-400',
                  )}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-small text-neutral-400 dark:text-neutral-500 mt-0.5">
                    {step.description}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export type { StepperProps, StepDef, StepStatus };
