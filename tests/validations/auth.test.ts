import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
} from "@/lib/validations/auth";

const mockT = (key: string, params?: Record<string, string | number>) => {
  const messages: Record<string, string> = {
    "auth.validation.emailRequired": "Email is required",
    "auth.validation.emailInvalid": "Invalid email address",
    "auth.validation.passwordRequired": "Password is required",
    "auth.validation.nameRequired": "Name is required",
    "auth.validation.passwordMinLength": "Password must be at least 8 characters",
    "auth.validation.confirmPasswordRequired": "Please confirm your password",
    "auth.validation.passwordMismatch": "Passwords do not match",
    "auth.validation.otpLength": "OTP must be 6 digits",
    "auth.validation.otpNumeric": "OTP must contain only numbers",
    "auth.validation.passwordMaxLength": "Password must be at most 128 characters",
    "auth.validation.currentPasswordRequired": "Current password is required",
    "auth.validation.passwordSameAsCurrent": "New password must be different from current",
    "auth.validation.nameMaxLength": "Name must be at most 255 characters",
    "auth.validation.avatarUrlInvalid": "Invalid avatar URL",
  };
  const msg = messages[key] ?? key;
  if (params) {
    return Object.entries(params).reduce((acc, [k, v]) => acc.replace(`{${k}}`, String(v)), msg);
  }
  return msg;
};

describe("auth-validation", () => {
  describe("loginSchema", () => {
    const schema = loginSchema(mockT);

    it("should validate valid login data", () => {
      const result = schema.safeParse({ email: "test@example.com", password: "password123" });
      expect(result.success).toBe(true);
    });

    it("should reject empty email", () => {
      const result = schema.safeParse({ email: "", password: "password123" });
      expect(result.success).toBe(false);
    });

    it("should reject invalid email format", () => {
      const result = schema.safeParse({ email: "not-an-email", password: "password123" });
      expect(result.success).toBe(false);
    });

    it("should reject empty password", () => {
      const result = schema.safeParse({ email: "test@example.com", password: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    const schema = registerSchema(mockT);

    it("should validate valid registration data", () => {
      const result = schema.safeParse({
        name: "Test User",
        email: "test@example.com",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      });
      expect(result.success).toBe(true);
    });

    it("should reject mismatched passwords", () => {
      const result = schema.safeParse({
        name: "Test User",
        email: "test@example.com",
        password: "SecurePass123!",
        confirmPassword: "DifferentPass456!",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.issues.find((e) => e.path.includes("confirmPassword"));
        expect(error?.message).toBe("Passwords do not match");
      }
    });

    it("should reject short password", () => {
      const result = schema.safeParse({
        name: "Test User",
        email: "test@example.com",
        password: "short",
        confirmPassword: "short",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty name", () => {
      const result = schema.safeParse({
        name: "",
        email: "test@example.com",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("forgotPasswordSchema", () => {
    const schema = forgotPasswordSchema(mockT);

    it("should validate valid email", () => {
      const result = schema.safeParse({ email: "test@example.com" });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = schema.safeParse({ email: "invalid" });
      expect(result.success).toBe(false);
    });
  });

  describe("verifyOtpSchema", () => {
    const schema = verifyOtpSchema(mockT);

    it("should validate 6-digit numeric OTP", () => {
      const result = schema.safeParse({ otpCode: "123456" });
      expect(result.success).toBe(true);
    });

    it("should reject OTP with wrong length", () => {
      const result = schema.safeParse({ otpCode: "12345" });
      expect(result.success).toBe(false);
    });

    it("should reject OTP with non-numeric characters", () => {
      const result = schema.safeParse({ otpCode: "12345a" });
      expect(result.success).toBe(false);
    });
  });

  describe("resetPasswordSchema", () => {
    const schema = resetPasswordSchema(mockT);

    it("should validate valid reset password data", () => {
      const result = schema.safeParse({
        newPassword: "NewSecurePass123!",
        confirmPassword: "NewSecurePass123!",
      });
      expect(result.success).toBe(true);
    });

    it("should reject mismatched passwords", () => {
      const result = schema.safeParse({
        newPassword: "NewSecurePass123!",
        confirmPassword: "DifferentPass456!",
      });
      expect(result.success).toBe(false);
    });

    it("should reject short password", () => {
      const result = schema.safeParse({
        newPassword: "short",
        confirmPassword: "short",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("changePasswordSchema", () => {
    const schema = changePasswordSchema(mockT);

    it("should validate valid change password data", () => {
      const result = schema.safeParse({
        currentPassword: "OldPass123!",
        newPassword: "NewSecurePass456!",
        confirmPassword: "NewSecurePass456!",
      });
      expect(result.success).toBe(true);
    });

    it("should reject same current and new password", () => {
      const result = schema.safeParse({
        currentPassword: "SamePass123!",
        newPassword: "SamePass123!",
        confirmPassword: "SamePass123!",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.issues.find((e) => e.path.includes("newPassword"));
        expect(error?.message).toBe("New password must be different from current");
      }
    });
  });

  describe("updateProfileSchema", () => {
    const schema = updateProfileSchema(mockT);

    it("should validate valid profile data", () => {
      const result = schema.safeParse({ fullName: "Test User", avatarUrl: "" });
      expect(result.success).toBe(true);
    });

    it("should validate with valid avatar URL", () => {
      const result = schema.safeParse({ fullName: "Test User", avatarUrl: "https://example.com/avatar.png" });
      expect(result.success).toBe(true);
    });

    it("should reject empty full name", () => {
      const result = schema.safeParse({ fullName: "", avatarUrl: "" });
      expect(result.success).toBe(false);
    });

    it("should reject invalid avatar URL", () => {
      const result = schema.safeParse({ fullName: "Test User", avatarUrl: "not-a-url" });
      expect(result.success).toBe(false);
    });
  });
});
