import { describe, it, expect } from "vitest";
import {
  getTodayIsoDate,
  isIsoDateString,
  isDateAfterToday,
  isMonthKeyString,
  getDateRangeError,
  formatDate,
  getMonthGrid,
  getCurrentMonthKey,
  addMonths,
  getMonthBounds,
} from "@/lib/date-utils";

describe("date-utils", () => {
  describe("getTodayIsoDate", () => {
    it("should return date in YYYY-MM-DD format", () => {
      const result = getTodayIsoDate();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("should return a valid ISO date string", () => {
      const result = getTodayIsoDate();
      expect(isIsoDateString(result)).toBe(true);
    });
  });

  describe("isIsoDateString", () => {
    it("should return true for valid ISO date", () => {
      expect(isIsoDateString("2025-04-24")).toBe(true);
    });

    it("should return false for invalid date", () => {
      expect(isIsoDateString("not-a-date")).toBe(false);
    });

    it("should return false for invalid month", () => {
      expect(isIsoDateString("2025-13-24")).toBe(false);
    });

    it("should return false for invalid day", () => {
      expect(isIsoDateString("2025-04-32")).toBe(false);
    });

    it("should return false for date with time", () => {
      expect(isIsoDateString("2025-04-24T00:00:00Z")).toBe(false);
    });
  });

  describe("isDateAfterToday", () => {
    it("should return false for today's date", () => {
      const today = getTodayIsoDate();
      expect(isDateAfterToday(today)).toBe(false);
    });

    it("should return true for future date", () => {
      expect(isDateAfterToday("2099-12-31")).toBe(true);
    });

    it("should return false for past date", () => {
      expect(isDateAfterToday("2020-01-01")).toBe(false);
    });

    it("should return false for invalid date string", () => {
      expect(isDateAfterToday("not-a-date")).toBe(false);
    });
  });

  describe("isMonthKeyString", () => {
    it("should return true for valid month key", () => {
      expect(isMonthKeyString("2025-04")).toBe(true);
    });

    it("should return false for invalid month", () => {
      expect(isMonthKeyString("2025-13")).toBe(false);
    });

    it("should return false for date string", () => {
      expect(isMonthKeyString("2025-04-24")).toBe(false);
    });
  });

  describe("getDateRangeError", () => {
    it("should return null for valid range", () => {
      const result = getDateRangeError("2025-01-01", "2025-12-31");
      expect(result).toBeNull();
    });

    it("should return error for inverted range", () => {
      const result = getDateRangeError("2025-12-31", "2025-01-01");
      expect(result).not.toBeNull();
    });

    it("should return null when from is empty", () => {
      const result = getDateRangeError("", "2025-12-31");
      expect(result).toBeNull();
    });

    it("should return null when to is empty", () => {
      const result = getDateRangeError("2025-01-01", "");
      expect(result).toBeNull();
    });
  });

  describe("formatDate", () => {
    it("should format full date correctly", () => {
      const result = formatDate("2025-04-24", { locale: "en" });
      expect(result).toContain("2025");
    });

    it("should return fallback for null date", () => {
      const result = formatDate(null, { fallback: "N/A" });
      expect(result).toBe("N/A");
    });

    it("should return fallback for invalid date", () => {
      const result = formatDate("invalid", { fallback: "Invalid" });
      expect(result).toBe("Invalid");
    });

    it("should format date-only string as local midnight (no UTC shift)", () => {
      const result = formatDate("2025-04-24", { locale: "en", withYear: true });
      expect(result).toContain("2025");
    });
  });

  describe("getMonthGrid", () => {
    it("should return 42 dates", () => {
      const result = getMonthGrid("2025-04");
      expect(result).toHaveLength(42);
    });

    it("should return empty array for invalid month", () => {
      const result = getMonthGrid("invalid");
      expect(result).toHaveLength(0);
    });

    it("should start from Monday", () => {
      const result = getMonthGrid("2025-04");
      expect(result[0]).toBe("2025-03-31");
    });
  });

  describe("getCurrentMonthKey", () => {
    it("should return current month in YYYY-MM format", () => {
      const result = getCurrentMonthKey();
      expect(result).toMatch(/^\d{4}-\d{2}$/);
    });
  });

  describe("addMonths", () => {
    it("should add months correctly", () => {
      expect(addMonths("2025-01", 1)).toBe("2025-02");
    });

    it("should handle year overflow", () => {
      expect(addMonths("2025-12", 1)).toBe("2026-01");
    });

    it("should subtract months correctly", () => {
      expect(addMonths("2025-03", -1)).toBe("2025-02");
    });
  });

  describe("getMonthBounds", () => {
    it("should return first and last day of month", () => {
      const result = getMonthBounds("2025-04");
      expect(result.from).toBe("2025-04-01");
      expect(result.to).toBe("2025-04-30");
    });

    it("should handle February correctly", () => {
      const result = getMonthBounds("2025-02");
      expect(result.from).toBe("2025-02-01");
      expect(result.to).toBe("2025-02-28");
    });

    it("should handle leap year February", () => {
      const result = getMonthBounds("2024-02");
      expect(result.to).toBe("2024-02-29");
    });

    it("should return empty strings for invalid month", () => {
      const result = getMonthBounds("invalid");
      expect(result.from).toBe("");
      expect(result.to).toBe("");
    });
  });
});
