'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import DataTable from '@/components/ui/DataTable';
import { Download, Filter } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/audit-logs');
        if (res.success) setLogs(res.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    loadData();
  }, []);

  const filteredLogs = moduleFilter === 'all' ? logs : logs.filter(l => l.module === moduleFilter);
  const modules = ['all', ...Array.from(new Set(logs.map(l => l.module)))];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-neutral-900 dark:text-neutral-100">Audit Logs</h1>
          <p className="text-body-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Track all system changes and user activities</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-body-sm font-medium text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
            <Filter size={14} /> Filters
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-body-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors">
            <Download size={14} /> Export Logs
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-small font-medium text-neutral-600 dark:text-neutral-400 mb-1">Module</label>
            <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-body-sm min-w-[160px]">
              {modules.map(m => <option key={m} value={m}>{m === 'all' ? 'All Modules' : m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-small font-medium text-neutral-600 dark:text-neutral-400 mb-1">Date From</label>
            <input type="date" className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-body-sm" />
          </div>
          <div>
            <label className="block text-small font-medium text-neutral-600 dark:text-neutral-400 mb-1">Date To</label>
            <input type="date" className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-body-sm" />
          </div>
          <button onClick={() => setModuleFilter('all')} className="px-3 py-2 text-body-sm text-neutral-500 hover:text-neutral-700 transition-colors">
            Clear
          </button>
        </div>
      )}

      <DataTable
        data={filteredLogs}
        columns={[
          { key: 'timestamp', label: 'Timestamp', render: (row: any) => <span className="text-small font-mono text-neutral-500">{formatDate(row.timestamp)}</span> },
          { key: 'user', label: 'User', render: (row: any) => <span className="font-medium">{row.user}</span> },
          { key: 'module', label: 'Module', render: (row: any) => (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 uppercase">{row.module}</span>
          )},
          { key: 'field', label: 'Field' },
          { key: 'oldValue', label: 'Old Value', render: (row: any) => row.oldValue ? <span className="line-through text-red-500 text-small">{row.oldValue}</span> : <span className="text-neutral-300">—</span> },
          { key: 'newValue', label: 'New Value', render: (row: any) => row.newValue ? <span className="text-emerald-600 dark:text-emerald-400 font-medium text-small">{row.newValue}</span> : <span className="text-neutral-300">—</span> },
          { key: 'entityId', label: 'Entity ID', render: (row: any) => <span className="font-medium text-accent-500">{row.entityId}</span> },
        ]}
        searchable
        loading={loading}
      />
    </div>
  );
}
