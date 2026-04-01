"use client";

import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  ensureGsapPluginsRegistered,
  getPrefersReducedMotion,
} from "@/lib/animations/gsap";

const gsap = ensureGsapPluginsRegistered();

/**
 * Pins a narrative panel and crossfades phases as matching step markers advance.
 * Expected structure inside `containerRef`:
 * - [data-lm-story='pin']
 * - [data-lm-story='phase'][data-lm-step-index='N']
 * - [data-lm-story='marker'][data-lm-step-index='N']
 */
export function usePinnedTextNarrative(
  containerRef: React.RefObject<HTMLElement | null>,
) {
  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const shell = container.querySelector<HTMLElement>("[data-lm-story='shell']");
      const panel = container.querySelector<HTMLElement>("[data-lm-story='pin']");
      const phases = Array.from(
        container.querySelectorAll<HTMLElement>("[data-lm-story='phase']"),
      );
      const markers = Array.from(
        container.querySelectorAll<HTMLElement>("[data-lm-story='marker']"),
      );

      if (!shell || !panel || !phases.length || !markers.length) return;

      const reduceMotion = getPrefersReducedMotion();

      gsap.set(phases, { autoAlpha: 0, y: reduceMotion ? 0 : 24 });
      gsap.set(phases[0], { autoAlpha: 1, y: 0 });
      gsap.set(markers, { autoAlpha: 0.52, x: 0 });
      gsap.set(markers[0], { autoAlpha: 1, x: 8 });

      if (reduceMotion) return;

      const stepCount = phases.length;

      const getViewportTier = () => {
        if (window.matchMedia("(min-width: 1024px)").matches) return "desktop" as const;
        if (window.matchMedia("(min-width: 768px)").matches) return "tablet" as const;
        return "mobile" as const;
      };

      const getPinDistance = () => {
        const tier = getViewportTier();

        if (tier === "desktop") {
          return Math.max(1400, stepCount * 720);
        }

        if (tier === "tablet") {
          return Math.max(1080, stepCount * 560);
        }

        return Math.max(820, stepCount * 440);
      };

      const getPinStartOffset = () => {
        const tier = getViewportTier();
        if (tier === "desktop") return 108;
        if (tier === "tablet") return 96;
        return 82;
      };

      const getScrubAmount = () => {
        const tier = getViewportTier();
        if (tier === "desktop") return 1.05;
        if (tier === "tablet") return 0.92;
        return 0.82;
      };

      const blendNarrative = (progress: number) => {
        if (stepCount === 1) return;

        if (!Number.isFinite(progress)) {
          phases.forEach((phase, index) => {
            gsap.set(phase, { autoAlpha: index === 0 ? 1 : 0, y: index === 0 ? 0 : 24 });
          });

          markers.forEach((marker, index) => {
            gsap.set(marker, {
              autoAlpha: index === 0 ? 1 : 0.52,
              x: index === 0 ? 8 : 0,
              y: index === 0 ? -2 : 0,
              scale: index === 0 ? 1 : 0.97,
            });
          });

          return;
        }

        const clampedProgress = gsap.utils.clamp(0, 1, progress);

        if (clampedProgress >= 0.999) {
          phases.forEach((phase, index) => {
            if (index === stepCount - 1) {
              gsap.set(phase, { autoAlpha: 1, y: 0 });
              return;
            }
            gsap.set(phase, { autoAlpha: 0, y: 24 });
          });

          markers.forEach((marker, index) => {
            if (index === stepCount - 1) {
              gsap.set(marker, { autoAlpha: 1, x: 8, y: -2, scale: 1 });
              return;
            }
            gsap.set(marker, { autoAlpha: 0.52, x: 0, y: 0, scale: 0.97 });
          });

          return;
        }

        const segment = clampedProgress * (stepCount - 1);
        const currentIndex = Math.floor(segment);
        const nextIndex = Math.min(stepCount - 1, currentIndex + 1);
        const mix = segment - currentIndex;
        const transitionWindow = 0.2;
        const transitionStart = 1 - transitionWindow;
        const inTransition = mix >= transitionStart;
        const localMix = inTransition
          ? (mix - transitionStart) / transitionWindow
          : 0;

        phases.forEach((phase, index) => {
          if (index === currentIndex) {
            gsap.set(phase, {
              autoAlpha: inTransition ? 1 - localMix : 1,
              y: inTransition ? -16 * localMix : 0,
            });
            return;
          }

          if (index === nextIndex) {
            gsap.set(phase, {
              autoAlpha: inTransition ? localMix : 0,
              y: inTransition ? 24 - 24 * localMix : 24,
            });
            return;
          }

          gsap.set(phase, { autoAlpha: 0, y: 24 });
        });

        markers.forEach((marker, index) => {
          if (index === currentIndex) {
            gsap.set(marker, {
              autoAlpha: inTransition ? 1 - localMix * 0.48 : 1,
              x: inTransition ? 8 - 8 * localMix : 8,
              y: inTransition ? -2 + 2 * localMix : -2,
              scale: inTransition ? 1 - localMix * 0.03 : 1,
            });
            return;
          }

          if (index === nextIndex) {
            gsap.set(marker, {
              autoAlpha: inTransition ? 0.52 + localMix * 0.48 : 0.52,
              x: inTransition ? 8 * localMix : 0,
              y: inTransition ? -2 * localMix : 0,
              scale: inTransition ? 0.97 + localMix * 0.03 : 0.97,
            });
            return;
          }

          gsap.set(marker, { autoAlpha: 0.52, x: 0, y: 0, scale: 0.97 });
        });
      };

      ScrollTrigger.create({
        trigger: shell,
        start: () => `top top+=${getPinStartOffset()}`,
        end: () => `+=${getPinDistance()}`,
        scrub: getScrubAmount(),
        pin: shell,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          blendNarrative(self.progress);
        },
        onUpdate: (self) => {
          blendNarrative(self.progress);
        },
      });
    },
    { scope: containerRef },
  );
}
