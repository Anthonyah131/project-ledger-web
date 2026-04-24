// types/payment-method.ts
// Payment method model type definitions

import type { CurrencyExchangeResponse, SplitResponse } from "@/types/expense";

export type PaymentMethodType = 'bank' | 'cash' | 'card';

// ─── API shapes ────────────────────────────────────────────────────────────────

export interface PaymentMethodPartnerSummary {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface PaymentMethodResponse {
  id: string;
  name: string;
  type: PaymentMethodType;
  currency: string;
  bankName: string | null;
  accountNumber: string | null;
  description: string | null;
  /** ID del partner dueño de esta cuenta. null si no tiene partner asignado. */
  partner_id: string | null;
  /** Datos del partner asignado. null si no tiene partner o si fue eliminado. */
  partner: PaymentMethodPartnerSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentMethodRequest {
  name: string;
  type: PaymentMethodType;
  currency: string;
  bankName?: string;
  accountNumber?: string;
  description?: string;
}

export interface UpdatePaymentMethodRequest {
  name: string;
  type: PaymentMethodType;
  bankName?: string;
  accountNumber?: string;
  description?: string;
}

export interface PaymentMethodExpenseItem {
  id: string;
  projectId: string;
  categoryId: string;
  categoryName: string;
  paymentMethodId: string;
  createdByUserId: string;
  obligationId: string | null;
  originalAmount: number;
  originalCurrency: string;
  exchangeRate: number;
  convertedAmount: number;
  /** Monto en la moneda del método de pago. Null para gastos históricos. */
  accountAmount: number | null;
  /** Moneda del método de pago. Null para gastos históricos. */
  accountCurrency: string | null;
  title: string;
  description: string | null;
  expenseDate: string;
  receiptNumber: string | null;
  notes: string | null;
  isTemplate: boolean;
  isActive: boolean;
  hasSplits: boolean;
  splits: SplitResponse[] | null;
  currencyExchanges: CurrencyExchangeResponse[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedByUserId: string | null;
}

export interface PaymentMethodExpensesResponse {
  items: PaymentMethodExpenseItem[];
  /** Suma de accountAmount (en moneda del PM) de todos los gastos filtrados (no solo la página). */
  totalActiveAmount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaymentMethodIncomeItem {
  id: string;
  projectId: string;
  projectName: string | null;
  projectCurrency: string | null;
  categoryId: string;
  categoryName: string;
  paymentMethodId: string;
  createdByUserId: string;
  originalAmount: number;
  originalCurrency: string;
  exchangeRate: number;
  convertedAmount: number;
  accountAmount: number | null;
  accountCurrency: string | null;
  title: string;
  description: string | null;
  incomeDate: string;
  receiptNumber: string | null;
  notes: string | null;
isActive: boolean;
  hasSplits: boolean;
  splits: SplitResponse[] | null;
  currencyExchanges: CurrencyExchangeResponse[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedByUserId: string | null;
}

export interface PaymentMethodIncomesResponse {
  items: PaymentMethodIncomeItem[];
  totalActiveAmount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaymentMethodProjectItem {
  id: string;
  name: string;
  description: string | null;
  currency: string;
  currencyCode: string;
  ownerUserId: string;
  updatedAt: string;
  totalExpenseAmount: number;
  totalIncomeAmount: number;
  balance: number;
}

export interface PaymentMethodProjectsResponse {
  items: PaymentMethodProjectItem[];
  totalCount: number;
}

export interface PaymentMethodSummaryResponse {
  relatedExpensesCount: number;
  relatedIncomesCount: number;
  relatedProjectsCount: number;
  totalExpenseAmount: number;
  totalIncomeAmount: number;
  /** Moneda en que se expresan los totales (moneda del método de pago). */
  currency?: string;
}

export interface PaymentMethodBalanceResponse {
  payment_method_id: string;
  payment_method_name: string;
  currency: string;
  project_id: string;
  total_income: number;
  total_expenses: number;
  balance: number;
}

// ─── Lookup (lightweight list) ─────────────────────────────────────────────────

/** Minimal payment method shape returned by GET /payment-methods/lookup */
export interface PaymentMethodLookupItem {
  id: string;
  name: string;
  type: PaymentMethodType;
  currency: string;
}

/** Response from GET /payment-methods/lookup */
export interface PaymentMethodsLookupResponse {
  items: PaymentMethodLookupItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ─── DB model ──────────────────────────────────────────────────────────────────

export interface PaymentMethod {
  id: string;
  /** FK → users — the owner of this account */
  ownerUserId: string;
  /** Descriptive name (e.g. "Banco X - Savings") */
  name: string;
  type: PaymentMethodType;
  /** Account currency (ISO 4217, FK → currencies) */
  currency: string;
  /** Bank or card issuer name */
  bankName: string | null;
  /** Account or card number (last 4 digits, masked, etc.) */
  accountNumber: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedByUserId: string | null;
}
