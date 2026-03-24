import type { Translations } from "./types"

// ES
import esShared from "./locales/es/shared.json"
import esAuth from "./locales/es/auth.json"
import esDashboard from "./locales/es/dashboard.json"
import esProjects from "./locales/es/projects.json"
import esProjectDetail from "./locales/es/project-detail.json"
import esPartners from "./locales/es/partners.json"
import esPaymentMethods from "./locales/es/payment-methods.json"
import esBilling from "./locales/es/billing.json"
import esReports from "./locales/es/reports.json"
import esSettings from "./locales/es/settings.json"
import esWorkspaces from "./locales/es/workspaces.json"
import esAdmin from "./locales/es/admin.json"
import esChatbot from "./locales/es/chatbot.json"
import esLanding from "./locales/es/landing.json"
import esHelp from "./locales/es/help.json"

// EN
import enShared from "./locales/en/shared.json"
import enAuth from "./locales/en/auth.json"
import enDashboard from "./locales/en/dashboard.json"
import enProjects from "./locales/en/projects.json"
import enProjectDetail from "./locales/en/project-detail.json"
import enPartners from "./locales/en/partners.json"
import enPaymentMethods from "./locales/en/payment-methods.json"
import enBilling from "./locales/en/billing.json"
import enReports from "./locales/en/reports.json"
import enSettings from "./locales/en/settings.json"
import enWorkspaces from "./locales/en/workspaces.json"
import enAdmin from "./locales/en/admin.json"
import enChatbot from "./locales/en/chatbot.json"
import enLanding from "./locales/en/landing.json"
import enHelp from "./locales/en/help.json"

export type Locale = "es" | "en";

export const LOCALES: Record<Locale, string> = {
  es: "Español",
  en: "English",
};

export const DEFAULT_LOCALE: Locale = "es";

function mergeTranslations(...parts: Record<string, unknown>[]): Translations {
  return Object.assign({}, ...parts) as Translations
}

const es = mergeTranslations(
  esShared, esAuth, esDashboard, esProjects, esProjectDetail,
  esPartners, esPaymentMethods, esBilling, esReports, esSettings,
  esWorkspaces, esAdmin, esChatbot, esLanding, esHelp,
)

const en = mergeTranslations(
  enShared, enAuth, enDashboard, enProjects, enProjectDetail,
  enPartners, enPaymentMethods, enBilling, enReports, enSettings,
  enWorkspaces, enAdmin, enChatbot, enLanding, enHelp,
)

const locales: Record<Locale, Translations> = { es, en };

export function getTranslations(locale: Locale): Translations {
  return locales[locale] ?? locales[DEFAULT_LOCALE];
}

/**
 * Creates a `t()` function bound to the given translations.
 * Supports dot-path keys (e.g. "common.save") and {variable} interpolation.
 */
export function createT(translations: Translations) {
  return function t(
    key: string,
    params?: Record<string, string | number>
  ): string {
    const value = key
      .split(".")
      .reduce<unknown>((obj, k) => (obj as Record<string, unknown>)?.[k], translations);

    const str = typeof value === "string" ? value : key;

    if (!params) return str;

    return str.replace(/\{(\w+)\}/g, (_, name) =>
      params[name] !== undefined ? String(params[name]) : `{${name}}`
    );
  };
}

export type { Translations };
