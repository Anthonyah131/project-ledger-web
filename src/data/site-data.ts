// src/data/site-data.ts
// ─── Single source of truth for all site-wide content ──────────────────────────
// Update this file to change branding, links, FAQs, and contact info globally.
// Translatable strings live in src/lib/i18n/locales/*/site.json and landing.json.

import {
  BarChart3,
  Bot,
  Coins,
  CreditCard,
  FileSearch,
  Users,
} from "lucide-react";

type TFn = (key: string) => string

// ─── Site Info ─────────────────────────────────────────────────────────────────

export const siteInfo = {
  name: "Project Ledger",
  year: 2026,
  author: "Anthony",
  authorHandle: "anthonyah131",
  email: "anthonyah131@gmail.com",
  supportEmail: "anthonyah131@gmail.com",
};

// ─── Social Links ──────────────────────────────────────────────────────────────

export const socialLinks = [
  {
    id: "github",
    label: "GitHub",
    href: "https://github.com/anthonyah131",
    icon: "github",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/anthonyah-webdev/",
    icon: "linkedin",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/anthah_131/",
    icon: "instagram",
  },
  {
    id: "email",
    label: "Email",
    href: `mailto:anthonyah131@gmail.com`,
    icon: "mail",
  },
];

// ─── Footer Links ──────────────────────────────────────────────────────────────

export function getFooterLinks(t: TFn) {
  return [
    {
      group: t("site.footer.groups.product"),
      links: [
        { label: t("site.footer.links.features"), href: "/#features" },
        { label: t("site.footer.links.pricing"), href: "/#pricing" },
        { label: t("site.footer.links.howItWorks"), href: "/#how-it-works" },
        { label: t("site.footer.links.help"), href: "/help" },
      ],
    },
    {
      group: t("site.footer.groups.company"),
      links: [
        { label: t("site.footer.links.about"), href: "/#about" },
        { label: t("site.footer.links.githubRepo"), href: "https://github.com/anthonyah131/project-ledger-web", newTab: true },
        { label: t("site.footer.links.contact"), href: `mailto:anthonyah131@gmail.com` },
      ],
    },
    {
      group: t("site.footer.groups.legal"),
      links: [
        { label: t("site.footer.links.privacy"), href: "#" },
        { label: t("site.footer.links.terms"), href: "#" },
        { label: t("site.footer.links.security"), href: "#" },
      ],
    },
  ];
}

// ─── Contact Channels (for Help page quick-actions) ────────────────────────────

export function getContactChannels(t: TFn) {
  return [
    {
      id: "gmail",
      label: t("site.contact.gmail.label"),
      description: t("site.contact.gmail.description"),
      href: `https://mail.google.com/mail/?view=cm&fs=1&to=anthonyah131@gmail.com&su=Soporte%20Project%20Ledger`,
      newTab: true,
      icon: "mail",
      cta: t("site.contact.gmail.cta"),
    },
    {
      id: "github",
      label: t("site.contact.github.label"),
      description: t("site.contact.github.description"),
      href: "https://github.com/anthonyah131/project-ledger-web",
      newTab: true,
      icon: "github",
      cta: t("site.contact.github.cta"),
    },
    {
      id: "linkedin",
      label: t("site.contact.linkedin.label"),
      description: t("site.contact.linkedin.description"),
      href: "https://www.linkedin.com/in/anthonyah-webdev/",
      newTab: true,
      icon: "linkedin",
      cta: t("site.contact.linkedin.cta"),
    },
    {
      id: "instagram",
      label: t("site.contact.instagram.label"),
      description: t("site.contact.instagram.description"),
      href: "https://www.instagram.com/anthah_131/",
      newTab: true,
      icon: "instagram",
      cta: t("site.contact.instagram.cta"),
    },
  ];
}

// ─── Plan Presentation ─────────────────────────────────────────────────────────
// Replaces src/lib/plan-presentation.ts — hardcoded per-slug data, i18n via t().

const PLAN_L_KEYS = ["l1", "l2", "l3", "l4", "l5"] as const;
const PLAN_C_KEYS = ["c1", "c2", "c3", "c4", "c5"] as const;

export function getPlanDescription(
  plan: { slug: string; description?: string | null },
  t: TFn,
): string {
  const description = plan.description?.trim();
  if (description) return description;

  const slug = plan.slug.toLowerCase();
  const key = `billing.plans.${slug}.description`;
  const translated = t(key);
  if (translated === key) return t("billing.plans.default.description");
  return translated;
}

