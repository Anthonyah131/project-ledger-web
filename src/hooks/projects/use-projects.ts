"use client"

// hooks/projects/use-projects.ts
// State management + API orchestration for the projects list view.

import { useState, useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import * as projectService from "@/services/project-service";
import { toastApiError } from "@/lib/error-utils";
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
    // default: date fields
    const key = field as "createdAt" | "updatedAt";
    return (new Date(a[key]).getTime() - new Date(b[key]).getTime()) * mult;
  };
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useProjects() {
  // All projects (from API)
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>("shelf");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [query, setQuery] = useState("");

  const [currency, setCurrency] = useState("all");
  const [sort, setSort] = useState("updatedAt:desc");

  // Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<ProjectResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectResponse | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────

  const fetchProjects = useCallback(async () => {
    try {
      setError(null);
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar proyectos";
      setError(msg);
      toast.error("Error al cargar proyectos", { description: msg });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // ── Debounced query ────────────────────────────────────────────────────

  const resetPage = useCallback(() => setPage(1), []);
  const debouncedQuery = useDebouncedValue(query, 350, resetPage);

  // ── Derived (filter, sort, paginate) ──────────────────────────────

  const filtered = useMemo(() => {
    let result = projects;
    if (debouncedQuery) result = result.filter((p) => matchesQuery(p, debouncedQuery));
    if (currency !== "all") result = result.filter((p) => p.currencyCode === currency);
    result = [...result].sort(comparator(sort));
    return result;
  }, [projects, debouncedQuery, currency, sort]);

  const total = filtered.length;
  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );
  const globalIndex = (page - 1) * pageSize;
  const hasSearch = !!debouncedQuery || currency !== "all";

  // ── CRUD ──────────────────────────────────────────────────────────

  const handleCreate = useCallback(
    async (data: CreateProjectRequest) => {
      try {
        const created = await projectService.createProject(data);
        setProjects((prev) => [created, ...prev]);
        setPage(1);
        toast.success("Proyecto creado", { description: `"${created.name}" se agregó correctamente.` });
      } catch (err) {
        toastApiError(err, "Error al crear proyecto");
      }
    },
    []
  );

  const handleEdit = useCallback(
    async (id: string, data: UpdateProjectRequest) => {
      try {
        const updated = await projectService.updateProject(id, data);
        setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
        toast.success("Proyecto actualizado", { description: `"${updated.name}" se guardó correctamente.` });
      } catch (err) {
        toastApiError(err, "Error al actualizar proyecto");
      }
    },
    []
  );

  const handleDelete = useCallback(
    async (project: ProjectResponse) => {
      try {
        await projectService.deleteProject(project.id);
        setProjects((prev) => prev.filter((p) => p.id !== project.id));
        toast.success("Proyecto eliminado", { description: `"${project.name}" fue desactivado.` });
      } catch (err) {
        toastApiError(err, "Error al eliminar proyecto");
      }
    },
    []
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
    // Data
    projects: paged,
    total,
    globalIndex,
    loading,
    error,
    hasSearch,

    // View state
    viewMode, setViewMode,
    page, setPage,
    pageSize,
    query, setQuery,
    currency,
    sort,

    // Modal state
    createOpen, setCreateOpen,
    editProject, setEditProject,
    deleteTarget, setDeleteTarget,

    // Actions
    handleCreate,
    handleEdit,
    handleDelete,
    handlePageSizeChange,
    handleCurrencyChange,
    handleSortChange,
    refetch: fetchProjects,
  };
}
