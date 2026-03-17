"use client"

// components/project-detail/partners/project-partners.tsx
// Components for the project partners tab.

import { useState } from "react"
import { UserPlus, UserMinus, Loader2, Users } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { ProjectPartnerResponse } from "@/types/project-partner"
import type { PartnerResponse } from "@/types/partner"

// ─── Assign Partner Modal ──────────────────────────────────────────────────────

interface AssignPartnerModalProps {
  open: boolean
  onClose: () => void
  availablePartners: PartnerResponse[]
  assignedPartners: ProjectPartnerResponse[]
  loading: boolean
  onAssign: (partnerId: string) => Promise<void>
}

export function AssignPartnerModal({
  open,
  onClose,
  availablePartners,
  assignedPartners,
  loading,
  onAssign,
}: AssignPartnerModalProps) {
  const [assigningId, setAssigningId] = useState<string | null>(null)

  const assignedIds = new Set(assignedPartners.map((p) => p.partnerId))
  const unassigned = availablePartners.filter((p) => !assignedIds.has(p.id))

  async function handleAssign(partnerId: string) {
    setAssigningId(partnerId)
    try {
      await onAssign(partnerId)
    } finally {
      setAssigningId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Asignar partner</DialogTitle>
          <DialogDescription>
            Selecciona un partner para asignarlo al proyecto. Sus cuentas quedarán disponibles automáticamente.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : unassigned.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Users className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {availablePartners.length === 0
                ? "No tienes partners creados. Crea uno desde la sección Partners."
                : "Todos tus partners ya están asignados a este proyecto."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {unassigned.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3 hover:bg-accent/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                  {p.email && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{p.email}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAssign(p.id)}
                  disabled={assigningId === p.id}
                  className="ml-3 shrink-0"
                >
                  {assigningId === p.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <UserPlus className="size-3.5" />
                  )}
                  Asignar
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Project Partners List ─────────────────────────────────────────────────────

interface ProjectPartnersListProps {
  partners: ProjectPartnerResponse[]
  isOwner: boolean
  linkedPartnerIds?: Set<string>
  onRemove: (pp: ProjectPartnerResponse) => void
}

export function ProjectPartnersList({ partners, isOwner, linkedPartnerIds, onRemove }: ProjectPartnersListProps) {
  return (
    <div role="list" aria-label="Partners del proyecto">
      <div className="flex items-center px-5 py-2.5 text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest border-b border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent">
        <span className="flex-1">Partner</span>
        <span className="w-48 text-right hidden sm:block">Email</span>
        {isOwner && <span className="w-8" />}
      </div>

      {partners.map((pp) => {
        const hasLinkedPMs = linkedPartnerIds?.has(pp.partnerId) ?? false
        return (
          <div
            key={pp.id}
            role="listitem"
            className="group flex items-center px-5 py-3.5 border-b border-border/50 last:border-b-0 hover:bg-violet-500/5 transition-colors duration-150"
          >
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-sm font-semibold text-foreground truncate">{pp.partnerName}</p>
            </div>
            <span className="w-48 text-right text-xs text-muted-foreground hidden sm:block truncate">
              {pp.partnerEmail ?? "—"}
            </span>
            {isOwner && (
              <div className="w-8 flex justify-end">
                <button
                  onClick={() => !hasLinkedPMs && onRemove(pp)}
                  disabled={hasLinkedPMs}
                  className="flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-muted-foreground disabled:hover:bg-transparent"
                  aria-label={`Quitar ${pp.partnerName}`}
                  title={hasLinkedPMs ? "Tiene métodos de pago vinculados al proyecto. Desvincula primero." : "Quitar partner"}
                >
                  <UserMinus className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
