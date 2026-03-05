// lib/billing-utils.ts
// Shared helpers for billing/subscription UX mapping.

import type { BillingSubscriptionStatus } from "@/types/subscription";

export interface BillingStatusMeta {
  label: string;
  description: string;
  tone: "success" | "warning" | "danger" | "muted";
  isActive: boolean;
}

export function getBillingStatusMeta(status: BillingSubscriptionStatus): BillingStatusMeta {
  switch (status) {
    case "active":
      return {
        label: "Activa",
        description: "Tu suscripción está al día.",
        tone: "success",
        isActive: true,
      };
    case "trialing":
      return {
        label: "En prueba",
        description: "Tu suscripción está en período de prueba.",
        tone: "success",
        isActive: true,
      };
    case "past_due":
      return {
        label: "Pago pendiente",
        description: "Tu suscripción sigue vigente, pero hay un pago pendiente.",
        tone: "warning",
        isActive: true,
      };
    case "canceled":
      return {
        label: "Cancelada",
        description: "La suscripción fue cancelada.",
        tone: "muted",
        isActive: false,
      };
    case "incomplete":
      return {
        label: "Incompleta",
        description: "El cobro inicial no terminó correctamente.",
        tone: "warning",
        isActive: false,
      };
    case "incomplete_expired":
      return {
        label: "Expirada",
        description: "La suscripción incompleta expiró.",
        tone: "danger",
        isActive: false,
      };
    case "unpaid":
      return {
        label: "Impaga",
        description: "No se logró cobrar la suscripción.",
        tone: "danger",
        isActive: false,
      };
    default:
      return {
        label: status,
        description: "Estado recibido desde Stripe.",
        tone: "muted",
        isActive: false,
      };
  }
}

export function formatPlanPrice(monthlyPrice: number, currency: string): string {
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: monthlyPrice % 1 === 0 ? 0 : 2,
  }).format(monthlyPrice);
}
