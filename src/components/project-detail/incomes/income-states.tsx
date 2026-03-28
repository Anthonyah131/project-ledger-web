"use client"

import { Wallet } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { useLanguage } from "@/context/language-context"

interface EmptyStateProps {
  hasSearch: boolean
  onCreate: () => void
}

export function IncomesEmptyState({ hasSearch, onCreate }: EmptyStateProps) {
  const { t } = useLanguage()

  return (
    <EmptyState
      hasSearch={hasSearch}
      onCreate={onCreate}
      icon={Wallet}
      title={t("incomes.empty")}
      description={t("incomes.emptyDescription")}
      searchDescription={t("incomes.emptySearchDescription")}
      createLabel={t("incomes.new")}
    />
  )
}

export function IncomesSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="px-5 py-2.5 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
        <Skeleton className="h-3 w-64" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-x-4 px-5 py-3.5 border-b border-border last:border-b-0"
        >
          <Skeleton className="size-2 rounded-full shrink-0" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24 mt-1.5" />
          </div>
          <Skeleton className="h-3 w-20 hidden sm:block shrink-0" />
          <Skeleton className="h-4 w-24 hidden md:block shrink-0" />
          <Skeleton className="h-3 w-28 hidden lg:block shrink-0" />
        </div>
      ))}
    </div>
  )
}
