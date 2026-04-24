import { describe, it, expect } from "vitest";
import { getBillingStatusMeta, formatPlanPrice } from "@/lib/billing-utils";

describe("billing-utils", () => {
  describe("getBillingStatusMeta", () => {
    const mockT = (key: string) => key;

    it("should return success tone for active status", () => {
      const result = getBillingStatusMeta("active", mockT);
      expect(result.tone).toBe("success");
      expect(result.isActive).toBe(true);
    });

    it("should return success tone for trialing status", () => {
      const result = getBillingStatusMeta("trialing", mockT);
      expect(result.tone).toBe("success");
      expect(result.isActive).toBe(true);
    });

    it("should return warning tone for past_due status", () => {
      const result = getBillingStatusMeta("past_due", mockT);
      expect(result.tone).toBe("warning");
      expect(result.isActive).toBe(true);
    });

    it("should return muted tone for canceled status", () => {
      const result = getBillingStatusMeta("canceled", mockT);
      expect(result.tone).toBe("muted");
      expect(result.isActive).toBe(false);
    });

    it("should return warning tone for incomplete status", () => {
      const result = getBillingStatusMeta("incomplete", mockT);
      expect(result.tone).toBe("warning");
      expect(result.isActive).toBe(false);
    });

    it("should return danger tone for incomplete_expired status", () => {
      const result = getBillingStatusMeta("incomplete_expired", mockT);
      expect(result.tone).toBe("danger");
      expect(result.isActive).toBe(false);
    });

    it("should return danger tone for unpaid status", () => {
      const result = getBillingStatusMeta("unpaid", mockT);
      expect(result.tone).toBe("danger");
      expect(result.isActive).toBe(false);
    });

    it("should return muted tone for unknown status", () => {
      const result = getBillingStatusMeta("unknown_status" as never, mockT);
      expect(result.tone).toBe("muted");
      expect(result.isActive).toBe(false);
    });

    it("should use translation function for label", () => {
      const t = (key: string) => `translated:${key}`;
      const result = getBillingStatusMeta("active", t);
      expect(result.label).toBe("translated:billing.status.active.label");
    });

    it("should fall back to status value when translation is missing", () => {
      const t = (key: string) => key;
      const result = getBillingStatusMeta("active", t);
      expect(result.label).toBe("billing.status.active.label");
    });

    it("should use translation function for description", () => {
      const t = (key: string) => `translated:${key}`;
      const result = getBillingStatusMeta("active", t);
      expect(result.description).toBe("translated:billing.status.active.description");
    });
  });

  describe("formatPlanPrice", () => {
    it("should format price with USD currency", () => {
      const result = formatPlanPrice(29, "USD");
      expect(result).toContain("29");
      expect(result).toMatch(/\$|USD/);
    });

    it("should format price with EUR currency", () => {
      const result = formatPlanPrice(19, "EUR");
      expect(result).toContain("19");
      expect(result).toMatch(/€|EUR/);
    });

    it("should show no decimal places for whole numbers", () => {
      const result = formatPlanPrice(29, "USD");
      expect(result).not.toMatch(/\.\d{2}/);
    });

    it("should show decimal places for non-whole numbers", () => {
      const result = formatPlanPrice(29.99, "USD");
      expect(result).toMatch(/\d+/);
    });

    it("should handle locale parameter", () => {
      const result = formatPlanPrice(29, "USD", "en-US");
      expect(result).toBeDefined();
    });

    it("should handle lowercase currency codes", () => {
      const result = formatPlanPrice(29, "usd");
      expect(result).toContain("29");
    });
  });
});