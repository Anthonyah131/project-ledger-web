// lib/error-utils.ts
// Centralized error handling utilities for API errors.
// Provides consistent toast messages, distinguishing plan-limit errors
// from generic errors.

import { toast } from "sonner";
import { ApiClientError } from "@/lib/api-client";

/**
 * Extract a user-friendly message from any caught error.
 */
function getErrorMessage(err: unknown, fallback = "Error inesperado"): string {
  if (err instanceof Error) return err.message;
  return fallback;
}

/**
 * Show a toast for an API error with context-aware handling per error code.
 *
 * - `PLAN_LIMIT_EXCEEDED` → warning "Límite de plan alcanzado"
 * - `PLAN_DENIED`         → warning "Función no disponible en tu plan"
 * - `TOO_MANY_REQUESTS`   → warning "Demasiadas solicitudes"
 * - 400 (business errors) → warning with label + backend message
 * - everything else       → error toast with label + backend message
 *
 * @returns the extracted error message string.
 */
export function toastApiError(err: unknown, label: string): string {
  const msg = getErrorMessage(err, label);

  if (err instanceof ApiClientError && err.code === "PLAN_LIMIT_EXCEEDED") {
    toast.warning("Límite de plan alcanzado", {
      description: err.feature ? `${msg} (${err.feature})` : msg,
    });
  } else if (err instanceof ApiClientError && err.code === "PLAN_DENIED") {
    toast.warning("Función no disponible en tu plan", {
      description: err.feature ? `${msg} (${err.feature})` : msg,
    });
  } else if (err instanceof ApiClientError && err.status === 429) {
    toast.warning("Demasiadas solicitudes", { description: msg });
  } else if (err instanceof ApiClientError && err.isBusinessError) {
    toast.warning(label, { description: msg });
  } else {
    toast.error(label, { description: msg });
  }

  return msg;
}
