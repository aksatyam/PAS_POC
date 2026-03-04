'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown, Search, Inbox } from 'lucide-react';
import { SkeletonTable } from './Skeleton';
import EmptyState from './EmptyState';
import type { LucideIcon } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  emptyIcon?: LucideIcon;
  searchable?: boolean;
  searchPlaceholder?: string;
  loading?: boolean;
}

export default function DataTable<T extends Record<string, any>>({
  columns, data, pageSize = 10, onRowClick, emptyMessage = 'No records found',
  emptyIcon, searchable = false, searchPlaceholder = 'Search...', loading = false,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = row[col.key];
        return val != null && String(val).toLowerCase().includes(term);
      }),
    );
  }, [data, search, columns]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey]; const bVal = b[sortKey];
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortDir]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const pagedData = sortedData.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const getSortIcon = (colKey: string) => {
    if (sortKey !== colKey) return <ArrowUpDown size={12} />;
    return sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  if (loading) return <SkeletonTable rows={5} cols={columns.length} />;

  return (
    <div className="animate-fade-in">
      {searchable && (
        <div className="mb-3">
          <div className="relative w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-neutral-800 border border-surface-border dark:border-neutral-700 rounded-lg text-body-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all"
            />
          </div>
        </div>
      )}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-surface-border dark:border-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-accent-50/40 dark:bg-accent-950/20 border-b-2 border-accent-500/30 dark:border-accent-500/20">
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3 text-left text-overline font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    {col.sortable ? (
                      <button onClick={() => handleSort(col.key)} className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-neutral-100 text-neutral-500 dark:text-neutral-400 transition-colors">
                        {col.label} {getSortIcon(col.key)}
                      </button>
                    ) : col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700/50">
              {pagedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <EmptyState
                      icon={emptyIcon || Inbox}
                      title={emptyMessage}
                      description={search ? 'Try adjusting your search term' : undefined}
                    />
                  </td>
                </tr>
              ) : pagedData.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  onClick={() => onRowClick?.(row)}
                  className={`transition-colors duration-150 ${i % 2 === 0 ? 'bg-white dark:bg-neutral-800' : 'bg-neutral-50/50 dark:bg-neutral-800/50'} ${onRowClick ? 'cursor-pointer hover:bg-accent-50/50 dark:hover:bg-accent-950/20' : ''}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-2.5 text-body-sm text-neutral-700 dark:text-neutral-300">
                      {col.render ? col.render(row) : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-surface-border dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
            <p className="text-small text-neutral-500 dark:text-neutral-400">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sortedData.length)} of {sortedData.length} records
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(1)} disabled={page === 1} className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30 text-neutral-500 dark:text-neutral-400 transition-colors"><ChevronsLeft size={16} /></button>
              <button onClick={() => setPage(page - 1)} disabled={page === 1} className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30 text-neutral-500 dark:text-neutral-400 transition-colors"><ChevronLeft size={16} /></button>
              <span className="px-3 text-small text-neutral-600 dark:text-neutral-400 font-medium tabular-nums">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30 text-neutral-500 dark:text-neutral-400 transition-colors"><ChevronRight size={16} /></button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30 text-neutral-500 dark:text-neutral-400 transition-colors"><ChevronsRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
