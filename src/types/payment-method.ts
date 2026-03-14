// types/payment-method.ts
// Payment method model type definitions

import type { CurrencyExchangeResponse } from "@/types/expense";

export type PaymentMethodType = 'bank' | 'cash' | 'card';

// ─── API shapes ────────────────────────────────────────────────────────────────

export interface PaymentMethodResponse {
  id: string;
  name: string;
  type: PaymentMethodType;
  currency: string;
  bankName: string | null;
  accountNumber: string | null;
  description: string | null;
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
  title: string;
  description: string | null;
  expenseDate: string;
  receiptNumber: string | null;
  notes: string | null;
  isTemplate: boolean;
  isActive: boolean;
  currencyExchanges: CurrencyExchangeResponse[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedByUserId: string | null;
}

export interface PaymentMethodExpensesResponse {
  items: PaymentMethodExpenseItem[];
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
  currencyExchanges: CurrencyExchangeResponse[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedByUserId: string | null;
}

export interface PaymentMethodIncomesResponse {
  items: PaymentMethodIncomeItem[];
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
  currencyCode: string;
  ownerUserId: string;
  createdAt: string;
  updatedAt: string;
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
