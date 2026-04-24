import { describe, it, expect } from "vitest";
import { addMemberSchema, changeRoleSchema } from "@/lib/validations/member";

const mockT = (key: string) => {
  const messages: Record<string, string> = {
    "members.validation.emailRequired": "Email is required",
    "members.validation.emailInvalid": "Invalid email address",
    "members.validation.emailMaxLength": "Email must be at most 255 characters",
    "members.validation.roleRequired": "Role is required",
  };
  return messages[key] ?? key;
};

describe("member-validation", () => {
  describe("addMemberSchema", () => {
    const schema = addMemberSchema(mockT);

    it("should validate valid member data", () => {
      const result = schema.safeParse({ email: "user@example.com", role: "editor" });
      expect(result.success).toBe(true);
    });

    it("should reject empty email", () => {
      const result = schema.safeParse({ email: "", role: "editor" });
      expect(result.success).toBe(false);
    });

    it("should reject invalid email", () => {
      const result = schema.safeParse({ email: "not-email", role: "editor" });
      expect(result.success).toBe(false);
    });

    it("should reject invalid role", () => {
      const result = schema.safeParse({ email: "user@example.com", role: "owner" });
      expect(result.success).toBe(false);
    });

    it("should accept viewer role", () => {
      const result = schema.safeParse({ email: "user@example.com", role: "viewer" });
      expect(result.success).toBe(true);
    });
  });

  describe("changeRoleSchema", () => {
    const schema = changeRoleSchema(mockT);

    it("should validate valid role change", () => {
      const result = schema.safeParse({ role: "editor" });
      expect(result.success).toBe(true);
    });

    it("should accept viewer role", () => {
      const result = schema.safeParse({ role: "viewer" });
      expect(result.success).toBe(true);
    });

    it("should reject owner role", () => {
      const result = schema.safeParse({ role: "owner" });
      expect(result.success).toBe(false);
    });
  });
});
