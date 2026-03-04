'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Notification } from '@/types';
import { formatDateTime } from '@/lib/utils';
import {
  Bell, CheckCircle, XCircle, Info, AlertCircle, Check, Trash2,
} from 'lucide-react';

const severityIcons: Record<string, React.ReactNode> = {
  info: <Info size={16} className="text-info-500 dark:text-info-400" />,
  warning: <AlertCircle size={16} className="text-warning-500 dark:text-warning-400" />,
  error: <XCircle size={16} className="text-error-500 dark:text-error-400" />,
  success: <CheckCircle size={16} className="text-success-500 dark:text-success-400" />,
};

const severityBorder: Record<string, string> = {
  info: 'border-l-info-400',
  warning: 'border-l-warning-400',
  error: 'border-l-error-400',
  success: 'border-l-success-400',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRead, setFilterRead] = useState<'' | 'true' | 'false'>('');
  const router = useRouter();

  const load = async () => {
    try {
      const params: any = { limit: 100 };
      if (filterRead) params.isRead = filterRead;
      const res = await api.get('/notifications', params);
      if (res.success) setNotifications(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterRead]);

  const handleMarkRead = async (id: string) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/notifications/${id}`);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header mb-0">Notifications</h1>
          <p className="text-body-sm text-neutral-500 dark:text-neutral-400">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary text-sm flex items-center gap-1">
            <Check size={14} /> Mark All Read
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        <select
          value={filterRead}
          onChange={(e) => setFilterRead(e.target.value as any)}
          className="input-field w-40"
        >
          <option value="">All</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-lg" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
          <Bell size={40} className="mx-auto mb-3 text-neutral-300 dark:text-neutral-600" />
          <p>No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`card border-l-4 ${severityBorder[notif.severity] || 'border-l-neutral-300 dark:border-l-neutral-600'} ${
                !notif.isRead ? 'bg-accent-50/30 dark:bg-accent-900/10' : ''
              } cursor-pointer hover:shadow-md transition-shadow`}
              onClick={() => {
                if (!notif.isRead) handleMarkRead(notif.id);
                if (notif.actionLink) router.push(notif.actionLink);
              }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">{severityIcons[notif.severity]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-body-sm ${!notif.isRead ? 'font-semibold' : 'font-medium'} text-neutral-900 dark:text-neutral-100`}>
                      {notif.title}
                    </h4>
                    {!notif.isRead && <span className="w-2 h-2 bg-accent-500 rounded-full" />}
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider ml-auto">{notif.type.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="text-body-sm text-neutral-600 dark:text-neutral-400 mt-0.5">{notif.message}</p>
                  <p className="text-small text-neutral-400 dark:text-neutral-500 mt-1">{formatDateTime(notif.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!notif.isRead && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMarkRead(notif.id); }}
                      className="p-1.5 text-neutral-400 hover:text-success-600 hover:bg-success-50 dark:hover:text-success-400 dark:hover:bg-success-900/20 rounded transition-colors"
                      title="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}
                    className="p-1.5 text-neutral-400 hover:text-error-600 hover:bg-error-50 dark:hover:text-error-400 dark:hover:bg-error-900/20 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
