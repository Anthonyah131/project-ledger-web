"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getFeatures } from "@/data/site-data";
import { useLanguage } from "@/context/language-context";

const AUTOPLAY_INTERVAL = 3500;
const VISIBLE_SIDE = 2;

export function Features() {
  const { t } = useLanguage();
  const features = getFeatures(t);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = features.length;

  const next = useCallback(() => setActive((p) => (p + 1) % total), [total]);
  const prev = useCallback(() => setActive((p) => (p - 1 + total) % total), [total]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, AUTOPLAY_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, paused]);

  function getCardStyle(index: number): React.CSSProperties {
    let delta = index - active;
    if (delta > total / 2) delta -= total;
    if (delta < -total / 2) delta += total;

    const absD = Math.abs(delta);
    const visible = absD <= VISIBLE_SIDE;

    if (!visible) {
      return { opacity: 0, pointerEvents: "none", transform: "translateX(0) scale(0.5) rotateY(0deg)" };
    }

    const translateX = delta * 300;
    const rotateY = delta * -42;
    const scale = delta === 0 ? 1 : Math.max(0.75 - absD * 0.07, 0.62);
    const zIndex = total - absD;
    const opacity = delta === 0 ? 1 : Math.max(0.8 - absD * 0.25, 0.25);

    return {
      transform: `perspective(1200px) translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
      zIndex,
      opacity,
      transition: "all 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      pointerEvents: delta === 0 ? "auto" : "none",
    };
  }

  return (
    <section
      id="features"
      className="overflow-hidden px-6 py-28"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            {t("landing.featuresTitle")}
          </p>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground">
            {t("landing.featuresSubtitle")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("landing.featuresDescription")}
          </p>
        </div>

        {/* Carousel stage */}
        <div className="relative mt-16 flex h-96 items-center justify-center">
          {features.map(({ icon: Icon, title, description }, i) => {
            const isActive = i === active;
            return (
              <button
                key={title}
                type="button"
                aria-label={t("landing.viewFeature", { feature: title })}
                onClick={() => setActive(i)}
                style={getCardStyle(i)}
                className="absolute w-75 cursor-pointer rounded-2xl border bg-card text-left shadow-2xl transition-all"
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
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            type="button"
            aria-label={t("landing.previous")}
            onClick={prev}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
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
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
