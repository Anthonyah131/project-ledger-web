// lib/error-utils.ts
// Centralized error handling utilities for API errors.
// Provides consistent toast messages, distinguishing plan-limit errors
// from generic errors.

import { toast } from "sonner";
import { ApiClientError } from "@/lib/api-client";

type TFn = (key: string, params?: Record<string, string | number>) => string

/**
 * Extract a user-friendly message from any caught error.
 */
function getErrorMessage(err: unknown, fallback: string): string {
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
export function toastApiError(err: unknown, label: string, t?: TFn): string {
  const fallback = t ? t("common.errors.unexpected") : "Error inesperado"
  const msg = getErrorMessage(err, fallback);

  if (err instanceof ApiClientError && err.code === "PLAN_LIMIT_EXCEEDED") {
    const title = t ? t("common.errors.planLimitExceeded") : "Límite de plan alcanzado"
    toast.warning(title, {
      description: err.feature ? `${msg} (${err.feature})` : msg,
    });
  } else if (err instanceof ApiClientError && err.code === "PLAN_DENIED") {
    const title = t ? t("common.errors.planDenied") : "Función no disponible en tu plan"
    toast.warning(title, {
      description: err.feature ? `${msg} (${err.feature})` : msg,
    });
  } else if (err instanceof ApiClientError && err.status === 429) {
    const title = t ? t("common.errors.tooManyRequests") : "Demasiadas solicitudes"
    toast.warning(title, { description: msg });
  } else if (err instanceof ApiClientError && err.isBusinessError) {
    toast.warning(label, { description: msg });
  } else {
    toast.error(label, { description: msg });
  }

  return msg;
}
