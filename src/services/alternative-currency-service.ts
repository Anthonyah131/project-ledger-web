// services/alternative-currency-service.ts

import { api } from "@/lib/api-client";
import type {
  AddAlternativeCurrencyRequest,
  ProjectAlternativeCurrencyResponse,
} from "@/types/project-alternative-currency";

export function getAlternativeCurrencies(projectId: string) {
  return api.get<ProjectAlternativeCurrencyResponse[]>(
    `/projects/${projectId}/alternative-currencies`
  );
}

export function addAlternativeCurrency(
  projectId: string,
  data: AddAlternativeCurrencyRequest
) {
  return api.post<ProjectAlternativeCurrencyResponse>(
    `/projects/${projectId}/alternative-currencies`,
    data
  );
}

export function deleteAlternativeCurrency(projectId: string, code: string) {
  return api.delete<void>(`/projects/${projectId}/alternative-currencies/${code}`);
}
