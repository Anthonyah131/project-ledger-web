"use client"

import { useMemo, useState } from "react"
import { CreditCard, Plus, X } from "lucide-react"
import { TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { DeleteEntityModal } from "@/components/shared/delete-entity-modal"
import { PAYMENT_METHOD_TYPE_LABEL } from "@/lib/constants"
import type { AvailablePaymentMethodsPartnerItem, ProjectPaymentMethodItem } from "@/types/project-partner"
import type { PartnerPaymentMethodItem } from "@/types/partner"

// ── Interfaces ────────────────────────────────────────────

interface PaymentMethodsTabState {
  loading: boolean
  linkedPMs: ProjectPaymentMethodItem[]
  availableGroups: AvailablePaymentMethodsPartnerItem[]
  unpartneredPMs?: PartnerPaymentMethodItem[]
  availableLoading: boolean
  addOpen: boolean
  removeTarget: ProjectPaymentMethodItem | null
}

interface ProjectDetailPaymentMethodsTabProps {
  ppm: PaymentMethodsTabState
  isOwner: boolean
  onAddOpen: () => void
  onAddClose: () => void
  onLink: (pmId: string, pmName: string) => Promise<void>
  onRemoveSelect: (pm: ProjectPaymentMethodItem) => void
  onRemoveClose: () => void
  onUnlink: (pm: ProjectPaymentMethodItem) => Promise<boolean> | void
}

// ── Skeleton ─────────────────────────────────────────────

function LinkedPMsSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24 mt-1.5" />
          </div>
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-10" />
          <Skeleton className="size-7 rounded" />
        </div>
      ))}
    </div>
  )
}

// ── Empty state ──────────────────────────────────────────

function LinkedPMsEmptyState({
  isOwner,
  onAdd,
}: {
  isOwner: boolean
  onAdd: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center">
      <CreditCard className="size-10 text-muted-foreground/50" />
      <p className="text-sm font-medium text-foreground">Sin métodos de pago vinculados</p>
      {isOwner ? (
        <>
          <p className="text-xs text-muted-foreground max-w-xs">
            Vincula métodos de pago para usarlos en gastos e ingresos del proyecto.
          </p>
          <Button size="sm" variant="outline" onClick={onAdd}>
            <Plus className="size-3.5" />
            Agregar método de pago
          </Button>
        </>
      ) : (
        <p className="text-xs text-muted-foreground max-w-xs">
          No hay métodos de pago vinculados a este proyecto.
        </p>
      )}
    </div>
  )
}

// ── Linked PMs list ──────────────────────────────────────

