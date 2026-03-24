# README — Refactor i18n: De archivos monolíticos a JSON por feature

> **Estado:** Phase 1 completada ✅ | Phase 2 pendiente
> **Prioridad:** Media-alta
> **Impacto:** 0 breaking changes — todos los callsites existentes siguen funcionando
> **Completado:** 2026-03-24

---

## 1. Contexto actual

### Estructura actual

```
src/lib/i18n/
├── index.ts                  ← motor: createT(), getTranslations()
└── locales/
    ├── es.ts                 ← fuente de verdad (~713 líneas, 22 namespaces)
    └── en.ts                 ← tipado como typeof es (Translations)
```

### Cómo funciona hoy

- `es.ts` exporta un objeto plano `const es = { common: {}, auth: {}, ... }`
- `en.ts` importa `type Translations` de `es.ts` y lo usa como constraint
- `createT(translations)` resuelve claves por dot-path: `"auth.callback.error"` → `translations.auth.callback.error`
- `useLanguage()` expone `t(key, params?)` con interpolación `{variable}`
- Ambos archivos se importan estáticamente y viven en el bundle siempre

### El problema

| Síntoma | Detalle |
|---|---|
| Archivos grandes | `es.ts` tiene 713 líneas y crece con cada feature |
| Sin separación de responsabilidades | `expenses`, `billing`, `admin` y `landing` conviven en el mismo objeto |
| Claves duplicadas | `"Esta acción no se puede deshacer."` aparece en 6 namespaces con distinta key |
| Inconsistencia de naming | `deleteTitle` vs `deleteConfirmTitle` vs `delete.title` según el namespace |
| Sin lazy loading posible | Todo el árbol se carga aunque la página solo necesite 1 namespace |
| Difícil para traductores externos | No pueden trabajar en secciones aisladas |

### Namespaces actuales (22)

| Namespace | Aprox. claves | Observaciones |
|---|---|---|
| `common` | 61 | OK, muy reutilizable |
| `nav` | 13 | Pequeño, podría ir en `shared` |
| `auth` | ~35 | Tiene sub-objetos `callback`, `forgotPasswordFlow` |
| `dashboard` | 18 | Limpio |
| `projects` | ~80 | Incluye `tabs` y `settingsTab` (32 claves) |
| `members` | 14 | Scoped a projects |
| `expenses` | 17 | Scoped a project-detail |
| `incomes` | 14 | Scoped a project-detail |
| `categories` | 12 | Scoped a project-detail |
| `obligations` | 14 | Scoped a project-detail |
| `budget` | 12 | Scoped a project-detail |
| `partnerSettlements` | 14 | Scoped a project-detail |
| `partners` | 14 | Feature global |
| `paymentMethods` | 15 | Feature global |
| `billing` | ~40 | Sub-objetos `features`, `cancelPage`, `successPage` |
| `reports` | 30 | Sub-objeto `tabs` |
| `workspaces` | 16 | Limpio |
| `admin` | 20 | Panel admin |
| `settings` | ~35 | Sub-objetos `shell`, `appearance`, `security` |
| `chatbot` | 10 | Feature transversal |
| `landing` | 15 | Solo landing page |
| `help` | 5 | Solo help page |

---

## 2. Objetivo del refactor

1. **Dividir** `es.ts` y `en.ts` en archivos `.json` por feature dentro de carpetas por idioma
2. **Sin breaking changes** en Phase 1 — el código existente (`t("expenses.new")`) no necesita tocarse
3. **Normalizar** naming de claves en Phase 2 (opcional, incremental)
4. **Mantener** type safety con TypeScript mediante inferencia de JSON
5. **Habilitar** lazy loading futuro por namespace
6. **Facilitar** la incorporación de traductores externos

---

## 3. Nueva estructura propuesta

