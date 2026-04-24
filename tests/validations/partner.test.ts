import { describe, it, expect } from "vitest";
import { createPartnerSchema } from "@/lib/validations/partner";

const mockT = (key: string) => {
  const messages: Record<string, string> = {
    "common.validation.nameRequired": "Name is required",
    "partners.validation.emailInvalid": "Invalid email address",
  };
  return messages[key] ?? key;
};

describe("partner-validation", () => {
  describe("createPartnerSchema", () => {
    const schema = createPartnerSchema(mockT);

    it("should validate valid partner data", () => {
      const result = schema.safeParse({
        name: "Acme Corp",
        email: "contact@acme.com",
        phone: "+1234567890",
        notes: "Important client",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty name", () => {
      const result = schema.safeParse({
        name: "",
        email: "contact@acme.com",
      });
      expect(result.success).toBe(false);
    });

    it("should accept valid email", () => {
      const result = schema.safeParse({ name: "Acme", email: "valid@example.com", phone: "", notes: "" });
      expect(result.success).toBe(true);
    });

    it("should accept empty email", () => {
      const result = schema.safeParse({ name: "Acme", email: "", phone: "", notes: "" });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email format", () => {
      const result = schema.safeParse({ name: "Acme", email: "not-an-email", phone: "", notes: "" });
      expect(result.success).toBe(false);
    });

    it("should accept partner without optional fields", () => {
      const result = schema.safeParse({ name: "Acme", phone: "", notes: "" });
      expect(result.success).toBe(true);
    });
  });
});
