'use client';

import { AuditLog, Reserve } from '@/types';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import {
  FileText, Search, CheckCircle, XCircle, DollarSign,
  AlertTriangle, Clock, ArrowRight, Shield,
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  date: string;
  action: string;
  description: string;
  actor: string;
  icon: React.ReactNode;
  color: string;
}

interface Props {
  auditLogs: AuditLog[];
  reserves: Reserve[];
}

const actionIcons: Record<string, { icon: React.ReactNode; color: string }> = {
  CREATE: { icon: <FileText size={14} />, color: 'bg-blue-100 text-blue-600' },
  STATUS_CHANGE: { icon: <ArrowRight size={14} />, color: 'bg-amber-100 text-amber-600' },
  UPDATE: { icon: <Search size={14} />, color: 'bg-indigo-100 text-indigo-600' },
  SETTLEMENT: { icon: <DollarSign size={14} />, color: 'bg-green-100 text-green-600' },
  RESERVE: { icon: <Shield size={14} />, color: 'bg-purple-100 text-purple-600' },
};

export default function ClaimsTimeline({ auditLogs, reserves }: Props) {
  const events: TimelineEvent[] = [];

  // Map audit logs
  auditLogs.forEach((log) => {
    const cfg = actionIcons[log.action] || { icon: <Clock size={14} />, color: 'bg-gray-100 text-gray-600' };
    let description = `${log.action.replace(/_/g, ' ')} on ${log.resource.type} ${log.resource.id}`;

    if (log.action === 'STATUS_CHANGE' && log.before?.status && log.after?.status) {
      description = `Status changed: ${log.before.status} → ${log.after.status}`;
    } else if (log.action === 'CREATE') {
      description = 'Claim created';
    } else if (log.action === 'SETTLEMENT') {
      description = `Claim settled for ${log.after?.settlementAmount ? formatCurrency(log.after.settlementAmount) : 'N/A'}`;
    }

    events.push({
      id: log.id,
      date: log.timestamp,
      action: log.action,
      description,
      actor: log.actor.userId,
      icon: cfg.icon,
      color: cfg.color,
    });
  });

  // Map reserve changes
  reserves.forEach((r) => {
    const cfg = actionIcons.RESERVE;
    events.push({
      id: r.id,
      date: r.createdAt,
      action: 'RESERVE',
      description: `Reserve ${r.type.toLowerCase()}: ${formatCurrency(r.previousAmount)} → ${formatCurrency(r.amount)}. ${r.reason}`,
      actor: r.createdBy,
      icon: cfg.icon,
      color: cfg.color,
    });
  });

  // Sort descending
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock size={32} className="mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No timeline events yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" />
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="relative flex gap-4 pl-2">
            <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${event.color}`}>
              {event.icon}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-gray-900 uppercase">{event.action.replace(/_/g, ' ')}</span>
                <span className="text-xs text-gray-400">{formatDateTime(event.date)}</span>
              </div>
              <p className="text-sm text-gray-700">{event.description}</p>
              <p className="text-xs text-gray-400 mt-0.5">by {event.actor}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
