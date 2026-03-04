'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { useAppShell } from './AppShell';
import { useTheme } from '@/components/providers/ThemeProvider';
import {
  Bell, Search, LogOut, ChevronDown, Settings, User as UserIcon,
  Menu, Sun, Moon, Monitor,
} from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';

/** Enterprise top bar with global search, notifications, and user menu. Fixed at 56px. */
export default function EnterpriseTopBar() {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useAppShell();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Cmd+K shortcut hint
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search');
        searchInput?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-[56px] bg-white dark:bg-neutral-900 border-b border-surface-border dark:border-neutral-800 flex items-center justify-between px-4 z-header shadow-elevation-1 dark:shadow-none">
      {/* Left: Hamburger + Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:text-neutral-400 transition-colors duration-micro"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">IMGC</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-body-sm font-semibold text-neutral-900 dark:text-neutral-100 leading-tight">IMGC PAS</p>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 leading-tight">Policy Administration</p>
          </div>
        </div>

        {/* Environment badge */}
        <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-accent-100 text-accent-700 dark:bg-accent-950 dark:text-accent-400 uppercase tracking-wider">
          DEV
        </span>
      </div>

      {/* Center: Global Search */}
      <div className="flex-1 max-w-lg mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
          <input
            id="global-search"
            type="text"
            placeholder="Search policies, customers, claims..."
            className={cn(
              'w-full pl-9 pr-16 py-2 rounded-lg text-body-sm transition-all duration-micro',
              'bg-neutral-50 border border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700',
              'text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400',
              'focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500',
              searchFocused ? 'ring-2 ring-accent-500/30 border-accent-500' : ''
            )}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 rounded text-[10px] font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Theme toggle + Notifications + User */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors duration-micro"
          aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <NotificationBell />

        {/* User menu */}
        {user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-micro"
            >
              <div className="w-8 h-8 rounded-full bg-accent-500 text-white flex items-center justify-center text-small font-semibold">
                {user.name.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-body-sm font-medium text-neutral-900 dark:text-neutral-100 leading-tight">{user.name}</p>
                <p className="text-[10px] text-neutral-400 leading-tight">{user.role}</p>
              </div>
              <ChevronDown size={14} className="text-neutral-400 hidden md:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-2 border border-surface-border dark:border-neutral-700 py-1 z-popover animate-scale-in">
                <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-700">
                  <p className="text-body-sm font-semibold text-neutral-900 dark:text-neutral-100">{user.name}</p>
                  <p className="text-small text-neutral-400">{user.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-accent-50 text-accent-700 dark:bg-accent-950 dark:text-accent-300">
                    {user.role}
                  </span>
                </div>
                <button className="flex items-center gap-2 w-full px-4 py-2 text-body-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                  <UserIcon size={14} />
                  Profile
                </button>
                <button className="flex items-center gap-2 w-full px-4 py-2 text-body-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                  <Settings size={14} />
                  Preferences
                </button>
                <div className="border-t border-neutral-100 dark:border-neutral-700 mt-1 pt-1">
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-body-sm text-error hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
