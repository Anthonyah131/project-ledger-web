// types/income.ts
// Income model type definitions

import type {
  CurrencyExchangeRequest,
  CurrencyExchangeResponse,
  OcrExtractionQuotaResponse,
  SplitResponse,
  SplitInput,
} from "@/types/expense";

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
  accountAmount: number;
  accountCurrency: string;
  title: string;
  description: string | null;
  incomeDate: string;
  receiptNumber: string | null;
  notes: string | null;
  isActive: boolean;
  /** True if the income has partner splits recorded */
  hasSplits: boolean;
  currencyExchanges: CurrencyExchangeResponse[];
  /** Splits detail — only present on GET by ID. null if no splits */
  splits: SplitResponse[] | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedByUserId: string | null;
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
  accountAmount?: number;
  title: string;
  description?: string | null;
  incomeDate: string;
  receiptNumber?: string | null;
  notes?: string | null;
  isActive?: boolean;
  currencyExchanges?: CurrencyExchangeRequest[] | null;
  /** Explicit partner splits. Omit to let backend auto-assign */
  splits?: SplitInput[] | null;
}

export interface UpdateIncomeRequest {
  categoryId: string;
  paymentMethodId: string;
  originalAmount: number;
  originalCurrency: string;
  exchangeRate?: number;
  convertedAmount: number;
  accountAmount?: number;
  title: string;
  description?: string | null;
  incomeDate: string;
  receiptNumber?: string | null;
  notes?: string | null;
  isActive?: boolean;
  /** null = no change, [] = remove all, list = replace all */
  currencyExchanges?: CurrencyExchangeRequest[] | null;
  /**
   * Omit → keep existing splits unchanged.
   * [] → remove all splits.
   * items → replace all splits.
   */
  splits?: SplitInput[] | null;
}

export type IncomeDocumentKind = "receipt" | "invoice";

export interface IncomeExtractionDraft {
  categoryId: string | null;
  paymentMethodId: string | null;
  title: string | null;
  description: string | null;
  originalAmount: number | null;
  originalCurrency: string | null;
  exchangeRate: number | null;
  convertedAmount: number | null;
  accountAmount: number | null;
  accountCurrency: string | null;
  incomeDate: string | null;
  receiptNumber: string | null;
  notes: string | null;
  isActive: boolean;
  currencyExchanges: CurrencyExchangeRequest[] | null;
  detectedMerchantName: string | null;
  detectedPaymentMethodText: string | null;
}

export interface ExtractIncomeFromImageResponse {
  provider: string;
  documentKind: IncomeDocumentKind;
  modelId: string;
  draft: IncomeExtractionDraft;
  warnings?: string[];
}

export type IncomeExtractionQuotaResponse = OcrExtractionQuotaResponse;
