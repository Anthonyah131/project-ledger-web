# Contexto de trabajo actual — Internacionalización (i18n)

## Objetivo
Aplicar multilenguaje (ES / EN) a **todo el proyecto** usando el motor propio (`useLanguage` / `createT` / `t()`).
No se usan librerías externas. Los archivos JSON por feature viven en `src/lib/i18n/locales/{es,en}/`.

## Reglas clave
- Siempre importar `useLanguage` de `@/context/language-context`
- Agregar `t` a los arrays de dependencias de `useCallback`/`useEffect` donde se llame `t()`
- Nuevas keys → agregar en `es/<archivo>.json` primero, luego en `en/<archivo>.json`
- No duplicar keys que ya existen en `common.*`
- Convención: `namespace.grupo.variante` (ej. `admin.editModal.title`, `billing.subscription.loading`)

## Estado actual — qué ya está migrado

### Hooks (`src/hooks/`)
- ✅ `workspaces/` — completo
- ✅ `projects/` — 13 hooks completos (projects, project-detail, expenses, incomes, categories, members, obligations, partners, payment-methods, budget, partner-settlements, alternative-currencies, project-detail-view)
- ✅ `reports/` — 7 hooks completos (expense, income, partner-balances, workspace, partner-general, payment-method, reports-catalogs)

### Data / Context
- ✅ `src/data/site-data.ts` — convertido a factory functions (`getFooterLinks(t)`, `getContactChannels(t)`, `getFaqCategories(t)`); strings en `es/site.json` y `en/site.json`
- ✅ `src/context/` — sin cambios necesarios (sin strings de usuario)

### Components
- ✅ `src/components/admin/` — edit-user-modal, user-states, users-list, users-toolbar
- ✅ `src/components/auth/auth-guard.tsx`
- ✅ `src/components/billing/` — billing-plans-grid, billing-subscription-card
- ✅ `src/components/landing/` — navbar, hero, features, how-it-works, stats, cta, pricing, footer (re-export)

## Archivos de locale — nuevas keys añadidas en esta sesión

### `es/site.json` + `en/site.json` (nuevos)
Namespace `site.*`: `description`, `footer.*`, `contact.*`, `faq.*`

### `es/admin.json` + `en/admin.json`
Añadidos: `editModal.*`, `empty.*`, `toolbar.*`

### `es/auth.json` + `en/auth.json`
Añadido: `auth.verifyingSession`

### `es/billing.json` + `en/billing.json`
Añadido: `billing.subscription.*` (30+ keys para BillingSubscriptionCard)

### `es/landing.json` + `en/landing.json`
Reescritos con: `landing.heroTitlePart1/Highlight/Part2`, `landing.howItWorks.*`, `landing.features.*` (8 features), `landing.stats.*` (4 stats), `landing.ctaSubtitleFull`, `landing.pricing.errors.*`, `landing.viewFeature`

## Pendiente (próximas sesiones)

Directorios de componentes aún sin migrar:
- `src/components/chatbot/`
- `src/components/dashboard/`
- `src/components/landing/`
- `src/components/members/`
- `src/components/partners/`
- `src/components/payment-methods/`
- `src/components/project-detail/`
- `src/components/projects/`
- `src/components/reports/`
- `src/components/settings/`
- `src/components/shared/`
- `src/components/workspaces/`

Hooks pendientes:
- `src/hooks/admin/`
- `src/hooks/auth/`
- `src/hooks/billing/`
- `src/hooks/chatbot/`
- `src/hooks/dashboard/`
- `src/hooks/forms/`
- `src/hooks/partners/`
- `src/hooks/payment-methods/`
- `src/hooks/settings/`
- `src/hooks/workspaces/` (revisión: `use-workspace-view.ts`)

Views pendientes:
- `src/views/` — la mayoría de las vistas aún pueden tener strings hardcodeados

## Patrón de migración para componentes
```tsx
// 1. Importar
import { useLanguage } from "@/context/language-context"

// 2. Usar dentro del componente
const { t } = useLanguage()

// 3. Reemplazar strings
<span>{t("namespace.key")}</span>
t("namespace.key", { variable: value })  // con interpolación
```
