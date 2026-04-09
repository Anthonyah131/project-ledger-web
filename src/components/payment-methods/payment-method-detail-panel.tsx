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
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DeleteEntityModal } from "@/components/shared/delete-entity-modal"
import { PaymentMethodDetailFilters } from "./detail/payment-method-detail-filters"
import { PaymentMethodDetailTabs } from "./detail/payment-method-detail-tabs"
import { PAYMENT_METHOD_ACCENT } from "@/lib/constants"
import { useLanguage } from "@/context/language-context"
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
  const { t } = useLanguage()

  const typeLabels: Record<string, string> = {
    bank: t("paymentMethods.typeBank"),
    card: t("paymentMethods.typeCard"),
    cash: t("paymentMethods.typeCash"),
  }

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
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  if (!paymentMethod) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <Alert variant="destructive">
          <AlertTitle>{t("paymentMethods.loadErrorTitle")}</AlertTitle>
          <AlertDescription>
            {error ?? t("paymentMethods.loadErrorDescription")}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const relatedExpensesCount = summary?.relatedExpensesCount ?? expenses.totalCount
  const relatedIncomesCount = summary?.relatedIncomesCount ?? incomes.totalCount
  const relatedProjectsCount = summary?.relatedProjectsCount ?? projects.totalCount

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
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
                  {typeLabels[paymentMethod.type]}
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
            <Button variant="ghost" size="icon" aria-label={t("paymentMethods.actionsAriaLabel")}>
              <MoreVertical className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => runAfterMenuClose(() => setEditOpen(true))}>{t("common.edit")}</DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => runAfterMenuClose(() => setDeleteOpen(true))}
              className="text-destructive"
            >
              {t("common.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Summary card — account details + activity stats */}
      <div className="rounded-xl border border-cyan-500/15 bg-card overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-cyan-500/10">
          {/* Left: account details */}
          <div className="p-5 space-y-3">
            <p className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
              {t("paymentMethods.sectionAccount")}
            </p>
            <div className="space-y-2">
              {paymentMethod.partner && (
                <div
                  className="flex items-center gap-2 group cursor-pointer"
                  onClick={() => router.push(`/partners/${paymentMethod.partner!.id}`)}
                >
                  <User className="size-3.5 text-violet-500 shrink-0" />
                  <span className="text-xs text-muted-foreground">{t("paymentMethods.columnPartner")}</span>
                  <span className="ml-auto text-xs font-medium text-violet-600 dark:text-violet-400 truncate group-hover:underline">
                    {paymentMethod.partner.name}
                  </span>
                  <ArrowRight className="size-3 text-muted-foreground/30 group-hover:text-muted-foreground shrink-0 transition-colors" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <Building className="size-3.5 text-muted-foreground/60 shrink-0" />
                <span className="text-xs text-muted-foreground">{t("paymentMethods.bankIssuerLabel")}</span>
                <span className="ml-auto text-xs font-medium text-foreground truncate">
                  {paymentMethod.bankName ?? <span className="text-muted-foreground/40">—</span>}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="size-3.5 text-muted-foreground/60 shrink-0" />
                <span className="text-xs text-muted-foreground">{t("paymentMethods.accountLabel")}</span>
                <span className="ml-auto text-xs font-medium text-foreground truncate font-mono">
                  {paymentMethod.accountNumber ?? <span className="text-muted-foreground/40">—</span>}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-3.5 text-muted-foreground/60 shrink-0" />
                <span className="text-xs text-muted-foreground">{t("paymentMethods.columnUpdated")}</span>
                <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                  {formatDate(paymentMethod.updatedAt, { withYear: true })}
                </span>
              </div>
            </div>
          </div>

          {/* Right: activity stats */}
          <div className="p-5 space-y-3">
            <p className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
              {t("paymentMethods.sectionActivity")}
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1 rounded-lg bg-cyan-500/5 border border-cyan-500/10 p-3">
                <FolderKanban className="size-3.5 text-cyan-600 dark:text-cyan-400" />
                <span className="text-lg font-bold text-foreground tabular-nums leading-none mt-1">
                  {relatedProjectsCount}
                </span>
                <span className="text-[10px] text-muted-foreground">{t("paymentMethods.tabProjects")}</span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg bg-rose-500/5 border border-rose-500/10 p-3">
                <ReceiptText className="size-3.5 text-rose-500 dark:text-rose-400" />
                <span className="text-lg font-bold text-foreground tabular-nums leading-none mt-1">
                  {relatedExpensesCount}
                </span>
                <span className="text-[10px] text-muted-foreground">{t("paymentMethods.statExpenses")}</span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-3">
                <Wallet className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-lg font-bold text-foreground tabular-nums leading-none mt-1">
                  {relatedIncomesCount}
                </span>
                <span className="text-[10px] text-muted-foreground">{t("paymentMethods.statIncomes")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-cyan-500/15 bg-card overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-4 bg-linear-to-br from-rose-500/5 to-transparent border-b md:border-b-0 md:border-r border-rose-500/15">
            <p className="text-xs uppercase tracking-wide text-rose-500 dark:text-rose-400 font-medium">{t("paymentMethods.totalFilteredExpenses")}</p>
            {loadingExpenses ? (
              <Skeleton className="h-7 w-36 mt-1" />
            ) : (
              <p className="text-lg font-bold text-foreground mt-1 tabular-nums">
                {`${paymentMethod.currency} ${formatAmount(expenses.totalActiveAmount, "0.00")}`}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{t("paymentMethods.movements", { count: expenses.totalCount })}</p>
          </div>
          <div className="p-4 bg-linear-to-br from-emerald-500/5 to-transparent">
            <p className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-400 font-medium">{t("paymentMethods.totalFilteredIncomes")}</p>
            {loadingIncomes ? (
              <Skeleton className="h-7 w-36 mt-1" />
            ) : (
              <p className="text-lg font-bold text-foreground mt-1 tabular-nums">
                {`${paymentMethod.currency} ${formatAmount(incomes.totalActiveAmount, "0.00")}`}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{t("paymentMethods.movements", { count: incomes.totalCount })}</p>
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
        title={t("paymentMethods.delete.title")}
        description={t("paymentMethods.delete.description")}
        getMessage={(item) => t("paymentMethods.delete.confirm", { name: item.name })}
      />
    </div>
  )
}

export { PaymentMethodDetailPanelComponent as PaymentMethodDetailPanel }
