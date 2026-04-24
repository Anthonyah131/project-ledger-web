"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getFeatures } from "@/data/site-data";
import { useLanguage } from "@/context/language-context";
import { useSectionReveal } from "@/hooks/animations/use-section-reveal";
import {
  ensureGsapPluginsRegistered,
  getPrefersReducedMotion,
  LANDING_MOTION_PRESETS,
} from "@/lib/animations/gsap";

const AUTOPLAY_INTERVAL = 3500;
const VISIBLE_SIDE = 2;
const DESKTOP_CARD_OFFSET = 300;
const MOBILE_CARD_OFFSET = 220;

const gsap = ensureGsapPluginsRegistered();

export function Features() {
  const { t } = useLanguage();
  const features = getFeatures(t);

  const [active, setActive] = useState(0);
  const [pausedByInteraction, setPausedByInteraction] = useState(false);
  const [isDocumentHidden, setIsDocumentHidden] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const total = features.length;
  const reducedMotion = getPrefersReducedMotion();
  const autoplayBlocked = pausedByInteraction || isDocumentHidden;

  // Animate only section-header and carousel-stage; exclude feature-card
  // because the carousel manages those elements' opacity internally.
  useSectionReveal(sectionRef, {
    selector: "[data-lm-reveal='section-header'], [data-lm-reveal='carousel-stage']",
    stagger: 0.14,
  });

  const next = useCallback(() => setActive((p) => (p + 1) % total), [total]);
  const prev = useCallback(() => setActive((p) => (p - 1 + total) % total), [total]);

  const setCardRef = useCallback((index: number, node: HTMLButtonElement | null) => {
    cardRefs.current[index] = node;
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => setIsDocumentHidden(document.hidden);

    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (autoplayBlocked) return;
    timerRef.current = setInterval(next, AUTOPLAY_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoplayBlocked, next]);

  useGSAP(
    () => {
      const cards = cardRefs.current.filter(Boolean);
      if (!cards.length) return;

      const xOffset = window.innerWidth < 768 ? MOBILE_CARD_OFFSET : DESKTOP_CARD_OFFSET;
      const duration = reducedMotion
        ? LANDING_MOTION_PRESETS.duration.fast * 0.65
        : LANDING_MOTION_PRESETS.duration.base;

      cards.forEach((card, index) => {
        if (!card) return;

        let delta = index - active;
        if (delta > total / 2) delta -= total;
        if (delta < -total / 2) delta += total;

        const absDelta = Math.abs(delta);
        const visible = absDelta <= VISIBLE_SIDE;

        if (!visible) {
          gsap.to(card, {
            duration,
            autoAlpha: 0,
            x: 0,
            scale: 0.58,
            rotateY: 0,
            zIndex: 0,
            pointerEvents: "none",
            ease: LANDING_MOTION_PRESETS.ease.smooth,
            overwrite: true,
          });
          return;
        }

        const scale = delta === 0 ? 1 : Math.max(0.78 - absDelta * 0.08, 0.62);
        const opacity = delta === 0 ? 1 : Math.max(0.84 - absDelta * 0.26, 0.25);

        gsap.to(card, {
          duration,
          x: delta * xOffset,
          scale,
          rotateY: reducedMotion ? 0 : delta * -38,
          autoAlpha: opacity,
          zIndex: total - absDelta,
          pointerEvents: delta === 0 ? "auto" : "none",
          force3D: true,
          ease: LANDING_MOTION_PRESETS.ease.smooth,
          overwrite: true,
        });
      });
    },
    { dependencies: [active, reducedMotion, total], scope: stageRef },
  );

  function handleSectionBlur(event: React.FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setPausedByInteraction(false);
    }
  }

  function handleSectionKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      prev();
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setActive(total - 1);
    }
  }

  return (
    <section
      id="features"
      ref={sectionRef}
      className="overflow-hidden px-6 py-28"
      data-lm-section="features"
      onMouseEnter={() => setPausedByInteraction(true)}
      onMouseLeave={() => setPausedByInteraction(false)}
      onFocusCapture={() => setPausedByInteraction(true)}
      onBlurCapture={handleSectionBlur}
      onKeyDown={handleSectionKeyDown}
      aria-label={t("landing.featuresTitle")}
    >
      <div className="mx-auto max-w-7xl">
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

        {/* Carousel stage */}
        <div
          ref={stageRef}
          className="relative mt-12 flex h-80 items-center justify-center sm:mt-16 sm:h-96"
          data-lm-reveal="carousel-stage"
          role="group"
          aria-roledescription="carousel"
          aria-label={t("landing.featuresSubtitle")}
        >
          {features.map(({ icon: Icon, title, description }, i) => {
            const isActive = i === active;
            return (
              <button
                key={title}
                ref={(node) => setCardRef(i, node)}
                type="button"
                aria-label={t("landing.viewFeature", { feature: title })}
                aria-current={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActive(i)}
                style={{ transform: "translate3d(0, 0, 0)", opacity: 0 }}
                data-lm-reveal="feature-card"
                className="absolute w-[300px] cursor-pointer rounded-2xl border bg-card text-left shadow-2xl outline-none will-change-transform focus-visible:ring-2 focus-visible:ring-primary/50 sm:w-75"
              >
                {/* Card gradient top accent */}
                <div className={`h-1.5 w-full rounded-t-2xl ${isActive ? "bg-primary" : "bg-border"}`} />

                <div className="p-7">
                  {/* Icon */}
                  <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ring-1 transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground ring-primary/30 shadow-lg shadow-primary/30"
                      : "bg-primary/10 text-primary ring-primary/20"
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Title */}
                  <h3 className={`mb-3 text-base font-semibold leading-snug transition-colors ${
                    isActive ? "text-primary" : "text-foreground"
                  }`}>
                    {title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Controls */}
        <div className="mt-10 flex items-center justify-center gap-4" data-lm-reveal="carousel-controls">
          <button
            type="button"
            aria-label={t("landing.previous")}
            onClick={prev}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Dots */}
          <div className="flex gap-1.5">
            {features.map((f, i) => (
              <button
                key={f.title}
                type="button"
                aria-label={t("landing.goToFeature", { feature: f.title })}
                aria-current={i === active}
                onClick={() => setActive(i)}
                className={`h-2 rounded-full transition-all ${
                  i === active ? "w-6 bg-primary" : "w-2 bg-border hover:bg-primary/40"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label={t("landing.next")}
            onClick={next}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <p className="sr-only" aria-live="polite">
          {t("landing.viewFeature", { feature: features[active]?.title ?? "" })}
        </p>
      </div>
    </section>
  );
}
