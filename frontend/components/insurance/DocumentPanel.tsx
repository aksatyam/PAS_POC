'use client';

import { useState, useCallback } from 'react';
import { cn, formatDate } from '@/lib/utils';
import {
  FileText,
  Image,
  Upload,
  FolderOpen,
  File,
  ChevronDown,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Trash2,
} from 'lucide-react';

interface Document {
  id: string;
  filename: string;
  type: string;
  category: string;
  size: number;
  version: number;
  uploadedAt: string;
  uploadedBy: string;
  expiryDate?: string;
  signatureStatus?: 'signed' | 'pending' | 'none';
}

interface DocumentPanelProps {
  documents: Document[];
  entityId: string;
  entityType: 'policy' | 'claim';
  onUpload?: (file: File) => void;
  onView?: (doc: Document) => void;
  onDelete?: (docId: string) => void;
  className?: string;
}

const CATEGORIES = [
  { key: 'KYC', label: 'KYC Documents', icon: FileText },
  { key: 'Property', label: 'Property Documents', icon: FolderOpen },
  { key: 'Valuation', label: 'Valuation Reports', icon: File },
  { key: 'Correspondence', label: 'Correspondence', icon: FileText },
  { key: 'Other', label: 'Other', icon: File },
] as const;

const CATEGORY_KEYS = CATEGORIES.map(c => c.key);

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp']);

function getFileIcon(filename: string): typeof FileText {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (IMAGE_EXTENSIONS.has(ext)) return Image;
  return FileText;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

function getExpiryStatus(date?: string): 'expired' | 'expiring-soon' | 'valid' | 'none' {
  if (!date) return 'none';
  const diff = new Date(date).getTime() - Date.now();
  if (diff <= 0) return 'expired';
  if (diff < 30 * 24 * 60 * 60 * 1000) return 'expiring-soon';
  return 'valid';
}

export default function DocumentPanel({
  documents,
  entityId: _entityId,
  entityType: _entityType,
  onUpload,
  onView,
  onDelete,
  className,
}: DocumentPanelProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['KYC', 'Property'])
  );
  const [isDragOver, setIsDragOver] = useState(false);

  function toggleCategory(key: string): void {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(f => onUpload?.(f));
  }, [onUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const categorizedDocs = CATEGORIES.map(cat => ({
    ...cat,
    docs: documents.filter(doc => {
      if (doc.category === cat.key) return true;
      // Documents with unrecognized categories fall into "Other"
      if (cat.key === 'Other' && !CATEGORY_KEYS.includes(doc.category as typeof CATEGORY_KEYS[number])) return true;
      return false;
    }),
  }));

  return (
    <div className={cn(
      'bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 overflow-hidden',
      className
    )}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-surface-border dark:border-neutral-700 flex items-center justify-between">
        <h3 className="text-body-sm font-semibold text-neutral-700 dark:text-neutral-200">
          Documents ({documents.length})
        </h3>
      </div>

      {/* Drop zone */}
      {onUpload && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'mx-4 mt-4 p-4 border-2 border-dashed rounded-lg text-center transition-colors duration-micro cursor-pointer',
            isDragOver
              ? 'border-accent-500 bg-accent-50 dark:bg-accent-950'
              : 'border-neutral-300 dark:border-neutral-600 hover:border-accent-400'
          )}
        >
          <Upload size={20} className="mx-auto mb-1 text-neutral-400" />
          <p className="text-small text-neutral-500 dark:text-neutral-400">
            Drop files here or <span className="text-accent-500 font-medium">browse</span>
          </p>
        </div>
      )}

      {/* Categorized document list */}
      <div className="p-2">
        {categorizedDocs.map(cat => {
          const isExpanded = expandedCategories.has(cat.key);
          const CategoryIcon = cat.icon;

          return (
            <div key={cat.key} className="mb-1">
              <button
                onClick={() => toggleCategory(cat.key)}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-micro"
              >
                {isExpanded
                  ? <ChevronDown size={14} />
                  : <ChevronRight size={14} />
                }
                <CategoryIcon size={14} className="text-neutral-400" />
                <span className="text-small font-medium text-neutral-700 dark:text-neutral-200 flex-1 text-left">
                  {cat.label}
                </span>
                <span className="text-caption text-neutral-400 bg-neutral-100 dark:bg-neutral-700 px-1.5 py-0.5 rounded">
                  {cat.docs.length}
                </span>
              </button>

              {isExpanded && cat.docs.length > 0 && (
                <div className="ml-6 space-y-1 pb-1">
                  {cat.docs.map(doc => (
                    <DocumentRow
                      key={doc.id}
                      doc={doc}
                      onView={onView}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Document Row ──────────────────────────────────────────────────────── */

interface DocumentRowProps {
  doc: Document;
  onView?: (doc: Document) => void;
  onDelete?: (docId: string) => void;
}

function DocumentRow({ doc, onView, onDelete }: DocumentRowProps) {
  const Icon = getFileIcon(doc.filename);
  const expiryStatus = getExpiryStatus(doc.expiryDate);

  return (
    <div className="group flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
      <Icon size={14} className="text-neutral-400 flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <p className="text-small font-medium text-neutral-700 dark:text-neutral-200 truncate">
          {doc.filename}
        </p>
        <p className="text-caption text-neutral-400">
          {formatFileSize(doc.size)} · v{doc.version}

          {expiryStatus === 'expired' && (
            <span className="ml-1.5 text-error inline-flex items-center gap-0.5">
              <AlertTriangle size={10} /> Expired
            </span>
          )}
          {expiryStatus === 'expiring-soon' && doc.expiryDate && (
            <span className="ml-1.5 text-warning inline-flex items-center gap-0.5">
              <Clock size={10} /> Expires {formatDate(doc.expiryDate)}
            </span>
          )}

          {doc.signatureStatus === 'signed' && (
            <span className="ml-1.5 text-success inline-flex items-center gap-0.5">
              <CheckCircle size={10} /> Signed
            </span>
          )}
        </p>
      </div>

      {/* Action buttons (visible on hover) */}
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {onView && (
          <button
            onClick={() => onView(doc)}
            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600"
          >
            <Eye size={12} className="text-neutral-500" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(doc.id)}
            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 size={12} className="text-neutral-400 hover:text-error" />
          </button>
        )}
      </div>
    </div>
  );
}
