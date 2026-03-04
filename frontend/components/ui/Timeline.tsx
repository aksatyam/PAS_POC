'use client';

import { type ReactNode } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Circle,
  type LucideIcon,
} from 'lucide-react';
import { cn, formatDateTime } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TimelineEventStatus = 'success' | 'error' | 'warning' | 'info' | 'neutral';

/** A single event displayed on the timeline. */
interface TimelineEvent {
  /** Unique identifier for the event. */
  id: string;
  /** Event title (primary text). */
  title: string;
  /** Optional longer description. */
  description?: string;
  /** ISO-8601 timestamp string. */
  timestamp: string;
  /** Semantic status controlling the dot color. */
  status: TimelineEventStatus;
  /** Optional actor / user who triggered the event. */
  actor?: string;
  /** Optional Lucide icon override for the dot. */
  icon?: LucideIcon;
}

/**
 * Props for the {@link Timeline} component.
 *
 * @property events    - Ordered array of timeline events (newest first recommended).
 * @property className - Additional class names forwarded to the root element.
 */
interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

// ---------------------------------------------------------------------------
// Status style maps
// ---------------------------------------------------------------------------

const dotColorMap: Record<TimelineEventStatus, string> = {
  success: 'bg-emerald-500 text-white dark:bg-emerald-400 dark:text-neutral-950',
  error: 'bg-red-500 text-white dark:bg-red-400 dark:text-neutral-950',
  warning: 'bg-amber-500 text-white dark:bg-amber-400 dark:text-neutral-950',
  info: 'bg-blue-500 text-white dark:bg-blue-400 dark:text-neutral-950',
  neutral: 'bg-neutral-400 text-white dark:bg-neutral-500 dark:text-neutral-950',
};

const defaultIconMap: Record<TimelineEventStatus, LucideIcon> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  neutral: Circle,
};

const titleColorMap: Record<TimelineEventStatus, string> = {
  success: 'text-emerald-700 dark:text-emerald-300',
  error: 'text-red-700 dark:text-red-300',
  warning: 'text-amber-700 dark:text-amber-300',
  info: 'text-blue-700 dark:text-blue-300',
  neutral: 'text-neutral-700 dark:text-neutral-300',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Vertical timeline for policy lifecycle events and audit trails.
 *
 * Renders a connecting vertical line (`border-l-2`) with colored dots for
 * each event. The first event in the list is treated as the "latest" and
 * receives a slightly larger dot and bolder text.
 *
 * @example
 * ```tsx
 * <Timeline
 *   events={[
 *     { id: '1', title: 'Policy Issued', timestamp: '2024-06-15T10:30:00Z', status: 'success', actor: 'John Doe' },
 *     { id: '2', title: 'Underwriting Approved', timestamp: '2024-06-14T16:00:00Z', status: 'info' },
 *     { id: '3', title: 'Proposal Created', timestamp: '2024-06-13T09:15:00Z', status: 'neutral', actor: 'Jane Smith' },
 *   ]}
 * />
 * ```
 */
export default function Timeline({ events, className }: TimelineProps): ReactNode {
  if (events.length === 0) {
    return (
      <p className="text-body-sm text-neutral-400 dark:text-neutral-500 italic">
        No events to display.
      </p>
    );
  }

  return (
    <div className={cn('relative', className)} role="list" aria-label="Timeline">
      {events.map((event, index) => {
        const isLatest = index === 0;
        const isLast = index === events.length - 1;
        const Icon = event.icon ?? defaultIconMap[event.status];

        return (
          <div
            key={event.id}
            role="listitem"
            className="relative flex gap-4"
          >
            {/* ── Dot & connecting line column ────────────────────── */}
            <div className="flex flex-col items-center">
              {/* Dot */}
              <div
                className={cn(
                  'relative z-10 flex items-center justify-center rounded-full shrink-0',
                  'transition-all duration-fast',
                  dotColorMap[event.status],
                  isLatest ? 'w-9 h-9' : 'w-7 h-7',
                  isLatest && 'ring-4 ring-neutral-100 dark:ring-neutral-800',
                )}
              >
                <Icon size={isLatest ? 18 : 14} strokeWidth={2.5} aria-hidden="true" />
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div
                  className="w-0.5 flex-1 min-h-[24px] bg-neutral-200 dark:bg-neutral-700"
                  aria-hidden="true"
                />
              )}
            </div>

            {/* ── Content ─────────────────────────────────────────── */}
            <div className={cn('pb-6', isLast && 'pb-0', 'min-w-0 flex-1')}>
              <p
                className={cn(
                  'leading-tight',
                  isLatest ? 'text-body font-semibold' : 'text-body-sm font-medium',
                  titleColorMap[event.status],
                )}
              >
                {event.title}
              </p>

              {event.description && (
                <p className="text-body-sm text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                  {event.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                <time
                  dateTime={event.timestamp}
                  className="text-small text-neutral-400 dark:text-neutral-500"
                >
                  {formatDateTime(event.timestamp)}
                </time>
                {event.actor && (
                  <span className="text-small text-neutral-400 dark:text-neutral-500">
                    by <span className="font-medium text-neutral-600 dark:text-neutral-300">{event.actor}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export type { TimelineProps, TimelineEvent, TimelineEventStatus };