```
src/lib/i18n/
├── index.ts                      ← actualizado para cargar desde JSON
├── types.ts                      ← tipo Translations derivado de los JSON de ES
└── locales/
    ├── es/
    │   ├── shared.json           ← common + nav
    │   ├── auth.json             ← auth (login, register, callback, forgot-password)
    │   ├── dashboard.json        ← dashboard
    │   ├── projects.json         ← projects + members
    │   ├── project-detail.json   ← expenses, incomes, categories, obligations, budget, partnerSettlements
    │   ├── partners.json         ← partners
    │   ├── payment-methods.json  ← paymentMethods
    │   ├── billing.json          ← billing
    │   ├── reports.json          ← reports
    │   ├── settings.json         ← settings
    │   ├── workspaces.json       ← workspaces
    │   ├── admin.json            ← admin
    │   ├── chatbot.json          ← chatbot
    │   ├── landing.json          ← landing
    │   └── help.json             ← help
    └── en/
        ├── shared.json
        ├── auth.json
        ├── dashboard.json
        ├── projects.json
        ├── project-detail.json
        ├── partners.json
        ├── payment-methods.json
        ├── billing.json
        ├── reports.json
        ├── settings.json
        ├── workspaces.json
        ├── admin.json
        ├── chatbot.json
        ├── landing.json
        └── help.json
```

### Mapeo namespace → archivo JSON

| Archivo JSON | Namespaces que contiene | Claves totales aprox. |
|---|---|---|
| `shared.json` | `common`, `nav` | ~74 |
| `auth.json` | `auth` | ~35 |
| `dashboard.json` | `dashboard` | ~18 |
| `projects.json` | `projects`, `members` | ~95 |
| `project-detail.json` | `expenses`, `incomes`, `categories`, `obligations`, `budget`, `partnerSettlements` | ~85 |
| `partners.json` | `partners` | ~14 |
| `payment-methods.json` | `paymentMethods` | ~15 |
| `billing.json` | `billing` | ~42 |
| `reports.json` | `reports` | ~32 |
| `settings.json` | `settings` | ~38 |
| `workspaces.json` | `workspaces` | ~16 |
| `admin.json` | `admin` | ~20 |
| `chatbot.json` | `chatbot` | ~10 |
| `landing.json` | `landing` | ~15 |
| `help.json` | `help` | ~5 |

**Total: ~514 claves / ~515 líneas por idioma → 2 archivos de 713 líneas → 30 archivos de ~35 líneas promedio**

> **Importante:** El objeto mergeado en runtime tendrá exactamente la misma forma que hoy.
> `t("expenses.new")` sigue funcionando sin cambios. El código no ve la diferencia.

---

## 4. Cómo mapear traducciones actuales

### Principio clave

Los archivos JSON son una división de **organización de código**, no de API pública.
El objeto final que consume `createT` es el mismo de hoy:

```
{ common: {...}, nav: {...}, auth: {...}, expenses: {...}, ... }
```

### Cómo funciona el merge

Cada archivo JSON contribuye sus namespaces al objeto global:

```
shared.json    → { common: {...}, nav: {...} }
auth.json      → { auth: {...} }
projects.json  → { projects: {...}, members: {...} }
project-detail.json → { expenses: {...}, incomes: {...}, categories: {...}, ... }
```

Al hacer `Object.assign({}, ...parts)` el resultado es idéntico al objeto actual de `es.ts`.

### Mapping de callsites (Phase 1 — sin cambios)

```ts
// HOY (sigue funcionando igual)
t("expenses.new")                    // → expenses.json → "new": "Nuevo gasto"
t("projects.settingsTab.add")        // → projects.json → settingsTab.add
t("auth.callback.error")             // → auth.json → callback.error
t("common.save")                     // → shared.json → common.save
```

### Mapping de callsites (Phase 2 — normalización opcional)

En la Phase 2, los keys se agrupan semánticamente dentro del JSON.
**Esto SÍ requiere actualizar callsites** (se hace de forma incremental por feature).

```ts
// ANTES (Phase 1)
t("expenses.deleteTitle")
t("expenses.deleteConfirmDescription")
t("expenses.deleteConfirmDescriptionNamed")

// DESPUÉS (Phase 2)
t("expenses.delete.title")
t("expenses.delete.description")
t("expenses.delete.confirm", { name })
```

---

## 5. Convención de keys

### Regla general

```
<namespace>.<grupo>.<variante>
```

### Grupos estándar por tipo de contenido

