import { describe, it, expect } from "vitest";
import { formatPaymentMethodLabel, buildPaymentMethodLookup } from "@/lib/payment-method-utils";

describe("payment-method-utils", () => {
  describe("formatPaymentMethodLabel", () => {
    it("should format payment method with currency only", () => {
      const result = formatPaymentMethodLabel({
        name: "Chase Checking",
        currency: "USD",
        partner: null,
      });
      expect(result).toBe("Chase Checking (USD)");
    });

    it("should format payment method with partner", () => {
      const result = formatPaymentMethodLabel({
        name: "Business Account",
        currency: "USD",
        partner: { name: "Acme Corp" },
      });
      expect(result).toBe("Business Account (USD - Acme Corp)");
    });

    it("should handle undefined partner", () => {
      const result = formatPaymentMethodLabel({
        name: "Cash Box",
        currency: "EUR",
        partner: undefined,
      });
      expect(result).toBe("Cash Box (EUR)");
    });

    it("should handle empty partner name", () => {
      const result = formatPaymentMethodLabel({
        name: "Cash Box",
        currency: "EUR",
        partner: { name: "" },
      });
      expect(result).toBe("Cash Box (EUR)");
    });
  });

  describe("buildPaymentMethodLookup", () => {
    it("should build empty map for empty array", () => {
      const result = buildPaymentMethodLookup([]);
      expect(result.size).toBe(0);
    });

    it("should build lookup with single payment method", () => {
      const pms = [
        {
          id: "pm-1",
          name: "Chase",
          currency: "USD",
          type: "bank" as const,
          partner: null,
          createdAt: "",
          updatedAt: "",
          isActive: true,
          isDefault: false,
        },
      ];
      const result = buildPaymentMethodLookup(pms);
      expect(result.size).toBe(1);
      expect(result.get("pm-1")).toEqual({
        name: "Chase",
        currency: "USD",
        partnerName: null,
      });
    });

    it("should build lookup with multiple payment methods", () => {
      const pms = [
        {
          id: "pm-1",
          name: "Chase",
          currency: "USD",
          type: "bank" as const,
          partner: null,
          createdAt: "",
          updatedAt: "",
          isActive: true,
          isDefault: false,
        },
        {
          id: "pm-2",
          name: "Cash",
          currency: "EUR",
          type: "cash" as const,
          partner: { id: "p-1", name: "Partner A", email: "", phone: "", notes: "", createdAt: "", updatedAt: "", isActive: true },
          createdAt: "",
          updatedAt: "",
          isActive: true,
          isDefault: false,
        },
      ];
      const result = buildPaymentMethodLookup(pms);
      expect(result.size).toBe(2);
      expect(result.get("pm-1")).toEqual({
        name: "Chase",
        currency: "USD",
        partnerName: null,
      });
      expect(result.get("pm-2")).toEqual({
        name: "Cash",
        currency: "EUR",
        partnerName: "Partner A",
      });
    });

    it("should handle payment method with partner with empty string name", () => {
      const pms = [
        {
          id: "pm-1",
          name: "Card",
          currency: "USD",
          type: "card" as const,
          partner: { id: "p-1", name: "", email: "", phone: "", notes: "", createdAt: "", updatedAt: "", isActive: true },
          createdAt: "",
          updatedAt: "",
          isActive: true,
          isDefault: false,
        },
      ];
      const result = buildPaymentMethodLookup(pms);
      expect(result.get("pm-1")?.partnerName).toBe("");
    });
  });
});
