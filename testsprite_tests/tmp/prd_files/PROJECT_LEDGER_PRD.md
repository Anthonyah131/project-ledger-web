# Project Ledger Web — Product Specification Document

## 1. Product Overview

**Project Ledger** is a web-based financial project management platform that enables individuals and teams to track income and expenses across multiple projects, manage partner settlements, monitor budgets, and generate financial reports — all in a multi-currency environment.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui
**Backend:** .NET REST API (separate repository)
**Primary Users:** Freelancers, small teams, project managers, accountants managing project-based finances

---

## 2. Core Problem

Managing finances across multiple projects is fragmented and error-prone when done in spreadsheets or disconnected tools. Teams that work with multiple currencies, share expenses among partners, and need to track obligations vs actuals need a dedicated platform with a structured, auditable ledger.

---

## 3. User Roles

| Role | Capabilities |
|------|-------------|
| **Owner** | Full access: CRUD on all resources, manage members, delete project |
| **Editor** | Create and edit transactions, categories, obligations; cannot manage members or delete project |
| **Viewer** | Read-only access to all project data |
| **Admin** | System-level: manage all users and workspaces |

---

## 4. Features

### 4.1 Authentication & Account Management

- Email/password registration and login
- OAuth callback support
- Password recovery via email
- JWT-based sessions (24h access token, 7d refresh token)
- Account deactivation

### 4.2 Dashboard (Monthly Overview)

**Purpose:** Give users a real-time snapshot of their financial month across all projects.

**Features:**
- Monthly summary cards: Total Income, Total Expenses, Net Balance, Month-over-Month comparison
- Month navigation (previous/next month)
- Daily trend chart (income vs expenses over the month)
- Top categories breakdown chart
- Payment method distribution chart
- Alert system: highlights months with anomalies (budget exceeded, missing data, etc.) with drill-down navigation
- Project selector: scope dashboard to one project or view all
- Inactive user warning banner

### 4.3 Project Management

**Purpose:** Organize financial data in named projects (e.g., a client engagement, a construction job, a business unit).

**Features:**
- Create, edit, delete projects
- Project fields: name, description, base currency
- Alternative currencies per project (multi-currency accounting)
- Assign projects to workspaces
- Role-based access: invite team members with Owner/Editor/Viewer roles
- Member management: invite by email, change role, remove member
- Project settings tab: general info, currency configuration, partner assignments

### 4.4 Expenses

**Purpose:** Track all money going out of a project with full attribution.

**Fields:**
- Title, amount, original currency
- Expense date (past dates only)
- Category (project-scoped)
- Payment method
- Exchange rate → converted amount
- Receipt number, description, notes
- Active/Inactive status
- Split allocation among partners (percentage or fixed)
- Optional obligation link

**Features:**
- Create, edit, delete, deactivate/reactivate
- Advanced filters: status, category, date range, search
- Sort by date, amount, or category
- Pagination with configurable page size
- Bulk import via paste or CSV upload with inline row editor
- AI-assisted entry via document/receipt extraction
- Multi-currency exchange section (track multiple conversions per transaction)
- Transaction detail drawer (read view)

### 4.5 Incomes

**Purpose:** Track all money coming into a project.

**Fields:** Same structure as Expenses (title, amount, currency, date, category, payment method, exchange rate, receipt number, etc.)

**Features:** Same set as Expenses including splits, bulk import, document extraction, and multi-currency support. Additional field: `accountAmount` (amount credited to account after deductions).

### 4.6 Categories

**Purpose:** Classify transactions for reporting and budgeting.

**Fields:** Name, description, optional budget amount

**Features:**
- Create, edit, delete (project-scoped)
- Budget amount per category for tracking spend vs planned
- Used in filtering and report grouping

### 4.7 Budget

**Purpose:** Plan and monitor project financials against targets.

**Features:**
- Define budget amounts per category
- View budget vs actual spend per category
- Visual indicators when categories exceed budget
- Project-level budget summary

### 4.8 Obligations

**Purpose:** Track financial commitments (invoices to pay, recurring costs, contracts).

**Fields:** Title, total amount, currency, due date (optional), description

**Features:**
- Create, edit, delete obligations
- Link expenses to obligations for reconciliation
- Due date tracking

### 4.9 Partners

**Purpose:** Track stakeholders, clients, suppliers, or collaborators involved in projects.

**Fields:** Name, email (optional), phone, notes

**Features:**
- Global partner directory (across all projects)
- Assign partners to specific projects
- Track partner balance across all associated expenses/incomes
- Partner detail page: list of associated projects and balance per project

### 4.10 Partner Settlements

**Purpose:** Reconcile financial balances between partners.

**Fields:** From partner, To partner, amount, currency, exchange rate, settlement date, description, notes

**Features:**
- Create, edit, delete settlements (project-scoped)
- Multi-currency support with exchange rates
- Settlement suggestions modal (AI-generated recommendations based on balances)
- Track net balance per partner after settlements

### 4.11 Payment Methods

**Purpose:** Track accounts/wallets/cards used for transactions.

**Fields:** Name, type (bank/cash/card), currency, bank name, account number, description

**Features:**
- Global list (user-scoped, shared across projects)
- Payment method detail page: shows all transactions using that method, with summary totals
- Used in expense/income filtering and reporting

### 4.12 Workspaces

**Purpose:** Group related projects under a named workspace (e.g., a client, a business entity, a year).

**Fields:** Name, description, color, icon

**Features:**
- Create, edit, delete workspaces
- Visual customization (color + icon)
- Workspace detail: list of projects in workspace
- Workspace-level financial report

