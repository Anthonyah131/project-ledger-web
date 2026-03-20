"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CreditCard } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/shared/pagination"
import { SectionToolbar } from "./section-toolbar"
import { PAYMENT_METHOD_ACCENT, PAYMENT_METHOD_TYPE_LABEL } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { PartnerPaymentMethodItem } from "@/types/partner"
import type { ViewMode } from "@/types/project"

const SORT_OPTIONS = [
  { value: "name:asc", label: "A - Z" },
  { value: "name:desc", label: "Z - A" },
  { value: "updatedAt:desc", label: "Recientes" },
]

function PmCard({ pm }: { pm: PartnerPaymentMethodItem }) {
  const router = useRouter()
  return (
    <div
      role="listitem"
      className="group bg-card flex flex-col cursor-pointer transition-colors duration-150 hover:bg-cyan-500/5"
      onClick={() => router.push(`/payment-methods/${pm.id}`)}
    >
      <div className="flex flex-1 gap-4 p-5">
        <div className={cn("w-1.5 shrink-0 rounded-full self-stretch shadow-sm", PAYMENT_METHOD_ACCENT[pm.type])} />
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-foreground leading-snug truncate">{pm.name}</h3>
            {pm.bankName && (
              <p className="text-xs text-muted-foreground leading-relaxed mt-1 truncate">{pm.bankName}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-auto">
            <Badge className="text-[10px] px-1.5 py-0 h-4 font-semibold bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
              {PAYMENT_METHOD_TYPE_LABEL[pm.type]}
            </Badge>
            <span className="text-border">{"/"}</span>
            <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400">{pm.currency}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function PmRow({ pm }: { pm: PartnerPaymentMethodItem }) {
  const router = useRouter()
  return (
    <div
      role="listitem"
      className="group flex items-center gap-3 px-5 py-3 border-b border-border/50 last:border-b-0 hover:bg-cyan-500/5 transition-colors duration-150 cursor-pointer"
      onClick={() => router.push(`/payment-methods/${pm.id}`)}
    >
      <div className={cn("size-2 rounded-full shrink-0 ring-2 ring-offset-1 ring-offset-card", PAYMENT_METHOD_ACCENT[pm.type])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{pm.name}</p>
        {pm.bankName && <p className="text-xs text-muted-foreground truncate mt-0.5">{pm.bankName}</p>}
      </div>
      <Badge className="text-[10px] px-1.5 py-0 h-4 font-semibold bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 shrink-0">
        {PAYMENT_METHOD_TYPE_LABEL[pm.type]}
      </Badge>
      <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400 w-10 text-right tabular-nums">{pm.currency}</span>
    </div>
  )
}

interface PartnerPmSectionProps {
  items: PartnerPaymentMethodItem[]
  totalCount: number
  page: number
  onPageChange: (p: number) => void
  pageSize: number
  onPageSizeChange: (s: number) => void
  sort: string
  onSortChange: (s: string) => void
  loading: boolean
}

export function PartnerPmSection({
  items,
  totalCount,
  page,
  onPageChange,
  pageSize,
  onPageSizeChange,
  sort,
  onSortChange,
  loading,
}: PartnerPmSectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("shelf")

  return (
    <div className="bg-card rounded-xl border border-cyan-500/20 shadow-sm shadow-cyan-500/5 overflow-hidden mb-4">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-border bg-gradient-to-r from-cyan-500/5 to-transparent">
        <CreditCard className="size-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
        <h2 className="text-sm font-semibold text-foreground">Métodos de pago</h2>
        {totalCount > 0 && (
          <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 tabular-nums">{totalCount}</span>
        )}
        <div className="ml-auto">
          <SectionToolbar
            sort={sort}
            sortOptions={SORT_OPTIONS}
            onSortChange={onSortChange}
            pageSize={pageSize}
            onPageSizeChange={onPageSizeChange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            accentClass="bg-cyan-500/15 text-cyan-700 dark:text-cyan-400"
            borderClass="border-cyan-500/25"
          />
        </div>
      </div>

      {loading ? (
        viewMode === "shelf" ? <GridSkeleton /> : <ListSkeleton />
      ) : items.length === 0 ? (
        <SectionEmpty message="Este partner no tiene métodos de pago registrados." />
      ) : viewMode === "shelf" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-cyan-500/10" role="list">
          {items.map((pm) => <PmCard key={pm.id} pm={pm} />)}
        </div>
      ) : (
        <div role="list">
          {items.map((pm) => <PmRow key={pm.id} pm={pm} />)}
        </div>
      )}

      {!loading && totalCount > pageSize && (
        <div className="border-t border-border">
          <Pagination page={page} pageSize={pageSize} total={totalCount} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border/50">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card p-5 flex gap-4">
          <Skeleton className="w-1.5 rounded-full self-stretch shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-20" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-14 rounded-full" />
              <Skeleton className="h-4 w-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-3">
          <Skeleton className="size-2 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
      ))}
    </div>
  )
}

function SectionEmpty({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-10 px-4">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
