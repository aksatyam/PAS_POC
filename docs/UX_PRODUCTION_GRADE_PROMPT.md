# PAS Enterprise — Production-Grade UX Enhancement Prompt

## Context
You are working on a **Policy Administration System (PAS)** prototype built with Next.js 14, React 18, TypeScript, Tailwind CSS, Recharts, and Lucide icons. The backend is Express.js with JSON file-based persistence. The app has 15+ pages across modules: Dashboard, Policies, Renewals, Customers, Underwriting, Claims, FNOL, Billing, Tasks, Documents, Reports, Admin, Compliance, and Documentation.

The current UI is functional but has **prototype-level UX**. Your job is to transform it into **production-grade, enterprise-class UX** — the kind you'd see in Guidewire PolicyCenter, Duck Creek, Salesforce, or modern fintech dashboards.

---

## GLOBAL UX ISSUES (Apply Across All Pages)

### 1. Duplicate Breadcrumbs
**Problem**: Every page renders TWO breadcrumb bars — one in the top bar area and one inside the content area. This wastes vertical space and looks unpolished.
**Fix**: Keep ONLY the breadcrumb inside the main content area (below the header). Remove the breadcrumb from the top sticky header bar. Ensure the remaining breadcrumb has proper spacing (16px top padding from header).

### 2. Inconsistent Currency Formatting
**Problem**: Some pages show `$` (USD) while others show `₹` (INR). The Billing page shows `$13,058` while the Dashboard shows `₹43,74,975`. Renewals correctly uses `₹`. This is inconsistent.
**Fix**: Standardize ALL currency displays to use `₹` (INR) with Indian number formatting (e.g., `₹43,74,975` not `₹4,374,975`). Create a shared `formatCurrency()` utility and use it everywhere. Apply to: Billing page summary cards, billing table, Dashboard billing overview, Reports pages.

### 3. Table Row Hover & Click Affordance
**Problem**: Data tables across the app (Policies, Claims, Customers, Underwriting, Documents, Admin Users, Billing Accounts) have rows that are clickable but don't have strong visual affordance. Users can't easily tell rows are interactive.
**Fix**: Add `cursor-pointer` on all clickable table rows. Add hover effect: `hover:bg-orange-50 dark:hover:bg-slate-700/50` with smooth transition. Add a subtle left-border accent on hover: `hover:border-l-3 hover:border-l-orange-500`. For non-clickable rows, remove pointer cursor.

### 4. Empty State Design
**Problem**: Empty states across the app are minimal — just an icon and text. Tasks page shows "No tasks found" with a clipboard icon. FNOL shows "No FNOLs found". These feel barren.
**Fix**: Design rich empty states with:
  - Larger, more expressive illustration (use Lucide icons composed together or SVG illustrations)
  - Primary heading + supporting description
  - A prominent CTA button (e.g., "Create Your First Task", "Submit First FNOL")
  - Subtle background pattern or gradient
  - Example: Tasks empty state should show a checkmark-clipboard illustration, "No tasks yet", "Tasks are automatically created from workflow events, or you can create one manually", + "New Task" button

### 5. Table Header Styling
**Problem**: Table headers across all list pages use an orange/amber background with white text. While distinctive, this is heavy and doesn't match modern enterprise aesthetics. It makes the tables look like spreadsheets.
**Fix**: Replace the heavy orange header with a lighter, more refined style:
  - Background: `bg-slate-50 dark:bg-slate-800`
  - Text: `text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider`
  - Bottom border: `border-b-2 border-slate-200 dark:border-slate-700`
  - This gives a cleaner, more professional look while maintaining readability

### 6. Card & Container Shadows
**Problem**: Cards and containers have minimal depth. The dashboard widgets, summary cards, and table containers feel flat.
**Fix**: Use a refined shadow system:
  - Summary/KPI cards: `shadow-sm hover:shadow-md transition-shadow duration-200`
  - Chart containers: `shadow-sm border border-slate-200 dark:border-slate-700`
  - Modal/dialog: `shadow-xl`
  - Add subtle `ring-1 ring-slate-900/5 dark:ring-slate-100/10` for container outlines instead of heavy borders

### 7. Loading States
**Problem**: The app has skeleton loading (good), but it's basic rectangular blocks. Production apps have shimmer animations.
**Fix**: Add shimmer/pulse animation to all skeleton loaders. Use `animate-pulse` with a gradient shimmer overlay. Ensure skeleton shapes match the actual content shapes (e.g., skeleton for a status badge should be a small pill shape, not a full-width rectangle).

