import { describe, it, expect } from "vitest";
import { createWorkspaceSchema } from "@/lib/validations/workspace";

const mockT = (key: string) => {
  const messages: Record<string, string> = {
    "common.validation.nameRequired": "Name is required",
    "common.validation.hexColor": "Must be a valid hex color",
    "common.validation.max50Chars": "Must be at most 50 characters",
  };
  return messages[key] ?? key;
};

describe("workspace-validation", () => {
  describe("createWorkspaceSchema", () => {
    const schema = createWorkspaceSchema(mockT);

    it("should validate valid workspace data", () => {
      const result = schema.safeParse({
        name: "My Workspace",
        description: "A workspace",
        color: "#3B82F6",
        icon: "folder",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty name", () => {
      const result = schema.safeParse({ name: "" });
      expect(result.success).toBe(false);
    });

    it("should accept valid hex color", () => {
      const result = schema.safeParse({ name: "WS", color: "#FF5733", description: "" });
      expect(result.success).toBe(true);
    });

    it("should accept empty color", () => {
      const result = schema.safeParse({ name: "WS", color: "", description: "" });
      expect(result.success).toBe(true);
    });

    it("should reject invalid color format", () => {
      const result = schema.safeParse({ name: "WS", color: "red" });
      expect(result.success).toBe(false);
    });

    it("should reject invalid hex color", () => {
      const result = schema.safeParse({ name: "WS", color: "#GGG" });
      expect(result.success).toBe(false);
    });
  });
});
