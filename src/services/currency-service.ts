// services/currency-service.ts
// API calls for the Currencies catalogue (ISO 4217).
// Public endpoints — no authentication required.

import { api } from "@/lib/api-client";
import type { CurrencyResponse } from "@/types/currency";

// ─── List all active currencies ─────────────────────────────────────────────

/**
 * GET /api/currencies
 * Returns all active currencies from the ISO 4217 catalogue.
 * No authentication required.
 */
export function getCurrencies() {
  return api.get<CurrencyResponse[]>("/currencies", { skipAuth: true });
}

// ─── Get single currency by code ────────────────────────────────────────────

/**
 * GET /api/currencies/{code}
 * Returns a single currency by its ISO 4217 code (e.g. "USD", "CRC").
 * No authentication required.
 */
export function getCurrency(code: string) {
  return api.get<CurrencyResponse>(`/currencies/${code}`, { skipAuth: true });
}
