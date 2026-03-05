# IMGC Policy Administration System (PAS) — Enterprise Application Guide

> **Version:** 1.0 | **Date:** March 2026 | **Classification:** Internal Use
> **Organization:** India Mortgage Guarantee Corporation (IMGC)
> **System:** Policy Administration System (PAS) Prototype

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Getting Started](#4-getting-started)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Module Reference](#6-module-reference)
   - 6.1 [Dashboard](#61-dashboard)
   - 6.2 [Policy Management](#62-policy-management)
   - 6.3 [Customer Management](#63-customer-management)
   - 6.4 [Claims Processing](#64-claims-processing)
   - 6.5 [FNOL (First Notice of Loss)](#65-fnol-first-notice-of-loss)
   - 6.6 [Underwriting](#66-underwriting)
   - 6.7 [Billing & Payments](#67-billing--payments)
   - 6.8 [Task Management](#68-task-management)
   - 6.9 [Document Management](#69-document-management)
   - 6.10 [Renewals](#610-renewals)
   - 6.11 [Notifications](#611-notifications)
   - 6.12 [Reports & Analytics](#612-reports--analytics)
   - 6.13 [Administration](#613-administration)
   - 6.14 [Compliance](#614-compliance)
   - 6.15 [Service Desk (QDE)](#615-service-desk-qde)
   - 6.16 [DDE (Detailed Data Entry)](#616-dde-detailed-data-entry)
   - 6.17 [Finance](#617-finance)
   - 6.18 [Servicing](#618-servicing)
   - 6.19 [Master Setup](#619-master-setup)
   - 6.20 [Audit Logs](#620-audit-logs)
7. [End-to-End Business Flows](#7-end-to-end-business-flows)
   - 7.0 [Loan Application Workflow (QDE → Issuance)](#70-loan-application-workflow-qde--issuance)
   - 7.1 [Policy Lifecycle Flow](#71-policy-lifecycle-flow)
   - 7.2 [Claims Processing Flow](#72-claims-processing-flow)
   - 7.3 [FNOL to Claim Settlement Flow](#73-fnol-to-claim-settlement-flow)
   - 7.4 [Underwriting & Referral Flow](#74-underwriting--referral-flow)
   - 7.5 [Billing Lifecycle Flow](#75-billing-lifecycle-flow)
   - 7.6 [Renewal Workflow](#76-renewal-workflow)
   - 7.7 [Endorsement Flow](#77-endorsement-flow)
   - 7.8 [Task Automation Flow](#78-task-automation-flow)
8. [API Reference](#8-api-reference)
9. [RBAC & Role Permissions Matrix](#9-rbac--role-permissions-matrix)
10. [Data Model Reference](#10-data-model-reference)
11. [Testing Guide](#11-testing-guide)
12. [Glossary](#12-glossary)

---

## 1. Executive Summary

The IMGC Policy Administration System (PAS) is an enterprise-grade insurance policy management platform built specifically for mortgage guarantee and credit protection operations. The system provides a comprehensive suite of tools for managing the full insurance lifecycle — from policy quoting and issuance through claims processing, billing, and compliance tracking.

### Key Capabilities

| Domain | Capabilities |
|--------|-------------|
| **Policy Management** | Full lifecycle: Quote → Bind → Issue → Endorse → Renew → Cancel → Reinstate |
| **Claims Processing** | FNOL intake, reserve management, adjudication, fraud scoring, loss mitigation |
| **Underwriting** | Automated risk scoring, configurable rules, referral workflows, delegated authority |
| **Billing** | Invoicing, payment tracking, installment plans, ledger, aging reports |
| **Task Management** | SLA-driven task queues, auto-assignment, priority management |
| **Document Management** | Upload, template-based generation, versioning, categorization |
| **Notifications** | Event-driven in-app notifications, real-time bell with unread count |
| **Reporting** | Executive KPIs, date-filtered reports, CSV export, role-based dashboards |
| **Compliance** | Regulatory requirement tracking, status monitoring, deadline management |
| **Service Desk (QDE)** | Multi-step loan application wizard, auto allocation, draft management |
| **DDE** | Detailed data entry workspace, metric cards, document checklists, eligibility |
| **Finance** | Invoicing, payments, reconciliation, revenue tracking |
| **Servicing** | File upload, NPA tracking, delinquency monitoring, premium checks |
| **Master Setup** | 14 configuration areas: lender, deal, scheme, pricing, templates, roles, workflows |
| **Audit Logs** | Field-level change tracking, module filtering, date range, export |
| **Administration** | User CRUD, RBAC (5 roles), audit logs, API key management, webhooks |

### Supported Insurance Products

| Product | Code | Description |
|---------|------|-------------|
| **Mortgage Guarantee Standard** | MG-STD | Mortgage guarantee insurance for conforming loans up to ₹5,00,000 |
| **Credit Protection Plus** | CP-PLUS | Enhanced credit protection with job loss rider |
| **Coverage Plus Premium** | CVP-PRM | Comprehensive property coverage with natural disaster add-on |

---

## 2. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Next.js 14 (App Router) — Port 3000          │   │
│  │   React 18 │ TypeScript │ Tailwind CSS │ Recharts    │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │ HTTP/REST                          │
│  ┌──────────────────────▼───────────────────────────────┐   │
│  │           API Client (lib/api.ts)                     │   │
│  │   Auto Token Refresh │ Error Handling │ Type Safety   │   │
│  └──────────────────────┬───────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                     API LAYER                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │       Express.js + TypeScript — Port 4000             │   │
│  │                                                       │   │
│  │  Middleware Stack:                                    │   │
│  │  ┌─────────┐ ┌──────┐ ┌──────┐ ┌────────┐ ┌──────┐ │   │
│  │  │ Helmet  │ │ CORS │ │ Rate │ │  JWT   │ │ RBAC │ │   │
│  │  │Security │ │      │ │Limit │ │  Auth  │ │      │ │   │
│  │  └─────────┘ └──────┘ └──────┘ └────────┘ └──────┘ │   │
│  │                                                       │   │
│  │  Routes: 18 modules │ 100+ endpoints │ /api/v1/*     │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────▼───────────────────────────────┐   │
│  │              SERVICE LAYER (19 Services)               │   │
│  │  Premium Engine │ Fraud Scoring │ Referral Engine     │   │
│  │  Task Engine │ Notification Engine │ KPI Engine       │   │
│  │  Document Generator │ Billing Automation │ EventBus   │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────▼───────────────────────────────┐   │
│  │             DATA LAYER (JSON File Persistence)        │   │
│  │  27 JSON data files in /backend/mock-data/            │   │
│  │  Read/write via fs module │ In-memory caching         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  GITHUB PAGES (STATIC DEMO)                  │
│                                                               │
│  URL: https://aksatyam.github.io/PAS_POC/                    │
│  Build: Next.js static export (output: 'export')             │
│  Auth: Client-side mock (NEXT_PUBLIC_DEMO_MODE=true)         │
│  Data: Mock data layer (frontend/lib/mock-data.ts)           │
│  Routing: 404.html SPA fallback                              │
│  CI/CD: GitHub Actions on push to main                       │
│                                                               │
│  Note: Dynamic [id] routes removed during CI build.          │
│        Detail pages available only in local development.     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              DOCKER / LOCAL (FULL-STACK)                      │
│                                                               │
│  Frontend: localhost:3000  │  Backend: localhost:4000         │
│  Full API with real data   │  Swagger: localhost:4000/api-docs│
│  All routes including [id] │  JSON file persistence           │
└─────────────────────────────────────────────────────────────┘
```

### Security Architecture

```
Request Flow:
  Client → Helmet (Security Headers)
         → CORS (Origin Validation)
         → Rate Limiter (5000 req/15min per IP)
         → Auth Rate Limiter (login/refresh specific)
         → JWT Authentication (Bearer Token)
         → RBAC Authorization (Role Check)
         → Audit Logging
         → Route Handler → Service → Data Layer
```

### Frontend Architecture

```
Next.js App Router Structure:
  app/
  ├── (auth)/           ← Public routes (login)
  │   └── login/
  └── (main)/           ← Protected routes (requires auth)
      ├── dashboard/
      ├── policies/
      │   ├── [id]/     ← Policy detail with tabs
      │   └── quote/    ← Multi-step quote wizard
      ├── customers/
      ├── claims/
      │   ├── [id]/
      │   └── fnol/     ← FNOL submission wizard
      ├── underwriting/
      │   ├── referrals/
      │   └── rules/
      ├── billing/
      │   └── [id]/
      ├── tasks/
      ├── documents/
      ├── renewals/
      ├── notifications/
      ├── reports/
      └── admin/
          ├── products/
          ├── compliance/
          ├── api-keys/
          ├── webhooks/
          └── bulk-operations/
```

---

## 3. Technology Stack

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **Express.js** | 4.18.2 | HTTP framework |
| **TypeScript** | 5.3.2 | Type safety |
| **JWT (jsonwebtoken)** | 9.0.2 | Authentication tokens |
| **bcryptjs** | 2.4.3 | Password hashing |
| **Zod** | 3.22.4 | Schema validation |
| **Helmet** | 7.1.0 | Security headers |
| **express-rate-limit** | 7.1.5 | Rate limiting |
| **Winston** | 3.19.0 | Structured logging |
| **Swagger** | 5.0.0 | API documentation |
| **UUID** | 9.0.0 | ID generation |
| **ts-node-dev** | 2.0.0 | Hot reload (dev) |

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 14.2.21 | React framework (App Router) |
| **React** | 18.3.1 | UI library |
| **TypeScript** | 5.3.0 | Type safety |
| **Tailwind CSS** | 3.4.0 | Utility-first styling |
| **Zustand** | 5.0.11 | State management |
| **TanStack Query** | 5.90.21 | Server state & caching |
| **TanStack Table** | 8.21.3 | Table management |
| **React Hook Form** | 7.71.2 | Form handling |
| **Recharts** | 2.15.0 | Data visualization |
| **Framer Motion** | 12.34.5 | Animations |
| **Lucide React** | 0.469.0 | Icon library |
| **date-fns** | 4.1.0 | Date utilities |
| **js-cookie** | 3.0.5 | Cookie management |

---

## 4. Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- macOS / Linux / Windows (WSL recommended)
- Modern browser (Chrome, Firefox, Edge)

### Live Demo (GitHub Pages)

The frontend is deployed as a static demo with mock data — no backend required:

| Service | URL | Description |
|---------|-----|-------------|
| **Live Demo** | https://aksatyam.github.io/PAS_POC/ | Static frontend with mock data |

**Demo Credentials:** `admin@imgc.com` / `demo123` (see login page for all roles)

### Quick Start (Local Full-Stack)

```bash
# Terminal 1 — Backend
cd backend && npm install && npm run dev

# Terminal 2 — Frontend
cd frontend && npm install && npm run dev
```

### Access Points (Local)

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application UI |
| **Backend API** | http://localhost:4000/api/v1 | REST API base URL |
| **Swagger Docs** | http://localhost:4000/api-docs | Interactive API documentation |
| **Health Check** | http://localhost:4000/health | Server health status |

### Environment Configuration

**Backend** (`backend/.env`):
```env
PORT=4000
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
NODE_ENV=development
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=/api/v1
```

> **Note:** For the GitHub Pages deployment, `NEXT_PUBLIC_DEMO_MODE=true` is set at build time to enable mock data mode.

---

## 5. Authentication & Authorization

### Authentication Flow

```
1. User submits email + password
   POST /api/v1/auth/login

2. Server validates credentials (bcrypt compare)
   Returns: { accessToken (1-day), refreshToken (7-day), user object }

3. Client stores tokens in cookies (js-cookie)
   accessToken  → 1-day expiry
   refreshToken → 7-day expiry

4. All subsequent API calls include:
   Authorization: Bearer <accessToken>

5. On 401 response, client auto-refreshes:
   POST /api/v1/auth/refresh (with refreshToken)
   → New accessToken + refreshToken
   → Retry original request

6. On refresh failure → Redirect to /login
```

### Token Structure

```typescript
// Access Token Payload
{
  userId: string,    // e.g., "USR001"
  email: string,     // e.g., "admin@pas.com"
  role: UserRole,    // e.g., "Admin"
  name: string,      // e.g., "Rajesh Kumar"
  iat: number,       // Issued at
  exp: number        // Expiry (24 hours)
}
```

### RBAC (Role-Based Access Control)

The system implements 5 user roles with granular permissions:

| Role | Description | Primary Access |
|------|-------------|----------------|
| **Admin** | Full system access | All modules, user management, configuration |
| **Operations** | Policy & billing management | Policies, customers, billing, documents |
| **Underwriter** | Risk evaluation & approvals | Underwriting, referrals, rule config, policies |
| **Claims** | Claims processing & FNOL | Claims, FNOL, reserves, loss mitigation |
| **Viewer** | Read-only access | View all data, no create/update/delete |

### Test User Accounts

#### Live Demo (GitHub Pages — `NEXT_PUBLIC_DEMO_MODE=true`)

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@imgc.com | demo123 |
| **Underwriter** | underwriter@imgc.com | demo123 |
| **Claims** | claims@imgc.com | demo123 |
| **Operations** | ops@imgc.com | demo123 |
| **Viewer** | viewer@imgc.com | demo123 |

#### Local Development (Full-Stack with Backend)

| Role | Email | Name | User ID | Password |
|------|-------|------|---------|----------|
| **Admin** | admin@pas.com | Rajesh Kumar | USR001 | Password@123 |
| **Admin** | admin2@pas.com | Deepa Menon | USR010 | Password@123 (Inactive) |
| **Operations** | ops1@pas.com | Priya Sharma | USR002 | Password@123 |
| **Operations** | ops2@pas.com | Amit Patel | USR003 | Password@123 |
| **Underwriter** | uw1@pas.com | Sunita Reddy | USR004 | Password@123 |
| **Underwriter** | uw2@pas.com | Vikram Singh | USR005 | Password@123 |
| **Claims** | claims1@pas.com | Meera Iyer | USR006 | Password@123 |
| **Claims** | claims2@pas.com | Arjun Nair | USR007 | Password@123 |
| **Viewer** | viewer1@pas.com | Kavita Joshi | USR008 | Password@123 |
| **Viewer** | viewer2@pas.com | Rohit Gupta | USR009 | Password@123 |

---

## 6. Module Reference

### 6.1 Dashboard

**Route:** `/dashboard`
**Access:** All authenticated users
**Purpose:** Real-time operational overview with KPIs, charts, and quick actions

#### Features
- **KPI Cards**: Total Policies, Active Claims, Pending Underwriting, Total Coverage Amount
- **Charts**: Policy distribution (by type), claims by status, monthly premium trends, risk category breakdown, underwriting decisions
- **Role-Based Views**: Executive, Underwriter, Claims, Operations dashboards with tailored metrics
- **My Tasks Widget**: Assigned tasks with SLA countdown
- **Skeleton Loading**: Animated placeholders during data fetch

#### Key Metrics
- Loss Ratio, Combined Ratio, Expense Ratio
- Retention Rate, Claim Cycle Time
- Premium Volume, Claims Severity
- Approval Rate, Risk Score Trends

#### API Endpoints
```
GET /api/v1/dashboard/summary
GET /api/v1/dashboard/claims
GET /api/v1/dashboard/underwriting
GET /api/v1/dashboard/risk
GET /api/v1/dashboard/kpis
GET /api/v1/dashboard/role/:role
```

---

### 6.2 Policy Management

**Route:** `/policies`, `/policies/[id]`, `/policies/quote`
**Access:** All roles (CRUD restricted to Admin, Operations)
**Purpose:** Full policy lifecycle management from quoting to cancellation

#### Policy Lifecycle States

```
Draft ──→ Quoted ──→ Bound ──→ Issued ──→ Active
                                            │
                        ┌───────────────────┤
                        ▼                   ▼
                   Endorsed           Renewal_Pending
                        │                   │
                        └───→ Active ←──────┘
                              │  │  │
                    ┌─────────┘  │  └─────────┐
                    ▼            ▼             ▼
                 Lapsed     Cancelled      Expired
                    │            │
                    └────────────┘
                         │
                         ▼
                    Reinstated ──→ Active
```

#### Policy Types
| Type | Description | Coverage Range |
|------|-------------|----------------|
| Mortgage Guarantee | MI for conforming loans | ₹50,000 – ₹5,00,000 |
| Credit Protection | Credit default protection with riders | ₹25,000 – ₹2,50,000 |
| Coverage Plus | Comprehensive property + natural disaster | ₹1,00,000 – ₹10,00,000 |

#### Features
- **Policy List**: Filterable/sortable DataTable with status badges, search, pagination
- **Policy Detail**: Tabbed view (Details | Endorsements | Renewals | Billing | Versions | Audit)
- **Quote Wizard**: Multi-step form (Customer → Coverage → Premium → Bind)
- **Premium Calculator**: Rule-based engine with factor breakdown display
- **Endorsement Management**: Create mid-term changes with premium delta calculation
- **Version History**: Track all policy modifications with before/after comparison
- **Audit Trail**: Complete event log with user, timestamp, and action details
- **Status Transitions**: Visual indicator showing allowed state transitions

#### API Endpoints
```
GET    /api/v1/policies                         — List all policies
GET    /api/v1/policies/:id                     — Get policy detail
GET    /api/v1/policies/:id/versions            — Get version history
GET    /api/v1/policies/:id/audit               — Get audit trail
GET    /api/v1/policies/:id/endorsements        — Get endorsements
GET    /api/v1/policies/:id/renewals            — Get renewals
GET    /api/v1/policies/:id/transitions         — Get allowed transitions
GET    /api/v1/policies/renewals/pending        — Pending renewals
POST   /api/v1/policies                         — Create policy
PUT    /api/v1/policies/:id                     — Update policy
PATCH  /api/v1/policies/:id/status              — Change status
POST   /api/v1/policies/quote                   — Create quote
POST   /api/v1/policies/calculate-premium       — Calculate premium
POST   /api/v1/policies/:id/bind                — Bind policy
POST   /api/v1/policies/:id/issue               — Issue policy
POST   /api/v1/policies/:id/endorse             — Create endorsement
POST   /api/v1/policies/endorsements/:id/approve — Approve endorsement
POST   /api/v1/policies/endorsements/:id/apply   — Apply endorsement
POST   /api/v1/policies/:id/renew               — Initiate renewal
POST   /api/v1/policies/renewals/:id/accept     — Accept renewal
POST   /api/v1/policies/renewals/:id/decline    — Decline renewal
POST   /api/v1/policies/:id/reinstate           — Reinstate policy
```

---

### 6.3 Customer Management

**Route:** `/customers`, `/customers/[id]`
**Access:** All roles (CRUD restricted to Admin, Operations)
**Purpose:** Customer profile management with linked policies and risk assessment

#### Features
- **Customer List**: Searchable DataTable with risk category badges
- **Customer Detail**: Profile information, linked policies, risk profile, contact details
- **Search**: Fuzzy search by name, email, phone, or ID
- **Risk Categories**: Low (green), Medium (amber), High (red) visual indicators
- **Linked Policies**: Quick navigation to associated policy records

#### Customer Data Model
```typescript
{
  id: string,              // "CUST001"
  name: string,            // "Aarav Sharma"
  email: string,
  phone: string,
  dob: string,             // "1965-01-01"
  address: {
    street: string,
    city: string,
    state: string,
    pincode: string
  },
  contact: {
    primary: string,
    secondary: string,
    email: string
  },
  riskCategory: "Low" | "Medium" | "High"
}
```

#### API Endpoints
```
GET    /api/v1/customers            — List customers
GET    /api/v1/customers/search     — Search customers
GET    /api/v1/customers/:id        — Get customer detail
GET    /api/v1/customers/:id/policies — Customer with policies
POST   /api/v1/customers            — Create customer
PUT    /api/v1/customers/:id        — Update customer
DELETE /api/v1/customers/:id        — Delete customer
```

---

### 6.4 Claims Processing

**Route:** `/claims`, `/claims/[id]`
**Access:** All roles (CRUD restricted to Admin, Claims)
**Purpose:** End-to-end claims management with adjudication, reserves, and fraud detection

#### Claims Status Flow

```
Filed ──→ Under Review ──→ Approved ──→ Settled
                │              │
                └──→ Rejected  └──→ (Settlement paid)
```

#### Adjudication Stages

```
Investigation → Evaluation → Negotiation → Settlement
```

#### Features
- **Claims List**: DataTable with status/type filters, adjudication view toggle
- **Claim Detail**: Tabbed view (Details | Reserve | Fraud | Mitigation | Timeline)
- **Reserve Management**: Set/adjust reserves, view reserve history chart
- **Fraud Scoring**: Automated fraud indicator assessment with 6 weighted rules
- **Loss Mitigation**: Track workout plans, forbearance, loan modifications
- **Settlement Processing**: Record settlement amount, method, and documentation
- **Claims Timeline**: Visual event log showing all claim activities

#### Fraud Scoring Rules
| Rule | Weight | Trigger |
|------|--------|---------|
| HIGH_AMOUNT | 20% | Claim amount > ₹5,00,000 |
| EARLY_CLAIM | 25% | Filed within 30 days of policy issue |
| DUPLICATE_CLAIM | 30% | Multiple claims on same policy in 90 days |
| FRAUD_TYPE | 40% | Claim type is explicitly "Fraud" |
| ROUND_AMOUNT | 10% | Suspiciously round amount |
| FREQUENT_CLAIMANT | 15% | 3+ claims by same customer |

**Fraud Score Levels:** Low (0-25) | Medium (26-50) | High (51-75) | Critical (76-100)

#### API Endpoints
```
GET    /api/v1/claims                            — List claims
GET    /api/v1/claims/:id                        — Get claim detail
GET    /api/v1/claims/policy/:policyId           — Claims by policy
GET    /api/v1/claims/adjudication               — List by adjudication
GET    /api/v1/claims/:id/reserve-history        — Reserve history
GET    /api/v1/claims/:id/fraud-score            — Fraud assessment
GET    /api/v1/claims/:id/mitigations            — Loss mitigations
POST   /api/v1/claims                            — Register claim
PATCH  /api/v1/claims/:id/status                 — Update status
POST   /api/v1/claims/:id/settle                 — Settle claim
PUT    /api/v1/claims/:id/adjudicate             — Update adjudication
PUT    /api/v1/claims/:id/reserve                — Set/adjust reserve
POST   /api/v1/claims/:id/mitigation             — Add mitigation
PATCH  /api/v1/claims/mitigations/:id/status     — Update mitigation
```

---

### 6.5 FNOL (First Notice of Loss)

**Route:** `/claims/fnol`
**Access:** Admin, Claims, Operations
**Purpose:** Structured intake of first notice of loss reports before claim registration

#### FNOL Workflow

```
FNOL Submitted → Processing → Claim Created
                     │
                     └──→ Rejected (if invalid)
```

#### Features
- **FNOL List**: Table showing all submissions with status, type, and estimated amount
- **FNOL Submission Form**: Structured intake (Incident details, parties, damage description, documents)
- **Policy Lookup**: Auto-link FNOL to existing policy
- **Process to Claim**: Convert FNOL to formal claim with pre-populated data
- **Estimated Amount**: Preliminary damage/loss estimation

#### FNOL Claim Types
- Property_Damage
- Mortgage_Default
- Natural_Disaster
- Liability

#### API Endpoints
```
GET    /api/v1/claims/fnol              — List FNOLs
GET    /api/v1/claims/fnol/:fnolId      — Get FNOL detail
POST   /api/v1/claims/fnol              — Submit FNOL
POST   /api/v1/claims/fnol/:id/process  — Process FNOL → Create Claim
```

---

### 6.6 Underwriting

**Route:** `/underwriting`, `/underwriting/referrals`, `/underwriting/rules`
**Access:** Admin, Operations, Underwriter, Viewer
**Purpose:** Risk evaluation, automated scoring, configurable rules, and referral management

#### Underwriting Decisions

```
Auto-Approve (score < threshold)
      │
      ├──→ Refer (score in range) ──→ Senior UW Review ──→ Accept/Decline/Escalate
      │
      └──→ Reject (score > threshold or eligibility fail)
```

#### Features
- **Underwriting List**: All evaluations with risk scores, decisions, and applicant info
- **Risk Scorecard**: Visual breakdown by category (Financial, Property, Customer, Compliance)
- **Configurable Rules**: CRUD interface for underwriting rules (Admin only)
- **Rule Builder**: IF-THEN format with operators (gt, gte, lt, lte, eq, neq, in, notIn, between)
- **Referral Queue**: Pending referrals with priority badges, SLA countdown, escalation
- **Delegated Authority**: Authority limits per underwriter (max coverage, max risk score)
- **Auto-Evaluation**: Automated scoring using multiple data points (credit score, LTV, income)

#### Rule Categories
| Category | Examples |
|----------|---------|
| Eligibility | Min credit score, max LTV ratio |
| Pricing | Premium multipliers by risk factor |
| Compliance | Regulatory limits, documentation requirements |
| Risk Assessment | Property type, location, borrower profile |

#### Referral SLA
| Priority | SLA | Trigger |
|----------|-----|---------|
| Critical | 24 hours | Risk score > 85 |
| High | 48 hours | Risk score 70-85 |
| Medium | 72 hours | Risk score 50-70 |
| Low | 5 business days | Manual referral |

#### API Endpoints
```
GET    /api/v1/underwriting                      — List evaluations
GET    /api/v1/underwriting/:id                  — Get evaluation detail
GET    /api/v1/underwriting/rules                — Get rules
GET    /api/v1/underwriting/policy/:policyId     — Get by policy
POST   /api/v1/underwriting/evaluate             — Evaluate underwriting
PATCH  /api/v1/underwriting/:id/override         — Override decision

GET    /api/v1/uw/rules                          — List configurable rules
POST   /api/v1/uw/rules                          — Create rule
PUT    /api/v1/uw/rules/:id                      — Update rule
DELETE /api/v1/uw/rules/:id                      — Delete rule

GET    /api/v1/uw/referrals                      — List referrals
GET    /api/v1/uw/referrals/summary              — Referral summary
GET    /api/v1/uw/referrals/my                   — My referrals
GET    /api/v1/uw/referrals/:id                  — Get referral
PUT    /api/v1/uw/referrals/:id/resolve          — Resolve referral
PUT    /api/v1/uw/referrals/:id/escalate         — Escalate referral

GET    /api/v1/uw/authority                      — List authorities
GET    /api/v1/uw/authority/:userId              — Get authority
PUT    /api/v1/uw/authority/:userId              — Update authority
```

---

### 6.7 Billing & Payments

**Route:** `/billing`, `/billing/[id]`
**Access:** Admin, Operations, Viewer
**Purpose:** Complete billing lifecycle — invoicing, payment recording, installment plans, and ledger management

#### Billing Account Statuses

```
Active ──→ Grace_Period ──→ Delinquent ──→ Suspended ──→ Closed
  │                              │
  └──→ Closed (fully paid)       └──→ Triggers Policy Lapse
```

#### Features
- **Billing List**: Account overview with balance, status, payment frequency
- **Account Detail**: Ledger view, payment history, installment schedule, balance summary
- **Invoice Management**: Generate, view, void invoices with line items
- **Payment Recording**: Record payments (ACH, Wire, Check, Credit Card, Escrow)
- **Installment Plans**: Calculate installments by frequency (Annual/Semi-Annual/Quarterly/Monthly)
- **Double-Entry Ledger**: Full financial record with debit/credit entries
- **Overdue Tracking**: Aging report (Current, 30-day, 60-day, 90-day, 90+)
- **Grace Period Automation**: Auto-trigger grace → lapse flow

#### Payment Frequencies
| Frequency | Installments | Surcharge |
|-----------|-------------|-----------|
| Annual | 1 | None |
| Semi-Annual | 2 | +2% |
| Quarterly | 4 | +3% |
| Monthly | 12 | +5% |

#### API Endpoints
```
GET    /api/v1/billing/summary                    — Billing summary
GET    /api/v1/billing/overdue                    — Overdue accounts
POST   /api/v1/billing/installment-plan           — Calculate installments
GET    /api/v1/billing/accounts                   — List accounts
GET    /api/v1/billing/accounts/:id               — Account detail
GET    /api/v1/billing/accounts/policy/:policyId  — Account by policy
POST   /api/v1/billing/accounts                   — Create account
PUT    /api/v1/billing/accounts/:id               — Update account
GET    /api/v1/billing/invoices                   — List invoices
GET    /api/v1/billing/invoices/:id               — Get invoice
POST   /api/v1/billing/invoices                   — Create invoice
PUT    /api/v1/billing/invoices/:id/void          — Void invoice
GET    /api/v1/billing/payments                   — List payments
GET    /api/v1/billing/payments/:id               — Get payment
POST   /api/v1/billing/payments                   — Record payment
GET    /api/v1/billing/ledger/:accountId          — Get ledger
```

---

### 6.8 Task Management

**Route:** `/tasks`
**Access:** Admin, Operations, Underwriter, Claims
**Purpose:** SLA-driven task queues with automated creation and priority management

#### Task Automation Triggers

| Trigger Event | Task Type | SLA | Priority |
|--------------|-----------|-----|----------|
| Claim Filed | CLAIM_REVIEW | 3 days | High |
| FNOL Submitted | FNOL_PROCESSING | 1 day | Urgent |
| UW Referral Created | UW_REFERRAL | 2 days | High |
| Policy Near Expiry | POLICY_RENEWAL | 7 days before | Medium |
| Fraud Score > 50 | FRAUD_REVIEW | 1 day | Urgent |
| Fraud Score 26-50 | FRAUD_REVIEW | 2 days | High |

#### Features
- **Task List**: Filterable by status, priority, assignee, type
- **Task Dashboard**: My tasks, overdue count, priority breakdown
- **Auto-Creation**: Tasks auto-generated from workflow events
- **SLA Tracking**: Visual countdown to deadline, overdue detection
- **Priority Badges**: Low (blue), Medium (amber), High (orange), Urgent (red)
- **Assignment**: Manual reassignment with notification

#### API Endpoints
```
GET    /api/v1/tasks                — List all tasks
GET    /api/v1/tasks/my             — My tasks
GET    /api/v1/tasks/dashboard      — Task summary
GET    /api/v1/tasks/:id            — Get task detail
POST   /api/v1/tasks                — Create task
PUT    /api/v1/tasks/:id            — Update task
DELETE /api/v1/tasks/:id            — Delete task
POST   /api/v1/tasks/check-overdue  — Check overdue (Admin)
```

---

### 6.9 Document Management

**Route:** `/documents`
**Access:** Admin, Operations (full); Underwriter, Claims (upload/generate)
**Purpose:** Document upload, template-based generation, versioning, and categorization

#### Features
- **Document Library**: Filterable list with category tabs (All | Policy | Claims | UW | Correspondence)
- **Upload**: Document metadata recording with file type and source tracking
- **Template-Based Generation**: Generate documents from predefined templates
- **Version History**: Track document versions per entity
- **Verification**: Mark documents as verified (Admin, Operations)
- **Policy/Claim Linking**: Documents linked to specific policies or claims

#### Document Templates
- Policy Declaration Page
- Certificate of Insurance
- Endorsement Schedule
- Claims Correspondence
- Billing Invoice
- Underwriting Summary

#### API Endpoints
```
GET    /api/v1/documents                        — List documents
GET    /api/v1/documents/:id                    — Get document
GET    /api/v1/documents/:id/versions           — Get versions
GET    /api/v1/documents/policy/:policyId       — By policy
GET    /api/v1/documents/claim/:claimId         — By claim
GET    /api/v1/documents/templates              — List templates
POST   /api/v1/documents                        — Upload document
POST   /api/v1/documents/generate               — Generate from template
PUT    /api/v1/documents/:id/verify             — Verify document
DELETE /api/v1/documents/:id                    — Delete document
```

---

### 6.10 Renewals

**Route:** `/renewals`
**Access:** Admin, Operations
**Purpose:** Policy renewal management with batch processing

#### Features
- **Renewal Queue**: Policies approaching expiry sorted by urgency
- **Batch Renewal**: Select multiple policies for bulk renewal
- **Renewal Premium**: Auto-calculated with optional underwriting re-evaluation
- **Accept/Decline**: Renewal decision workflow
- **Timeline View**: Urgency grouping (Overdue | Due This Week | Due This Month | Upcoming)

#### API Endpoints
```
GET    /api/v1/policies/renewals/pending        — Pending renewals
POST   /api/v1/policies/:id/renew               — Initiate renewal
POST   /api/v1/policies/renewals/:id/accept     — Accept renewal
POST   /api/v1/policies/renewals/:id/decline    — Decline renewal
```

---

### 6.11 Notifications

**Route:** `/notifications` (full page), Header Bell (dropdown)
**Access:** All authenticated users
**Purpose:** Event-driven notification system with in-app bell and notification center

#### Notification Types (20 types)
- **Policy**: Issued, Renewed, Endorsed, Cancelled, Lapsed
- **Claims**: Filed, Approved, Rejected, Settled
- **FNOL**: Submitted
- **Underwriting**: Referral, Decision
- **Tasks**: Assigned, Overdue, Completed
- **Billing**: Payment Due, Payment Overdue, Reserve Changed
- **System**: Renewal Due, System alerts

#### Features
- **Bell Icon**: Real-time unread count badge with pulse animation
- **Dropdown Panel**: Quick view of recent 10 notifications
- **Notification Center**: Full page with type/date/read filters
- **Mark as Read**: Individual and bulk mark-as-read
- **Action Links**: Click notification to navigate to related entity
- **Auto-Refresh**: Polls unread count every 30 seconds

#### API Endpoints
```
GET    /api/v1/notifications              — List notifications
GET    /api/v1/notifications/unread-count  — Unread count
PUT    /api/v1/notifications/read-all      — Mark all read
PUT    /api/v1/notifications/:id/read      — Mark one read
DELETE /api/v1/notifications/:id           — Delete notification
```

---

### 6.12 Reports & Analytics

**Route:** `/reports`
**Access:** All roles
**Purpose:** Business intelligence with filterable reports, executive KPIs, and CSV export

#### Report Types
| Report | Metrics |
|--------|---------|
| **Policy Report** | Policies by status, type distribution, premium volume, coverage breakdown |
| **Claims Report** | Claims by status/type, average amount, cycle time, reserve utilization |
| **Underwriting Report** | Approval rate, risk distribution, average score, referral volume |
| **Billing Report** | Revenue, outstanding balance, overdue accounts, payment method distribution |
| **Executive Report** | Loss ratio, combined ratio, retention rate, key business KPIs |

#### Features
- **Date Range Filtering**: Presets (This Month, Last Month, Last Quarter, YTD, Custom)
- **CSV Export**: Download any report as CSV file
- **Drill-Down**: Click chart elements to navigate to filtered list
- **Executive KPIs**: Loss ratio gauge, combined ratio, retention rate trend

#### API Endpoints
```
GET /api/v1/reports/policies?from=&to=
GET /api/v1/reports/claims?from=&to=
GET /api/v1/reports/underwriting?from=&to=
GET /api/v1/reports/billing?from=&to=
GET /api/v1/reports/executive
GET /api/v1/reports/export/policies    — CSV export
GET /api/v1/reports/export/claims      — CSV export
```

---

### 6.13 Administration

**Route:** `/admin` and sub-pages
**Access:** Admin only
**Purpose:** User management, system configuration, audit logging, and integration management

#### Sub-Modules

| Sub-Module | Route | Purpose |
|-----------|-------|---------|
| **User Management** | `/admin` | Create, update, activate/deactivate users, assign roles |
| **Product Configuration** | `/admin/products` | CRUD for insurance products with rating tables |
| **Compliance** | `/admin/compliance` | Regulatory requirement tracking |
| **API Keys** | `/admin/api-keys` | Generate, revoke API keys for integrations |
| **Webhooks** | `/admin/webhooks` | Register webhook endpoints for events |
| **Bulk Operations** | `/admin/bulk-operations` | Batch processing for renewals, invoices, etc. |
| **Audit Logs** | `/admin` (tab) | System-wide audit trail |

#### API Endpoints — User Management
```
GET    /api/v1/admin/users              — List users
POST   /api/v1/admin/users              — Create user
PUT    /api/v1/admin/users/:id          — Update user
PATCH  /api/v1/admin/users/:id/deactivate — Deactivate
GET    /api/v1/admin/logs               — Audit logs
```

#### API Endpoints — Products
```
GET    /api/v1/products                 — List products
GET    /api/v1/products/:id             — Get product
POST   /api/v1/products                 — Create product
PUT    /api/v1/products/:id             — Update product
DELETE /api/v1/products/:id             — Delete product
```

#### API Endpoints — Integrations
```
GET    /api/v1/integrations/keys        — List API keys
POST   /api/v1/integrations/keys        — Generate key
DELETE /api/v1/integrations/keys/:id    — Revoke key
GET    /api/v1/integrations/webhooks    — List webhooks
POST   /api/v1/integrations/webhooks    — Register webhook
DELETE /api/v1/integrations/webhooks/:id — Remove webhook
POST   /api/v1/integrations/webhooks/:id/test — Test webhook
```

#### API Endpoints — Bulk Operations
```
POST /api/v1/bulk/:operation            — Start operation (renewal/cancel/claim-update/invoice)
GET  /api/v1/bulk/:operationId/status   — Check progress
GET  /api/v1/bulk                       — List recent operations
```

---

### 6.14 Compliance

**Route:** `/admin/compliance`
**Access:** Admin
**Purpose:** Regulatory requirement tracking with status monitoring

#### Features
- **Requirement List**: All regulatory requirements with status indicators
- **Status Tracking**: Compliant | Non-Compliant | Due | In Progress
- **Deadline Management**: Timeline view of upcoming deadlines
- **Summary Dashboard**: Compliance health overview

#### API Endpoints
```
GET    /api/v1/compliance/requirements          — List requirements
GET    /api/v1/compliance/summary               — Compliance summary
GET    /api/v1/compliance/requirements/:id      — Get detail
POST   /api/v1/compliance/requirements          — Create requirement
PUT    /api/v1/compliance/requirements/:id      — Update requirement
DELETE /api/v1/compliance/requirements/:id      — Delete requirement
```

---

### 6.15 Service Desk (QDE)

**Route:** `/service-desk`
**Access:** Admin, Operations
**Purpose:** Quick Data Entry for new loan/guarantee applications with multi-step wizard

#### Features
- **Add New Loan**: 5-step wizard (Loan Basic → Applicant Details → Loan Characteristics → Obligations → Verification)
- **Auto Allocation**: Rules-based assignment of applications to underwriters
- **QDE Search**: Search existing QDE applications by ID, customer, or status
- **User Dashboard**: Personal queue showing assigned and pending items
- **Draft Auto-Save**: Applications saved as drafts with timestamp indicator
- **Workflow Progress**: Visual QDE → DDE → Underwriting → Decision → Issuance progress bar

#### Mock Data Endpoints
```
GET    /api/v1/service-desk/applications       — List QDE applications
GET    /api/v1/service-desk/allocations        — Auto allocation rules
GET    /api/v1/service-desk/search             — Search applications
```

---

### 6.16 DDE (Detailed Data Entry)

**Route:** `/dde`
**Access:** Admin, Operations
**Purpose:** Detailed data entry workspace for loan applications with comprehensive metrics and document management

#### Features
- **Loan Header Bar**: Key identifiers (Loan ID, Lender, Deal ID, Employment Type, Outstanding)
- **Workflow Progress**: 5-step horizontal progress indicator
- **Key Metrics**: 4 metric cards (LTV ratio, FOIR, CIBIL Score, EMI/NMI ratio) with check/alert icons
- **Tabbed Data Entry**: 6 tabs (Loan Chars, General Data, Employment, Income Details, Banking, Obligations)
- **Documents Sidebar**: Document checklist with Approved/Pending status per document
- **Eligibility Sidebar**: Max Eligible, Applied, Buffer amounts
- **Remarks/Case Notes**: Notes textarea with save functionality
- **Sticky Footer**: Save + Submit to Underwriting action buttons

#### Mock Data Endpoints
```
GET    /api/v1/dde/loan-details                — Loan detail data
GET    /api/v1/dde/documents-checklist         — Documents status
GET    /api/v1/dde/eligibility                 — Eligibility calculation
```

---

### 6.17 Finance

**Route:** `/finance`
**Access:** Admin, Operations
**Purpose:** Financial management including invoicing, payments, and reconciliation

#### Features
- **KPI Cards**: Total Revenue, Outstanding, Collected, Reconciled percentage
- **Invoices Tab**: Invoice table with ID, Lender, Deal, Type, Amount, Status, Date columns
- **Payments Tab**: Payment records with method, reference, and status tracking
- **Reconciliation Tab**: Bank reconciliation with match status and variance tracking
- **Generate Invoice**: Action button for new invoice creation

#### Mock Data Endpoints
```
GET    /api/v1/finance/summary                 — Finance KPI summary
GET    /api/v1/finance/invoices                — Invoice listing
GET    /api/v1/finance/payments                — Payment records
GET    /api/v1/finance/reconciliation          — Reconciliation data
```

---

### 6.18 Servicing

**Route:** `/servicing`
**Access:** Admin, Operations
**Purpose:** Loan servicing data management including file uploads, NPA tracking, and delinquency monitoring

#### Features
- **File Upload**: Servicing file upload with Lender Name, Month, Batch Received Date, Batch ID
- **Data Analysis**: Uploaded file analysis results with validation status
- **NPA Tracking**: Non-Performing Asset tracking with NPA status, classification, and provisioning
- **Premium Check**: Premium payment verification and status
- **Delinquency**: Delinquency metrics with DPD buckets and trend analysis

#### Mock Data Endpoints
```
GET    /api/v1/servicing/batches               — Batch upload history
GET    /api/v1/servicing/npa-tracking          — NPA status records
GET    /api/v1/servicing/delinquency           — Delinquency metrics
```

---

### 6.19 Master Setup

**Route:** `/master-setup`
**Access:** Admin
**Purpose:** System configuration and master data management

#### Features
- **Configuration Cards**: 14 clickable configuration areas in responsive grid
  - Lender Setup, Deal Setup, Scheme Setup, Pricing Upload
  - Template Management, Role Management, Workflow Config, Builder/Project Master
  - City Classification, Vendor Mapping, Deviation Master, Collateral Master
  - Regulatory Compliance, System Settings
- Each card shows: icon, title, description, record count

#### Mock Data Endpoints
```
GET    /api/v1/master-setup/configurations     — Configuration card data
```

---

### 6.20 Audit Logs

**Route:** `/audit-logs`
**Access:** Admin
**Purpose:** Comprehensive field-level audit trail with change tracking

#### Features
- **Field-Level Change Tracking**: Old → New value display with visual diff (red strikethrough → green new)
- **Module Filter**: Dropdown filter by module (Underwriting, DDE, QDE, Workflow, etc.)
- **Date Range Filter**: Filter logs by date range
- **Search**: Free-text search across all log fields
- **Export Logs**: CSV export of filtered audit data
- **Table Columns**: Timestamp, User, Module, Field, Old Value, New Value, Record ID

#### Mock Data Endpoints
```
GET    /api/v1/audit-logs/logs                 — Audit log entries
GET    /api/v1/audit-logs/field-changes        — Field-level changes
```

---

## 7. End-to-End Business Flows

### 7.0 Loan Application Workflow (QDE → Issuance)

```
┌──────────────────────────────────────────────────────────────┐
│                QDE → DDE → UNDERWRITING → DECISION → ISSUANCE│
│                                                              │
│  ┌─────────┐    ┌─────────┐    ┌──────────────┐             │
│  │   QDE   │───▶│   DDE   │───▶│ Underwriting │             │
│  │(Service │    │(Detail  │    │ (Risk Eval,  │             │
│  │  Desk)  │    │  Data   │    │  AI Recom,   │             │
│  │         │    │  Entry) │    │  BRE Check)  │             │
│  └─────────┘    └─────────┘    └──────┬───────┘             │
│                                        │                     │
│                              ┌─────────▼─────────┐          │
│                              │     Decision       │          │
│                              │ Approve/Reject/    │          │
│                              │ Defer/Query/       │          │
│                              │ Send Back          │          │
│                              └─────────┬──────────┘          │
│                                        │ (if Approved)       │
│                              ┌─────────▼─────────┐          │
│                              │     Issuance       │          │
│                              │ Policy/Guarantee   │          │
│                              │    Generated       │          │
│                              └────────────────────┘          │
└──────────────────────────────────────────────────────────────┘
```

**Steps:**
1. **QDE (Service Desk)**: Quick data entry — basic loan/borrower info captured via 5-step wizard
2. **DDE (Detailed Data Entry)**: Comprehensive data entry with 6 tabs, document verification, eligibility check
3. **Underwriting**: Risk evaluation with AI recommendation, BRE check, metric analysis (LTV, FOIR, CIBIL, EMI/NMI)
4. **Decision**: Underwriter makes decision — Approve, Reject, Defer, Query to Lender, Send Back, or Raise Deviation
5. **Issuance**: Upon approval, policy/guarantee certificate is generated

---

### 7.1 Policy Lifecycle Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    POLICY LIFECYCLE                            │
│                                                               │
│  ① CREATE QUOTE                                              │
│  ├─ Operations user navigates to Policies → "New Quote"       │
│  ├─ Selects customer (or creates new)                         │
│  ├─ Chooses product (Mortgage Guarantee / Credit Protection)  │
│  ├─ Configures coverage amount and term                       │
│  └─ System calculates premium via Premium Engine              │
│     POST /api/v1/policies/quote                               │
│     POST /api/v1/policies/calculate-premium                   │
│     → Status: QUOTED                                          │
│                                                               │
│  ② BIND POLICY                                               │
│  ├─ Operations reviews quote details and premium breakdown    │
│  ├─ Confirms quote → Binds policy                             │
│  └─ Underwriting auto-triggered for risk evaluation           │
│     POST /api/v1/policies/:id/bind                            │
│     POST /api/v1/underwriting/evaluate                        │
│     → Status: BOUND                                           │
│                                                               │
│  ③ ISSUE POLICY                                              │
│  ├─ Underwriting decision: Auto-Approve / Refer / Reject     │
│  ├─ If approved → Operations issues policy                    │
│  ├─ Billing account auto-created                              │
│  ├─ Welcome notification sent                                 │
│  └─ Document generated (Policy Declaration)                   │
│     POST /api/v1/policies/:id/issue                           │
│     → Status: ISSUED → ACTIVE                                 │
│     → Task: Document Review created                           │
│     → Notification: POLICY_ISSUED                             │
│                                                               │
│  ④ MID-TERM ENDORSEMENT                                     │
│  ├─ Customer requests coverage change                         │
│  ├─ Operations creates endorsement                            │
│  ├─ System calculates premium delta                           │
│  ├─ Endorsement approved → Applied to policy                  │
│  └─ New version created with change log                       │
│     POST /api/v1/policies/:id/endorse                         │
│     → Status: ENDORSED                                        │
│     → Notification: POLICY_ENDORSED                           │
│                                                               │
│  ⑤ RENEWAL                                                   │
│  ├─ System flags policy 30/60/90 days before expiry           │
│  ├─ Renewal task auto-created                                 │
│  ├─ Operations initiates renewal                              │
│  ├─ New premium calculated (may change based on claims)       │
│  ├─ Customer accepts → Renewal applied                        │
│  └─ New term begins                                           │
│     POST /api/v1/policies/:id/renew                           │
│     POST /api/v1/policies/renewals/:id/accept                 │
│     → Status: RENEWAL_PENDING → ACTIVE (new term)             │
│     → Notification: POLICY_RENEWED                            │
│                                                               │
│  ⑥ CANCELLATION / LAPSE / REINSTATEMENT                     │
│  ├─ Cancel: Manual cancellation by request                    │
│  ├─ Lapse: Auto-triggered by non-payment after grace period   │
│  ├─ Expire: Policy term ends without renewal                  │
│  └─ Reinstate: Restore lapsed/cancelled policy with back-pay  │
│     PATCH /api/v1/policies/:id/status                         │
│     POST /api/v1/policies/:id/reinstate                       │
│     → Notifications: POLICY_CANCELLED / POLICY_LAPSED         │
└──────────────────────────────────────────────────────────────┘
```

### 7.2 Claims Processing Flow

```
┌──────────────────────────────────────────────────────────────┐
│                  CLAIMS PROCESSING FLOW                        │
│                                                               │
│  ① CLAIM REGISTRATION                                        │
│  ├─ Claims user registers new claim against a policy          │
│  ├─ Claim type: Default / Property Damage / Fraud / Other     │
│  ├─ Initial reserve auto-set based on claim amount            │
│  ├─ Fraud scoring auto-triggered                              │
│  └─ Task auto-created: CLAIM_REVIEW (3-day SLA)              │
│     POST /api/v1/claims                                       │
│     → Status: FILED                                           │
│     → Notification: CLAIM_FILED                               │
│     → Task: CLAIM_REVIEW assigned to Claims team              │
│                                                               │
│  ② INVESTIGATION                                             │
│  ├─ Claims adjuster reviews documentation                     │
│  ├─ Fraud indicators assessed (6 rules, weighted score)       │
│  ├─ If fraud score > 50 → FRAUD_REVIEW task (Urgent)         │
│  ├─ Reserve adjustments made as investigation progresses      │
│  └─ Adjudication updated to "Investigation"                   │
│     PUT /api/v1/claims/:id/adjudicate                         │
│     PUT /api/v1/claims/:id/reserve                            │
│     → Adjudication: Investigation                             │
│                                                               │
│  ③ EVALUATION                                                │
│  ├─ Damage assessment completed                               │
│  ├─ Reserve finalized based on evaluation                     │
│  ├─ Loss mitigation options identified                        │
│  └─ Adjudication updated to "Evaluation"                      │
│     PUT /api/v1/claims/:id/adjudicate                         │
│     POST /api/v1/claims/:id/mitigation                        │
│     → Adjudication: Evaluation                                │
│                                                               │
│  ④ NEGOTIATION                                               │
│  ├─ Settlement amount negotiated with parties                 │
│  ├─ Reserve adjusted to match proposed settlement             │
│  └─ Adjudication updated to "Negotiation"                     │
│     → Adjudication: Negotiation                               │
│                                                               │
│  ⑤ DECISION                                                  │
│  ├─ Claim approved or rejected                                │
│  ├─ Approved → Move to settlement                             │
│  └─ Rejected → Close claim with reason                        │
│     PATCH /api/v1/claims/:id/status                           │
│     → Status: APPROVED or REJECTED                            │
│     → Notification: CLAIM_APPROVED / CLAIM_REJECTED           │
│                                                               │
│  ⑥ SETTLEMENT                                               │
│  ├─ Settlement amount confirmed                               │
│  ├─ Payment processed                                         │
│  ├─ Documents generated (Settlement Letter)                   │
│  └─ Claim closed                                              │
│     POST /api/v1/claims/:id/settle                            │
│     → Status: SETTLED                                         │
│     → Notification: CLAIM_SETTLED                             │
│     → Task: CLAIM_SETTLEMENT completed                        │
└──────────────────────────────────────────────────────────────┘
```

### 7.3 FNOL to Claim Settlement Flow

```
┌──────────────────────────────────────────────────────────────┐
│              FNOL → CLAIM END-TO-END FLOW                     │
│                                                               │
│  FNOL Submission                                              │
│  ├─ Incident reported (phone, email, or agent)                │
│  ├─ FNOL form captures:                                       │
│  │   • Policy ID lookup                                       │
│  │   • Claim type selection                                   │
│  │   • Incident date, location, description                   │
│  │   • Parties involved (names, roles, contacts)              │
│  │   • Damage description                                     │
│  │   • Estimated amount                                       │
│  │   • Supporting documents                                   │
│  └─ POST /api/v1/claims/fnol                                  │
│     → FNOL Status: Submitted                                  │
│     → Task: FNOL_PROCESSING (Urgent, 1-day SLA)              │
│                                                               │
│       ▼                                                       │
│  FNOL Processing                                              │
│  ├─ Claims team reviews FNOL submission                       │
│  ├─ Validates policy coverage and incident details            │
│  ├─ Decides: Process to Claim or Reject                       │
│  └─ POST /api/v1/claims/fnol/:id/process                     │
│     → FNOL Status: Claim Created                              │
│     → New Claim auto-created with FNOL data                   │
│     → Claim Status: Filed                                     │
│                                                               │
│       ▼                                                       │
│  Claims Processing (see Section 7.2)                          │
│  ├─ Investigation → Evaluation → Negotiation → Settlement     │
│  └─ Full claims workflow with reserve, fraud, mitigation      │
└──────────────────────────────────────────────────────────────┘
```

### 7.4 Underwriting & Referral Flow

```
┌──────────────────────────────────────────────────────────────┐
│           UNDERWRITING & REFERRAL FLOW                         │
│                                                               │
│  ① POLICY BOUND → AUTO-EVALUATION                            │
│  ├─ System triggers underwriting evaluation on bind            │
│  ├─ Applicant data collected:                                  │
│  │   • Credit Score (300-850)                                  │
│  │   • LTV Ratio (0-1.0)                                      │
│  │   • Property Value                                          │
│  │   • Loan Amount                                             │
│  │   • Employment Status                                       │
│  │   • Years of Employment                                     │
│  │   • Income                                                  │
│  │   • Existing Policies Count                                 │
│  └─ POST /api/v1/underwriting/evaluate                         │
│                                                               │
│  ② RULE ENGINE EVALUATION                                    │
│  ├─ All active rules evaluated against applicant data          │
│  ├─ Risk score calculated (0-100):                             │
│  │   • 0-25: Low Risk                                          │
│  │   • 26-50: Medium Risk                                      │
│  │   • 51-75: High Risk                                        │
│  │   • 76-100: Very High Risk                                  │
│  └─ Decision determined:                                       │
│                                                               │
│  ③ AUTO-APPROVE (Low/Medium Risk)                            │
│  ├─ Score below threshold → Auto-approved                      │
│  └─ Policy can proceed to issuance                             │
│     → UW Decision: Auto-Approve                               │
│                                                               │
│  ④ REFER (Elevated Risk)                                     │
│  ├─ Score in referral range → Auto-referred                    │
│  ├─ Referral created with priority based on score              │
│  ├─ Assigned to senior underwriter (by authority limits)       │
│  ├─ SLA timer starts (24h-5d based on priority)               │
│  └─ Task created: UW_REFERRAL                                 │
│     → UW Decision: Refer                                      │
│     → Notification: UW_REFERRAL                               │
│                                                               │
│     ④a. REFERRAL REVIEW                                       │
│     ├─ Senior UW reviews risk factors and documentation        │
│     ├─ Options: Accept (approve) / Decline (reject) / Escalate│
│     ├─ Accept → Override with approved decision                │
│     ├─ Decline → Override with rejected decision               │
│     └─ Escalate → Reassign to higher authority                 │
│        PUT /api/v1/uw/referrals/:id/resolve                   │
│        PUT /api/v1/uw/referrals/:id/escalate                  │
│                                                               │
│  ⑤ REJECT (High Risk)                                       │
│  ├─ Score above rejection threshold → Auto-rejected            │
│  └─ Policy cannot proceed without manual override              │
│     → UW Decision: Reject                                      │
│                                                               │
│  ⑥ MANUAL OVERRIDE                                           │
│  ├─ Authorized underwriter can override any decision           │
│  ├─ Override reason required                                   │
│  └─ Audit logged: overrider, reason, original vs new decision  │
│     PATCH /api/v1/underwriting/:id/override                    │
└──────────────────────────────────────────────────────────────┘
```

### 7.5 Billing Lifecycle Flow

```
┌──────────────────────────────────────────────────────────────┐
│                  BILLING LIFECYCLE FLOW                        │
│                                                               │
│  ① ACCOUNT CREATION                                          │
│  ├─ Billing account auto-created on policy issuance           │
│  ├─ Payment frequency selected (Annual/Semi/Quarterly/Monthly)│
│  ├─ Installment plan calculated                               │
│  └─ First invoice generated                                   │
│     POST /api/v1/billing/accounts                             │
│     POST /api/v1/billing/invoices                             │
│     → Account Status: Active                                  │
│     → Invoice Status: Pending                                 │
│                                                               │
│  ② INVOICE GENERATION                                        │
│  ├─ Invoices generated per installment schedule               │
│  ├─ Line items: Premium, Fees, Taxes, Surcharges              │
│  ├─ Due date calculated based on policy terms                 │
│  └─ Notification: PAYMENT_DUE                                 │
│                                                               │
│  ③ PAYMENT RECORDING                                         │
│  ├─ Payment received and recorded                             │
│  ├─ Methods: ACH, Wire, Check, Credit Card, Escrow           │
│  ├─ Ledger entry created (debit: receivable, credit: cash)   │
│  ├─ Invoice status updated                                    │
│  └─ Balance recalculated                                      │
│     POST /api/v1/billing/payments                             │
│     → Invoice Status: Paid                                    │
│     → Ledger: DR Receivable / CR Cash                         │
│                                                               │
│  ④ OVERDUE MANAGEMENT                                        │
│  ├─ Invoice past due → Status: Overdue                        │
│  ├─ Notification: PAYMENT_OVERDUE                             │
│  ├─ Grace period begins (configurable per account)            │
│  └─ If not paid in grace period → Delinquent                  │
│     → Account Status: Grace_Period → Delinquent               │
│                                                               │
│  ⑤ LAPSE TRIGGER                                            │
│  ├─ Delinquent account triggers policy lapse evaluation       │
│  ├─ Account suspended                                         │
│  └─ Policy status → Lapsed                                    │
│     → Account Status: Suspended                               │
│     → Policy Status: Lapsed                                   │
│     → Notification: POLICY_LAPSED                             │
│                                                               │
│  ⑥ AGING REPORT                                             │
│  ├─ Current: 0 days overdue                                   │
│  ├─ 30-Day: 1-30 days overdue                                 │
│  ├─ 60-Day: 31-60 days overdue                                │
│  ├─ 90-Day: 61-90 days overdue                                │
│  └─ 90+ Day: Over 90 days overdue                             │
│     GET /api/v1/billing/overdue                               │
└──────────────────────────────────────────────────────────────┘
```

### 7.6 Renewal Workflow

```
┌──────────────────────────────────────────────────────────────┐
│                    RENEWAL WORKFLOW                            │
│                                                               │
│  ① RENEWAL DETECTION                                         │
│  ├─ System identifies policies within renewal window          │
│  ├─ 90 days out: Added to renewal queue                       │
│  ├─ 60 days out: Notification sent                            │
│  └─ 30 days out: Task auto-created (POLICY_RENEWAL)          │
│     → Notification: RENEWAL_DUE                               │
│     → Status: Active (flagged for renewal)                    │
│                                                               │
│  ② RENEWAL INITIATION                                        │
│  ├─ Operations user selects policy(s) for renewal             │
│  ├─ System generates renewal quote:                           │
│  │   • Current policy terms loaded                            │
│  │   • Claims history reviewed (may affect premium)           │
│  │   • New premium calculated                                 │
│  │   • Optional: Re-underwriting triggered                    │
│  └─ Renewal record created                                    │
│     POST /api/v1/policies/:id/renew                           │
│     → Status: Renewal_Pending                                 │
│                                                               │
│  ③ RENEWAL DECISION                                          │
│  ├─ Customer/agent reviews renewal terms                      │
│  ├─ Accept → New policy term begins                           │
│  │   POST /api/v1/policies/renewals/:id/accept                │
│  │   → Status: Active (new term dates)                        │
│  │   → New billing period initiated                           │
│  │   → Notification: POLICY_RENEWED                           │
│  └─ Decline → Policy expires at current term end              │
│     POST /api/v1/policies/renewals/:id/decline                │
│     → Status: Expired (at end date)                           │
│                                                               │
│  ④ BATCH RENEWAL (Admin/Operations)                          │
│  ├─ Select multiple policies from renewal queue               │
│  ├─ Bulk operation initiated                                  │
│  └─ Individual results tracked per policy                     │
│     POST /api/v1/bulk/renewal                                 │
└──────────────────────────────────────────────────────────────┘
```

### 7.7 Endorsement Flow

```
┌──────────────────────────────────────────────────────────────┐
│                   ENDORSEMENT FLOW                             │
│                                                               │
│  ① REQUEST                                                   │
│  ├─ Customer or agent requests mid-term policy change          │
│  ├─ Endorsement types:                                        │
│  │   • Coverage Change (increase/decrease)                    │
│  │   • Premium Adjustment                                     │
│  │   • Beneficiary Change                                     │
│  │   • Term Extension                                         │
│  │   • Other                                                  │
│  └─ Operations creates endorsement record                     │
│     POST /api/v1/policies/:id/endorse                         │
│     → Endorsement Status: Pending                             │
│                                                               │
│  ② PREMIUM DELTA                                             │
│  ├─ System calculates premium difference                      │
│  ├─ Coverage increase → Additional premium (pro-rated)        │
│  └─ Coverage decrease → Refund premium (pro-rated)            │
│                                                               │
│  ③ APPROVAL                                                  │
│  ├─ Authorized user approves endorsement                      │
│  └─ POST /api/v1/policies/endorsements/:id/approve            │
│     → Endorsement Status: Approved                            │
│                                                               │
│  ④ APPLICATION                                               │
│  ├─ Endorsement applied to policy                             │
│  ├─ New policy version created                                │
│  ├─ Billing adjusted for premium delta                        │
│  └─ Notification sent                                         │
│     POST /api/v1/policies/endorsements/:id/apply              │
│     → Policy Status: Endorsed → Active                        │
│     → Policy Version: Incremented                             │
│     → Notification: POLICY_ENDORSED                           │
└──────────────────────────────────────────────────────────────┘
```

### 7.8 Task Automation Flow

```
┌──────────────────────────────────────────────────────────────┐
│                TASK AUTOMATION FLOW                            │
│                                                               │
│  TRIGGER EVENTS → AUTO-TASK CREATION                          │
│                                                               │
│  ┌─────────────────┐    ┌──────────────────────────────────┐ │
│  │ Claim Filed      │───→│ CLAIM_REVIEW task               │ │
│  │                  │    │ Assigned to: Claims team          │ │
│  │                  │    │ SLA: 3 business days              │ │
│  │                  │    │ Priority: High                    │ │
│  └─────────────────┘    └──────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────┐    ┌──────────────────────────────────┐ │
│  │ FNOL Submitted   │───→│ FNOL_PROCESSING task            │ │
│  │                  │    │ Assigned to: Claims team          │ │
│  │                  │    │ SLA: 1 business day               │ │
│  │                  │    │ Priority: Urgent                  │ │
│  └─────────────────┘    └──────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────┐    ┌──────────────────────────────────┐ │
│  │ UW Referral      │───→│ UW_REFERRAL task                │ │
│  │                  │    │ Assigned to: Senior Underwriter   │ │
│  │                  │    │ SLA: 2 business days              │ │
│  │                  │    │ Priority: High                    │ │
│  └─────────────────┘    └──────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────┐    ┌──────────────────────────────────┐ │
│  │ Policy Near      │───→│ POLICY_RENEWAL task             │ │
│  │ Expiry (7 days)  │    │ Assigned to: Operations          │ │
│  │                  │    │ SLA: 7 calendar days              │ │
│  │                  │    │ Priority: Medium                  │ │
│  └─────────────────┘    └──────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────┐    ┌──────────────────────────────────┐ │
│  │ Fraud Score > 50 │───→│ FRAUD_REVIEW task               │ │
│  │                  │    │ Assigned to: Senior Claims        │ │
│  │                  │    │ SLA: 1-2 days (by severity)      │ │
│  │                  │    │ Priority: Urgent/High             │ │
│  └─────────────────┘    └──────────────────────────────────┘ │
│                                                               │
│  TASK LIFECYCLE                                               │
│  Open → In Progress → Completed                              │
│    │                                                          │
│    └──→ Overdue (past SLA) → Escalation notification         │
└──────────────────────────────────────────────────────────────┘
```

---

## 8. API Reference

### Base URL
```
http://localhost:4000/api/v1
```

### Authentication
All endpoints except `/auth/login` and `/auth/refresh` require:
```
Authorization: Bearer <accessToken>
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description",
  "message": "Detailed error message"
}
```

### Complete Endpoint Summary

| Module | Endpoints | Methods |
|--------|-----------|---------|
| Auth | 4 | POST, GET |
| Policies | 20 | GET, POST, PUT, PATCH |
| Customers | 7 | GET, POST, PUT, DELETE |
| Claims | 17 | GET, POST, PUT, PATCH |
| Underwriting | 6 | GET, POST, PATCH |
| UW Rules & Referrals | 14 | GET, POST, PUT, DELETE |
| Billing | 17 | GET, POST, PUT |
| Tasks | 7 | GET, POST, PUT, DELETE |
| Documents | 10 | GET, POST, PUT, DELETE |
| Notifications | 5 | GET, PUT, DELETE |
| Reports | 7 | GET |
| Dashboard | 6 | GET |
| Admin | 5 | GET, POST, PUT, PATCH |
| Products | 5 | GET, POST, PUT, DELETE |
| Compliance | 6 | GET, POST, PUT, DELETE |
| Integrations | 10 | GET, POST, PUT, DELETE |
| Bulk Operations | 3 | GET, POST |
| Activity | 4 | GET (+ SSE stream) |
| **Total** | **~153** | |

### Rate Limits
- **Global**: 5,000 requests per 15 minutes per IP
- **Auth endpoints**: Stricter limits on `/auth/login` and `/auth/refresh`
- **Per-user**: Rate limiting after authentication resolves

---

## 9. RBAC & Role Permissions Matrix

### Module Access Matrix

| Module / Action | Admin | Operations | Underwriter | Claims | Viewer |
|----------------|:-----:|:----------:|:-----------:|:------:|:------:|
| **Dashboard** | R | R | R | R | R |
| **Policies — View** | R | R | R | R | R |
| **Policies — Create/Edit** | W | W | — | — | — |
| **Policies — Quote** | W | W | W | — | — |
| **Policies — Issue/Bind** | W | W | — | — | — |
| **Policies — Endorse/Renew** | W | W | — | — | — |
| **Customers — View** | R | R | R | R | R |
| **Customers — Create/Edit** | W | W | — | — | — |
| **Claims — View** | R | R | R | R | R |
| **Claims — Create/Process** | W | — | — | W | — |
| **Claims — FNOL Submit** | W | W | — | W | — |
| **Claims — Reserve/Settle** | W | — | — | W | — |
| **Underwriting — View** | R | R | R | R | R |
| **Underwriting — Evaluate** | W | — | W | — | — |
| **Underwriting — Override** | W | — | W | — | — |
| **UW Rules — Configure** | W | — | — | — | — |
| **UW Referrals — Resolve** | W | — | W | — | — |
| **Billing — View** | R | R | — | — | R |
| **Billing — Create/Edit** | W | W | — | — | — |
| **Tasks — View/Update** | W | W | W | W | — |
| **Documents — View** | R | R | R | R | R |
| **Documents — Upload/Generate** | W | W | W | W | — |
| **Reports** | R | R | R | R | R |
| **Notifications** | R | R | R | R | R |
| **Admin — User Mgmt** | W | — | — | — | — |
| **Admin — Products** | W | — | — | — | — |
| **Admin — Compliance** | W | — | — | — | — |
| **Admin — API Keys** | W | — | — | — | — |
| **Admin — Webhooks** | W | — | — | — | — |
| **Admin — Bulk Ops** | W | W | — | — | — |
| **Admin — Audit Logs** | R | R | — | — | — |

*R = Read, W = Read + Write, — = No Access*

---

## 10. Data Model Reference

### Entity Relationship Overview

```
Customer (1) ─────── (N) Policy
                          │
               ┌──────────┼──────────┬───────────┐
               │          │          │           │
         Endorsement  Renewal   UW Record    Billing Account
                                    │              │
                              Referral        ┌────┼────┐
                                           Invoice Payment Ledger

Policy (1) ─────── (N) Claim
                          │
               ┌──────────┼──────────┬───────────┐
               │          │          │           │
             FNOL     Reserve    Fraud       Mitigation
                               Assessment

User (1) ─────── (N) Task
                  ─── (N) Notification
                  ─── (N) Activity

Policy/Claim ──── (N) Document
```

### Key Data Files (27 JSON stores)

| Data File | Records | Description |
|-----------|---------|-------------|
| users.json | 10 | System users across 5 roles |
| customers.json | 10+ | Customer profiles |
| policies.json | 10+ | Insurance policies |
| products.json | 3 | Product definitions |
| claims.json | 10+ | Claim records |
| fnol.json | 6 | First Notice of Loss |
| underwriting.json | 10+ | UW evaluations |
| uwRules.json | 10+ | Configurable rules |
| referrals.json | varies | Referral queue |
| uwAuthority.json | varies | Authority limits |
| billing-accounts.json | varies | Billing accounts |
| invoices.json | varies | Invoice records |
| payments.json | varies | Payment history |
| ledger.json | varies | Double-entry ledger |
| endorsements.json | varies | Policy endorsements |
| renewals.json | varies | Renewal records |
| tasks.json | 12 | Task assignments |
| documents.json | varies | Document metadata |
| notifications.json | varies | User notifications |
| reserves.json | varies | Claim reserves |
| mitigations.json | varies | Loss mitigations |
| compliance.json | varies | Regulatory items |
| audit-logs.json | varies | Audit trail |
| templates.json | 6 | Document templates |
| apiKeys.json | varies | API credentials |
| webhooks.json | varies | Webhook registrations |
| config.json | 1 | System configuration |

---

## 11. Testing Guide

### Quick API Verification

```bash
# 1. Login and get token
TOKEN=$(curl -s http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pas.com","password":"Password@123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['tokens']['accessToken'])")

# 2. Test Policies
curl -s http://localhost:4000/api/v1/policies \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# 3. Test Claims
curl -s http://localhost:4000/api/v1/claims \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# 4. Test Dashboard
curl -s http://localhost:4000/api/v1/dashboard/summary \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# 5. Test Tasks
curl -s http://localhost:4000/api/v1/tasks \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# 6. Test FNOL
curl -s http://localhost:4000/api/v1/claims/fnol \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# 7. Test Billing
curl -s http://localhost:4000/api/v1/billing/accounts \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# 8. Test Notifications
curl -s http://localhost:4000/api/v1/notifications \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

### Frontend Smoke Test Checklist

- [ ] Login with each role (admin, ops, uw, claims, viewer)
- [ ] Dashboard loads with KPIs and charts
- [ ] Policy list → Detail → Tabs work
- [ ] Customer list → Detail → Linked policies
- [ ] Claims list → Detail → Reserve/Fraud tabs
- [ ] FNOL submission form → Process to Claim
- [ ] Underwriting list → Referrals page
- [ ] Billing list → Detail → Ledger view
- [ ] Tasks list with filter/sort
- [ ] Documents list
- [ ] Renewals queue
- [ ] Notification bell → Dropdown → Mark as read
- [ ] Reports with date filtering
- [ ] Admin → Users → Create/Deactivate
- [ ] Sidebar navigation (all links accessible per role)
- [ ] Dark mode toggle
- [ ] Responsive layout (sidebar collapse)

### Build Verification

```bash
# Frontend build (should be 0 errors)
cd frontend && npx next build

# Backend type check (should be 0 errors)
cd backend && npx tsc --noEmit
```

---

## 12. Glossary

| Term | Definition |
|------|-----------|
| **PAS** | Policy Administration System — Core platform for managing insurance operations |
| **FNOL** | First Notice of Loss — Initial report of a potential insurance claim |
| **RBAC** | Role-Based Access Control — Authorization model based on user roles |
| **JWT** | JSON Web Token — Stateless authentication token format |
| **SLA** | Service Level Agreement — Target time for completing a task |
| **LTV** | Loan-to-Value Ratio — Loan amount divided by property value |
| **MI** | Mortgage Insurance — Insurance protecting lenders against borrower default |
| **IBNR** | Incurred But Not Reported — Reserve estimate for unreported claims |
| **KPI** | Key Performance Indicator — Measurable business metric |
| **EMI** | Equated Monthly Installment — Fixed monthly payment amount |
| **Endorsement** | Mid-term modification to an active insurance policy |
| **Reserve** | Funds set aside to pay expected claim obligations |
| **Adjudication** | Formal process of reviewing and deciding a claim |
| **Loss Ratio** | Incurred losses divided by earned premiums |
| **Combined Ratio** | Loss ratio + expense ratio (below 100% = profitable) |
| **Underwriting** | Process of evaluating risk to determine insurability and pricing |
| **Referral** | Underwriting case escalated to a senior underwriter for review |
| **Delegated Authority** | Pre-approved limits for an underwriter to make autonomous decisions |
| **Premium** | Amount charged for insurance coverage |
| **Coverage** | Maximum amount payable under an insurance policy |
| **Delinquent** | Account with payments past due beyond grace period |
| **Grace Period** | Time allowed after payment due date before penalties apply |
| **Reinstatement** | Restoring a lapsed or cancelled policy to active status |
| **Webhook** | HTTP callback triggered by system events for integration |
| **SSE** | Server-Sent Events — One-way real-time data stream from server to client |

---

> **IMGC PAS v1.0** — *Defining Tomorrow*
> Built with enterprise-grade security, comprehensive insurance workflows, and production-ready architecture.
