"use client"

import { useState } from "react"
import { Link2, Unlink2, CreditCard, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PAYMENT_METHOD_TYPE_LABEL } from "@/lib/constants"
import type { ProjectPaymentMethodResponse } from "@/types/project-payment-method"
import type { PaymentMethodResponse } from "@/types/payment-method"

// ─── Link Payment Method Modal ──────────────────────────────────────────────

interface LinkPaymentMethodModalProps {
  open: boolean
  onClose: () => void
  availableMethods: PaymentMethodResponse[]
  linkedMethods: ProjectPaymentMethodResponse[]
  loading: boolean
  onLink: (paymentMethodId: string) => Promise<void>
}

export function LinkPaymentMethodModal({
  open,
  onClose,
  availableMethods,
  linkedMethods,
  loading,
  onLink,
}: LinkPaymentMethodModalProps) {
  const [linkingId, setLinkingId] = useState<string | null>(null)

  const linkedIds = new Set(linkedMethods.map((m) => m.paymentMethodId))
  const unlinked = availableMethods.filter((pm) => !linkedIds.has(pm.id))

  async function handleLink(pmId: string) {
    setLinkingId(pmId)
    try {
      await onLink(pmId)
    } finally {
      setLinkingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vincular método de pago</DialogTitle>
          <DialogDescription>
            Selecciona un método de pago para vincularlo al proyecto.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : unlinked.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <CreditCard className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Todos tus métodos de pago ya están vinculados.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {unlinked.map((pm) => (
              <div
                key={pm.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3 hover:bg-accent/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {pm.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px]">
                      {PAYMENT_METHOD_TYPE_LABEL[pm.type]}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {pm.currency}
                    </Badge>
                    {pm.bankName && (
                      <span className="text-xs text-muted-foreground truncate">
                        {pm.bankName}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleLink(pm.id)}
                  disabled={linkingId === pm.id}
                  className="ml-3 shrink-0 bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 border-0 shadow-sm shadow-violet-500/20"
                >
                  {linkingId === pm.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Link2 className="size-3.5" />
                  )}
                  Vincular
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Project Payment Methods List (for the tab) ─────────────────────────────

interface ProjectPaymentMethodsListProps {
  methods: ProjectPaymentMethodResponse[]
  isOwner: boolean
  onUnlink: (pm: ProjectPaymentMethodResponse) => void
}

export function ProjectPaymentMethodsList({
  methods,
  isOwner,
  onUnlink,
}: ProjectPaymentMethodsListProps) {
  return (
    <div role="list" aria-label="Métodos de pago del proyecto">
      {/* Header */}
      <div className="flex items-center px-5 py-2.5 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest border-b border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-sky-500/5 to-transparent">
        <span className="flex-1">Nombre</span>
        <span className="w-28 text-right hidden sm:block">Tipo</span>
        <span className="w-24 text-right hidden md:block">Moneda</span>
        <span className="w-40 text-right hidden lg:block">Propietario</span>
        {isOwner && <span className="w-8" />}
      </div>

      {methods.map((pm) => (
        <div
          key={pm.id}
          role="listitem"
          className="group flex items-center px-5 py-3.5 border-b border-border/50 last:border-b-0 hover:bg-cyan-500/5 transition-colors duration-150"
        >
          {/* Name + bank */}
          <div className="flex-1 min-w-0 mr-4">
            <p className="text-sm font-semibold text-foreground truncate leading-snug">
              {pm.paymentMethodName}
            </p>
            {pm.bankName && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {pm.bankName}
              </p>
            )}
          </div>

          {/* Type */}
          <span className="w-28 text-right text-xs text-muted-foreground hidden sm:block">
            {PAYMENT_METHOD_TYPE_LABEL[pm.type]}
          </span>

          {/* Currency */}
          <span className="w-24 text-right hidden md:block">
            <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
              {pm.currency}
            </Badge>
          </span>

          {/* Owner */}
          <span className="w-40 text-right text-xs text-muted-foreground hidden lg:block truncate">
            {pm.ownerUserName}
          </span>

          {/* Unlink action */}
          {isOwner && (
            <div className="w-8 flex justify-end">
              <button
                onClick={() => onUnlink(pm)}
                className="flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                aria-label={`Desvincular ${pm.paymentMethodName}`}
                title="Desvincular"
              >
                <Unlink2 className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
