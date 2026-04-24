"use client"

import { useState } from "react"
import { Calendar, CreditCard, FolderKanban, Link, Unlink, User, Wallet } from "lucide-react"
import { useLanguage } from "@/context/language-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pagination } from "@/components/shared/pagination"
import { MovementDetailSheet } from "@/components/project-detail/shared/movement-detail-sheet"
import {
  EmptyBlock,
  ExpenseRow,
  IncomeRow,
} from "./payment-method-detail-blocks"
import { formatDate } from "@/lib/date-utils"
import type {
  PaymentMethodExpenseItem,
  PaymentMethodExpensesResponse,
  PaymentMethodIncomesResponse,
  PaymentMethodProjectsResponse,
  PaymentMethodPartnerSummary,
} from "@/types/payment-method"
import type { PartnerResponse } from "@/types/partner"

interface PartnerTabProps {
  currentPartner: PaymentMethodPartnerSummary | null
  partners: PartnerResponse[]
  loadingPartners: boolean
  linkPartnerOpen: boolean
  onOpenLinkDialog: () => void
  onCloseLinkDialog: () => void
  onLink: (partnerId: string) => Promise<void>
  onUnlink: () => Promise<void>
}

interface PaymentMethodDetailTabsProps {
  paymentMethod: { id: string; currency: string } | null
  expenses: PaymentMethodExpensesResponse
  incomes: PaymentMethodIncomesResponse
  projects: PaymentMethodProjectsResponse
  paymentMethodCurrency: string
  loadingExpenses: boolean
  loadingIncomes: boolean
  loadingProjects: boolean
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
  onOpenExpenseProject: (projectId: string) => void
  onOpenIncomeProject: (projectId: string) => void
  onOpenProjectCard: (projectId: string) => void
  partnerTab: PartnerTabProps
  defaultTab?: string
}

