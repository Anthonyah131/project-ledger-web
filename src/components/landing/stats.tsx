"use client";

import { useRef } from "react";
import { getStats } from "@/data/site-data";
import { useLanguage } from "@/context/language-context";
import { useSectionReveal } from "@/hooks/animations/use-section-reveal";
import { useScrollSheetTransition } from "@/hooks/animations/use-scroll-sheet-transition";

export function Stats() {
  const { t } = useLanguage();
  const stats = getStats(t);
  const containerRef = useRef<HTMLElement | null>(null);
  useSectionReveal(containerRef, { stagger: 0.1 });
  useScrollSheetTransition(containerRef, { nextSelector: "[data-lm-section='features']" });

  return (
    <section ref={containerRef} className="border-y border-border bg-muted/30" data-lm-section="stats">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid grid-cols-2 gap-6 text-center sm:gap-8 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} data-lm-reveal="stat-item">
              <p className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                {s.value}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
