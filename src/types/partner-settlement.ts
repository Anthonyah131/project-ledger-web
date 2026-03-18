// types/partner-settlement.ts

// ─── Shared ────────────────────────────────────────────────────────────────────

export interface SplitCurrencyExchangeItem {
  currencyCode: string
  exchangeRate: number
  convertedAmount: number
}

/** Used when sending currency exchanges in POST/PATCH requests */
export interface CurrencyExchangeRequest {
  currencyCode: string
  exchangeRate: number
  convertedAmount: number
}

// ─── Balance ───────────────────────────────────────────────────────────────────

export interface PartnerCurrencyTotal {
  currencyCode: string
  othersOweHim: number
  heOwesOthers: number
  settlementsPaid: number
  settlementsReceived: number
  netBalance: number
}

export interface PartnerBalanceItem {
  partnerId: string
  partnerName: string
  paidPhysically: number
  othersOweHim: number
  heOwesOthers: number
  settlementsReceived: number
  settlementsPaid: number
  netBalance: number
  currencyTotals: PartnerCurrencyTotal[]
}

export interface PairwiseCurrencyTotal {
  currencyCode: string
  aOwesB: number
  bOwesA: number
  settlementsAToB: number
  settlementsBToA: number
  netBalance: number
}

export interface PairwiseBalanceItem {
  partnerAId: string
  partnerAName: string
  partnerBId: string
  partnerBName: string
  aOwesB: number
  bOwesA: number
  settlementsAToB: number
  settlementsBToA: number
  /** negative = B owes A |netBalance|; positive = A owes B netBalance */
  netBalance: number
  currencyTotals: PairwiseCurrencyTotal[]
}

export interface MissingCurrencyExchangeWarning {
  transactionType: "expense" | "income"
  transactionId: string
  title: string
  date: string
  convertedAmount: number
}

export interface PartnersBalanceResponse {
  projectId: string
  currency: string
  partners: PartnerBalanceItem[]
  pairwiseBalances: PairwiseBalanceItem[]
  warnings: MissingCurrencyExchangeWarning[]
}

// ─── Settlement suggestions ────────────────────────────────────────────────────

export interface SettlementSuggestion {
  fromPartnerId: string
  fromPartnerName: string
  toPartnerId: string
  toPartnerName: string
  amount: number
  currency: string
}

export interface SettlementSuggestionsResponse {
  projectId: string
  currency: string
  suggestions: SettlementSuggestion[]
  note: string
}

// ─── History ───────────────────────────────────────────────────────────────────

export interface PartnerHistoryTransactionItem {
  type: "expense" | "income"
  transactionId: string
  title: string
  date: string
  splitAmount: number
  splitType: "percentage" | "fixed"
  splitValue: number
  payingPartner: string | null
  currencyExchanges: SplitCurrencyExchangeItem[]
}

export interface PartnerHistoryTransactions {
  items: PartnerHistoryTransactionItem[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface PartnerHistorySettlementItem {
  type: "settlement_paid" | "settlement_received"
  id: string
  date: string
  amount: number
  currency: string
  toPartner: string | null
  fromPartner: string | null
}

export interface PartnerHistoryResponse {
  partnerId: string
  partnerName: string
  transactions: PartnerHistoryTransactions
  settlements: PartnerHistorySettlementItem[]
}

// ─── Settlements CRUD ──────────────────────────────────────────────────────────

export interface SettlementCurrencyExchangeItem {
  currencyCode: string
  exchangeRate: number
  convertedAmount: number
}

export interface PartnerSettlementResponse {
  id: string
  projectId: string
  fromPartnerId: string
  fromPartnerName: string
  toPartnerId: string
  toPartnerName: string
  amount: number
  currency: string
  exchangeRate: number
  convertedAmount: number
  settlementDate: string
  description: string | null
  notes: string | null
  createdAt: string
  currencyExchanges: SettlementCurrencyExchangeItem[]
}

export interface SettlementsPageResponse {
  items: PartnerSettlementResponse[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface CreateSettlementRequest {
  fromPartnerId: string
  toPartnerId: string
  amount: number
  currency: string
  exchangeRate: number
  settlementDate: string
  description?: string
  notes?: string | null
  currencyExchanges?: CurrencyExchangeRequest[]
}

export interface UpdateSettlementRequest {
  amount?: number
  currency?: string
  exchangeRate?: number
  settlementDate?: string
  description?: string
  notes?: string
  /** Send [] to clear all exchanges. Omit to leave unchanged. */
  currencyExchanges?: CurrencyExchangeRequest[]
}
