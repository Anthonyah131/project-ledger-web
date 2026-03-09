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
 * Show a toast for an API error, with special handling for plan-limit 403s.
 *
 * - Plan errors (403 with "plan" in message) → warning toast with upgrade hint.
 * - Other errors → standard error toast with the backend message.
 *
 * @returns the extracted error message string.
 */
export function toastApiError(err: unknown, label: string): string {
  const msg = getErrorMessage(err, label);

  if (err instanceof ApiClientError && err.isPlanError) {
    toast.warning("Límite de plan alcanzado", {
      description: msg,
    });
  } else if (err instanceof ApiClientError && err.isBusinessError) {
    toast.warning(label, { description: msg });
  } else {
    toast.error(label, { description: msg });
  }

  return msg;
}
