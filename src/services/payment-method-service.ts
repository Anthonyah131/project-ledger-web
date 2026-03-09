// services/payment-method-service.ts

import { api } from "@/lib/api-client";
import type {
  PaymentMethodResponse,
  CreatePaymentMethodRequest,
  UpdatePaymentMethodRequest,
  PaymentMethodExpensesResponse,
  PaymentMethodIncomesResponse,
  PaymentMethodProjectsResponse,
  PaymentMethodSummaryResponse,
} from "@/types/payment-method";

// ─── Payment Methods ───────────────────────────────────────────────────────────

export function getPaymentMethods() {
  return api.get<PaymentMethodResponse[]>("/payment-methods");
}

export function getPaymentMethod(id: string) {
  return api.get<PaymentMethodResponse>(`/payment-methods/${id}`);
}

export function createPaymentMethod(data: CreatePaymentMethodRequest) {
  return api.post<PaymentMethodResponse>("/payment-methods", data);
}

export function updatePaymentMethod(id: string, data: UpdatePaymentMethodRequest) {
  return api.put<PaymentMethodResponse>(`/payment-methods/${id}`, data);
}

export function deletePaymentMethod(id: string) {
  return api.delete<void>(`/payment-methods/${id}`);
}

// ─── Expenses (paginated) ───────────────────────────────────────────────────────

export interface GetPaymentMethodExpensesParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  from?: string;
  to?: string;
  projectId?: string;
}

export function getPaymentMethodExpenses(
  id: string,
  params: GetPaymentMethodExpensesParams = {}
) {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.pageSize !== undefined) query.set("pageSize", String(params.pageSize));
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortDirection) query.set("sortDirection", params.sortDirection);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.projectId) query.set("projectId", params.projectId);

  const qs = query.toString();
  const url = qs
    ? `/payment-methods/${id}/expenses?${qs}`
    : `/payment-methods/${id}/expenses`;

  return api.get<PaymentMethodExpensesResponse>(url);
}

// ─── Incomes (paginated) ──────────────────────────────────────────────────────

export interface GetPaymentMethodIncomesParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  from?: string;
  to?: string;
  projectId?: string;
}

export function getPaymentMethodIncomes(
  id: string,
  params: GetPaymentMethodIncomesParams = {}
) {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.pageSize !== undefined) query.set("pageSize", String(params.pageSize));
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortDirection) query.set("sortDirection", params.sortDirection);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.projectId) query.set("projectId", params.projectId);

  const qs = query.toString();
  const url = qs
    ? `/payment-methods/${id}/incomes?${qs}`
    : `/payment-methods/${id}/incomes`;

  return api.get<PaymentMethodIncomesResponse>(url);
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export function getPaymentMethodProjects(id: string) {
  return api.get<PaymentMethodProjectsResponse>(`/payment-methods/${id}/projects`);
}

export function getPaymentMethodSummary(id: string) {
  return api.get<PaymentMethodSummaryResponse>(`/payment-methods/${id}/summary`);
}
