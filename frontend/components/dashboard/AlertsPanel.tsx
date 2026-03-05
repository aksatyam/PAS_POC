'use client';

import { AlertTriangle, AlertCircle, CheckCircle2, Info, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Alert {
  id: string;
  severity: 'error' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

const severityConfig = {
  error: { icon: AlertCircle, borderColor: 'border-l-red-500', iconColor: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/20' },
  warning: { icon: AlertTriangle, borderColor: 'border-l-amber-500', iconColor: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20' },
  success: { icon: CheckCircle2, borderColor: 'border-l-emerald-500', iconColor: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
  info: { icon: Info, borderColor: 'border-l-blue-500', iconColor: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
};

export default function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  if (!alerts?.length) return null;

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-surface-border dark:border-neutral-700 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-surface-border dark:border-neutral-700 flex items-center gap-2">
        <AlertTriangle size={16} className="text-amber-500" />
        <h3 className="text-body-sm font-semibold text-neutral-700 dark:text-neutral-200">Alerts & Notifications</h3>
        <span className="ml-auto text-[10px] font-semibold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded-full">
          {alerts.filter(a => a.severity === 'error' || a.severity === 'warning').length}
        </span>
      </div>
      <div className="divide-y divide-surface-border dark:divide-neutral-700 max-h-[300px] overflow-y-auto">
        {alerts.map((alert) => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;
          return (
            <div key={alert.id} className={cn('flex items-start gap-3 px-4 py-3 border-l-4', config.borderColor, config.bg)}>
              <Icon size={16} className={cn('mt-0.5 flex-shrink-0', config.iconColor)} />
              <div className="min-w-0 flex-1">
                <p className="text-body-sm font-medium text-neutral-900 dark:text-neutral-100">{alert.title}</p>
                <p className="text-small text-neutral-500 dark:text-neutral-400 mt-0.5">{alert.message}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-neutral-400 whitespace-nowrap">
                <Clock size={10} />
                {alert.timestamp}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
