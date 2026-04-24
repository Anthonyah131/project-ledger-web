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
      const progressLineFill = container.querySelector<HTMLElement>("[data-lm-story='progress-line-fill']");
      const phases = Array.from(
        container.querySelectorAll<HTMLElement>("[data-lm-story='phase']"),
      );
      const markers = Array.from(
        container.querySelectorAll<HTMLElement>("[data-lm-story='marker']"),
      );

      if (!shell || !panel || !phases.length || !markers.length) return;

      const reduceMotion = getPrefersReducedMotion();

      gsap.set(phases, {
        autoAlpha: 0,
        y: reduceMotion ? 0 : 28,
        scale: 0.94,
        rotateY: 6,
        filter: "blur(3px)",
      });
      gsap.set(phases[0], {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        rotateY: 0,
        filter: "blur(0px)",
      });
      gsap.set(markers, { autoAlpha: 0.52, x: 0 });
      gsap.set(markers[0], { autoAlpha: 1, x: 8 });

      if (reduceMotion) return;

      let breathingTween: gsap.core.Tween | null = null;
      let activePhaseIndex = 0;

      const startBreathing = (phaseEl: HTMLElement) => {
        if (breathingTween) breathingTween.kill();
        breathingTween = gsap.to(phaseEl, {
          scale: 1.018,
          duration: 1.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      };

      const stopBreathing = () => {
        if (breathingTween) {
          breathingTween.kill();
          breathingTween = null;
        }
      };

      const stepCount = phases.length;
      const phaseWeights = phases.map((_, index) => (index === stepCount - 1 ? 1.6 : 1));
      const totalPhaseWeight = phaseWeights.reduce((sum, weight) => sum + weight, 0);
      const phaseStarts = phaseWeights.map((_, index) => {
        const precedingWeight = phaseWeights
          .slice(0, index)
          .reduce((sum, weight) => sum + weight, 0);

        return precedingWeight / totalPhaseWeight;
      });
      const phaseEnds = phaseWeights.map((weight, index) => {
        return phaseStarts[index] + weight / totalPhaseWeight;
      });

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
            gsap.set(phase, {
              autoAlpha: index === 0 ? 1 : 0,
              y: index === 0 ? 0 : 28,
              scale: index === 0 ? 1 : 0.94,
              rotateY: index === 0 ? 0 : 6,
              filter: index === 0 ? "blur(0px)" : "blur(3px)",
            });
          });

          markers.forEach((marker, index) => {
            gsap.set(marker, {
              autoAlpha: index === 0 ? 1 : 0.52,
              x: index === 0 ? 8 : 0,
              y: index === 0 ? -2 : 0,
              scale: index === 0 ? 1 : 0.97,
            });
          });

          activePhaseIndex = 0;
          startBreathing(phases[0]);
          if (progressLineFill) progressLineFill.style.height = "0%";

          return;
        }

        const clampedProgress = gsap.utils.clamp(0, 1, progress);

        if (clampedProgress >= 0.999) {
          phases.forEach((phase, index) => {
            if (index === stepCount - 1) {
              gsap.set(phase, {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                rotateY: 0,
                filter: "blur(0px)",
              });
              return;
            }
            gsap.set(phase, {
              autoAlpha: 0,
              y: 28,
              scale: 0.94,
              rotateY: 6,
              filter: "blur(3px)",
            });
          });

          markers.forEach((marker, index) => {
            if (index === stepCount - 1) {
              gsap.set(marker, { autoAlpha: 1, x: 8, y: -2, scale: 1 });
              return;
            }
            gsap.set(marker, { autoAlpha: 0.52, x: 0, y: 0, scale: 0.97 });
          });

          if (activePhaseIndex !== stepCount - 1) {
            activePhaseIndex = stepCount - 1;
            stopBreathing();
            startBreathing(phases[stepCount - 1]);
          }
          if (progressLineFill) progressLineFill.style.height = "100%";

          return;
        }

        const currentIndex = phaseStarts.findIndex((start, index) => {
          return clampedProgress >= start && clampedProgress < phaseEnds[index];
        });
        const safeCurrentIndex = currentIndex === -1 ? stepCount - 1 : currentIndex;
        const currentStart = phaseStarts[safeCurrentIndex];
        const currentEnd = phaseEnds[safeCurrentIndex];
        const currentSpan = Math.max(currentEnd - currentStart, 0.0001);
        const nextIndex = Math.min(stepCount - 1, safeCurrentIndex + 1);
        const mix = (clampedProgress - currentStart) / currentSpan;
        const transitionWindow = 0.22;
        const transitionStart = 1 - transitionWindow;
        const hasNextPhase = safeCurrentIndex < stepCount - 1;
        const inTransition = hasNextPhase && mix >= transitionStart;
        const localMix = inTransition
          ? (mix - transitionStart) / transitionWindow
          : 0;

        phases.forEach((phase, index) => {
          if (index === safeCurrentIndex) {
            gsap.set(phase, {
              autoAlpha: inTransition ? 1 - localMix * 0.5 : 1,
              y: inTransition ? -20 * localMix : 0,
              scale: inTransition ? 1 - localMix * 0.06 : 1,
              rotateY: inTransition ? -5 * localMix : 0,
              filter: inTransition ? `blur(${localMix * 2}px)` : "blur(0px)",
            });
            return;
          }

          if (index === nextIndex) {
            gsap.set(phase, {
              autoAlpha: inTransition ? localMix : 0,
              y: inTransition ? 28 - 28 * localMix : 28,
              scale: inTransition ? 0.94 + localMix * 0.06 : 0.94,
              rotateY: inTransition ? 6 - 11 * localMix : 6,
              filter: inTransition ? `blur(${3 - 3 * localMix}px)` : "blur(3px)",
            });
            return;
          }

          gsap.set(phase, {
            autoAlpha: 0,
            y: 28,
            scale: 0.94,
            rotateY: 6,
            filter: "blur(3px)",
          });
        });

        markers.forEach((marker, index) => {
          if (index === safeCurrentIndex) {
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

        if (activePhaseIndex !== safeCurrentIndex && !inTransition) {
          activePhaseIndex = safeCurrentIndex;
          stopBreathing();
          startBreathing(phases[safeCurrentIndex]);
        }

        if (progressLineFill) {
          const totalSteps = stepCount - 1;
          const stepProgress = safeCurrentIndex / totalSteps;
          const transitionProgress = inTransition ? localMix / totalSteps : 0;
          const lineProgress = Math.min(100, (stepProgress + transitionProgress) * 100);
          progressLineFill.style.height = `${lineProgress}%`;
        }
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

      startBreathing(phases[0]);
    },
    { scope: containerRef },
  );
}