function PartnerLinkList({
  partners,
  loading,
  onLink,
}: {
  partners: PartnerResponse[]
  loading: boolean
  onLink: (partnerId: string) => Promise<void>
}) {
  const { t } = useLanguage()
  const [pendingId, setPendingId] = useState<string | null>(null)

  async function handleLink(partnerId: string) {
    setPendingId(partnerId)
    try {
      await onLink(partnerId)
    } finally {
      setPendingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3 py-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <Skeleton className="size-8 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20 mt-1.5" />
            </div>
            <Skeleton className="h-7 w-20" />
          </div>
        ))}
      </div>
    )
  }

  if (partners.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <User className="size-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">{t("paymentMethods.noPartnersRegistered")}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 py-2">
      {partners.map((partner) => (
        <div key={partner.id} className="flex items-center gap-3 py-2">
          <div className="size-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <User className="size-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{partner.name}</p>
            {partner.email && (
              <p className="text-xs text-muted-foreground truncate">{partner.email}</p>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7 shrink-0"
            disabled={pendingId === partner.id}
            onClick={() => handleLink(partner.id)}
          >
            {pendingId === partner.id ? "..." : t("paymentMethods.assignButton")}
          </Button>
        </div>
      ))}
    </div>
  )
}

export function PaymentMethodDetailTabs({
  paymentMethod,
  expenses,
  incomes,
  projects,
  paymentMethodCurrency,
  loadingExpenses,
  loadingIncomes,
  loadingProjects,
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
  onOpenExpenseProject,
  onOpenIncomeProject,
  onOpenProjectCard,
  partnerTab,
  defaultTab = "expenses",
}: PaymentMethodDetailTabsProps) {
  const { t } = useLanguage()
  const [viewTarget, setViewTarget] = useState<{ type: "expense"; data: PaymentMethodExpenseItem } | { type: "income"; data: PaymentMethodIncomeItem } | null>(null)
  return (
    <>
    <Tabs defaultValue={defaultTab}>
      <TabsList variant="line" className="w-full flex-wrap gap-y-1 p-2 sm:p-3">
        <TabsTrigger value="expenses">{t("paymentMethods.tabExpenses")}</TabsTrigger>
        <TabsTrigger value="incomes">{t("paymentMethods.tabIncomes")}</TabsTrigger>
        <TabsTrigger value="projects">{t("paymentMethods.tabProjects")}</TabsTrigger>
        <TabsTrigger value="partner">{t("paymentMethods.columnPartner")}</TabsTrigger>
      </TabsList>

      <TabsContent value="expenses" className="space-y-4">
        <div className="rounded-xl border border-rose-500/20 overflow-hidden shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-rose-500/20 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent">
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{t("paymentMethods.associatedExpenses", { count: expenses.totalCount })}</p>
            <div className="flex items-center gap-2">
              <Select value={sort} onValueChange={handleSortChange}>
                <SelectTrigger className="h-8 w-42.5 text-xs" aria-label={t("common.sortBy")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expenseDate:desc">{t("paymentMethods.sortDateRecent")}</SelectItem>
                  <SelectItem value="expenseDate:asc">{t("paymentMethods.sortDateOld")}</SelectItem>
                  <SelectItem value="title:asc">{t("paymentMethods.sortTitleAZ")}</SelectItem>
                  <SelectItem value="amount:desc">{t("paymentMethods.sortAmountDesc")}</SelectItem>
                  <SelectItem value="createdAt:desc">{t("paymentMethods.sortRecentlyCreated")}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="h-8 w-20 text-xs" aria-label={t("common.perPage")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loadingExpenses ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : expenses.items.length === 0 ? (
            <EmptyBlock
              icon={CreditCard}
              title={t("paymentMethods.noExpenses")}
              description={t("paymentMethods.noExpensesDesc")}
            />
          ) : (
            <div className="divide-y divide-border">
              {expenses.items.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  paymentMethodCurrency={paymentMethodCurrency}
                  onOpenProject={() => onOpenExpenseProject(expense.projectId)}
                  onView={(exp) => setViewTarget({ type: "expense", data: exp })}
                />
              ))}
            </div>
          )}
        </div>

        {!loadingExpenses && expenses.totalCount > 0 && (
          <div className="border border-border rounded-lg bg-card">
            <Pagination
              page={page}
              pageSize={pageSize}
              total={expenses.totalCount}
              onPageChange={setPage}
            />
          </div>
        )}
      </TabsContent>

      <TabsContent value="incomes" className="space-y-4">
        <div className="rounded-xl border border-emerald-500/20 overflow-hidden shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{t("paymentMethods.associatedIncomes", { count: incomes.totalCount })}</p>
            <div className="flex items-center gap-2">
              <Select value={incomeSort} onValueChange={handleIncomeSortChange}>
                <SelectTrigger className="h-8 w-42.5 text-xs" aria-label={t("common.sortBy")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="incomeDate:desc">{t("paymentMethods.sortDateRecent")}</SelectItem>
                  <SelectItem value="incomeDate:asc">{t("paymentMethods.sortDateOld")}</SelectItem>
                  <SelectItem value="title:asc">{t("paymentMethods.sortTitleAZ")}</SelectItem>
                  <SelectItem value="amount:desc">{t("paymentMethods.sortAmountDesc")}</SelectItem>
                  <SelectItem value="createdAt:desc">{t("paymentMethods.sortRecentlyCreated")}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={String(incomePageSize)} onValueChange={(value) => setIncomePageSize(Number(value))}>
                <SelectTrigger className="h-8 w-20 text-xs" aria-label={t("common.perPage")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loadingIncomes ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : incomes.items.length === 0 ? (
            <EmptyBlock
              icon={Wallet}
              title={t("paymentMethods.noIncomes")}
              description={t("paymentMethods.noIncomesDesc")}
            />
          ) : (
            <div className="divide-y divide-border">
              {incomes.items.map((income) => (
                <IncomeRow
                  key={income.id}
                  income={income}
                  onOpenProject={() => onOpenIncomeProject(income.projectId)}
                  onView={(inc) => setViewTarget({ type: "income", data: inc })}
                />
              ))}
            </div>
          )}
        </div>

        {!loadingIncomes && incomes.totalCount > 0 && (
          <div className="border border-border rounded-lg bg-card">
            <Pagination
              page={incomePage}
              pageSize={incomePageSize}
              total={incomes.totalCount}
              onPageChange={setIncomePage}
            />
          </div>
        )}
      </TabsContent>

      <TabsContent value="projects">
        <div className="rounded-xl border border-violet-500/20 overflow-hidden bg-card shadow-sm">
          <div className="px-4 py-3 border-b border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent">
            <p className="text-xs font-bold text-violet-600 dark:text-violet-400">{t("paymentMethods.linkedProjects", { count: projects.totalCount })}</p>
          </div>

          {loadingProjects ? (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ) : projects.items.length === 0 ? (
            <div className="p-4">
              <EmptyBlock
                icon={FolderKanban}
                title={t("paymentMethods.noProjects")}
                description={t("paymentMethods.noProjectsDesc")}
              />
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {projects.items.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onOpenProjectCard(project.id)}
                  className="text-left rounded-xl border border-violet-500/15 bg-gradient-to-br from-violet-500/5 to-transparent hover:from-violet-500/10 hover:shadow-sm transition-all p-4"
                >
                  <p className="text-sm font-bold text-foreground truncate">{project.name}</p>
                  {project.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-[10px] border-violet-500/30 text-violet-600 dark:text-violet-400">{project.currencyCode}</Badge>
                    <span>{t("paymentMethods.ownerLabel")}: {project.ownerUserId.slice(0, 8)}...</span>
                  </div>

                  <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="size-3" />
                    {t("paymentMethods.projectUpdated", { date: formatDate(project.updatedAt) })}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="partner">
        <div className="p-5">
          {partnerTab.currentPartner ? (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-transparent p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                      <User className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{partnerTab.currentPartner.name}</p>
                      {partnerTab.currentPartner.email && (
                        <p className="text-xs text-muted-foreground">{partnerTab.currentPartner.email}</p>
                      )}
                      {partnerTab.currentPartner.phone && (
                        <p className="text-xs text-muted-foreground">{partnerTab.currentPartner.phone}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={partnerTab.onUnlink}
                    className="text-destructive border-destructive/30 hover:bg-destructive/10 shrink-0"
                  >
                    <Unlink className="size-3.5 mr-1" />
                    {t("paymentMethods.unlinkButton")}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("paymentMethods.partnerChangeHint")}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-14 text-center">
              <div className="size-12 rounded-xl bg-muted/50 flex items-center justify-center">
                <User className="size-6 text-muted-foreground/40" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t("paymentMethods.noPartner")}</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  {t("paymentMethods.noPartnerDesc")}
                </p>
              </div>
              <Button size="sm" onClick={partnerTab.onOpenLinkDialog}>
                <Link className="size-3.5 mr-1" />
                {t("paymentMethods.assignPartner")}
              </Button>
            </div>
          )}
        </div>

        {/* Link partner dialog */}
        <Dialog open={partnerTab.linkPartnerOpen} onOpenChange={(v) => !v && partnerTab.onCloseLinkDialog()}>
          <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("paymentMethods.assignPartner")}</DialogTitle>
              <DialogDescription>
                {t("paymentMethods.assignPartnerDesc")}
              </DialogDescription>
            </DialogHeader>
            <PartnerLinkList
              partners={partnerTab.partners}
              loading={partnerTab.loadingPartners}
              onLink={async (partnerId) => {
                await partnerTab.onLink(partnerId)
              }}
            />
          </DialogContent>
        </Dialog>
      </TabsContent>
    </Tabs>

    <MovementDetailSheet
      movement={viewTarget}
      projectCurrency={paymentMethodCurrency}
      paymentMethods={paymentMethod ? [{ id: paymentMethod.id, name: "", type: "bank" as const, currency: paymentMethod.currency, bankName: null, accountNumber: null, description: null, partner_id: null, partner: null, createdAt: "", updatedAt: "" }] : []}
      onClose={() => setViewTarget(null)}
      onEdit={() => {}}
    />
    </>
  )
}
