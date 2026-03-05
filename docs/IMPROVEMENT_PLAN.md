# PAS Prototype - Improvement Plan

> Based on comprehensive audit of reference site (imgcpas.lovable.app) vs current project (aksatyam.github.io/PAS_POC/)
> Date: March 5, 2026

---

## Executive Summary

The reference site is a **loan-centric mortgage guarantee** platform with a streamlined QDE → DDE → Underwriting → Decision → Issuance workflow. Our current project is a **policy-centric insurance** platform with broader coverage (policies, billing, renewals, documents). The key gaps are in **workflow visualization**, **data entry forms**, **domain-specific pages**, and **UI polish**.

---

## 1. NAVIGATION & SIDEBAR (Priority: HIGH)

### Current State
- Icon-only collapsed sidebar by default; user must expand to see labels
- Grouped as: Core Operations, Financial, Reports & Docs, Administration
- 14 navigation items

### Reference State
- Full sidebar with icons + text labels always visible
- Grouped as: Operations (7 items), Administration (4 items)
- Section headers styled differently (gray, uppercase)

### Action Items
- [ ] **1.1** Make sidebar expanded by default with icon + text visible
- [ ] **1.2** Add section group headers ("Operations", "Administration") with muted uppercase styling
- [ ] **1.3** Add active page highlight with left orange border accent (reference uses dark bg + orange left border)
- [ ] **1.4** Add collapsible sidebar toggle that remembers state via localStorage
- [ ] **1.5** Add IMGC PAS logo/branding in sidebar header area

---

## 2. HEADER / TOP BAR (Priority: MEDIUM)

### Current State
- Has search bar, dark mode toggle, notification bell, user avatar
- Shows "DEV" badge
- User shows name + role

### Reference State
- Search bar with placeholder "Search Loan ID, PAN, Mobile, Customer..."
- Keyboard shortcut hint (Cmd+K)
- Notification bell with count badge (red circle with number)
- User avatar with initials circle + name/role + dropdown chevron

### Action Items
- [ ] **2.1** Update search placeholder to be more domain-specific: "Search Policy ID, Customer, Claim..."
- [ ] **2.2** Ensure notification bell shows count badge (red circle) when there are unread notifications
- [ ] **2.3** Remove "DEV" badge for production/demo deployment (or make it environment-aware)
- [ ] **2.4** Add user initials avatar circle (colored) matching reference style

---

## 3. DASHBOARD (Priority: HIGH)

### Current State
- Executive KPIs bar (7 metrics with targets)
- 4 stat cards (Policies, Premium, Coverage, Claims)
- 6 charts (Policies by Status, Type Distribution, Risk, Claims, UW Decisions)
- My Tasks widget, Underwriting Review widget, Billing Overview

### Reference State
- 6 KPI cards with icons and trend indicators (Total Loans, UW Queue, Pending Claims, Avg TAT, Approval Ratio, Batch Status)
- Loan Pipeline bar chart + Stage Distribution donut chart
- Alerts & Notifications panel (color-coded alerts)
- Recent Applications table with clickable rows

### Action Items
- [ ] **3.1** Add **Alerts & Notifications** panel with color-coded severity (red/amber/green icons)
  - SLA breach alerts
  - High-risk pending items
  - Batch processing status
- [ ] **3.2** Add **Recent Applications** table showing latest 5 entries with:
  - Loan/Policy ID (clickable link)
  - Customer name
  - Amount
  - Status badge (color-coded)
  - Date
- [ ] **3.3** Add trend indicators (+/-%) to KPI cards (reference shows "+12% from last month")
- [ ] **3.4** Add icons to stat cards (reference has colored icons in top-right of each card)
- [ ] **3.5** Add "Export" and "New Application" buttons to dashboard header

---

## 4. SERVICE DESK / QDE PAGE (Priority: HIGH - NEW PAGE)

### Current State
- **Does not exist** in current project

### Reference State
- 4 tabs: Add New Loan, Auto Allocation, QDE Search, User Dashboard
- Multi-step wizard (5 steps): Loan Basic → Applicant → Loan Chars → Obligations → Verification
- Step progress indicator with checkmarks and numbered steps
- Form with sections: Borrower Details, Address Details, IMGC Details
- Auto-save draft functionality indicator
- Previous/Save Draft/Next navigation

