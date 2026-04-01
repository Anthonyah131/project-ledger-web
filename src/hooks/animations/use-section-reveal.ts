"use client";

import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  ensureGsapPluginsRegistered,
  getPrefersReducedMotion,
  LANDING_MOTION_PRESETS,
} from "@/lib/animations/gsap";

const gsap = ensureGsapPluginsRegistered();

export interface SectionRevealOptions {
  /**
   * CSS selector for elements to animate. Resolved relative to the container.
   * Default: "[data-lm-reveal]"
   */
  selector?: string;
  /** Y offset for entrance in px. Default: 30. */
  fromY?: number;
  /** Stagger between batch items in seconds. Default: 0.12 */
  stagger?: number;
  /** ScrollTrigger start offset. Default: "top 85%" */
  start?: string;
}

/**
 * Reveals elements matching `selector` inside `containerRef` using
 * ScrollTrigger.batch(). Elements are hidden synchronously (via useLayoutEffect)
 * to prevent FOUC, then fade+slide in when they enter the viewport.
 *
 * Respects prefers-reduced-motion: collapses duration and removes translateY.
 * Cleanup (ScrollTrigger kill + tween revert) runs automatically on unmount.
 */
export function useSectionReveal(
  containerRef: React.RefObject<HTMLElement | null>,
  opts: SectionRevealOptions = {},
) {
  const {
    selector = "[data-lm-reveal]",
    fromY = 30,
    stagger = 0.12,
    start = "top 85%",
  } = opts;

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const elements = Array.from(container.querySelectorAll<HTMLElement>(selector));
      if (!elements.length) return;

      const reduceMotion = getPrefersReducedMotion();
      const dur = reduceMotion
        ? LANDING_MOTION_PRESETS.duration.fast * 0.3
        : LANDING_MOTION_PRESETS.duration.base;
      const y = reduceMotion ? 0 : fromY;
      const staggerAmt = reduceMotion ? 0 : stagger;

      // Hide all targets before paint (useGSAP uses useLayoutEffect internally)
      gsap.set(elements, { opacity: 0, y });

      ScrollTrigger.batch(elements, {
        start,
        onEnter: (batch) => {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: dur,
            stagger: staggerAmt,
            ease: LANDING_MOTION_PRESETS.ease.enter,
            overwrite: true,
          });
        },
        once: true,
      });
    },
    { scope: containerRef },
  );
}
