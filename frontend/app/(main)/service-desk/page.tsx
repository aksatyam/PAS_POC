'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import Tabs from '@/components/ui/Tabs';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import WorkflowProgress from '@/components/ui/WorkflowProgress';
import { PlusCircle, Search, Users, LayoutDashboard, Save, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

const STEPS = [
  { label: 'Loan Basic', description: 'Basic loan information' },
  { label: 'Applicant Details', description: 'Borrower and address info' },
  { label: 'Loan Characteristics', description: 'Loan parameters' },
  { label: 'Obligations', description: 'Existing obligations' },
  { label: 'Verification', description: 'Review and verify' },
];

function AddNewLoanForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const updateField = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));

  const renderField = (label: string, key: string, type = 'text', options?: string[]) => (
    <div key={key}>
      <label className="block text-small font-medium text-neutral-600 dark:text-neutral-400 mb-1">{label}</label>
      {options ? (
        <select value={formData[key] || ''} onChange={e => updateField(key, e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-body-sm text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none">
          <option value="">Select...</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={formData[key] || ''} onChange={e => updateField(key, e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-body-sm text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none"
          placeholder={`Enter ${label.toLowerCase()}`} />
      )}
    </div>
  );

  const stepContent = [
    // Step 1: Loan Basic
    <div key="s1" className="space-y-6">
      <h4 className="text-body-sm font-semibold text-neutral-800 dark:text-neutral-200 border-b border-neutral-100 dark:border-neutral-700 pb-2">Loan Basic Details</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {renderField('Lender Name', 'lender', 'text', ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Mahindra'])}
        {renderField('Deal ID', 'dealId')}
        {renderField('Loan Amount (₹)', 'loanAmount', 'number')}
        {renderField('Product Type', 'productType', 'text', ['Home Loan', 'LAP', 'Construction Loan', 'Balance Transfer'])}
        {renderField('Loan Purpose', 'loanPurpose', 'text', ['Purchase', 'Construction', 'Renovation', 'Balance Transfer'])}
        {renderField('Tenure (months)', 'tenure', 'number')}
      </div>
    </div>,
    // Step 2: Applicant Details
    <div key="s2" className="space-y-6">
      <h4 className="text-body-sm font-semibold text-neutral-800 dark:text-neutral-200 border-b border-neutral-100 dark:border-neutral-700 pb-2">Borrower Details</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {renderField('First Name', 'firstName')}
        {renderField('Last Name', 'lastName')}
        {renderField('PAN Number', 'pan')}
        {renderField('Mobile Number', 'mobile')}
        {renderField('Email', 'email', 'email')}
        {renderField('Date of Birth', 'dob', 'date')}
      </div>
      <h4 className="text-body-sm font-semibold text-neutral-800 dark:text-neutral-200 border-b border-neutral-100 dark:border-neutral-700 pb-2 mt-4">Address Details</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {renderField('Address Line 1', 'address1')}
        {renderField('City', 'city')}
        {renderField('State', 'state', 'text', ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Gujarat', 'Rajasthan'])}
        {renderField('PIN Code', 'pinCode')}
      </div>
      <h4 className="text-body-sm font-semibold text-neutral-800 dark:text-neutral-200 border-b border-neutral-100 dark:border-neutral-700 pb-2 mt-4">IMGC Details</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderField('IMGC Reference No', 'imgcRef')}
        {renderField('Guarantee Type', 'guaranteeType', 'text', ['Standard', 'Enhanced', 'Premium'])}
      </div>
    </div>,
    // Step 3: Loan Characteristics
    <div key="s3" className="space-y-6">
      <h4 className="text-body-sm font-semibold text-neutral-800 dark:text-neutral-200 border-b border-neutral-100 dark:border-neutral-700 pb-2">Loan Characteristics</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {renderField('LTV Ratio (%)', 'ltv', 'number')}
        {renderField('FOIR (%)', 'foir', 'number')}
        {renderField('Interest Rate (%)', 'interestRate', 'number')}
        {renderField('Property Type', 'propertyType', 'text', ['Apartment', 'Independent House', 'Villa', 'Plot', 'Commercial'])}
        {renderField('Property Value (₹)', 'propertyValue', 'number')}
        {renderField('Property Zone', 'propertyZone', 'text', ['Zone A', 'Zone B', 'Zone C'])}
        {renderField('Employment Type', 'empType', 'text', ['Salaried', 'Self-Employed', 'Business'])}
        {renderField('Gross Monthly Income (₹)', 'grossIncome', 'number')}
        {renderField('CIBIL Score', 'cibilScore', 'number')}
      </div>
    </div>,
    // Step 4: Obligations
    <div key="s4" className="space-y-6">
      <h4 className="text-body-sm font-semibold text-neutral-800 dark:text-neutral-200 border-b border-neutral-100 dark:border-neutral-700 pb-2">Existing Obligations</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {renderField('Existing EMI (₹)', 'existingEmi', 'number')}
        {renderField('Total Liabilities (₹)', 'totalLiabilities', 'number')}
        {renderField('Number of Existing Loans', 'existingLoans', 'number')}
        {renderField('Credit Card Outstanding (₹)', 'creditCardOutstanding', 'number')}
      </div>
      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 mt-4">
        <p className="text-small text-blue-600 dark:text-blue-400">All existing obligations will be verified during the DDE stage against CIBIL report and bank statements.</p>
      </div>
    </div>,
    // Step 5: Verification
    <div key="s5" className="space-y-6">
      <h4 className="text-body-sm font-semibold text-neutral-800 dark:text-neutral-200 border-b border-neutral-100 dark:border-neutral-700 pb-2">Review & Verify</h4>
      <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-4 flex items-center gap-3">
        <CheckCircle size={20} className="text-emerald-500" />
        <p className="text-body-sm text-emerald-700 dark:text-emerald-400">All required fields have been filled. Please review the information below before submitting.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(formData).filter(([, v]) => v).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-neutral-700">
            <span className="text-small text-neutral-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            <span className="text-body-sm font-medium text-neutral-900 dark:text-neutral-100">{value}</span>
          </div>
        ))}
      </div>
    </div>,
  ];

  return (
    <div className="space-y-6">
      {/* Step Progress */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-6">
        <div className="flex items-center gap-1 mb-6">
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  i < currentStep ? 'bg-emerald-500 border-emerald-500 text-white' :
                  i === currentStep ? 'bg-orange-500 border-orange-500 text-white' :
                  'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-400'
                }`}>
                  {i < currentStep ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span className={`text-[10px] font-medium mt-1 whitespace-nowrap ${
                  i < currentStep ? 'text-emerald-600 dark:text-emerald-400' :
                  i === currentStep ? 'text-orange-600 dark:text-orange-400 font-semibold' :
                  'text-neutral-400'
                }`}>{step.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mt-[-18px] ${i < currentStep ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-600'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Draft indicator */}
        <div className="flex items-center gap-2 mb-4 text-small text-neutral-400">
          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-semibold">DRAFT</span>
          Auto-saved at {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </div>

        {/* Step Content */}
        {stepContent[currentStep]}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-neutral-100 dark:border-neutral-700">
          <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-body-sm font-medium text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <ArrowLeft size={14} /> Previous
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 text-body-sm font-medium text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
            <Save size={14} /> Save Draft
          </button>
          {currentStep < STEPS.length - 1 ? (
            <button onClick={() => setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1))}
              className="flex items-center gap-1.5 px-4 py-2 text-body-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors">
              Next <ArrowRight size={14} />
            </button>
          ) : (
            <button className="flex items-center gap-1.5 px-4 py-2 text-body-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors">
              <CheckCircle size={14} /> Submit Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ServiceDeskPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [autoAllocation, setAutoAllocation] = useState<any[]>([]);
  const [userDashboard, setUserDashboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [appsRes, allocRes, dashRes] = await Promise.all([
          api.get('/service-desk/applications'),
          api.get('/service-desk/auto-allocation'),
          api.get('/service-desk/user-dashboard'),
        ]);
        if (appsRes.success) setApplications(appsRes.data || []);
        if (allocRes.success) setAutoAllocation(allocRes.data || []);
        if (dashRes.success) setUserDashboard(dashRes.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    loadData();
  }, []);

  const tabs = [
    {
      value: 'add-new',
      label: 'Add New Loan',
      badge: undefined,
      content: <AddNewLoanForm />,
    },
    {
      value: 'auto-allocation',
      label: 'Auto Allocation',
      content: (
        <DataTable
          data={autoAllocation}
          columns={[
            { key: 'queueName', label: 'Queue Name' },
            { key: 'assignedUser', label: 'Assigned To' },
            { key: 'pendingCount', label: 'Pending', render: (row: any) => <span className="font-semibold text-orange-500">{row.pendingCount}</span> },
            { key: 'lastAllocated', label: 'Last Allocated', render: (row: any) => formatDate(row.lastAllocated) },
            { key: 'status', label: 'Status', render: (row: any) => <StatusBadge status={row.status} /> },
          ]}
          searchable
          loading={loading}
        />
      ),
    },
    {
      value: 'qde-search',
      label: 'QDE Search',
      content: (
        <DataTable
          data={applications}
          columns={[
            { key: 'id', label: 'Application ID', render: (row: any) => <span className="font-medium text-accent-500">{row.id}</span> },
            { key: 'customer', label: 'Customer' },
            { key: 'lender', label: 'Lender' },
            { key: 'amount', label: 'Loan Amount', render: (row: any) => formatCurrency(row.amount) },
            { key: 'stage', label: 'Stage', render: (row: any) => <StatusBadge status={row.stage} /> },
            { key: 'status', label: 'Status', render: (row: any) => <StatusBadge status={row.status} /> },
            { key: 'date', label: 'Date', render: (row: any) => formatDate(row.date) },
          ]}
          searchable
          loading={loading}
        />
      ),
    },
    {
      value: 'user-dashboard',
      label: 'User Dashboard',
      content: (
        <DataTable
          data={userDashboard}
          columns={[
            { key: 'id', label: 'Application ID', render: (row: any) => <span className="font-medium text-accent-500">{row.id}</span> },
            { key: 'customer', label: 'Customer' },
            { key: 'stage', label: 'Stage', render: (row: any) => <StatusBadge status={row.stage} /> },
            { key: 'status', label: 'Status', render: (row: any) => <StatusBadge status={row.status} /> },
            { key: 'dueDate', label: 'Due Date', render: (row: any) => formatDate(row.dueDate) },
            { key: 'priority', label: 'Priority', render: (row: any) => (
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                row.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                row.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              }`}>{row.priority}</span>
            )},
          ]}
          searchable
          loading={loading}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-neutral-900 dark:text-neutral-100">Service Desk</h1>
          <p className="text-body-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Quick Data Entry (QDE) - Loan Application Processing</p>
        </div>
      </div>

      <WorkflowProgress currentStage="qde" />

      <Tabs tabs={tabs} />
    </div>
  );
}
