import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getIncomes,
  getIncome,
  createIncome,
  updateIncome,
  updateIncomeActiveState,
  deleteIncome,
  bulkCreateIncomes,
  extractIncomeFromImage,
  getIncomeExtractionQuota,
} from "@/services/income-service";
import {
  createSuccessResponse,
  createFetchMock,
  setupFetchMock,
  getLastFetchUrl,
  getLastFetchMethod,
  getLastFetchBody,
  getLastFetchHeaders,
} from "../mocks/api-client-mock";
import type {
  IncomeResponse,
  IncomesPageResponse,
  BulkCreateIncomesResponse,
  ExtractIncomeFromImageResponse,
} from "@/types/income";

const API_BASE_URL = "http://localhost:5192/api";
const PROJECT_ID = "proj-1";

describe("income-service", () => {
  let mockFetch: ReturnType<typeof createFetchMock>;

  beforeEach(() => {
    mockFetch = createFetchMock();
    vi.stubEnv("NEXT_PUBLIC_API_URL", API_BASE_URL);
    vi.stubEnv("NEXT_PUBLIC_ENV", "test");
    localStorage.setItem("accessToken", "test-token");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getIncomes", () => {
    it("should call GET /projects/:id/incomes", async () => {
      const mockResponse = createMockIncomesPageResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getIncomes(PROJECT_ID);

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/incomes`);
      expect(result).toEqual(mockResponse);
    });

    it("should build correct query params", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(createMockIncomesPageResponse())]);

      await getIncomes(PROJECT_ID, {
        page: 2,
        pageSize: 20,
        sortBy: "title",
        sortDirection: "desc",
        includeDeleted: true,
        isActive: false,
        from: "2025-01-01",
        to: "2025-12-31",
      });

      const url = getLastFetchUrl(mockFetch);
      expect(url).toContain("page=2");
      expect(url).toContain("pageSize=20");
      expect(url).toContain("sortBy=title");
      expect(url).toContain("isDescending=true");
      expect(url).toContain("includeDeleted=true");
      expect(url).toContain("isActive=false");
      expect(url).toContain("from=2025-01-01");
      expect(url).toContain("to=2025-12-31");
    });

    it("should include Authorization header", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(createMockIncomesPageResponse())]);

      await getIncomes(PROJECT_ID);

      const headers = getLastFetchHeaders(mockFetch);
      expect(headers["Authorization"]).toBe("Bearer test-token");
    });
  });

  describe("getIncome", () => {
    it("should call GET /projects/:id/incomes/:incomeId", async () => {
      const mockResponse = createMockIncomeResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getIncome(PROJECT_ID, "income-1");

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/incomes/income-1`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("createIncome", () => {
    it("should call POST /projects/:id/incomes", async () => {
      const mockResponse = createMockIncomeResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await createIncome(PROJECT_ID, {
        categoryId: "cat-1",
        paymentMethodId: "pm-1",
        originalAmount: 500,
        originalCurrency: "USD",
        convertedAmount: 500,
        title: "Client Payment",
        incomeDate: "2025-04-24",
      });

      expect(getLastFetchMethod(mockFetch)).toBe("POST");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/incomes`);
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.title).toBe("Client Payment");
      expect(body.originalAmount).toBe(500);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateIncome", () => {
    it("should call PUT /projects/:id/incomes/:incomeId", async () => {
      const mockResponse = createMockIncomeResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await updateIncome(PROJECT_ID, "income-1", {
        categoryId: "cat-1",
        paymentMethodId: "pm-1",
        originalAmount: 600,
        originalCurrency: "USD",
        convertedAmount: 600,
        title: "Updated Income",
        incomeDate: "2025-04-24",
      });

      expect(getLastFetchMethod(mockFetch)).toBe("PUT");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/incomes/income-1`);
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.title).toBe("Updated Income");
      expect(body.originalAmount).toBe(600);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateIncomeActiveState", () => {
    it("should call PATCH /projects/:id/incomes/:incomeId/active-state", async () => {
      const mockResponse = createMockIncomeResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await updateIncomeActiveState(PROJECT_ID, "income-1", { isActive: false });

      expect(getLastFetchMethod(mockFetch)).toBe("PATCH");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/incomes/income-1/active-state`);
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.isActive).toBe(false);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteIncome", () => {
    it("should call DELETE /projects/:id/incomes/:incomeId", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(undefined)]);

      await deleteIncome(PROJECT_ID, "income-1");

      expect(getLastFetchMethod(mockFetch)).toBe("DELETE");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/incomes/income-1`);
    });
  });

  describe("bulkCreateIncomes", () => {
    it("should call POST /projects/:id/incomes/bulk", async () => {
      const mockResponse: BulkCreateIncomesResponse = {
        created: 2,
        items: [
          { id: "inc-1", title: "Bulk Income 1", originalAmount: 100, convertedAmount: 100, date: "2025-04-24" },
          { id: "inc-2", title: "Bulk Income 2", originalAmount: 200, convertedAmount: 200, date: "2025-04-24" },
        ],
      };
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await bulkCreateIncomes(PROJECT_ID, {
        items: [
          {
            categoryId: "cat-1",
            paymentMethodId: "pm-1",
            originalAmount: 100,
            originalCurrency: "USD",
            exchangeRate: 1,
            convertedAmount: 100,
            title: "Bulk Income 1",
            date: "2025-04-24",
          },
          {
            categoryId: "cat-1",
            paymentMethodId: "pm-1",
            originalAmount: 200,
            originalCurrency: "USD",
            exchangeRate: 1,
            convertedAmount: 200,
            title: "Bulk Income 2",
            date: "2025-04-24",
          },
        ],
      });

      expect(getLastFetchMethod(mockFetch)).toBe("POST");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/incomes/bulk`);
      expect(result.created).toBe(2);
      expect(result.items).toHaveLength(2);
    });
  });

  describe("extractIncomeFromImage", () => {
    it("should call POST /projects/:id/incomes/extract-from-image with FormData", async () => {
      const mockResponse = createMockExtractResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const file = new File(["test"], "invoice.jpg", { type: "image/jpeg" });
      const result = await extractIncomeFromImage(PROJECT_ID, {
        file,
        documentKind: "invoice",
      });

      expect(getLastFetchMethod(mockFetch)).toBe("POST");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/incomes/extract-from-image`);
    });
  });

  describe("getIncomeExtractionQuota", () => {
    it("should call GET /projects/:id/incomes/extract-from-image/quota", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse({
        projectOwnerUserId: "user-1",
        planName: "Pro",
        planSlug: "pro",
        canUseOcr: true,
        usedThisMonth: 3,
        monthlyLimit: 50,
        remainingThisMonth: 47,
        isUnlimited: false,
        isAvailable: true,
        periodStartUtc: "2025-04-01T00:00:00Z",
        periodEndUtc: "2025-04-30T23:59:59Z",
      })]);

      const result = await getIncomeExtractionQuota(PROJECT_ID);

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/incomes/extract-from-image/quota`);
    });
  });
});

function createMockIncomesPageResponse(): IncomesPageResponse {
  return {
    items: [createMockIncomeResponse()],
    page: 1,
    pageSize: 12,
    totalCount: 1,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };
}

function createMockIncomeResponse(): IncomeResponse {
  return {
    id: "income-1",
    projectId: PROJECT_ID,
    categoryId: "cat-1",
    categoryName: "Sales",
    paymentMethodId: "pm-1",
    createdByUserId: "user-1",
    originalAmount: 500,
    originalCurrency: "USD",
    exchangeRate: 1,
    convertedAmount: 500,
    accountAmount: 500,
    accountCurrency: "USD",
    title: "Client Payment",
    description: null,
    incomeDate: "2025-04-24",
    receiptNumber: null,
    notes: null,
    isActive: true,
    hasSplits: false,
    currencyExchanges: [],
    splits: null,
    createdAt: "2025-04-24T00:00:00Z",
    updatedAt: "2025-04-24T00:00:00Z",
    isDeleted: false,
    deletedAt: null,
    deletedByUserId: null,
  };
}

function createMockExtractResponse(): ExtractIncomeFromImageResponse {
  return {
    provider: "openai",
    documentKind: "invoice",
    modelId: "gpt-4o",
    draft: {
      categoryId: null,
      paymentMethodId: null,
      title: null,
      description: null,
      originalAmount: null,
      originalCurrency: null,
      exchangeRate: null,
      convertedAmount: null,
      accountAmount: null,
      accountCurrency: null,
      incomeDate: null,
      receiptNumber: null,
      notes: null,
      isActive: true,
      currencyExchanges: null,
      detectedMerchantName: null,
      detectedPaymentMethodText: null,
    },
    warnings: [],
  };
}
