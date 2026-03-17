"use client"

import { Plus } from "lucide-react"
import { TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DeleteEntityModal } from "@/components/shared/delete-entity-modal"
import {
  AssignPartnerModal,
  ProjectPartnersList,
} from "@/components/project-detail/partners/project-partners"
import {
  ProjectPartnersEmptyState,
  ProjectPartnersSkeleton,
} from "@/components/project-detail/partners/project-partner-states"
import type { ProjectPartnerResponse } from "@/types/project-partner"
import type { PartnerResponse } from "@/types/partner"

interface PartnersTabState {
  loading: boolean
  assignedPartners: ProjectPartnerResponse[]
  assignOpen: boolean
  availablePartners: PartnerResponse[]
  availableLoading: boolean
  removeTarget: ProjectPartnerResponse | null
}

interface ProjectDetailPartnersTabProps {
  ppp: PartnersTabState
  isOwner: boolean
  linkedPartnerIds?: Set<string>
  onAssignOpen: () => void
  onAssignClose: () => void
  onRemoveSelect: (pp: ProjectPartnerResponse) => void
  onRemoveClose: () => void
  onAssign: (partnerId: string) => Promise<void>
  onRemove: (pp: ProjectPartnerResponse) => Promise<boolean> | void
}

export function ProjectDetailPartnersTab({
  ppp,
  isOwner,
  linkedPartnerIds,
  onAssignOpen,
  onAssignClose,
  onRemoveSelect,
  onRemoveClose,
  onAssign,
  onRemove,
}: ProjectDetailPartnersTabProps) {
  return (
    <TabsContent value="partners" className="flex flex-col gap-4">
      {isOwner && (
        <div className="flex justify-end px-5 py-3 border-b border-border bg-card">
          <Button onClick={onAssignOpen} size="sm">
            <Plus className="size-3.5" />
            Asignar partner
          </Button>
        </div>
      )}

      {ppp.loading ? (
        <ProjectPartnersSkeleton />
      ) : ppp.assignedPartners.length === 0 ? (
        <ProjectPartnersEmptyState isOwner={isOwner} onAssign={onAssignOpen} />
      ) : (
        <ProjectPartnersList
          partners={ppp.assignedPartners}
          isOwner={isOwner}
          linkedPartnerIds={linkedPartnerIds}
          onRemove={onRemoveSelect}
        />
      )}

      <AssignPartnerModal
        open={ppp.assignOpen}
        onClose={onAssignClose}
        availablePartners={ppp.availablePartners}
        assignedPartners={ppp.assignedPartners}
        loading={ppp.availableLoading}
        onAssign={onAssign}
      />

      <DeleteEntityModal
        item={ppp.removeTarget}
        open={!!ppp.removeTarget}
        onClose={onRemoveClose}
        onConfirm={onRemove}
        title="Quitar partner del proyecto"
        description="Sus cuentas ya no estarán disponibles para nuevos gastos e ingresos en este proyecto."
        getMessage={(pp) => `¿Quitar el partner "${pp.partnerName}" del proyecto?`}
      />
    </TabsContent>
  )
}
