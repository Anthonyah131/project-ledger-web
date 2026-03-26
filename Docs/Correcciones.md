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
- ✅ `src/components/dashboard/` — app-sidebar, nav-user (nav-main/nav-secondary/site-header sin strings)
- ✅ `src/components/members/` — add-member-modal, member-states, members-list
- ✅ `src/components/partners/` — create/edit modals, partners-list, partners-panel, partners-toolbar, detail/partner-detail-panel, detail/partner-pm-section, detail/partner-projects-section, detail/section-toolbar
- ✅ `src/components/payment-methods/` — create/edit modals, payment-methods-panel, payment-methods-toolbar, payment-methods-list, payment-methods-shelf-view, payment-method-states, payment-method-detail-panel, detail/payment-method-detail-blocks, detail/payment-method-detail-filters, detail/payment-method-detail-tabs
- ✅ `src/components/project-detail/alternative-currencies/` — alternative-currencies-panel
- ✅ `src/components/project-detail/budget/` — budget-panel, budget-states, set-budget-modal
- ✅ `src/components/project-detail/categories/` — categories-list, categories-toolbar, category-states, create-category-modal, edit-category-modal
- ✅ `src/components/project-detail/expenses/` — expense-states, expenses-toolbar, expenses-list, expense-form-fields, create-expense-modal, edit-expense-modal
- ✅ `src/components/project-detail/incomes/` — income-states, incomes-toolbar, incomes-list, income-form-fields, create-income-modal, edit-income-modal
- ✅ `src/components/project-detail/obligations/` — obligation-states, obligations-toolbar, obligations-list, create-obligation-modal, edit-obligation-modal
- ✅ `src/components/project-detail/partner-settlements/` — settlement-states, settlements-list, partner-balance-cards, create-settlement-modal, edit-settlement-modal, partner-history-modal, settlement-suggestions-modal
- ✅ `src/components/project-detail/partners/` — project-partners, project-partner-states
- ✅ `src/components/project-detail/payment-methods/` — project-payment-methods
- ✅ `src/components/project-detail/shared/` — movement-detail-sheet, split-section, document-extraction-step, document-extraction-feedback, currency-conversion/alternative-currency-conversions-section, currency-conversion/project-currency-conversion-section
- ✅ `src/components/project-detail/project-header.tsx`
- ✅ `src/lib/document-extraction-utils.ts` — utils movidas desde `shared/document-extraction/` y migradas (getExtractionQuotaBadgeLabel acepta `t`)
- ✅ `src/components/projects/` — project-states, projects-toolbar, create-project-modal, edit-project-modal, projects-shelf, list-view, shelf-view
- ✅ `src/components/shared/` — delete-confirm-modal, form-modal, empty-state, item-action-menu, pagination, chatbot (app-footer y delete-entity-modal ya estaban migrados)
- ✅ `src/components/workspaces/` — assign-projects-modal, create-workspace-modal, edit-workspace-modal, workspaces-panel
- ✅ `src/lib/plan-presentation.ts` — eliminado; funciones movidas a `src/data/site-data.ts` como `getPlanDescription`, `getPlanFeatureGroups`, `getPlanFeatures` (aceptan `t`); strings en `billing.plans.*`
- ✅ `src/context/language-context.tsx` — fix: initializer lazy `useState(resolveInitialLocale)` en lugar de `useEffect`
- ✅ `src/lib/document-extraction-utils.ts` — `getDocumentExtractionErrorMessage(err, t)` y `getDocumentValidationError(file, t)` reciben `t: TFn`; strings en `documentExtraction.errors.*`
- ✅ `src/lib/billing-utils.ts` — `getBillingStatusMeta(status, t)` recibe `t: TFn`; usa `billing.status.*`; callers actualizados
- ✅ `src/lib/error-utils.ts` — `toastApiError(err, label, t?)` con `t` opcional; usa `common.errors.*`
- ✅ `src/lib/date-utils.ts` — `formatDate` y `formatMonthKey` aceptan `locale` opcional (default `"es"`); `getDateRangeError` acepta `t?`; key `common.errors.invalidDateRange` añadida
- ✅ `src/lib/constants.ts` — eliminados `ROLE_LABEL`, `PAYMENT_METHOD_TYPE_LABEL`, `PAYMENT_METHOD_FORM_TYPE_LABEL`; reemplazados con `getRoleLabel(role, t)`, `getPaymentMethodTypeLabel(type, t)`, `getObligationStatusLabel(status, t)`; `STATUS_COLORS` sin campo `label`

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

- ✅ `src/components/reports/` — report-states, report-filters, expense-report-results, expense-report-monthly-sections-card, income-report-results, workspace-report-results, partner-balances-report-results, partner-general-report-results, payment-method-report-results, payment-method-report-method-card

- ✅ `src/lib/validations/` — todos los schemas convertidos a factory functions `createXSchema(t)` / `updateXSchema(t)` (auth, project, category, expense, income, obligation, partner, payment-method, member, workspace, partner-settlement, project-budget, admin-user); strings en `common.validation.*`, `auth.validation.*`, `members.validation.*`, `partners.validation.*`, `partnerSettlements.validation.*`
- ✅ `src/hooks/forms/` — todos los hooks actualizados para usar `useLanguage()` y pasar `t` a los schema factories
- ✅ `src/hooks/auth/` — use-login, use-register, use-forgot-password actualizados
- ✅ `src/hooks/settings/` — use-settings-profile actualizado

## Pendiente (próximas sesiones)

Directorios de componentes aún sin migrar:
- `src/components/chatbot/`
- `src/components/settings/`

Hooks pendientes:
- `src/hooks/admin/`
- `src/hooks/billing/`
- `src/hooks/chatbot/`
- `src/hooks/dashboard/`
- `src/hooks/partners/`
- `src/hooks/payment-methods/`
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
