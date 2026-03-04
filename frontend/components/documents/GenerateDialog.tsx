'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Modal from '@/components/ui/Modal';
import { FileText, Wand2 } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  type: string;
  description: string;
  category: string;
  fields: string[];
}

interface GenerateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (doc: any, htmlContent: string) => void;
  policyId?: string;
  claimId?: string;
  defaultData?: Record<string, string>;
}

export default function GenerateDialog({ isOpen, onClose, onGenerated, policyId, claimId, defaultData = {} }: GenerateDialogProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [mergeData, setMergeData] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState<'select' | 'fill'>('select');

  useEffect(() => {
    if (isOpen) {
      api.get('/documents/templates').then((res) => {
        if (res.success) setTemplates(res.data || []);
      });
      setStep('select');
      setSelectedTemplate(null);
      setMergeData({});
    }
  }, [isOpen]);

  const selectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    const data: Record<string, string> = {};
    template.fields.forEach((f) => {
      data[f] = defaultData[f] || '';
    });
    setMergeData(data);
    setStep('fill');
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    setGenerating(true);
    try {
      const res = await api.post('/documents/generate', {
        templateId: selectedTemplate.id,
        mergeData,
        policyId,
        claimId,
      });
      if (res.success) {
        onGenerated(res.data.document, res.data.htmlContent);
        onClose();
      }
    } finally {
      setGenerating(false);
    }
  };

  const formatFieldLabel = (field: string): string => {
    return field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Document" size="lg">
      {step === 'select' ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 mb-4">Select a document template to generate:</p>
          {templates.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No templates available</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => selectTemplate(t)}
                  className="text-left p-3 border border-gray-200 rounded-lg hover:border-imgc-orange hover:bg-orange-50/30 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <FileText size={16} className="text-imgc-orange mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
                      <span className="inline-block text-[10px] mt-1 px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{t.category}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : selectedTemplate ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
            <FileText size={16} className="text-imgc-orange" />
            <div>
              <p className="text-sm font-medium text-gray-900">{selectedTemplate.name}</p>
              <p className="text-xs text-gray-500">{selectedTemplate.description}</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 font-medium">Fill in the document fields:</p>

          <div className="space-y-3 max-h-[350px] overflow-y-auto">
            {selectedTemplate.fields.map((field) => (
              <div key={field}>
                <label className="form-label">{formatFieldLabel(field)}</label>
                <input
                  className="input-field"
                  value={mergeData[field] || ''}
                  onChange={(e) => setMergeData({ ...mergeData, [field]: e.target.value })}
                  placeholder={`Enter ${formatFieldLabel(field).toLowerCase()}`}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t">
            <button onClick={() => setStep('select')} className="btn-secondary">Back</button>
            <button onClick={handleGenerate} disabled={generating} className="btn-primary flex items-center gap-2">
              <Wand2 size={16} />
              {generating ? 'Generating...' : 'Generate Document'}
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
