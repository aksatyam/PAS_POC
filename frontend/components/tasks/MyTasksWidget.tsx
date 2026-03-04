'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Task, TaskDashboard } from '@/types';
import { formatDate } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import { ClipboardList, ArrowRight, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

const PRIORITY_DOT: Record<string, string> = {
  Urgent: 'bg-red-500',
  High: 'bg-orange-500',
  Medium: 'bg-yellow-500',
  Low: 'bg-gray-400',
};

export default function MyTasksWidget() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dashboard, setDashboard] = useState<TaskDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const [tasksRes, dashRes] = await Promise.all([
          api.get('/tasks/my'),
          api.get('/tasks/dashboard'),
        ]);
        if (tasksRes.success) setTasks((tasksRes.data || []).slice(0, 5));
        if (dashRes.success) setDashboard(dashRes.data);
      } catch {}
      finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="section-card">
        <div className="section-header">My Tasks</div>
        <div className="p-4 space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-12 rounded" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="section-card">
      <div className="section-header flex items-center justify-between">
        <span>My Tasks</span>
        {dashboard && (
          <div className="flex items-center gap-3 text-xs font-normal">
            {dashboard.overdue > 0 && (
              <span className="flex items-center gap-1 text-red-600">
                <AlertTriangle size={12} /> {dashboard.overdue} overdue
              </span>
            )}
            <span className="flex items-center gap-1 text-gray-500">
              <Clock size={12} /> {dashboard.open + dashboard.inProgress} active
            </span>
          </div>
        )}
      </div>
      <div className="divide-y divide-gray-100">
        {tasks.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <CheckCircle size={24} className="mx-auto mb-2 text-green-300" />
            <p className="text-sm">All caught up!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => task.actionLink ? router.push(task.actionLink) : router.push('/tasks')}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3"
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority] || 'bg-gray-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                <p className="text-xs text-gray-500">Due {formatDate(task.dueDate)}</p>
              </div>
              <StatusBadge status={task.status} />
            </button>
          ))
        )}
      </div>
      {tasks.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100">
          <button onClick={() => router.push('/tasks')} className="text-xs text-imgc-orange hover:underline flex items-center gap-1 w-full justify-center">
            View all tasks <ArrowRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
