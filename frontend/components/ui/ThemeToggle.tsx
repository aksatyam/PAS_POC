'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'system';

interface ThemeToggleProps {
  theme: Theme;
  onChange: (theme: Theme) => void;
  className?: string;
}

const OPTIONS = [
  { value: 'light' as const, icon: Sun, label: 'Light' },
  { value: 'dark' as const, icon: Moon, label: 'Dark' },
  { value: 'system' as const, icon: Monitor, label: 'System' },
];

export default function ThemeToggle({ theme, onChange, className }: ThemeToggleProps) {
  return (
    <div className={cn('flex items-center bg-neutral-100 dark:bg-neutral-700 rounded-lg p-0.5', className)}>
      {OPTIONS.map(opt => {
        const isActive = theme === opt.value;
        const Icon = opt.icon;

        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-small font-medium transition-all duration-micro',
              isActive
                ? 'bg-white dark:bg-neutral-600 text-neutral-900 dark:text-neutral-100 shadow-sm'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
            )}
            aria-label={opt.label}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
