"use client";

import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  ensureGsapPluginsRegistered,
  getPrefersReducedMotion,
} from "@/lib/animations/gsap";

const gsap = ensureGsapPluginsRegistered();

interface CounterItem {
  value: string;
  label: string;
}

interface UseCounterAnimationOptions {
  containerRef?: React.RefObject<HTMLElement | null>;
  selector?: string;
}

export function useCounterAnimation(
  containerRef: React.RefObject<HTMLElement | null>,
  items: CounterItem[],
  opts: UseCounterAnimationOptions = {},
) {
  const { selector = "[data-lm-reveal='stat-item']" } = opts;

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const reduceMotion = getPrefersReducedMotion();
      const statEls = Array.from(
        container.querySelectorAll<HTMLElement>(selector),
      );

      if (!statEls.length || statEls.length !== items.length) return;

      if (reduceMotion) return;

      const parseNumericValue = (str: string): number => {
        const cleaned = str.replace(/[^0-9.-]/g, "");
        return cleaned ? parseFloat(cleaned) : 0;
      };

      const getPrefix = (str: string): string => {
        const match = str.match(/^[^0-9-]*/);
        return match ? match[0] : "";
      };

      const getSuffix = (str: string): string => {
        const match = str.match(/[^0-9.-]+$/);
        return match ? match[0] : "";
      };

      ScrollTrigger.create({
        trigger: container,
        start: "top 80%",
        once: true,
        onEnter: () => {
          items.forEach((item, index) => {
            const el = statEls[index];
            if (!el) return;

            const numericValue = parseNumericValue(item.value);
            const prefix = getPrefix(item.value);
            const suffix = getSuffix(item.value);
            const decimals = item.value.includes(".")
              ? item.value.split(".")[1].replace(/[^0-9]/g, "").length
              : 0;

            const valueEl = el.querySelector("p:first-child");
            if (!valueEl) return;

            const obj = { val: 0 };

            gsap.to(obj, {
              val: numericValue,
              duration: 1.8,
              ease: "power2.out",
              onUpdate: () => {
                const formatted = decimals > 0
                  ? obj.val.toFixed(decimals)
                  : Math.round(obj.val).toLocaleString();
                valueEl.textContent = `${prefix}${formatted}${suffix}`;
              },
              onComplete: () => {
                const formatted = decimals > 0
                  ? numericValue.toFixed(decimals)
                  : Math.round(numericValue).toLocaleString();
                valueEl.textContent = `${prefix}${formatted}${suffix}`;
              },
            });
          });
        },
      });
    },
    { scope: containerRef },
  );
}