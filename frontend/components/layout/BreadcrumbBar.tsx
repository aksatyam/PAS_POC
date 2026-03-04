'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Route-to-label mapping for human-friendly breadcrumb names */
const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  policies: 'Policies',
  customers: 'Customers',
  underwriting: 'Underwriting',
  referrals: 'Referrals',
  rules: 'UW Rules',
  claims: 'Claims',
  fnol: 'FNOL',
  billing: 'Billing',
  tasks: 'Tasks',
  documents: 'Documents',
  reports: 'Reports',
  admin: 'Administration',
  compliance: 'Compliance',
  documentation: 'Documentation',
  products: 'Products',
  'bulk-operations': 'Bulk Operations',
  renewals: 'Renewals',
  notifications: 'Notifications',
  quote: 'Quote',
  new: 'New',
  login: 'Login',
};

function formatSegment(segment: string): string {
  // If it's a known route label, use it
  if (routeLabels[segment]) return routeLabels[segment];
  // If it looks like a policy/claim ID, keep it as-is but uppercase
  if (/^[A-Z]{2,}-\d+/.test(segment) || /^[a-f0-9-]{36}$/.test(segment)) return segment;
  // Otherwise, capitalize first letter and replace hyphens with spaces
  return segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Context bar with breadcrumb navigation below the top bar. */
export default function BreadcrumbBar() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  const breadcrumbs = segments.map((segment, i) => ({
    label: formatSegment(segment),
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }));

  return (
    <div className="sticky top-[56px] z-sticky bg-white dark:bg-neutral-900 border-b border-surface-border dark:border-neutral-800 h-[40px] flex items-center px-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-body-sm">
        <Link
          href="/dashboard"
          className="text-neutral-400 hover:text-accent-500 dark:text-neutral-500 dark:hover:text-accent-400 transition-colors duration-micro"
        >
          <Home size={14} />
        </Link>

        {breadcrumbs.map((crumb) => (
          <span key={crumb.href} className="flex items-center gap-1">
            <ChevronRight size={12} className="text-neutral-300 dark:text-neutral-600" />
            {crumb.isLast ? (
              <span className="text-neutral-700 dark:text-neutral-200 font-medium" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-neutral-400 hover:text-accent-500 dark:text-neutral-500 dark:hover:text-accent-400 transition-colors duration-micro"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>
    </div>
  );
}
