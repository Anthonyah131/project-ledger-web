import { describe, it, expect } from "vitest";
import { createPaymentMethodSchema, updatePaymentMethodSchema } from "@/lib/validations/payment-method";

const mockT = (key: string) => {
  const messages: Record<string, string> = {
    "common.validation.nameRequired": "Name is required",
    "common.validation.maxChars255": "Must be at most 255 characters",
    "common.validation.typeRequired": "Type is required",
    "common.validation.currencyRequired": "Currency is required",
  };
  return messages[key] ?? key;
};

describe("payment-method-validation", () => {
  describe("createPaymentMethodSchema", () => {
    const schema = createPaymentMethodSchema(mockT);

    it("should validate valid payment method data", () => {
      const result = schema.safeParse({
        name: "Business Account",
        type: "bank",
        currency: "USD",
        bankName: "Chase",
        accountNumber: "1234",
        description: "",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty name", () => {
      const result = schema.safeParse({
        name: "",
        type: "bank",
        currency: "USD",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid type", () => {
      const result = schema.safeParse({
        name: "Account",
        type: "invalid",
        currency: "USD",
      });
      expect(result.success).toBe(false);
    });

    it("should accept all valid types", () => {
      for (const type of ["bank", "cash", "card"]) {
        const result = schema.safeParse({ name: "Account", type, currency: "USD", bankName: "", accountNumber: "", description: "" });
        expect(result.success).toBe(true);
      }
    });

    it("should reject empty currency", () => {
      const result = schema.safeParse({
        name: "Account",
        type: "bank",
        currency: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updatePaymentMethodSchema", () => {
    const schema = updatePaymentMethodSchema(mockT);

    it("should validate valid update data", () => {
      const result = schema.safeParse({
        name: "Updated Account",
        type: "bank",
        bankName: "New Bank",
        accountNumber: "5678",
        description: "Updated description",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty name on update", () => {
      const result = schema.safeParse({ name: "", type: "bank" });
      expect(result.success).toBe(false);
    });
  });
});
