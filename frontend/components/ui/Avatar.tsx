'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * Dimension and font configuration per avatar size.
 */
const sizeStyles = {
  xs: { dimension: 24, text: 'text-[9px]', statusDot: 'h-1.5 w-1.5 border', roleBadge: 'text-[7px] px-0.5' },
  sm: { dimension: 32, text: 'text-[10px]', statusDot: 'h-2 w-2 border', roleBadge: 'text-[8px] px-1' },
  md: { dimension: 40, text: 'text-xs', statusDot: 'h-2.5 w-2.5 border-2', roleBadge: 'text-[9px] px-1' },
  lg: { dimension: 48, text: 'text-sm', statusDot: 'h-3 w-3 border-2', roleBadge: 'text-[10px] px-1.5' },
  xl: { dimension: 64, text: 'text-base', statusDot: 'h-3.5 w-3.5 border-2', roleBadge: 'text-xs px-1.5' },
} as const;

/**
 * Background colors used for initials-based fallback avatars.
 * Deterministically assigned based on the name string.
 */
const INITIALS_COLORS = [
  'bg-accent-500 dark:bg-accent-600',
  'bg-accent-600 dark:bg-accent-700',
  'bg-accent-700 dark:bg-accent-800',
  'bg-secondary-500 dark:bg-secondary-600',
  'bg-secondary-600 dark:bg-secondary-700',
  'bg-indigo-500 dark:bg-indigo-600',
  'bg-violet-500 dark:bg-violet-600',
  'bg-blue-500 dark:bg-blue-600',
] as const;

/**
 * Role badge color mappings for insurance domain roles.
 */
const ROLE_COLORS: Record<string, string> = {
  Admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  Underwriter: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  Operations: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  Claims: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  Viewer: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
};

type AvatarSize = keyof typeof sizeStyles;

interface AvatarProps {
  /** Full name used to derive initials and background color. */
  name: string;
  /** Image source URL. Falls back to initials when absent or on error. */
  src?: string | null;
  /** Avatar sizing preset. */
  size?: AvatarSize;
  /** Show an online status indicator dot. */
  online?: boolean;
  /** Display a role badge below the avatar. */
  role?: string;
  /** Show a colored ring around the avatar. */
  ring?: boolean;
  /** Additional class names applied to the outer wrapper. */
  className?: string;
}

/**
 * Extracts up to two initials from a full name string.
 * "John Doe" -> "JD", "Alice" -> "A", "" -> "?"
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || parts[0] === '') return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Deterministically picks a background color based on the name string.
 * Ensures the same name always receives the same color.
 */
function getColorIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % INITIALS_COLORS.length;
}

/**
 * Avatar - Displays a user's profile image with graceful fallback to initials.
 *
 * Supports online status indicators, role badges, and a ring highlight.
 * The initials background color is deterministically derived from the user's name.
 *
 * @example
 * <Avatar name="John Doe" src="/avatars/john.jpg" size="lg" online />
 * <Avatar name="Alice Smith" role="Underwriter" ring />
 * <Avatar name="Bob" size="xs" />
 */
export default function Avatar({
  name,
  src,
  size = 'md',
  online,
  role,
  ring = false,
  className,
}: AvatarProps): React.ReactElement {
  const [imgError, setImgError] = useState(false);
  const config = sizeStyles[size];
  const initials = getInitials(name);
  const showImage = src && !imgError;

  return (
    <div className={cn('inline-flex flex-col items-center gap-1', className)}>
      <div className="relative inline-block">
        {/* Avatar circle */}
        <div
          className={cn(
            'relative rounded-full overflow-hidden flex items-center justify-center',
            'font-semibold text-white select-none shrink-0',
            ring && 'ring-2 ring-accent-500 ring-offset-2 dark:ring-secondary-400 dark:ring-offset-neutral-900',
            !showImage && INITIALS_COLORS[getColorIndex(name)],
            config.text,
          )}
          style={{ width: config.dimension, height: config.dimension }}
          title={name}
          aria-label={name}
        >
          {showImage ? (
            <Image
              src={src}
              alt={name}
              width={config.dimension}
              height={config.dimension}
              className="object-cover w-full h-full"
              onError={() => setImgError(true)}
            />
          ) : (
            <span aria-hidden="true">{initials}</span>
          )}
        </div>

        {/* Online status dot */}
        {online != null && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full',
              'border-white dark:border-neutral-900',
              config.statusDot,
              online ? 'bg-green-500' : 'bg-neutral-400',
            )}
            aria-label={online ? 'Online' : 'Offline'}
          />
        )}
      </div>

      {/* Role badge */}
      {role && (
        <span
          className={cn(
            'inline-block rounded-full font-medium leading-none whitespace-nowrap py-0.5',
            config.roleBadge,
            ROLE_COLORS[role] ?? 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
          )}
        >
          {role}
        </span>
      )}
    </div>
  );
}
