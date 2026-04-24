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
 * Sequential entrance timeline for the Hero section.
 * Runs on mount (no scroll trigger):
 *   badge → headline → subtitle → cta-row → social-proof → dashboard-mock → hero-assets
 *
 * After entrance, adds continuous float to dashboard and parallax to glow.
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

      const allEls = targets.flatMap((sel) =>
        Array.from(container.querySelectorAll<HTMLElement>(sel)),
      );

      if (!allEls.length) return;

      const dashboardMock = container.querySelector<HTMLElement>(
        "[data-lm-reveal='dashboard-mock']",
      );
      const heroGlow = container.querySelector<HTMLElement>(
        "[data-lm-story='hero-glow']",
      );

      if (reduceMotion) {
        gsap.set(allEls, { opacity: 0 });
        gsap.to(allEls, { opacity: 1, duration: 0.1, stagger: 0 });
        return;
      }

      gsap.set(allEls, { opacity: 0, y: 30 });
      if (dashboardMock) gsap.set(dashboardMock, { scale: 0.97 });

      const resolve = (sel: string) =>
        container.querySelector<HTMLElement>(sel);

      const tl = gsap.timeline({ delay: 0.15 });
      const dur = duration.base;
      const over = 0.35;

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
        )
        .add(() => {
          if (!dashboardMock) return;

          gsap.to(dashboardMock, {
            y: -10,
            duration: 2.2,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });

          const dashboardSidebar = container.querySelector<HTMLElement>(
            "[data-lm-story='dashboard-sidebar']",
          );
          const dashboardStats = container.querySelector<HTMLElement>(
            "[data-lm-story='dashboard-stats']",
          );
          const dashboardTransactions = container.querySelector<HTMLElement>(
            "[data-lm-story='dashboard-transactions']",
          );
          const dashboardChart = container.querySelector<HTMLElement>(
            "[data-lm-story='dashboard-chart']",
          );

          const innerEls = [dashboardSidebar, dashboardStats, dashboardTransactions, dashboardChart].filter(Boolean) as HTMLElement[];

          if (innerEls.length) {
            gsap.set(innerEls, { opacity: 0, y: 16 });
            gsap.to(innerEls, {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.12,
              ease: "power2.out",
            });
          }
        }, "-=0.2");

      if (heroGlow && dashboardMock) {
        gsap.set(heroGlow, { y: 0 });

        ScrollTrigger.create({
          trigger: container,
          start: "top top",
          end: "bottom top",
          scrub: true,
          onUpdate: (self) => {
            const progress = self.progress;
            gsap.set(heroGlow, {
              y: progress * 60,
              opacity: 1 - progress * 0.7,
            });
          },
        });
      }
    },
    { scope: containerRef },
  );
}
