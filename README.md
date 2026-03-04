# IMGC PAS — Policy Administration System

Enterprise-grade Policy Administration System for mortgage guarantee and credit protection operations.

**Live Demo:** [https://aksatyam.github.io/PAS_POC/](https://aksatyam.github.io/PAS_POC/)

---

## Features

- **14+ Modules** — Dashboard, Policies, Renewals, Customers, Underwriting, Claims, FNOL, Billing, Tasks, Documents, Reports, Admin, Compliance, Docs
- **150+ API Endpoints** — Full REST API with Swagger documentation
- **5 RBAC Roles** — Admin, Operations, Underwriter, Claims, Viewer
- **Full Insurance Lifecycle** — Quote → Bind → Issue → Endorse → Renew → Cancel → Reinstate
- **Claims Processing** — FNOL intake, reserves, fraud scoring, loss mitigation
- **Automated Underwriting** — Rule engine, referral workflows, delegated authority
- **Billing & Payments** — Invoicing, installment plans, ledger, aging reports
- **Executive KPIs** — Loss ratio, combined ratio, retention rate, real-time dashboards

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS, Recharts, Zustand, TanStack Query |
| **Backend** | Express.js, TypeScript, JWT Auth, Zod Validation, Swagger, Winston |
| **Deployment** | GitHub Pages (static demo), Docker (full-stack) |

---

## Live Demo (GitHub Pages)

The frontend is deployed as a static demo at **[https://aksatyam.github.io/PAS_POC/](https://aksatyam.github.io/PAS_POC/)** with mock data — no backend required.

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@imgc.com | demo123 |
| Underwriter | underwriter@imgc.com | demo123 |
| Claims | claims@imgc.com | demo123 |
| Operations | ops@imgc.com | demo123 |
| Viewer | viewer@imgc.com | demo123 |

> Each role provides a different dashboard view optimized for that function.

---

## Local Development (Full-Stack)

### Prerequisites

- Node.js 18+ and npm 9+
- Modern browser (Chrome, Firefox, Edge)

### Quick Start

```bash
# Backend (Terminal 1)
cd backend && npm install && npm run dev

# Frontend (Terminal 2)
cd frontend && npm install && npm run dev
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000/api/v1
- **Swagger Docs:** http://localhost:4000/api-docs

### Local Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pas.com | Password@123 |
| Operations | ops1@pas.com | Password@123 |
| Underwriter | uw1@pas.com | Password@123 |
| Claims | claims1@pas.com | Password@123 |
| Viewer | viewer1@pas.com | Password@123 |

### Docker

```bash
docker-compose up --build
```

---

## Deployment

The frontend auto-deploys to GitHub Pages on every push to `main` via GitHub Actions.

- **Workflow:** `.github/workflows/deploy.yml`
- **Build:** Static export with `NEXT_PUBLIC_DEMO_MODE=true` for mock data
- **SPA Routing:** 404.html fallback for client-side navigation

---

## Documentation

- **[APPLICATION_GUIDE.md](./APPLICATION_GUIDE.md)** — Complete enterprise application guide (modules, API reference, RBAC, data models, business flows)
- **[GAP_ANALYSIS_REPORT.md](./GAP_ANALYSIS_REPORT.md)** — Full-stack audit report with findings and fixes
- **[UX_PRODUCTION_GRADE_PROMPT.md](./UX_PRODUCTION_GRADE_PROMPT.md)** — Production UX enhancement specifications

---

## Project Structure

```
pas-prototype/
├── backend/               # Express.js API server
│   ├── src/
│   │   ├── controllers/   # Route handlers (18 controllers)
│   │   ├── services/      # Business logic (19 services)
│   │   ├── middleware/     # Auth, RBAC, rate limiting
│   │   └── routes/        # API route definitions
│   └── mock-data/         # JSON file persistence (27 files)
├── frontend/              # Next.js 14 application
│   ├── app/
│   │   ├── (auth)/        # Public routes (login)
│   │   └── (main)/        # Protected routes (14+ modules)
│   ├── components/        # Reusable UI components (39+)
│   ├── lib/               # API client, auth, utilities, mock data
│   └── types/             # TypeScript type definitions
├── .github/workflows/     # GitHub Actions CI/CD
├── docker-compose.yml     # Docker orchestration
└── docs/                  # Additional documentation
```

---

**Organization:** India Mortgage Guarantee Corporation (IMGC)
**License:** Proprietary
