"use client"

import { useCallback } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Building,
  Calendar,
  FolderKanban,
  Hash,
  MoreVertical,
  ReceiptText,
  User,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DeleteEntityModal } from "@/components/shared/delete-entity-modal"
import {
  InfoCard,
} from "./detail/payment-method-detail-blocks"
import { PaymentMethodDetailFilters } from "./detail/payment-method-detail-filters"
import { PaymentMethodDetailTabs } from "./detail/payment-method-detail-tabs"
import {
  PAYMENT_METHOD_ACCENT,
  PAYMENT_METHOD_TYPE_LABEL,
} from "@/lib/constants"
import { formatDate } from "@/lib/date-utils"
import { formatAmount } from "@/lib/format-utils"
import type {
  PaymentMethodExpensesResponse,
  PaymentMethodIncomesResponse,
  PaymentMethodProjectsResponse,
  PaymentMethodResponse,
  PaymentMethodSummaryResponse,
  UpdatePaymentMethodRequest,
} from "@/types/payment-method"
import type { PartnerResponse } from "@/types/partner"

const EditPaymentMethodModal = dynamic(() =>
  import("./edit-payment-method-modal").then((mod) => mod.EditPaymentMethodModal),
)

interface PaymentMethodDetailPanelProps {
  paymentMethod: PaymentMethodResponse | null
  expenses: PaymentMethodExpensesResponse
  incomes: PaymentMethodIncomesResponse
  projects: PaymentMethodProjectsResponse
  summary: PaymentMethodSummaryResponse | null
  loadingDetail: boolean
  loadingExpenses: boolean
  loadingIncomes: boolean
  loadingProjects: boolean
  loadingSummary: boolean
  error: string | null
  page: number
  setPage: (p: number) => void
  pageSize: number
  setPageSize: (s: number) => void
  sort: string
  handleSortChange: (s: string) => void
  incomePage: number
  setIncomePage: (p: number) => void
  incomePageSize: number
  setIncomePageSize: (s: number) => void
  incomeSort: string
  handleIncomeSortChange: (s: string) => void
  from: string
  to: string
  activeStatus: "all" | "active" | "inactive"
  dateRangeError: string | null
  projectId: string
  setFrom: (value: string) => void
  setTo: (value: string) => void
  setProjectId: (value: string) => void
  setActiveStatus: (value: "all" | "active" | "inactive") => void
  clearFilters: () => void
  editOpen: boolean
  setEditOpen: (v: boolean) => void
  deleteOpen: boolean
  setDeleteOpen: (v: boolean) => void
  mutateUpdate: (data: UpdatePaymentMethodRequest) => Promise<void>
  mutateDelete: () => Promise<boolean>
  onBack: () => void
  partners: PartnerResponse[]
  loadingPartners: boolean
  linkPartnerOpen: boolean
  setLinkPartnerOpen: (v: boolean) => void
  openLinkPartnerDialog: () => void
  onLinkPartner: (partnerId: string) => Promise<void>
  onUnlinkPartner: () => Promise<void>
}

