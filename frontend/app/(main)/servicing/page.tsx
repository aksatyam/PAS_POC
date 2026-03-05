'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import KPICard from '@/components/ui/KPICard';
import Tabs from '@/components/ui/Tabs';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { Upload, Database, AlertTriangle, TrendingDown, BarChart3, Download } from 'lucide-react';

export default function ServicingPage() {
  const [npaData, setNpaData] = useState<any[]>([]);
  const [delinquency, setDelinquency] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadForm, setUploadForm] = useState({ lender: '', month: '', batchDate: '', file: null as File | null });

  useEffect(() => {
    async function loadData() {
      try {
        const [npaRes, delRes, batchRes] = await Promise.all([
          api.get('/servicing/npa'),
          api.get('/servicing/delinquency'),
          api.get('/servicing/batches'),
        ]);
        if (npaRes.success) setNpaData(npaRes.data || []);
        if (delRes.success) setDelinquency(delRes.data);
        if (batchRes.success) setBatches(batchRes.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    loadData();
  }, []);

  const tabs = [
    {
      value: 'file-upload',
      label: 'File Upload',
      content: (
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-6">
            <h4 className="text-body-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Upload Servicing File</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-small font-medium text-neutral-600 dark:text-neutral-400 mb-1">Lender Name</label>
                <select value={uploadForm.lender} onChange={e => setUploadForm(p => ({ ...p, lender: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-body-sm">
                  <option value="">Select Lender...</option>
                  <option>HDFC Bank</option><option>ICICI Bank</option><option>SBI</option><option>Axis Bank</option>
                </select>
              </div>
              <div>
                <label className="block text-small font-medium text-neutral-600 dark:text-neutral-400 mb-1">Servicing File Month</label>
                <input type="month" value={uploadForm.month} onChange={e => setUploadForm(p => ({ ...p, month: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-body-sm" />
              </div>
              <div>
                <label className="block text-small font-medium text-neutral-600 dark:text-neutral-400 mb-1">Batch Received Date</label>
                <input type="date" value={uploadForm.batchDate} onChange={e => setUploadForm(p => ({ ...p, batchDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-body-sm" />
              </div>
              <div>
                <label className="block text-small font-medium text-neutral-600 dark:text-neutral-400 mb-1">Batch ID</label>
                <input type="text" value="B-2026-0305" readOnly
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-body-sm text-neutral-500" />
              </div>
            </div>
            <div className="mt-4 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-8 text-center">
              <Upload size={32} className="mx-auto text-neutral-400 mb-2" />
              <p className="text-body-sm text-neutral-600 dark:text-neutral-400">Drag and drop your servicing file here, or <span className="text-accent-500 font-medium cursor-pointer">browse files</span></p>
              <p className="text-small text-neutral-400 mt-1">Supports CSV, XLSX (max 50MB)</p>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button className="flex items-center gap-1.5 px-4 py-2 text-body-sm font-medium text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                <Download size={14} /> Export
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 text-body-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors">
                <Upload size={14} /> Upload Servicing File
              </button>
            </div>
          </div>
          {/* Recent Batches */}
          <DataTable data={batches} columns={[
            { key: 'id', label: 'Batch ID', render: (row: any) => <span className="font-medium text-accent-500">{row.id}</span> },
            { key: 'lender', label: 'Lender' },
            { key: 'month', label: 'Month' },
            { key: 'records', label: 'Records', render: (row: any) => <span className="font-semibold">{row.records?.toLocaleString()}</span> },
            { key: 'status', label: 'Status', render: (row: any) => <StatusBadge status={row.status} /> },
            { key: 'uploadDate', label: 'Upload Date', render: (row: any) => formatDate(row.uploadDate) },
          ]} searchable loading={loading} />
        </div>
      ),
    },
    {
      value: 'data-analysis',
      label: 'Data Analysis',
      content: (
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-8 text-center">
          <Database size={48} className="mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
          <h4 className="text-body-sm font-semibold text-neutral-700 dark:text-neutral-200">Data Analysis</h4>
          <p className="text-small text-neutral-500 dark:text-neutral-400 mt-1 max-w-md mx-auto">Upload a servicing file to see detailed analysis results including portfolio health metrics, delinquency trends, and risk indicators.</p>
        </div>
      ),
    },
    {
      value: 'npa-tracking',
      label: 'NPA Tracking',
      content: (
        <DataTable data={npaData} columns={[
          { key: 'loanId', label: 'Loan ID', render: (row: any) => <span className="font-medium text-accent-500">{row.loanId}</span> },
          { key: 'customer', label: 'Customer' },
          { key: 'dpd', label: 'DPD', render: (row: any) => <span className={`font-semibold ${row.dpd > 90 ? 'text-red-500' : row.dpd > 60 ? 'text-amber-500' : 'text-orange-500'}`}>{row.dpd}</span> },
          { key: 'npaCategory', label: 'NPA Category', render: (row: any) => <StatusBadge status={row.npaCategory} /> },
          { key: 'outstanding', label: 'Outstanding', render: (row: any) => formatCurrency(row.outstanding) },
          { key: 'status', label: 'Status', render: (row: any) => <StatusBadge status={row.status} /> },
        ]} searchable loading={loading} />
      ),
    },
    {
      value: 'premium-check',
      label: 'Premium Check',
      content: (
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-8 text-center">
          <BarChart3 size={48} className="mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
          <h4 className="text-body-sm font-semibold text-neutral-700 dark:text-neutral-200">Premium Check</h4>
          <p className="text-small text-neutral-500 dark:text-neutral-400 mt-1 max-w-md mx-auto">Premium verification results will be displayed here after servicing data processing is complete.</p>
        </div>
      ),
    },
    {
      value: 'delinquency',
      label: 'Delinquency',
      content: (
        <div className="space-y-4">
          {delinquency && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KPICard title="Total Delinquent" value={delinquency.totalDelinquent} icon={AlertTriangle} variant="accent" />
              <KPICard title="Average DPD" value={`${delinquency.avgDPD} days`} icon={TrendingDown} variant="primary" />
              <KPICard title="Recovery Rate" value={`${delinquency.recoveryRate}%`} icon={TrendingDown} variant="secondary" />
            </div>
          )}
          <DataTable data={delinquency?.entries || []} columns={[
            { key: 'loanId', label: 'Loan ID', render: (row: any) => <span className="font-medium text-accent-500">{row.loanId}</span> },
            { key: 'customer', label: 'Customer' },
            { key: 'dpd', label: 'DPD', render: (row: any) => <span className="font-semibold text-red-500">{row.dpd}</span> },
            { key: 'amount', label: 'Amount', render: (row: any) => formatCurrency(row.amount) },
            { key: 'bucket', label: 'Bucket' },
            { key: 'status', label: 'Status', render: (row: any) => <StatusBadge status={row.status} /> },
          ]} searchable loading={loading} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-h1 font-bold text-neutral-900 dark:text-neutral-100">Servicing</h1>
        <p className="text-body-sm text-neutral-500 dark:text-neutral-400 mt-0.5">File upload, NPA tracking, and delinquency management</p>
      </div>
      <Tabs tabs={tabs} />
    </div>
  );
}
