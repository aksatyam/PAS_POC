'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import EnterpriseTopBar from './EnterpriseTopBar';
import EnterpriseSidebar from './EnterpriseSidebar';
import BreadcrumbBar from './BreadcrumbBar';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

interface AppShellContextType {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;
}

const AppShellContext = createContext<AppShellContextType>({
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
  toggleSidebar: () => {},
});

export function useAppShell() {
  return useContext(AppShellContext);
}

/** Enterprise application shell with collapsible sidebar, top bar, and breadcrumb context bar. */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) setSidebarCollapsed(true);
    };
    handler(mq);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  return (
    <AppShellContext.Provider value={{ sidebarCollapsed, setSidebarCollapsed, toggleSidebar }}>
      <div className="min-h-screen bg-surface-bg dark:bg-neutral-950">
        {/* Top Bar — fixed, full width */}
        <EnterpriseTopBar />

        <div className="flex pt-[56px]">
          {/* Sidebar — fixed, below top bar */}
          <EnterpriseSidebar />

          {/* Main content area */}
          <main
            id="main-content"
            role="main"
            className={cn(
              'flex-1 min-h-[calc(100vh-56px)] transition-all duration-standard',
              sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]',
              'max-lg:ml-[72px]'
            )}
          >
            {/* Breadcrumb context bar */}
            <BreadcrumbBar />

            {/* Page content */}
            <div key={pathname} className="p-6 max-w-content mx-auto animate-slide-up">
              <ErrorBoundary>{children}</ErrorBoundary>
            </div>

            {/* Status bar */}
            <div className="fixed bottom-0 right-0 h-[32px] bg-neutral-50 dark:bg-neutral-900 border-t border-surface-border dark:border-neutral-800 flex items-center px-4 text-small text-neutral-400 dark:text-neutral-500 z-10"
              style={{ left: sidebarCollapsed ? '72px' : '260px' }}>
              <span>IMGC PAS v3.2.1</span>
              <span className="mx-2">|</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                Connected
              </span>
            </div>
          </main>
        </div>
      </div>
    </AppShellContext.Provider>
  );
}
