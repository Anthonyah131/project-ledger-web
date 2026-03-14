// services/income-service.ts

import { api } from "@/lib/api-client";
import type {
  CreateIncomeRequest,
  ExtractIncomeFromImageResponse,
  IncomeDocumentKind,
  IncomeExtractionQuotaResponse,
  IncomeResponse,
  IncomesPageResponse,
  UpdateIncomeRequest,
} from "@/types/income";

export interface GetIncomesParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  /** Mapped to backend query param `isDescending` */
  sortDirection?: "asc" | "desc";
  includeDeleted?: boolean;
  isActive?: boolean;
}

export function getIncomes(projectId: string, params: GetIncomesParams = {}) {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.pageSize !== undefined) query.set("pageSize", String(params.pageSize));
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortDirection) {
    query.set("isDescending", String(params.sortDirection === "desc"));
  }
  if (params.includeDeleted !== undefined) {
    query.set("includeDeleted", String(params.includeDeleted));
  }
  if (params.isActive !== undefined) {
    query.set("isActive", String(params.isActive));
  }

  const qs = query.toString();
  const url = qs ? `/projects/${projectId}/incomes?${qs}` : `/projects/${projectId}/incomes`;

  return api.get<IncomesPageResponse>(url);
}

export function getIncome(projectId: string, incomeId: string) {
  return api.get<IncomeResponse>(`/projects/${projectId}/incomes/${incomeId}`);
}

export function createIncome(projectId: string, data: CreateIncomeRequest) {
  return api.post<IncomeResponse>(`/projects/${projectId}/incomes`, data);
}

export function updateIncome(projectId: string, incomeId: string, data: UpdateIncomeRequest) {
  return api.put<IncomeResponse>(`/projects/${projectId}/incomes/${incomeId}`, data);
}

interface UpdateIncomeActiveStateRequest {
  isActive: boolean;
}

export function updateIncomeActiveState(
  projectId: string,
  incomeId: string,
  data: UpdateIncomeActiveStateRequest
) {
  return api.patch<IncomeResponse>(
    `/projects/${projectId}/incomes/${incomeId}/active-state`,
    data
  );
}

export function deleteIncome(projectId: string, incomeId: string) {
  return api.delete<void>(`/projects/${projectId}/incomes/${incomeId}`);
}

export interface ExtractIncomeFromImageRequest {
  file: File;
  documentKind?: IncomeDocumentKind;
}

export function extractIncomeFromImage(
  projectId: string,
  data: ExtractIncomeFromImageRequest
) {
  const formData = new FormData();
  formData.append("file", data.file);
  if (data.documentKind) {
    formData.append("documentKind", data.documentKind);
  }

  return api.postForm<ExtractIncomeFromImageResponse>(
    `/projects/${projectId}/incomes/extract-from-image`,
    formData
  );
}

export function getIncomeExtractionQuota(projectId: string) {
  return api.get<IncomeExtractionQuotaResponse>(
    `/projects/${projectId}/incomes/extract-from-image/quota`
  );
}