### 4.13 Reports

**Purpose:** Cross-project and cross-partner financial analysis.

**Report Types (6 tabs):**

| Tab | Description |
|-----|-------------|
| **Expenses Report** | Expense totals by category, date range, project filter |
| **Incomes Report** | Income totals by category, date range, project filter |
| **Payment Methods Report** | Transaction volume per payment method |
| **Partner Balances** | Net balance per partner across selected projects |
| **Partner General** | Full transaction history per partner |
| **Workspace Report** | Aggregated financials per workspace |

**Common Filters:** Date range, project, partner, payment method
**Metrics:** Totals, comparisons, trend lines
**Export:** (planned/implied)

### 4.14 Bulk Import

**Purpose:** Allow users to import many transactions at once.

**Flow:**
1. Paste tabular data or upload CSV
2. Review row-by-row in an inline editor
3. Map columns to transaction fields
4. Validate and submit

**Features:**
- Editable rows before submission
- Field validation with inline error messages
- Supports both expenses and incomes

### 4.15 Document Extraction (AI-Assisted Entry)

**Purpose:** Speed up data entry by extracting transaction fields from uploaded receipts or documents.

**Flow:**
1. Upload a document/receipt image
2. AI extracts: title, amount, date, currency, etc.
3. User reviews/edits pre-filled form
4. Submit

### 4.16 Settings

| Section | Content |
|---------|---------|
| **Profile** | Full name, email, avatar |
| **Security** | Change password |
| **Appearance** | Theme selection (Light/Dark/Cosmic + others) |
| **Billing** | Subscription plan, usage, upgrade/downgrade |

### 4.17 Billing & Subscription

- Subscription plans with feature limits (e.g., project count, member seats)
- Stripe integration for payments
- Plan upgrade/downgrade flow
- Plan limit errors (403) trigger upgrade prompts (not generic errors)
- Admin-level user management for subscription enforcement

### 4.18 Admin Panel

- List all users (search, filter by active/inactive)
- Edit user details and status
- Pagination and sorting

---

## 5. Non-Functional Requirements

### 5.1 Internationalization (i18n)

- Full UI available in **Spanish (es)** and **English (en)**
- Custom i18n engine (`createT`, `useLanguage`) — no external i18n library
- Language files per feature domain in `src/lib/i18n/locales/`
- User can switch language from settings

### 5.2 Multi-Currency

- Every transaction records original currency + amount
- Exchange rates stored with 6 decimal precision
- Converted amounts calculated and stored
- Project can define a base currency and one or more alternative currencies
- Currency conversion UI built into transaction forms

### 5.3 Date Handling

- Date-only values (`YYYY-MM-DD`) parsed as local midnight to avoid UTC shift bugs
- All dates displayed via `formatDate()` utility
- Expense/income/settlement dates restricted to past dates

### 5.4 Performance

- Loading skeletons on async data
- GET request deduplication in API client
- Pagination for all list views
- Token refresh with concurrency lock (no duplicate refresh calls)

### 5.5 Error Handling

- API errors surfaced via Sonner toast notifications
- `toastApiError` utility handles standard vs plan-limit (403) errors
- Plan-limit errors trigger upgrade prompt modals
- Form errors displayed inline next to fields

### 5.6 Security

- JWT Bearer tokens on all API requests
- Auto token refresh on 401
- Route protection: `(dashboard)` routes require authentication
- Role-based UI rendering (actions hidden/disabled based on role)
- Input validation via Zod schemas on all forms

### 5.7 Theming

- Supports: Light, Dark, Cosmic (glassmorphism + nebula effects), and additional themes
- CSS variable-based theming with Tailwind
- Theme persisted in user settings

---

## 6. Page Map

```
/ (Landing)
/login
/register
/forgot-password
/dashboard
/projects
/projects/[id]
  ├── Expenses tab
  ├── Incomes tab
  ├── Categories tab
  ├── Budget tab
  ├── Obligations tab
  ├── Partners tab
  ├── Settlements tab
  └── Settings tab
/projects/[id]/members
/partners
/partners/[id]
/payment-methods
/payment-methods/[id]
/workspaces
/workspaces/[id]
/reports
/billing
/settings
  ├── Profile
  ├── Security
  ├── Appearance
  └── Billing
/admin/users
/help
```

---

## 7. Data Model Summary

| Entity | Key Fields |
|--------|-----------|
| User | id, fullName, email, active, role |
| Project | id, name, description, currencyCode, workspaceId |
| Expense | id, title, amount, currency, exchangeRate, date, categoryId, paymentMethodId, active |
| Income | id, title, amount, currency, exchangeRate, accountAmount, date, categoryId, paymentMethodId, active |
| Category | id, name, description, budgetAmount, projectId |
| Obligation | id, title, totalAmount, currency, dueDate, projectId |
| Partner | id, name, email, phone, notes |
| PartnerSettlement | id, fromPartnerId, toPartnerId, amount, currency, exchangeRate, date, projectId |
| PaymentMethod | id, name, type, currency, bankName, accountNumber |
| Workspace | id, name, description, color, icon |
| ProjectMember | projectId, userId, role |

---

## 8. Integration Points

| System | Purpose |
|--------|---------|
| .NET REST API | All data persistence and business logic |
| Stripe | Subscription billing and payment processing |
| n8n Chat Widget | In-app help and support chat |
| AI Document Extraction | Receipt/document OCR for pre-filling transaction forms |
| AI Settlement Suggestions | Recommends settlements based on partner balances |
