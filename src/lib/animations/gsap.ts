import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const LANDING_MOTION_PRESETS = {
  duration: {
    fast: 0.35,
    base: 0.6,
    slow: 0.9,
  },
  ease: {
    enter: "power3.out",
    exit: "power2.in",
    smooth: "power2.inOut",
    linear: "none",
  },
} as const;

export type LandingMotionConditions = {
  isDesktop: boolean;
  isTablet: boolean;
  isMobile: boolean;
  reduceMotion: boolean;
};

export const LANDING_MEDIA_QUERIES = {
  isDesktop: "(min-width: 1024px)",
  isTablet: "(min-width: 768px) and (max-width: 1023px)",
  isMobile: "(max-width: 767px)",
  reduceMotion: "(prefers-reduced-motion: reduce)",
} as const;

let pluginsRegistered = false;

export function ensureGsapPluginsRegistered() {
  if (!pluginsRegistered) {
    gsap.registerPlugin(useGSAP, ScrollTrigger);
    pluginsRegistered = true;
  }

  return gsap;
}

export function getPrefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function addLandingMotionConditions(
  mm: gsap.MatchMedia,
  setup: (conditions: LandingMotionConditions) => void | (() => void),
) {
  return mm.add(LANDING_MEDIA_QUERIES, (context) => {
    const conditions = context.conditions as LandingMotionConditions;
    return setup(conditions);
  });
}
