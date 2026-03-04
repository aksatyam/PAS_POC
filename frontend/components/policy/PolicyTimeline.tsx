'use client';

import { AuditLog, Endorsement, Renewal } from '@/types';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  FileText, CheckCircle, Send, PenLine, RefreshCw, Ban, Pause, Undo2,
  BookmarkCheck, FileSearch, Clock, AlertCircle,
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
}

interface PolicyTimelineProps {
  audit: AuditLog[];
  endorsements: Endorsement[];
  renewals: Renewal[];
}

function mapAuditToEvent(log: AuditLog): TimelineEvent {
  const iconMap: Record<string, { icon: React.ReactNode; color: string }> = {
    CREATE: { icon: <FileText size={16} />, color: 'bg-blue-500' },
    UPDATE: { icon: <PenLine size={16} />, color: 'bg-gray-500' },
    STATUS_CHANGE: { icon: <CheckCircle size={16} />, color: 'bg-green-500' },
    QUOTE: { icon: <FileSearch size={16} />, color: 'bg-blue-500' },
    BIND: { icon: <BookmarkCheck size={16} />, color: 'bg-indigo-500' },
    ISSUE: { icon: <Send size={16} />, color: 'bg-teal-500' },
    ENDORSE: { icon: <PenLine size={16} />, color: 'bg-cyan-500' },
    RENEW: { icon: <RefreshCw size={16} />, color: 'bg-amber-500' },
    REINSTATE: { icon: <Undo2 size={16} />, color: 'bg-emerald-500' },
  };

  const mapped = iconMap[log.action] || { icon: <Clock size={16} />, color: 'bg-gray-400' };

  let description = `${log.action} by ${log.actor.userId} (${log.actor.role})`;
  if (log.after?.status) description += ` — Status: ${log.after.status}`;

  return {
    id: log.id,
    date: log.timestamp,
    title: log.action.replace(/_/g, ' '),
    description,
    icon: mapped.icon,
    color: mapped.color,
    badge: log.after?.status,
  };
}

function mapEndorsementToEvent(e: Endorsement): TimelineEvent {
  return {
    id: e.id,
    date: e.createdAt,
    title: `Endorsement: ${e.type}`,
    description: e.description + (e.premiumDelta !== 0 ? ` (${e.premiumDelta > 0 ? '+' : ''}${formatCurrency(e.premiumDelta)})` : ''),
    icon: <PenLine size={16} />,
    color: 'bg-cyan-500',
    badge: e.status,
  };
}

function mapRenewalToEvent(r: Renewal): TimelineEvent {
  return {
    id: r.id,
    date: r.createdAt,
    title: 'Renewal Initiated',
    description: `New premium: ${formatCurrency(r.newPremiumAmount)} (${r.premiumChange > 0 ? '+' : ''}${formatCurrency(r.premiumChange)})`,
    icon: <RefreshCw size={16} />,
    color: 'bg-amber-500',
    badge: r.status,
  };
}

export default function PolicyTimeline({ audit, endorsements, renewals }: PolicyTimelineProps) {
  const events: TimelineEvent[] = [
    ...audit.map(mapAuditToEvent),
    ...endorsements.map(mapEndorsementToEvent),
    ...renewals.map(mapRenewalToEvent),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock size={32} className="mx-auto mb-2 text-gray-300" />
        No timeline events yet
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="relative flex gap-4 pl-2">
            <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-white shrink-0 ${event.color}`}>
              {event.icon}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-medium text-sm text-gray-900">{event.title}</span>
                {event.badge && <StatusBadge status={event.badge} />}
              </div>
              <p className="text-sm text-gray-600">{event.description}</p>
              <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(event.date)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