export function getPlanFeatureGroups(
  slug: string,
  t: TFn,
  maxLimitItems = 5,
  maxCapabilityItems = 5,
): { limits: string[]; capabilities: string[] } {
  const prefix = `billing.plans.${slug.toLowerCase()}`;

  const limits = PLAN_L_KEYS
    .map((k) => ({ k, v: t(`${prefix}.${k}`) }))
    .filter(({ k, v }) => v !== `${prefix}.${k}`)
    .map(({ v }) => v)
    .slice(0, maxLimitItems);

  const capabilities = PLAN_C_KEYS
    .map((k) => ({ k, v: t(`${prefix}.${k}`) }))
    .filter(({ k, v }) => v !== `${prefix}.${k}`)
    .map(({ v }) => v)
    .slice(0, maxCapabilityItems);

  return { limits, capabilities };
}

export function getPlanFeatures(slug: string, t: TFn, maxItems = 6): string[] {
  const { limits, capabilities } = getPlanFeatureGroups(slug, t, maxItems, maxItems);
  const features = [...capabilities, ...limits];
  if (features.length === 0) return [t("billing.plans.default.description")];
  return features.slice(0, maxItems);
}

// ─── FAQ Categories ────────────────────────────────────────────────────────────

export function getFaqCategories(t: TFn) {
  return [
    {
      id: "general",
      category: t("site.faq.general.category"),
      icon: "circle-help",
      faqs: [
        { question: t("site.faq.general.q1.question"), answer: t("site.faq.general.q1.answer") },
        { question: t("site.faq.general.q2.question"), answer: t("site.faq.general.q2.answer") },
        { question: t("site.faq.general.q3.question"), answer: t("site.faq.general.q3.answer") },
        { question: t("site.faq.general.q4.question"), answer: t("site.faq.general.q4.answer") },
      ],
    },
    {
      id: "projects",
      category: t("site.faq.projects.category"),
      icon: "folder",
      faqs: [
        { question: t("site.faq.projects.q1.question"), answer: t("site.faq.projects.q1.answer") },
        { question: t("site.faq.projects.q2.question"), answer: t("site.faq.projects.q2.answer") },
        { question: t("site.faq.projects.q3.question"), answer: t("site.faq.projects.q3.answer") },
        { question: t("site.faq.projects.q4.question"), answer: t("site.faq.projects.q4.answer") },
      ],
    },
    {
      id: "billing",
      category: t("site.faq.billing.category"),
      icon: "credit-card",
      faqs: [
        { question: t("site.faq.billing.q1.question"), answer: t("site.faq.billing.q1.answer") },
        { question: t("site.faq.billing.q2.question"), answer: t("site.faq.billing.q2.answer") },
        { question: t("site.faq.billing.q3.question"), answer: t("site.faq.billing.q3.answer") },
      ],
    },
    {
      id: "security",
      category: t("site.faq.security.category"),
      icon: "shield-check",
      faqs: [
        { question: t("site.faq.security.q1.question"), answer: t("site.faq.security.q1.answer") },
        { question: t("site.faq.security.q2.question"), answer: t("site.faq.security.q2.answer") },
        { question: t("site.faq.security.q3.question"), answer: t("site.faq.security.q3.answer") },
      ],
    },
    {
      id: "ai",
      category: t("site.faq.ai.category"),
      icon: "sparkles",
      faqs: [
        { question: t("site.faq.ai.q1.question"), answer: t("site.faq.ai.q1.answer") },
        { question: t("site.faq.ai.q2.question"), answer: t("site.faq.ai.q2.answer") },
      ],
    },
  ];
}

// ─── Landing Features ───────────────────────────────────────────────────────────

export function getFeatures(t: TFn) {
  return [
    {
      icon: Users,
      title: t("landing.features.partners.title"),
      description: t("landing.features.partners.description"),
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
      icon: Coins,
      title: t("landing.features.multiCurrency.title"),
      description: t("landing.features.multiCurrency.description"),
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
  ];
}

// ─── Landing Steps ─────────────────────────────────────────────────────────────

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

// ─── Landing Stats ─────────────────────────────────────────────────────────────

export function getStats(t: TFn) {
  return [
    { value: t("landing.stats.plans.value"), label: t("landing.stats.plans.label") },
    { value: t("landing.stats.speed.value"), label: t("landing.stats.speed.label") },
    { value: t("landing.stats.currency.value"), label: t("landing.stats.currency.label") },
    { value: t("landing.stats.control.value"), label: t("landing.stats.control.label") },
  ];
}