### Action Items
- [ ] **4.1** Create new page `/service-desk` with tab-based layout
- [ ] **4.2** Implement **5-step wizard form** with:
  - Step progress bar (checkmark for completed, number for current/pending)
  - Step 1: Loan Basic details
  - Step 2: Applicant Details (Borrower info, Address, IMGC details)
  - Step 3: Loan Characteristics
  - Step 4: Obligations
  - Step 5: Verification
- [ ] **4.3** Add "Draft" status indicator with auto-save timestamp
- [ ] **4.4** Add "Auto Allocation" tab with allocation rules/queue
- [ ] **4.5** Add "QDE Search" tab with search functionality
- [ ] **4.6** Add "User Dashboard" tab showing user's assigned items

---

## 5. DDE (DETAILED DATA ENTRY) PAGE (Priority: HIGH - NEW PAGE)

### Current State
- **Does not exist** in current project

### Reference State
- Loan header bar (Loan ID, Lender, Deal ID, Employment Type, Principal Outstanding)
- Status badge ("In Review")
- 5-step workflow progress (QDE → DDE → Underwriting → Decision → Issuance)
- 4 metric cards (LTV, FOIR, CIBIL, EMI/NMI) with check/alert icons
- 6 data tabs: Loan Chars, General Data, Employment, Income Details, Banking, Obligations
- Right sidebar: Documents checklist, Eligibility calculator, Remarks/Case Notes
- Footer: Last modified info, Save + Submit to Underwriting buttons

### Action Items
- [ ] **5.1** Create new page `/dde` with loan detail view
- [ ] **5.2** Add **loan header bar** showing key identifiers
- [ ] **5.3** Add **workflow progress indicator** (5 stages with checkmarks)
- [ ] **5.4** Add **4 metric cards** (LTV, FOIR, CIBIL/Credit Score, EMI/NMI ratio)
- [ ] **5.5** Implement **tabbed data entry form** with 6 tabs
- [ ] **5.6** Add **Documents sidebar** with checklist (document name + Approved/Pending status)
- [ ] **5.7** Add **Eligibility sidebar** showing Max Eligible, Applied, Buffer amounts
- [ ] **5.8** Add **Remarks/Case Notes** textarea with save button
- [ ] **5.9** Add sticky footer with "Save" + "Submit to Underwriting" actions

---

## 6. UNDERWRITING WORKSPACE (Priority: HIGH - ENHANCE)

### Current State
- Basic list view of underwriting evaluations
- Policy detail pages exist but no full UW workspace

### Reference State
- Full workspace view for a single loan with:
  - Loan summary header (10 fields)
  - 5-step workflow progress
  - 6 metric cards (Risk Grade, LTV, FOIR, CIBIL, Loan Amt, Status)
  - 17 tabs (!): Summary, Loan Chars, General Data, Employment, Income, CIBIL, Obligations, Banking, Appraisal, Legal & Tech, Internal Data, Resolution, Letters, Smart View, Eligibility, Ratios, Policy Norms
  - AI Recommendation panel with confidence score
  - Loan Summary grid
  - Comment History / Action Log
  - Right sidebar: Internal Notes, Flag Case, Timeline
  - Action buttons: Send Back, Raise Deviation, Defer, Query to Lender, Reject, Approve

### Action Items
- [ ] **6.1** Create **UW Workspace** detail page with loan-level view
- [ ] **6.2** Add **AI Recommendation panel** with:
  - Recommendation text (Conditional Approve / Approve / Reject)
  - Confidence percentage
  - Number of factors analyzed
  - BRE status (Passed/Failed)
- [ ] **6.3** Add **Comment History / Action Log** table (user, timestamp, status, action type)
- [ ] **6.4** Add **Internal Notes** sidebar with note input + history
- [ ] **6.5** Add **Flag Case** dropdown (fraud, high-risk, escalation, etc.)
- [ ] **6.6** Add **Timeline** component (vertical timeline with icons)
- [ ] **6.7** Add action buttons bar: Send Back, Raise Deviation, Defer, Query, Reject, Approve
- [ ] **6.8** Add multi-tab data view (at least Summary, Loan Chars, Income, CIBIL tabs)