### 8. Responsive Design Gaps
**Problem**: The app is desktop-only. Sidebar doesn't collapse cleanly on smaller screens. Tables overflow on medium screens.
**Fix**:
  - Sidebar: Already has collapse button — ensure it auto-collapses below 1024px with an overlay mode
  - Tables: Add horizontal scroll wrapper with fade indicators on edges
  - Cards: Use responsive grid — 4 columns on xl, 2 on md, 1 on sm
  - KPI bar: Horizontal scroll on mobile instead of cramming
  - Forms/dialogs: Full-width on mobile

### 9. Notification Bell (Header)
**Problem**: The notification bell icon in the header has no indicator and no dropdown. It's non-functional UI.
**Fix**: Add an unread count badge (red dot or number badge) when there are unread notifications. Clicking should show a dropdown panel with recent notifications (max 5), each with: icon, title, time ago, read/unread indicator. Include a "View All" link to a full notifications page. If no notifications, show a friendly empty state.

### 10. Footer Bar
**Problem**: The footer shows "IMGC PAS v3.2.1 | Connected" — this is development info and looks unfinished.
**Fix**: Either remove the footer entirely, or make it minimal and useful:
  - Show only on hover or as a very subtle bar
  - Add useful info: last sync time, connection status dot (green/red), version in tooltip only
  - Style: `text-[10px] text-slate-400` — nearly invisible but informative

### 11. Page Transitions
**Problem**: Page navigation is instant with no transition, creating a jarring feel.
**Fix**: Add subtle page transition animations:
  - Content fade-in: `opacity 0 → 1` over 200ms on route change
  - Stagger animations for list items (already partially done on dashboard — extend to all list pages)
  - Table rows: stagger entrance animation (50ms delay per row, fade + slide up)

---

## PAGE-SPECIFIC UX FIXES

### Login Page
- **Issue**: Clean but generic. The demo accounts section takes too much vertical space.
- **Fix**:
  - Add a subtle background pattern or gradient to the left/right sides
  - Make demo accounts a collapsible accordion (collapsed by default) or a small dropdown
  - Add "Remember me" checkbox
  - Add password visibility toggle (eye icon)
  - Add subtle brand illustration or insurance-themed graphic
  - Form validation: show inline errors below each field, not just toast

### Dashboard
- **BUG: "undefined (4%)"** in Policy Type Distribution pie chart. A policy type is null/undefined in the data. Fix the backend data or add a fallback label like "Other".
- **BUG: "Avg Risk Score:"** in Underwriting Overview shows no value — just the label with an empty value. Fix the calculation or display "N/A" if unavailable.
- **BUG: "Total Coverage: ₹0"** — this seems like a data/calculation issue. Investigate and fix.
- **Issue**: Executive KPI bar is too dense — 7 metrics crammed into one row with tiny text. Hard to scan.
- **Fix**:
  - Redesign KPI bar as a 2-row or scrollable carousel with larger, more readable cards
  - Each KPI should have: metric name, value, target, and a visual indicator (gauge, sparkline, or trend arrow)
  - Color-code: green if meeting target, red if far from target, amber if close
  - Currently all values appear red — use conditional coloring
- **Issue**: "My Tasks" widget shows "All caught up!" but with 0 tasks — feels empty. Add sample tasks or a richer empty state.
- **Issue**: Billing Overview widget shows `₹13,058` (correct INR) but the billing page shows `$13,058`. Standardize.
- **Issue**: Chart tooltips are basic. Enhance with formatted numbers, labels, and subtle styling.

### Policies List Page
- **Good**: Clean table, status badges, risk indicators, search, pagination
- **Fix**:
  - Add quick-action buttons on row hover (View, Edit, Renew) — currently only the eye icon
  - Add column visibility toggle (allow users to show/hide columns)
  - Add "Export" button (CSV/Excel)
  - Status filter should be a multi-select chip bar, not just a dropdown
  - Add bulk selection checkboxes for batch operations
  - Pagination: show "Showing 1-10 of 52" text alongside page controls

