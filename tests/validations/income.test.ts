import { describe, it, expect } from "vitest";
import { createIncomeSchema, updateIncomeSchema } from "@/lib/validations/income";

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
  title: "Test Income",
  originalAmount: "500.00",
  originalCurrency: "USD",
  incomeDate: "2025-04-24",
  categoryId: "cat-1",
  paymentMethodId: "pm-1",
  exchangeRate: "1.00",
  description: "",
  notes: "",
  receiptNumber: "",
  isActive: true,
  currencyExchanges: [],
  convertedAmount: "",
  accountAmount: "",
  splitType: undefined as "percentage" | "fixed" | undefined,
  splits: undefined,
};

describe("income-validation", () => {
  describe("createIncomeSchema", () => {
    const schema = createIncomeSchema(mockT);

    it("should validate valid income data", () => {
      const result = schema.safeParse(validBaseData);
      expect(result.success).toBe(true);
    });

    it("should reject empty title", () => {
      const result = schema.safeParse({ ...validBaseData, title: "" });
      expect(result.success).toBe(false);
    });

    it("should reject zero amount", () => {
      const result = schema.safeParse({ ...validBaseData, originalAmount: "0" });
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

    it("should accept income with splits", () => {
      const data = {
        ...validBaseData,
        splitType: "fixed" as const,
        splits: [
          {
            partnerId: "partner-1",
            partnerName: "Partner A",
            splitValue: "250",
            currencyExchanges: [],
          },
        ],
      };
      const result = schema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("updateIncomeSchema", () => {
    const schema = updateIncomeSchema(mockT);

    it("should validate valid update data", () => {
      const result = schema.safeParse(validBaseData);
      expect(result.success).toBe(true);
    });

    it("should reject empty title on update", () => {
      const result = schema.safeParse({ ...validBaseData, title: "" });
      expect(result.success).toBe(false);
    });
  });
});
