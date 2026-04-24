import { describe, it, expect, vi, beforeEach } from "vitest";
import { toastApiError } from "@/lib/error-utils";
import { ApiClientError } from "@/lib/api-client";

vi.mock("sonner", () => ({
  toast: {
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

import { toast } from "sonner";

describe("error-utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("toastApiError", () => {
    it("should show warning toast for PLAN_LIMIT_EXCEEDED", () => {
      const error = new ApiClientError(403, {
        message: "Has alcanzado el límite de proyectos",
        code: "PLAN_LIMIT_EXCEEDED",
        feature: "MaxProjects",
      });

      toastApiError(error, "Error");

      expect(toast.warning).toHaveBeenCalledWith(
        "Límite de plan alcanzado",
        expect.objectContaining({
          description: expect.stringContaining("MaxProjects"),
        })
      );
    });

    it("should show warning toast for PLAN_DENIED", () => {
      const error = new ApiClientError(403, {
        message: "Función no disponible",
        code: "PLAN_DENIED",
        feature: "CanShareProjects",
      });

      toastApiError(error, "Error");

      expect(toast.warning).toHaveBeenCalledWith(
        "Función no disponible en tu plan",
        expect.objectContaining({
          description: expect.stringContaining("CanShareProjects"),
        })
      );
    });

    it("should show warning toast for 429 TOO_MANY_REQUESTS", () => {
      const error = new ApiClientError(429, {
        message: "Demasiadas solicitudes",
      });

      toastApiError(error, "Error");

      expect(toast.warning).toHaveBeenCalledWith(
        "Demasiadas solicitudes",
        expect.objectContaining({
          description: "Demasiadas solicitudes",
        })
      );
    });

    it("should show warning toast for 400 business errors", () => {
      const error = new ApiClientError(400, {
        message: "Validation failed",
      });

      toastApiError(error, "Label");

      expect(toast.warning).toHaveBeenCalledWith("Label", {
        description: "Validation failed",
      });
    });

    it("should show error toast for other errors", () => {
      const error = new ApiClientError(500, {
        message: "Internal server error",
      });

      toastApiError(error, "Label");

      expect(toast.error).toHaveBeenCalledWith("Label", {
        description: "Internal server error",
      });
    });

    it("should use translation function when provided", () => {
      const t = (key: string) => {
        if (key === "common.errors.unexpected") return "Error inesperado";
        if (key === "common.errors_planLimitExceeded") return "Límite alcanzado";
        return key;
      };

      const error = new ApiClientError(403, {
        message: "Limit reached",
        code: "PLAN_LIMIT_EXCEEDED",
        feature: "MaxProjects",
      });

      toastApiError(error, "Error", t);

      expect(toast.warning).toHaveBeenCalled();
    });

    it("should return the error message", () => {
      const error = new ApiClientError(500, {
        message: "Test error message",
      });

      const result = toastApiError(error, "Label");

      expect(result).toBe("Test error message");
    });

    it("should handle generic Error", () => {
      const error = new Error("Generic error message");

      const result = toastApiError(error, "Label");

      expect(result).toBe("Generic error message");
      expect(toast.error).toHaveBeenCalled();
    });

    it("should handle unknown error with fallback message", () => {
      const result = toastApiError("string error", "Label");

      expect(result).toBe("Error inesperado");
      expect(toast.error).toHaveBeenCalled();
    });

    it("should handle ApiClientError without code", () => {
      const error = new ApiClientError(500, { message: "Server error" });

      toastApiError(error, "Label");

      expect(toast.error).toHaveBeenCalled();
    });

    it("should handle ApiClientError with plan error but no feature", () => {
      const error = new ApiClientError(403, {
        message: "Plan limit",
        code: "PLAN_LIMIT_EXCEEDED",
      });

      toastApiError(error, "Label");

      expect(toast.warning).toHaveBeenCalledWith(
        "Límite de plan alcanzado",
        expect.objectContaining({
          description: "Plan limit",
        })
      );
    });
  });
});
