// lib/constants.ts
// Shared UI constants used across multiple list/shelf views.

// ─── Project accent colors (bg-* Tailwind classes) ─────────────────────────────
// Used in: projects shelf-view, list-view, expenses-list

export const ACCENT_COLORS = [
  "bg-primary",
  "bg-[oklch(0.60_0.16_155)]",
  "bg-[oklch(0.58_0.16_30)]",
  "bg-[oklch(0.55_0.14_280)]",
  "bg-[oklch(0.58_0.14_200)]",
  "bg-foreground/70",
  "bg-[oklch(0.62_0.14_55)]",
  "bg-[oklch(0.50_0.12_250)]",
] as const;

export function getAccentColor(index: number): string {
  return ACCENT_COLORS[index % ACCENT_COLORS.length];
}

// ─── Category / obligation accent colors (raw oklch values) ────────────────────
// Used in: obligations-list, categories-list

export const ACCENT_COLORS_RAW = [
  "oklch(0.55 0.20 255)",
  "oklch(0.55 0.20 290)",
  "oklch(0.55 0.20 330)",
  "oklch(0.60 0.18 20)",
  "oklch(0.60 0.16 55)",
  "oklch(0.55 0.18 145)",
  "oklch(0.50 0.15 200)",
  "oklch(0.55 0.18 175)",
] as const;

export function getAccentColorRaw(index: number): string {
  return ACCENT_COLORS_RAW[index % ACCENT_COLORS_RAW.length];
}

// ─── Project role labels ───────────────────────────────────────────────────────

export const ROLE_LABEL: Record<string, string> = {
  owner: "Propietario",
  editor: "Editor",
  viewer: "Lector",
};

// ─── Payment method constants ──────────────────────────────────────────────────

import type { PaymentMethodType } from "@/types/payment-method";

export const PAYMENT_METHOD_TYPE_LABEL: Record<PaymentMethodType, string> = {
  bank: "Banco",
  cash: "Efectivo",
  card: "Tarjeta",
};

/** Longer labels used in form selects (create/edit payment method) */
export const PAYMENT_METHOD_FORM_TYPE_LABEL: Record<PaymentMethodType, string> = {
  bank: "Cuenta bancaria",
  cash: "Efectivo",
  card: "Tarjeta",
};

export const PAYMENT_METHOD_ACCENT: Record<PaymentMethodType, string> = {
  bank: "bg-[oklch(0.55_0.14_280)]",
  card: "bg-primary",
  cash: "bg-[oklch(0.60_0.16_155)]",
};

// ─── Obligation status ─────────────────────────────────────────────────────────

import type { ObligationStatus } from "@/types/obligation";

export const STATUS_COLORS: Record<ObligationStatus, { dot: string; bg: string; text: string; label: string; color: string }> = {
  open: {
    dot: "bg-primary",
    bg: "bg-primary/10",
    text: "text-primary",
    label: "Abierta",
    color: "var(--primary)",
  },
  partially_paid: {
    dot: "bg-[oklch(0.62_0.14_85)]",
    bg: "bg-[oklch(0.62_0.14_85)]/10",
    text: "text-[oklch(0.62_0.14_85)]",
    label: "Pago parcial",
    color: "oklch(0.62 0.14 85)",
  },
  paid: {
    dot: "bg-[oklch(0.60_0.16_155)]",
    bg: "bg-[oklch(0.60_0.16_155)]/10",
    text: "text-[oklch(0.60_0.16_155)]",
    label: "Pagada",
    color: "oklch(0.60 0.16 155)",
  },
  overdue: {
    dot: "bg-[oklch(0.58_0.16_30)]",
    bg: "bg-[oklch(0.58_0.16_30)]/10",
    text: "text-[oklch(0.58_0.16_30)]",
    label: "Vencida",
    color: "oklch(0.58 0.16 30)",
  },
};
