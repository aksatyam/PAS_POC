'use client';

import { Inbox, type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({
  icon: Icon = Inbox, title, description, action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-slide-up">
      {/* Decorative ring + icon */}
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-100 to-accent-50 dark:from-accent-900/20 dark:to-accent-950/10 scale-150 blur-xl opacity-60" />
        <div className="relative p-5 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700 rounded-2xl border border-neutral-200/60 dark:border-neutral-600/40 shadow-sm">
          <Icon size={28} className="text-neutral-400 dark:text-neutral-500" strokeWidth={1.5} />
        </div>
      </div>

      <h3 className="text-body-sm font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">{title}</h3>

      {description && (
        <p className="text-small text-neutral-400 dark:text-neutral-500 mb-5 max-w-xs text-center leading-relaxed">
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-small font-medium rounded-lg bg-accent-500 hover:bg-accent-600 text-white shadow-sm hover:shadow transition-all duration-150"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
