import {
  BarChart3,
  Bot,
  CreditCard,
  FileSearch,
  LayoutDashboard,
  MessageSquare,
  Receipt,
  Users,
} from "lucide-react";

// Translatable string strings live in src/lib/i18n/locales/*/landing.json

type TFn = (key: string) => string;

// ─── Features ──────────────────────────────────────────────────────────────────

export function getFeatures(t: TFn) {
  return [
    {
      icon: LayoutDashboard,
      title: t("landing.features.dashboard.title"),
      description: t("landing.features.dashboard.description"),
    },
    {
      icon: CreditCard,
      title: t("landing.features.paymentMethods.title"),
      description: t("landing.features.paymentMethods.description"),
    },
    {
      icon: FileSearch,
      title: t("landing.features.ocr.title"),
      description: t("landing.features.ocr.description"),
    },
    {
      icon: Users,
      title: t("landing.features.team.title"),
      description: t("landing.features.team.description"),
    },
    {
      icon: BarChart3,
      title: t("landing.features.reports.title"),
      description: t("landing.features.reports.description"),
    },
    {
      icon: Bot,
      title: t("landing.features.chatbot.title"),
      description: t("landing.features.chatbot.description"),
    },
    {
      icon: Receipt,
      title: t("landing.features.categories.title"),
      description: t("landing.features.categories.description"),
    },
    {
      icon: MessageSquare,
      title: t("landing.features.history.title"),
      description: t("landing.features.history.description"),
    },
  ];
}

// ─── Steps ─────────────────────────────────────────────────────────────────────

export function getSteps(t: TFn) {
  return [
    {
      number: "01",
      title: t("landing.howItWorks.step1.title"),
      description: t("landing.howItWorks.step1.description"),
    },
    {
      number: "02",
      title: t("landing.howItWorks.step2.title"),
      description: t("landing.howItWorks.step2.description"),
    },
    {
      number: "03",
      title: t("landing.howItWorks.step3.title"),
      description: t("landing.howItWorks.step3.description"),
    },
    {
      number: "04",
      title: t("landing.howItWorks.step4.title"),
      description: t("landing.howItWorks.step4.description"),
    },
  ];
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

export function getStats(t: TFn) {
  return [
    { value: t("landing.stats.plans.value"), label: t("landing.stats.plans.label") },
    { value: t("landing.stats.speed.value"), label: t("landing.stats.speed.label") },
    { value: t("landing.stats.currency.value"), label: t("landing.stats.currency.label") },
    { value: t("landing.stats.control.value"), label: t("landing.stats.control.label") },
  ];
}
