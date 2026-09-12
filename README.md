# 🍛 MessMitra (मेस मित्र) — Smart Mess & Tiffin Accounting SaaS

> **Automated Accounting & Billing SaaS for Mess & Tiffin Center Owners in India**
> Built with Next.js 14 (PWA), NestJS 10 REST API, Supabase Postgres with Row Level Security (RLS), and Turborepo.

---

## 🔐 Role-Based Access Control (RBAC) & Demo Logins

MessMitra enforces strict role-based access control with ID/Password authentication:

| Role | Demo ID / Email | Password | Access & Permissions |
| :--- | :--- | :--- | :--- |
| 👑 **मेस चालक (Owner / Admin)** | `owner@balajimess.com` | `password123` | **Full Admin & Financial Access**: Mess settings, member CRUD, leave approvals, 56-meal billing generator, payment receipts, expense tracker, P&L analytics, CSV exports, Cloud DB sync. |
| 👤 **मेस सभासद (Member)** | `rahul@messmitra.com` | `password123` | **Member Portal Only**: Personal dues breakdown, 1-tap UPI QR pay, submit timely/late leaves with live cutoff warnings, view leave history. *Zero access to mess expenses or other members.* |
| 👨‍🍳 **आचारी महाराज (Head Cook)** | `cook@balajimess.com` | `password123` | **Kitchen Live Display Only**: Live Lunch/Dinner headcounts, Today & Tomorrow forecast, ingredients calculator (Rice/Dal/Chapati in kg), absent members list. *Zero access to financial billing or P&L.* |

---

## 🌟 Key Product Differentiators & Features

- 🚫 **No Daily Check-In / QR Scanning**: Members are billed by default. They only act when they will **NOT** be eating (Leave Request).
- 🏖️ **Dispute-Proof Leave Requests**:
  - Submissions before the mess's daily cutoff time (e.g. `09:00 AM`) are **`auto_valid`** immediately.
  - Submissions after cutoff are marked **`pending_approval`** and appear in the Owner's Approval Queue.
  - Every submission is timestamped with an immutable audit record for dispute resolution.
- 🍳 **Tomorrow's Forward-Looking Cooking Forecast**:
  - Automatically computes: *Total Active Members*, *On Approved Leave*, and net *Cook For Count (Heads)* for Maharaj (Cook) for Lunch & Dinner.
  - Interactive date chips: **"आज (Today)"**, **"उद्या (Tomorrow)"**, or custom date picker.
- 💰 **56-Meal Monthly Billing Engine**:
  - Formula: $\text{Amount Due} = \text{Base Monthly Rate} - (\text{Approved Leave Days} \times \text{Per Meal Rate})$.
  - Mid-cycle join pro-rations calculated automatically.
  - 1-Click WhatsApp click-to-chat reminder (`wa.me`) with prefilled bill breakdown and dynamic UPI deep-links.
  - Printable/Downloadable Official Invoice Slips with dynamic UPI QR code.
  - Immutable payment logs and adjustment entries with mandatory notes.
- 📉 **Expenses & Staff Tagging**:
  - Recurring scheduled monthly expenses (Salaries, Rent, Gas) with creation modal and 1-click confirmation.
  - Daily one-off market expenses (Vegetables, Groceries, Dairy) with audit logs.
  - Lightweight staff list to tag salary expenses to names.
- 📊 **First-Class P&L Dashboard**:
  - Real-time Net Profit ($\text{Income} - \text{Expenses} = \text{Profit}$).
  - Comparative visual trend charts & category expense distribution rings.
  - 1-Click CSV exports for both Billing and Expenses.
- 🌐 **Tri-Lingual Localization**:
  - Full translations for **मराठी (Marathi)**, **हिंदी (Hindi)**, and **English** across all screens.
- 📱 **Installable Progressive Web App (PWA)**:
  - Installable directly onto Android home screens and Desktop.
  - Offline local caching and instant 1-click Supabase cloud database sync.

---

## 🏗️ Monorepo Architecture

```
balaji-mess/
├── apps/
│   ├── web/                     # Next.js 14 App Router + TailwindCSS + PWA + i18n + RBAC Auth
│   └── api/                     # NestJS 10 REST API + Swagger + AuthModule + Supabase Admin
├── packages/
│   └── types/                   # Shared TypeScript models, enums, calculation utilities, auth types
└── supabase/
    ├── migrations/              # PostgreSQL DDL with strict multi-tenant RLS policies
    └── seed.sql                 # Demo data (Balaji Executive Mess, Pune)
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run All Tests
```bash
# Domain math tests
pnpm --filter @messmitra/types build
node packages/types/dist/test-runner.js

# Full REST API E2E test suite (including Auth & RBAC)
node test-e2e-all-modules.js
```

### 3. Start Development Servers
```bash
# Start both Web (port 3000) and API (port 4000)
pnpm dev
```

- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:4000/api`
- **Swagger Docs**: `http://localhost:4000/api/docs`

---

## 📦 GitHub Version Management (Push / Pull & Release Tags)

To maintain versions and push to your GitHub repository:

### 1. Link Remote GitHub Repository
```bash
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
git branch -M main
```

### 2. Push Commits & Release Tags to GitHub
```bash
# Push all code and semantic tags to main branch
git push -u origin main --tags
```

### 3. Pull Updates from GitHub
```bash
# Pull latest changes from collaborators
git pull origin main
```

### Release Version History
- `v1.0.0`: Core MessMitra Multi-Tenant Accounting SaaS (56-Meal billing, dispute audit logs, PWA, Supabase RLS).
- `v1.1.0`: Role-Based Access Control (RBAC) with ID/Password Authentication, Cook/Maharaj Kitchen Live Display, and date forecast picker.

---

## 🗄️ Supabase Free Cloud Database Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in Supabase and run the migration script in `supabase/migrations/20260911000000_init_schema.sql`.
3. Optionally load seed data from `supabase/seed.sql`.
4. Add your `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `apps/api/.env` or connect directly from the **Cloud DB** button in the top navbar!

---

## 📜 License
MIT License • Built for Mess & Tiffin Center Owners in India 🇮🇳
