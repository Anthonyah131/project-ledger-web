"use client";

// src/views/help/help-page-client.tsx

import {
  Github,
  Instagram,
  Linkedin,
  Mail,
  CircleHelp,
  Folder,
  CreditCard,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  MessageCircleQuestion,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AppFooter } from "@/components/shared/app-footer";
import { getContactChannels, getFaqCategories, siteInfo } from "@/data/site-data";
import { useLanguage } from "@/context/language-context";

// ─── Icon map ──────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  mail: Mail,
  github: Github,
  linkedin: Linkedin,
  instagram: Instagram,
  "circle-help": CircleHelp,
  folder: Folder,
  "credit-card": CreditCard,
  "shield-check": ShieldCheck,
  sparkles: Sparkles,
};

// ─── Contact card accent colors ────────────────────────────────────────────────

const CHANNEL_STYLES: Record<string, { bg: string; icon: string; border: string }> = {
  gmail: {
    bg: "bg-red-50 dark:bg-red-950/30",
    icon: "text-red-500",
    border: "border-red-200 dark:border-red-800",
  },
  github: {
    bg: "bg-zinc-50 dark:bg-zinc-900/50",
    icon: "text-zinc-700 dark:text-zinc-300",
    border: "border-zinc-200 dark:border-zinc-700",
  },
  linkedin: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    icon: "text-blue-600",
    border: "border-blue-200 dark:border-blue-800",
  },
  instagram: {
    bg: "bg-pink-50 dark:bg-pink-950/30",
    icon: "text-pink-500",
    border: "border-pink-200 dark:border-pink-800",
  },
};

// ─── Component ─────────────────────────────────────────────────────────────────

export function HelpPageClient() {
  const { t } = useLanguage();
  const contactChannels = getContactChannels(t);
  const faqCategories = getFaqCategories(t);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-xl border border-border bg-linear-to-br from-primary/5 via-background to-background px-6 py-12 mb-8">
        {/* decorative circle */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-primary/8 blur-2xl" />

        <div className="relative flex items-start gap-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
            <MessageCircleQuestion className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t("help.title")}
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {t("help.heroText", { name: siteInfo.name })}
            </p>
          </div>
        </div>
      </section>

      {/* ── Contact Channels ──────────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-base font-semibold text-foreground">
          {t("help.contactUs")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {contactChannels.map((ch) => {
            const Icon = ICON_MAP[ch.icon] ?? Mail;
            const style = CHANNEL_STYLES[ch.id] ?? {
              bg: "bg-muted/40",
              icon: "text-foreground",
              border: "border-border",
            };

            return (
              <a
                key={ch.id}
                href={ch.href}
                target={ch.newTab ? "_blank" : undefined}
                rel="noopener noreferrer"
                className={`group flex flex-col gap-3 rounded-xl border p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${style.bg} ${style.border}`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-background shadow-sm ${style.border} border`}>
                  <Icon className={`h-5 w-5 ${style.icon}`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">
                    {ch.label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                    {ch.description}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-medium ${style.icon} group-hover:gap-1.5 transition-all`}>
                  {ch.cta}
                  <ExternalLink className="h-3 w-3" />
                </span>
              </a>
            );
          })}
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="flex-1">
        <h2 className="mb-6 text-base font-semibold text-foreground">
          {t("help.faq")}
        </h2>

        <div className="space-y-6">
          {faqCategories.map((cat) => {
            const CatIcon = ICON_MAP[cat.icon] ?? CircleHelp;

            return (
              <div
                key={cat.id}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                {/* Category header */}
                <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-5 py-3.5">
                  <CatIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    {cat.category}
                  </span>
                  <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {cat.faqs.length} {t("help.questions")}
                  </span>
                </div>

                {/* Accordion */}
                <Accordion type="multiple" className="px-1">
                  {cat.faqs.map((faq, idx) => (
                    <AccordionItem
                      key={idx}
                      value={`${cat.id}-${idx}`}
                      className="border-border px-4"
                    >
                      <AccordionTrigger className="text-left text-sm font-medium hover:no-underline py-4">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div className="mt-16 -mx-4 lg:-mx-6">
        <AppFooter />
      </div>
    </div>
  );
}
