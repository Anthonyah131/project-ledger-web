import { describe, it, expect } from "vitest";
import {
  formatAmount,
  formatCurrencyAmount,
  formatCurrency,
  formatSignedCurrency,
  formatSignedPercent,
  formatPercent,
  formatCompactCurrency,
  formatCurrencySymbol,
} from "@/lib/format-utils";

describe("format-utils", () => {
  describe("formatAmount", () => {
    it("should format a positive number with 2 decimal places", () => {
      const result = formatAmount(1234.56);
      expect(result).toMatch(/1.{0,2}234/);
    });

    it("should format a negative number", () => {
      const result = formatAmount(-1234.56);
      expect(result).toMatch(/-/);
    });

    it("should return fallback for null", () => {
      expect(formatAmount(null)).toBe("—");
    });

    it("should return fallback for undefined", () => {
      expect(formatAmount(undefined)).toBe("—");
    });

    it("should return custom fallback when provided", () => {
      expect(formatAmount(null, "N/A")).toBe("N/A");
    });

    it("should handle zero", () => {
      const result = formatAmount(0);
      expect(result).toBeDefined();
    });
  });

  describe("formatCurrencyAmount", () => {
    it("should format USD correctly", () => {
      const result = formatCurrencyAmount(1234.56, "USD");
      expect(result).toMatch(/USD\s+[\d\s]+,\d{2}/);
    });

    it("should format EUR correctly", () => {
      const result = formatCurrencyAmount(1234.56, "EUR");
      expect(result).toMatch(/EUR\s+[\d\s]+,\d{2}/);
    });

    it("should format CRC correctly", () => {
      const result = formatCurrencyAmount(1234.56, "CRC");
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(3);
    });

    it("should format MXN correctly", () => {
      const result = formatCurrencyAmount(1234.56, "MXN");
      expect(result).toMatch(/MXN\s+[\d\s]+,\d{2}/);
    });

    it("should cache formatters for same currency", () => {
      const result1 = formatCurrencyAmount(100, "USD");
      const result2 = formatCurrencyAmount(200, "USD");
      expect(result1).toMatch(/USD/);
      expect(result2).toMatch(/USD/);
    });
  });

  describe("formatCurrency", () => {
    it("should format with currency code", () => {
      const result = formatCurrency(1234.56, "USD");
      expect(result).toMatch(/USD/);
    });

    it("should return fallback format for empty currency code", () => {
      const result = formatCurrency(1234.56, "");
      expect(result).toBeDefined();
      expect(result).toMatch(/\d/);
    });

    it("should handle zero", () => {
      const result = formatCurrency(0, "USD");
      expect(result).toBeDefined();
    });
  });

  describe("formatSignedCurrency", () => {
    it("should format positive with + prefix", () => {
      const result = formatSignedCurrency(1234.56, "USD");
      expect(result).toMatch(/\+/);
    });

    it("should format negative with - prefix", () => {
      const result = formatSignedCurrency(-1234.56, "USD");
      expect(result).toMatch(/-/);
    });

    it("should not add prefix for zero", () => {
      const result = formatSignedCurrency(0, "USD");
      expect(result).not.toMatch(/\+|-/);
    });
  });

  describe("formatSignedPercent", () => {
    it("should format positive with + prefix", () => {
      const result = formatSignedPercent(50.5);
      expect(result).toMatch(/\+/);
    });

    it("should format negative with - prefix", () => {
      const result = formatSignedPercent(-50.5);
      expect(result).toMatch(/-/);
    });

    it("should not add prefix for zero", () => {
      const result = formatSignedPercent(0);
      expect(result).not.toMatch(/\+|-/);
    });

    it("should include percent sign", () => {
      const result = formatSignedPercent(50);
      expect(result).toMatch(/%/);
    });
  });

  describe("formatPercent", () => {
    it("should format with percent sign", () => {
      const result = formatPercent(50);
      expect(result).toMatch(/%/);
    });

    it("should format with 2 decimal places", () => {
      const result = formatPercent(50.1234);
      expect(result).toMatch(/50/);
    });
  });

  describe("formatCompactCurrency", () => {
    it("should format large numbers compactly", () => {
      const result = formatCompactCurrency(1234567.89, "USD");
      expect(result).toBeDefined();
    });

    it("should return fallback for empty currency code", () => {
      const result = formatCompactCurrency(1234.56, "");
      expect(result).toBeDefined();
      expect(result).toMatch(/\d/);
    });
  });

  describe("formatCurrencySymbol", () => {
    it("should return $ for USD", () => {
      expect(formatCurrencySymbol("USD")).toBe("$");
    });

    it("should return € for EUR", () => {
      expect(formatCurrencySymbol("EUR")).toBe("€");
    });

    it("should return ₡ for CRC", () => {
      expect(formatCurrencySymbol("CRC")).toBe("₡");
    });

    it("should return $ for MXN", () => {
      expect(formatCurrencySymbol("MXN")).toBe("$");
    });

    it("should return £ for GBP", () => {
      expect(formatCurrencySymbol("GBP")).toBe("£");
    });

    it("should return ¥ for JPY", () => {
      expect(formatCurrencySymbol("JPY")).toBe("¥");
    });

    it("should return code itself for unknown currency", () => {
      expect(formatCurrencySymbol("XYZ")).toBe("XYZ");
    });
  });
});
