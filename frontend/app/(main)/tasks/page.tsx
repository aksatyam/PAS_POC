'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Task, TaskDashboard, TaskPriority, TaskStatus } from '@/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import {
  ClipboardList, Clock, AlertTriangle, CheckCircle, Plus, ArrowRight,
  Calendar, User, Filter,
} from 'lucide-react';

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  Urgent: 'bg-error-100 text-error-800 border-error-200 dark:bg-error-900/30 dark:text-error-400 dark:border-error-800/40',
  High: 'bg-warning-100 text-warning-800 border-warning-200 dark:bg-warning-900/30 dark:text-warning-400 dark:border-warning-800/40',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/40',
  Low: 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:border-neutral-600',
};

const PRIORITY_DOT: Record<TaskPriority, string> = {
  Urgent: 'bg-error-500',
  High: 'bg-warning-500',
  Medium: 'bg-yellow-500',
  Low: 'bg-neutral-400 dark:bg-neutral-500',
};

const PRIORITY_BORDER: Record<TaskPriority, string> = {
  Urgent: 'border-l-error-500',
  High: 'border-l-warning-500',
  Medium: 'border-l-yellow-400',
  Low: 'border-l-neutral-300 dark:border-l-neutral-600',
};

function TaskSummaryCards({ dashboard }: { dashboard: TaskDashboard | null }) {
  if (!dashboard) return null;
  const items = [
    { label: 'Open', value: dashboard.open, icon: ClipboardList, color: 'text-accent-500 dark:text-accent-400', bg: 'bg-accent-50 dark:bg-accent-950' },
    { label: 'In Progress', value: dashboard.inProgress, icon: Clock, color: 'text-warning-600 dark:text-warning-400', bg: 'bg-warning-50 dark:bg-warning-900/30' },
    { label: 'Overdue', value: dashboard.overdue, icon: AlertTriangle, color: 'text-error-600 dark:text-error-400', bg: 'bg-error-50 dark:bg-error-900/30' },
    { label: 'Completed (7d)', value: dashboard.completedThisWeek, icon: CheckCircle, color: 'text-success-600 dark:text-success-400', bg: 'bg-success-50 dark:bg-success-900/30' },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {items.map((item) => (
        <div key={item.label} className="card flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center`}>
            <item.icon size={20} className={item.color} />
          </div>
          <div>
            <p className="text-h3 font-bold text-neutral-900 dark:text-neutral-100">{item.value}</p>
            <p className="text-small text-neutral-500 dark:text-neutral-400">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dashboard, setDashboard] = useState<TaskDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [form, setForm] = useState({
    title: '', description: '', assigneeId: '', priority: 'Medium' as TaskPriority,
    dueDate: '', type: 'GENERAL' as string,
  });

  const load = async () => {
    try {
      const params: any = {};
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      const [tasksRes, dashRes] = await Promise.all([
        api.get('/tasks', params),
        api.get('/tasks/dashboard'),
      ]);
      if (tasksRes.success) setTasks(tasksRes.data || []);
      if (dashRes.success) setDashboard(dashRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterStatus, filterPriority]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/tasks', { ...form, assigneeId: form.assigneeId || user?.id });
      if (res.success) {
        addToast({ type: 'success', title: 'Task Created', message: `Task "${form.title}" has been created` });
        setShowCreate(false);
        setForm({ title: '', description: '', assigneeId: '', priority: 'Medium', dueDate: '', type: 'GENERAL' });
        load();
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed', message: err.message });
    } finally { setCreating(false); }
  };

  const handleStatusUpdate = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status: newStatus });
      if (res.success) {
        addToast({ type: 'success', title: 'Task Updated', message: `Task moved to ${newStatus}` });
        load();
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed', message: err.message });
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const diff = new Date(dueDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-header mb-0">Task Queue</h1>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New Task
        </button>
      </div>

      <TaskSummaryCards dashboard={dashboard} />

      <div className="flex items-center gap-3 mb-4">
        <Filter size={14} className="text-neutral-400 dark:text-neutral-500" />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-36">
          <option value="">All Status</option>
          {['Open', 'In Progress', 'Completed', 'Overdue', 'Cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="input-field w-36">
          <option value="">All Priority</option>
          {['Urgent', 'High', 'Medium', 'Low'].map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-24 rounded-lg" />)}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No tasks found" description="Tasks will appear here when they are created or assigned to team members." />

      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const daysUntil = getDaysUntilDue(task.dueDate);
            const isOverdue = daysUntil < 0 && task.status !== 'Completed' && task.status !== 'Cancelled';
            return (
              <div key={task.id} className={`card border-l-4 ${isOverdue ? 'border-l-error-500' : PRIORITY_BORDER[task.priority]}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium border ${PRIORITY_COLORS[task.priority]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[task.priority]} mr-1`} />
                        {task.priority}
                      </span>
                      <StatusBadge status={task.status} />
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">{task.type.replace(/_/g, ' ')}</span>
                    </div>
                    <h4 className="text-body-sm font-semibold text-neutral-900 dark:text-neutral-100">{task.title}</h4>
                    <p className="text-small text-neutral-600 dark:text-neutral-400 mt-0.5">{task.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-small text-neutral-400 dark:text-neutral-500">
                      <span className="flex items-center gap-1"><Calendar size={12} /> Due {formatDate(task.dueDate)}</span>
                      {task.assigneeName && <span className="flex items-center gap-1"><User size={12} /> {task.assigneeName}</span>}
                      <span>{task.id}</span>
                      {isOverdue && <span className="text-error-600 dark:text-error-400 font-medium">{Math.abs(daysUntil)} day(s) overdue</span>}
                      {!isOverdue && daysUntil <= 1 && task.status !== 'Completed' && task.status !== 'Cancelled' && (
                        <span className="text-warning-600 dark:text-warning-400 font-medium">Due {daysUntil === 0 ? 'today' : 'tomorrow'}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 ml-4">
                    {task.status === 'Open' && (
                      <button onClick={() => handleStatusUpdate(task.id, 'In Progress')} className="text-small px-3 py-1.5 bg-accent-50 text-accent-600 hover:bg-accent-100 dark:bg-accent-950 dark:text-accent-400 dark:hover:bg-accent-900/30 rounded font-medium flex items-center gap-1 transition-colors">
                        <ArrowRight size={12} /> Start
                      </button>
                    )}
                    {(task.status === 'Open' || task.status === 'In Progress' || task.status === 'Overdue') && (
                      <button onClick={() => handleStatusUpdate(task.id, 'Completed')} className="text-small px-3 py-1.5 bg-success-50 text-success-700 hover:bg-success-100 dark:bg-success-900/20 dark:text-success-400 dark:hover:bg-success-900/30 rounded font-medium flex items-center gap-1 transition-colors">
                        <CheckCircle size={12} /> Complete
                      </button>
                    )}
                    {task.actionLink && (
                      <button onClick={() => router.push(task.actionLink!)} className="text-small px-3 py-1.5 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 rounded font-medium transition-colors">
                        View
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Task">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="form-label">Title</label>
            <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Task title" />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea className="input-field" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Task description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Priority</label>
              <select className="input-field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}>
                <option>Urgent</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div>
              <label className="form-label">Due Date</label>
              <input type="date" className="input-field" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="form-label">Type</label>
            <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="GENERAL">General</option>
              <option value="CLAIM_REVIEW">Claim Review</option>
              <option value="UW_REVIEW">UW Review</option>
              <option value="POLICY_RENEWAL">Policy Renewal</option>
              <option value="DOCUMENT_REVIEW">Document Review</option>
              <option value="FRAUD_REVIEW">Fraud Review</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={creating} className="btn-primary">{creating ? 'Creating...' : 'Create Task'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
