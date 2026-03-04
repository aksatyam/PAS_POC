'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, File, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onUpload: (file: { filename: string; mimeType: string; size: number; type: string; category: string }) => Promise<void>;
  categories?: string[];
  accept?: string;
}

export default function FileUpload({ onUpload, categories = ['Policy', 'Claims', 'Underwriting', 'Correspondence', 'General'], accept }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('Other');
  const [category, setCategory] = useState('General');
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setUploaded(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
      setUploaded(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      await onUpload({
        filename: selectedFile.name,
        mimeType: selectedFile.type || 'application/octet-stream',
        size: selectedFile.size,
        type: docType,
        category,
      });
      setUploaded(true);
      setTimeout(() => {
        setSelectedFile(null);
        setUploaded(false);
      }, 2000);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-imgc-orange bg-orange-50'
            : uploaded
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 hover:border-imgc-orange hover:bg-orange-50/30'
        }`}
      >
        <input ref={inputRef} type="file" className="hidden" onChange={handleChange} accept={accept} />
        {uploaded ? (
          <>
            <CheckCircle className="mx-auto mb-2 text-green-500" size={36} />
            <p className="text-sm font-medium text-green-700">Uploaded successfully!</p>
          </>
        ) : selectedFile ? (
          <>
            <File className="mx-auto mb-2 text-imgc-orange" size={36} />
            <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
            <p className="text-xs text-gray-500 mt-1">{(selectedFile.size / 1024).toFixed(0)} KB</p>
          </>
        ) : (
          <>
            <Upload className="mx-auto mb-2 text-gray-400" size={36} />
            <p className="text-sm font-medium text-gray-700">Drop a file here or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, JPG, PNG up to 10MB</p>
          </>
        )}
      </div>

      {selectedFile && !uploaded && (
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="form-label">Document Type</label>
            <select className="input-field" value={docType} onChange={(e) => setDocType(e.target.value)}>
              <option>Other</option>
              <option>Identity Proof</option>
              <option>Property Document</option>
              <option>Income Proof</option>
              <option>Claim Form</option>
              <option>Application Form</option>
              <option>Credit Report</option>
              <option>Damage Assessment</option>
              <option>Medical Report</option>
              <option>Police Report</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="form-label">Category</label>
            <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={handleSubmit} disabled={uploading} className="btn-primary whitespace-nowrap">
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          <button onClick={() => setSelectedFile(null)} className="btn-secondary p-2">
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
