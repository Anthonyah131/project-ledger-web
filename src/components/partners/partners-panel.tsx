"use client"

// components/partners/partners-panel.tsx
// Main orchestrator for the partners list page (CRUD).

import dynamic from "next/dynamic"
import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { Plus, Mail, Phone, CreditCard } from "lucide-react"
import { usePartners } from "@/hooks/partners/use-partners"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DeleteEntityModal } from "@/components/shared/delete-entity-modal"
import { Pagination } from "@/components/shared/pagination"
import { ItemActionMenu } from "@/components/shared/item-action-menu"
import { Skeleton } from "@/components/ui/skeleton"
import type { PartnerResponse } from "@/types/partner"

const CreatePartnerModal = dynamic(() =>
  import("./create-partner-modal").then((m) => m.CreatePartnerModal),
)
const EditPartnerModal = dynamic(() =>
  import("./edit-partner-modal").then((m) => m.EditPartnerModal),
)

function PartnerCard({ partner, onOpen, onEdit, onDelete }: {
  partner: PartnerResponse
  onOpen: (p: PartnerResponse) => void
  onEdit: (p: PartnerResponse) => void
  onDelete: (p: PartnerResponse) => void
}) {
  return (
    <div
      className="group flex items-start justify-between gap-3 px-5 py-4 border-b border-border last:border-b-0 hover:bg-accent/50 cursor-pointer transition-colors"
      onClick={() => onOpen(partner)}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-medium text-foreground truncate">{partner.name}</span>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
          {partner.email && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="size-3" />
              {partner.email}
            </span>
          )}
          {partner.phone && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="size-3" />
              {partner.phone}
            </span>
          )}
        </div>
        {partner.notes && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{partner.notes}</p>
        )}
      </div>
      <ItemActionMenu
        onOpen={() => onOpen(partner)}
        onEdit={() => onEdit(partner)}
        onDelete={() => onDelete(partner)}
        stopPropagation
      />
    </div>
  )
}

function PartnersSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-7 w-7 rounded" />
        </div>
      ))}
    </div>
  )
}

function PartnersEmptyState({ hasSearch, onCreate }: {
  hasSearch: boolean
  onCreate: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center">
      <CreditCard className="size-10 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">
        {hasSearch ? "No se encontraron partners con ese criterio." : "Aún no tienes partners creados."}
      </p>
      {!hasSearch && (
        <Button size="sm" onClick={onCreate}>
          <Plus className="size-3.5" />
          Crear partner
        </Button>
      )}
    </div>
  )
}

export function PartnersPanel() {
  const router = useRouter()
  const {
    partners,
    totalCount,
    loading,
    hasSearch,
    globalIndex,
    page, setPage,
    pageSize,
    query, setQuery,
    createOpen, setCreateOpen,
    editTarget, setEditTarget,
    deleteTarget, setDeleteTarget,
    mutateCreate,
    mutateUpdate,
    mutateDelete,
  } = usePartners()

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
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Partners</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalCount} {totalCount === 1 ? "partner" : "partners"}
          </p>
        </div>
        <Button onClick={handleOpenCreate} size="sm">
          <Plus className="size-3.5" />
          Nuevo
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder="Buscar por nombre, email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Content */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {loading ? (
          <PartnersSkeleton />
        ) : partners.length === 0 ? (
          <PartnersEmptyState hasSearch={hasSearch} onCreate={handleOpenCreate} />
        ) : (
          <div>
            {partners.map((p) => (
              <PartnerCard
                key={p.id}
                partner={p}
                onOpen={handleOpenPartner}
                onEdit={handleSelectEdit}
                onDelete={handleSelectDelete}
              />
            ))}
          </div>
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
          onCreate={mutateCreate}
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
        title="Eliminar partner"
        description="Se eliminará el partner y podrían desvincularse algunas cuentas de proyectos."
        getMessage={(p) => `¿Eliminar partner "${p.name}"?`}
      />
    </div>
  )
}

