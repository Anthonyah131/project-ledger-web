"use client"

import dynamic from "next/dynamic"
import { TabsContent } from "@/components/ui/tabs"
import { DeleteEntityModal } from "@/components/shared/delete-entity-modal"
import { Pagination } from "@/components/shared/pagination"
import { ObligationsToolbar } from "@/components/project-detail/obligations/obligations-toolbar"
import { ObligationsList } from "@/components/project-detail/obligations/obligations-list"
import {
  ObligationsEmptyState,
  ObligationsSkeleton,
} from "@/components/project-detail/obligations/obligation-states"
import type {
  CreateObligationRequest,
  ObligationResponse,
  UpdateObligationRequest,
} from "@/types/obligation"

const CreateObligationModal = dynamic(() =>
  import("@/components/project-detail/obligations/create-obligation-modal").then((mod) => mod.CreateObligationModal)
)
const EditObligationModal = dynamic(() =>
  import("@/components/project-detail/obligations/edit-obligation-modal").then((mod) => mod.EditObligationModal)
)

interface ObligationsTabState {
  sort: string
  handleSortChange: (value: string) => void
  statusFilter: string
  handleStatusFilterChange: (value: "all" | "open" | "partially_paid" | "paid" | "overdue") => void
  pageSize: number
  handlePageSizeChange: (value: number) => void
  loading: boolean
  obligations: ObligationResponse[]
  hasFilter: boolean
  page: number
  total: number
  setPage: (value: number) => void
  createOpen: boolean
  editTarget: ObligationResponse | null
  deleteTarget: ObligationResponse | null
}

interface ProjectDetailObligationsTabProps {
  obl: ObligationsTabState
  onCreateOpen: () => void
  onCreateClose: () => void
  onEditSelect: (obligation: ObligationResponse) => void
  onEditClose: () => void
  onDeleteSelect: (obligation: ObligationResponse) => void
  onDeleteClose: () => void
  onCreate: (data: CreateObligationRequest) => void
  onSave: (id: string, data: UpdateObligationRequest) => void
  onDelete: (obligation: ObligationResponse) => void
}

export function ProjectDetailObligationsTab({
  obl,
  onCreateOpen,
  onCreateClose,
  onEditSelect,
  onEditClose,
  onDeleteSelect,
  onDeleteClose,
  onCreate,
  onSave,
  onDelete,
}: ProjectDetailObligationsTabProps) {
  return (
    <TabsContent value="obligations" className="flex flex-col gap-4">
      <ObligationsToolbar
        sort={obl.sort}
        onSortChange={obl.handleSortChange}
        statusFilter={obl.statusFilter}
        onStatusFilterChange={obl.handleStatusFilterChange}
        pageSize={obl.pageSize}
        onPageSizeChange={obl.handlePageSizeChange}
        onCreate={onCreateOpen}
      />

      {obl.loading ? (
        <ObligationsSkeleton />
      ) : obl.obligations.length === 0 ? (
        <ObligationsEmptyState
          hasFilter={obl.hasFilter}
          onCreate={onCreateOpen}
        />
      ) : (
        <>
          <ObligationsList
            obligations={obl.obligations}
            onEdit={onEditSelect}
            onDelete={onDeleteSelect}
          />
          {!obl.hasFilter && (
            <Pagination
              page={obl.page}
              pageSize={obl.pageSize}
              total={obl.total}
              onPageChange={obl.setPage}
            />
          )}
        </>
      )}

      {obl.createOpen && (
        <CreateObligationModal
          open={obl.createOpen}
          onClose={onCreateClose}
          onCreate={onCreate}
        />
      )}

      {!!obl.editTarget && (
        <EditObligationModal
          obligation={obl.editTarget}
          open={!!obl.editTarget}
          onClose={onEditClose}
          onSave={onSave}
        />
      )}

      <DeleteEntityModal
        item={obl.deleteTarget}
        open={!!obl.deleteTarget}
        onClose={onDeleteClose}
        onConfirm={onDelete}
        title="Eliminar obligacion"
        description="Esta accion no se puede deshacer."
        getMessage={(obligation) => `¿Eliminar obligación "${obligation.title}"?`}
      />
    </TabsContent>
  )
}
