'use client';

import {
  Building2, Handshake, Layers, Upload, FileText, UserCog,
  GitBranch, HardHat, MapPin, Link2, AlertTriangle, Shield,
  Scale, Settings,
} from 'lucide-react';

const configCards = [
  { icon: Building2, title: 'Lender Setup', description: 'Configure lender profiles and onboarding parameters', records: 24 },
  { icon: Handshake, title: 'Deal Setup', description: 'Manage deal structures and terms configuration', records: 156 },
  { icon: Layers, title: 'Scheme Setup', description: 'Define guarantee schemes and coverage parameters', records: 18 },
  { icon: Upload, title: 'Pricing Upload', description: 'Upload and manage pricing tables and rate cards', records: 42 },
  { icon: FileText, title: 'Template Management', description: 'Configure document templates and letter formats', records: 67 },
  { icon: UserCog, title: 'Role Management', description: 'Define roles, permissions, and access controls', records: 12 },
  { icon: GitBranch, title: 'Workflow Config', description: 'Configure workflow stages, rules, and transitions', records: 8 },
  { icon: HardHat, title: 'Builder/Project Master', description: 'Manage builder profiles and project registrations', records: 234 },
  { icon: MapPin, title: 'City Classification', description: 'Define city tiers and location-based parameters', records: 892 },
  { icon: Link2, title: 'Vendor Mapping', description: 'Map vendors for valuation, legal, and technical services', records: 156 },
  { icon: AlertTriangle, title: 'Deviation Master', description: 'Configure deviation types and approval matrices', records: 45 },
  { icon: Shield, title: 'Collateral Master', description: 'Define collateral types and valuation parameters', records: 34 },
  { icon: Scale, title: 'Regulatory Compliance', description: 'Manage regulatory requirements and compliance rules', records: 28 },
  { icon: Settings, title: 'System Settings', description: 'Global system configuration and environment settings', records: 15 },
];

export default function MasterSetupPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-h1 font-bold text-neutral-900 dark:text-neutral-100">Master Setup</h1>
        <p className="text-body-sm text-neutral-500 dark:text-neutral-400 mt-0.5">System configuration and master data management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {configCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-5 hover:shadow-card-hover cursor-pointer transition-all duration-standard group"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center mb-3 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40 transition-colors">
                <Icon size={20} className="text-orange-500" />
              </div>
              <h3 className="text-body-sm font-semibold text-neutral-900 dark:text-neutral-100">{card.title}</h3>
              <p className="text-small text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">{card.description}</p>
              <p className="text-small font-semibold text-orange-500 mt-2">{card.records} records</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
