// types/expense.ts
// Expense model type definitions

export interface Expense {
  id: string;
  /** FK → projects */
  projectId: string;
  /** FK → categories */
  categoryId: string;
  /** FK → payment_methods */
  paymentMethodId: string;
  /** FK → users — who recorded this expense */
  createdByUserId: string;
  /** FK → obligations — null = regular expense; set = payment toward a debt */
  obligationId: string | null;
  /** Optional equivalent applied in obligation currency for cross-currency payments */
  obligationEquivalentAmount: number | null;

  // ─── Currency & amounts ────────────────────────────────────
  /** Amount in the original currency (> 0) */
  originalAmount: number;
  /** ISO 4217 code of the original currency (FK → currencies) */
  originalCurrency: string;
  /**
   * Exchange rate applied: units of project currency per 1 unit of original currency.
   * E.g. project in CRC, expense in USD → rate = 520.00 (1 USD = 520 CRC).
   * Always 1 when originalCurrency === project.currencyCode.
   */
  exchangeRate: number;
  /** originalAmount × exchangeRate, in project base currency */
  convertedAmount: number;

  // ─── Descriptive fields ────────────────────────────────────
  title: string;
  description: string | null;
  /** Date the expense was incurred (YYYY-MM-DD) */
  expenseDate: string;
  receiptNumber: string | null;
  notes: string | null;
  /** True for reusable expense templates (may NOT have an obligationId) */
  isTemplate: boolean;
  /** True when expense is contabilized in totals and reports */
  isActive: boolean;

  // ─── Alternative currencies (0..N per transaction) ───────
  /** Converted amounts to project alternative currencies */
  currencyExchanges: CurrencyExchangeResponse[];

  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedByUserId: string | null;
}

// ─── API shapes ───────────────────────────────────────────────────────────────

export interface ExpenseResponse {
  id: string;
  projectId: string;
  categoryId: string;
  categoryName: string;
  paymentMethodId: string;
  createdByUserId: string;
  obligationId: string | null;
  obligationEquivalentAmount: number | null;
  originalAmount: number;
  originalCurrency: string;
  exchangeRate: number;
  convertedAmount: number;
  title: string;
  description: string | null;
  expenseDate: string;           // "YYYY-MM-DD"
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

export interface ExpensesPageResponse {
  items: ExpenseResponse[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CreateExpenseRequest {
  categoryId: string;
  paymentMethodId: string;
  obligationId?: string | null;
  obligationEquivalentAmount?: number | null;
  originalAmount: number;
  originalCurrency: string;
  exchangeRate?: number;
  convertedAmount?: number | null;
  title: string;
  description?: string | null;
  expenseDate: string;           // "YYYY-MM-DD"
  receiptNumber?: string | null;
  notes?: string | null;
  isTemplate?: boolean;
  isActive?: boolean;
  /** Optional replacement list of transaction conversions */
  currencyExchanges?: CurrencyExchangeRequest[] | null;
}

export interface UpdateExpenseRequest {
  categoryId: string;
  paymentMethodId: string;
  obligationId?: string | null;
  obligationEquivalentAmount?: number | null;
  originalAmount: number;
  originalCurrency: string;
  exchangeRate?: number;
  convertedAmount?: number | null;
  title: string;
  description?: string | null;
  expenseDate: string;           // "YYYY-MM-DD"
  receiptNumber?: string | null;
  notes?: string | null;
  isTemplate?: boolean;
  isActive?: boolean;
  /** null = no change, [] = remove all, list = replace all */
  currencyExchanges?: CurrencyExchangeRequest[] | null;
}

export interface CreateExpenseFromTemplateRequest {
  originalAmount?: number;
  convertedAmount?: number;
  expenseDate?: string;          // "YYYY-MM-DD"
  obligationId?: string | null;
  notes?: string | null;
}

export type ExpenseDocumentKind = "receipt" | "invoice";

export interface ExpenseExtractionDraft {
  categoryId: string | null;
  paymentMethodId: string | null;
  obligationId: string | null;
  obligationEquivalentAmount: number | null;
  title: string | null;
  description: string | null;
  originalAmount: number | null;
  originalCurrency: string | null;
  exchangeRate: number | null;
  convertedAmount: number | null;
  expenseDate: string | null;
  receiptNumber: string | null;
  notes: string | null;
  isTemplate: boolean;
  isActive: boolean;
  currencyExchanges: CurrencyExchangeRequest[] | null;
  detectedMerchantName: string | null;
  detectedPaymentMethodText: string | null;
}

export interface ExpenseExtractionCategorySuggestion {
  categoryId: string;
  name: string;
  confidence: number;
  reason: string | null;
}

export interface ExpenseExtractionPaymentMethodSuggestion {
  paymentMethodId: string;
  name: string;
  type: string;
  confidence: number;
  reason: string | null;
}

export interface ExpenseExtractionAvailableCategory {
  categoryId: string;
  name: string;
  isDefault: boolean;
}

export interface ExpenseExtractionAvailablePaymentMethod {
  paymentMethodId: string;
  name: string;
  type: string;
  currency: string;
  bankName: string | null;
  accountNumber: string | null;
}

export interface ExtractExpenseFromImageResponse {
  provider: string;
  documentKind: ExpenseDocumentKind;
  modelId: string;
  draft: ExpenseExtractionDraft;
  suggestedCategory: ExpenseExtractionCategorySuggestion | null;
  suggestedPaymentMethod: ExpenseExtractionPaymentMethodSuggestion | null;
  availableCategories: ExpenseExtractionAvailableCategory[];
  availablePaymentMethods: ExpenseExtractionAvailablePaymentMethod[];
  warnings: string[];
}

export interface OcrExtractionQuotaResponse {
  projectOwnerUserId: string;
  planName: string;
  planSlug: string;
  canUseOcr: boolean;
  usedThisMonth: number;
  monthlyLimit: number | null;
  remainingThisMonth: number | null;
  isUnlimited: boolean;
  isAvailable: boolean;
  periodStartUtc: string;
  periodEndUtc: string;
}

export interface CurrencyExchangeRequest {
  currencyCode: string;
  exchangeRate: number;
  convertedAmount: number;
}

export interface CurrencyExchangeResponse {
  id: string;
  currencyCode: string;
  exchangeRate: number;
  convertedAmount: number;
}
