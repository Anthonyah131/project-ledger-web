"use client"

// components/partners/partners-panel.tsx
// Main orchestrator for the partners list page (CRUD).

import dynamic from "next/dynamic"
import { memo, useCallback, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus, Mail, Phone, Users } from "lucide-react"
import { usePartners } from "@/hooks/partners/use-partners"
import { Button } from "@/components/ui/button"
import { DeleteEntityModal } from "@/components/shared/delete-entity-modal"
import { Pagination } from "@/components/shared/pagination"
import { ItemActionMenu } from "@/components/shared/item-action-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { PartnersToolbar } from "./partners-toolbar"
import { PartnersList } from "./partners-list"
import { cn } from "@/lib/utils"
import type { PartnerResponse } from "@/types/partner"
import { useLanguage } from "@/context/language-context"
import { useOnboardingContext } from "@/context/onboarding-context"

const CreatePartnerModal = dynamic(() =>
  import("./create-partner-modal").then((m) => m.CreatePartnerModal),
)
const EditPartnerModal = dynamic(() =>
  import("./edit-partner-modal").then((m) => m.EditPartnerModal),
)

// ─── Partner card (grid / shelf view) ──────────────────────────────────────────

function PartnerCard({ partner, onOpen, onEdit, onDelete }: {
  partner: PartnerResponse
  onOpen: (p: PartnerResponse) => void
  onEdit: (p: PartnerResponse) => void
  onDelete: (p: PartnerResponse) => void
}) {
  const { t } = useLanguage()
  const initial = partner.name.charAt(0).toUpperCase()

  return (
    <div
      role="listitem"
      className={cn(
        "group relative bg-card flex flex-col cursor-pointer",
        "transition-all duration-150",
        "hover:bg-violet-500/5",
      )}
      onClick={() => onOpen(partner)}
    >
      <div className="flex flex-1 gap-4 p-5">
        {/* Accent bar */}
        <div className="w-1.5 shrink-0 rounded-full self-stretch bg-[oklch(0.55_0.14_280)] shadow-sm" />

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {/* Top: avatar + name + menu */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-8 rounded-full shrink-0 bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-700 dark:text-violet-400 text-xs font-bold">
                {initial}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-foreground leading-snug truncate">
                  {partner.name}
                </h3>
                {partner.notes && (
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 line-clamp-1">
                    {partner.notes}
                  </p>
                )}
              </div>
            </div>
            <ItemActionMenu
              onOpen={() => onOpen(partner)}
              openLabel={t("partners.viewDetail")}
              onEdit={() => onEdit(partner)}
              onDelete={() => onDelete(partner)}
              stopPropagation
            />
          </div>

          {/* Bottom: contact metadata */}
          {(partner.email || partner.phone) && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-auto">
              {partner.email && (
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground min-w-0">
                  <Mail className="size-3 shrink-0 text-violet-500/70" />
                  <span className="truncate">{partner.email}</span>
                </span>
              )}
              {partner.phone && (
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                  <Phone className="size-3 text-violet-500/70" />
                  {partner.phone}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const PartnerCardMemo = memo(PartnerCard)

// ─── Skeletons ─────────────────────────────────────────────────────────────────

function ShelfSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-violet-500/10">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-card p-5 flex gap-4">
          <Skeleton className="w-1.5 rounded-full self-stretch" />
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-20" />
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
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-3">
          <Skeleton className="size-7 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-3 w-32 hidden md:block" />
          <Skeleton className="h-3 w-24 hidden lg:block" />
        </div>
      ))}
    </div>
  )
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function PartnersEmptyState({ hasSearch, onCreate }: {
  hasSearch: boolean
  onCreate: () => void
}) {
  const { t } = useLanguage()
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center">
      <div className="size-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400">
        <Users className="size-5" />
      </div>
      <p className="text-sm text-muted-foreground">
        {hasSearch ? t("partners.noResults") : t("partners.noPartnersYet")}
      </p>
      {!hasSearch && (
        <Button size="sm" onClick={onCreate} className="bg-violet-600 hover:bg-violet-700 text-white border-0">
          <Plus className="size-3.5" />
          {t("partners.createButton")}
        </Button>
      )}
    </div>
  )
}

// ─── Panel ─────────────────────────────────────────────────────────────────────

export function PartnersPanel() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const { refreshProgress } = useOnboardingContext()
  const {
    partners,
    totalCount,
    loading,
    hasSearch,
    viewMode, setViewMode,
    page, setPage,
    pageSize,
    sort,
    query, setQuery,
    createOpen, setCreateOpen,
    editTarget, setEditTarget,
    deleteTarget, setDeleteTarget,
    mutateCreate,
    mutateUpdate,
    mutateDelete,
    handlePageSizeChange,
    handleSortChange,
  } = usePartners()

  // Auto-open create modal when navigated from onboarding checklist
  useEffect(() => {
    if (searchParams.get("onboarding") === "1") {
      setCreateOpen(true)
    }
  }, [searchParams, setCreateOpen])

  const handleOpenCreate = useCallback(() => setCreateOpen(true), [setCreateOpen])
  const handleCloseCreate = useCallback(() => setCreateOpen(false), [setCreateOpen])
  const handleOpenPartner = useCallback((p: PartnerResponse) => {
    router.push(`/partners/${p.id}`)
  }, [router])
  const handleSelectEdit = useCallback((p: PartnerResponse) => setEditTarget(p), [setEditTarget])
  const handleCloseEdit = useCallback(() => setEditTarget(null), [setEditTarget])
  const handleSelectDelete = useCallback((p: PartnerResponse) => setDeleteTarget(p), [setDeleteTarget])
  const handleCloseDelete = useCallback(() => setDeleteTarget(null), [setDeleteTarget])

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            {t("partners.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            <span className="font-bold text-violet-600 dark:text-violet-400">{totalCount}</span>{" "}
            {totalCount === 1 ? t("partners.singular") : t("partners.plural")}
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          size="sm"
          className="bg-violet-600 hover:bg-violet-700 text-white border-0 shadow-sm shadow-violet-500/30 transition-all"
        >
          <Plus className="size-3.5" />
          {t("partners.newButtonShort")}
        </Button>
      </div>

      {/* Toolbar */}
      <PartnersToolbar
        query={query}
        onQueryChange={setQuery}
        sort={sort}
        onSortChange={handleSortChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Content */}
      <div className="mt-4 bg-card rounded-xl border border-violet-500/20 shadow-sm shadow-violet-500/5 overflow-hidden">
        {loading ? (
          viewMode === "shelf" ? <ShelfSkeleton /> : <ListSkeleton />
        ) : partners.length === 0 ? (
          <PartnersEmptyState hasSearch={hasSearch} onCreate={handleOpenCreate} />
        ) : viewMode === "shelf" ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-violet-500/10"
            role="list"
            aria-label={t("partners.title")}
          >
            {partners.map((p) => (
              <PartnerCardMemo
                key={p.id}
                partner={p}
                onOpen={handleOpenPartner}
                onEdit={handleSelectEdit}
                onDelete={handleSelectDelete}
              />
            ))}
          </div>
        ) : (
          <PartnersList
            partners={partners}
            onEdit={handleSelectEdit}
            onDelete={handleSelectDelete}
          />
        )}

        {!loading && totalCount > pageSize && (
          <div className="border-t border-border">
            <Pagination
              page={page}
              pageSize={pageSize}
              total={totalCount}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {createOpen && (
        <CreatePartnerModal
          open={createOpen}
          onClose={handleCloseCreate}
          onCreate={async (data) => { await mutateCreate(data); refreshProgress() }}
        />
      )}
      {!!editTarget && (
        <EditPartnerModal
          partner={editTarget}
          open={!!editTarget}
          onClose={handleCloseEdit}
          onSave={mutateUpdate}
        />
      )}
      <DeleteEntityModal
        item={deleteTarget}
        open={!!deleteTarget}
        onClose={handleCloseDelete}
        onConfirm={mutateDelete}
        title={t("partners.delete.title")}
        description={t("partners.delete.description")}
        getMessage={(p) => t("partners.delete.confirm", { name: p.name })}
      />
    </div>
  )
}