| Grupo | Uso | Ejemplo |
|---|---|---|
| `create.title` | Título de modal/form de creación | `t("projects.create.title")` |
| `create.subtitle` | Subtítulo descriptivo | `t("projects.create.subtitle")` |
| `create.submit` | Botón de envío | `t("projects.create.submit")` |
| `edit.title` | Título de modal de edición | `t("partners.edit.title")` |
| `delete.title` | Título del modal de eliminación | `t("expenses.delete.title")` |
| `delete.description` | Descripción genérica | `t("expenses.delete.description")` |
| `delete.confirm` | Texto con `{name}` | `t("expenses.delete.confirm", { name })` |
| `empty.title` | Estado vacío | `t("projects.empty.title")` |
| `empty.description` | Descripción estado vacío | `t("projects.empty.description")` |
| `errors.notFound` | Error 404 | `t("admin.errors.notFound")` |
| `errors.forbidden` | Error 403 | `t("billing.errors.forbidden")` |
| `toast.success` | Toast de éxito | `t("settings.toast.success")` |
| `toast.error` | Toast de error | `t("settings.toast.error")` |
| `fields.<name>.label` | Label de campo | `t("auth.fields.email.label")` |
| `fields.<name>.placeholder` | Placeholder | `t("auth.fields.email.placeholder")` |

### Casos especiales

```jsonc
// Interpolaciones — siempre con {camelCase}
"delete.confirm": "¿Eliminar \"{name}\" del proyecto?",
"greeting": "Bienvenido, {name}",
"budgetAlert": "Alerta: {percent}% del presupuesto consumido",
"rateLabel": "Tasa ({from} → {to})"

// Plurales simples — usar keys separadas (sin i18n plural engine)
"singular": "miembro",
"plural": "miembros"

// Estados de loading
"loading": "Cargando...",    // en common, reutilizar con common.loading
"saving": "Guardando...",    // en common, reutilizar con common.saving
```

### Claves a eliminar por duplicación (Phase 2)

Las siguientes claves son **idénticas** en múltiples namespaces. En Phase 2 se eliminan
y se reemplaza con `common.*`:

| Clave duplicada | Namespaces afectados | Reemplazar con |
|---|---|---|
| `"Esta acción no se puede deshacer."` | `expenses`, `incomes`, `categories`, `obligations`, `partners`, `paymentMethods`, `workspaces`, `admin` | `common.irreversibleWarning` |
| `"Agregar"` / `"Add"` | `members.add`, `projects.settingsTab.add`, `common.add` | `common.add` ✓ (ya existe) |
| Títulos de tabs duplicados | `projects.tabs.expenses` = `reports.tabs.expenses` = `expenses.title` | usar `expenses.title` |

---

## 6. Plan de migración paso a paso

### Phase 1: Split a JSON (sin breaking changes)

> El código existente no cambia. Solo se reorganizan los archivos fuente.

```
[ ] 1.1  Crear carpetas src/lib/i18n/locales/es/ y src/lib/i18n/locales/en/
[ ] 1.2  Crear src/lib/i18n/types.ts con el tipo Translations derivado de los JSON de ES
[ ] 1.3  Actualizar src/lib/i18n/index.ts para cargar y mergear los JSON
[ ] 1.4  Migrar namespace: shared (common + nav)
         → crear es/shared.json + en/shared.json
         → verificar que t("common.save") y t("nav.projects") funcionan
[ ] 1.5  Migrar namespace: auth
         → crear es/auth.json + en/auth.json
         → verificar login, register, forgot-password, callback
[ ] 1.6  Migrar namespace: dashboard
[ ] 1.7  Migrar namespace: projects + members
         → projects.json incluye ambos namespaces
[ ] 1.8  Migrar namespace: project-detail
         → project-detail.json incluye: expenses, incomes, categories, obligations, budget, partnerSettlements
[ ] 1.9  Migrar namespace: partners
[ ] 1.10 Migrar namespace: payment-methods (paymentMethods)
[ ] 1.11 Migrar namespace: billing
[ ] 1.12 Migrar namespace: reports
[ ] 1.13 Migrar namespace: settings
[ ] 1.14 Migrar namespace: workspaces
[ ] 1.15 Migrar namespace: admin
[ ] 1.16 Migrar namespace: chatbot
[ ] 1.17 Migrar namespace: landing
[ ] 1.18 Migrar namespace: help
[ ] 1.19 Eliminar es.ts y en.ts (una vez que todos los namespaces están en JSON)
[ ] 1.20 Verificar build: npm run build (sin errores de tipos ni rutas)
```

