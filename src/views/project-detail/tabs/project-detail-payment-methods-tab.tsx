"use client"

import { Plus } from "lucide-react"
import { TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DeleteEntityModal } from "@/components/shared/delete-entity-modal"
import {
  LinkPaymentMethodModal,
  ProjectPaymentMethodsList,
} from "@/components/project-detail/payment-methods/project-payment-methods"
import {
  ProjectPaymentMethodsEmptyState,
  ProjectPaymentMethodsSkeleton,
} from "@/components/project-detail/payment-methods/project-payment-method-states"
import type { ProjectPaymentMethodResponse } from "@/types/project-payment-method"
import type { PaymentMethodResponse } from "@/types/payment-method"

interface PaymentMethodsTabState {
  loading: boolean
  linkedMethods: ProjectPaymentMethodResponse[]
  linkOpen: boolean
  availableMethods: PaymentMethodResponse[]
  availableLoading: boolean
  unlinkTarget: ProjectPaymentMethodResponse | null
}

interface ProjectDetailPaymentMethodsTabProps {
  ppm: PaymentMethodsTabState
  isOwner: boolean
  onLinkOpen: () => void
  onLinkClose: () => void
  onUnlinkSelect: (paymentMethod: ProjectPaymentMethodResponse) => void
  onUnlinkClose: () => void
  onLink: (paymentMethodId: string) => Promise<void>
  onUnlink: (paymentMethod: ProjectPaymentMethodResponse) => Promise<void> | void
}

export function ProjectDetailPaymentMethodsTab({
  ppm,
  isOwner,
  onLinkOpen,
  onLinkClose,
  onUnlinkSelect,
  onUnlinkClose,
  onLink,
  onUnlink,
}: ProjectDetailPaymentMethodsTabProps) {
  return (
    <TabsContent value="payment-methods" className="flex flex-col gap-4">
      {isOwner && (
        <div className="flex justify-end px-5 py-3 border-b border-border bg-card">
          <Button onClick={onLinkOpen} size="sm">
            <Plus className="size-3.5" />
            Vincular método
          </Button>
        </div>
      )}

      {ppm.loading ? (
        <ProjectPaymentMethodsSkeleton />
      ) : ppm.linkedMethods.length === 0 ? (
        <ProjectPaymentMethodsEmptyState
          isOwner={isOwner}
          onLink={onLinkOpen}
        />
      ) : (
        <ProjectPaymentMethodsList
          methods={ppm.linkedMethods}
          isOwner={isOwner}
          onUnlink={onUnlinkSelect}
        />
      )}

      <LinkPaymentMethodModal
        open={ppm.linkOpen}
        onClose={onLinkClose}
        availableMethods={ppm.availableMethods}
        linkedMethods={ppm.linkedMethods}
        loading={ppm.availableLoading}
        onLink={onLink}
      />

      <DeleteEntityModal
        item={ppm.unlinkTarget}
        open={!!ppm.unlinkTarget}
        onClose={onUnlinkClose}
        onConfirm={onUnlink}
        title="Desvincular método de pago"
        description="El método ya no podrá usarse para crear gastos en este proyecto."
        getMessage={(paymentMethod) => `¿Desvincular "${paymentMethod.paymentMethodName}" del proyecto?`}
      />
    </TabsContent>
  )
}
