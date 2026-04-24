import { describe, it, expect } from "vitest";
import { bulkImportSchema, bulkImportItemSchema } from "@/lib/validations/bulk-import";

const mockT = (key: string) => {
  const messages: Record<string, string> = {
    "common.validation.required": "This field is required",
    "common.validation.titleRequired": "Title is required",
    "common.validation.amountRange": "Amount must be between 0.01 and 999,999,999,999.99",
    "common.validation.currencyRequired": "Currency is required",
    "common.validation.dateRequired": "Date is required",
    "common.validation.invalidDate": "Invalid date format",
    "common.validation.dateFuture": "Date cannot be in the future",
    "common.validation.categoryRequired": "Category is required",
    "common.validation.paymentMethodRequired": "Payment method is required",
    "common.validation.exchangeRateRange": "Exchange rate must be between 0.000001 and 999,999,999,999.999999",
    "common.validation.positiveNumber": "Must be a positive number",
    "common.validation.greaterThanZero": "Must be greater than zero",
    "bulkImport.validation.splitsRequired": "At least one split with value > 0 is required",
    "bulkImport.validation.splitsMustSum100": "Percentage splits must sum to 100",
    "bulkImport.validation.minOneItem": "At least one item is required",
    "bulkImport.validation.maxItems": "Maximum 100 items allowed",
  };
  return messages[key] ?? key;
};

const validItemData = {
  title: "Bulk Expense",
  originalAmount: "100.00",
  originalCurrency: "USD",
  date: "2025-04-24",
  categoryId: "cat-1",
  paymentMethodId: "pm-1",
  exchangeRate: "1.00",
  convertedAmount: "",
  accountAmount: "",
  description: "",
  notes: "",
  obligationId: undefined,
  obligationEquivalentAmount: undefined,
  currencyExchanges: [],
  splitType: undefined as "percentage" | "fixed" | undefined,
  splits: undefined,
};

describe("bulk-import-validation", () => {
  describe("bulkImportItemSchema", () => {
    const schema = bulkImportItemSchema(mockT);

    it("should validate valid bulk import item", () => {
      const result = schema.safeParse(validItemData);
      expect(result.success).toBe(true);
    });

    it("should reject empty title", () => {
      const result = schema.safeParse({ ...validItemData, title: "" });
      expect(result.success).toBe(false);
    });

    it("should reject zero amount", () => {
      const result = schema.safeParse({ ...validItemData, originalAmount: "0" });
      expect(result.success).toBe(false);
    });

    it("should reject empty category", () => {
      const result = schema.safeParse({ ...validItemData, categoryId: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("bulkImportSchema", () => {
    const schema = bulkImportSchema(mockT);

    it("should validate array with valid items", () => {
      const result = schema.safeParse({
        items: [validItemData],
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty items array", () => {
      const result = schema.safeParse({ items: [] });
      expect(result.success).toBe(false);
    });

    it("should reject more than 100 items", () => {
      const items = Array.from({ length: 101 }, (_, i) => ({
        ...validItemData,
        title: `Expense ${i}`,
      }));
      const result = schema.safeParse({ items });
      expect(result.success).toBe(false);
    });

    it("should accept exactly 100 items", () => {
      const items = Array.from({ length: 100 }, (_, i) => ({
        ...validItemData,
        title: `Expense ${i}`,
      }));
      const result = schema.safeParse({ items });
      expect(result.success).toBe(true);
    });
  });
});