### Phase 2: Normalizar keys (breaking — por namespace, incremental)

> Cada item de este checklist requiere actualizar callsites en el código.

```
[ ] 2.1  Limpiar duplicados → consolidar en common
[ ] 2.2  Normalizar expenses: deleteTitle → delete.title, etc.
[ ] 2.3  Normalizar incomes (misma estructura que expenses)
[ ] 2.4  Normalizar categories
[ ] 2.5  Normalizar obligations
[ ] 2.6  Normalizar budget
[ ] 2.7  Normalizar partnerSettlements
[ ] 2.8  Normalizar projects (create/edit/delete groups)
[ ] 2.9  Normalizar partners
[ ] 2.10 Normalizar paymentMethods
[ ] 2.11 Normalizar settings (ya tiene sub-objetos, solo alinear)
[ ] 2.12 Normalizar auth.fields.* para labels y placeholders
```

---

## 7. Compatibilidad temporal

### Estrategia durante la migración

Durante la Phase 1, `es.ts` y `en.ts` siguen existiendo como respaldo hasta que
todos los namespaces estén migrados a JSON.

El nuevo `index.ts` carga desde JSON y **usa el `.ts` como fallback** para lo que todavía
no se haya migrado:

```ts
// src/lib/i18n/index.ts — versión de transición

// JSON (ya migrados)
import esShared from "@/lib/i18n/locales/es/shared.json"
import esAuth from "@/lib/i18n/locales/es/auth.json"
// ... solo los que ya estén listos

// Fallback legacy (lo que aún no está en JSON)
import esLegacy from "@/lib/i18n/locales/es"  // el es.ts original
import enLegacy from "@/lib/i18n/locales/en"

function mergeTranslations(...parts: Record<string, unknown>[]) {
  return Object.assign({}, ...parts) as Translations
}

const esTranslations = mergeTranslations(
  esLegacy,     // tiene todo
  esShared,     // sobreescribe common y nav con la versión JSON
  esAuth,       // sobreescribe auth con la versión JSON
  // ... agregando a medida que se migran
)
```

> Con este patrón, los JSON tienen **precedencia** sobre el legacy `.ts`.
> Podés migrar namespace por namespace sin riesgo.

### Una vez que todos los namespaces están en JSON

```ts
// src/lib/i18n/index.ts — versión final

import esShared from "@/lib/i18n/locales/es/shared.json"
import esAuth from "@/lib/i18n/locales/es/auth.json"
import esDashboard from "@/lib/i18n/locales/es/dashboard.json"
import esProjects from "@/lib/i18n/locales/es/projects.json"
import esProjectDetail from "@/lib/i18n/locales/es/project-detail.json"
import esPartners from "@/lib/i18n/locales/es/partners.json"
import esPaymentMethods from "@/lib/i18n/locales/es/payment-methods.json"
import esBilling from "@/lib/i18n/locales/es/billing.json"
import esReports from "@/lib/i18n/locales/es/reports.json"
import esSettings from "@/lib/i18n/locales/es/settings.json"
import esWorkspaces from "@/lib/i18n/locales/es/workspaces.json"
import esAdmin from "@/lib/i18n/locales/es/admin.json"
import esChatbot from "@/lib/i18n/locales/es/chatbot.json"
import esLanding from "@/lib/i18n/locales/es/landing.json"
import esHelp from "@/lib/i18n/locales/es/help.json"

// (igual para en/)

const es = mergeTranslations(
  esShared, esAuth, esDashboard, esProjects, esProjectDetail,
  esPartners, esPaymentMethods, esBilling, esReports, esSettings,
  esWorkspaces, esAdmin, esChatbot, esLanding, esHelp,
)
```

---

## 8. Ejemplos reales

### 8.1 shared.json (es)

