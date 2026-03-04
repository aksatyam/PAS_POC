'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import {
  FileText, AlertTriangle, Shield, CreditCard, ClipboardList, FolderOpen, User,
  Clock, ChevronRight, Activity, X, RefreshCw,
} from 'lucide-react';

interface ActivityEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  actor: { userId: string; userName: string };
  summary: string;
  timestamp: string;
}

const entityIcons: Record<string, any> = {
  policy: FileText,
  claim: AlertTriangle,
  underwriting: Shield,
  billing: CreditCard,
  task: ClipboardList,
  document: FolderOpen,
  user: User,
};

const entityColors: Record<string, string> = {
  policy: 'text-blue-500 bg-blue-50',
  claim: 'text-orange-500 bg-orange-50',
  underwriting: 'text-indigo-500 bg-indigo-50',
  billing: 'text-green-500 bg-green-50',
  task: 'text-purple-500 bg-purple-50',
  document: 'text-gray-500 bg-gray-50',
  user: 'text-teal-500 bg-teal-50',
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface ActivityFeedProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ActivityFeed({ isOpen, onClose }: ActivityFeedProps) {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    loadActivities();
    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [isOpen]);

  async function loadActivities() {
    try {
      const res = await api.get('/activity', { limit: 50 });
      if (res.success) setEntries(res.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  function connectSSE() {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) return;

      const es = new EventSource(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/activity/stream?token=${token}`);
      eventSourceRef.current = es;

      es.addEventListener('connected', () => { setConnected(true); });

      es.addEventListener('activity', (event) => {
        try {
          const entry = JSON.parse(event.data);
          setEntries((prev) => [entry, ...prev].slice(0, 100));
        } catch { /* ignore */ }
      });

      es.onerror = () => { setConnected(false); };
    } catch { /* ignore */ }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-accent-600" />
          <h2 className="font-semibold text-sm">Activity Feed</h2>
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300'}`} />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadActivities} className="p-1 hover:bg-gray-100 rounded" title="Refresh">
            <RefreshCw size={14} className="text-gray-500" />
          </button>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-2 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center">
            <Activity className="mx-auto text-gray-300 mb-2" size={32} />
            <p className="text-sm text-gray-500">No activity yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {entries.map((entry) => {
              const Icon = entityIcons[entry.entityType] || Activity;
              const color = entityColors[entry.entityType] || 'text-gray-500 bg-gray-50';
              return (
                <div key={entry.id} className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">{entry.summary}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{entry.actor.userName}</span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={10} /> {timeAgo(entry.timestamp)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 flex-shrink-0 mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
