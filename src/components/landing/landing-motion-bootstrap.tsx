"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import {
  ensureGsapPluginsRegistered,
  getPrefersReducedMotion,
  LANDING_MOTION_PRESETS,
} from "@/lib/animations/gsap";

const gsap = ensureGsapPluginsRegistered();

export function LandingMotionBootstrap() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useGSAP(() => {
    const html = document.documentElement;
    const previousDefaults = { ...gsap.defaults() };

    gsap.defaults({
      ...previousDefaults,
      duration: LANDING_MOTION_PRESETS.duration.base,
      ease: LANDING_MOTION_PRESETS.ease.enter,
      overwrite: "auto",
    });

    const syncMotionPreference = () => {
      html.dataset.landingMotion = getPrefersReducedMotion() ? "reduced" : "full";
    };

    const reduceMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    syncMotionPreference();
    reduceMotionMedia.addEventListener("change", syncMotionPreference);

    return () => {
      reduceMotionMedia.removeEventListener("change", syncMotionPreference);
      delete html.dataset.landingMotion;
      gsap.defaults(previousDefaults);
    };
  }, { scope: rootRef });

  return <div ref={rootRef} className="contents" data-lm-root />;
}
