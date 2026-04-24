import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getPartners,
  getPartner,
  createPartner,
  updatePartner,
  deletePartner,
  getPartnerPaymentMethods,
  getPartnerProjects,
} from "@/services/partner-service";
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
  PartnersListResponse,
  PartnerDetailResponse,
  PartnerResponse,
  PartnerPaymentMethodsPagedResponse,
  PartnerProjectsPagedResponse,
} from "@/types/partner";

const API_BASE_URL = "http://localhost:5192/api";

describe("partner-service", () => {
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

  describe("getPartners", () => {
    it("should call GET /partners", async () => {
      const mockResponse = createMockPartnersListResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getPartners();

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain("/partners");
      expect(result).toEqual(mockResponse);
    });

    it("should build correct query params", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(createMockPartnersListResponse())]);

      await getPartners({
        search: "acme",
        page: 2,
        pageSize: 20,
        sortBy: "name",
        sortDirection: "desc",
      });

      const url = getLastFetchUrl(mockFetch);
      expect(url).toContain("search=acme");
      expect(url).toContain("page=2");
      expect(url).toContain("pageSize=20");
      expect(url).toContain("sortBy=name");
      expect(url).toContain("sortDirection=desc");
    });

    it("should include Authorization header", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(createMockPartnersListResponse())]);

      await getPartners();

      const headers = getLastFetchHeaders(mockFetch);
      expect(headers["Authorization"]).toBe("Bearer test-token");
    });
  });

  describe("getPartner", () => {
    it("should call GET /partners/:id", async () => {
      const mockResponse = createMockPartnerResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getPartner("partner-1");

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain("/partners/partner-1");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("createPartner", () => {
    it("should call POST /partners", async () => {
      const mockResponse = createMockPartnerResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await createPartner({
        name: "Acme Corp",
        email: "contact@acme.com",
        phone: "+1234567890",
        notes: "Important client",
      });

      expect(getLastFetchMethod(mockFetch)).toBe("POST");
      expect(getLastFetchUrl(mockFetch)).toContain("/partners");
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.name).toBe("Acme Corp");
      expect(body.email).toBe("contact@acme.com");
      expect(body.phone).toBe("+1234567890");
      expect(body.notes).toBe("Important client");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updatePartner", () => {
    it("should call PATCH /partners/:id", async () => {
      const mockResponse = createMockPartnerResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await updatePartner("partner-1", {
        name: "Updated Acme",
        email: "new@acme.com",
      });

      expect(getLastFetchMethod(mockFetch)).toBe("PATCH");
      expect(getLastFetchUrl(mockFetch)).toContain("/partners/partner-1");
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.name).toBe("Updated Acme");
      expect(body.email).toBe("new@acme.com");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deletePartner", () => {
    it("should call DELETE /partners/:id", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(undefined)]);

      await deletePartner("partner-1");

      expect(getLastFetchMethod(mockFetch)).toBe("DELETE");
      expect(getLastFetchUrl(mockFetch)).toContain("/partners/partner-1");
    });
  });

  describe("getPartnerPaymentMethods", () => {
    it("should call GET /partners/:id/payment-methods", async () => {
      const mockResponse = createMockPartnerPaymentMethodsResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getPartnerPaymentMethods("partner-1");

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain("/partners/partner-1/payment-methods");
      expect(result).toEqual(mockResponse);
    });

    it("should build correct query params", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(createMockPartnerPaymentMethodsResponse())]);

      await getPartnerPaymentMethods("partner-1", {
        page: 2,
        pageSize: 10,
        sortBy: "name",
        sortDirection: "asc",
      });

      const url = getLastFetchUrl(mockFetch);
      expect(url).toContain("page=2");
      expect(url).toContain("pageSize=10");
      expect(url).toContain("sortBy=name");
      expect(url).toContain("sortDirection=asc");
    });
  });

  describe("getPartnerProjects", () => {
    it("should call GET /partners/:id/projects", async () => {
      const mockResponse = createMockPartnerProjectsResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getPartnerProjects("partner-1");

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain("/partners/partner-1/projects");
      expect(result).toEqual(mockResponse);
    });

    it("should build correct query params", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(createMockPartnerProjectsResponse())]);

      await getPartnerProjects("partner-1", {
        page: 1,
        pageSize: 50,
        sortBy: "createdAt",
        sortDirection: "desc",
      });

      const url = getLastFetchUrl(mockFetch);
      expect(url).toContain("page=1");
      expect(url).toContain("pageSize=50");
      expect(url).toContain("sortBy=createdAt");
      expect(url).toContain("sortDirection=desc");
    });
  });
});

function createMockPartnersListResponse(): PartnersListResponse {
  return {
    items: [createMockPartnerResponse()],
    totalCount: 1,
    page: 1,
    pageSize: 20,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };
}

function createMockPartnerResponse(): PartnerResponse {
  return {
    id: "partner-1",
    name: "Acme Corp",
    email: "contact@acme.com",
    phone: "+1234567890",
    notes: "Important client",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-04-24T00:00:00Z",
  };
}

function createMockPartnerPaymentMethodsResponse(): PartnerPaymentMethodsPagedResponse {
  return {
    items: [
      {
        id: "pm-1",
        name: "Business Account",
        type: "bank",
        currency: "USD",
        bankName: "Chase",
      },
    ],
    totalCount: 1,
    page: 1,
    pageSize: 20,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };
}

function createMockPartnerProjectsResponse(): PartnerProjectsPagedResponse {
  return {
    items: [
      {
        id: "proj-1",
        name: "Acme Project",
        currencyCode: "USD",
        description: null,
        workspaceId: null,
        workspaceName: null,
      },
    ],
    totalCount: 1,
    page: 1,
    pageSize: 200,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };
}