### Policy Detail Page
- **Issue**: Duplicate breadcrumbs (global issue — most visible here)
- **Issue**: The lifecycle stepper at top is good but could be enhanced with dates on each step
- **Fix**:
  - Add a floating action bar at the top-right with primary actions (Endorse, Renew, Cancel) based on current status
  - Tab content areas need more padding and visual separation
  - The 8 tabs are many — consider grouping: "Overview | Financial | History | Documents"
  - Add a quick-info sidebar or top summary strip showing key policy metrics (Premium, Coverage, Status, Risk Score)

### Claims Page
- **Issue**: "Fraud" and "Adjudication" columns show "—" for most records, wasting horizontal space
- **Fix**:
  - Remove or hide columns that are empty for most records. Show them only in detail view
  - The Table/Board toggle is good — enhance the Board (Kanban) view with drag-and-drop
  - Add claim severity indicator (color-coded dot: green/amber/red)
  - FNOL button is prominent (good) — but the "New Claim" button should be secondary since FNOL is the standard intake

### Customers Page
- **Issue**: All customers show "Low" risk — no data variation (data issue)
- **Issue**: Bare table with no filters except search. No status filter, no risk filter
- **Fix**:
  - Add filter bar: risk level filter (Low/Medium/High), status filter, date range
  - Add customer avatar/initials circle in the first column
  - Show linked policies count as a badge
  - Add "View Profile" action on hover
  - Add customer type indicator (Individual vs Corporate)
  - Make the page feel less like a raw database dump — add summary cards at top (Total Customers, New This Month, By Risk Level)

### Underwriting Page
- **Good**: Clean table, sortable columns, decision badges with icons, Rule Config + Referrals links
- **Fix**:
  - Risk score column should have a visual indicator (progress bar or color gradient) not just a number
  - Credit score should also be color-coded (green > 700, amber 600-700, red < 600)
  - LTV % should show a small bar chart or have conditional coloring (green < 80%, red > 95%)
  - Add a summary strip at top: Total Evaluations, Auto-Approved %, Referred %, Rejected %
  - The "Evaluate" button should have a more descriptive label: "Run Bulk Evaluation"

### Documents Page
- **Good**: Category tabs (All/Policy/Claims/UW/Correspondence/Billing/General), sortable table, Generate + Upload buttons
- **Fix**:
  - Filename column truncation is ugly (`insurance_certificate_2026_...`). Show full name on hover with tooltip
  - Add file type icon before filename (PDF icon, Word icon, ZIP icon, etc.) based on extension
  - "Size" column: format better — show "1.5 MB" instead of "1543 KB"
  - Preview button should show an in-page document viewer (modal) not just an icon
  - Add drag-and-drop upload zone that appears when files are dragged over the page
  - Version badge (v1, v2, v3) should be styled as a small pill badge, not a link

### Reports Page
- **BUG**: "Policies by Type" pie chart shows **"undefined"** as one of the legend items (same as dashboard). Fix the data source.
- **Issue**: "Total Coverage: ₹0" — data bug
- **Fix**:
  - Date range picker: the native date inputs look ugly and inconsistent. Replace with a custom date picker component with preset buttons styled as a connected button group
  - The preset buttons (This Month, Last Month, etc.) should be styled as a segmented control/toggle group with the active one highlighted
  - Export CSV button should also offer Excel and PDF export options
  - Add drill-down capability: clicking a bar in "Policies by Status" chart should navigate to the policies list filtered by that status
  - Each report tab should have more detailed charts — current view is sparse

### Admin Page
- **Good**: 7 tabs (Users, Audit Logs, API Keys, Webhooks, Products, Compliance, Bulk Operations), clean user table
- **Fix**:
  - User table: Add role badge coloring (Admin=red, Operations=blue, UW=purple, Claims=amber, Viewer=gray) — currently uses colored pills but they could be more distinct
  - "Deactivate" button is text-only and red — make it a proper button with icon. Too easy to accidentally click.
  - Add user edit capability (currently can only deactivate)
  - Audit Logs tab: needs timestamp formatting improvement and log level coloring
  - Missing: No breadcrumb on admin page (only page without sub-breadcrumb for tab content)

### Billing Page
- **BUG**: Currency shows `$` instead of `₹`. Fix all currency formatting.
- **Issue**: Receivables Aging chart tooltip is showing during initial render (visible in screenshot). Should only show on hover.
- **Fix**:
  - Summary cards at top should have trend indicators (arrows up/down with percentage)
  - Table: "Grace Period" and "Delinquent" statuses need stronger visual indicators — amber and red backgrounds
  - "Suspended" status should be clearly marked with a warning icon
  - Add "Record Payment" and "Generate Invoice" action buttons
  - Balance column: color-code red for overdue, green for zero balance
  - Add a payment history expandable section per account

