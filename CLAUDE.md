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

### Internacionalización (i18n)

El sistema de i18n usa un motor propio (`createT`, `useLanguage`) con archivos JSON por feature. **No usar librerías externas** (next-i18next, react-i18next, etc.).

#### Estructura de archivos

```
src/lib/i18n/
├── index.ts              ← motor + merge de todos los JSON
├── types.ts              ← tipo Translations derivado de los JSON de ES
└── locales/
    ├── es/               ← fuente de verdad
    │   ├── shared.json   ← common + nav
    │   ├── auth.json
    │   ├── project-detail.json  ← expenses, incomes, categories, obligations, budget, partnerSettlements
    │   ├── projects.json        ← projects + members
    │   └── ...
    └── en/               ← misma estructura, strings en inglés
```

#### Cómo usar

```tsx
const { t } = useLanguage()
t("expenses.delete.title")
t("expenses.delete.confirm", { name: expense.title })  // interpolación con {variable}
```

#### Convención de keys (Phase 2)

Las keys siguen el patrón `<namespace>.<grupo>.<variante>`:

| Grupo | Uso | Ejemplo |
|---|---|---|
| `delete.title` | Título del modal de eliminación | `t("expenses.delete.title")` |
| `delete.description` | Advertencia genérica | `t("expenses.delete.description")` |
| `delete.confirm` | Texto con `{name}` | `t("expenses.delete.confirm", { name })` |
| `remove.title` | Para miembros/partners | `t("members.remove.title")` |
| `create.title` | Título de modal de creación | `t("projects.create.title")` |
| `edit.title` | Título de modal de edición | `t("partners.edit.title")` |
| `empty.title` | Estado vacío | `t("projects.empty.title")` |
| `fields.<name>.label` | Label de campo | `t("auth.fields.email.label")` |
| `fields.<name>.placeholder` | Placeholder | `t("auth.fields.email.placeholder")` |
| `fields.<name>.hint` | Texto de ayuda | `t("auth.fields.password.hint")` |

**Reglas:**
- Usar `common.*` para strings reutilizables (`common.save`, `common.cancel`, `common.loading`, etc.)
- Nunca duplicar strings que ya existen en `common`
- Nuevos namespaces van en su propio archivo JSON (es + en)
- Las keys de los JSON en `en/` deben cubrir todas las keys del archivo equivalente en `es/`
- Las views usan keys normalizadas (grupos semánticos). Los componentes aún pueden usar keys legacy hasta que se migren

#### Agregar un string nuevo

1. Agregarlo en `es/<archivo>.json` siguiendo la convención de grupos
2. Agregarlo en `en/<archivo>.json` con la traducción en inglés
3. Usar `t("namespace.grupo.variante")` en el código

### Dates

- **Never use `new Date(dateString)` directly** for display. Always use `formatDate()` from `src/lib/date-utils.ts`.
- Date-only strings (`YYYY-MM-DD`) from the API are treated as calendar dates with no timezone. `formatDate` auto-detects them and parses as local midnight to avoid UTC off-by-one-day shifts.
- Full timestamps (`createdAt`, `updatedAt`, etc.) are parsed normally with `new Date()`.
- The `fixTimezone` option on `formatDate` is deprecated — the behavior is now automatic.

### Environment Variables

```
NEXT_PUBLIC_API_URL   # Backend base URL (default: http://localhost:5192/api)
NEXT_PUBLIC_ENV       # "development" | "production" — enables debug logging in dev
```
