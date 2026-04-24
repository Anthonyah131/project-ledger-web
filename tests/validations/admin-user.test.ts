import { describe, it, expect } from "vitest";
import { editAdminUserSchema } from "@/lib/validations/admin-user";

const mockT = (key: string) => {
  const messages: Record<string, string> = {
    "common.validation.nameRequired": "Name is required",
    "common.validation.max255Chars": "Must be at most 255 characters",
  };
  return messages[key] ?? key;
};

describe("admin-user-validation", () => {
  describe("editAdminUserSchema", () => {
    const schema = editAdminUserSchema(mockT);

    it("should validate valid admin user data", () => {
      const result = schema.safeParse({
        fullName: "Admin User",
        avatarUrl: "https://example.com/avatar.png",
        planId: "plan-pro",
        isAdmin: true,
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty fullName", () => {
      const result = schema.safeParse({ fullName: "" });
      expect(result.success).toBe(false);
    });

    it("should reject fullName exceeding 255 chars", () => {
      const result = schema.safeParse({ fullName: "a".repeat(256) });
      expect(result.success).toBe(false);
    });

    it("should accept partial updates", () => {
      const result = schema.safeParse({ fullName: "Updated Name" });
      expect(result.success).toBe(true);
    });

    it("should accept isAdmin toggle", () => {
      const result = schema.safeParse({ fullName: "Admin", isAdmin: false });
      expect(result.success).toBe(true);
    });
  });
});