---

## 7. CLAIMS MANAGEMENT (Priority: MEDIUM - ENHANCE)

### Current State
- Basic claims list with table
- FNOL as separate page
- Claim detail page exists

### Reference State
- 10 tabs: Search, Documentation, Verification, Servicing Analysis, Recommendation, Claim Template, Payment Update, Case Trail, Batch Approval, Letters
- Claims table with: Claim ID, Loan ID, Customer, Claim Type (Initial/Subsequent/Crystallization), Amount, DPD, NPA, Status, Date
- "New Claim" button
- Search with filters

### Action Items
- [ ] **7.1** Add **tab-based layout** to Claims page (at minimum: Search, Documentation, Verification, Recommendation, Payment)
- [ ] **7.2** Add **Claim Type** column (Initial, Subsequent, Crystallization)
- [ ] **7.3** Add **DPD** (Days Past Due) and **NPA** columns
- [ ] **7.4** Add **Filters** button with filter panel

---

## 8. SERVICING PAGE (Priority: MEDIUM - NEW PAGE)

### Current State
- **Does not exist** in current project

### Reference State
- 5 tabs: File Upload, Data Analysis, NPA Tracking, Premium Check, Delinquency
- File Upload form: Lender Name, Servicing File Month, Batch Received Date, Batch ID, File upload
- Export button + Upload Servicing File button

### Action Items
- [ ] **8.1** Create new page `/servicing` with tab-based layout
- [ ] **8.2** Implement **File Upload** tab with lender/month/batch form
- [ ] **8.3** Add **NPA Tracking** tab with NPA status table
- [ ] **8.4** Add **Delinquency** tab with delinquency metrics
- [ ] **8.5** Add **Data Analysis** tab with uploaded file analysis results

---

## 9. FINANCE PAGE (Priority: MEDIUM - NEW PAGE)

### Current State
- **Does not exist** (current project has "Billing" which is different)

### Reference State
- 4 KPI cards: Total Revenue, Outstanding, Collected, Reconciled
- 8 tabs: Invoices, Cash Application, Payments, Refunds, Credit Notes, Reconciliation, MG Deed, Reports
- Invoice table: Invoice ID, Lender, Deal, Type, Amount, Status, Date
- "Generate Invoice" button

### Action Items
- [ ] **9.1** Create new page `/finance` or enhance existing Billing page
- [ ] **9.2** Add 4 finance KPI cards (Revenue, Outstanding, Collected, Reconciled %)
- [ ] **9.3** Add tab-based layout with at least: Invoices, Payments, Reconciliation
- [ ] **9.4** Add invoice table with proper columns
- [ ] **9.5** Add "Generate Invoice" action button

---

## 10. MASTER SETUP PAGE (Priority: MEDIUM - NEW PAGE)

### Current State
- **Does not exist** (Admin page has some config but not structured like Master Setup)

### Reference State
- 14 configuration cards in a grid:
  - Lender Setup, Deal Setup, Scheme Setup, Pricing Upload
  - Template Management, Role Management, Workflow Config, Builder/Project Master
  - City Classification, Vendor Mapping, Deviation Master, Collateral Master
  - Regulatory Compliance, System Settings
- Each card: icon, title, description, record count

### Action Items
- [ ] **10.1** Create new page `/master-setup` with card grid layout
- [ ] **10.2** Add at least 8-10 configuration cards with:
  - Icon (from Lucide React)
  - Title
  - Description
  - Record count in orange text
- [ ] **10.3** Make cards clickable (link to detail/sub-pages)

---

## 11. AUDIT LOGS PAGE (Priority: MEDIUM - ENHANCE)

### Current State
- Exists within Admin page as a tab (Audit Logs tab)
- Shows basic log entries

### Reference State
- Dedicated separate page `/audit-logs`
- Search bar + Module filter dropdown + Date picker
- Table with: Timestamp, User, Module, Field, Change (old → new with colored badges), Loan ID
- "Export Logs" button
- Visual diff display (old value in red → new value in green)

