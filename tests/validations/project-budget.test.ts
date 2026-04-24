import { describe, it, expect } from "vitest";
import { setProjectBudgetSchema } from "@/lib/validations/project-budget";

const mockT = (key: string) => {
  const messages: Record<string, string> = {
    "common.validation.amountRange": "Amount must be between 0.01 and 999,999,999,999.99",
    "common.validation.percentageRange": "Percentage must be between 1 and 100",
  };
  return messages[key] ?? key;
};

describe("project-budget-validation", () => {
  describe("setProjectBudgetSchema", () => {
    const schema = setProjectBudgetSchema(mockT);

    it("should validate valid budget data", () => {
      const result = schema.safeParse({ totalBudget: "5000.00", alertPercentage: "80" });
      expect(result.success).toBe(true);
    });

    it("should reject empty totalBudget", () => {
      const result = schema.safeParse({ totalBudget: "", alertPercentage: "80" });
      expect(result.success).toBe(false);
    });

    it("should reject zero totalBudget", () => {
      const result = schema.safeParse({ totalBudget: "0", alertPercentage: "80" });
      expect(result.success).toBe(false);
    });

    it("should reject negative totalBudget", () => {
      const result = schema.safeParse({ totalBudget: "-1000", alertPercentage: "80" });
      expect(result.success).toBe(false);
    });

    it("should reject alertPercentage below 1", () => {
      const result = schema.safeParse({ totalBudget: "5000", alertPercentage: "0" });
      expect(result.success).toBe(false);
    });

    it("should reject alertPercentage above 100", () => {
      const result = schema.safeParse({ totalBudget: "5000", alertPercentage: "101" });
      expect(result.success).toBe(false);
    });

    it("should accept alertPercentage at boundaries", () => {
      const resultLow = schema.safeParse({ totalBudget: "5000", alertPercentage: "1" });
      expect(resultLow.success).toBe(true);

      const resultHigh = schema.safeParse({ totalBudget: "5000", alertPercentage: "100" });
      expect(resultHigh.success).toBe(true);
    });

    it("should accept budget at upper limit", () => {
      const result = schema.safeParse({ totalBudget: "999999999999.99", alertPercentage: "80" });
      expect(result.success).toBe(true);
    });
  });
});