```json
{
  "common": {
    "save": "Guardar cambios",
    "cancel": "Cancelar",
    "create": "Crear",
    "edit": "Editar",
    "delete": "Eliminar",
    "loading": "Cargando...",
    "deleting": "Eliminando...",
    "saving": "Guardando...",
    "error": "Error",
    "search": "Buscar...",
    "noResults": "Sin resultados",
    "noResultsDescription": "No se encontraron coincidencias con ese criterio",
    "noRecords": "No hay registros",
    "createFirst": "Crea el primero para comenzar",
    "createNew": "Crear nuevo",
    "options": "Opciones",
    "open": "Abrir",
    "activate": "Activar",
    "activating": "Activando...",
    "manageAccess": "Gestionar accesos",
    "disconnect": "Desconectar",
    "actions": "Acciones",
    "close": "Cerrar",
    "back": "Volver",
    "next": "Siguiente",
    "previous": "Anterior",
    "confirm": "Confirmar",
    "yes": "Sí",
    "no": "No",
    "optional": "(opcional)",
    "required": "*",
    "perPage": "Por página",
    "page": "Página",
    "of": "de",
    "gridView": "Vista cuadricula",
    "listView": "Vista lista",
    "sortBy": "Ordenar",
    "filterBy": "Filtrar",
    "currency": "Moneda",
    "date": "Fecha",
    "amount": "Monto",
    "description": "Descripción",
    "notes": "Notas",
    "name": "Nombre",
    "email": "Correo electrónico",
    "type": "Tipo",
    "status": "Estado",
    "role": "Rol",
    "profile": "Mi perfil",
    "logout": "Cerrar sesión",
    "user": "Usuario",
    "reload": "Recargar",
    "upgrade": "Mejorar plan",
    "tryAgain": "Intentar de nuevo",
    "copiedToClipboard": "Copiado al portapapeles",
    "noLimit": "Sin límite",
    "auto": "Auto",
    "add": "Agregar"
  },
  "nav": {
    "brand": "Project Ledger",
    "features": "Características",
    "howItWorks": "Cómo funciona",
    "pricing": "Precios",
    "login": "Iniciar sesión",
    "startFree": "Comenzar gratis",
    "projects": "Proyectos",
    "workspaces": "Workspaces",
    "dashboard": "Dashboard",
    "reports": "Reportes",
    "paymentMethods": "Métodos de pago",
    "settings": "Configuración",
    "admin": "Administración"
  }
}
```

### 8.2 project-detail.json (es) — ejemplo parcial

```json
{
  "expenses": {
    "title": "Gastos",
    "new": "Nuevo gasto",
    "newWithAI": "Nuevo gasto con IA",
    "createTitle": "Nuevo gasto",
    "createSubtitle": "Registra un nuevo gasto en el proyecto",
    "create": "Crear gasto",
    "empty": "No hay gastos registrados",
    "emptyDescription": "Registra el primer gasto de este proyecto",
    "deleteTitle": "Eliminar gasto",
    "deleteConfirmDescription": "Esta acción no se puede deshacer.",
    "deleteConfirmDescriptionNamed": "¿Eliminar gasto \"{name}\"?",
    "categoryLabel": "Categoría",
    "partnerLabel": "Partner",
    "paymentMethodLabel": "Método de pago",
    "conceptLabel": "Concepto",
    "conceptPlaceholder": "Ej: Compra de materiales",
    "obligationLabel": "Obligación",
    "obligationNone": "Ninguna",
    "equivalentLabel": "Equivalente en {currency}",
    "equivalentHint": "¿Cuánto {currency} cubre este pago?",
    "pendingBalance": "Saldo pendiente:",
    "aiTitle": "Nuevo gasto con IA",
    "aiSubtitle": "Sube el documento y luego revisa el borrador antes de guardar el gasto",
    "extractWithAI": "Extraer borrador con IA",
    "aiUploadHint": "Sube una foto o PDF del recibo/factura para prellenar el formulario del gasto"
  },
  "incomes": {
    "title": "Ingresos",
    "new": "Nuevo ingreso",
    "createTitle": "Nuevo ingreso",
    "createSubtitle": "Registra un nuevo ingreso en el proyecto",
    "create": "Crear ingreso",
    "empty": "No hay ingresos registrados",
    "emptyDescription": "Registra el primer ingreso de este proyecto",
    "deleteTitle": "Eliminar ingreso",
    "deleteConfirmDescription": "Esta acción no se puede deshacer.",
    "deleteConfirmDescriptionNamed": "¿Eliminar ingreso \"{name}\"?",
    "conceptLabel": "Concepto",
    "conceptPlaceholder": "Ej: Pago cliente ACME",
    "partnerLabel": "Partner",
    "paymentMethodLabel": "Método de pago",
    "newWithAI": "Nuevo ingreso con IA",
    "aiTitle": "Nuevo ingreso con IA",
    "aiSubtitle": "Sube el documento y luego revisa el borrador antes de guardar el ingreso"
  },
  "categories": { "...": "..." },
  "obligations": { "...": "..." },
  "budget": { "...": "..." },
  "partnerSettlements": { "...": "..." }
}
```

