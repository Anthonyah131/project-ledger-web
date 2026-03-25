"use client"

// views/members/members-view.tsx
// Full-page view for managing project member access.

import { useCallback } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProjectMembers } from "@/hooks/projects/use-project-members"
import { MembersList } from "@/components/members/members-list"
import { MembersSkeleton, MembersEmptyState } from "@/components/members/member-states"
import { DeleteEntityModal } from "@/components/shared/delete-entity-modal"
import { useLanguage } from "@/context/language-context"

const AddMemberModal = dynamic(() =>
  import("@/components/members/add-member-modal").then((mod) => mod.AddMemberModal)
)

interface Props {
  projectId: string
}

export function MembersView({ projectId }: Props) {
  const router = useRouter()
  const { t } = useLanguage()
  const {
    members,
    loading,
    addOpen, setAddOpen,
    deleteTarget, setDeleteTarget,
    mutateAdd,
    mutateChangeRole,
    mutateRemove,
  } = useProjectMembers(projectId)

  const handleBack = useCallback(() => {
    router.push(`/projects/${projectId}`)
  }, [router, projectId])

  const handleOpenAdd = useCallback(() => {
    setAddOpen(true)
  }, [setAddOpen])

  const handleCloseAdd = useCallback(() => {
    setAddOpen(false)
  }, [setAddOpen])

  const handleSelectDelete = useCallback((member: (typeof members)[number]) => {
    setDeleteTarget(member)
  }, [setDeleteTarget])

  const handleCloseDelete = useCallback(() => {
    setDeleteTarget(null)
  }, [setDeleteTarget])

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="flex items-center justify-center size-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label={t("members.backToProject")}
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">
              {t("members.manageTitle")}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {members.length} {members.length === 1 ? t("members.singular") : t("members.plural")}
            </p>
          </div>
        </div>
        <Button onClick={handleOpenAdd} size="sm">
          <Plus className="size-3.5" />
          {t("members.add")}
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <MembersSkeleton />
      ) : members.length === 0 ? (
        <MembersEmptyState />
      ) : (
        <MembersList
          members={members}
          onChangeRole={mutateChangeRole}
          onRemove={handleSelectDelete}
        />
      )}

      {/* Modals */}
      {addOpen && (
        <AddMemberModal
          open={addOpen}
          onClose={handleCloseAdd}
          onAdd={mutateAdd}
        />
      )}
      <DeleteEntityModal
        item={deleteTarget}
        open={!!deleteTarget}
        onClose={handleCloseDelete}
        onConfirm={mutateRemove}
        title={t("members.remove.title")}
        description={t("members.remove.description")}
        getMessage={(m) => t("members.remove.confirm", { name: m.userFullName })}
      />
    </div>
  )
}
