import { describe, it, expect } from "vitest";
import { createObligationSchema, updateObligationSchema } from "@/lib/validations/obligation";

const mockT = (key: string) => {
  const messages: Record<string, string> = {
    "common.validation.required": "This field is required",
    "common.validation.titleRequired": "Title is required",
    "common.validation.amountRange": "Amount must be between 0.01 and 999,999,999,999.99",
    "common.validation.currencyRequired": "Currency is required",
    "common.validation.invalidDate": "Invalid date format",
  };
  return messages[key] ?? key;
};

describe("obligation-validation", () => {
  describe("createObligationSchema", () => {
    const schema = createObligationSchema(mockT);

    it("should validate valid obligation data", () => {
      const result = schema.safeParse({
        title: "Office Rent",
        totalAmount: "1000.00",
        currency: "USD",
        dueDate: "",
        description: "",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty title", () => {
      const result = schema.safeParse({
        title: "",
        totalAmount: "1000.00",
        currency: "USD",
      });
      expect(result.success).toBe(false);
    });

    it("should reject zero totalAmount", () => {
      const result = schema.safeParse({
        title: "Rent",
        totalAmount: "0",
        currency: "USD",
        dueDate: "",
        description: "",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty currency", () => {
      const result = schema.safeParse({
        title: "Rent",
        totalAmount: "1000.00",
        currency: "",
        dueDate: "",
        description: "",
      });
      expect(result.success).toBe(false);
    });

    it("should accept valid dueDate", () => {
      const result = schema.safeParse({
        title: "Office Rent",
        totalAmount: "1000.00",
        currency: "USD",
        dueDate: "2025-12-31",
        description: "",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid dueDate format", () => {
      const result = schema.safeParse({
        title: "Rent",
        totalAmount: "1000.00",
        currency: "USD",
        dueDate: "not-a-date",
        description: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updateObligationSchema", () => {
    const schema = updateObligationSchema(mockT);

    it("should validate valid update data", () => {
      const result = schema.safeParse({
        title: "Updated Rent",
        totalAmount: "1200.00",
        dueDate: "",
        description: "Updated description",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty title on update", () => {
      const result = schema.safeParse({
        title: "",
        totalAmount: "1200.00",
        dueDate: "",
        description: "",
      });
      expect(result.success).toBe(false);
    });
  });
});
