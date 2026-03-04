'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, FileText, Users, Shield, AlertTriangle,
  FolderOpen, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight, BookOpen,
  CreditCard, ClipboardList, ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { UserRole } from '@/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['Admin', 'Operations', 'Underwriter', 'Claims', 'Viewer'] },
  { label: 'Policies', href: '/policies', icon: <FileText size={20} />, roles: ['Admin', 'Operations', 'Underwriter', 'Claims', 'Viewer'] },
  { label: 'Customers', href: '/customers', icon: <Users size={20} />, roles: ['Admin', 'Operations', 'Underwriter', 'Claims', 'Viewer'] },
  { label: 'Underwriting', href: '/underwriting', icon: <Shield size={20} />, roles: ['Admin', 'Operations', 'Underwriter', 'Viewer'] },
  { label: 'Referrals', href: '/underwriting/referrals', icon: <Shield size={20} />, roles: ['Admin', 'Underwriter'] },
  { label: 'Claims', href: '/claims', icon: <AlertTriangle size={20} />, roles: ['Admin', 'Operations', 'Claims', 'Viewer'] },
  { label: 'Billing', href: '/billing', icon: <CreditCard size={20} />, roles: ['Admin', 'Operations', 'Viewer'] },
  { label: 'Tasks', href: '/tasks', icon: <ClipboardList size={20} />, roles: ['Admin', 'Operations', 'Underwriter', 'Claims'] },
  { label: 'Documents', href: '/documents', icon: <FolderOpen size={20} />, roles: ['Admin', 'Operations'] },
  { label: 'Reports', href: '/reports', icon: <BarChart3 size={20} />, roles: ['Admin', 'Operations', 'Underwriter', 'Claims', 'Viewer'] },
  { label: 'Compliance', href: '/admin/compliance', icon: <ShieldCheck size={20} />, roles: ['Admin'] },
  { label: 'Documentation', href: '/documentation', icon: <BookOpen size={20} />, roles: ['Admin', 'Operations', 'Underwriter', 'Claims', 'Viewer'] },
  { label: 'Admin', href: '/admin', icon: <Settings size={20} />, roles: ['Admin'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, hasRole } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const filteredNav = navItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <aside className={cn('h-screen bg-pas-navy text-white flex flex-col transition-all duration-300', collapsed ? 'w-16' : 'w-64')}>
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed && <h1 className="text-lg font-bold tracking-wider">PAS</h1>}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 hover:bg-white/10 rounded">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href + item.label} href={item.href} className={cn('flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors text-sm', isActive ? 'bg-accent-500 text-white font-semibold' : 'text-gray-300 hover:bg-white/10 hover:text-white')}>
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        {!collapsed && user && (
          <div className="mb-3">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.role}</p>
          </div>
        )}
        <button onClick={logout} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors w-full">
          <LogOut size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
