import { describe, it, expect } from "vitest";
import { createCategorySchema, updateCategorySchema } from "@/lib/validations/category";

const mockT = (key: string) => {
  const messages: Record<string, string> = {
    "common.validation.nameRequired": "Name is required",
    "common.validation.amountRange": "Amount must be between 0.01 and 999,999,999,999.99",
  };
  return messages[key] ?? key;
};

describe("category-validation", () => {
  describe("createCategorySchema", () => {
    const schema = createCategorySchema(mockT);

    it("should validate valid category data", () => {
      const result = schema.safeParse({ name: "Food & Dining", description: "", budgetAmount: "" });
      expect(result.success).toBe(true);
    });

    it("should reject empty name", () => {
      const result = schema.safeParse({ name: "", description: "", budgetAmount: "" });
      expect(result.success).toBe(false);
    });

    it("should accept valid budget amount", () => {
      const result = schema.safeParse({ name: "Food", description: "", budgetAmount: "500.00" });
      expect(result.success).toBe(true);
    });

    it("should reject budget amount below minimum", () => {
      const result = schema.safeParse({ name: "Food", description: "", budgetAmount: "0.001" });
      expect(result.success).toBe(false);
    });

    it("should accept empty budget amount", () => {
      const result = schema.safeParse({ name: "Food", description: "", budgetAmount: "" });
      expect(result.success).toBe(true);
    });
  });

  describe("updateCategorySchema", () => {
    const schema = updateCategorySchema(mockT);

    it("should validate valid update data", () => {
      const result = schema.safeParse({ name: "Updated Category", description: "Desc", budgetAmount: "1000" });
      expect(result.success).toBe(true);
    });

    it("should reject empty name on update", () => {
      const result = schema.safeParse({ name: "", description: "", budgetAmount: "" });
      expect(result.success).toBe(false);
    });
  });
});
