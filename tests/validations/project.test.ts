import { describe, it, expect } from "vitest";
import {
  createProjectSchema,
  updateProjectSchema,
} from "@/lib/validations/project";

const mockT = (key: string) => {
  const messages: Record<string, string> = {
    "common.validation.nameRequired": "Name is required",
    "common.validation.max255Chars": "Must be at most 255 characters",
    "common.validation.currencyRequired": "Currency is required",
  };
  return messages[key] ?? key;
};

describe("project-validation", () => {
  describe("createProjectSchema", () => {
    const schema = createProjectSchema(mockT);

    it("should validate valid project data", () => {
      const result = schema.safeParse({
        name: "My Project",
        currencyCode: "USD",
        description: "A great project",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty name", () => {
      const result = schema.safeParse({
        name: "",
        currencyCode: "USD",
      });
      expect(result.success).toBe(false);
    });

    it("should reject name exceeding 255 characters", () => {
      const result = schema.safeParse({
        name: "a".repeat(256),
        currencyCode: "USD",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty currency code", () => {
      const result = schema.safeParse({
        name: "My Project",
        currencyCode: "",
      });
      expect(result.success).toBe(false);
    });

    it("should accept project without description", () => {
      const result = schema.safeParse({
        name: "My Project",
        currencyCode: "USD",
        description: "",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("updateProjectSchema", () => {
    const schema = updateProjectSchema(mockT);

    it("should validate valid update data", () => {
      const result = schema.safeParse({
        name: "Updated Project",
        description: "Updated description",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty name", () => {
      const result = schema.safeParse({
        name: "",
        description: "Description",
      });
      expect(result.success).toBe(false);
    });

    it("should accept empty description", () => {
      const result = schema.safeParse({
        name: "Updated Project",
        description: "",
      });
      expect(result.success).toBe(true);
    });
  });
});
