// types/income.ts
// Income model type definitions

import type { CurrencyExchangeRequest, CurrencyExchangeResponse } from "@/types/expense";

export interface IncomeResponse {
  id: string;
  projectId: string;
  categoryId: string;
  categoryName: string;
  paymentMethodId: string;
  createdByUserId: string;
  originalAmount: number;
  originalCurrency: string;
  exchangeRate: number;
  convertedAmount: number;
  title: string;
  description: string | null;
  incomeDate: string;
  receiptNumber: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedByUserId: string | null;
  currencyExchanges: CurrencyExchangeResponse[];
}

export interface IncomesPageResponse {
  items: IncomeResponse[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CreateIncomeRequest {
  categoryId: string;
  paymentMethodId: string;
  originalAmount: number;
  originalCurrency: string;
  exchangeRate?: number;
  convertedAmount: number;
  title: string;
  description?: string | null;
  incomeDate: string;
  receiptNumber?: string | null;
  notes?: string | null;
  currencyExchanges?: CurrencyExchangeRequest[] | null;
}

export interface UpdateIncomeRequest {
  categoryId: string;
  paymentMethodId: string;
  originalAmount: number;
  originalCurrency: string;
  exchangeRate?: number;
  convertedAmount: number;
  title: string;
  description?: string | null;
  incomeDate: string;
  receiptNumber?: string | null;
  notes?: string | null;
  /** null = no change, [] = remove all, list = replace all */
  currencyExchanges?: CurrencyExchangeRequest[] | null;
}
