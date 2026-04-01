"use client";

import { useGSAP } from "@gsap/react";

import {
  ensureGsapPluginsRegistered,
  getPrefersReducedMotion,
  LANDING_MOTION_PRESETS,
} from "@/lib/animations/gsap";

const gsap = ensureGsapPluginsRegistered();

/**
 * Sequential entrance timeline for the Hero section.
 * Runs on mount (no scroll trigger):
 *   badge → headline → subtitle → cta-row → social-proof → dashboard-mock → hero-assets
 *
 * Respects prefers-reduced-motion: reverts to an instant opacity reveal.
 * Cleanup runs automatically on unmount via useGSAP.
 */
export function useHeroEntrance(
  containerRef: React.RefObject<HTMLElement | null>,
) {
  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const { duration, ease } = LANDING_MOTION_PRESETS;
      const reduceMotion = getPrefersReducedMotion();

      const targets = [
        "[data-lm-reveal='badge']",
        "[data-lm-reveal='headline']",
        "[data-lm-reveal='subtitle']",
        "[data-lm-reveal='cta-row']",
        "[data-lm-reveal='social-proof']",
        "[data-lm-reveal='dashboard-mock']",
        "[data-lm-reveal='hero-assets']",
      ];

      // Resolve elements within the container to avoid global selector leaks
      const allEls = targets.flatMap((sel) =>
        Array.from(container.querySelectorAll<HTMLElement>(sel)),
      );

      if (!allEls.length) return;

      if (reduceMotion) {
        // Instant reveal — no translate, minimal opacity transition
        gsap.set(allEls, { opacity: 0 });
        gsap.to(allEls, { opacity: 1, duration: 0.1, stagger: 0 });
        return;
      }

      // Hide all targets before paint
      gsap.set(allEls, { opacity: 0, y: 30 });

      // dashboard-mock gets a subtle scale for a "rising" feel
      const dashboardMock = container.querySelector<HTMLElement>(
        "[data-lm-reveal='dashboard-mock']",
      );
      if (dashboardMock) gsap.set(dashboardMock, { scale: 0.97 });

      const resolve = (sel: string) =>
        container.querySelector<HTMLElement>(sel);

      const tl = gsap.timeline({ delay: 0.15 });
      const dur = duration.base;
      const over = 0.35; // overlap between items

      tl.to(resolve("[data-lm-reveal='badge']"), {
        opacity: 1,
        y: 0,
        duration: dur,
        ease: ease.enter,
      })
        .to(
          resolve("[data-lm-reveal='headline']"),
          { opacity: 1, y: 0, duration: dur, ease: ease.enter },
          `-=${over}`,
        )
        .to(
          resolve("[data-lm-reveal='subtitle']"),
          { opacity: 1, y: 0, duration: dur, ease: ease.enter },
          `-=${over}`,
        )
        .to(
          resolve("[data-lm-reveal='cta-row']"),
          { opacity: 1, y: 0, duration: dur, ease: ease.enter },
          `-=${over * 0.8}`,
        )
        .to(
          resolve("[data-lm-reveal='social-proof']"),
          { opacity: 1, y: 0, duration: dur, ease: ease.enter },
          `-=${over * 0.8}`,
        )
        .to(
          resolve("[data-lm-reveal='dashboard-mock']"),
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: duration.slow,
            ease: ease.smooth,
          },
          `-=${over}`,
        )
        .to(
          resolve("[data-lm-reveal='hero-assets']"),
          { opacity: 1, y: 0, duration: dur, ease: ease.enter },
          `-=${duration.slow * 0.5}`,
        );
    },
    { scope: containerRef },
  );
}
