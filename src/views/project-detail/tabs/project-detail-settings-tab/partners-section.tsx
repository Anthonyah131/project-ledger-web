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
import { useLanguage } from "@/context/language-context";

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
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold">{t("projects.settingsTab.partnersTitle")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("projects.settingsTab.partnersSubtitle")}
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
              {t("projects.settingsTab.partnersSplits")}
            </Label>
          </div>
        ) : (
          <div />
        )}

        {isOwner && (
          <div className="flex items-center gap-3">
            <Button onClick={onAssignOpen} size="sm">
              <Plus className="size-3.5" />
              {t("projects.settingsTab.assignPartner")}
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
        onAssign={onAssign}
      />

      <DeleteEntityModal
        item={ppp.removeTarget}
        open={!!ppp.removeTarget}
        onClose={onRemoveClose}
        onConfirm={onRemove}
        title={t("projects.settingsTab.removePartnerTitle")}
        description={t("projects.settingsTab.removePartnerDescription")}
        getMessage={(pp) => t("projects.settingsTab.removePartnerNamed", { name: pp.partnerName })}
      />
    </div>
  );
}
