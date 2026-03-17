"use client"

// components/partners/partner-detail-panel.tsx
// Detail panel for a partner — shows info, payment methods, and related projects.

import dynamic from "next/dynamic"
import { useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  CreditCard,
  FolderKanban,
  Mail,
  MoreVertical,
  Phone,
  StickyNote,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DeleteEntityModal } from "@/components/shared/delete-entity-modal"
import { usePartnerDetail } from "@/hooks/partners/use-partner-detail"
import type { PartnerDetailResponse, PartnerPaymentMethodItem, PartnerProjectResponse } from "@/types/partner"

const EditPartnerModal = dynamic(() =>
  import("./edit-partner-modal").then((m) => m.EditPartnerModal),
)

// ─── Sub-components ────────────────────────────────────────────────────────────

function PaymentMethodRow({ pm }: { pm: PartnerPaymentMethodItem }) {
  const typeLabel: Record<string, string> = { bank: "Banco", card: "Tarjeta", cash: "Efectivo" }
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border last:border-b-0">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-medium text-foreground truncate">{pm.name}</span>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{typeLabel[pm.type] ?? pm.type}</Badge>
          {pm.bankName && (
            <span className="text-xs text-muted-foreground truncate">{pm.bankName}</span>
          )}
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground shrink-0">{pm.currency}</span>
    </div>
  )
}

function ProjectRow({ project }: { project: PartnerProjectResponse }) {
  const router = useRouter()
  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-accent/50 cursor-pointer transition-colors"
      onClick={() => router.push(`/projects/${project.id}`)}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-medium text-foreground truncate">{project.name}</span>
        {project.description && (
          <span className="text-xs text-muted-foreground truncate">{project.description}</span>
        )}
        {project.workspaceName && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 w-fit font-medium text-muted-foreground mt-0.5">
            {project.workspaceName}
          </Badge>
        )}
      </div>
      <span className="text-xs font-medium text-muted-foreground shrink-0">{project.currencyCode}</span>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="size-8 rounded" />
      </div>
      <Skeleton className="h-px w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

// ─── Main panel ────────────────────────────────────────────────────────────────

interface PartnerDetailPanelProps {
  partnerId: string
}

export function PartnerDetailPanel({ partnerId }: PartnerDetailPanelProps) {
  const router = useRouter()
  const {
    partner,
    relatedProjects,
    loading,
    loadingProjects,
    error,
    editOpen, setEditOpen,
    deleteOpen, setDeleteOpen,
    mutateUpdate,
    mutateDelete,
  } = usePartnerDetail(partnerId)

  const handleConfirmDelete = useCallback(
    (_p: PartnerDetailResponse) => mutateDelete(),
    [mutateDelete],
  )

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="mb-6">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <DetailSkeleton />
        </div>
      </div>
    )
  }

  if (error || !partner) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
            onClick={() => router.push("/partners")}
          >
            <ArrowLeft className="size-4" />
            Partners
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
          <p className="text-sm text-muted-foreground">No se pudo cargar la información del partner.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Back */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
          onClick={() => router.push("/partners")}
        >
          <ArrowLeft className="size-4" />
          Partners
        </Button>
      </div>

      {/* Header */}
      <div className="bg-card rounded-lg border border-border p-6 mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-foreground tracking-tight truncate">
              {partner.name}
            </h1>
            <div className="flex flex-col gap-1 mt-2">
              {partner.email && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="size-3.5" />
                  {partner.email}
                </span>
              )}
              {partner.phone && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="size-3.5" />
                  {partner.phone}
                </span>
              )}
              {partner.notes && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                  <StickyNote className="size-3.5 shrink-0" />
                  <span className="line-clamp-2">{partner.notes}</span>
                </span>
              )}
            </div>
          </div>

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 shrink-0">
                <MoreVertical className="size-4" />
                <span className="sr-only">Opciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Payment methods */}
      <div className="bg-card rounded-lg border border-border overflow-hidden mb-4">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <CreditCard className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-foreground">
            Métodos de pago
            {partner.paymentMethods.length > 0 && (
              <span className="ml-2 text-muted-foreground font-normal">({partner.paymentMethods.length})</span>
            )}
          </h2>
        </div>
        {partner.paymentMethods.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center">
            <p className="text-sm text-muted-foreground">
              Este partner no tiene métodos de pago registrados.
            </p>
          </div>
        ) : (
          <div>
            {partner.paymentMethods.map((pm) => (
              <PaymentMethodRow key={pm.id} pm={pm} />
            ))}
          </div>
        )}
      </div>

      {/* Related projects */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <FolderKanban className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-foreground">
            Proyectos relacionados
            {relatedProjects.length > 0 && (
              <span className="ml-2 text-muted-foreground font-normal">({relatedProjects.length})</span>
            )}
          </h2>
        </div>
        {loadingProjects ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-3 w-8" />
              </div>
            ))}
          </div>
        ) : relatedProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center">
            <p className="text-sm text-muted-foreground">
              No hay proyectos con este partner asignado.
            </p>
          </div>
        ) : (
          <div>
            {relatedProjects.map((p) => (
              <ProjectRow key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editOpen && (
        <EditPartnerModal
          partner={partner}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSave={mutateUpdate}
        />
      )}

      {/* Delete modal */}
      <DeleteEntityModal
        item={deleteOpen ? partner : null}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar partner"
        description="Se eliminará el partner. Esta acción no puede deshacerse si no tiene cuentas vinculadas a proyectos activos."
        getMessage={(p) => `¿Eliminar partner "${p.name}"?`}
      />
    </div>
  )
}
