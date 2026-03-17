# Project Ledger Web — Memory

## Stack
- **Framework**: Next.js 15 (App Router), TypeScript, React 18
- **UI**: Tailwind CSS v4, shadcn/ui, Lucide + Tabler icons
- **Forms**: react-hook-form + Zod
- **Lint**: Tailwind IntelliSense warns on `flex-shrink-0` (use `shrink-0`) and `bg-gradient-to-r` (use `bg-linear-to-r`)

## Architecture Pattern (consistent across all features)
```
app/(dashboard)/[feature]/page.tsx        → thin Next.js entry
views/[feature]/[feature]-view.tsx        → "use client" wrapper
components/[feature]/[feature]-panel.tsx  → CRUD orchestrator
hooks/[feature]/use-[feature].ts          → state + fetch + mutations
services/[feature]-service.ts             → raw API via api.get/post/patch/delete
types/[feature].ts                        → TypeScript interfaces
lib/validations/[feature].ts              → Zod schemas
hooks/forms/use-[feature]-form.ts         → react-hook-form form hooks
```

## Navigation Structure (as of Phase 2)
- Sidebar: Dashboard, Workspaces, Partners, Métodos de pago, Reportes
- **No direct "Proyectos" link** — projects accessed through Workspaces
- `/workspaces` → list; `/workspaces/[id]` → ProjectsShelf scoped to workspace
- `/partners` → list; `/partners/[id]` → partner detail (info + payment methods + related projects)

## Key API Endpoints (Phase 2)
- `GET /workspaces` + CRUD → workspace-service.ts
- `GET /partners` + CRUD → partner-service.ts
- `GET /projects/{id}/partners` + POST/DELETE → project-partner-service.ts
- `GET /projects/{id}/available-payment-methods` → groups payment methods by partner
- `partner_id` now optional field on `POST/PATCH /payment-methods`
- `workspace_id` now optional on `POST /projects`

## Key Types
- `ProjectResponse.workspace_id` (uuid|null), `partners_enabled` (bool)
- `PaymentMethodResponse.partner_id` (uuid|null)
- `WorkspaceDetailResponse` = `Omit<WorkspaceResponse, "projectCount"> + projects + members`
- `PartnerDetailResponse` = `PartnerResponse + paymentMethods[]`
- `ProjectPartnerResponse`: `{ id, partnerId, partnerName, partnerEmail, addedAt }`

## Shared Components
- `ItemActionMenu`: accepts `onOpen?`, `onEdit`, `onDelete`, `onShare?`, `stopPropagation?`
  - `stopPropagation` only applies to the TRIGGER button click (prevents card navigation on menu open)
  - All `onSelect` handlers use `runAfterMenuClose` (rAF) — NO blur() call (caused Radix focus-outside events navigating the card)
- `DeleteEntityModal`: generic, item: T|null, onConfirm: (item: T) => void
- `FormModal`: wraps Dialog + Form + submit button
- `Pagination`: page, pageSize, total, onPageChange
- `EmptyState`, `ShelfSkeleton`, `ListSkeleton` in project-states.tsx

## useProjects Hook
- `useProjects({ workspaceId?: string; projectIds?: string[] })` — client-side filter + sort + paginate
- When `projectIds` is provided: filters by ID set (robust, works even if API doesn't return `workspace_id`)
- When only `workspaceId` is provided: filters by `project.workspace_id === workspaceId`
- `mutateCreate` auto-merges `workspace_id: workspaceId` when workspaceId is set
- `workspace-detail-view.tsx` passes `workspace.projects.map(p => p.id)` as `projectIds` to `ProjectsShelf`

## usePartnerDetail Hook
- Fetches partner detail (`GET /partners/{id}`)
- Fetches related projects via N+1: all projects → filter partners_enabled → getProjectPartners each
- Located at `hooks/partners/use-partner-detail.ts`

## Payment Method Forms
- Both create + edit modals load partner options (`getPartners({ take: 200 })`)
- `partnerOptions` and `loadingPartners` returned from `useCreatePaymentMethodForm` / `useUpdatePaymentMethodForm`
- Select value `"__none__"` treated as "no partner" (maps to empty string)

## User Preferences
- Responses in Spanish (UI is in Spanish)
- No auto-commits
