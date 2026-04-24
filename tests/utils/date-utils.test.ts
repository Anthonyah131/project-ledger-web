import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatMonthKey,
  isIsoDateString,
  isMonthKeyString,
  isDateAfterToday,
  getDateRangeError,
  getTodayIsoDate,
  getCurrentMonthKey,
  addMonths,
  getMonthBounds,
  formatMonthLabel,
  formatDateLabel,
  getWeekdayNamesShort,
  getMonthGrid,
} from "@/lib/date-utils";

describe("date-utils", () => {
  describe("formatDate", () => {
    it("should return fallback for null input", () => {
      expect(formatDate(null)).toBe("")
      expect(formatDate(null, { fallback: "N/A" })).toBe("N/A")
    });

    it("should return fallback for undefined input", () => {
      expect(formatDate(undefined)).toBe("")
      expect(formatDate(undefined, { fallback: "N/A" })).toBe("N/A")
    });

    it("should return fallback for invalid date string", () => {
      expect(formatDate("invalid")).toBe("")
      expect(formatDate("invalid", { fallback: "Invalid" })).toBe("Invalid")
    });

    it("should format ISO date string (YYYY-MM-DD) as local midnight", () => {
      const result = formatDate("2024-01-15", { locale: "en" });
      expect(result).toContain("15");
      expect(result).toContain("Jan");
    });

    it("should format full timestamp", () => {
      const result = formatDate("2024-01-15T10:30:00Z", { locale: "en" });
      expect(result).toContain("2024");
    });

    it("should format without year when withYear is false", () => {
      const result = formatDate("2024-01-15", { withYear: false, locale: "en" });
      expect(result).not.toContain("2024");
    });

    it("should format with 2-digit day style", () => {
      const result = formatDate("2024-01-05", { dayStyle: "2-digit", locale: "en" });
      expect(result).toContain("05");
    });

    it("should handle different locales", () => {
      const esResult = formatDate("2024-01-15", { locale: "es" });
      expect(esResult).toContain("ene");
    });

    it("should parse calendar date (YYYY-MM-DD) without UTC shift", () => {
      const result = formatDate("2024-06-15", { locale: "en" });
      expect(result).toContain("15");
      expect(result).toContain("Jun");
      expect(result).toContain("2024");
    });
  });

  describe("formatMonthKey", () => {
    it("should return fallback for invalid month key", () => {
      expect(formatMonthKey("invalid")).toBe("invalid")
      expect(formatMonthKey("invalid", "fallback")).toBe("fallback")
    });

    it("should return fallback for empty month key with fallback", () => {
      expect(formatMonthKey("", "fallback")).toBe("fallback")
    });

    it("should format valid month key", () => {
      const result = formatMonthKey("2024-01", "", "en");
      expect(result).toContain("January");
      expect(result).toContain("2024");
    });

    it("should capitalize first letter of month", () => {
      const result = formatMonthKey("2024-01", "", "en");
      expect(result).toBe("January 2024");
    });
  });

  describe("isIsoDateString", () => {
    it("should return true for valid ISO date strings", () => {
      expect(isIsoDateString("2024-01-15")).toBe(true)
      expect(isIsoDateString("2024-12-31")).toBe(true)
    });

    it("should return false for invalid date strings", () => {
      expect(isIsoDateString("invalid")).toBe(false)
      expect(isIsoDateString("2024-13-01")).toBe(false)
      expect(isIsoDateString("2024-01-32")).toBe(false)
      expect(isIsoDateString("2024")).toBe(false)
    });

    it("should return false for month keys", () => {
      expect(isIsoDateString("2024-01")).toBe(false)
    });

    it("should return false for timestamps", () => {
      expect(isIsoDateString("2024-01-15T10:30:00Z")).toBe(false)
    });
  });

  describe("isMonthKeyString", () => {
    it("should return true for valid month keys", () => {
      expect(isMonthKeyString("2024-01")).toBe(true)
      expect(isMonthKeyString("2024-12")).toBe(true)
    });

    it("should return false for invalid month keys", () => {
      expect(isMonthKeyString("invalid")).toBe(false)
      expect(isMonthKeyString("2024-13")).toBe(false)
      expect(isMonthKeyString("2024-00")).toBe(false)
    });

    it("should return false for date strings", () => {
      expect(isMonthKeyString("2024-01-15")).toBe(false)
    });
  });

  describe("isDateAfterToday", () => {
    it("should return false for invalid date strings", () => {
      expect(isDateAfterToday("invalid")).toBe(false)
    });

    it("should return true for date after today", () => {
      expect(isDateAfterToday("2099-01-01")).toBe(true)
    });

    it("should return false for date before today", () => {
      expect(isDateAfterToday("2020-01-01")).toBe(false)
    });
  });

  describe("getDateRangeError", () => {
    it("should return null when from is empty", () => {
      expect(getDateRangeError("", "2024-01-15")).toBeNull()
    });

    it("should return null when to is empty", () => {
      expect(getDateRangeError("2024-01-15", "")).toBeNull()
    });

    it("should return null for valid date range", () => {
      expect(getDateRangeError("2024-01-01", "2024-01-15")).toBeNull()
    });

    it("should return null when from equals to", () => {
      expect(getDateRangeError("2024-01-15", "2024-01-15")).toBeNull()
    });

    it("should return error for invalid date range", () => {
      const result = getDateRangeError("2024-01-15", "2024-01-01");
      expect(result).not.toBeNull()
    });

    it("should use translation function when provided", () => {
      const t = (key: string) => "Translated error";
      const result = getDateRangeError("2024-01-15", "2024-01-01", t);
      expect(result).toBe("Translated error");
    });
  });

  describe("getTodayIsoDate", () => {
    it("should return date in YYYY-MM-DD format", () => {
      const result = getTodayIsoDate();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("should return today's date", () => {
      const today = new Date().toISOString().split("T")[0];
      expect(getTodayIsoDate()).toBe(today);
    });
  });

  describe("getCurrentMonthKey", () => {
    it("should return month in YYYY-MM format", () => {
      const result = getCurrentMonthKey();
      expect(result).toMatch(/^\d{4}-\d{2}$/);
    });

    it("should return current month", () => {
      const now = new Date();
      const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      expect(getCurrentMonthKey()).toBe(expected);
    });
  });

  describe("addMonths", () => {
    it("should return same month key for delta 0", () => {
      expect(addMonths("2024-01", 0)).toBe("2024-01")
    });

    it("should add months correctly", () => {
      expect(addMonths("2024-01", 1)).toBe("2024-02")
      expect(addMonths("2024-01", 12)).toBe("2025-01")
    });

    it("should subtract months correctly", () => {
      expect(addMonths("2024-06", -1)).toBe("2024-05")
      expect(addMonths("2024-01", -1)).toBe("2023-12")
    });

    it("should handle year boundary", () => {
      expect(addMonths("2024-12", 1)).toBe("2025-01")
      expect(addMonths("2025-01", -1)).toBe("2024-12")
    });

    it("should return original for invalid month key", () => {
      expect(addMonths("invalid", 1)).toBe("invalid")
    });
  });

  describe("getMonthBounds", () => {
    it("should return empty strings for invalid month key", () => {
      const result = getMonthBounds("invalid");
      expect(result.from).toBe("")
      expect(result.to).toBe("")
    });

    it("should return first and last day of month", () => {
      const result = getMonthBounds("2024-01");
      expect(result.from).toBe("2024-01-01")
      expect(result.to).toBe("2024-01-31")
    });

    it("should handle February in leap year", () => {
      const result = getMonthBounds("2024-02");
      expect(result.from).toBe("2024-02-01")
      expect(result.to).toBe("2024-02-29")
    });

    it("should handle February in non-leap year", () => {
      const result = getMonthBounds("2023-02");
      expect(result.from).toBe("2023-02-01")
      expect(result.to).toBe("2023-02-28")
    });

    it("should handle 30-day months", () => {
      const result = getMonthBounds("2024-04");
      expect(result.from).toBe("2024-04-01")
      expect(result.to).toBe("2024-04-30")
    });

    it("should handle 31-day months", () => {
      const result = getMonthBounds("2024-01");
      expect(result.from).toBe("2024-01-01")
      expect(result.to).toBe("2024-01-31")
    });
  });

  describe("formatMonthLabel", () => {
    it("should format month label", () => {
      const result = formatMonthLabel("2024-01", "en");
      expect(result).toContain("January");
      expect(result).toContain("2024");
    });

    it("should return original value for invalid month", () => {
      expect(formatMonthLabel("invalid", "en")).toBe("invalid")
    });
  });

  describe("formatDateLabel", () => {
    it("should format date with 2-digit day and without year", () => {
      const result = formatDateLabel("2024-01-15", "en");
      expect(result).toContain("15");
      expect(result).not.toContain("2024");
    });

    it("should return original value for invalid date", () => {
      expect(formatDateLabel("invalid", "en")).toBe("invalid")
    });
  });

  describe("getWeekdayNamesShort", () => {
    it("should return 7 weekday names", () => {
      const result = getWeekdayNamesShort("en");
      expect(result).toHaveLength(7);
    });

    it("should start with Monday", () => {
      const result = getWeekdayNamesShort("en");
      expect(result[0]).toBe("Mon");
    });

    it("should handle different locales", () => {
      const enResult = getWeekdayNamesShort("en");
      const esResult = getWeekdayNamesShort("es");
      expect(enResult[0]).toBe("Mon");
      expect(esResult[0]).toBe("lun");
    });
  });

  describe("getMonthGrid", () => {
    it("should return empty array for invalid month key", () => {
      expect(getMonthGrid("invalid")).toEqual([])
    });

    it("should return 42 dates (6 weeks)", () => {
      const result = getMonthGrid("2024-01");
      expect(result).toHaveLength(42);
    });

    it("should return valid YYYY-MM-DD strings", () => {
      const result = getMonthGrid("2024-01");
      result.forEach((date) => {
        expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it("should include the first day of the month", () => {
      const result = getMonthGrid("2024-01");
      expect(result).toContain("2024-01-01");
    });

    it("should include the last day of the month", () => {
      const result = getMonthGrid("2024-01");
      expect(result).toContain("2024-01-31");
    });

    it("should start on Monday (weekday 1)", () => {
      const result = getMonthGrid("2024-01");
      const firstDateStr = result[0];
      const [year, month, day] = firstDateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      const weekday = date.getDay();
      expect(weekday).toBe(1);
    });
  });
});
