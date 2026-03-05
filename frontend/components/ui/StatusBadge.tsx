import { cn, statusColors } from '@/lib/utils';
import {
  CheckCircle, Clock, XCircle, Pause, Ban, CalendarX, FileCheck, Timer,
  ShieldCheck, ShieldAlert, ShieldX, ArrowDown, ArrowRight, ArrowUp, CircleDot,
  FileSearch, BookmarkCheck, Send, PenLine, RefreshCw, Undo2,
  type LucideIcon,
} from 'lucide-react';

const statusIcons: Record<string, LucideIcon> = {
  Active: CheckCircle, Draft: Clock, Lapsed: Pause, Cancelled: Ban, Expired: CalendarX,
  Quoted: FileSearch, Bound: BookmarkCheck, Issued: Send, Endorsed: PenLine,
  Renewal_Pending: RefreshCw, Reinstated: Undo2,
  Filed: FileCheck, 'Under Review': Timer, Approved: CheckCircle, Rejected: XCircle, Settled: CheckCircle,
  Applied: CheckCircle, Pending: Clock, Declined: XCircle, Escalated: ArrowUp, Accepted: CheckCircle,
  'Auto-Approve': ShieldCheck, Refer: ShieldAlert, Reject: ShieldX,
  Low: ArrowDown, Medium: ArrowRight, High: ArrowUp,
  Verified: CheckCircle,
  Investigation: FileSearch, Evaluation: Timer, Negotiation: ArrowRight, Settlement: CheckCircle,
  Submitted: Send, Processing: RefreshCw, 'Claim Created': FileCheck,
  Standard: CheckCircle, 'Sub-Standard': ShieldAlert, Doubtful: ShieldAlert, Loss: XCircle,
};

const pulseStatuses = new Set(['Under Review', 'Filed', 'Pending', 'Renewal_Pending', 'Quoted']);

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
  const Icon = statusIcons[status] || CircleDot;
  const shouldPulse = pulseStatuses.has(status);

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
      colorClass,
      shouldPulse && 'animate-pulse-subtle',
      className,
    )}>
      <Icon size={12} />
      {status}
    </span>
  );
}
