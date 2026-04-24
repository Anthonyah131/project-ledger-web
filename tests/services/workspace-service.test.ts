import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getWorkspaces,
  getWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceProjects,
  assignProjectToWorkspace,
  removeProjectFromWorkspace,
} from "@/services/workspace-service";
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
  WorkspaceResponse,
  WorkspaceDetailResponse,
  ProjectsPagedResponse,
} from "@/types/workspace";

const API_BASE_URL = "http://localhost:5192/api";

describe("workspace-service", () => {
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

  describe("getWorkspaces", () => {
    it("should call GET /workspaces", async () => {
      const mockResponse: WorkspaceResponse[] = [createMockWorkspaceResponse()];
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getWorkspaces();

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain("/workspaces");
      expect(result).toEqual(mockResponse);
    });

    it("should include Authorization header", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse([createMockWorkspaceResponse()])]);

      await getWorkspaces();

      const headers = getLastFetchHeaders(mockFetch);
      expect(headers["Authorization"]).toBe("Bearer test-token");
    });
  });

  describe("getWorkspace", () => {
    it("should call GET /workspaces/:id", async () => {
      const mockResponse = createMockWorkspaceDetailResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getWorkspace("workspace-1");

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain("/workspaces/workspace-1");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("createWorkspace", () => {
    it("should call POST /workspaces", async () => {
      const mockResponse = createMockWorkspaceResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await createWorkspace({
        name: "New Workspace",
        description: "A new workspace",
        color: "#FF5733",
        icon: "folder",
      });

      expect(getLastFetchMethod(mockFetch)).toBe("POST");
      expect(getLastFetchUrl(mockFetch)).toContain("/workspaces");
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.name).toBe("New Workspace");
      expect(body.color).toBe("#FF5733");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateWorkspace", () => {
    it("should call PATCH /workspaces/:id", async () => {
      const mockResponse = createMockWorkspaceResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await updateWorkspace("workspace-1", {
        name: "Updated Workspace",
        description: "Updated description",
      });

      expect(getLastFetchMethod(mockFetch)).toBe("PATCH");
      expect(getLastFetchUrl(mockFetch)).toContain("/workspaces/workspace-1");
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.name).toBe("Updated Workspace");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteWorkspace", () => {
    it("should call DELETE /workspaces/:id", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(undefined)]);

      await deleteWorkspace("workspace-1");

      expect(getLastFetchMethod(mockFetch)).toBe("DELETE");
      expect(getLastFetchUrl(mockFetch)).toContain("/workspaces/workspace-1");
    });
  });

  describe("getWorkspaceProjects", () => {
    it("should call GET /workspaces/:id/projects with default params", async () => {
      const mockResponse = createMockProjectsPagedResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getWorkspaceProjects("workspace-1");

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain("/workspaces/workspace-1/projects");
      expect(result).toEqual(mockResponse);
    });

    it("should build correct query params", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(createMockProjectsPagedResponse())]);

      await getWorkspaceProjects("workspace-1", {
        page: 2,
        pageSize: 50,
        sortBy: "name",
        sortDirection: "asc",
      });

      const url = getLastFetchUrl(mockFetch);
      expect(url).toContain("page=2");
      expect(url).toContain("pageSize=50");
      expect(url).toContain("sortBy=name");
      expect(url).toContain("sortDirection=asc");
    });
  });

  describe("assignProjectToWorkspace", () => {
    it("should call POST /workspaces/:id/projects", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(undefined)]);

      await assignProjectToWorkspace("workspace-1", "proj-1");

      expect(getLastFetchMethod(mockFetch)).toBe("POST");
      expect(getLastFetchUrl(mockFetch)).toContain("/workspaces/workspace-1/projects");
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.projectId).toBe("proj-1");
    });
  });

  describe("removeProjectFromWorkspace", () => {
    it("should call DELETE /workspaces/:id/projects/:projectId", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(undefined)]);

      await removeProjectFromWorkspace("workspace-1", "proj-1");

      expect(getLastFetchMethod(mockFetch)).toBe("DELETE");
      expect(getLastFetchUrl(mockFetch)).toContain("/workspaces/workspace-1/projects/proj-1");
    });
  });
});

function createMockWorkspaceResponse(): WorkspaceResponse {
  return {
    id: "workspace-1",
    name: "My Workspace",
    description: "Workspace description",
    color: "#3B82F6",
    icon: "folder",
    role: "owner",
    projectCount: 5,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-04-24T00:00:00Z",
  };
}

function createMockWorkspaceDetailResponse(): WorkspaceDetailResponse {
  return {
    ...createMockWorkspaceResponse(),
    projects: [
      {
        id: "proj-1",
        name: "Project 1",
        currencyCode: "USD",
        description: null,
        createdAt: "2025-01-01T00:00:00Z",
      },
    ],
    members: [
      {
        userId: "user-1",
        fullName: "Owner User",
        email: "owner@example.com",
        role: "owner",
        joinedAt: "2025-01-01T00:00:00Z",
      },
    ],
  };
}

function createMockProjectsPagedResponse(): ProjectsPagedResponse {
  return {
    pinned: [],
    pinnedCount: 0,
    items: [
      {
        id: "proj-1",
        name: "Project 1",
        ownerUserId: "user-1",
        currencyCode: "USD",
        description: null,
        userRole: "owner",
        workspaceId: "workspace-1",
        workspaceName: "My Workspace",
        partnersEnabled: false,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-04-24T00:00:00Z",
      },
    ],
    page: 1,
    pageSize: 200,
    totalCount: 1,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };
}
