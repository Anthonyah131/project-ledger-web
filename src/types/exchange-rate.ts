// types/exchange-rate.ts
// DTOs for exchange rate endpoints

export interface ExchangeRateResponse {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  amount: number;
  convertedAmount: number;
  date: string;
}

export interface ExchangeRateLatestResponse {
  baseCurrency: string;
  date: string;
  rates: Record<string, number>;
}
