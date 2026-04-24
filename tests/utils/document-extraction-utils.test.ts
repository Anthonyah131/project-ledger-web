import { describe, it, expect } from "vitest";
import { ApiClientError } from "@/lib/api-client";
import {
  isSupportedDocumentFile,
  getExtractionQuotaBadgeLabel,
  getExtractionQuotaBadgeVariant,
  getDocumentExtractionErrorMessage,
  getDocumentValidationError,
  MAX_DOCUMENT_UPLOAD_SIZE_MB,
} from "@/lib/document-extraction-utils";

describe("document-extraction-utils", () => {
  describe("isSupportedDocumentFile", () => {
    it("should return true for PDF files", () => {
      const file = new File([""], "test.pdf", { type: "application/pdf" });
      expect(isSupportedDocumentFile(file)).toBe(true);
    });

    it("should return true for JPG files", () => {
      const file = new File([""], "test.jpg", { type: "image/jpeg" });
      expect(isSupportedDocumentFile(file)).toBe(true);
    });

    it("should return true for JPEG files", () => {
      const file = new File([""], "test.jpeg", { type: "image/jpeg" });
      expect(isSupportedDocumentFile(file)).toBe(true);
    });

    it("should return true for PNG files", () => {
      const file = new File([""], "test.png", { type: "image/png" });
      expect(isSupportedDocumentFile(file)).toBe(true);
    });

    it("should return true for WEBP files", () => {
      const file = new File([""], "test.webp", { type: "image/webp" });
      expect(isSupportedDocumentFile(file)).toBe(true);
    });

    it("should return true for BMP files", () => {
      const file = new File([""], "test.bmp", { type: "image/bmp" });
      expect(isSupportedDocumentFile(file)).toBe(true);
    });

    it("should return true for TIFF files", () => {
      const file = new File([""], "test.tiff", { type: "image/tiff" });
      expect(isSupportedDocumentFile(file)).toBe(true);
    });

    it("should return true for GIF files", () => {
      const file = new File([""], "test.gif", { type: "image/gif" });
      expect(isSupportedDocumentFile(file)).toBe(true);
    });

    it("should return true for files with uppercase extension", () => {
      const file = new File([""], "test.PDF", { type: "application/pdf" });
      expect(isSupportedDocumentFile(file)).toBe(true);
    });

    it("should return false for unsupported file types", () => {
      const file = new File([""], "test.doc", { type: "application/msword" });
      expect(isSupportedDocumentFile(file)).toBe(false);
    });

    it("should check mime type when extension is unusual", () => {
      const file = new File([""], "test.xyz", { type: "application/pdf" });
      expect(isSupportedDocumentFile(file)).toBe(true);
    });

    it("should return false for unknown mime types with unknown extension", () => {
      const file = new File([""], "test.xyz", { type: "application/xyz" });
      expect(isSupportedDocumentFile(file)).toBe(false);
    });

    it("should return true for image subtypes", () => {
      const file = new File([""], "test", { type: "image/gif" });
      expect(isSupportedDocumentFile(file)).toBe(true);
    });
  });

  describe("getExtractionQuotaBadgeLabel", () => {
    const mockT = (key: string, params?: Record<string, string | number>) => {
      if (params?.n) return `translated:${key}:${params.n}`;
      return `translated:${key}`;
    };

    it("should return noQuota label when quota is null", () => {
      const result = getExtractionQuotaBadgeLabel(null, mockT);
      expect(result).toBe("translated:documentExtraction.quota.noQuota");
    });

    it("should return notAvailable when canUseOcr is false", () => {
      const quota = { canUseOcr: false, isUnlimited: false, remainingThisMonth: 5 };
      const result = getExtractionQuotaBadgeLabel(quota, mockT);
      expect(result).toBe("translated:documentExtraction.quota.notAvailable");
    });

    it("should return unlimited when isUnlimited is true", () => {
      const quota = { canUseOcr: true, isUnlimited: true, remainingThisMonth: null };
      const result = getExtractionQuotaBadgeLabel(quota, mockT);
      expect(result).toBe("translated:documentExtraction.quota.unlimited");
    });

    it("should return noData when remainingThisMonth is null", () => {
      const quota = { canUseOcr: true, isUnlimited: false, remainingThisMonth: null };
      const result = getExtractionQuotaBadgeLabel(quota, mockT);
      expect(result).toBe("translated:documentExtraction.quota.noData");
    });

    it("should return remaining count with translation", () => {
      const quota = { canUseOcr: true, isUnlimited: false, remainingThisMonth: 42 };
      const result = getExtractionQuotaBadgeLabel(quota, mockT);
      expect(result).toBe("translated:documentExtraction.quota.remaining:42");
    });
  });

  describe("getExtractionQuotaBadgeVariant", () => {
    it("should return destructive when quota is null", () => {
      const result = getExtractionQuotaBadgeVariant(null);
      expect(result).toBe("destructive");
    });

    it("should return destructive when canUseOcr is false", () => {
      const quota = { canUseOcr: false, isUnlimited: false, remainingThisMonth: 5 };
      const result = getExtractionQuotaBadgeVariant(quota);
      expect(result).toBe("destructive");
    });

    it("should return secondary when isUnlimited is true", () => {
      const quota = { canUseOcr: true, isUnlimited: true, remainingThisMonth: null };
      const result = getExtractionQuotaBadgeVariant(quota);
      expect(result).toBe("secondary");
    });

    it("should return destructive when remainingThisMonth is 0", () => {
      const quota = { canUseOcr: true, isUnlimited: false, remainingThisMonth: 0 };
      const result = getExtractionQuotaBadgeVariant(quota);
      expect(result).toBe("destructive");
    });

    it("should return outline for normal quota", () => {
      const quota = { canUseOcr: true, isUnlimited: false, remainingThisMonth: 10 };
      const result = getExtractionQuotaBadgeVariant(quota);
      expect(result).toBe("outline");
    });
  });

  describe("getDocumentExtractionErrorMessage", () => {
    const mockT = (key: string) => `translated:${key}`;

    it("should return invalidFile for 400 error", () => {
      const error = new ApiClientError(400, { message: "Bad Request" });
      const result = getDocumentExtractionErrorMessage(error, mockT);
      expect(result).toBe("translated:documentExtraction.errors.invalidFile");
    });

    it("should return planLimit for 403 plan error", () => {
      const error = new ApiClientError(403, { message: "Forbidden", code: "PLAN_LIMIT_EXCEEDED" });
      const result = getDocumentExtractionErrorMessage(error, mockT);
      expect(result).toBe("translated:documentExtraction.errors.planLimit");
    });

    it("should return forbidden for 403 non-plan error", () => {
      const error = new ApiClientError(403, { message: "Forbidden" });
      const result = getDocumentExtractionErrorMessage(error, mockT);
      expect(result).toBe("translated:documentExtraction.errors.forbidden");
    });

    it("should return notFound for 404 error", () => {
      const error = new ApiClientError(404, { message: "Not Found" });
      const result = getDocumentExtractionErrorMessage(error, mockT);
      expect(result).toBe("translated:documentExtraction.errors.notFound");
    });

    it("should return error message for other status codes", () => {
      const error = new ApiClientError(500, { message: "Internal Server Error" });
      const result = getDocumentExtractionErrorMessage(error, mockT);
      expect(result).toBe("Internal Server Error");
    });

    it("should return generic error for non-ApiClientError", () => {
      const error = new Error("Something went wrong");
      const result = getDocumentExtractionErrorMessage(error, mockT);
      expect(result).toBe("Something went wrong");
    });

    it("should return generic error for unknown error type", () => {
      const result = getDocumentExtractionErrorMessage("string error" as never, mockT);
      expect(result).toBe("translated:documentExtraction.errors.generic");
    });
  });

  describe("getDocumentValidationError", () => {
    const mockT = (key: string, params?: Record<string, string | number>) => {
      if (params?.maxMb) return `translated:${key}:${params.maxMb}`;
      return `translated:${key}`;
    };

    it("should return noFile error when file is null", () => {
      const result = getDocumentValidationError(null, mockT);
      expect(result).toBe("translated:documentExtraction.errors.noFile");
    });

    it("should return unsupportedFormat for invalid file type", () => {
      const file = new File([""], "test.doc", { type: "application/msword" });
      const result = getDocumentValidationError(file, mockT);
      expect(result).toBe("translated:documentExtraction.errors.unsupportedFormat");
    });

    it("should return fileTooLarge error for oversized files", () => {
      const maxSize = MAX_DOCUMENT_UPLOAD_SIZE_MB * 1024 * 1024;
      const file = new File([new ArrayBuffer(maxSize + 1)], "test.pdf", { type: "application/pdf" });
      const result = getDocumentValidationError(file, mockT);
      expect(result).toBe(`translated:documentExtraction.errors.fileTooLarge:${MAX_DOCUMENT_UPLOAD_SIZE_MB}`);
    });

    it("should return null for valid files", () => {
      const file = new File([""], "test.pdf", { type: "application/pdf" });
      const result = getDocumentValidationError(file, mockT);
      expect(result).toBeNull();
    });

    it("should return null for files at exactly max size", () => {
      const maxSize = MAX_DOCUMENT_UPLOAD_SIZE_MB * 1024 * 1024;
      const file = new File([new ArrayBuffer(maxSize)], "test.pdf", { type: "application/pdf" });
      const result = getDocumentValidationError(file, mockT);
      expect(result).toBeNull();
    });
  });

  describe("MAX_DOCUMENT_UPLOAD_SIZE_MB", () => {
    it("should be 10 MB", () => {
      expect(MAX_DOCUMENT_UPLOAD_SIZE_MB).toBe(10);
    });
  });
});