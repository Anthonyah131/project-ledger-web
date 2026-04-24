import { describe, it, expect } from "vitest";
import {
  createExpenseSchema,
  updateExpenseSchema,
} from "@/lib/validations/expense";

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
  };
  return messages[key] ?? key;
};

const validBaseData = {
  title: "Test Expense",
  originalAmount: "100.00",
  originalCurrency: "USD",
  expenseDate: "2025-04-24",
  categoryId: "cat-1",
  paymentMethodId: "pm-1",
  exchangeRate: "1.00",
  convertedAmount: "",
  description: "",
  receiptNumber: "",
  notes: "",
  isActive: true,
  obligationId: "",
  obligationEquivalentAmount: "",
  currencyExchanges: [],
  splitType: undefined as "percentage" | "fixed" | undefined,
  splits: undefined,
};

describe("expense-validation", () => {
  describe("createExpenseSchema", () => {
    const schema = createExpenseSchema(mockT);

    it("should validate valid expense data", () => {
      const result = schema.safeParse(validBaseData);
      expect(result.success).toBe(true);
    });

    it("should reject empty title", () => {
      const result = schema.safeParse({ ...validBaseData, title: "" });
      expect(result.success).toBe(false);
    });

    it("should reject empty originalAmount", () => {
      const result = schema.safeParse({ ...validBaseData, originalAmount: "" });
      expect(result.success).toBe(false);
    });

    it("should reject zero originalAmount", () => {
      const result = schema.safeParse({ ...validBaseData, originalAmount: "0" });
      expect(result.success).toBe(false);
    });

    it("should reject negative originalAmount", () => {
      const result = schema.safeParse({ ...validBaseData, originalAmount: "-50" });
      expect(result.success).toBe(false);
    });

    it("should reject empty currency", () => {
      const result = schema.safeParse({ ...validBaseData, originalCurrency: "" });
      expect(result.success).toBe(false);
    });

    it("should reject empty category", () => {
      const result = schema.safeParse({ ...validBaseData, categoryId: "" });
      expect(result.success).toBe(false);
    });

    it("should reject empty payment method", () => {
      const result = schema.safeParse({ ...validBaseData, paymentMethodId: "" });
      expect(result.success).toBe(false);
    });

    it("should reject exchange rate of zero", () => {
      const result = schema.safeParse({ ...validBaseData, exchangeRate: "0" });
      expect(result.success).toBe(false);
    });

    it("should accept optional convertedAmount", () => {
      const result = schema.safeParse({ ...validBaseData, convertedAmount: "" });
      expect(result.success).toBe(true);
    });

    it("should accept expense with splits", () => {
      const data = {
        ...validBaseData,
        splitType: "percentage" as const,
        splits: [
          {
            partnerId: "partner-1",
            partnerName: "Partner A",
            splitValue: "50",
            currencyExchanges: [],
          },
          {
            partnerId: "partner-2",
            partnerName: "Partner B",
            splitValue: "50",
            currencyExchanges: [],
          },
        ],
      };
      const result = schema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("updateExpenseSchema", () => {
    const schema = updateExpenseSchema(mockT);

    it("should validate valid update data", () => {
      const result = schema.safeParse(validBaseData);
      expect(result.success).toBe(true);
    });

    it("should allow isTemplate field", () => {
      const result = schema.safeParse({ ...validBaseData, isTemplate: true });
      expect(result.success).toBe(true);
    });

    it("should reject empty title on update", () => {
      const result = schema.safeParse({ ...validBaseData, title: "" });
      expect(result.success).toBe(false);
    });
  });
});
