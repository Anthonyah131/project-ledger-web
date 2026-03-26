"use client"

import { useMemo, useState } from "react"
import { CreditCard, Plus, X } from "lucide-react"
import { Separator } from "@/components/ui/separator"
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
import { getPaymentMethodTypeLabel } from "@/lib/constants"
import { useLanguage } from "@/context/language-context"
import type {
  ProjectPaymentMethodItem,
  LinkablePaymentMethodItem,
} from "@/types/project-partner"

// ── Internal sub-components ───────────────────────────────────────────────────

function PMSkeleton() {
  return (
    <div className="divide-y divide-border rounded-md border border-border">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-10" />
          <Skeleton className="size-7 rounded" />
        </div>
      ))}
    </div>
  )
}

function PMEmptyState({
  isOwner,
  onAdd,
}: {
  isOwner: boolean
  onAdd: () => void
}) {
  const { t } = useLanguage()
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border py-16 px-4 text-center">
      <CreditCard className="size-10 text-muted-foreground/40" />
      <p className="text-sm font-medium">{t("projects.settingsTab.noLinkedPaymentMethods")}</p>
      {isOwner ? (
        <>
          <p className="max-w-xs text-xs text-muted-foreground">
            {t("projects.settingsTab.noLinkedPaymentMethodsDescription")}
          </p>
          <Button size="sm" variant="outline" onClick={onAdd}>
            <Plus className="size-3.5" />
            {t("projects.settingsTab.addPaymentMethod")}
          </Button>
        </>
      ) : (
        <p className="max-w-xs text-xs text-muted-foreground">
          {t("projects.settingsTab.noLinkedPaymentMethodsViewer")}
        </p>
      )}
    </div>
  )
}

function PMList({
  linkedPMs,
  isOwner,
  onRemove,
}: {
  linkedPMs: ProjectPaymentMethodItem[]
  isOwner: boolean
  onRemove: (pm: ProjectPaymentMethodItem) => void
}) {
  const { t } = useLanguage()
  return (
    <div className="divide-y divide-border rounded-md border border-border">
      {linkedPMs.map((pm) => (
        <div
          key={pm.id}
          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/20"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{pm.paymentMethodName}</p>
            {(pm.bankName || pm.partnerName) && (
              <p className="truncate text-xs text-muted-foreground">
                {[pm.bankName, pm.partnerName].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Badge variant="outline" className="text-[10px]">
              {getPaymentMethodTypeLabel(pm.type, t)}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {pm.currency}
            </Badge>
          </div>
          {isOwner && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
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

function AddPMDialog({
  open,
  onClose,
  linkableItems,
  loading,
  onLink,
}: {
  open: boolean
  onClose: () => void
  linkableItems: LinkablePaymentMethodItem[]
  loading: boolean
  onLink: (pmId: string, pmName: string) => Promise<void>
}) {
  const { t } = useLanguage()
  const [pendingId, setPendingId] = useState<string | null>(null)

  async function handleLinkClick(pmId: string, pmName: string) {
    setPendingId(pmId)
    try {
      await onLink(pmId, pmName)
    } finally {
      setPendingId(null)
    }
  }

  const groupEntries = useMemo(() => {
    const groups = linkableItems.reduce<
      Record<string, { partnerName: string; items: LinkablePaymentMethodItem[] }>
    >((acc, pm) => {
      if (!acc[pm.partnerId]) {
        acc[pm.partnerId] = { partnerName: pm.partnerName, items: [] }
      }
      acc[pm.partnerId].items.push(pm)
      return acc
    }, {})
    return Object.entries(groups)
  }, [linkableItems])

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[80vh] max-w-md flex-col">
        <DialogHeader>
          <DialogTitle>{t("projects.settingsTab.addPMDialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("projects.settingsTab.addPMDialogDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="-mx-6 flex-1 overflow-y-auto px-6">
          {loading ? (
            <div className="flex flex-col gap-3 py-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-7 w-20" />
                </div>
              ))}
            </div>
          ) : groupEntries.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <CreditCard className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {t("projects.settingsTab.noAvailableToLink")}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-2">
              {groupEntries.map(([partnerId, group]) => (
                <div key={partnerId}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.partnerName}
                  </p>
                  <div className="flex flex-col gap-1">
                    {group.items.map((pm) => (
                      <div key={pm.id} className="flex items-center gap-2 py-1.5">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{pm.name}</p>
                          {pm.bankName && (
                            <p className="truncate text-xs text-muted-foreground">
                              {pm.bankName}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px]">
                            {getPaymentMethodTypeLabel(pm.type, t)}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            {pm.currency}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 shrink-0 text-xs"
                          disabled={pendingId === pm.id}
                          onClick={() => handleLinkClick(pm.id, pm.name)}
                        >
                          {pendingId === pm.id ? "..." : t("projects.settingsTab.add")}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Exported section component ─────────────────────────────────────────────────

interface PaymentMethodsState {
  loading: boolean
  linkedPMs: ProjectPaymentMethodItem[]
  linkableItems: LinkablePaymentMethodItem[]
  linkableLoading: boolean
  addOpen: boolean
  removeTarget: ProjectPaymentMethodItem | null
}

export function PaymentMethodsSection({
  ppm,
  isOwner,
  onAddOpen,
  onAddClose,
  onLink,
  onRemoveSelect,
  onRemoveClose,
  onUnlink,
}: {
  ppm: PaymentMethodsState
  isOwner: boolean
  onAddOpen: () => void
  onAddClose: () => void
  onLink: (pmId: string, pmName: string) => Promise<void>
  onRemoveSelect: (pm: ProjectPaymentMethodItem) => void
  onRemoveClose: () => void
  onUnlink: (pm: ProjectPaymentMethodItem) => Promise<boolean> | void
}) {
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">{t("projects.settingsTab.paymentMethodsTitle")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("projects.settingsTab.paymentMethodsSubtitle")}
          </p>
        </div>
        {isOwner && (
          <Button onClick={onAddOpen} size="sm">
            <Plus className="size-3.5" />
            {t("projects.settingsTab.add")}
          </Button>
        )}
      </div>

      <Separator />

      {ppm.loading ? (
        <PMSkeleton />
      ) : ppm.linkedPMs.length === 0 ? (
        <PMEmptyState isOwner={isOwner} onAdd={onAddOpen} />
      ) : (
        <PMList
          linkedPMs={ppm.linkedPMs}
          isOwner={isOwner}
          onRemove={onRemoveSelect}
        />
      )}

      <AddPMDialog
        open={ppm.addOpen}
        onClose={onAddClose}
        linkableItems={ppm.linkableItems}
        loading={ppm.linkableLoading}
        onLink={onLink}
      />

      <DeleteEntityModal
        item={ppm.removeTarget}
        open={!!ppm.removeTarget}
        onClose={onRemoveClose}
        onConfirm={onUnlink}
        title={t("projects.settingsTab.removePaymentMethodTitle")}
        description={t("projects.settingsTab.removePaymentMethodDescription")}
        getMessage={(pm) => t("projects.settingsTab.removePaymentMethodNamed", { name: pm.paymentMethodName })}
      />
    </div>
  )
}
