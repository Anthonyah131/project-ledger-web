"use client";

import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  ensureGsapPluginsRegistered,
  getPrefersReducedMotion,
  LANDING_MOTION_PRESETS,
} from "@/lib/animations/gsap";

const gsap = ensureGsapPluginsRegistered();

/**
 * CTA close-out timeline with subtle emphasis for actions and pills.
 * Triggered once when the section enters the viewport.
 */
export function useCtaFinale(
  containerRef: React.RefObject<HTMLElement | null>,
) {
  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const shell = container.querySelector<HTMLElement>("[data-lm-reveal='cta-shell']");
      const icon = container.querySelector<HTMLElement>("[data-lm-reveal='cta-icon']");
      const title = container.querySelector<HTMLElement>("[data-lm-reveal='cta-title']");
      const subtitle = container.querySelector<HTMLElement>("[data-lm-reveal='cta-subtitle']");
      const actions = container.querySelector<HTMLElement>("[data-lm-reveal='cta-actions']");
      const pills = Array.from(container.querySelectorAll<HTMLElement>("[data-lm-reveal='cta-pill']"));

      if (!shell) return;

      const reduceMotion = getPrefersReducedMotion();

      if (reduceMotion) {
        gsap.set([shell, icon, title, subtitle, actions, ...pills], { opacity: 1, y: 0, scale: 1 });
        return;
      }

      gsap.set(shell, { opacity: 0, y: 30, scale: 0.98 });
      gsap.set([icon, title, subtitle, actions], { opacity: 0, y: 22 });
      gsap.set(pills, { opacity: 0, y: 14 });

      ScrollTrigger.create({
        trigger: container,
        start: "top 82%",
        once: true,
        onEnter: () => {
          const tl = gsap.timeline({ defaults: { ease: LANDING_MOTION_PRESETS.ease.enter } });

          tl.to(shell, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: LANDING_MOTION_PRESETS.duration.base,
          })
            .to(icon, { opacity: 1, y: 0, duration: LANDING_MOTION_PRESETS.duration.fast }, "-=0.4")
            .to(title, { opacity: 1, y: 0, duration: LANDING_MOTION_PRESETS.duration.fast }, "-=0.25")
            .to(subtitle, { opacity: 1, y: 0, duration: LANDING_MOTION_PRESETS.duration.fast }, "-=0.2")
            .to(actions, { opacity: 1, y: 0, duration: LANDING_MOTION_PRESETS.duration.fast }, "-=0.2")
            .to(
              pills,
              {
                opacity: 1,
                y: 0,
                stagger: 0.05,
                duration: LANDING_MOTION_PRESETS.duration.fast,
              },
              "-=0.12",
            )
            .add(() => {
              const primaryBtn = container.querySelector<HTMLElement>(
                "[data-lm-story='cta-primary-btn']",
              );
              if (!primaryBtn || reduceMotion) return;

              gsap.to(primaryBtn, {
                boxShadow: "0 0 30px 8px rgba(255, 255, 255, 0.15)",
                duration: 1.2,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
              });
            }, "-=0.4");
        },
      });
    },
    { scope: containerRef },
  );
}