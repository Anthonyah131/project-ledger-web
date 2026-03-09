import { ApiClientError } from "@/lib/api-client"
import {
  MAX_DOCUMENT_UPLOAD_SIZE_MB,
  isSupportedDocumentFile,
} from "@/components/project-detail/shared/document-extraction/document-extraction-utils"

export function getDocumentExtractionErrorMessage(err: unknown): string {
  if (err instanceof ApiClientError) {
    if (err.status === 400) return "Archivo invalido o no se pudo extraer informacion del documento."
    if (err.status === 403) {
      if (err.isPlanError) {
        return "Tu plan no permite OCR o alcanzaste el limite mensual de lecturas."
      }
      return "No tienes permisos de edicion en este proyecto."
    }
    if (err.status === 404) return "No se encontro el proyecto para realizar la extraccion."
    return err.message
  }

  if (err instanceof Error) return err.message
  return "No fue posible extraer datos del documento."
}

export function getDocumentValidationError(file: File | null): string | null {
  if (!file) {
    return "Selecciona una imagen o PDF para extraer datos."
  }

  if (!isSupportedDocumentFile(file)) {
    return "Formato no soportado. Usa PDF o una imagen valida."
  }

  const maxBytes = MAX_DOCUMENT_UPLOAD_SIZE_MB * 1024 * 1024
  if (file.size > maxBytes) {
    return `El archivo supera ${MAX_DOCUMENT_UPLOAD_SIZE_MB} MB.`
  }

  return null
}
