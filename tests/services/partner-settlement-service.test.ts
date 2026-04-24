import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getPartnersBalance,
  getSettlementSuggestions,
  getPartnerHistory,
  getSettlements,
  createSettlement,
  updateSettlement,
  deleteSettlement,
} from "@/services/partner-settlement-service";
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
  PartnersBalanceResponse,
  SettlementSuggestionsResponse,
  PartnerHistoryResponse,
  SettlementsPageResponse,
  PartnerSettlementResponse,
} from "@/types/partner-settlement";

const API_BASE_URL = "http://localhost:5192/api";
const PROJECT_ID = "proj-1";

describe("partner-settlement-service", () => {
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

  describe("getPartnersBalance", () => {
    it("should call GET /projects/:id/partners/balance", async () => {
      const mockResponse = createMockPartnersBalanceResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getPartnersBalance(PROJECT_ID);

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/partners/balance`);
      expect(result).toEqual(mockResponse);
    });

    it("should include Authorization header", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(createMockPartnersBalanceResponse())]);

      await getPartnersBalance(PROJECT_ID);

      const headers = getLastFetchHeaders(mockFetch);
      expect(headers["Authorization"]).toBe("Bearer test-token");
    });
  });

  describe("getSettlementSuggestions", () => {
    it("should call GET /projects/:id/partners/settlement-suggestions", async () => {
      const mockResponse = createMockSettlementSuggestionsResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getSettlementSuggestions(PROJECT_ID);

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/partners/settlement-suggestions`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getPartnerHistory", () => {
    it("should call GET /projects/:id/partners/:partnerId/history", async () => {
      const mockResponse = createMockPartnerHistoryResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getPartnerHistory(PROJECT_ID, "partner-1");

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/partners/partner-1/history`);
      expect(result).toEqual(mockResponse);
    });

    it("should build correct query params", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(createMockPartnerHistoryResponse())]);

      await getPartnerHistory(PROJECT_ID, "partner-1", {
        page: 2,
        pageSize: 20,
      });

      const url = getLastFetchUrl(mockFetch);
      expect(url).toContain("page=2");
      expect(url).toContain("pageSize=20");
    });
  });

  describe("getSettlements", () => {
    it("should call GET /projects/:id/partner-settlements", async () => {
      const mockResponse = createMockSettlementsPageResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getSettlements(PROJECT_ID);

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/partner-settlements`);
      expect(result).toEqual(mockResponse);
    });

    it("should build correct query params", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(createMockSettlementsPageResponse())]);

      await getSettlements(PROJECT_ID, {
        page: 1,
        pageSize: 25,
      });

      const url = getLastFetchUrl(mockFetch);
      expect(url).toContain("page=1");
      expect(url).toContain("pageSize=25");
    });
  });

  describe("createSettlement", () => {
    it("should call POST /projects/:id/partner-settlements", async () => {
      const mockResponse = createMockSettlementResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await createSettlement(PROJECT_ID, {
        fromPartnerId: "partner-1",
        toPartnerId: "partner-2",
        amount: 100,
        currency: "USD",
        exchangeRate: 1,
        settlementDate: "2025-04-24",
        description: "Monthly settlement",
      });

      expect(getLastFetchMethod(mockFetch)).toBe("POST");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/partner-settlements`);
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.fromPartnerId).toBe("partner-1");
      expect(body.toPartnerId).toBe("partner-2");
      expect(body.amount).toBe(100);
      expect(body.currency).toBe("USD");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateSettlement", () => {
    it("should call PATCH /projects/:id/partner-settlements/:settlementId", async () => {
      const mockResponse = createMockSettlementResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await updateSettlement(PROJECT_ID, "settlement-1", {
        amount: 150,
        settlementDate: "2025-04-25",
      });

      expect(getLastFetchMethod(mockFetch)).toBe("PATCH");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/partner-settlements/settlement-1`);
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.amount).toBe(150);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteSettlement", () => {
    it("should call DELETE /projects/:id/partner-settlements/:settlementId", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(undefined)]);

      await deleteSettlement(PROJECT_ID, "settlement-1");

      expect(getLastFetchMethod(mockFetch)).toBe("DELETE");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/partner-settlements/settlement-1`);
    });
  });
});

function createMockPartnersBalanceResponse(): PartnersBalanceResponse {
  return {
    projectId: PROJECT_ID,
    currency: "USD",
    partners: [],
    pairwiseBalances: [],
    warnings: [],
  };
}

function createMockSettlementSuggestionsResponse(): SettlementSuggestionsResponse {
  return {
    projectId: PROJECT_ID,
    currency: "USD",
    suggestions: [
      {
        fromPartnerId: "partner-1",
        fromPartnerName: "Partner A",
        toPartnerId: "partner-2",
        toPartnerName: "Partner B",
        amount: 50,
        currency: "USD",
      },
    ],
    note: "Settlement suggestions based on current balances",
  };
}

function createMockPartnerHistoryResponse(): PartnerHistoryResponse {
  return {
    partnerId: "partner-1",
    partnerName: "Partner A",
    transactions: {
      items: [],
      page: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    },
    settlements: [],
  };
}

function createMockSettlementsPageResponse(): SettlementsPageResponse {
  return {
    items: [createMockSettlementResponse()],
    page: 1,
    pageSize: 20,
    totalCount: 1,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };
}

function createMockSettlementResponse(): PartnerSettlementResponse {
  return {
    id: "settlement-1",
    projectId: PROJECT_ID,
    fromPartnerId: "partner-1",
    fromPartnerName: "Partner A",
    toPartnerId: "partner-2",
    toPartnerName: "Partner B",
    amount: 100,
    currency: "USD",
    exchangeRate: 1,
    convertedAmount: 100,
    settlementDate: "2025-04-24",
    description: "Monthly settlement",
    notes: null,
    createdAt: "2025-04-24T00:00:00Z",
    currencyExchanges: [],
  };
}
