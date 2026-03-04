'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DataTable, { Column } from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/lib/toast';
import { Upload, Wand2, FolderOpen, Eye, CheckCircle, Trash2 } from 'lucide-react';
import FileUpload from '@/components/documents/FileUpload';
import DocumentViewer from '@/components/documents/DocumentViewer';
import GenerateDialog from '@/components/documents/GenerateDialog';

interface Document {
  id: string;
  policyId: string;
  claimId?: string;
  type: string;
  category: string;
  filename: string;
  mimeType: string;
  size: number;
  uploadDate: string;
  uploadedBy: string;
  version: number;
  generatedFrom?: string;
  metadata: Record<string, any>;
}

const CATEGORY_TABS = ['All', 'Policy', 'Claims', 'Underwriting', 'Correspondence', 'Billing', 'General'];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [showUpload, setShowUpload] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [viewerDoc, setViewerDoc] = useState<any>(null);
  const { addToast } = useToast();

  const load = async () => {
    try {
      const params: Record<string, string> = {};
      if (activeTab !== 'All') params.category = activeTab;
      const res = await api.get('/documents', params);
      if (res.success) setDocuments(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [activeTab]);

  const handleUpload = async (file: { filename: string; mimeType: string; size: number; type: string; category: string }) => {
    const res = await api.post('/documents', file);
    if (res.success) {
      addToast({ type: 'success', title: 'Uploaded', message: `${file.filename} uploaded successfully` });
      load();
    }
  };

  const handleGenerated = (doc: any, htmlContent: string) => {
    addToast({ type: 'success', title: 'Generated', message: `Document "${doc.filename}" generated` });
    load();
    setViewerDoc({ ...doc, htmlContent });
  };

  const handleVerify = async (docId: string) => {
    const res = await api.put(`/documents/${docId}/verify`);
    if (res.success) {
      addToast({ type: 'success', title: 'Verified', message: 'Document marked as verified' });
      load();
    }
  };

  const handleDelete = async (docId: string) => {
    const res = await api.delete(`/documents/${docId}`);
    if (res.success) {
      addToast({ type: 'success', title: 'Deleted', message: 'Document removed' });
      load();
    }
  };

  const columns: Column<Document>[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'policyId', label: 'Policy', sortable: true, render: (row) => row.policyId || '—' },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'category', label: 'Category', sortable: true, render: (row) => (
      <span className="text-small px-2 py-0.5 bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 rounded">{row.category || 'General'}</span>
    )},
    { key: 'filename', label: 'Filename', render: (row) => (
      <span className="text-small font-mono truncate max-w-[200px] block text-neutral-900 dark:text-neutral-100">{row.filename}</span>
    )},
    { key: 'size', label: 'Size', render: (row) => `${(row.size / 1024).toFixed(0)} KB` },
    { key: 'version', label: 'Ver', render: (row) => (
      <span className="text-small px-1.5 py-0.5 bg-info-50 text-info-700 dark:bg-info-900/30 dark:text-info-400 rounded">v{row.version || 1}</span>
    )},
    { key: 'uploadDate', label: 'Uploaded', sortable: true, render: (row) => formatDate(row.uploadDate) },
    { key: 'metadata', label: 'Status', render: (row) => (
      <StatusBadge status={row.metadata?.isVerified === true || row.metadata?.isVerified === 'true' ? 'Verified' : 'Pending'} />
    )},
    { key: 'actions' as any, label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <button onClick={() => setViewerDoc(row)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded transition-colors" title="Preview">
          <Eye size={14} className="text-neutral-500 dark:text-neutral-400" />
        </button>
        {row.metadata?.isVerified !== true && row.metadata?.isVerified !== 'true' && (
          <button onClick={() => handleVerify(row.id)} className="p-1 hover:bg-success-50 dark:hover:bg-success-900/20 rounded transition-colors" title="Verify">
            <CheckCircle size={14} className="text-success-500 dark:text-success-400" />
          </button>
        )}
        <button onClick={() => handleDelete(row.id)} className="p-1 hover:bg-error-50 dark:hover:bg-error-900/20 rounded transition-colors" title="Delete">
          <Trash2 size={14} className="text-error-400 dark:text-error-500" />
        </button>
      </div>
    )},
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-header mb-0">Document Management</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowGenerate(true)} className="btn-secondary flex items-center gap-2 text-sm">
            <Wand2 size={16} /> Generate
          </button>
          <button onClick={() => setShowUpload(!showUpload)} className="btn-primary flex items-center gap-2 text-sm">
            <Upload size={16} /> Upload
          </button>
        </div>
      </div>

      {/* Upload zone */}
      {showUpload && (
        <div className="mb-6 card overflow-hidden">
          <div className="px-5 py-3 border-b border-surface-border dark:border-neutral-700">
            <h3 className="text-body-sm font-semibold text-neutral-900 dark:text-neutral-100">Upload Document</h3>
          </div>
          <div className="p-4">
            <FileUpload onUpload={handleUpload} />
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div className="flex gap-1 mb-4 border-b border-surface-border dark:border-neutral-700 overflow-x-auto">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setLoading(true); }}
            className={`px-4 py-2 text-body-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-accent-500 text-accent-500 dark:text-accent-400'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={documents}
        loading={loading}
        searchable
        emptyIcon={FolderOpen}
        emptyMessage="No documents found"
      />

      {/* Document Viewer */}
      <DocumentViewer
        isOpen={!!viewerDoc}
        onClose={() => setViewerDoc(null)}
        document={viewerDoc}
      />

      {/* Generate Dialog */}
      <GenerateDialog
        isOpen={showGenerate}
        onClose={() => setShowGenerate(false)}
        onGenerated={handleGenerated}
      />
    </div>
  );
}
