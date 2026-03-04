"use client"

import { useCallback } from "react"
import { Plus } from "lucide-react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useProjects } from "@/hooks/projects/use-projects"
import { ProjectsToolbar } from "./projects-toolbar"
import { ShelfView } from "./shelf-view"
import { ListView } from "./list-view"
import { Pagination } from "@/components/shared/pagination"
import { DeleteEntityModal } from "@/components/shared/delete-entity-modal"
import {
  EmptyState,
  ShelfSkeleton,
  ListSkeleton,
} from "./project-states"

const CreateProjectModal = dynamic(() =>
  import("./create-project-modal").then((mod) => mod.CreateProjectModal)
)
const EditProjectModal = dynamic(() =>
  import("./edit-project-modal").then((mod) => mod.EditProjectModal)
)

export function ProjectsShelf() {
  const router = useRouter()
  const {
    projects,
    total,
    globalIndex,
    loading,
    hasSearch,
    viewMode, setViewMode,
    page, setPage,
    pageSize,
    query, setQuery,
    currency,
    sort,
    createOpen, setCreateOpen,
    editProject, setEditProject,
    deleteTarget, setDeleteTarget,
    mutateCreate,
    mutateUpdate,
    mutateDelete,
    handlePageSizeChange,
    handleCurrencyChange,
    handleSortChange,
  } = useProjects()

  const handleOpenCreate = useCallback(() => {
    setCreateOpen(true)
  }, [setCreateOpen])

  const handleCloseCreate = useCallback(() => {
    setCreateOpen(false)
  }, [setCreateOpen])

  const handleSelectEdit = useCallback((project: (typeof projects)[number]) => {
    setEditProject(project)
  }, [setEditProject])

  const handleCloseEdit = useCallback(() => {
    setEditProject(null)
  }, [setEditProject])

  const handleSelectDelete = useCallback((project: (typeof projects)[number]) => {
    setDeleteTarget(project)
  }, [setDeleteTarget])

  const handleCloseDelete = useCallback(() => {
    setDeleteTarget(null)
  }, [setDeleteTarget])

  const handleShare = useCallback((project: (typeof projects)[number]) => {
    router.push(`/projects/${project.id}/members`)
  }, [router])

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            Proyectos
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} {total === 1 ? "proyecto" : "proyectos"}
          </p>
        </div>
        <Button onClick={handleOpenCreate} size="sm">
          <Plus className="size-3.5" />
          Nuevo
        </Button>
      </div>

      {/* Toolbar */}
      <ProjectsToolbar
        query={query}
        onQueryChange={setQuery}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        sort={sort}
        onSortChange={handleSortChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Content */}
      <div className="mt-4 bg-card rounded-lg border border-border overflow-hidden">
        {loading ? (
          viewMode === "shelf" ? <ShelfSkeleton /> : <ListSkeleton />
        ) : projects.length === 0 ? (
          <EmptyState hasSearch={hasSearch} onCreate={handleOpenCreate} />
        ) : viewMode === "shelf" ? (
          <ShelfView
            projects={projects}
            onEdit={handleSelectEdit}
            onDelete={handleSelectDelete}
            onShare={handleShare}
            globalIndex={globalIndex}
          />
        ) : (
          <ListView
            projects={projects}
            onEdit={handleSelectEdit}
            onDelete={handleSelectDelete}
            onShare={handleShare}
            globalIndex={globalIndex}
          />
        )}

        {!loading && total > 0 && (
          <div className="border-t border-border">
            <Pagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {createOpen && (
        <CreateProjectModal
          open={createOpen}
          onClose={handleCloseCreate}
          onCreate={mutateCreate}
        />
      )}
      {!!editProject && (
        <EditProjectModal
          project={editProject}
          open={!!editProject}
          onClose={handleCloseEdit}
          onSave={mutateUpdate}
        />
      )}
      <DeleteEntityModal
        item={deleteTarget}
        open={!!deleteTarget}
        onClose={handleCloseDelete}
        onConfirm={mutateDelete}
        title="Eliminar proyecto"
        description="Esta accion puede desactivarlo, no eliminarlo definitivamente."
        getMessage={(p) => `¿Eliminar proyecto "${p.name}"?`}
      />
    </div>
  )
}
