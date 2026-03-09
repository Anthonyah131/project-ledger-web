"use client"

import { Calendar, CreditCard, FolderKanban, Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pagination } from "@/components/shared/pagination"
import {
  EmptyBlock,
  ExpenseRow,
  IncomeRow,
} from "./payment-method-detail-blocks"
import { formatDate } from "@/lib/date-utils"
import type {
  PaymentMethodExpensesResponse,
  PaymentMethodIncomesResponse,
  PaymentMethodProjectsResponse,
} from "@/types/payment-method"

interface PaymentMethodDetailTabsProps {
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
}

export function PaymentMethodDetailTabs({
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
}: PaymentMethodDetailTabsProps) {
  return (
    <Tabs defaultValue="expenses">
      <TabsList variant="line">
        <TabsTrigger value="expenses">Pagos relacionados</TabsTrigger>
        <TabsTrigger value="incomes">Ingresos relacionados</TabsTrigger>
        <TabsTrigger value="projects">Proyectos</TabsTrigger>
      </TabsList>

      <TabsContent value="expenses" className="space-y-4">
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">{expenses.totalCount} pagos asociados</p>
            <div className="flex items-center gap-2">
              <Select value={sort} onValueChange={handleSortChange}>
                <SelectTrigger className="h-8 w-42.5 text-xs" aria-label="Orden de pagos">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expenseDate:desc">Fecha (reciente)</SelectItem>
                  <SelectItem value="expenseDate:asc">Fecha (antigua)</SelectItem>
                  <SelectItem value="title:asc">Titulo A - Z</SelectItem>
                  <SelectItem value="amount:desc">Mayor monto</SelectItem>
                  <SelectItem value="createdAt:desc">Recien creados</SelectItem>
                </SelectContent>
              </Select>

              <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="h-8 w-20 text-xs" aria-label="Pagos por pagina">
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
              title="Sin pagos relacionados"
              description="No hay gastos con este metodo y filtros actuales."
            />
          ) : (
            <div className="divide-y divide-border">
              {expenses.items.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  paymentMethodCurrency={paymentMethodCurrency}
                  onOpenProject={() => onOpenExpenseProject(expense.projectId)}
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
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">{incomes.totalCount} ingresos asociados</p>
            <div className="flex items-center gap-2">
              <Select value={incomeSort} onValueChange={handleIncomeSortChange}>
                <SelectTrigger className="h-8 w-42.5 text-xs" aria-label="Orden de ingresos">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="incomeDate:desc">Fecha (reciente)</SelectItem>
                  <SelectItem value="incomeDate:asc">Fecha (antigua)</SelectItem>
                  <SelectItem value="title:asc">Titulo A - Z</SelectItem>
                  <SelectItem value="amount:desc">Mayor monto</SelectItem>
                  <SelectItem value="createdAt:desc">Recien creados</SelectItem>
                </SelectContent>
              </Select>

              <Select value={String(incomePageSize)} onValueChange={(value) => setIncomePageSize(Number(value))}>
                <SelectTrigger className="h-8 w-20 text-xs" aria-label="Ingresos por pagina">
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
              title="Sin ingresos relacionados"
              description="No hay ingresos con este metodo y filtros actuales."
            />
          ) : (
            <div className="divide-y divide-border">
              {incomes.items.map((income) => (
                <IncomeRow
                  key={income.id}
                  income={income}
                  onOpenProject={() => onOpenIncomeProject(income.projectId)}
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
        <div className="rounded-lg border border-border overflow-hidden bg-card">
          <div className="px-4 py-3 border-b border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">{projects.totalCount} proyectos vinculados</p>
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
                title="Sin proyectos relacionados"
                description="Este metodo aun no tiene movimiento en proyectos."
              />
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {projects.items.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onOpenProjectCard(project.id)}
                  className="text-left rounded-lg border border-border bg-background hover:bg-accent/30 transition-colors p-4"
                >
                  <p className="text-sm font-semibold text-foreground truncate">{project.name}</p>
                  {project.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-[10px]">{project.currencyCode}</Badge>
                    <span>Owner: {project.ownerUserId.slice(0, 8)}...</span>
                  </div>

                  <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="size-3" />
                    Actualizado {formatDate(project.updatedAt)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