### Tasks Page
- **Issue**: Shows all zeros (0 Open, 0 In Progress, 0 Overdue, 0 Completed) — no sample data
- **Fix**:
  - Add sample task data (at least 10-15 tasks across different statuses)
  - Summary cards should be color-coded: Open=blue, In Progress=amber, Overdue=red, Completed=green
  - Add task priority badges (Urgent=red, High=orange, Medium=yellow, Low=gray)
  - Add assignee avatars
  - Add SLA countdown timers for tasks approaching deadline
  - Support list view AND board (Kanban) view toggle like Claims page

### FNOL Page
- **Issue**: Empty state with just a bell icon and text. No sample data.
- **Fix**:
  - Add sample FNOL records (5-8 at various statuses: Submitted, Processing, Claim Created)
  - The empty state needs a rich illustration and clear CTA
  - Add FNOL status cards at top like Tasks page
  - The New FNOL wizard should be a multi-step form with progress indicator

### Renewals Page
- **Good**: Card-based layout with renewal details, Accept/Decline buttons, premium delta indicator
- **Fix**:
  - Cards need more visual polish — add subtle left border colored by status (Pending=amber, Quoted=blue)
  - Premium delta should be more prominent: green for decrease (savings), red for increase
  - Add "Days Until Renewal" countdown
  - Group renewals by urgency: "Due This Week", "Due This Month", "Future"
  - Add batch "Accept All" / "Decline All" buttons for the queue
  - "Created by USR002" — show actual user name, not ID

### Compliance Page
- **Good**: Status summary cards, filter pills, well-structured compliance items
- **Fix**:
  - Overdue items (Due: 28/02/2026 in red) need stronger visual urgency — add a red left border and pulsing indicator
  - Add a compliance calendar/timeline view as an alternative
  - "Due" and "Overdue" summary cards should be color-coded more strongly (amber and red backgrounds)
  - Notes text is in italics and light gray — too easy to miss. Make it slightly more prominent
  - Add progress percentage for "In Progress" items

### Documentation Page
- **Good**: Clean layout, module cards, quick reference section
- **Fix**:
  - Module cards should be clickable with hover effect, linking to relevant module documentation
  - Add a search bar for documentation
  - The Quick Reference section should have copy-to-clipboard buttons for credentials and URLs
  - Add an API status indicator (green dot if backend is reachable)

---

## DARK MODE FIXES

### Current Issues Observed
1. **Chart backgrounds**: Charts on dark mode have adequate contrast but the bar chart bars remain dark navy — should lighten to a lighter blue/orange to stand out against the dark background
2. **KPI Bar**: Values are red text on dark background — contrast is acceptable but the card backgrounds need slightly lighter dark tones for depth differentiation
3. **Summary cards**: On dark mode, the subtle borders between cards disappear. Need `dark:border-slate-700` borders
4. **Sidebar**: Dark mode sidebar blends into the background — needs a slightly different shade or a right border for separation
5. **Table rows**: Alternating row striping needed for dark mode readability: `dark:even:bg-slate-800/50`
6. **"undefined (4%)" pie chart label** is visible in dark mode too — data bug persists
7. **Billing Overview widget**: "₹13,058" text is dark on dark background in the "Total Outstanding" field — check contrast

### Dark Mode Enhancements
- Ensure ALL text has WCAG AA contrast ratio (4.5:1 minimum)
- All form inputs: need visible borders in dark mode (`dark:border-slate-600`)
- Status badges: verify all badge colors are readable in dark mode
- Hover states: ensure hover colors are visible (`dark:hover:bg-slate-700`)
- Chart colors: use a dark-mode-optimized color palette (lighter, more vibrant)

---

## TYPOGRAPHY & SPACING POLISH

### Typography
- **Page titles**: Increase to `text-2xl font-bold` (currently some are `text-xl`)
- **Section headers**: Use `text-lg font-semibold text-slate-900 dark:text-white`
- **Table data**: Use `text-sm text-slate-600 dark:text-slate-300` for body cells
- **Timestamps**: Use `text-xs text-slate-400` — lighter than regular text
- **Numeric values**: Use tabular-nums font feature for aligned numbers in tables: `font-variant-numeric: tabular-nums`

