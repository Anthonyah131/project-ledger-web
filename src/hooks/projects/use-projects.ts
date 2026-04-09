"use client"

// hooks/projects/use-projects.ts
// State management + API orchestration for the projects list view.

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import * as projectService from "@/services/project-service";
import * as workspaceService from "@/services/workspace-service";
import { toastApiError } from "@/lib/error-utils";
import { useLanguage } from "@/context/language-context";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type {
  ProjectResponse,
  PinnedProjectResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  ViewMode,
} from "@/types/project";
import type { ProjectSortBy } from "@/services/project-service";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const LS_MIGRATION_KEY = "pl:pinned_projects";

function matchesQuery(p: ProjectResponse, q: string) {
  if (!q) return true;
  const lower = q.toLowerCase();
  return (
    p.name.toLowerCase().includes(lower) ||
    (p.description?.toLowerCase().includes(lower) ?? false)
  );
}

function parseSortParams(sort: string): { sortBy: ProjectSortBy; sortDirection: "asc" | "desc" } {
  const [field, dir] = sort.split(":") as [ProjectSortBy, "asc" | "desc"];
  return { sortBy: field, sortDirection: dir };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProjects(options: {
  workspaceId?: string;
  projectIds?: string[];
  onProjectMutated?: () => void;
} = {}) {
  const { workspaceId, onProjectMutated } = options;
  const { t } = useLanguage();

  // ── Server data ────────────────────────────────────────────────────────────
  const [items, setItems] = useState<ProjectResponse[]>([]);
  const [pinnedProjects, setPinnedProjects] = useState<PinnedProjectResponse[]>([]);
  const [pinnedCount, setPinnedCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pinLoading, setPinLoading] = useState<Set<string>>(new Set());

  // ── UI state ───────────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>("shelf");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [query, setQuery] = useState("");
  const [currency, setCurrency] = useState("all");
  const [sort, setSort] = useState("updatedAt:desc");

  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<ProjectResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectResponse | null>(null);

  // ── Refresh version — bump to force refetch without changing other deps ──
  const [refreshVersion, setRefreshVersion] = useState(0);
  const bumpRefresh = useCallback(() => setRefreshVersion((v) => v + 1), []);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    const { sortBy, sortDirection } = parseSortParams(sort);
    try {
      setError(null);
      const data = workspaceId
        ? await workspaceService.getWorkspaceProjects(workspaceId, { page, pageSize, sortBy, sortDirection })
        : await projectService.getProjects({ page, pageSize, sortBy, sortDirection });

      setItems(data.items);
      setTotal(data.totalCount);
      setPinnedCount(data.pinnedCount ?? 0);
      if (page === 1) {
        setPinnedProjects(data.pinned ?? []);
      }
    } catch (err) {
      const msg = toastApiError(err, t("projects.errors.load"));
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sort, workspaceId, t, refreshVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLoading(true);
    fetchProjects();
  }, [fetchProjects]);

  // ── localStorage migration (runs once on first mount, global context only) ─
  const migrationRanRef = useRef(false);
  useEffect(() => {
    if (migrationRanRef.current || workspaceId) return;
    migrationRanRef.current = true;
    try {
      const raw = localStorage.getItem(LS_MIGRATION_KEY);
      if (!raw) return;
      const ids: string[] = JSON.parse(raw);
      if (!ids.length) { localStorage.removeItem(LS_MIGRATION_KEY); return; }

      (async () => {
        for (const id of ids.slice(0, 6)) {
          try {
            await projectService.pinProject(id);
          } catch {
            // 404 / 403 → skip; PINNED_LIMIT_EXCEEDED → API returns 400, loop stops naturally
          }
        }
        localStorage.removeItem(LS_MIGRATION_KEY);
        bumpRefresh();
      })();
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Debounced query ────────────────────────────────────────────────────────
  const resetPage = useCallback(() => setPage(1), []);
  const debouncedQuery = useDebouncedValue(query, 350, resetPage);

  // ── Client-side filter (search + currency within current page) ─────────────
  const filteredItems = useMemo(() => {
    let result = items;
    if (debouncedQuery) result = result.filter((p) => matchesQuery(p, debouncedQuery));
    if (currency !== "all") result = result.filter((p) => p.currencyCode === currency);
    return result;
  }, [items, debouncedQuery, currency]);

  const filteredPinned = useMemo(() => {
    let result = pinnedProjects;
    if (debouncedQuery) result = result.filter((p) => matchesQuery(p, debouncedQuery));
    if (currency !== "all") result = result.filter((p) => p.currencyCode === currency);
    return result;
  }, [pinnedProjects, debouncedQuery, currency]);

  const hasSearch = !!debouncedQuery || currency !== "all";
  const globalIndex = (page - 1) * pageSize;

  // ── Derived pin helpers ────────────────────────────────────────────────────
  const pinnedIds = useMemo(() => new Set(pinnedProjects.map((p) => p.id)), [pinnedProjects]);
  const canPin = pinnedCount < 6;

  // ── Pin / Unpin ────────────────────────────────────────────────────────────
  const togglePin = useCallback(
    async (projectId: string) => {
      const isPinned = pinnedIds.has(projectId);
      setPinLoading((prev) => new Set(prev).add(projectId));
      try {
        if (isPinned) {
          await projectService.unpinProject(projectId);
        } else {
          await projectService.pinProject(projectId);
        }
        // Go to page 1 to see updated pinned section.
        // bumpRefresh ensures refetch even if already on page 1.
        setPage(1);
        bumpRefresh();
      } catch (err) {
        toastApiError(err, t(isPinned ? "projects.errors.unpin" : "projects.errors.pin"));
      } finally {
        setPinLoading((prev) => {
          const next = new Set(prev);
          next.delete(projectId);
          return next;
        });
      }
    },
    [pinnedIds, bumpRefresh, t],
  );

  // ── CRUD ───────────────────────────────────────────────────────────────────

  const mutateCreate = useCallback(
    async (data: CreateProjectRequest) => {
      try {
        const payload: CreateProjectRequest = workspaceId
          ? { ...data, workspace_id: workspaceId }
          : data;
        const created = await projectService.createProject(payload);
        toast.success(t("projects.toast.created"), {
          description: t("projects.toast.createdDesc", { name: created.name }),
        });
        setPage(1);
        bumpRefresh();
        onProjectMutated?.();
      } catch (err) {
        toastApiError(err, t("projects.errors.create"));
      }
    },
    [workspaceId, onProjectMutated, bumpRefresh, t],
  );

  const mutateUpdate = useCallback(
    async (id: string, data: UpdateProjectRequest) => {
      try {
        const updated = await projectService.updateProject(id, data);
        toast.success(t("projects.toast.updated"), {
          description: t("projects.toast.updatedDesc", { name: updated.name }),
        });
        bumpRefresh();
        onProjectMutated?.();
      } catch (err) {
        toastApiError(err, t("projects.errors.update"));
      }
    },
    [onProjectMutated, bumpRefresh, t],
  );

  const mutateDelete = useCallback(
    async (project: ProjectResponse) => {
      try {
        await projectService.deleteProject(project.id);
        toast.success(t("projects.toast.deleted"), {
          description: t("projects.toast.deletedDesc", { name: project.name }),
        });
        bumpRefresh();
        onProjectMutated?.();
      } catch (err) {
        toastApiError(err, t("projects.errors.delete"));
      }
    },
    [onProjectMutated, bumpRefresh, t],
  );

  // ── Page/filter handlers ───────────────────────────────────────────────────

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPage(1);
  }, []);

  const handleCurrencyChange = useCallback((c: string) => {
    setCurrency(c);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((s: string) => {
    setSort(s);
    setPage(1);
  }, []);

  return {
    // List data
    projects: filteredItems,
    // Pinned section — empty when searching/filtering so UI shows flat results
    pinnedProjects: hasSearch ? [] : filteredPinned,
    pinnedIds,
    pinnedCount,
    canPin,
    pinLoading,
    togglePin,
    total,
    globalIndex,
    loading,
    error,
    hasSearch,
    // UI state
    viewMode, setViewMode,
    page, setPage,
    pageSize,
    query, setQuery,
    currency,
    sort,
    createOpen, setCreateOpen,
    editProject, setEditProject,
    deleteTarget, setDeleteTarget,
    // Mutations
    mutateCreate,
    mutateUpdate,
    mutateDelete,
    handlePageSizeChange,
    handleCurrencyChange,
    handleSortChange,
    refetch: bumpRefresh,
  };
}
