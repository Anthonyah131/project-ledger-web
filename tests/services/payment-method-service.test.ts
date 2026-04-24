import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getPaymentMethodsLookup,
  getPaymentMethods,
  getPaymentMethod,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  getPaymentMethodExpenses,
  getPaymentMethodIncomes,
  getPaymentMethodProjects,
  getPaymentMethodSummary,
  getPaymentMethodBalance,
  linkPartner,
  unlinkPartner,
} from "@/services/payment-method-service";
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
  PaymentMethodResponse,
  PaymentMethodsLookupResponse,
  PaymentMethodExpensesResponse,
  PaymentMethodIncomesResponse,
  PaymentMethodProjectsResponse,
  PaymentMethodSummaryResponse,
  PaymentMethodBalanceResponse,
} from "@/types/payment-method";

const API_BASE_URL = "http://localhost:5192/api";

describe("payment-method-service", () => {
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

  describe("getPaymentMethodsLookup", () => {
    it("should call GET /payment-methods/lookup", async () => {
      const mockResponse = createMockLookupResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getPaymentMethodsLookup();

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain("/payment-methods/lookup");
      expect(result).toEqual(mockResponse);
    });

    it("should include search param when provided", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(createMockLookupResponse())]);

      await getPaymentMethodsLookup({ search: "bank" });

      const url = getLastFetchUrl(mockFetch);
      expect(url).toContain("search=bank");
    });

    it("should include Authorization header", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(createMockLookupResponse())]);

      await getPaymentMethodsLookup();

      const headers = getLastFetchHeaders(mockFetch);
      expect(headers["Authorization"]).toBe("Bearer test-token");
    });
  });

  describe("getPaymentMethods", () => {
    it("should call GET /payment-methods", async () => {
      const mockResponse = [createMockPaymentMethodResponse()];
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getPaymentMethods();

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain("/payment-methods");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getPaymentMethod", () => {
    it("should call GET /payment-methods/:id", async () => {
      const mockResponse = createMockPaymentMethodResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getPaymentMethod("pm-1");

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain("/payment-methods/pm-1");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("createPaymentMethod", () => {
    it("should call POST /payment-methods", async () => {
      const mockResponse = createMockPaymentMethodResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await createPaymentMethod({
        name: "Business Account",
        type: "bank",
        currency: "USD",
        bankName: "Chase",
        accountNumber: "1234",
        description: "Main business account",
      });

      expect(getLastFetchMethod(mockFetch)).toBe("POST");
      expect(getLastFetchUrl(mockFetch)).toContain("/payment-methods");
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.name).toBe("Business Account");
      expect(body.type).toBe("bank");
      expect(body.currency).toBe("USD");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updatePaymentMethod", () => {
    it("should call PUT /payment-methods/:id", async () => {
      const mockResponse = createMockPaymentMethodResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await updatePaymentMethod("pm-1", {
        name: "Updated Account",
        type: "bank",
        bankName: "Updated Bank",
      });

      expect(getLastFetchMethod(mockFetch)).toBe("PUT");
      expect(getLastFetchUrl(mockFetch)).toContain("/payment-methods/pm-1");
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.name).toBe("Updated Account");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deletePaymentMethod", () => {
    it("should call DELETE /payment-methods/:id", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(undefined)]);

      await deletePaymentMethod("pm-1");

      expect(getLastFetchMethod(mockFetch)).toBe("DELETE");
      expect(getLastFetchUrl(mockFetch)).toContain("/payment-methods/pm-1");
    });
  });

  describe("getPaymentMethodExpenses", () => {
    it("should call GET /payment-methods/:id/expenses", async () => {
      const mockResponse = createMockExpensesResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getPaymentMethodExpenses("pm-1");

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain("/payment-methods/pm-1/expenses");
      expect(result).toEqual(mockResponse);
    });

    it("should build correct query params", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(createMockExpensesResponse())]);

      await getPaymentMethodExpenses("pm-1", {
        page: 2,
        pageSize: 20,
        sortBy: "expenseDate",
        sortDirection: "desc",
        from: "2025-01-01",
        to: "2025-12-31",
        projectId: "proj-1",
        isActive: true,
      });

      const url = getLastFetchUrl(mockFetch);
      expect(url).toContain("page=2");
      expect(url).toContain("pageSize=20");
      expect(url).toContain("sortBy=expenseDate");
      expect(url).toContain("sortDirection=desc");
      expect(url).toContain("from=2025-01-01");
      expect(url).toContain("to=2025-12-31");
      expect(url).toContain("projectId=proj-1");
      expect(url).toContain("isActive=true");
    });
  });

  describe("getPaymentMethodIncomes", () => {
    it("should call GET /payment-methods/:id/incomes", async () => {
      const mockResponse = createMockIncomesResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getPaymentMethodIncomes("pm-1");

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain("/payment-methods/pm-1/incomes");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getPaymentMethodProjects", () => {
    it("should call GET /payment-methods/:id/projects", async () => {
      const mockResponse = createMockProjectsResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getPaymentMethodProjects("pm-1");

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain("/payment-methods/pm-1/projects");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getPaymentMethodSummary", () => {
    it("should call GET /payment-methods/:id/summary", async () => {
      const mockResponse = createMockSummaryResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getPaymentMethodSummary("pm-1");

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain("/payment-methods/pm-1/summary");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getPaymentMethodBalance", () => {
    it("should call GET /payment-methods/:id/balance with project_id param", async () => {
      const mockResponse = createMockBalanceResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getPaymentMethodBalance("pm-1", "proj-1");

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain("/payment-methods/pm-1/balance");
      expect(getLastFetchUrl(mockFetch)).toContain("project_id=proj-1");
      expect(getLastFetchUrl(mockFetch)).toContain("projectId=proj-1");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("linkPartner", () => {
    it("should call POST /payment-methods/:id/partner", async () => {
      const mockResponse = createMockPaymentMethodResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await linkPartner("pm-1", { partnerId: "partner-1" });

      expect(getLastFetchMethod(mockFetch)).toBe("POST");
      expect(getLastFetchUrl(mockFetch)).toContain("/payment-methods/pm-1/partner");
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.partnerId).toBe("partner-1");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("unlinkPartner", () => {
    it("should call DELETE /payment-methods/:id/partner", async () => {
      const mockResponse = createMockPaymentMethodResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await unlinkPartner("pm-1");

      expect(getLastFetchMethod(mockFetch)).toBe("DELETE");
      expect(getLastFetchUrl(mockFetch)).toContain("/payment-methods/pm-1/partner");
      expect(result).toEqual(mockResponse);
    });
  });
});

function createMockLookupResponse(): PaymentMethodsLookupResponse {
  return {
    items: [{ id: "pm-1", name: "Business Account", type: "bank", currency: "USD" }],
    page: 1,
    pageSize: 20,
    totalCount: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };
}

function createMockPaymentMethodResponse(): PaymentMethodResponse {
  return {
    id: "pm-1",
    name: "Business Account",
    type: "bank",
    currency: "USD",
    bankName: "Chase",
    accountNumber: "1234",
    description: null,
    partner_id: null,
    partner: null,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-04-24T00:00:00Z",
  };
}

function createMockExpensesResponse(): PaymentMethodExpensesResponse {
  return {
    items: [],
    totalActiveAmount: 0,
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };
}

function createMockIncomesResponse(): PaymentMethodIncomesResponse {
  return {
    items: [],
    totalActiveAmount: 0,
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };
}

function createMockProjectsResponse(): PaymentMethodProjectsResponse {
  return {
    items: [],
    totalCount: 0,
  };
}

function createMockSummaryResponse(): PaymentMethodSummaryResponse {
  return {
    relatedExpensesCount: 0,
    relatedIncomesCount: 0,
    relatedProjectsCount: 0,
    totalExpenseAmount: 0,
    totalIncomeAmount: 0,
  };
}

function createMockBalanceResponse(): PaymentMethodBalanceResponse {
  return {
    payment_method_id: "pm-1",
    payment_method_name: "Business Account",
    currency: "USD",
    project_id: "proj-1",
    total_income: 500,
    total_expenses: 300,
    balance: 200,
  };
}
