'use client';

import { X, Download, FileText, Image, File } from 'lucide-react';

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    filename: string;
    mimeType: string;
    type: string;
    htmlContent?: string;
  } | null;
}

export default function DocumentViewer({ isOpen, onClose, document }: DocumentViewerProps) {
  if (!isOpen || !document) return null;

  const isHTML = document.mimeType === 'text/html' || !!document.htmlContent;
  const isPDF = document.mimeType === 'application/pdf';
  const isImage = document.mimeType?.startsWith('image/');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-[90vw] max-w-4xl h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 rounded-t-lg">
          <div className="flex items-center gap-2">
            {isImage ? <Image size={16} className="text-purple-600" /> :
             isPDF ? <FileText size={16} className="text-red-600" /> :
             <File size={16} className="text-blue-600" />}
            <span className="text-sm font-medium text-gray-900">{document.filename}</span>
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{document.type}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Download">
              <Download size={16} className="text-gray-600" />
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded transition-colors">
              <X size={16} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-100">
          {isHTML && document.htmlContent ? (
            <div className="bg-white shadow-md rounded max-w-3xl mx-auto">
              <div dangerouslySetInnerHTML={{ __html: document.htmlContent }} />
            </div>
          ) : isPDF ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FileText size={64} className="text-red-300 mb-4" />
              <p className="text-sm font-medium">PDF Preview</p>
              <p className="text-xs text-gray-400 mt-1">{document.filename}</p>
              <p className="text-xs text-gray-400 mt-3">In a production environment, this would render the PDF.</p>
            </div>
          ) : isImage ? (
            <div className="flex items-center justify-center h-full">
              <div className="bg-white shadow-md rounded p-4">
                <Image size={64} className="text-purple-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400 text-center">{document.filename}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <File size={64} className="text-gray-300 mb-4" />
              <p className="text-sm font-medium">Preview not available</p>
              <p className="text-xs text-gray-400 mt-1">{document.filename}</p>
              <button className="mt-4 btn-primary text-xs flex items-center gap-1">
                <Download size={14} /> Download File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
