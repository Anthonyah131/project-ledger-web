# Project Ledger Web

Dashboard de gestión financiera de proyectos construido con **Next.js 16** (App Router), **React 19** y **TypeScript**.

El backend es una API REST .NET en `NEXT_PUBLIC_API_URL` (default: `http://localhost:5192/api`).

## Getting Started

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Configuración

| Variable | Default | Descripción |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5192/api` | URL base del backend |
| `NEXT_PUBLIC_ENV` | `development` | Activa logs de request/response |

## Arquitectura

```
Page (src/app/(dashboard)/...)
  → View (src/views/*-view.tsx)
    → Orchestration Hook (src/hooks/.../use-*-view.ts)
      → Domain Hooks (src/hooks/.../use-*.ts)
        → Services (src/services/*-service.ts)
          → API Client (src/lib/api-client.ts)
```

- **Services**: funciones puras para llamadas REST, sin estado
- **Domain Hooks**: gestión de fetch + CRUD para un sub-recurso
- **Orchestration Hooks**: coordinan múltiples domain hooks y refreshes cruzados
- **Views**: componentes de página que consumen un orchestration hook

## API Client (`src/lib/api-client.ts`)

- Injecta `Authorization: Bearer` en cada request
- Auto-refresca token en 401 con lock de concurrencia
- `ApiClientError` tiene `.isPlanError` y `.isBusinessError`
- Deduplicación de requests GET integrada

## Auth (`src/context/AuthContext.tsx`)

Tokens en localStorage (24h access, 7d refresh). Login/register/logout via context.

## Forms

1. Schema Zod en `src/lib/validations/{domain}.ts`
2. Hook en `src/hooks/forms/use-{entity}-form.ts` (React Hook Form + zodResolver)
3. Modal usa `form`, `onSubmit`, `handleClose` del hook

## i18n

Sistema propio (`createT`, `useLanguage`) con JSON por feature. **Sin librerías externas**.

```
src/lib/i18n/
├── index.ts
├── types.ts
└── locales/
    ├── es/  (fuente de verdad)
    └── en/
```

Keys: `<namespace>.<grupo>.<variante>` (ej: `expenses.delete.title`)

## Dates

Usar siempre `formatDate()` de `src/lib/date-utils.ts`. No usar `new Date(dateString)` directamente para display.

- `YYYY-MM-DD` → parseados como medianoche local (evita off-by-one de UTC)
- Timestamps completos → `new Date()` normalmente

## Convenciones

- Path alias: `@/*` → `src/*`
- Route groups: `(auth)` público, `(dashboard)` protegido con sidebar
- Recursos project-scoped: `/projects/{id}/...` en la API
- Toasts: `toast` (Sonner) para feedback, `toastApiError` para errores API
- Plan errors (403) → upgrade prompts, no toasts genéricos

## Linting

```bash
npm run lint
npm run typecheck
```
