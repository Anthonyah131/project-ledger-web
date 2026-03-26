import { ApiClientError } from "@/lib/api-client"
import type { OcrExtractionQuotaResponse } from "@/types/expense"

type TFn = (key: string, params?: Record<string, string | number>) => string

export const MAX_DOCUMENT_UPLOAD_SIZE_MB = 10

const SUPPORTED_FILE_EXTENSIONS = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".bmp",
  ".tiff",
  ".tif",
  ".gif",
]

export function isSupportedDocumentFile(file: File): boolean {
  const lowerName = file.name.toLowerCase()
  if (SUPPORTED_FILE_EXTENSIONS.some((ext) => lowerName.endsWith(ext))) {
    return true
  }
  const mimeType = file.type.toLowerCase()
  return mimeType === "application/pdf" || mimeType.startsWith("image/")
}

export function getExtractionQuotaBadgeLabel(
  quota: OcrExtractionQuotaResponse | null,
  t: TFn,
): string {
  if (!quota) return t("documentExtraction.quota.noQuota")
  if (!quota.canUseOcr) return t("documentExtraction.quota.notAvailable")
  if (quota.isUnlimited) return t("documentExtraction.quota.unlimited")
  if (quota.remainingThisMonth == null) return t("documentExtraction.quota.noData")
  return t("documentExtraction.quota.remaining", { n: String(quota.remainingThisMonth) })
}

export function getExtractionQuotaBadgeVariant(
  quota: OcrExtractionQuotaResponse | null,
): "outline" | "destructive" | "secondary" {
  if (!quota || !quota.canUseOcr) return "destructive"
  if (quota.isUnlimited) return "secondary"
  if ((quota.remainingThisMonth ?? 0) <= 0) return "destructive"
  return "outline"
}

export function getDocumentExtractionErrorMessage(err: unknown, t: TFn): string {
  if (err instanceof ApiClientError) {
    if (err.status === 400) return t("documentExtraction.errors.invalidFile")
    if (err.status === 403) {
      if (err.isPlanError) return t("documentExtraction.errors.planLimit")
      return t("documentExtraction.errors.forbidden")
    }
    if (err.status === 404) return t("documentExtraction.errors.notFound")
    return err.message
  }

  if (err instanceof Error) return err.message
  return t("documentExtraction.errors.generic")
}

export function getDocumentValidationError(file: File | null, t: TFn): string | null {
  if (!file) {
    return t("documentExtraction.errors.noFile")
  }

  if (!isSupportedDocumentFile(file)) {
    return t("documentExtraction.errors.unsupportedFormat")
  }

  const maxBytes = MAX_DOCUMENT_UPLOAD_SIZE_MB * 1024 * 1024
  if (file.size > maxBytes) {
    return t("documentExtraction.errors.fileTooLarge", { maxMb: String(MAX_DOCUMENT_UPLOAD_SIZE_MB) })
  }

  return null
}
