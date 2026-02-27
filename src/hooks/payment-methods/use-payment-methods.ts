"use client";

// hooks/payment-methods/use-payment-methods.ts

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";
import * as pmService from "@/services/payment-method-service";
import type {
  PaymentMethodResponse,
  CreatePaymentMethodRequest,
  UpdatePaymentMethodRequest,
} from "@/types/payment-method";
import type { ViewMode } from "@/types/project";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function matchesQuery(pm: PaymentMethodResponse, q: string) {
  if (!q) return true;
  const lower = q.toLowerCase();
  return (
    pm.name.toLowerCase().includes(lower) ||
    (pm.bankName?.toLowerCase().includes(lower) ?? false) ||
    (pm.description?.toLowerCase().includes(lower) ?? false)
  );
}

function comparator(sort: string) {
  const [field, dir] = sort.split(":") as [string, "asc" | "desc"];
  const mult = dir === "asc" ? 1 : -1;
  return (a: PaymentMethodResponse, b: PaymentMethodResponse) => {
    if (field === "name") return a.name.localeCompare(b.name) * mult;
    const key = field as "createdAt" | "updatedAt";
    return (new Date(a[key]).getTime() - new Date(b[key]).getTime()) * mult;
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function usePaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View / filter state
  const [viewMode, setViewMode] = useState<ViewMode>("shelf");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sort, setSort] = useState("updatedAt:desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PaymentMethodResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethodResponse | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setError(null);
      const data = await pmService.getPaymentMethods();
      setPaymentMethods(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar métodos de pago";
      setError(msg);
      toast.error("Error al cargar métodos de pago", { description: msg });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPaymentMethods(); }, [fetchPaymentMethods]);

  // ── Debounce query ─────────────────────────────────────────────────────────

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  // ── Filter + sort + paginate ───────────────────────────────────────────────

  const filtered = useMemo(() => {
    let result = paymentMethods;
    if (debouncedQuery) result = result.filter((pm) => matchesQuery(pm, debouncedQuery));
    if (typeFilter !== "all") result = result.filter((pm) => pm.type === typeFilter);
    result = [...result].sort(comparator(sort));
    return result;
  }, [paymentMethods, debouncedQuery, typeFilter, sort]);

  const total = filtered.length;
  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );
  const globalIndex = (page - 1) * pageSize;
  const hasSearch = !!debouncedQuery || typeFilter !== "all";

  // ── CRUD ───────────────────────────────────────────────────────────────────

  const handleCreate = useCallback(async (data: CreatePaymentMethodRequest) => {
    try {
      const created = await pmService.createPaymentMethod(data);
      setPaymentMethods((prev) => [created, ...prev]);
      setPage(1);
      toast.success("Método de pago creado", { description: `"${created.name}" se agregó correctamente.` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al crear método de pago";
      toast.error("Error al crear", { description: msg });
    }
  }, []);

  const handleEdit = useCallback(async (id: string, data: UpdatePaymentMethodRequest) => {
    try {
      const updated = await pmService.updatePaymentMethod(id, data);
      setPaymentMethods((prev) => prev.map((pm) => (pm.id === id ? updated : pm)));
      toast.success("Método de pago actualizado", { description: `"${updated.name}" se guardó correctamente.` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al actualizar";
      toast.error("Error al actualizar", { description: msg });
    }
  }, []);

  const handleDelete = useCallback(async (pm: PaymentMethodResponse) => {
    try {
      await pmService.deletePaymentMethod(pm.id);
      setPaymentMethods((prev) => prev.filter((p) => p.id !== pm.id));
      toast.success("Método de pago eliminado", { description: `"${pm.name}" fue desactivado.` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al eliminar";
      toast.error("Error al eliminar", { description: msg });
    }
  }, []);

  const handlePageSizeChange = useCallback((size: number) => { setPageSize(size); setPage(1); }, []);
  const handleSortChange = useCallback((s: string) => { setSort(s); setPage(1); }, []);
  const handleTypeFilterChange = useCallback((t: string) => { setTypeFilter(t); setPage(1); }, []);

  return {
    paymentMethods: paged,
    total,
    globalIndex,
    loading,
    error,
    hasSearch,
    viewMode, setViewMode,
    page, setPage,
    pageSize,
    query, setQuery,
    typeFilter,
    sort,
    createOpen, setCreateOpen,
    editTarget, setEditTarget,
    deleteTarget, setDeleteTarget,
    handleCreate,
    handleEdit,
    handleDelete,
    handlePageSizeChange,
    handleSortChange,
    handleTypeFilterChange,
    refetch: fetchPaymentMethods,
  };
}
