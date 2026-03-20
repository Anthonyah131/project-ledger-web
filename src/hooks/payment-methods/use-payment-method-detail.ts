"use client"

// hooks/payment-methods/use-payment-method-detail.ts
// Hook para manejar el estado y datos de un método de pago individual

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import * as pmService from "@/services/payment-method-service"
import { getPartners } from "@/services/partner-service"
import { toastApiError } from "@/lib/error-utils"
import { ApiClientError } from "@/lib/api-client"
import { getDateRangeError } from "@/lib/date-utils"
import type {
  PaymentMethodIncomesResponse,
  PaymentMethodResponse,
  PaymentMethodExpensesResponse,
  PaymentMethodProjectsResponse,
  PaymentMethodBalanceResponse,
  PaymentMethodSummaryResponse,
  UpdatePaymentMethodRequest,
} from "@/types/payment-method"
import type { PartnerResponse } from "@/types/partner"

export type MovementActiveStatusFilter = "all" | "active" | "inactive"

function toIsActiveParam(status: MovementActiveStatusFilter): boolean | undefined {
  if (status === "all") return undefined
  return status === "active"
}

interface UsePaymentMethodDetailReturn {
  paymentMethod: PaymentMethodResponse | null
  expenses: PaymentMethodExpensesResponse
  incomes: PaymentMethodIncomesResponse
  projects: PaymentMethodProjectsResponse
  summary: PaymentMethodSummaryResponse | null
  balance: PaymentMethodBalanceResponse | null
  loadingDetail: boolean
  loadingExpenses: boolean
  loadingIncomes: boolean
  loadingProjects: boolean
  loadingSummary: boolean
  loadingBalance: boolean
  error: string | null
  page: number
  pageSize: number
  sort: string
  incomePage: number
  incomePageSize: number
  incomeSort: string
  from: string
  to: string
  activeStatus: MovementActiveStatusFilter
  dateRangeError: string | null
  projectId: string
  setPage: (p: number) => void
  setPageSize: (s: number) => void
  handleSortChange: (s: string) => void
  setIncomePage: (p: number) => void
  setIncomePageSize: (s: number) => void
  handleIncomeSortChange: (s: string) => void
  setFrom: (value: string) => void
  setTo: (value: string) => void
  setProjectId: (value: string) => void
  setActiveStatus: (value: MovementActiveStatusFilter) => void
  clearFilters: () => void
  editOpen: boolean
  setEditOpen: (v: boolean) => void
  deleteOpen: boolean
  setDeleteOpen: (v: boolean) => void
  mutateUpdate: (data: UpdatePaymentMethodRequest) => Promise<void>
  mutateDelete: () => Promise<boolean>
  refetchDetail: () => Promise<void>
  refetchExpenses: () => Promise<void>
  refetchIncomes: () => Promise<void>
  refetchProjects: () => Promise<void>
  partners: PartnerResponse[]
  loadingPartners: boolean
  linkPartnerOpen: boolean
  setLinkPartnerOpen: (v: boolean) => void
  openLinkPartnerDialog: () => void
  handleLinkPartner: (partnerId: string) => Promise<void>
  handleUnlinkPartner: () => Promise<void>
}

const INITIAL_EXPENSES: PaymentMethodExpensesResponse = {
  items: [],
  totalActiveAmount: 0,
  page: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
}

const INITIAL_PROJECTS: PaymentMethodProjectsResponse = {
  items: [],
  totalCount: 0,
}

const INITIAL_SUMMARY: PaymentMethodSummaryResponse = {
  relatedExpensesCount: 0,
  relatedIncomesCount: 0,
  relatedProjectsCount: 0,
  totalExpenseAmount: 0,
  totalIncomeAmount: 0,
}

const INITIAL_INCOMES: PaymentMethodIncomesResponse = {
  items: [],
  totalActiveAmount: 0,
  page: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
}

