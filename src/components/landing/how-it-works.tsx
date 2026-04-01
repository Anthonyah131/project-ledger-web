"use client";

import { useRef } from "react";
import { getSteps } from "@/data/site-data";
import { useLanguage } from "@/context/language-context";
import { usePinnedTextNarrative } from "@/hooks/animations/use-pinned-text-narrative";
import { useSectionReveal } from "@/hooks/animations/use-section-reveal";

export function HowItWorks() {
  const { t } = useLanguage();
  const steps = getSteps(t);
  const containerRef = useRef<HTMLElement | null>(null);
  useSectionReveal(containerRef, {
    selector: "[data-lm-reveal='section-header']",
    stagger: 0.13,
  });
  usePinnedTextNarrative(containerRef);

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="bg-muted/30 px-6 py-28"
      data-lm-section="how-it-works"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center" data-lm-reveal="section-header">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            {t("nav.howItWorks")}
          </p>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground">
            {t("landing.howItWorks.title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("landing.howItWorks.subtitle")}
          </p>
        </div>

        <div
          className="mt-16 grid items-start gap-10 lg:grid-cols-[1.1fr_1fr]"
          data-lm-reveal="story-shell"
          data-lm-story="shell"
        >
          <div className="relative rounded-3xl border border-border bg-card/90 p-8 shadow-xl shadow-black/10 backdrop-blur">
            <div className="relative min-h-64 md:min-h-72" data-lm-story="pin">
              {steps.map(({ number, title, description }, index) => (
                <article
                  key={`phase-${number}`}
                  className="absolute inset-0"
                  data-lm-story="phase"
                  data-lm-step-index={String(index)}
                >
                  <p className="text-sm font-semibold text-primary">{t("landing.howItWorks.stepLabel", { number })}</p>
                  <h3 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    {title}
                  </h3>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
                    {description}
                  </p>

                  <div className="mt-8 flex items-center gap-2" aria-hidden="true">
                    {steps.map((item, markerIndex) => (
                      <span
                        key={`phase-dot-${item.number}`}
                        className={`h-1.5 rounded-full bg-primary/40 transition-all ${
                          markerIndex <= index ? "w-7" : "w-3"
                        }`}
                      />
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="relative" data-lm-reveal="steps-grid">
            <div className="absolute bottom-0 left-6 top-0 w-px bg-border/80" aria-hidden="true" />

            <div className="space-y-10">
              {steps.map(({ number, title, description }, index) => (
                <div
                  key={number}
                  className="relative pl-16"
                  data-lm-story="marker"
                  data-lm-step-index={String(index)}
                >
                  <div className="absolute left-0 top-0 flex h-11 w-11 items-center justify-center rounded-xl border border-primary/40 bg-primary/15 text-sm font-bold text-primary shadow-sm shadow-primary/20">
                    {number}
                  </div>
                  <h4 className="text-base font-semibold text-foreground">{title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
