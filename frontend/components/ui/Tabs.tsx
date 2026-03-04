'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────

interface TabItem {
  /** Unique value used to identify this tab. */
  value: string;
  /** Display label for the tab trigger. */
  label: string;
  /** Optional numeric badge shown beside the label. */
  badge?: number;
  /** Whether this tab is disabled and non-interactive. */
  disabled?: boolean;
  /** The panel content rendered when this tab is active. */
  content: ReactNode;
}

interface TabsProps {
  /** Array of tab definitions. */
  tabs: TabItem[];
  /** The currently active tab value (controlled mode). */
  value: string;
  /** Callback fired when the active tab changes. */
  onChange: (value: string) => void;
  /** Additional class names for the root container. */
  className?: string;
}

// ── Component ──────────────────────────────────────────────────────

/**
 * Horizontal tab navigation with an animated underline indicator.
 *
 * Features:
 * - Controlled mode via `value` and `onChange`
 * - Animated underline indicator using framer-motion `layoutId`
 * - Badge count support per tab
 * - Disabled tab state
 * - Keyboard navigation (ArrowLeft, ArrowRight, Home, End)
 * - Lazy rendering: only the active panel is mounted
 * - Full ARIA support (tablist, tab, tabpanel)
 * - Dark mode
 *
 * @example
 * ```tsx
 * const [tab, setTab] = useState('overview');
 *
 * <Tabs
 *   value={tab}
 *   onChange={setTab}
 *   tabs={[
 *     { value: 'overview', label: 'Overview', content: <Overview /> },
 *     { value: 'claims', label: 'Claims', badge: 12, content: <Claims /> },
 *     { value: 'documents', label: 'Documents', disabled: true, content: null },
 *   ]}
 * />
 * ```
 */
function Tabs({ tabs, value, onChange, className }: TabsProps): ReactNode {
  const instanceId = useId();
  const tabListRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const enabledTabs = tabs.filter((tab) => !tab.disabled);
  const activeTab = tabs.find((tab) => tab.value === value);

  // Derive IDs for ARIA relationships
  function getTabId(tabValue: string): string {
    return `${instanceId}-tab-${tabValue}`;
  }

  function getPanelId(tabValue: string): string {
    return `${instanceId}-panel-${tabValue}`;
  }

  // Find the next enabled tab index in a given direction, wrapping around
  const findNextEnabledIndex = useCallback(
    (currentIndex: number, direction: 1 | -1): number => {
      const totalTabs = tabs.length;
      let nextIndex = currentIndex;

      for (let i = 0; i < totalTabs; i++) {
        nextIndex = (nextIndex + direction + totalTabs) % totalTabs;
        if (!tabs[nextIndex].disabled) {
          return nextIndex;
        }
      }
      return currentIndex;
    },
    [tabs],
  );

  // Find first and last enabled indices
  const findFirstEnabledIndex = useCallback((): number => {
    return tabs.findIndex((tab) => !tab.disabled);
  }, [tabs]);

  const findLastEnabledIndex = useCallback((): number => {
    for (let i = tabs.length - 1; i >= 0; i--) {
      if (!tabs[i].disabled) return i;
    }
    return 0;
  }, [tabs]);

  // Focus the tab button at the given index
  const focusTabAtIndex = useCallback(
    (index: number) => {
      if (!tabListRef.current) return;
      const buttons = tabListRef.current.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]:not([disabled])',
      );
      // Map the absolute index to the enabled-only list for focusing
      const enabledIndex = enabledTabs.findIndex(
        (t) => t.value === tabs[index]?.value,
      );
      if (enabledIndex >= 0 && buttons[enabledIndex]) {
        buttons[enabledIndex].focus();
      }
    },
    [enabledTabs, tabs],
  );

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const currentIndex = tabs.findIndex((tab) => tab.value === value);
      let targetIndex: number | null = null;

      switch (event.key) {
        case 'ArrowRight':
          targetIndex = findNextEnabledIndex(currentIndex, 1);
          break;
        case 'ArrowLeft':
          targetIndex = findNextEnabledIndex(currentIndex, -1);
          break;
        case 'Home':
          targetIndex = findFirstEnabledIndex();
          break;
        case 'End':
          targetIndex = findLastEnabledIndex();
          break;
        default:
          return;
      }

      if (targetIndex !== null && targetIndex !== currentIndex) {
        event.preventDefault();
        onChange(tabs[targetIndex].value);
        setFocusedIndex(targetIndex);
        focusTabAtIndex(targetIndex);
      }
    },
    [
      tabs,
      value,
      onChange,
      findNextEnabledIndex,
      findFirstEnabledIndex,
      findLastEnabledIndex,
      focusTabAtIndex,
    ],
  );

  // Sync focused index when value changes externally
  useEffect(() => {
    const index = tabs.findIndex((tab) => tab.value === value);
    if (index >= 0) {
      setFocusedIndex(index);
    }
  }, [value, tabs]);

  return (
    <div className={cn('w-full', className)}>
      {/* Tab List */}
      <div
        ref={tabListRef}
        role="tablist"
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
        className={cn(
          'relative flex border-b border-neutral-200 dark:border-neutral-700',
          'overflow-x-auto scrollbar-none',
        )}
      >
        {tabs.map((tab, index) => {
          const isActive = tab.value === value;
          const isDisabled = !!tab.disabled;

          return (
            <button
              key={tab.value}
              type="button"
              id={getTabId(tab.value)}
              role="tab"
              aria-selected={isActive}
              aria-controls={getPanelId(tab.value)}
              aria-disabled={isDisabled || undefined}
              disabled={isDisabled}
              tabIndex={isActive ? 0 : -1}
              onClick={() => {
                if (!isDisabled) {
                  onChange(tab.value);
                  setFocusedIndex(index);
                }
              }}
              className={cn(
                'relative shrink-0 px-4 py-3 text-body-sm font-medium',
                'transition-colors duration-fast whitespace-nowrap',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-1',
                'dark:focus-visible:ring-secondary-400',
                isActive && 'text-accent-600 dark:text-secondary-400',
                !isActive &&
                  !isDisabled &&
                  'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200',
                isDisabled &&
                  'text-neutral-300 dark:text-neutral-600 cursor-not-allowed',
              )}
            >
              <span className="inline-flex items-center gap-2">
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={cn(
                      'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5',
                      'text-small font-semibold rounded-full',
                      isActive
                        ? 'bg-accent-100 text-accent-700 dark:bg-secondary-900 dark:text-secondary-300'
                        : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400',
                      isDisabled && 'opacity-50',
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </span>

              {/* Animated underline indicator */}
              {isActive && (
                <motion.div
                  layoutId={`${instanceId}-tab-underline`}
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-600 dark:bg-secondary-400"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel (lazy render) */}
      {activeTab && (
        <div
          key={activeTab.value}
          id={getPanelId(activeTab.value)}
          role="tabpanel"
          aria-labelledby={getTabId(activeTab.value)}
          tabIndex={0}
          className="mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-md"
        >
          {activeTab.content}
        </div>
      )}
    </div>
  );
}

export default Tabs;
export type { TabItem, TabsProps };
