'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CommandCategory = 'Pages' | 'Actions' | 'Recent' | (string & {});

/**
 * A single item displayed in the command palette.
 *
 * @property id          - Unique identifier.
 * @property label       - Primary display text.
 * @property description - Optional secondary text.
 * @property icon        - Optional React node rendered before the label.
 * @property category    - Grouping bucket (Pages, Actions, Recent, etc.).
 * @property action      - Callback invoked when the item is selected.
 * @property shortcut    - Optional keyboard shortcut hint (e.g. `"Ctrl+N"`).
 */
interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  category: CommandCategory;
  action: () => void;
  shortcut?: string;
}

/**
 * Props for the CommandPalette component.
 *
 * @property items   - Full list of command items to search and display.
 * @property isOpen  - Controlled open state.
 * @property onClose - Callback invoked when the palette should close.
 */
interface CommandPaletteProps {
  items: CommandItem[];
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OVERLAY_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const PANEL_VARIANTS = {
  hidden: { opacity: 0, scale: 0.95, y: -8 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

const TRANSITION = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 35,
  mass: 0.8,
};

/** Category display order. Unlisted categories appear last. */
const CATEGORY_ORDER: Record<string, number> = {
  Recent: 0,
  Pages: 1,
  Actions: 2,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Groups items by category and sorts the groups according to
 * `CATEGORY_ORDER`.
 */
function groupByCategory(
  items: CommandItem[],
): { category: string; items: CommandItem[] }[] {
  const map = new Map<string, CommandItem[]>();

  for (const item of items) {
    const existing = map.get(item.category);
    if (existing) {
      existing.push(item);
    } else {
      map.set(item.category, [item]);
    }
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => {
      const orderA = CATEGORY_ORDER[a] ?? 999;
      const orderB = CATEGORY_ORDER[b] ?? 999;
      return orderA - orderB;
    })
    .map(([category, items]) => ({ category, items }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Cmd+K command palette for the IMGC PAS enterprise system.
 *
 * Provides real-time fuzzy filtering across categorised command items with
 * full keyboard navigation (arrow keys, Enter, Escape) and a Framer Motion
 * scale-in animation. The palette listens for `Cmd+K` / `Ctrl+K` globally to
 * toggle open state.
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * useEffect(() => {
 *   function onKeyDown(e: KeyboardEvent) {
 *     if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
 *       e.preventDefault();
 *       setIsOpen((o) => !o);
 *     }
 *   }
 *   document.addEventListener('keydown', onKeyDown);
 *   return () => document.removeEventListener('keydown', onKeyDown);
 * }, []);
 *
 * <CommandPalette
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   items={[
 *     { id: '1', label: 'Dashboard', category: 'Pages', action: () => router.push('/') },
 *     { id: '2', label: 'New Policy', category: 'Actions', action: () => {}, shortcut: 'Ctrl+N' },
 *   ]}
 * />
 * ```
 */
export default function CommandPalette({
  items,
  isOpen,
  onClose,
}: CommandPaletteProps): ReactNode {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  // ------ Filtering ---------------------------------------------------------

  const filtered = useMemo(() => {
    if (query.trim() === '') return items;
    const lower = query.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(lower) ||
        item.description?.toLowerCase().includes(lower) ||
        item.category.toLowerCase().includes(lower),
    );
  }, [items, query]);

  const grouped = useMemo(() => groupByCategory(filtered), [filtered]);

  /** Flat list of filtered items for keyboard navigation indexing. */
  const flatItems = useMemo(
    () => grouped.flatMap((g) => g.items),
    [grouped],
  );

  /** Map from item id to its flat index for O(1) lookups during render. */
  const flatIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    flatItems.forEach((item, i) => map.set(item.id, i));
    return map;
  }, [flatItems]);

  // ------ Effects -----------------------------------------------------------

  // Reset state when opening / closing.
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      // Defer focus to allow AnimatePresence to mount the DOM.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Global Cmd+K / Ctrl+K listener.
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    }
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose]);

  // Keep active index in bounds when the filtered list changes.
  useEffect(() => {
    setActiveIndex((prev) => Math.min(prev, Math.max(flatItems.length - 1, 0)));
  }, [flatItems.length]);

  // ------ Handlers ----------------------------------------------------------

  const selectItem = useCallback(
    (item: CommandItem) => {
      onClose();
      item.action();
    },
    [onClose],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % Math.max(flatItems.length, 1));
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          setActiveIndex((prev) =>
            prev <= 0 ? Math.max(flatItems.length - 1, 0) : prev - 1,
          );
          break;
        }
        case 'Enter': {
          e.preventDefault();
          const item = flatItems[activeIndex];
          if (item) selectItem(item);
          break;
        }
        case 'Escape': {
          e.preventDefault();
          onClose();
          break;
        }
      }
    },
    [activeIndex, flatItems, onClose, selectItem],
  );

  // Scroll the active item into view.
  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.querySelector('[data-active="true"]');
    active?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  // ------ Render ------------------------------------------------------------

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="command-overlay"
            variants={OVERLAY_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-command bg-black/40 dark:bg-black/60"
            aria-hidden="true"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            key="command-panel"
            role="dialog"
            aria-label="Command palette"
            aria-modal="true"
            variants={PANEL_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={TRANSITION}
            className={cn(
              'fixed left-1/2 top-[20%] z-command -translate-x-1/2 w-full max-w-lg',
              'rounded-xl border shadow-elevation-4 overflow-hidden',
              'bg-white border-neutral-200',
              'dark:bg-neutral-900 dark:border-neutral-700',
            )}
            onKeyDown={handleKeyDown}
          >
            {/* Search input */}
            <div
              className={cn(
                'flex items-center gap-2 px-4 border-b',
                'border-neutral-200 dark:border-neutral-700',
              )}
            >
              <Search
                size={18}
                className="shrink-0 text-neutral-400 dark:text-neutral-500"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls="command-list"
                aria-activedescendant={
                  flatItems[activeIndex]
                    ? `command-item-${flatItems[activeIndex].id}`
                    : undefined
                }
                placeholder="Search pages, actions..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                className={cn(
                  'flex-1 h-12 bg-transparent text-body-sm',
                  'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
                  'text-neutral-900 dark:text-neutral-100',
                  'focus:outline-none',
                )}
              />
              <kbd
                className={cn(
                  'hidden sm:inline-flex items-center gap-0.5 rounded px-1.5 py-0.5',
                  'text-small font-mono text-neutral-400 bg-neutral-100 border border-neutral-200',
                  'dark:text-neutral-500 dark:bg-neutral-800 dark:border-neutral-700',
                )}
                aria-hidden="true"
              >
                Esc
              </kbd>
            </div>

            {/* Results */}
            <div
              ref={listRef}
              id="command-list"
              role="listbox"
              aria-label="Commands"
              className="max-h-80 overflow-y-auto py-2"
            >
              {flatItems.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <p className="text-body-sm text-neutral-500 dark:text-neutral-400">
                    No results found
                  </p>
                  <p className="text-small text-neutral-400 dark:text-neutral-500 mt-1">
                    Try a different search term
                  </p>
                </div>
              )}

              {grouped.map((group) => (
                <div key={group.category} role="group" aria-label={group.category}>
                  <p
                    className={cn(
                      'px-4 py-1.5 text-overline font-semibold uppercase tracking-wider',
                      'text-neutral-400 dark:text-neutral-500',
                    )}
                  >
                    {group.category}
                  </p>

                  {group.items.map((item) => {
                    const itemFlatIndex = flatIndexMap.get(item.id) ?? -1;
                    const isActive = itemFlatIndex === activeIndex;

                    return (
                      <div
                        key={item.id}
                        id={`command-item-${item.id}`}
                        role="option"
                        aria-selected={isActive}
                        data-active={isActive}
                        onMouseEnter={() => setActiveIndex(itemFlatIndex)}
                        onClick={() => selectItem(item)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg cursor-pointer',
                          'transition-colors duration-micro ease-out-custom',
                          isActive
                            ? 'bg-accent-50 dark:bg-accent-900/30'
                            : 'hover:bg-neutral-50 dark:hover:bg-neutral-800',
                        )}
                      >
                        {/* Icon */}
                        {item.icon && (
                          <span
                            className={cn(
                              'shrink-0 flex items-center justify-center w-8 h-8 rounded-md',
                              isActive
                                ? 'bg-accent-100 text-accent-600 dark:bg-accent-800 dark:text-accent-300'
                                : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
                            )}
                            aria-hidden="true"
                          >
                            {item.icon}
                          </span>
                        )}

                        {/* Label & description */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              'text-body-sm font-medium truncate',
                              isActive
                                ? 'text-accent-700 dark:text-accent-200'
                                : 'text-neutral-800 dark:text-neutral-200',
                            )}
                          >
                            {item.label}
                          </p>
                          {item.description && (
                            <p className="text-small text-neutral-500 dark:text-neutral-400 truncate">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {/* Shortcut hint */}
                        {item.shortcut && (
                          <kbd
                            className={cn(
                              'hidden sm:inline-flex items-center gap-0.5 rounded px-1.5 py-0.5',
                              'text-small font-mono shrink-0',
                              'text-neutral-400 bg-neutral-100 border border-neutral-200',
                              'dark:text-neutral-500 dark:bg-neutral-800 dark:border-neutral-700',
                            )}
                            aria-hidden="true"
                          >
                            {item.shortcut}
                          </kbd>
                        )}

                        {/* Enter hint for active item */}
                        {isActive && (
                          <CornerDownLeft
                            size={14}
                            className="shrink-0 text-accent-400 dark:text-accent-500"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div
              className={cn(
                'flex items-center gap-4 px-4 py-2 border-t text-small',
                'border-neutral-200 bg-neutral-50 text-neutral-400',
                'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-500',
              )}
            >
              <span className="inline-flex items-center gap-1">
                <kbd className="font-mono px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                  ↑↓
                </kbd>
                Navigate
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="font-mono px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                  ↵
                </kbd>
                Select
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="font-mono px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                  Esc
                </kbd>
                Close
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export { CommandPalette };
export type { CommandPaletteProps, CommandItem, CommandCategory };
