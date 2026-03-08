// services/exchange-rate-service.ts

import { api } from "@/lib/api-client";
import type {
  ExchangeRateLatestResponse,
  ExchangeRateResponse,
} from "@/types/exchange-rate";

export interface GetExchangeRateParams {
  from: string;
  to: string;
  amount: number;
}

export function getExchangeRate(params: GetExchangeRateParams) {
  const query = new URLSearchParams({
    from: params.from,
    to: params.to,
    amount: String(params.amount),
  });

  return api.get<ExchangeRateResponse>(`/exchange-rates?${query.toString()}`);
}

export function getLatestExchangeRates(base: string) {
  const query = new URLSearchParams({ base });
  return api.get<ExchangeRateLatestResponse>(`/exchange-rates/latest?${query.toString()}`);
}
