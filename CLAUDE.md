# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

**Project Ledger Web** is a financial project management dashboard built with Next.js 16 (App Router), React 19, TypeScript. It is frontend-only — the backend is a .NET REST API at `NEXT_PUBLIC_API_URL` (default: `http://localhost:5192/api`).

### Layered Architecture

Data flows top-down:

```
Page (src/app/(dashboard)/...)
  → View (src/views/*-view.tsx)
    → Orchestration Hook (src/hooks/.../use-*-view.ts)
      → Domain Hooks (src/hooks/.../use-*.ts)
        → Services (src/services/*-service.ts)
          → API Client (src/lib/api-client.ts)
```

**Services** — pure functions wrapping REST calls. No state. One file per domain.

**Domain Hooks** — manage fetch + CRUD state for one sub-resource. Return `{ data, loading, mutateCreate, mutateUpdate, mutateDelete, refetch, ... }`. Orchestration hooks (e.g. `use-project-detail-view`) compose multiple domain hooks and coordinate cross-resource refreshes (e.g. creating an expense triggers a refetch of obligations and budget).

**Views** — page-level components that consume one orchestration hook and compose domain components.

**Components** — presentational. Receive data and handlers as props. Modals are controlled (open state lives in the hook).

### API Client (`src/lib/api-client.ts`)

- Injects `Authorization: Bearer` on every request
- Auto-refreshes token on 401 with a concurrency lock
- `ApiClientError` has `.isPlanError` and `.isBusinessError` getters
- GET request deduplication built in
- `NEXT_PUBLIC_ENV=development` enables request/response logging

### Auth

`src/context/AuthContext.tsx` — global user + tokens. Tokens stored in localStorage (24h access, 7d refresh). Login/register/logout exposed via context.

### Forms

1. Zod schema in `src/lib/validations/{domain}.ts`
2. Form hook in `src/hooks/forms/use-{entity}-form.ts` (wraps React Hook Form + zodResolver)
3. Modal component uses hook's `form`, `onSubmit`, `handleClose`

### Key Conventions

- Path alias: `@/*` → `src/*`
- Route groups: `(auth)` for public routes, `(dashboard)` for protected routes with sidebar layout
- All project-scoped resources nest under `/projects/{id}` in the API
- Use `toast` (Sonner) for user feedback; use `toastApiError` utility for API errors
- Plan-limit errors (403) should trigger upgrade prompts, not generic error toasts

### Environment Variables

```
NEXT_PUBLIC_API_URL   # Backend base URL (default: http://localhost:5192/api)
NEXT_PUBLIC_ENV       # "development" | "production" — enables debug logging in dev
```