### Spacing
- **Page content padding**: Standardize to `px-6 py-6` (currently varies)
- **Card internal padding**: Standardize to `p-5` or `p-6`
- **Between sections**: Use `space-y-6` consistently
- **Table cell padding**: `px-4 py-3` for comfortable reading

---

## INTERACTION POLISH

### Micro-animations
- Button press: `active:scale-95` transform for tactile feedback
- Card hover: `hover:-translate-y-0.5 hover:shadow-md` subtle lift effect
- Status badge: fade-in animation on load
- Number counters: animate from 0 to value on dashboard load
- Toast notifications: slide in from top-right with 300ms ease-out

### Form Enhancements
- All text inputs: add focus ring `focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500`
- Select dropdowns: replace native `<select>` with custom styled dropdowns using headlessUI or similar
- Search inputs: add debounced search (300ms) with loading spinner
- Required fields: show asterisk indicator
- Validation: real-time inline validation with red/green border indicators

### Keyboard Navigation
- Add keyboard shortcut hints in tooltips (already has ⌘K for search — extend to other actions)
- Tab focus visible states on all interactive elements
- Escape key should close modals/drawers
- Enter key should submit forms

---

## ACCESSIBILITY FIXES

- Ensure all images have descriptive `alt` text (currently many are empty `img` tags)
- Add `aria-label` to icon-only buttons (some action buttons in tables have no label)
- Ensure color is not the ONLY indicator of status — add icons alongside color (partially done, extend everywhere)
- Skip-to-main-content link exists (good) — ensure it works properly
- Screen reader: table sort buttons need `aria-sort` attributes
- Focus management: after modal close, return focus to the trigger button

---

## PRIORITY ORDER

### P0 — Critical Bugs (Fix First)
1. Fix "undefined" in Policy Type Distribution chart (Dashboard + Reports)
2. Fix "Avg Risk Score:" empty value in Dashboard
3. Fix "Total Coverage: ₹0" calculation
4. Fix currency inconsistency ($ vs ₹ on Billing page)
5. Fix Receivables Aging tooltip showing on load
6. Remove duplicate breadcrumbs globally

### P1 — Visual Polish (High Impact)
7. Redesign table headers (remove heavy orange)
8. Enhance empty states (Tasks, FNOL)
9. Fix dark mode contrast issues
10. Add sample data for Tasks and FNOL
11. Standardize currency formatting utility
12. Card shadow and border refinement

### P2 — Interaction Enhancement
13. Table row hover effects and click affordance
14. Form input styling (focus rings, validation)
15. Page transition animations
16. Button micro-animations
17. Rich notification dropdown
18. Enhanced chart tooltips

### P3 — Feature-Level UX
19. Customers page: add filters, summary cards, avatars
20. Underwriting: risk score visualization, credit score coloring
21. Renewals: urgency grouping, countdown timers, show user names
22. Reports: custom date picker, drill-down, multi-format export
23. Admin: user edit capability, role badge enhancement
24. Tasks: Kanban view, SLA timers, priority badges

### P4 — Responsive & Accessibility
25. Mobile/tablet responsive layout
26. Accessibility audit fixes (aria labels, alt text, focus management)
27. Keyboard navigation enhancements

---

## CONSTRAINTS
- Do NOT change the tech stack — continue using Tailwind CSS, Lucide icons, Recharts
- Do NOT add new UI libraries (no shadcn, no Material UI, no Ant Design)
- Maintain backward compatibility with existing API contracts
- All changes must pass `npx next build` with 0 errors
- All changes must pass `npx tsc --noEmit` with 0 type errors
- Preserve existing RBAC roles and permissions
- Maintain JSON file-based persistence (no database changes)
- Follow existing patterns: skeleton loading, toast notifications, ConfirmDialogs, breadcrumbs

---

## VERIFICATION CHECKLIST
After completing enhancements:
- [ ] `cd frontend && npx next build` — 0 errors, all pages compile
- [ ] `cd backend && npx tsc --noEmit` — 0 type errors
- [ ] All 15+ pages render correctly in light mode
- [ ] All 15+ pages render correctly in dark mode
- [ ] No console errors in browser dev tools
- [ ] Currency shows ₹ consistently across all pages
- [ ] No "undefined" values in any charts or displays
- [ ] All empty states have rich design with CTAs
- [ ] All tables have proper hover states
- [ ] Breadcrumbs appear only once per page
- [ ] WCAG AA contrast ratio met for all text
