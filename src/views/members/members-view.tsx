"use client"

// views/members/members-view.tsx
// Full-page view for managing project member access.

import { useRouter } from "next/navigation"
import { ArrowLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProjectMembers } from "@/hooks/projects/use-project-members"
import { MembersList } from "@/components/members/members-list"
import { MembersSkeleton, MembersEmptyState } from "@/components/members/member-states"
import { AddMemberModal } from "@/components/members/add-member-modal"
import { DeleteEntityModal } from "@/components/shared/delete-entity-modal"

interface Props {
  projectId: string
}

export function MembersView({ projectId }: Props) {
  const router = useRouter()
  const {
    members,
    loading,
    addOpen, setAddOpen,
    deleteTarget, setDeleteTarget,
    handleAdd,
    handleChangeRole,
    handleRemove,
  } = useProjectMembers(projectId)

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/projects/${projectId}`)}
            className="flex items-center justify-center size-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Volver al proyecto"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">
              Gestionar accesos
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {members.length} {members.length === 1 ? "miembro" : "miembros"}
            </p>
          </div>
        </div>
        <Button onClick={() => setAddOpen(true)} size="sm">
          <Plus className="size-3.5" />
          Agregar
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
          onChangeRole={handleChangeRole}
          onRemove={(m) => setDeleteTarget(m)}
        />
      )}

      {/* Modals */}
      <AddMemberModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAdd}
      />
      <DeleteEntityModal
        item={deleteTarget}
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleRemove}
        title="Remover miembro"
        description="El usuario perderá acceso a este proyecto."
        getMessage={(m) => `¿Remover a "${m.userFullName}" del proyecto?`}
      />
    </div>
  )
}
