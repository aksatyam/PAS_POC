'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Customer, PremiumCalculation, PolicyType } from '@/types';
import { formatCurrency } from '@/lib/utils';
import PremiumBreakdown from '@/components/policy/PremiumBreakdown';
import { useToast } from '@/lib/toast';
import { ChevronRight, ChevronLeft, Users, Shield, Calculator, CheckCircle, Loader2 } from 'lucide-react';

const STEPS = ['Select Customer', 'Configure Coverage', 'Review Premium', 'Confirm & Create'];

export default function QuoteWizardPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [step, setStep] = useState(0);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [premiumCalc, setPremiumCalc] = useState<PremiumCalculation | null>(null);

  const [form, setForm] = useState({
    customerId: '',
    policyType: 'Mortgage Guarantee' as PolicyType,
    coverageAmount: '500000',
    startDate: '',
    endDate: '',
    riskCategory: 'Medium' as 'Low' | 'Medium' | 'High',
    creditScore: '700',
    ltvRatio: '80',
    propertyValue: '1000000',
  });

  useEffect(() => {
    api.get('/customers').then((res) => {
      if (res.success) setCustomers(res.data || []);
    }).finally(() => setLoadingCustomers(false));
  }, []);

  const selectedCustomer = customers.find((c) => c.id === form.customerId);

  const handleCalculate = async () => {
    setCalculating(true);
    try {
      const res = await api.post('/policies/calculate-premium', {
        policyType: form.policyType,
        coverageAmount: Number(form.coverageAmount),
        riskCategory: form.riskCategory,
        creditScore: Number(form.creditScore),
        ltvRatio: Number(form.ltvRatio),
        propertyValue: Number(form.propertyValue),
      });
      if (res.success) {
        setPremiumCalc(res.data);
        setStep(2);
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Calculation Failed', message: err.message });
    } finally {
      setCalculating(false);
    }
  };

  const handleCreateQuote = async () => {
    setCreating(true);
    try {
      const res = await api.post('/policies/quote', {
        customerId: form.customerId,
        policyType: form.policyType,
        coverageAmount: Number(form.coverageAmount),
        startDate: form.startDate,
        endDate: form.endDate,
        riskCategory: form.riskCategory,
        creditScore: Number(form.creditScore),
        ltvRatio: Number(form.ltvRatio),
        propertyValue: Number(form.propertyValue),
      });
      if (res.success) {
        addToast({ type: 'success', title: 'Quote Created', message: `Quote ${res.data.id} created successfully` });
        router.push(`/policies/${res.data.id}`);
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Creation Failed', message: err.message });
    } finally {
      setCreating(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return !!form.customerId;
    if (step === 1) return !!form.coverageAmount && !!form.startDate && !!form.endDate;
    if (step === 2) return !!premiumCalc;
    return true;
  };

  return (
    <div className="animate-fade-in">
      <h1 className="page-header">Create New Quote</h1>

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i < step ? 'bg-green-500 text-white' :
                i === step ? 'bg-imgc-orange text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {i < step ? <CheckCircle size={16} /> : i + 1}
              </div>
              <span className={`text-sm hidden md:block ${i === step ? 'text-imgc-orange font-medium' : 'text-gray-500'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 0: Select Customer */}
      {step === 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-imgc-orange" />
            <h2 className="font-semibold">Select Customer</h2>
          </div>
          {loadingCustomers ? (
            <div className="flex items-center gap-2 text-gray-500 py-8 justify-center">
              <Loader2 size={16} className="animate-spin" /> Loading customers...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {customers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setForm({ ...form, customerId: c.id, riskCategory: c.riskCategory })}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    form.customerId === c.id
                      ? 'border-imgc-orange bg-imgc-orange/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-sm">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.id} &middot; {c.email}</p>
                  <p className="text-xs text-gray-400 mt-1">Risk: {c.riskCategory}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 1: Configure Coverage */}
      {step === 1 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-imgc-orange" />
            <h2 className="font-semibold">Configure Coverage</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Policy Type</label>
              <select className="input-field" value={form.policyType} onChange={(e) => setForm({ ...form, policyType: e.target.value as PolicyType })}>
                <option>Mortgage Guarantee</option>
                <option>Credit Protection</option>
                <option>Coverage Plus</option>
              </select>
            </div>
            <div>
              <label className="form-label">Coverage Amount (INR)</label>
              <input type="number" className="input-field" value={form.coverageAmount} onChange={(e) => setForm({ ...form, coverageAmount: e.target.value })} required />
            </div>
            <div>
              <label className="form-label">Start Date</label>
              <input type="date" className="input-field" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            </div>
            <div>
              <label className="form-label">End Date</label>
              <input type="date" className="input-field" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
            </div>
            <div>
              <label className="form-label">Risk Category</label>
              <select className="input-field" value={form.riskCategory} onChange={(e) => setForm({ ...form, riskCategory: e.target.value as any })}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="form-label">Credit Score</label>
              <input type="number" className="input-field" value={form.creditScore} onChange={(e) => setForm({ ...form, creditScore: e.target.value })} min="300" max="900" />
            </div>
            <div>
              <label className="form-label">LTV Ratio (%)</label>
              <input type="number" className="input-field" value={form.ltvRatio} onChange={(e) => setForm({ ...form, ltvRatio: e.target.value })} min="0" max="100" />
            </div>
            <div>
              <label className="form-label">Property Value (INR)</label>
              <input type="number" className="input-field" value={form.propertyValue} onChange={(e) => setForm({ ...form, propertyValue: e.target.value })} />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Review Premium */}
      {step === 2 && premiumCalc && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PremiumBreakdown calculation={premiumCalc} />
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Calculator size={18} className="text-imgc-orange" />
              <h3 className="font-semibold">Quote Summary</h3>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Customer</dt><dd className="font-medium">{selectedCustomer?.name || form.customerId}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Policy Type</dt><dd className="font-medium">{form.policyType}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Coverage</dt><dd className="font-medium">{formatCurrency(Number(form.coverageAmount))}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Risk Category</dt><dd className="font-medium">{form.riskCategory}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Period</dt><dd className="font-medium">{form.startDate} to {form.endDate}</dd></div>
            </dl>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Annual Premium</span>
                <span className="text-2xl font-bold text-imgc-orange">{formatCurrency(premiumCalc.totalPremium)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div className="card text-center py-8">
          <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
          <h2 className="text-xl font-semibold mb-2">Ready to Create Quote</h2>
          <p className="text-gray-500 mb-6">
            Quote for <strong>{selectedCustomer?.name}</strong> with premium of <strong>{formatCurrency(premiumCalc?.totalPremium || 0)}</strong>
          </p>
          <button onClick={handleCreateQuote} disabled={creating} className="btn-primary text-lg px-8 py-3">
            {creating ? (
              <span className="flex items-center gap-2"><Loader2 size={18} className="animate-spin" /> Creating Quote...</span>
            ) : (
              'Create Quote'
            )}
          </button>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setStep(step - 1)}
          disabled={step === 0}
          className="btn-secondary flex items-center gap-1"
        >
          <ChevronLeft size={16} /> Back
        </button>
        {step < 3 && (
          <button
            onClick={() => {
              if (step === 1) handleCalculate();
              else setStep(step + 1);
            }}
            disabled={!canProceed() || calculating}
            className="btn-primary flex items-center gap-1"
          >
            {calculating ? (
              <><Loader2 size={16} className="animate-spin" /> Calculating...</>
            ) : (
              <>{step === 1 ? 'Calculate Premium' : 'Next'} <ChevronRight size={16} /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
