"use client"

// hooks/projects/use-projects.ts
// State management + API orchestration for the projects list view.

import { useState, useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import * as projectService from "@/services/project-service";
import { toastApiError } from "@/lib/error-utils";
import { useLanguage } from "@/context/language-context";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { ProjectResponse, CreateProjectRequest, UpdateProjectRequest, ViewMode } from "@/types/project";

// ─── Client-side sort / filter helpers ──────────────────────────────────────

function matchesQuery(p: ProjectResponse, q: string) {
  if (!q) return true;
  const lower = q.toLowerCase();
  return (
    p.name.toLowerCase().includes(lower) ||
    (p.description?.toLowerCase().includes(lower) ?? false)
  );
}

function comparator(sort: string) {
  const [field, dir] = sort.split(":") as [string, "asc" | "desc"];
  const mult = dir === "asc" ? 1 : -1;
  return (a: ProjectResponse, b: ProjectResponse) => {
    if (field === "name") return a.name.localeCompare(b.name) * mult;
    const key = field as "createdAt" | "updatedAt";
    return (new Date(a[key]).getTime() - new Date(b[key]).getTime()) * mult;
  };
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useProjects(options: { workspaceId?: string; projectIds?: string[]; onProjectMutated?: () => void } = {}) {
  const { workspaceId, projectIds, onProjectMutated } = options
  const { t } = useLanguage()
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("shelf");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [query, setQuery] = useState("");
  const [currency, setCurrency] = useState("all");
  const [sort, setSort] = useState("updatedAt:desc");

  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<ProjectResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectResponse | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────

  const fetchProjects = useCallback(async () => {
    try {
      setError(null);
      const data = await projectService.getProjects({ pageSize: 200 });
      setProjects(data.items);
    } catch (err) {
      const msg = toastApiError(err, t("projects.errors.load"));
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // ── Debounced query ────────────────────────────────────────────────────

  const resetPage = useCallback(() => setPage(1), []);
  const debouncedQuery = useDebouncedValue(query, 350, resetPage);

  // ── Derived (filter, sort, paginate) ──────────────────────────────

  const filtered = useMemo(() => {
    let result = projects;
    if (workspaceId) {
      if (projectIds && projectIds.length > 0) {
        const idSet = new Set(projectIds);
        result = result.filter((p) => idSet.has(p.id));
      } else {
        result = result.filter((p) => p.workspaceId === workspaceId);
      }
    }
    if (debouncedQuery) result = result.filter((p) => matchesQuery(p, debouncedQuery));
    if (currency !== "all") result = result.filter((p) => p.currencyCode === currency);
    result = [...result].sort(comparator(sort));
    return result;
  }, [projects, workspaceId, projectIds, debouncedQuery, currency, sort]);

  const total = filtered.length;
  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );
  const globalIndex = (page - 1) * pageSize;
  const hasSearch = !!debouncedQuery || currency !== "all";

  // ── CRUD ──────────────────────────────────────────────────────────

  const mutateCreate = useCallback(
    async (data: CreateProjectRequest) => {
      try {
        const payload: CreateProjectRequest = workspaceId
          ? { ...data, workspace_id: workspaceId }
          : data;
        const created = await projectService.createProject(payload);
        setProjects((prev) => [created, ...prev]);
        setPage(1);
        toast.success(t("projects.toast.created"), { description: t("projects.toast.createdDesc", { name: created.name }) });
        onProjectMutated?.();
      } catch (err) {
        toastApiError(err, t("projects.errors.create"));
      }
    },
    [workspaceId, onProjectMutated, t]
  );

  const mutateUpdate = useCallback(
    async (id: string, data: UpdateProjectRequest) => {
      try {
        const updated = await projectService.updateProject(id, data);
        setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
        toast.success(t("projects.toast.updated"), { description: t("projects.toast.updatedDesc", { name: updated.name }) });
        onProjectMutated?.();
      } catch (err) {
        toastApiError(err, t("projects.errors.update"));
      }
    },
    [onProjectMutated, t]
  );

  const mutateDelete = useCallback(
    async (project: ProjectResponse) => {
      try {
        await projectService.deleteProject(project.id);
        setProjects((prev) => prev.filter((p) => p.id !== project.id));
        toast.success(t("projects.toast.deleted"), { description: t("projects.toast.deletedDesc", { name: project.name }) });
        onProjectMutated?.();
      } catch (err) {
        toastApiError(err, t("projects.errors.delete"));
      }
    },
    [onProjectMutated, t]
  );

  // ── Page/filter handlers ──────────────────────────────────────────

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
    projects: paged,
    total,
    globalIndex,
    loading,
    error,
    hasSearch,
    viewMode, setViewMode,
    page, setPage,
    pageSize,
    query, setQuery,
    currency,
    sort,
    createOpen, setCreateOpen,
    editProject, setEditProject,
    deleteTarget, setDeleteTarget,
    mutateCreate,
    mutateUpdate,
    mutateDelete,
    handlePageSizeChange,
    handleCurrencyChange,
    handleSortChange,
    refetch: fetchProjects,
  };
}
