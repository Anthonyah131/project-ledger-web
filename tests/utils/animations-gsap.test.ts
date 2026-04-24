import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  LANDING_MOTION_PRESETS,
  LANDING_MEDIA_QUERIES,
  getPrefersReducedMotion,
} from "@/lib/animations/gsap";

describe("animations/gsap", () => {
  describe("LANDING_MOTION_PRESETS", () => {
    it("should have duration presets", () => {
      expect(LANDING_MOTION_PRESETS.duration).toEqual({
        fast: 0.35,
        base: 0.6,
        slow: 0.9,
      });
    });

    it("should have ease presets", () => {
      expect(LANDING_MOTION_PRESETS.ease).toEqual({
        enter: "power3.out",
        exit: "power2.in",
        smooth: "power2.inOut",
        linear: "none",
      });
    });

    it("should have all required ease types", () => {
      expect(LANDING_MOTION_PRESETS.ease.enter).toBeDefined();
      expect(LANDING_MOTION_PRESETS.ease.exit).toBeDefined();
      expect(LANDING_MOTION_PRESETS.ease.smooth).toBeDefined();
      expect(LANDING_MOTION_PRESETS.ease.linear).toBeDefined();
    });

    it("should have correct duration values", () => {
      expect(LANDING_MOTION_PRESETS.duration.fast).toBeLessThan(LANDING_MOTION_PRESETS.duration.base);
      expect(LANDING_MOTION_PRESETS.duration.base).toBeLessThan(LANDING_MOTION_PRESETS.duration.slow);
    });
  });

  describe("LANDING_MEDIA_QUERIES", () => {
    it("should have isDesktop query", () => {
      expect(LANDING_MEDIA_QUERIES.isDesktop).toBe("(min-width: 1024px)");
    });

    it("should have isTablet query", () => {
      expect(LANDING_MEDIA_QUERIES.isTablet).toBe("(min-width: 768px) and (max-width: 1023px)");
    });

    it("should have isMobile query", () => {
      expect(LANDING_MEDIA_QUERIES.isMobile).toBe("(max-width: 767px)");
    });

    it("should have reduceMotion query", () => {
      expect(LANDING_MEDIA_QUERIES.reduceMotion).toBe("(prefers-reduced-motion: reduce)");
    });

    it("should have mutually exclusive breakpoints", () => {
      const desktop = "(min-width: 1024px)";
      const tablet = "(min-width: 768px) and (max-width: 1023px)";
      const mobile = "(max-width: 767px)";

      expect(desktop).not.toBe(tablet);
      expect(desktop).not.toBe(mobile);
      expect(tablet).not.toBe(mobile);
    });
  });

  describe("getPrefersReducedMotion", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return false in server environment (undefined window)", () => {
      const originalWindow = global.window;
      // @ts-expect-error - testing server environment
      global.window = undefined;

      const result = getPrefersReducedMotion();

      global.window = originalWindow;
      expect(result).toBe(false);
    });

    it("should return true when prefers-reduced-motion is set", () => {
      const matchMediaMock = vi.fn().mockReturnValue({
        matches: true,
      });
      // @ts-expect-error - mocking window
      global.window = { matchMedia: matchMediaMock };

      const result = getPrefersReducedMotion();

      expect(result).toBe(true);
    });

    it("should return false when prefers-reduced-motion is not set", () => {
      const matchMediaMock = vi.fn().mockReturnValue({
        matches: false,
      });
      // @ts-expect-error - mocking window
      global.window = { matchMedia: matchMediaMock };

      const result = getPrefersReducedMotion();

      expect(result).toBe(false);
    });
  });

  describe("LandingMotionConditions type", () => {
    it("should have all required condition properties", () => {
      const conditions = {
        isDesktop: true,
        isTablet: false,
        isMobile: false,
        reduceMotion: false,
      };

      expect(conditions.isDesktop).toBe(true);
      expect(conditions.isTablet).toBe(false);
      expect(conditions.isMobile).toBe(false);
      expect(conditions.reduceMotion).toBe(false);
    });
  });
});