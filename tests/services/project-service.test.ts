import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getProjects,
  getProjectsLookup,
  pinProject,
  unpinProject,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  updateProjectSettings,
  getMembers,
  addMember,
  changeMemberRole,
  removeMember,
} from "@/services/project-service";
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
  ProjectsPagedResponse,
  ProjectsLookupResponse,
  ProjectResponse,
  ProjectMemberResponse,
} from "@/types/project";

const API_BASE_URL = "http://localhost:5192/api";

describe("project-service", () => {
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

  describe("getProjects", () => {
    it("should call GET /projects with default params", async () => {
      const mockResponse: ProjectsPagedResponse = createMockPagedResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getProjects();

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain("/projects");
      expect(result).toEqual(mockResponse);
    });

    it("should include query params when provided", async () => {
      const mockResponse: ProjectsPagedResponse = createMockPagedResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      await getProjects({ page: 2, pageSize: 20, sortBy: "name", sortDirection: "asc" });

      const url = getLastFetchUrl(mockFetch);
      expect(url).toContain("page=2");
      expect(url).toContain("pageSize=20");
      expect(url).toContain("sortBy=name");
      expect(url).toContain("sortDirection=asc");
    });

    it("should include Authorization header", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(createMockPagedResponse())]);

      await getProjects();

      const headers = getLastFetchHeaders(mockFetch);
      expect(headers["Authorization"]).toBe("Bearer test-token");
    });
  });

  describe("getProjectsLookup", () => {
    it("should call GET /projects/lookup", async () => {
      const mockResponse: ProjectsLookupResponse = createMockLookupResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getProjectsLookup();

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain("/projects/lookup");
      expect(result).toEqual(mockResponse);
    });

    it("should include search param when provided", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(createMockLookupResponse())]);

      await getProjectsLookup({ search: "test project" });

      const url = getLastFetchUrl(mockFetch);
      expect(url).toContain("search=test+project");
    });
  });

  describe("pinProject", () => {
    it("should call PUT /projects/:id/pin", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse({ projectId: "proj-1", pinnedAt: "2025-04-24T00:00:00Z" })]);

      await pinProject("proj-1");

      expect(getLastFetchMethod(mockFetch)).toBe("PUT");
      expect(getLastFetchUrl(mockFetch)).toContain("/projects/proj-1/pin");
      expect(getLastFetchBody(mockFetch)).toBe("{}");
    });
  });

  describe("unpinProject", () => {
    it("should call DELETE /projects/:id/pin", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(undefined)]);

      await unpinProject("proj-1");

      expect(getLastFetchMethod(mockFetch)).toBe("DELETE");
      expect(getLastFetchUrl(mockFetch)).toContain("/projects/proj-1/pin");
    });
  });

  describe("getProject", () => {
    it("should call GET /projects/:id", async () => {
      const mockResponse = createMockProjectResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getProject("proj-1");

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain("/projects/proj-1");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("createProject", () => {
    it("should call POST /projects with data", async () => {
      const mockResponse = createMockProjectResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await createProject({
        name: "New Project",
        currencyCode: "USD",
        description: "A new project",
      });

      expect(getLastFetchMethod(mockFetch)).toBe("POST");
      expect(getLastFetchUrl(mockFetch)).toContain("/projects");
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body).toEqual({
        name: "New Project",
        currencyCode: "USD",
        description: "A new project",
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateProject", () => {
    it("should call PUT /projects/:id with data", async () => {
      const mockResponse = createMockProjectResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await updateProject("proj-1", {
        name: "Updated Project",
        description: "Updated description",
      });

      expect(getLastFetchMethod(mockFetch)).toBe("PUT");
      expect(getLastFetchUrl(mockFetch)).toContain("/projects/proj-1");
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.name).toBe("Updated Project");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteProject", () => {
    it("should call DELETE /projects/:id", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(undefined)]);

      await deleteProject("proj-1");

      expect(getLastFetchMethod(mockFetch)).toBe("DELETE");
      expect(getLastFetchUrl(mockFetch)).toContain("/projects/proj-1");
    });
  });

  describe("updateProjectSettings", () => {
    it("should call PATCH /projects/:id/settings", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(undefined)]);

      await updateProjectSettings("proj-1", { partnersEnabled: true });

      expect(getLastFetchMethod(mockFetch)).toBe("PATCH");
      expect(getLastFetchUrl(mockFetch)).toContain("/projects/proj-1/settings");
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.partnersEnabled).toBe(true);
    });
  });

  describe("getMembers", () => {
    it("should call GET /projects/:id/members", async () => {
      const mockResponse: ProjectMemberResponse[] = [createMockMember()];
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getMembers("proj-1");

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain("/projects/proj-1/members");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("addMember", () => {
    it("should call POST /projects/:id/members", async () => {
      const mockResponse = createMockMember();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await addMember("proj-1", { email: "user@example.com", role: "viewer" });

      expect(getLastFetchMethod(mockFetch)).toBe("POST");
      expect(getLastFetchUrl(mockFetch)).toContain("/projects/proj-1/members");
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.email).toBe("user@example.com");
      expect(body.role).toBe("viewer");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("changeMemberRole", () => {
    it("should call PUT /projects/:id/members/:memberId/role", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(undefined)]);

      await changeMemberRole("proj-1", "member-1", { role: "editor" });

      expect(getLastFetchMethod(mockFetch)).toBe("PUT");
      expect(getLastFetchUrl(mockFetch)).toContain("/projects/proj-1/members/member-1/role");
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.role).toBe("editor");
    });
  });

  describe("removeMember", () => {
    it("should call DELETE /projects/:id/members/:memberId", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(undefined)]);

      await removeMember("proj-1", "member-1");

      expect(getLastFetchMethod(mockFetch)).toBe("DELETE");
      expect(getLastFetchUrl(mockFetch)).toContain("/projects/proj-1/members/member-1");
    });
  });
});

function createMockPagedResponse(): ProjectsPagedResponse {
  return {
    pinned: [],
    pinnedCount: 0,
    items: [createMockProjectResponse()],
    page: 1,
    pageSize: 12,
    totalCount: 1,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };
}

function createMockLookupResponse(): ProjectsLookupResponse {
  return {
    pinned: [],
    pinnedCount: 0,
    items: [{ id: "proj-1", name: "Test Project", workspaceId: null, workspaceName: null }],
    page: 1,
    pageSize: 20,
    totalCount: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };
}

function createMockProjectResponse(): ProjectResponse {
  return {
    id: "proj-1",
    name: "Test Project",
    ownerUserId: "user-1",
    currencyCode: "USD",
    description: "Test description",
    userRole: "owner",
    workspaceId: null,
    workspaceName: null,
    partnersEnabled: false,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-04-24T00:00:00Z",
  };
}

function createMockMember(): ProjectMemberResponse {
  return {
    id: "member-1",
    userId: "user-2",
    userFullName: "Member User",
    userEmail: "member@example.com",
    role: "viewer",
    joinedAt: "2025-01-01T00:00:00Z",
  };
}