### 8.3 Antes / Después — callsites (Phase 1)

**ANTES y DESPUÉS en Phase 1 son idénticos.** Solo cambió dónde vive el string.

```tsx
// src/views/project-detail/tabs/project-detail-expenses-tab.tsx
// NO cambia nada:

const { t } = useLanguage()

<DeleteEntityModal
  title={t("expenses.deleteTitle")}
  description={t("expenses.deleteConfirmDescription")}
  getMessage={(e) => t("expenses.deleteConfirmDescriptionNamed", { name: e.title })}
/>
```

### 8.4 Antes / Después — Phase 2 (normalización de keys)

```tsx
// ANTES (Phase 1 — keys camelCase planas)
t("expenses.deleteTitle")                    // "Eliminar gasto"
t("expenses.deleteConfirmDescription")       // "Esta acción no se puede deshacer."
t("expenses.deleteConfirmDescriptionNamed")  // "¿Eliminar gasto "{name}"?"

// DESPUÉS (Phase 2 — keys agrupadas semánticamente)
t("expenses.delete.title")                   // "Eliminar gasto"
t("expenses.delete.description")             // "Esta acción no se puede deshacer."
t("expenses.delete.confirm", { name })       // "¿Eliminar gasto "{name}"?"
```

```json
// expenses.json (Phase 2)
{
  "expenses": {
    "title": "Gastos",
    "create": {
      "title": "Nuevo gasto",
      "subtitle": "Registra un nuevo gasto en el proyecto",
      "submit": "Crear gasto"
    },
    "delete": {
      "title": "Eliminar gasto",
      "description": "Esta acción no se puede deshacer.",
      "confirm": "¿Eliminar gasto \"{name}\"?"
    },
    "empty": {
      "title": "No hay gastos registrados",
      "description": "Registra el primer gasto de este proyecto"
    },
    "fields": {
      "concept": { "label": "Concepto", "placeholder": "Ej: Compra de materiales" },
      "category": { "label": "Categoría" },
      "partner": { "label": "Partner" },
      "paymentMethod": { "label": "Método de pago" },
      "obligation": { "label": "Obligación", "none": "Ninguna" },
      "equivalent": {
        "label": "Equivalente en {currency}",
        "hint": "¿Cuánto {currency} cubre este pago?"
      }
    },
    "ai": {
      "button": "Nuevo gasto con IA",
      "title": "Nuevo gasto con IA",
      "subtitle": "Sube el documento y luego revisa el borrador antes de guardar el gasto",
      "extract": "Extraer borrador con IA",
      "uploadHint": "Sube una foto o PDF del recibo/factura para prellenar el formulario del gasto"
    },
    "pendingBalance": "Saldo pendiente:"
  }
}
```

---

## 9. Notas técnicas

### 9.1 Type safety con JSON

`resolveJsonModule: true` ya está habilitado en `tsconfig.json`. TypeScript puede inferir
tipos desde imports de JSON automáticamente.

```ts
// src/lib/i18n/types.ts
import type esShared from "./locales/es/shared.json"
import type esAuth from "./locales/es/auth.json"
import type esDashboard from "./locales/es/dashboard.json"
import type esProjects from "./locales/es/projects.json"
import type esProjectDetail from "./locales/es/project-detail.json"
import type esPartners from "./locales/es/partners.json"
import type esPaymentMethods from "./locales/es/payment-methods.json"
import type esBilling from "./locales/es/billing.json"
import type esReports from "./locales/es/reports.json"
import type esSettings from "./locales/es/settings.json"
import type esWorkspaces from "./locales/es/workspaces.json"
import type esAdmin from "./locales/es/admin.json"
import type esChatbot from "./locales/es/chatbot.json"
import type esLanding from "./locales/es/landing.json"
import type esHelp from "./locales/es/help.json"

export type Translations =
  typeof esShared &
  typeof esAuth &
  typeof esDashboard &
  typeof esProjects &
  typeof esProjectDetail &
  typeof esPartners &
  typeof esPaymentMethods &
  typeof esBilling &
  typeof esReports &
  typeof esSettings &
  typeof esWorkspaces &
  typeof esAdmin &
  typeof esChatbot &
  typeof esLanding &
  typeof esHelp
```

