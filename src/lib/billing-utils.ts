// lib/billing-utils.ts
// Shared helpers for billing/subscription UX mapping.

import type { BillingSubscriptionStatus } from "@/types/subscription";

type TFn = (key: string, params?: Record<string, string | number>) => string

export interface BillingStatusMeta {
  label: string;
  description: string;
  tone: "success" | "warning" | "danger" | "muted";
  isActive: boolean;
}

const STATUS_TONE: Record<string, { tone: BillingStatusMeta["tone"]; isActive: boolean }> = {
  active:             { tone: "success",  isActive: true  },
  trialing:           { tone: "success",  isActive: true  },
  past_due:           { tone: "warning",  isActive: true  },
  canceled:           { tone: "muted",    isActive: false },
  incomplete:         { tone: "warning",  isActive: false },
  incomplete_expired: { tone: "danger",   isActive: false },
  unpaid:             { tone: "danger",   isActive: false },
}

export function getBillingStatusMeta(status: BillingSubscriptionStatus, t: TFn): BillingStatusMeta {
  const toneData = STATUS_TONE[status] ?? { tone: "muted" as const, isActive: false }
  const label = t(`billing.status.${status}.label`) || status
  const description = t(`billing.status.${status}.description`)
  return { label, description, tone: toneData.tone, isActive: toneData.isActive }
}

export function formatPlanPrice(monthlyPrice: number, currency: string, locale?: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: monthlyPrice % 1 === 0 ? 0 : 2,
  }).format(monthlyPrice);
}
