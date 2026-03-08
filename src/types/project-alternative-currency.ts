// types/project-alternative-currency.ts
// Alternative display currencies configured per project

export interface AddAlternativeCurrencyRequest {
  currencyCode: string;
}

export interface ProjectAlternativeCurrencyResponse {
  id: string;
  currencyCode: string;
  currencyName: string;
  currencySymbol: string;
  createdAt: string;
}
