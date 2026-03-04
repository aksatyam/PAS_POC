'use client';

import {
  useCallback,
  useRef,
  useState,
  type DragEvent,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import { Upload, File, FileText, Image, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Props for the FileUpload component.
 *
 * @property accept   - Comma-separated MIME types or extensions (e.g. `".pdf,.jpg"`).
 * @property maxSize  - Maximum file size in megabytes. Defaults to `10`.
 * @property multiple - Allow selecting more than one file. Defaults to `false`.
 * @property onChange  - Callback receiving the current array of accepted files.
 * @property value     - Controlled file list for external state management.
 * @property label     - Label displayed above the drop zone.
 * @property error     - External error message rendered below the drop zone.
 * @property disabled  - Disables the entire upload interaction.
 */
interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  onChange: (files: File[]) => void;
  value?: File[];
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

type DropZoneState = 'idle' | 'dragover' | 'error';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Picks a Lucide icon based on the file's MIME type.
 */
function FileIcon({ mimeType }: { mimeType: string }): ReactNode {
  if (mimeType.startsWith('image/')) {
    return <Image size={18} className="text-accent-500 shrink-0" aria-hidden="true" />;
  }
  if (
    mimeType === 'application/pdf' ||
    mimeType.startsWith('text/')
  ) {
    return <FileText size={18} className="text-accent-500 shrink-0" aria-hidden="true" />;
  }
  return <File size={18} className="text-neutral-500 shrink-0" aria-hidden="true" />;
}

/**
 * Formats bytes into a human-readable string (KB / MB).
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Drag-and-drop file upload zone for the IMGC PAS enterprise system.
 *
 * Supports click-to-browse, multi-file selection, type restrictions, and
 * per-file size validation. Files that pass validation are emitted via the
 * `onChange` callback; rejected files surface an inline error.
 *
 * @example
 * ```tsx
 * const [docs, setDocs] = useState<File[]>([]);
 *
 * <FileUpload
 *   label="Policy Documents"
 *   accept=".pdf,.jpg,.png"
 *   maxSize={5}
 *   multiple
 *   value={docs}
 *   onChange={setDocs}
 * />
 * ```
 */
export default function FileUpload({
  accept,
  maxSize = 10,
  multiple = false,
  onChange,
  value = [],
  label,
  error: externalError,
  disabled = false,
  className,
}: FileUploadProps): ReactNode {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [zoneState, setZoneState] = useState<DropZoneState>('idle');
  const [internalError, setInternalError] = useState<string | null>(null);

  const error = externalError ?? internalError;
  const maxSizeBytes = maxSize * 1024 * 1024;

  // ------ Validation --------------------------------------------------------

  const validateFiles = useCallback(
    (incoming: FileList | File[]): File[] => {
      const accepted: File[] = [];
      const errors: string[] = [];

      for (const file of Array.from(incoming)) {
        if (file.size > maxSizeBytes) {
          errors.push(`"${file.name}" exceeds ${maxSize} MB limit`);
          continue;
        }
        accepted.push(file);
      }

      if (errors.length > 0) {
        setInternalError(errors.join('. '));
        setZoneState('error');
      } else {
        setInternalError(null);
        setZoneState('idle');
      }

      return accepted;
    },
    [maxSize, maxSizeBytes],
  );

  // ------ Handlers ----------------------------------------------------------

  const handleFiles = useCallback(
    (incoming: FileList | File[]) => {
      const valid = validateFiles(incoming);
      if (valid.length === 0) return;

      if (multiple) {
        onChange([...value, ...valid]);
      } else {
        onChange(valid.slice(0, 1));
      }
    },
    [multiple, onChange, validateFiles, value],
  );

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!disabled) setZoneState('dragover');
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setZoneState('idle');
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setZoneState('idle');
      if (disabled) return;
      handleFiles(e.dataTransfer.files);
    },
    [disabled, handleFiles],
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
      // Reset so the same file can be re-selected.
      e.target.value = '';
    },
    [handleFiles],
  );

  const handleRemoveFile = useCallback(
    (index: number) => {
      const next = value.filter((_, i) => i !== index);
      onChange(next);
      if (next.length === 0) {
        setInternalError(null);
        setZoneState('idle');
      }
    },
    [onChange, value],
  );

  const openFilePicker = useCallback(() => {
    if (!disabled) fileInputRef.current?.click();
  }, [disabled]);

  // ------ Render ------------------------------------------------------------

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <span className="text-body-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </span>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleInputChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload files"
        aria-disabled={disabled || undefined}
        onClick={openFilePicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openFilePicker();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          // Base
          'relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6',
          'cursor-pointer select-none transition-colors duration-fast ease-out-custom',

          // Focus
          'focus-visible:outline-none focus-visible:shadow-focus-ring',
          'dark:focus-visible:shadow-focus-ring-dark',

          // Disabled
          disabled && 'cursor-not-allowed opacity-50',

          // State: idle
          zoneState === 'idle' && [
            'border-neutral-300 bg-neutral-50 hover:border-accent-400 hover:bg-accent-50/50',
            'dark:border-neutral-600 dark:bg-neutral-900 dark:hover:border-accent-400 dark:hover:bg-accent-900/20',
          ],

          // State: dragover
          zoneState === 'dragover' && [
            'border-accent-500 bg-accent-50',
            'dark:border-accent-400 dark:bg-accent-900/30',
          ],

          // State: error
          zoneState === 'error' && [
            'border-error bg-red-50',
            'dark:border-red-500 dark:bg-red-900/20',
          ],
        )}
      >
        <Upload
          size={28}
          className={cn(
            'transition-colors duration-fast',
            zoneState === 'dragover'
              ? 'text-accent-500 dark:text-accent-400'
              : 'text-neutral-400 dark:text-neutral-500',
          )}
          aria-hidden="true"
        />

        <div className="text-center">
          <p className="text-body-sm font-medium text-neutral-700 dark:text-neutral-300">
            {zoneState === 'dragover' ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-small text-neutral-500 dark:text-neutral-400 mt-0.5">
            or{' '}
            <span className="text-accent-500 underline underline-offset-2 dark:text-accent-400">
              browse
            </span>
            {maxSize && ` (max ${maxSize} MB)`}
          </p>
        </div>

        {accept && (
          <p className="text-small text-neutral-400 dark:text-neutral-500">
            Accepted: {accept}
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <p role="alert" className="text-small text-error dark:text-red-400">
          {error}
        </p>
      )}

      {/* File list */}
      {value.length > 0 && (
        <ul className="flex flex-col gap-1.5 mt-1" aria-label="Uploaded files">
          {value.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${index}`}
              className={cn(
                'flex items-center gap-2 rounded-md border px-3 py-2',
                'border-neutral-200 bg-white',
                'dark:border-neutral-700 dark:bg-neutral-800',
              )}
            >
              <FileIcon mimeType={file.type} />

              <div className="flex-1 min-w-0">
                <p className="text-body-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                  {file.name}
                </p>
                <p className="text-small text-neutral-500 dark:text-neutral-400">
                  {formatFileSize(file.size)}
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(index);
                }}
                disabled={disabled}
                aria-label={`Remove ${file.name}`}
                className={cn(
                  'shrink-0 rounded p-1 transition-colors duration-micro',
                  'text-neutral-400 hover:text-error hover:bg-red-50',
                  'dark:text-neutral-500 dark:hover:text-red-400 dark:hover:bg-red-900/30',
                  'focus-visible:outline-none focus-visible:shadow-focus-ring',
                  'dark:focus-visible:shadow-focus-ring-dark',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export { FileUpload };
export type { FileUploadProps };
