"use client"

// components/partners/detail/partner-detail-panel.tsx

import dynamic from "next/dynamic"
import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/context/language-context"
import { ArrowLeft, Mail, MoreVertical, Phone, StickyNote } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { PartnerPmSection } from "./partner-pm-section"
import { PartnerProjectsSection } from "./partner-projects-section"

const EditPartnerModal = dynamic(() =>
  import("../edit-partner-modal").then((m) => m.EditPartnerModal),
)

export function PartnerDetailPanel({ partnerId }: { partnerId: string }) {
  const router = useRouter()
  const { t } = useLanguage()

  const {
    partner,
    loading,
    error,
    paymentMethods,
    pmTotalCount,
    pmPage, setPmPage,
    pmPageSize,
    pmSort,
    loadingPm,
    handlePmPageSizeChange,
    handlePmSortChange,
    projects,
    projTotalCount,
    projPage, setProjPage,
    projPageSize,
    projSort,
    loadingProj,
    handleProjPageSizeChange,
    handleProjSortChange,
    editOpen, setEditOpen,
    deleteOpen, setDeleteOpen,
    mutateUpdate,
    mutateDelete,
  } = usePartnerDetail(partnerId)

  const handleConfirmDelete = useCallback(
    () => mutateDelete(),
    [mutateDelete],
  )

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-6"><Skeleton className="h-8 w-28" /></div>
        <div className="bg-card rounded-xl border border-violet-500/20 p-6 mb-4 space-y-4">
          <div className="flex items-start gap-4">
            <Skeleton className="size-12 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-3.5 w-28" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !partner) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2" onClick={() => router.push("/partners")}>
            <ArrowLeft className="size-4" />Partners
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
          <p className="text-sm text-muted-foreground">{t("partners.loadError")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Back */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2" onClick={() => router.push("/partners")}>
          <ArrowLeft className="size-4" />Partners
        </Button>
      </div>

      {/* Header card */}
      <div className="bg-card rounded-xl border border-violet-500/20 shadow-sm shadow-violet-500/5 p-6 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="size-12 rounded-full shrink-0 bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-700 dark:text-violet-400 text-lg font-bold">
              {partner.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-foreground tracking-tight truncate">{partner.name}</h1>
              <div className="flex flex-col gap-1 mt-1.5">
                {partner.email && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail className="size-3.5 text-violet-500/70 shrink-0" />{partner.email}
                  </span>
                )}
                {partner.phone && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="size-3.5 text-violet-500/70 shrink-0" />{partner.phone}
                  </span>
                )}
                {partner.notes && (
                  <span className="flex items-start gap-1.5 text-sm text-muted-foreground mt-0.5">
                    <StickyNote className="size-3.5 text-violet-500/70 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{partner.notes}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 shrink-0">
                <MoreVertical className="size-4" />
                <span className="sr-only">{t("common.options")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>{t("common.edit")}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteOpen(true)}>
                {t("common.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Sections */}
      <PartnerPmSection
        items={paymentMethods}
        totalCount={pmTotalCount}
        page={pmPage}
        onPageChange={setPmPage}
        pageSize={pmPageSize}
        onPageSizeChange={handlePmPageSizeChange}
        sort={pmSort}
        onSortChange={handlePmSortChange}
        loading={loadingPm}
      />

      <PartnerProjectsSection
        items={projects}
        totalCount={projTotalCount}
        page={projPage}
        onPageChange={setProjPage}
        pageSize={projPageSize}
        onPageSizeChange={handleProjPageSizeChange}
        sort={projSort}
        onSortChange={handleProjSortChange}
        loading={loadingProj}
      />

      {/* Modals */}
      {editOpen && (
        <EditPartnerModal
          partner={partner}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSave={mutateUpdate}
        />
      )}
      <DeleteEntityModal
        item={deleteOpen ? partner : null}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t("partners.delete.title")}
        description={t("partners.delete.descriptionDetail")}
        getMessage={(p) => t("partners.delete.confirm", { name: p.name })}
      />
    </div>
  )
}
