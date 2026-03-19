// lib/split-utils.ts
// Helpers for partner split display logic.

import type { SplitResponse } from "@/types/expense"

/**
 * Returns true only when a movement has splits across 2 or more distinct partners.
 * A single partner with 100% split should NOT show the Split badge.
 */
export function hasMultiPartnerSplits(splits: SplitResponse[] | null | undefined): boolean {
  if (!splits || splits.length < 2) return false
  const uniquePartners = new Set(splits.map((s) => s.partnerId))
  return uniquePartners.size >= 2
}
