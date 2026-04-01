"use client";

import { useGSAP } from "@gsap/react";

import {
  ensureGsapPluginsRegistered,
  getPrefersReducedMotion,
  LANDING_MOTION_PRESETS,
} from "@/lib/animations/gsap";

const gsap = ensureGsapPluginsRegistered();

export interface ScrollSheetTransitionOptions {
  /** Selector for the section that should emerge beneath the current one. */
  nextSelector: string;
  /** ScrollTrigger start. Default: "top 75%" */
  start?: string;
  /** ScrollTrigger end. Default: "bottom 20%" */
  end?: string;
}

/**
 * Creates a "sheet/page" transition between two adjacent sections.
 * The current section subtly scales/fades while the next section rises in.
 */
export function useScrollSheetTransition(
  containerRef: React.RefObject<HTMLElement | null>,
  options: ScrollSheetTransitionOptions,
) {
  const { nextSelector, start = "top 75%", end = "bottom 20%" } = options;

  useGSAP(
    () => {
      const current = containerRef.current;
      if (!current) return;

      if (getPrefersReducedMotion()) return;

      const next = document.querySelector<HTMLElement>(nextSelector);
      if (!next) return;

      gsap.set(current, { transformOrigin: "50% 0%" });
      gsap.set(next, { yPercent: 8, autoAlpha: 0.72 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: current,
          start,
          end,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      tl.to(
        current,
        {
          y: -28,
          scale: 0.97,
          autoAlpha: 0.62,
          ease: LANDING_MOTION_PRESETS.ease.linear,
        },
        0,
      ).to(
        next,
        {
          yPercent: 0,
          autoAlpha: 1,
          ease: LANDING_MOTION_PRESETS.ease.linear,
        },
        0,
      );
    },
    { scope: containerRef },
  );
}
