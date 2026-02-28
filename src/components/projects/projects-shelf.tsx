"use client"

import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useProjects } from "@/hooks/projects/use-projects"
import { ProjectsToolbar } from "./projects-toolbar"
import { ShelfView } from "./shelf-view"
import { ListView } from "./list-view"
import { Pagination } from "@/components/shared/pagination"
import {
  CreateProjectModal,
  EditProjectModal,
} from "./project-modals"
import { DeleteEntityModal } from "@/components/shared/delete-entity-modal"
import {
  EmptyState,
  ShelfSkeleton,
  ListSkeleton,
} from "./project-states"

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
    handleCreate,
    handleEdit,
    handleDelete,
    handlePageSizeChange,
    handleCurrencyChange,
    handleSortChange,
  } = useProjects()

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
        <Button onClick={() => setCreateOpen(true)} size="sm">
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
          <EmptyState hasSearch={hasSearch} onCreate={() => setCreateOpen(true)} />
        ) : viewMode === "shelf" ? (
          <ShelfView
            projects={projects}
            onEdit={(p) => setEditProject(p)}
            onDelete={(p) => setDeleteTarget(p)}
            onShare={(p) => router.push(`/projects/${p.id}/members`)}
            globalIndex={globalIndex}
          />
        ) : (
          <ListView
            projects={projects}
            onEdit={(p) => setEditProject(p)}
            onDelete={(p) => setDeleteTarget(p)}
            onShare={(p) => router.push(`/projects/${p.id}/members`)}
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
      <CreateProjectModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />
      <EditProjectModal
        project={editProject}
        open={!!editProject}
        onClose={() => setEditProject(null)}
        onSave={handleEdit}
      />
      <DeleteEntityModal
        item={deleteTarget}
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar proyecto"
        description="Esta accion puede desactivarlo, no eliminarlo definitivamente."
        getMessage={(p) => `¿Eliminar proyecto "${p.name}"?`}
      />
    </div>
  )
}
