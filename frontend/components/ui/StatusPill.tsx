'use client';

import {
  FileEdit,
  Search,
  FileText,
  Lock,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  CircleDot,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Configuration for each insurance policy status.
 * Maps a status string to its color class, icon, and optional visual modifiers.
 */
interface StatusConfig {
  /** Tailwind text color class applied to the pill and icon. */
  color: string;
  /** Background color class for the pill container. */
  bg: string;
  /** Dark mode overrides for text and background. */
  dark: string;
  /** Lucide icon component, or 'dot' for the green active indicator. */
  icon: LucideIcon | 'dot';
  /** Optional CSS class applied to the icon (e.g. animation). */
  iconClass?: string;
  /** Optional CSS class applied to the label text. */
  labelClass?: string;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  Draft: {
    color: 'text-neutral-500',
    bg: 'bg-neutral-100',
    dark: 'dark:bg-neutral-800 dark:text-neutral-400',
    icon: FileEdit,
  },
  Under_Review: {
    color: 'text-info',
    bg: 'bg-blue-50',
    dark: 'dark:bg-blue-950 dark:text-blue-400',
    icon: Search,
    iconClass: 'animate-pulse-dot',
  },
  'Under Review': {
    color: 'text-info',
    bg: 'bg-blue-50',
    dark: 'dark:bg-blue-950 dark:text-blue-400',
    icon: Search,
    iconClass: 'animate-pulse-dot',
  },
  Active: {
    color: 'text-green-600',
    bg: 'bg-green-50',
    dark: 'dark:bg-green-950 dark:text-green-400',
    icon: 'dot',
  },
  Quoted: {
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
    dark: 'dark:bg-indigo-950 dark:text-indigo-400',
    icon: FileText,
  },
  Bound: {
    color: 'text-violet-500',
    bg: 'bg-violet-50',
    dark: 'dark:bg-violet-950 dark:text-violet-400',
    icon: Lock,
  },
  Cancelled: {
    color: 'text-red-400',
    bg: 'bg-red-50',
    dark: 'dark:bg-red-950 dark:text-red-400',
    icon: XCircle,
    labelClass: 'line-through',
  },
  Expired: {
    color: 'text-neutral-500',
    bg: 'bg-neutral-100',
    dark: 'dark:bg-neutral-800 dark:text-neutral-400',
    icon: Clock,
  },
  Renewed: {
    color: 'text-secondary-500',
    bg: 'bg-secondary-50',
    dark: 'dark:bg-secondary-950 dark:text-secondary-400',
    icon: RefreshCw,
  },
  Lapsed: {
    color: 'text-amber-800',
    bg: 'bg-amber-50',
    dark: 'dark:bg-amber-950 dark:text-amber-300',
    icon: AlertTriangle,
  },
  Renewal_Pending: {
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    dark: 'dark:bg-amber-950 dark:text-amber-400',
    icon: RefreshCw,
  },
  Reinstated: {
    color: 'text-green-500',
    bg: 'bg-green-50',
    dark: 'dark:bg-green-950 dark:text-green-400',
    icon: RotateCcw,
  },
  Approved: {
    color: 'text-green-500',
    bg: 'bg-green-50',
    dark: 'dark:bg-green-950 dark:text-green-400',
    icon: CheckCircle,
  },
};

/** Fallback config for unmapped status strings. */
const FALLBACK_CONFIG: StatusConfig = {
  color: 'text-neutral-500',
  bg: 'bg-neutral-100',
  dark: 'dark:bg-neutral-800 dark:text-neutral-400',
  icon: CircleDot,
};

const sizeStyles = {
  sm: { pill: 'px-2 py-0.5 text-[10px] gap-1', icon: 10, dot: 'h-1.5 w-1.5' },
  md: { pill: 'px-2.5 py-1 text-xs gap-1.5', icon: 12, dot: 'h-2 w-2' },
} as const;

type PillSize = keyof typeof sizeStyles;

interface StatusPillProps {
  /** The policy status string. Matched against the internal STATUS_MAP. */
  status: string;
  /** Pill sizing. */
  size?: PillSize;
  /** Additional class names. */
  className?: string;
}

/**
 * StatusPill - A specialized indicator for insurance policy lifecycle statuses.
 *
 * Each status maps to a unique color and icon combination that provides
 * immediate visual recognition across the PAS interface.
 *
 * @example
 * <StatusPill status="Active" />
 * <StatusPill status="Under_Review" size="sm" />
 * <StatusPill status="Cancelled" />
 */
export default function StatusPill({
  status,
  size = 'md',
  className,
}: StatusPillProps): React.ReactElement {
  const config = STATUS_MAP[status] ?? FALLBACK_CONFIG;
  const sizeConfig = sizeStyles[size];

  const displayLabel = status.replace(/_/g, ' ');

  function renderIcon(): React.ReactElement {
    if (config.icon === 'dot') {
      return (
        <span
          className={cn('rounded-full bg-green-500 shrink-0', sizeConfig.dot)}
          aria-hidden="true"
        />
      );
    }

    const Icon = config.icon;
    return <Icon size={sizeConfig.icon} className={cn('shrink-0', config.iconClass)} />;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium leading-none whitespace-nowrap',
        'border border-transparent',
        sizeConfig.pill,
        config.bg,
        config.color,
        config.dark,
        className,
      )}
      title={displayLabel}
    >
      {renderIcon()}
      <span className={config.labelClass}>{displayLabel}</span>
    </span>
  );
}
