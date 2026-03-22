"use client";

import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DeleteEntityModal } from "@/components/shared/delete-entity-modal";
import {
  AssignPartnerModal,
  ProjectPartnersList,
} from "@/components/project-detail/partners/project-partners";
import {
  ProjectPartnersEmptyState,
  ProjectPartnersSkeleton,
} from "@/components/project-detail/partners/project-partner-states";
import type { ProjectPartnerResponse } from "@/types/project-partner";
import type { PartnerResponse } from "@/types/partner";

interface PartnersState {
  loading: boolean;
  assignedPartners: ProjectPartnerResponse[];
  assignOpen: boolean;
  availablePartners: PartnerResponse[];
  availableLoading: boolean;
  removeTarget: ProjectPartnerResponse | null;
}

export function PartnersSection({
  ppp,
  isOwner,
  partnersEnabled,
  linkedPartnerIds,
  onTogglePartners,
  onAssignOpen,
  onAssignClose,
  onRemoveSelect,
  onRemoveClose,
  onAssign,
  onRemove,
}: {
  ppp: PartnersState;
  isOwner: boolean;
  partnersEnabled: boolean;
  linkedPartnerIds?: Set<string>;
  onTogglePartners: (enabled: boolean) => Promise<boolean | void>;
  onAssignOpen: () => void;
  onAssignClose: () => void;
  onRemoveSelect: (pp: ProjectPartnerResponse) => void;
  onRemoveClose: () => void;
  onAssign: (partnerId: string) => Promise<void>;
  onRemove: (pp: ProjectPartnerResponse) => Promise<boolean> | void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold">Partners del proyecto</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Asigna partners y controla la distribución de gastos e ingresos.
        </p>
      </div>

      <Separator />

      <div className="flex flex-wrap items-center justify-between gap-3">
        {isOwner ? (
          <div className="flex items-center gap-2">
            <Switch
              id="partners-enabled-settings"
              checked={partnersEnabled}
              onCheckedChange={onTogglePartners}
            />
            <Label
              htmlFor="partners-enabled-settings"
              className="cursor-pointer select-none text-sm"
            >
              Splits por partners
            </Label>
          </div>
        ) : (
          <div />
        )}

        {isOwner && (
          <div className="flex items-center gap-3">
            <Button onClick={onAssignOpen} size="sm">
              <Plus className="size-3.5" />
              Asignar partner
            </Button>
          </div>
        )}
      </div>

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
        partnersEnabled={partnersEnabled}
        onAssign={onAssign}
      />

      <DeleteEntityModal
        item={ppp.removeTarget}
        open={!!ppp.removeTarget}
        onClose={onRemoveClose}
        onConfirm={onRemove}
        title="Quitar partner del proyecto"
        description="Sus cuentas ya no estarán disponibles para nuevos gastos e ingresos en este proyecto."
        getMessage={(pp) =>
          `¿Quitar el partner "${pp.partnerName}" del proyecto?`
        }
      />
    </div>
  );
}