### Action Items
- [ ] **11.1** Create dedicated `/audit-logs` page (separate from Admin)
- [ ] **11.2** Add **field-level change tracking** with old → new value display
- [ ] **11.3** Add **module filter** dropdown (Underwriting, DDE, QDE, Workflow, etc.)
- [ ] **11.4** Add **date range** filter
- [ ] **11.5** Add **Export Logs** button
- [ ] **11.6** Style change values: old value with strikethrough in red, new value in green

---

## 12. MIS & REPORTS PAGE (Priority: LOW - ENHANCE)

### Current State
- Reports page exists with charts and data

### Reference State
- 4 summary cards (Total Portfolio, Active Guarantees, Avg TAT, Growth Rate) with icons
- Loan Origination Trend (bar chart)
- Claims Trend (line chart)
- Report Templates section with "Run" buttons

### Action Items
- [ ] **12.1** Add **Report Templates** section with predefined reports and "Run" buttons
- [ ] **12.2** Add more summary cards with icons
- [ ] **12.3** Add "Filters" button for date/lender filtering

---

## 13. UI/UX POLISH (Priority: MEDIUM)

### Action Items
- [ ] **13.1** **Color scheme alignment**: Consider switching from yellow/amber accent to orange (#F97316) to match IMGC branding
- [ ] **13.2** **Status badges**: Standardize colored dot + text badges (green=Approved, amber=Pending, red=Rejected, blue=In Review)
- [ ] **13.3** **Table row hover**: Ensure all tables have cursor:pointer and hover highlight for clickable rows
- [ ] **13.4** **Empty states**: Add meaningful empty state illustrations/messages for pages with no data
- [ ] **13.5** **Loading skeletons**: Add skeleton loaders for all data-fetching components
- [ ] **13.6** **Breadcrumbs**: Ensure all pages have proper breadcrumb navigation (current has this, keep it)
- [ ] **13.7** **Favicon**: Fix the 404 error for favicon.ico

---

## 14. WORKFLOW VISUALIZATION (Priority: HIGH)

### Current State
- No workflow progress indicator anywhere

### Reference State
- 5-step horizontal progress bar: QDE → DDE → Underwriting → Decision → Issuance
- Shows checkmarks for completed steps, numbered circle for current, gray for future
- Appears on Service Desk, DDE, and Underwriting pages

### Action Items
- [ ] **14.1** Create reusable **WorkflowProgress** component
- [ ] **14.2** Support states: completed (green checkmark), active (orange number), pending (gray number)
- [ ] **14.3** Connect steps with progress lines (green for completed path, gray for pending)
- [ ] **14.4** Add to Service Desk, DDE, and Underwriting pages

---

## Implementation Priority Order

### Phase 1 - Quick Wins (1-2 days)
1. Sidebar improvements (1.1-1.5)
2. Dashboard alerts & recent applications (3.1-3.5)
3. UI polish items (13.1-13.7)
4. Header improvements (2.1-2.4)

### Phase 2 - Core New Pages (3-5 days)
5. Service Desk / QDE page (4.1-4.6)
6. DDE page (5.1-5.9)
7. Workflow Progress component (14.1-14.4)
8. Underwriting Workspace enhancements (6.1-6.8)

### Phase 3 - Domain Pages (3-4 days)
9. Finance page (9.1-9.5)
10. Servicing page (8.1-8.5)
11. Master Setup page (10.1-10.3)
12. Audit Logs enhancement (11.1-11.6)

### Phase 4 - Polish & Extras (1-2 days)
13. Claims enhancements (7.1-7.4)
14. Reports enhancements (12.1-12.3)

---

## Summary of Changes

| Category | Items | Priority |
|----------|-------|----------|
| New Pages | Service Desk, DDE, Servicing, Finance, Master Setup | HIGH |
| Enhanced Pages | Underwriting, Claims, Audit Logs, Reports, Dashboard | HIGH/MED |
| UI Components | Workflow Progress, Alerts Panel, AI Recommendation | HIGH |
| UI Polish | Sidebar, Header, Color scheme, Status badges | MEDIUM |
| **Total Action Items** | **~60 items** | |

---

*This plan is based on a page-by-page comparison of imgcpas.lovable.app (reference) vs aksatyam.github.io/PAS_POC/ (current project) conducted on March 5, 2026.*
