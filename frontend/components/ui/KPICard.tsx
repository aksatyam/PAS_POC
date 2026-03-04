'use client';

import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { SkeletonKPICard } from './Skeleton';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  className?: string;
  loading?: boolean;
  animationDelay?: number;
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
}

const variantStyles = {
  default: {
    iconBg: 'bg-accent-50 dark:bg-accent-950',
    iconColor: 'text-accent-600 dark:text-accent-400',
    accent: 'bg-accent-500',
  },
  primary: {
    iconBg: 'bg-accent-50 dark:bg-accent-950',
    iconColor: 'text-accent-600 dark:text-accent-400',
    accent: 'bg-accent-500',
  },
  secondary: {
    iconBg: 'bg-secondary-50 dark:bg-secondary-950',
    iconColor: 'text-secondary-500 dark:text-secondary-400',
    accent: 'bg-secondary-500',
  },
  accent: {
    iconBg: 'bg-accent-50 dark:bg-accent-950',
    iconColor: 'text-accent-600 dark:text-accent-400',
    accent: 'bg-accent-500',
  },
};

export default function KPICard({
  title, value, subtitle, icon: Icon, trend, className, loading, animationDelay, variant = 'default',
}: KPICardProps) {
  if (loading) return <SkeletonKPICard />;

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700',
        'overflow-hidden hover:shadow-card-hover transition-shadow duration-standard animate-slide-up',
        className
      )}
      style={animationDelay ? { animationDelay: `${animationDelay}ms`, animationFillMode: 'both' } : undefined}
    >
      {/* Top accent bar */}
      <div className={cn('h-1', styles.accent)} />

      <div className="p-4 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-caption font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">{title}</p>
          <p className="text-data-lg font-bold text-neutral-900 dark:text-neutral-100 mt-1 tabular-nums">{value}</p>
          {subtitle && <p className="text-small text-neutral-400 dark:text-neutral-500 mt-0.5">{subtitle}</p>}
          {trend && (
            <p className={cn(
              'text-small mt-1 font-medium inline-flex items-center gap-1',
              trend.isPositive ? 'text-success' : 'text-error'
            )}>
              {trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trend.isPositive ? '+' : ''}{trend.value}%
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl flex-shrink-0', styles.iconBg)}>
          <Icon className={styles.iconColor} size={22} />
        </div>
      </div>
    </div>
  );
}
