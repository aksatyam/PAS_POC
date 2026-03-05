'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { useAppShell } from './AppShell';
import { UserRole } from '@/types';
import {
  LayoutDashboard, FileText, Users, Shield, AlertTriangle,
  FolderOpen, BarChart3, Settings, LogOut, BookOpen, CreditCard,
  ClipboardList, ShieldCheck, RefreshCw, Bell, Layers,
  ChevronLeft, ChevronRight, Inbox, FileEdit, HardDriveUpload,
  Landmark, Cog, ScrollText,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
  group: 'core' | 'financial' | 'reports' | 'admin';
  badge?: number;
}

const navItems: NavItem[] = [
  // Core Operations
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Operations', 'Underwriter', 'Claims', 'Viewer'], group: 'core' },
  { label: 'Service Desk', href: '/service-desk', icon: Inbox, roles: ['Admin', 'Operations', 'Underwriter'], group: 'core' },
  { label: 'DDE', href: '/dde', icon: FileEdit, roles: ['Admin', 'Operations', 'Underwriter'], group: 'core' },
  { label: 'Policies', href: '/policies', icon: FileText, roles: ['Admin', 'Operations', 'Underwriter', 'Claims', 'Viewer'], group: 'core' },
  { label: 'Renewals', href: '/renewals', icon: RefreshCw, roles: ['Admin', 'Operations', 'Underwriter'], group: 'core' },
  { label: 'Customers', href: '/customers', icon: Users, roles: ['Admin', 'Operations', 'Underwriter', 'Claims', 'Viewer'], group: 'core' },
  { label: 'Underwriting', href: '/underwriting', icon: Shield, roles: ['Admin', 'Operations', 'Underwriter', 'Viewer'], group: 'core' },
  { label: 'Claims', href: '/claims', icon: AlertTriangle, roles: ['Admin', 'Operations', 'Claims', 'Viewer'], group: 'core' },
  { label: 'FNOL', href: '/claims/fnol', icon: Bell, roles: ['Admin', 'Operations', 'Claims'], group: 'core' },
  { label: 'Servicing', href: '/servicing', icon: HardDriveUpload, roles: ['Admin', 'Operations'], group: 'core' },
  // Financial
  { label: 'Finance', href: '/finance', icon: Landmark, roles: ['Admin', 'Operations', 'Viewer'], group: 'financial' },
  { label: 'Billing', href: '/billing', icon: CreditCard, roles: ['Admin', 'Operations', 'Viewer'], group: 'financial' },
  { label: 'Tasks', href: '/tasks', icon: ClipboardList, roles: ['Admin', 'Operations', 'Underwriter', 'Claims'], group: 'financial' },
  // Reports & Docs
  { label: 'Documents', href: '/documents', icon: FolderOpen, roles: ['Admin', 'Operations'], group: 'reports' },
  { label: 'Reports', href: '/reports', icon: BarChart3, roles: ['Admin', 'Operations', 'Underwriter', 'Claims', 'Viewer'], group: 'reports' },
  { label: 'Docs', href: '/documentation', icon: BookOpen, roles: ['Admin', 'Operations', 'Underwriter', 'Claims', 'Viewer'], group: 'reports' },
  // Administration
  { label: 'Master Setup', href: '/master-setup', icon: Cog, roles: ['Admin'], group: 'admin' },
  { label: 'Audit Logs', href: '/audit-logs', icon: ScrollText, roles: ['Admin'], group: 'admin' },
  { label: 'Compliance', href: '/admin/compliance', icon: ShieldCheck, roles: ['Admin'], group: 'admin' },
  { label: 'Admin', href: '/admin', icon: Settings, roles: ['Admin'], group: 'admin' },
];

const groupLabels: Record<string, string> = {
  core: 'Core Operations',
  financial: 'Financial',
  reports: 'Reports & Docs',
  admin: 'Administration',
};

/** Enterprise sidebar with grouped navigation, role filtering, and collapse support. */
export default function EnterpriseSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { sidebarCollapsed, toggleSidebar } = useAppShell();

  const filteredNav = navItems.filter((item) => user && item.roles.includes(user.role));
  const groups = ['core', 'financial', 'reports', 'admin'].filter((g) =>
    filteredNav.some((item) => item.group === g)
  );

  return (
    <aside
      className={cn(
        'fixed top-[56px] left-0 h-[calc(100vh-56px)] flex flex-col',
        'bg-primary-500 dark:bg-neutral-900 text-white',
        'transition-all duration-standard z-sidebar',
        'border-r border-primary-600 dark:border-neutral-800',
        sidebarCollapsed ? 'w-[72px]' : 'w-[260px]',
        'max-lg:w-[72px]'
      )}
    >
      {/* Branding + Collapse toggle */}
      <div className="flex items-center justify-between px-3 py-3 max-lg:hidden border-b border-white/10 mb-1">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <span className="text-white font-bold text-[8px]">IMGC</span>
            </div>
            <span className="text-body-sm font-semibold text-white tracking-wide">IMGC PAS</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-white/10 transition-colors duration-micro"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin" role="navigation" aria-label="Main navigation">
        {groups.map((group) => (
          <div key={group} className="mb-2">
            {/* Group label — hidden when collapsed */}
            {!sidebarCollapsed && (
              <p className="px-4 py-1.5 text-[10px] uppercase tracking-widest font-semibold text-white/50 max-lg:hidden">
                {groupLabels[group]}
              </p>
            )}

            {filteredNav
              .filter((item) => item.group === group)
              .map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={cn(
                      'relative flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-body-sm font-medium',
                      'transition-colors duration-micro group',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white',
                      sidebarCollapsed && 'justify-center px-0 mx-1',
                      'max-lg:justify-center max-lg:px-0 max-lg:mx-1'
                    )}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 bg-orange-500 rounded-r-full" />
                    )}

                    <Icon size={18} className="flex-shrink-0" />

                    {/* Label — hidden when collapsed */}
                    {!sidebarCollapsed && (
                      <span className="truncate max-lg:hidden">{item.label}</span>
                    )}

                    {/* Badge */}
                    {item.badge && item.badge > 0 && (
                      <span className={cn(
                        'ml-auto bg-accent-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1',
                        sidebarCollapsed && 'absolute -top-0.5 -right-0.5 ml-0',
                        'max-lg:absolute max-lg:-top-0.5 max-lg:-right-0.5 max-lg:ml-0'
                      )}>
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}

                    {/* Tooltip for collapsed mode */}
                    {(sidebarCollapsed) && (
                      <span className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-small rounded shadow-elevation-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-tooltip max-lg:block hidden lg:group-hover:opacity-100">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
          </div>
        ))}
      </nav>

      {/* Bottom user section */}
      <div className="border-t border-white/10 p-3">
        {!sidebarCollapsed && user && (
          <div className="mb-2 max-lg:hidden">
            <p className="text-body-sm font-medium truncate">{user.name}</p>
            <p className="text-small text-white/50 truncate">{user.role}</p>
          </div>
        )}
        <button
          onClick={logout}
          className={cn(
            'flex items-center gap-2 text-body-sm text-white/60 hover:text-white transition-colors w-full rounded-lg py-2 px-2 hover:bg-white/10',
            sidebarCollapsed && 'justify-center',
            'max-lg:justify-center'
          )}
        >
          <LogOut size={16} />
          {!sidebarCollapsed && <span className="max-lg:hidden">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
