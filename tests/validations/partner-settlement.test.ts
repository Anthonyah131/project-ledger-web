import { describe, it, expect } from "vitest";
import { createSettlementSchema, updateSettlementSchema } from "@/lib/validations/partner-settlement";

const mockT = (key: string) => {
  const messages: Record<string, string> = {
    "common.validation.required": "This field is required",
    "common.validation.amountRange": "Amount must be between 0.01 and 999,999,999,999.99",
    "common.validation.currencyRequired": "Currency is required",
    "common.validation.dateRequired": "Date is required",
    "common.validation.invalidDate": "Invalid date format",
    "common.validation.dateFuture": "Date cannot be in the future",
    "common.validation.exchangeRateRange": "Exchange rate must be between 0.000001 and 999,999,999,999.999999",
    "common.validation.isoCode": "Must be a valid ISO currency code",
    "common.validation.greaterThanZero": "Must be greater than zero",
    "partnerSettlements.validation.fromPartnerRequired": "From partner is required",
    "partnerSettlements.validation.toPartnerRequired": "To partner is required",
    "partnerSettlements.validation.partnersSame": "From and to partner cannot be the same",
  };
  return messages[key] ?? key;
};

const validBaseData = {
  fromPartnerId: "partner-1",
  toPartnerId: "partner-2",
  amount: "100.00",
  currency: "USD",
  exchangeRate: "1.00",
  settlementDate: "2025-04-24",
  description: "",
  notes: "",
  currencyExchanges: [],
};

describe("partner-settlement-validation", () => {
  describe("createSettlementSchema", () => {
    const schema = createSettlementSchema(mockT);

    it("should validate valid settlement data", () => {
      const result = schema.safeParse(validBaseData);
      expect(result.success).toBe(true);
    });

    it("should reject empty fromPartnerId", () => {
      const result = schema.safeParse({ ...validBaseData, fromPartnerId: "" });
      expect(result.success).toBe(false);
    });

    it("should reject empty toPartnerId", () => {
      const result = schema.safeParse({ ...validBaseData, toPartnerId: "" });
      expect(result.success).toBe(false);
    });

    it("should reject same from and to partner", () => {
      const result = schema.safeParse({ ...validBaseData, toPartnerId: "partner-1" });
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.issues.find((e) => e.path.includes("toPartnerId"));
        expect(error?.message).toBe("From and to partner cannot be the same");
      }
    });

    it("should reject invalid currency code", () => {
      const result = schema.safeParse({ ...validBaseData, currency: "INVALID" });
      expect(result.success).toBe(false);
    });

    it("should accept valid ISO currency code", () => {
      const result = schema.safeParse({ ...validBaseData, currency: "EUR" });
      expect(result.success).toBe(true);
    });
  });

  describe("updateSettlementSchema", () => {
    const schema = updateSettlementSchema(mockT);

    it("should validate valid update data", () => {
      const result = schema.safeParse({
        amount: "150.00",
        currency: "EUR",
        exchangeRate: "0.85",
        settlementDate: "2025-04-25",
        description: "Updated",
        notes: "",
        currencyExchanges: [],
      });
      expect(result.success).toBe(true);
    });

    it("should reject zero amount on update", () => {
      const result = schema.safeParse({
        amount: "0",
        currency: "USD",
        exchangeRate: "1.00",
        settlementDate: "2025-04-24",
        description: "",
        notes: "",
        currencyExchanges: [],
      });
      expect(result.success).toBe(false);
    });
  });
});
