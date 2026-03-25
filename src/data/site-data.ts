// src/data/site-data.ts
// ─── Single source of truth for all site-wide content ──────────────────────────
// Update this file to change branding, links, FAQs, and contact info globally.
// Translatable strings live in src/lib/i18n/locales/*/site.json.

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
    href: "https://www.linkedin.com/in/anthonyah131",
    icon: "linkedin",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/anthonyah131",
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
      href: "https://www.linkedin.com/in/anthonyah131",
      newTab: true,
      icon: "linkedin",
      cta: t("site.contact.linkedin.cta"),
    },
    {
      id: "instagram",
      label: t("site.contact.instagram.label"),
      description: t("site.contact.instagram.description"),
      href: "https://www.instagram.com/anthonyah131",
      newTab: true,
      icon: "instagram",
      cta: t("site.contact.instagram.cta"),
    },
  ];
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
