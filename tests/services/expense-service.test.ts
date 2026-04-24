import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  updateExpenseActiveState,
  deleteExpense,
  bulkCreateExpenses,
  getExpenseTemplates,
  createExpenseFromTemplate,
  extractExpenseFromImage,
  getExpenseExtractionQuota,
} from "@/services/expense-service";
import {
  createSuccessResponse,
  createErrorResponse,
  createFetchMock,
  setupFetchMock,
  getLastFetchUrl,
  getLastFetchMethod,
  getLastFetchBody,
  getLastFetchHeaders,
} from "../mocks/api-client-mock";
import type {
  ExpenseResponse,
  ExpensesPageResponse,
  BulkCreateExpensesResponse,
  ExtractExpenseFromImageResponse,
  OcrExtractionQuotaResponse,
} from "@/types/expense";

const API_BASE_URL = "http://localhost:5192/api";
const PROJECT_ID = "proj-1";

describe("expense-service", () => {
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

  describe("getExpenses", () => {
    it("should call GET /projects/:id/expenses", async () => {
      const mockResponse = createMockExpensesPageResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getExpenses(PROJECT_ID);

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/expenses`);
      expect(result).toEqual(mockResponse);
    });

    it("should build correct query params", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(createMockExpensesPageResponse())]);

      await getExpenses(PROJECT_ID, {
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
      setupFetchMock(mockFetch, [createSuccessResponse(createMockExpensesPageResponse())]);

      await getExpenses(PROJECT_ID);

      const headers = getLastFetchHeaders(mockFetch);
      expect(headers["Authorization"]).toBe("Bearer test-token");
    });
  });

  describe("getExpense", () => {
    it("should call GET /projects/:id/expenses/:expenseId", async () => {
      const mockResponse = createMockExpenseResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getExpense(PROJECT_ID, "expense-1");

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/expenses/expense-1`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("createExpense", () => {
    it("should call POST /projects/:id/expenses", async () => {
      const mockResponse = createMockExpenseResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await createExpense(PROJECT_ID, {
        categoryId: "cat-1",
        paymentMethodId: "pm-1",
        originalAmount: 100,
        originalCurrency: "USD",
        title: "New Expense",
        expenseDate: "2025-04-24",
      });

      expect(getLastFetchMethod(mockFetch)).toBe("POST");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/expenses`);
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.title).toBe("New Expense");
      expect(body.originalAmount).toBe(100);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateExpense", () => {
    it("should call PUT /projects/:id/expenses/:expenseId", async () => {
      const mockResponse = createMockExpenseResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await updateExpense(PROJECT_ID, "expense-1", {
        categoryId: "cat-1",
        paymentMethodId: "pm-1",
        originalAmount: 150,
        originalCurrency: "USD",
        title: "Updated Expense",
        expenseDate: "2025-04-24",
      });

      expect(getLastFetchMethod(mockFetch)).toBe("PUT");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/expenses/expense-1`);
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.title).toBe("Updated Expense");
      expect(body.originalAmount).toBe(150);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateExpenseActiveState", () => {
    it("should call PATCH /projects/:id/expenses/:expenseId/active-state", async () => {
      const mockResponse = createMockExpenseResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await updateExpenseActiveState(PROJECT_ID, "expense-1", { isActive: false });

      expect(getLastFetchMethod(mockFetch)).toBe("PATCH");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/expenses/expense-1/active-state`);
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.isActive).toBe(false);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteExpense", () => {
    it("should call DELETE /projects/:id/expenses/:expenseId", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(undefined)]);

      await deleteExpense(PROJECT_ID, "expense-1");

      expect(getLastFetchMethod(mockFetch)).toBe("DELETE");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/expenses/expense-1`);
    });
  });

  describe("bulkCreateExpenses", () => {
    it("should call POST /projects/:id/expenses/bulk", async () => {
      const mockResponse: BulkCreateExpensesResponse = {
        created: 2,
        items: [
          { id: "exp-1", title: "Bulk Expense 1", originalAmount: 50, convertedAmount: 50, date: "2025-04-24" },
          { id: "exp-2", title: "Bulk Expense 2", originalAmount: 75, convertedAmount: 75, date: "2025-04-24" },
        ],
      };
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await bulkCreateExpenses(PROJECT_ID, {
        items: [
          {
            categoryId: "cat-1",
            paymentMethodId: "pm-1",
            originalAmount: 50,
            originalCurrency: "USD",
            exchangeRate: 1,
            convertedAmount: 50,
            title: "Bulk Expense 1",
            date: "2025-04-24",
          },
          {
            categoryId: "cat-1",
            paymentMethodId: "pm-1",
            originalAmount: 75,
            originalCurrency: "USD",
            exchangeRate: 1,
            convertedAmount: 75,
            title: "Bulk Expense 2",
            date: "2025-04-24",
          },
        ],
      });

      expect(getLastFetchMethod(mockFetch)).toBe("POST");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/expenses/bulk`);
      expect(result.created).toBe(2);
      expect(result.items).toHaveLength(2);
    });
  });

  describe("getExpenseTemplates", () => {
    it("should call GET /projects/:id/expenses/templates", async () => {
      const mockResponse = [createMockExpenseResponse()];
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getExpenseTemplates(PROJECT_ID);

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/expenses/templates`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("createExpenseFromTemplate", () => {
    it("should call POST /projects/:id/expenses/from-template/:templateId", async () => {
      const mockResponse = createMockExpenseResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await createExpenseFromTemplate(PROJECT_ID, "template-1", {
        originalAmount: 200,
        expenseDate: "2025-04-25",
      });

      expect(getLastFetchMethod(mockFetch)).toBe("POST");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/expenses/from-template/template-1`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("extractExpenseFromImage", () => {
    it("should call POST /projects/:id/expenses/extract-from-image with FormData", async () => {
      const mockResponse = createMockExtractResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const file = new File(["test"], "receipt.jpg", { type: "image/jpeg" });
      const result = await extractExpenseFromImage(PROJECT_ID, {
        file,
        documentKind: "receipt",
      });

      expect(getLastFetchMethod(mockFetch)).toBe("POST");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/expenses/extract-from-image`);
    });
  });

  describe("getExpenseExtractionQuota", () => {
    it("should call GET /projects/:id/expenses/extract-from-image/quota", async () => {
      const mockResponse: OcrExtractionQuotaResponse = {
        projectOwnerUserId: "user-1",
        planName: "Pro",
        planSlug: "pro",
        canUseOcr: true,
        usedThisMonth: 5,
        monthlyLimit: 50,
        remainingThisMonth: 45,
        isUnlimited: false,
        isAvailable: true,
        periodStartUtc: "2025-04-01T00:00:00Z",
        periodEndUtc: "2025-04-30T23:59:59Z",
      };
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getExpenseExtractionQuota(PROJECT_ID);

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/expenses/extract-from-image/quota`);
      expect(result).toEqual(mockResponse);
    });
  });
});

function createMockExpensesPageResponse(): ExpensesPageResponse {
  return {
    items: [createMockExpenseResponse()],
    page: 1,
    pageSize: 12,
    totalCount: 1,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };
}

function createMockExpenseResponse(): ExpenseResponse {
  return {
    id: "expense-1",
    projectId: PROJECT_ID,
    categoryId: "cat-1",
    categoryName: "Food",
    paymentMethodId: "pm-1",
    createdByUserId: "user-1",
    obligationId: null,
    obligationEquivalentAmount: null,
    originalAmount: 100,
    originalCurrency: "USD",
    exchangeRate: 1,
    convertedAmount: 100,
    title: "Test Expense",
    description: null,
    expenseDate: "2025-04-24",
    receiptNumber: null,
    notes: null,
    isTemplate: false,
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

function createMockExtractResponse(): ExtractExpenseFromImageResponse {
  return {
    provider: "openai",
    documentKind: "receipt",
    modelId: "gpt-4o",
    draft: {
      categoryId: null,
      paymentMethodId: null,
      obligationId: null,
      obligationEquivalentAmount: null,
      title: null,
      description: null,
      originalAmount: null,
      originalCurrency: null,
      exchangeRate: null,
      convertedAmount: null,
      expenseDate: null,
      receiptNumber: null,
      notes: null,
      isTemplate: false,
      isActive: true,
      currencyExchanges: null,
      detectedMerchantName: null,
      detectedPaymentMethodText: null,
    },
    suggestedCategory: null,
    suggestedPaymentMethod: null,
    availableCategories: [],
    availablePaymentMethods: [],
    warnings: [],
  };
}
