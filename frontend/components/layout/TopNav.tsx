'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, FileText, Users, Shield, AlertTriangle,
  FolderOpen, BarChart3, Settings, LogOut, BookOpen, Bell, ChevronDown, RefreshCw,
  ClipboardList,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { UserRole } from '@/types';
import NotificationBell from '@/components/notifications/NotificationBell';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={16} />, roles: ['Admin', 'Operations', 'Underwriter', 'Claims', 'Viewer'] },
  { label: 'Policies', href: '/policies', icon: <FileText size={16} />, roles: ['Admin', 'Operations', 'Underwriter', 'Claims', 'Viewer'] },
  { label: 'Renewals', href: '/renewals', icon: <RefreshCw size={16} />, roles: ['Admin', 'Operations', 'Underwriter'] },
  { label: 'Customers', href: '/customers', icon: <Users size={16} />, roles: ['Admin', 'Operations', 'Underwriter', 'Claims', 'Viewer'] },
  { label: 'Underwriting', href: '/underwriting', icon: <Shield size={16} />, roles: ['Admin', 'Operations', 'Underwriter', 'Viewer'] },
  { label: 'Claims', href: '/claims', icon: <AlertTriangle size={16} />, roles: ['Admin', 'Operations', 'Claims', 'Viewer'] },
  { label: 'FNOL', href: '/claims/fnol', icon: <Bell size={16} />, roles: ['Admin', 'Operations', 'Claims'] },
  { label: 'Tasks', href: '/tasks', icon: <ClipboardList size={16} />, roles: ['Admin', 'Operations', 'Underwriter', 'Claims'] },
  { label: 'Documents', href: '/documents', icon: <FolderOpen size={16} />, roles: ['Admin', 'Operations'] },
  { label: 'Reports', href: '/reports', icon: <BarChart3 size={16} />, roles: ['Admin', 'Operations', 'Underwriter', 'Claims', 'Viewer'] },
  { label: 'Documentation', href: '/documentation', icon: <BookOpen size={16} />, roles: ['Admin', 'Operations', 'Underwriter', 'Claims', 'Viewer'] },
  { label: 'Admin', href: '/admin', icon: <Settings size={16} />, roles: ['Admin'] },
];

export default function TopNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredNav = navItems.filter((item) => user && item.roles.includes(user.role));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-imgc-navy shadow-enterprise-md sticky top-0 z-50">
      {/* Top bar with logo and user info */}
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          {/* IMGC Logo - orange circle with text */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-imgc-orange to-imgc-orange-light flex items-center justify-center">
              <span className="text-white font-bold text-xs">IMGC</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-white text-sm font-semibold leading-tight">IMGC</p>
              <p className="text-gray-400 text-[10px] leading-tight">Policy Administration System</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
          {user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-white/10 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-imgc-orange text-white flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-white text-xs font-medium leading-tight">{user.name}</p>
                  <p className="text-gray-400 text-[10px] leading-tight">{user.role}</p>
                </div>
                <ChevronDown size={14} className="text-gray-400" />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation bar with orange gradient */}
      <nav className="bg-gradient-to-r from-imgc-orange to-imgc-orange-light">
        <div className="flex items-center px-2 overflow-x-auto scrollbar-hide">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-white/25 text-white'
                    : 'text-white/80 hover:bg-white/15 hover:text-white'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
