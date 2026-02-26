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

  // ─── Alternative currency (optional display) ──────────────
  /** Secondary display currency; null when not used */
  altCurrency: string | null;
  /** Units of altCurrency per 1 unit of project currency (> 0 when set) */
  altExchangeRate: number | null;
  /** convertedAmount × altExchangeRate (> 0 when set) */
  altAmount: number | null;

  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedByUserId: string | null;
}