Los archivos `en/*.json` siguen usando ES como source of truth para constraint:
si falta una clave en `en/`, TypeScript lo detecta al compilar.

### 9.2 Función mergeTranslations

```ts
// src/lib/i18n/index.ts
function mergeTranslations(...parts: Record<string, unknown>[]): Translations {
  return Object.assign({}, ...parts) as Translations
}
```

> Advertencia: `Object.assign` hace un merge **shallow**. Como los namespaces son
> top-level distintos (`common`, `auth`, etc.), no hay conflictos. Si dos JSON
> tuvieran el mismo top-level key, el último ganaría — evitar esto.

### 9.3 El motor `createT` no cambia

`createT` y `useLanguage` no necesitan ningún cambio. Solo cambia cómo se construye
el objeto `Translations` en `index.ts`.

### 9.4 Lazy loading (futuro)

Una vez en JSON, se puede migrar a carga dinámica por namespace:

```ts
// Carga solo el namespace necesario para la ruta actual
const authTranslations = await import(`@/lib/i18n/locales/${locale}/auth.json`)
```

Esto requeriría cambios en `LanguageProvider` para aceptar un array de namespaces
activos y cargarlos bajo demanda. Es una optimización de Phase 3 — no prioritaria
mientras el bundle total sea < 50 KB.

### 9.5 Herramientas recomendadas para Phase 2

- **i18n-ally** (VSCode extension) — detecta claves no usadas, duplicadas y faltantes
- **grep + sed** — para renombrar claves en batch: `grep -r "deleteTitle" src/`
- Crear un script `scripts/check-i18n.ts` que valide que todas las claves en ES
  existen en EN y viceversa

### 9.6 Naming de archivos JSON

Usar kebab-case para los nombres de archivo, alineado con la convención del proyecto:

```
project-detail.json   ✓
payment-methods.json  ✓
projectDetail.json    ✗
paymentMethods.json   ✗
```

### 9.7 Duplicados detectados para resolver en Phase 2

| String duplicado | Namespaces | Acción |
|---|---|---|
| `"Esta acción no se puede deshacer."` | 8 namespaces | Agregar `common.irreversibleWarning` |
| `"Guardar cambios"` / `"Save changes"` | `common.save`, usado globalmente | Ya resuelto: usar `common.save` |
| Tab labels (`expenses.title` = `projects.tabs.expenses` = `reports.tabs.expenses`) | 3 namespaces | Usar `expenses.title` como canónico |
| `"No hay/hay..."` patrones de empty state | Múltiples | Estandarizar a `<namespace>.empty.title` + `.description` |
| `"Agregar"` button | `common.add`, `members.add`, `projects.settingsTab.add` | Consolidar en `common.add` |

---

## 10. Progreso

> Actualiza este checklist a medida que avances. Marca con `[x]` lo completado.

### Phase 1 — Split a JSON

- [x] Crear estructura de carpetas `locales/es/` y `locales/en/`
- [x] Crear `types.ts` con tipo `Translations` derivado de JSON
- [x] Actualizar `index.ts` con merge desde JSON (sin fallback legacy — migración completa)
- [x] Migrar `shared` (common + nav)
- [x] Migrar `auth`
- [x] Migrar `dashboard`
- [x] Migrar `projects` + `members`
- [x] Migrar `project-detail` (expenses, incomes, categories, obligations, budget, partnerSettlements)
- [x] Migrar `partners`
- [x] Migrar `payment-methods`
- [x] Migrar `billing`
- [x] Migrar `reports`
- [x] Migrar `settings`
- [x] Migrar `workspaces`
- [x] Migrar `admin`
- [x] Migrar `chatbot`
- [x] Migrar `landing`
- [x] Migrar `help`
- [x] Eliminar `es.ts` y `en.ts`
- [x] Verificar `tsc --noEmit` sin errores ✅