export function usePaymentMethodDetail(id: string): UsePaymentMethodDetailReturn {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodResponse | null>(null)
  const [expenses, setExpenses] = useState<PaymentMethodExpensesResponse>(INITIAL_EXPENSES)
  const [incomes, setIncomes] = useState<PaymentMethodIncomesResponse>(INITIAL_INCOMES)
  const [projects, setProjects] = useState<PaymentMethodProjectsResponse>(INITIAL_PROJECTS)
  const [summary, setSummary] = useState<PaymentMethodSummaryResponse | null>(null)
  const [balance, setBalance] = useState<PaymentMethodBalanceResponse | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(true)
  const [loadingExpenses, setLoadingExpenses] = useState(false)
  const [loadingIncomes, setLoadingIncomes] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [loadingBalance, setLoadingBalance] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pagination / sort state
  const [sort, setSort] = useState("expenseDate:desc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [incomeSort, setIncomeSort] = useState("incomeDate:desc")
  const [incomePage, setIncomePage] = useState(1)
  const [incomePageSize, setIncomePageSize] = useState(10)
  const [from, setFromState] = useState("")
  const [to, setToState] = useState("")
  const [projectId, setProjectIdState] = useState("")
  const [activeStatus, setActiveStatusState] = useState<MovementActiveStatusFilter>("active")
  const dateRangeError = getDateRangeError(from, to)

  // Modal state
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  // Partner link state
  const [partners, setPartners] = useState<PartnerResponse[]>([])
  const [loadingPartners, setLoadingPartners] = useState(false)
  const [linkPartnerOpen, setLinkPartnerOpen] = useState(false)

  // Fetch payment method detail
  const fetchPaymentMethod = useCallback(async () => {
    try {
      setError(null)
      setLoadingDetail(true)
      const data = await pmService.getPaymentMethod(id)
      setPaymentMethod(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar método de pago"
      setError(msg)
      toast.error("Error al cargar método de pago", { description: msg })
    } finally {
      setLoadingDetail(false)
    }
  }, [id])

  const fetchProjects = useCallback(async () => {
    try {
      setLoadingProjects(true)
      const data = await pmService.getPaymentMethodProjects(id)
      setProjects(data)
    } catch (err) {
      toastApiError(err, "Error al cargar proyectos relacionados")
    } finally {
      setLoadingProjects(false)
    }
  }, [id])

  const fetchSummary = useCallback(async () => {
    try {
      setLoadingSummary(true)
      const data = await pmService.getPaymentMethodSummary(id)
      setSummary(data)
    } catch (err) {
      // Fallback to computed values from paginated responses.
      setSummary(INITIAL_SUMMARY)
      toastApiError(err, "Error al cargar resumen")
    } finally {
      setLoadingSummary(false)
    }
  }, [id])

  const fetchBalance = useCallback(async () => {
    if (!projectId) {
      setBalance(null)
      setLoadingBalance(false)
      return
    }

    try {
      setLoadingBalance(true)
      const data = await pmService.getPaymentMethodBalance(id, projectId)
      setBalance(data)
    } catch (err) {
      setBalance(null)
      toastApiError(err, "Error al cargar balance por proyecto")
    } finally {
      setLoadingBalance(false)
    }
  }, [id, projectId])

  // Fetch expenses
  const fetchExpenses = useCallback(async () => {
    if (dateRangeError) return

    try {
      setLoadingExpenses(true)
      const [sortBy, sortDirection] = sort.split(":") as [string, "asc" | "desc"]
      const data = await pmService.getPaymentMethodExpenses(id, {
        page,
        pageSize,
        sortBy,
        sortDirection,
        from: from || undefined,
        to: to || undefined,
        projectId: projectId || undefined,
        isActive: toIsActiveParam(activeStatus),
      })
      setExpenses(data)
    } catch (err) {
      toastApiError(err, "Error al cargar gastos")
    } finally {
      setLoadingExpenses(false)
    }
  }, [id, page, pageSize, sort, from, to, projectId, activeStatus, dateRangeError])

  const fetchIncomes = useCallback(async () => {
    if (dateRangeError) return

    try {
      setLoadingIncomes(true)
      const [sortBy, sortDirection] = incomeSort.split(":") as [string, "asc" | "desc"]
      const data = await pmService.getPaymentMethodIncomes(id, {
        page: incomePage,
        pageSize: incomePageSize,
        sortBy,
        sortDirection,
        from: from || undefined,
        to: to || undefined,
        projectId: projectId || undefined,
        isActive: toIsActiveParam(activeStatus),
      })
      setIncomes(data)
    } catch (err) {
      toastApiError(err, "Error al cargar ingresos")
    } finally {
      setLoadingIncomes(false)
    }
  }, [id, incomePage, incomePageSize, incomeSort, from, to, projectId, activeStatus, dateRangeError])

  useEffect(() => {
    void fetchPaymentMethod()
    void fetchProjects()
    void fetchSummary()
  }, [fetchPaymentMethod, fetchProjects, fetchSummary])

  useEffect(() => {
    void fetchExpenses()
  }, [fetchExpenses])

  useEffect(() => {
    void fetchIncomes()
  }, [fetchIncomes])

  useEffect(() => {
    void fetchBalance()
  }, [fetchBalance])

  // CRUD
  const mutateUpdate = useCallback(async (data: UpdatePaymentMethodRequest) => {
    try {
      const updated = await pmService.updatePaymentMethod(id, data)
      setPaymentMethod(updated)
      toast.success("Método de pago actualizado", {
        description: `"${updated.name}" se guardó correctamente.`,
      })
      setEditOpen(false)
    } catch (err) {
      toastApiError(err, "Error al actualizar método de pago")
    }
  }, [id])

  const mutateDelete = useCallback(async () => {
    try {
      await pmService.deletePaymentMethod(id)
      toast.success("Método de pago eliminado", {
        description: "El método de pago fue desactivado.",
      })
      setDeleteOpen(false)
      // Redirect handled by parent/view
      return true
    } catch (err) {
      toastApiError(err, "Error al eliminar método de pago")
      return false
    }
  }, [id])

  const refetchDetail = useCallback(async () => {
    await fetchPaymentMethod()
  }, [fetchPaymentMethod])

  const refetchExpenses = useCallback(async () => {
    await fetchExpenses()
  }, [fetchExpenses])

  const refetchIncomes = useCallback(async () => {
    await fetchIncomes()
  }, [fetchIncomes])

  const refetchProjects = useCallback(async () => {
    await fetchProjects()
  }, [fetchProjects])

  const setFrom = useCallback((value: string) => {
    setFromState(value)
    setPage(1)
    setIncomePage(1)
  }, [])

  const setTo = useCallback((value: string) => {
    setToState(value)
    setPage(1)
    setIncomePage(1)
  }, [])

  const setProjectId = useCallback((value: string) => {
    setProjectIdState(value)
    setPage(1)
    setIncomePage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setFromState("")
    setToState("")
    setProjectIdState("")
    setActiveStatusState("active")
    setPage(1)
    setIncomePage(1)
  }, [])

  const setActiveStatus = useCallback((value: MovementActiveStatusFilter) => {
    setActiveStatusState(value)
    setPage(1)
    setIncomePage(1)
  }, [])

  const handlePageSize = useCallback((size: number) => {
    setPageSize(size)
    setPage(1)
  }, [])

  const handleSortChange = useCallback((value: string) => {
    setSort(value)
    setPage(1)
  }, [])

  const handleIncomePageSize = useCallback((size: number) => {
    setIncomePageSize(size)
    setIncomePage(1)
  }, [])

  const handleIncomeSortChange = useCallback((value: string) => {
    setIncomeSort(value)
    setIncomePage(1)
  }, [])

  const fetchPartners = useCallback(async () => {
    try {
      setLoadingPartners(true)
      const data = await getPartners({ pageSize: 200 })
      setPartners(data.items)
    } catch {
      // non-critical
    } finally {
      setLoadingPartners(false)
    }
  }, [])

  const openLinkPartnerDialog = useCallback(() => {
    setLinkPartnerOpen(true)
    fetchPartners()
  }, [fetchPartners])

  const handleLinkPartner = useCallback(async (partnerId: string) => {
    try {
      const updated = await pmService.linkPartner(id, { partnerId })
      setPaymentMethod(updated)
      setLinkPartnerOpen(false)
      toast.success("Partner vinculado", {
        description: "El partner fue asignado al método de pago.",
      })
    } catch (err) {
      toastApiError(err, "Error al vincular partner")
    }
  }, [id])

  const handleUnlinkPartner = useCallback(async () => {
    try {
      const updated = await pmService.unlinkPartner(id)
      setPaymentMethod(updated)
      toast.success("Partner quitado", {
        description: "El partner fue desvinculado del método de pago.",
      })
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 409) {
        toast.error("No se puede desenlazar el partner", {
          description:
            "Este método de pago está vinculado a uno o más proyectos. Primero desvinculalo de todos los proyectos.",
        })
        return
      }
      toastApiError(err, "Error al quitar partner")
    }
  }, [id])

  return {
    paymentMethod,
    expenses,
    incomes,
    projects,
    summary,
    balance,
    loadingDetail,
    loadingExpenses,
    loadingIncomes,
    loadingProjects,
    loadingSummary,
    loadingBalance,
    error,
    page,
    pageSize,
    sort,
    incomePage,
    incomePageSize,
    incomeSort,
    from,
    to,
    activeStatus,
    dateRangeError,
    projectId,
    setPage,
    setPageSize: handlePageSize,
    handleSortChange,
    setIncomePage,
    setIncomePageSize: handleIncomePageSize,
    handleIncomeSortChange,
    setFrom,
    setTo,
    setProjectId,
    setActiveStatus,
    clearFilters,
    editOpen,
    setEditOpen,
    deleteOpen,
    setDeleteOpen,
    mutateUpdate,
    mutateDelete,
    refetchDetail,
    refetchExpenses,
    refetchIncomes,
    refetchProjects,
    partners,
    loadingPartners,
    linkPartnerOpen,
    setLinkPartnerOpen,
    openLinkPartnerDialog,
    handleLinkPartner,
    handleUnlinkPartner,
  }
}
