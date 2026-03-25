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
import type esSite from "./locales/es/site.json"

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
  typeof esHelp &
  typeof esSite