function LinkedPaymentMethodsList({
  linkedPMs,
  isOwner,
  onRemove,
}: {
  linkedPMs: ProjectPaymentMethodItem[]
  isOwner: boolean
  onRemove: (pm: ProjectPaymentMethodItem) => void
}) {
  return (
    <div className="divide-y divide-border">
      {linkedPMs.map((pm) => (
        <div
          key={pm.id}
          className="flex items-center gap-3 px-4 py-3 hover:bg-accent/20 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{pm.name}</p>
            {(pm.bankName || pm.partnerName) && (
              <p className="text-xs text-muted-foreground truncate">
                {[pm.bankName, pm.partnerName].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Badge variant="outline" className="text-[10px]">
              {PAYMENT_METHOD_TYPE_LABEL[pm.type]}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {pm.currency}
            </Badge>
          </div>
          {isOwner && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-destructive flex-shrink-0"
              onClick={() => onRemove(pm)}
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Add dialog ───────────────────────────────────────────

function AddPaymentMethodDialog({
  open,
  onClose,
  availableGroups,
  unpartneredPMs,
  linkedPMIds,
  loading,
  onLink,
}: {
  open: boolean
  onClose: () => void
  availableGroups: AvailablePaymentMethodsPartnerItem[]
  unpartneredPMs: PartnerPaymentMethodItem[]
  linkedPMIds: Set<string>
  loading: boolean
  onLink: (pmId: string, pmName: string) => Promise<void>
}) {
  const [pendingId, setPendingId] = useState<string | null>(null)

  async function handleLinkClick(pmId: string, pmName: string) {
    setPendingId(pmId)
    try {
      await onLink(pmId, pmName)
    } finally {
      setPendingId(null)
    }
  }

  const hasAny = unpartneredPMs.length > 0 || availableGroups.some((g) => g.paymentMethods.length > 0)

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Agregar método de pago</DialogTitle>
          <DialogDescription>
            Elige un método de pago para vincularlo al proyecto. Los disponibles dependen de los
            partners asignados al proyecto.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {loading ? (
            <div className="flex flex-col gap-3 py-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24 mt-1.5" />
                  </div>
                  <Skeleton className="h-7 w-20" />
                </div>
              ))}
            </div>
          ) : !hasAny ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <CreditCard className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No hay métodos de pago disponibles. Asigna partners al proyecto primero.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-2">
              {unpartneredPMs.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Sin partner
                  </p>
                  <div className="flex flex-col gap-1">
                    {unpartneredPMs.map((pm) => {
                      const linked = linkedPMIds.has(pm.id)
                      return (
                        <div key={pm.id} className="flex items-center gap-2 py-1.5">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{pm.name}</p>
                            {pm.bankName && (
                              <p className="text-xs text-muted-foreground truncate">{pm.bankName}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Badge variant="outline" className="text-[10px]">
                              {PAYMENT_METHOD_TYPE_LABEL[pm.type]}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px]">
                              {pm.currency}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant={linked ? "ghost" : "outline"}
                            className="text-xs h-7 flex-shrink-0"
                            disabled={linked || pendingId === pm.id}
                            onClick={() => handleLinkClick(pm.id, pm.name)}
                          >
                            {linked ? "Vinculado" : pendingId === pm.id ? "..." : "Agregar"}
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              {availableGroups.map((group) =>
                group.paymentMethods.length === 0 ? null : (
                  <div key={group.partnerId}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      {group.partnerName}
                    </p>
                    <div className="flex flex-col gap-1">
                      {group.paymentMethods.map((pm) => {
                        const linked = linkedPMIds.has(pm.id)
                        return (
                          <div key={pm.id} className="flex items-center gap-2 py-1.5">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{pm.name}</p>
                              {pm.bankName && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {pm.bankName}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <Badge variant="outline" className="text-[10px]">
                                {PAYMENT_METHOD_TYPE_LABEL[pm.type]}
                              </Badge>
                              <Badge variant="secondary" className="text-[10px]">
                                {pm.currency}
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              variant={linked ? "ghost" : "outline"}
                              className="text-xs h-7 flex-shrink-0"
                              disabled={linked || pendingId === pm.id}
                              onClick={() => handleLinkClick(pm.id, pm.name)}
                            >
                              {linked ? "Vinculado" : pendingId === pm.id ? "..." : "Agregar"}
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Tab component ────────────────────────────────────────

export function ProjectDetailPaymentMethodsTab({
  ppm,
  isOwner,
  onAddOpen,
  onAddClose,
  onLink,
  onRemoveSelect,
  onRemoveClose,
  onUnlink,
}: ProjectDetailPaymentMethodsTabProps) {
  const linkedPMIds = useMemo(
    () => new Set(ppm.linkedPMs.map((pm) => pm.id)),
    [ppm.linkedPMs],
  )

  return (
    <TabsContent value="payment-methods" className="flex flex-col">
      {isOwner && (
        <div className="flex justify-end px-5 py-3 border-b border-border bg-card">
          <Button onClick={onAddOpen} size="sm">
            <Plus className="size-3.5" />
            Agregar método de pago
          </Button>
        </div>
      )}

      {ppm.loading ? (
        <LinkedPMsSkeleton />
      ) : ppm.linkedPMs.length === 0 ? (
        <LinkedPMsEmptyState isOwner={isOwner} onAdd={onAddOpen} />
      ) : (
        <LinkedPaymentMethodsList
          linkedPMs={ppm.linkedPMs}
          isOwner={isOwner}
          onRemove={onRemoveSelect}
        />
      )}

      <AddPaymentMethodDialog
        open={ppm.addOpen}
        onClose={onAddClose}
        availableGroups={ppm.availableGroups}
        unpartneredPMs={ppm.unpartneredPMs ?? []}
        linkedPMIds={linkedPMIds}
        loading={ppm.availableLoading}
        onLink={onLink}
      />

      <DeleteEntityModal
        item={ppm.removeTarget}
        open={!!ppm.removeTarget}
        onClose={onRemoveClose}
        onConfirm={onUnlink}
        title="Quitar método de pago"
        description="El método de pago ya no estará disponible en este proyecto para nuevos gastos e ingresos."
        getMessage={(pm) => `¿Quitar "${pm.name}" del proyecto?`}
      />
    </TabsContent>
  )
}