### Phase 1 — Revisión de views (post-split)

- [x] Auditar todos los archivos de `src/views/` para detectar strings hardcodeados
- [x] Corregir `billing-view.tsx` — `getBillingErrorMessage` usaba 4 strings ES hardcodeados y 4 strings EN hardcodeados; ahora usa `t()` con las claves `billing.errors.*` y `billing.stripeDisabled`
- [x] Corregir `billing-success-view.tsx` — mismo patrón; migrado a `billing.errors.*`
- [x] Corregir `settings-profile-view.tsx` — fallback `"No fue posible actualizar el perfil."` migrado a `settings.errors.profileUpdateFailed`
- [x] Corregir `settings-security-view.tsx` — 4 strings hardcodeados en `getDeleteAccountErrorMessage` migrados a `settings.errors.*`
- [x] 36 archivos de views restantes: usan `useLanguage()` + `t()` correctamente, sin strings visibles hardcodeados

### Claves nuevas agregadas en Phase 1 — Revisión

Estas claves se agregaron durante la auditoría (no estaban en los `.ts` originales):

| Archivo JSON | Clave | ES | EN |
|---|---|---|---|
| `billing.json` | `billing.errors.sessionExpired` | Tu sesión expiró... | Your session expired... |
| `billing.json` | `billing.errors.forbidden` | No tienes permisos (facturación) | You don't have permission... |
| `billing.json` | `billing.errors.subscriptionForbidden` | No tienes permisos (suscripción) | You don't have permission... |
| `billing.json` | `billing.errors.loadFailed` | No fue posible cargar... | Could not load billing... |
| `billing.json` | `billing.errors.subscriptionFailed` | No fue posible consultar... | Could not check subscription... |
| `settings.json` | `settings.errors.sessionExpired` | Tu sesión expiró... | Your session expired... |
| `settings.json` | `settings.errors.accountForbidden` | No tienes permisos (cuenta) | You don't have permission... |
| `settings.json` | `settings.errors.accountNotFound` | No se encontró la cuenta | Account not found |
| `settings.json` | `settings.errors.accountDeleteFailed` | No fue posible eliminar | Could not delete the account |
| `settings.json` | `settings.errors.profileUpdateFailed` | No fue posible actualizar | Could not update the profile |

### Phase 2 — Normalización de keys

> **Nota antes de empezar Phase 2:** Cada namespace a normalizar implica actualizar los callsites
> en los archivos de `src/views/` y posiblemente en `src/components/`. Hacerlo namespace por namespace
> y verificar `tsc --noEmit` después de cada uno.

> **Patrón recomendado para las funciones `getXErrorMessage`:** Durante Phase 1 se descubrió que
> estas funciones helper (definidas fuera del componente) deben recibir `t` como parámetro para
> poder usar traducciones. Seguir este patrón en cualquier nuevo helper que retorne strings visibles.

- [ ] Definir tabla final de convenciones (grupos: create, edit, delete, empty, fields, toast)
- [ ] Limpiar duplicados → `common.irreversibleWarning`
- [ ] Normalizar `expenses`
- [ ] Normalizar `incomes`
- [ ] Normalizar `categories`
- [ ] Normalizar `obligations`
- [ ] Normalizar `budget`
- [ ] Normalizar `partnerSettlements`
- [ ] Normalizar `projects`
- [ ] Normalizar `partners`
- [ ] Normalizar `paymentMethods`
- [ ] Normalizar `settings`
- [ ] Normalizar `auth.fields.*`
- [ ] Actualizar todos los callsites afectados
- [ ] Instalar y configurar i18n-ally en VSCode

### Phase 3 — Optimizaciones (opcional)

- [ ] Lazy loading por namespace en `LanguageProvider`
- [ ] Script `check-i18n.ts` para validar consistencia ES/EN
- [ ] Separar `landing.json` del bundle de la app autenticada (Next.js bundle splitting)

---

*Generado el 2026-03-24 — Proyecto: Project Ledger Web*
