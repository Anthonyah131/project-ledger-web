import type { OcrExtractionQuotaResponse } from "@/types/expense"

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

export function getExtractionQuotaBadgeLabel(quota: OcrExtractionQuotaResponse | null) {
  if (!quota) return "Sin cuota"
  if (!quota.canUseOcr) return "OCR no disponible"
  if (quota.isUnlimited) return "Ilimitado"
  if (quota.remainingThisMonth == null) return "Sin datos"
  return `${quota.remainingThisMonth} restantes`
}

export function getExtractionQuotaBadgeVariant(
  quota: OcrExtractionQuotaResponse | null,
): "outline" | "destructive" | "secondary" {
  if (!quota || !quota.canUseOcr) return "destructive"
  if (quota.isUnlimited) return "secondary"
  if ((quota.remainingThisMonth ?? 0) <= 0) return "destructive"
  return "outline"
}
