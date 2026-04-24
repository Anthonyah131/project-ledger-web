"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { getFeatures } from "@/data/site-data";
import { useLanguage } from "@/context/language-context";
import { useSectionReveal } from "@/hooks/animations/use-section-reveal";
import {
  ensureGsapPluginsRegistered,
  getPrefersReducedMotion,
} from "@/lib/animations/gsap";

const gsap = ensureGsapPluginsRegistered();

export function Features() {
  const { t } = useLanguage();
  const features = getFeatures(t);

  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useSectionReveal(sectionRef, {
    selector: "[data-lm-reveal='section-header']",
    stagger: 0.14,
  });

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;

      const reduceMotion = getPrefersReducedMotion();
      if (reduceMotion) return;

      const cards = Array.from(
        track.querySelectorAll<HTMLElement>("[data-feature-card]"),
      );
      if (!cards.length) return;

      const cardWidth = cards[0].offsetWidth;
      const gap = 24;
      const totalWidth = (cardWidth + gap) * cards.length;

      const duration = totalWidth / 60;

      const duplicates = cards.map((card) => card.cloneNode(true) as HTMLElement);
      duplicates.forEach((dup) => track.appendChild(dup));

      gsap.set(track, { x: 0 });

      const tween = gsap.to(track, {
        x: -totalWidth,
        duration,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize((x: number) => x % totalWidth),
        },
      });

      track.parentElement?.addEventListener("mouseenter", () => tween.pause());
      track.parentElement?.addEventListener("mouseleave", () => tween.resume());
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="features"
      ref={sectionRef}
      className="overflow-hidden px-0 py-28"
      data-lm-section="features"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center" data-lm-reveal="section-header">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            {t("landing.featuresTitle")}
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("landing.featuresSubtitle")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("landing.featuresDescription")}
          </p>
        </div>
      </div>

      {/* Full-width marquee */}
      <div
        className="relative mt-16 py-10"
        aria-label={t("landing.featuresSubtitle")}
      >
        <div className="relative">
          <div
            ref={trackRef}
            className="flex gap-6"
            style={{ width: "max-content" }}
          >
            {features.map(({ icon: Icon, title, description }, i) => (
              <FeatureCard
                key={`${title}-${i}`}
                icon={Icon}
                title={title}
                description={description}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div
      data-feature-card
      className="group flex w-72 flex-shrink-0 flex-col rounded-2xl border border-border/50 bg-card/80 p-6 backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-card"
    >
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20 transition-colors group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-primary/30">
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="mb-2 text-base font-semibold text-foreground transition-colors group-hover:text-primary">
        {title}
      </h3>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}