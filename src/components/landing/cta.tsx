"use client";

import { useRef } from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/language-context";
import { useCtaFinale } from "@/hooks/animations/use-cta-finale";

export function CTA() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLElement | null>(null);
  useCtaFinale(containerRef);

  const featurePills = [
    t("billing.features.ocr"),
    t("billing.features.multiCurrency"),
    t("billing.features.teamCollaboration"),
    t("billing.features.reports"),
    t("billing.features.chatbot"),
  ];

  return (
    <section ref={containerRef} className="px-4 py-16 sm:px-6 sm:py-20" data-lm-section="cta">
      <div
        className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-primary/30 bg-primary/10 px-6 py-12 text-center sm:rounded-3xl sm:px-8 sm:py-16"
        data-lm-reveal="cta-shell"
      >
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        </div>

        <div
          className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary ring-1 ring-primary/30"
          data-lm-reveal="cta-icon"
        >
          <Sparkles className="h-6 w-6" />
        </div>

        <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl" data-lm-reveal="cta-title">
          {t("billing.ctaTitle")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground" data-lm-reveal="cta-subtitle">
          {t("landing.ctaSubtitleFull")}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row" data-lm-reveal="cta-actions">
          <Link
            href="/register"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            data-lm-story="cta-primary-btn"
          >
            {t("billing.createFreeAccount")}
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href="#pricing"
            className="inline-flex h-12 items-center rounded-xl px-8 text-sm font-semibold text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            {t("billing.seeAllPlans")}
          </Link>
        </div>

        {/* Feature pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2" data-lm-reveal="cta-pills">
          {featurePills.map((f) => (
            <span
              key={f}
              className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary/80"
              data-lm-reveal="cta-pill"
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