function PaymentMethodDetailPanelComponent({
  paymentMethod,
  expenses,
  incomes,
  projects,
  summary,
  loadingDetail,
  loadingExpenses,
  loadingIncomes,
  loadingProjects,
  loadingSummary,
  error,
  page,
  setPage,
  pageSize,
  setPageSize,
  sort,
  handleSortChange,
  incomePage,
  setIncomePage,
  incomePageSize,
  setIncomePageSize,
  incomeSort,
  handleIncomeSortChange,
  from,
  to,
  activeStatus,
  dateRangeError,
  projectId,
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
  onBack,
  partners,
  loadingPartners,
  linkPartnerOpen,
  setLinkPartnerOpen,
  openLinkPartnerDialog,
  onLinkPartner,
  onUnlinkPartner,
}: PaymentMethodDetailPanelProps) {
  const router = useRouter()

  const runAfterMenuClose = useCallback((action: () => void) => {
    if (typeof window !== "undefined" && "requestAnimationFrame" in window) {
      window.requestAnimationFrame(action)
      return
    }
    setTimeout(action, 0)
  }, [])

  const handleSaveEdit = useCallback(
    async (_id: string, data: UpdatePaymentMethodRequest) => {
      await mutateUpdate(data)
    },
    [mutateUpdate],
  )

  if (loadingDetail) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  if (!paymentMethod) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <Alert variant="destructive">
          <AlertTitle>No se pudo cargar el metodo de pago</AlertTitle>
          <AlertDescription>
            {error ?? "El metodo no existe o no tienes permisos para verlo."}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const relatedExpensesCount = summary?.relatedExpensesCount ?? expenses.totalCount
  const relatedIncomesCount = summary?.relatedIncomesCount ?? incomes.totalCount
  const relatedProjectsCount = summary?.relatedProjectsCount ?? projects.totalCount

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            <ArrowLeft className="size-5" />
          </Button>

          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-2 h-10 rounded-full shadow-md ${PAYMENT_METHOD_ACCENT[paymentMethod.type]}`} style={{ filter: 'drop-shadow(0 0 4px currentColor)' }} />
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-foreground truncate">{paymentMethod.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30">
                  {PAYMENT_METHOD_TYPE_LABEL[paymentMethod.type]}
                </span>
                <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30">
                  {paymentMethod.currency}
                </span>
                {paymentMethod.accountNumber && (
                  <span className="text-xs text-muted-foreground truncate">
                    {paymentMethod.accountNumber}
                  </span>
                )}
                {paymentMethod.partner && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-700 dark:text-violet-400 border border-violet-500/30">
                    <User className="size-2.5" />
                    {paymentMethod.partner.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Acciones del método de pago">
              <MoreVertical className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => runAfterMenuClose(() => setEditOpen(true))}>Editar</DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => runAfterMenuClose(() => setDeleteOpen(true))}
              className="text-destructive"
            >
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${paymentMethod.partner ? "lg:grid-cols-7" : "lg:grid-cols-6"}`}>
        {paymentMethod.partner && (
          <InfoCard icon={User} label="Partner" value={paymentMethod.partner.name} />
        )}
        <InfoCard icon={Building} label="Banco / emisor" value={paymentMethod.bankName ?? "-"} />
        <InfoCard icon={Hash} label="Cuenta" value={paymentMethod.accountNumber ?? "-"} />
        <InfoCard icon={FolderKanban} label="Proyectos" value={String(relatedProjectsCount)} />
        <InfoCard icon={ReceiptText} label="Gastos" value={String(relatedExpensesCount)} />
        <InfoCard icon={Wallet} label="Ingresos" value={String(relatedIncomesCount)} />
        <InfoCard
          icon={Calendar}
          label="Ultima actualizacion"
          value={formatDate(paymentMethod.updatedAt, { withYear: true })}
        />
      </div>

      <div className="rounded-xl border border-cyan-500/15 bg-card overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-4 bg-gradient-to-br from-rose-500/5 to-transparent border-b md:border-b-0 md:border-r border-rose-500/15">
            <p className="text-xs uppercase tracking-wide text-rose-500 dark:text-rose-400 font-medium">Total gasto relacionado</p>
            <p className="text-lg font-bold text-foreground mt-1 tabular-nums">
              {loadingSummary
                ? "Cargando..."
                : `${summary?.currency ?? paymentMethod.currency} ${formatAmount(summary?.totalExpenseAmount, "0.00")}`}
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-emerald-500/5 to-transparent">
            <p className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-400 font-medium">Total ingreso relacionado</p>
            <p className="text-lg font-bold text-foreground mt-1 tabular-nums">
              {loadingSummary
                ? "Cargando..."
                : `${summary?.currency ?? paymentMethod.currency} ${formatAmount(summary?.totalIncomeAmount, "0.00")}`}
            </p>
          </div>
        </div>
      </div>

      <PaymentMethodDetailFilters
        projects={projects}
        from={from}
        to={to}
        activeStatus={activeStatus}
        projectId={projectId}
        dateRangeError={dateRangeError}
        setFrom={setFrom}
        setTo={setTo}
        setProjectId={setProjectId}
        setActiveStatus={setActiveStatus}
        clearFilters={clearFilters}
      />

      <PaymentMethodDetailTabs
        expenses={expenses}
        incomes={incomes}
        projects={projects}
        paymentMethodCurrency={paymentMethod.currency}
        loadingExpenses={loadingExpenses}
        loadingIncomes={loadingIncomes}
        loadingProjects={loadingProjects}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        sort={sort}
        handleSortChange={handleSortChange}
        incomePage={incomePage}
        setIncomePage={setIncomePage}
        incomePageSize={incomePageSize}
        setIncomePageSize={setIncomePageSize}
        incomeSort={incomeSort}
        handleIncomeSortChange={handleIncomeSortChange}
        onOpenExpenseProject={(expenseProjectId) => router.push(`/projects/${expenseProjectId}`)}
        onOpenIncomeProject={(incomeProjectId) => router.push(`/projects/${incomeProjectId}`)}
        onOpenProjectCard={(cardProjectId) => router.push(`/projects/${cardProjectId}`)}
        partnerTab={{
          currentPartner: paymentMethod.partner,
          partners,
          loadingPartners,
          linkPartnerOpen,
          onOpenLinkDialog: openLinkPartnerDialog,
          onCloseLinkDialog: () => setLinkPartnerOpen(false),
          onLink: onLinkPartner,
          onUnlink: onUnlinkPartner,
        }}
      />

      {editOpen && (
        <EditPaymentMethodModal
          paymentMethod={paymentMethod}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSave={handleSaveEdit}
        />
      )}

      <DeleteEntityModal
        item={paymentMethod}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={mutateDelete}
        title="Eliminar metodo de pago"
        description="Esta accion puede desactivarlo, no eliminarlo definitivamente."
        getMessage={(item) => `¿Eliminar "${item.name}"?`}
      />
    </div>
  )
}

export { PaymentMethodDetailPanelComponent as PaymentMethodDetailPanel }
