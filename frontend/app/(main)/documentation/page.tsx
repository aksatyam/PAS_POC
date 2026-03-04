'use client';

import { BookOpen, Download, ExternalLink, FileText, Shield, Users, BarChart3, Settings, AlertTriangle } from 'lucide-react';

const sections = [
  { title: 'Authentication & RBAC', description: 'JWT-based auth with 5 roles: Admin, Operations, Underwriter, Claims, Viewer', icon: <Shield size={20} /> },
  { title: 'Policy Lifecycle', description: 'Full CRUD with versioning, status transitions (Draft → Active → Lapsed/Cancelled/Expired)', icon: <FileText size={20} /> },
  { title: 'Customer Management', description: 'Customer records with risk categorization and linked policies', icon: <Users size={20} /> },
  { title: 'Underwriting Engine', description: '6 rule-based engine: credit score, LTV ratio, age, income, geographic risk', icon: <Shield size={20} /> },
  { title: 'Claims Module', description: 'Claim lifecycle: Filed → Under Review → Approved/Rejected → Settled', icon: <AlertTriangle size={20} /> },
  { title: 'Dashboard & Reports', description: 'KPI cards, charts, policy/claims analytics with date-range filtering', icon: <BarChart3 size={20} /> },
  { title: 'Admin & Audit', description: 'User management, role assignment, full audit trail with PII masking', icon: <Settings size={20} /> },
];

export default function DocumentationPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">Documentation</h1>
        <p className="text-gray-500 mt-1">PAS Prototype Enterprise Documentation v1.0</p>
      </div>

      {/* Download card */}
      <div className="card bg-gradient-to-r from-imgc-navy to-imgc-navy-light text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-lg">
              <BookOpen size={32} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">PAS Enterprise Documentation</h2>
              <p className="text-white/80 text-sm mt-1">Complete system documentation including architecture, API specs, SOW deliverables, and deployment guide</p>
            </div>
          </div>
          <div className="flex gap-3">
            <a
              href="/docs/PAS_Enterprise_Documentation.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
            >
              <ExternalLink size={16} />
              View PDF
            </a>
            <a
              href="/docs/PAS_Enterprise_Documentation.pdf"
              download
              className="flex items-center gap-2 px-4 py-2 bg-white text-pas-navy rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              <Download size={16} />
              Download
            </a>
          </div>
        </div>
      </div>

      {/* Module overview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((s) => (
            <div key={s.title} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary-50 text-imgc-orange rounded-lg">{s.icon}</div>
                <div>
                  <h4 className="font-medium text-gray-900">{s.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{s.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick reference */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">User Roles</h4>
            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
              <p><span className="text-gray-500 font-mono">Admin</span> — Full system access</p>
              <p><span className="text-gray-500 font-mono">Operations</span> — Policy & billing management</p>
              <p><span className="text-gray-500 font-mono">Underwriter</span> — Risk evaluation & approvals</p>
              <p><span className="text-gray-500 font-mono">Claims</span> — Claims processing & FNOL</p>
              <p><span className="text-gray-500 font-mono">Viewer</span> — Read-only access</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">API Endpoints</h4>
            <div className="bg-gray-50 rounded-lg p-4 text-sm font-mono space-y-1">
              <p><span className="text-gray-500">Base URL:</span> http://localhost:4000/api/v1</p>
              <p><span className="text-gray-500">Swagger:</span> http://localhost:4000/api-docs</p>
              <p className="mt-2 text-gray-400">Auth, Policies, Customers, Claims,</p>
              <p className="text-gray-400">Underwriting, Documents, Dashboard, Admin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
