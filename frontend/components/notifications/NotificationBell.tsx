'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Notification } from '@/types';
import { formatDateTime } from '@/lib/utils';
import {
  Bell, FileText, AlertTriangle, Shield, DollarSign, CheckCircle,
  XCircle, Clock, Info, AlertCircle, X,
} from 'lucide-react';

const severityIcons: Record<string, React.ReactNode> = {
  info: <Info size={14} className="text-info-500 dark:text-info-400" />,
  warning: <AlertCircle size={14} className="text-warning-500 dark:text-warning-400" />,
  error: <XCircle size={14} className="text-error-500 dark:text-error-400" />,
  success: <CheckCircle size={14} className="text-success-500 dark:text-success-400" />,
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const loadUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      if (res.success) setUnreadCount(res.data.count);
    } catch {}
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications', { limit: 10 });
      if (res.success) setNotifications(res.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) loadNotifications();
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleClick = (notif: Notification) => {
    if (!notif.isRead) handleMarkAsRead(notif.id);
    if (notif.actionLink) {
      router.push(notif.actionLink);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-error-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-4 border border-neutral-200 dark:border-neutral-700 z-50 max-h-[480px] flex flex-col animate-slide-up overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/80">
            <div className="flex items-center gap-2">
              <h3 className="text-body-sm font-semibold text-neutral-900 dark:text-neutral-100">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 px-1.5 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="text-small text-accent-600 dark:text-accent-400 hover:underline font-medium">
                  Mark all read
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-neutral-200 dark:border-neutral-600 border-t-accent-500 mx-auto mb-2" />
                <p className="text-body-sm text-neutral-400 dark:text-neutral-500">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-10 text-center">
                <div className="p-3 bg-neutral-100 dark:bg-neutral-700 rounded-xl inline-block mb-3">
                  <Bell size={22} className="text-neutral-300 dark:text-neutral-500" />
                </div>
                <p className="text-body-sm font-medium text-neutral-500 dark:text-neutral-400">All caught up!</p>
                <p className="text-small text-neutral-400 dark:text-neutral-500 mt-1">No new notifications</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className={`w-full text-left px-4 py-3 border-b border-neutral-50 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors group ${
                    !notif.isRead ? 'bg-accent-50/40 dark:bg-accent-900/10' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="p-1 rounded-lg bg-neutral-50 dark:bg-neutral-700 group-hover:scale-110 transition-transform">
                        {severityIcons[notif.severity] || severityIcons.info}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-body-sm ${!notif.isRead ? 'font-semibold' : 'font-medium'} text-neutral-900 dark:text-neutral-100 truncate`}>
                          {notif.title}
                        </p>
                        {!notif.isRead && <span className="w-2 h-2 bg-accent-500 rounded-full flex-shrink-0" />}
                      </div>
                      <p className="text-small text-neutral-600 dark:text-neutral-400 mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">{formatDateTime(notif.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-100 dark:border-neutral-700 px-4 py-2.5 bg-neutral-50/50 dark:bg-neutral-800/80">
            <button
              onClick={() => { router.push('/notifications'); setIsOpen(false); }}
              className="text-small text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 font-medium w-full text-center transition-colors"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
