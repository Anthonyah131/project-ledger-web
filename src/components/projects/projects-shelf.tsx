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
import { useLanguage } from "@/context/language-context"
import type { ProjectResponse } from "@/types/project"

const CreateProjectModal = dynamic(() =>
  import("./create-project-modal").then((mod) => mod.CreateProjectModal)
)
const EditProjectModal = dynamic(() =>
  import("./edit-project-modal").then((mod) => mod.EditProjectModal)
)

interface ProjectsShelfProps {
  workspaceId?: string
  projectIds?: string[]
  onDisconnect?: (projectId: string) => Promise<void>
  onProjectMutated?: () => void
}

export function ProjectsShelf({ workspaceId, projectIds, onDisconnect, onProjectMutated }: ProjectsShelfProps = {}) {
  const router = useRouter()
  const { t } = useLanguage()
  const {
    projects,
    pinnedProjects,
    pinnedIds,
    pinnedCount,
    canPin,
    pinLoading,
    togglePin,
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
  } = useProjects({ workspaceId, projectIds, onProjectMutated })

  const handleOpenCreate = useCallback(() => setCreateOpen(true), [setCreateOpen])
  const handleCloseCreate = useCallback(() => setCreateOpen(false), [setCreateOpen])
  const handleSelectEdit = useCallback((project: ProjectResponse) => setEditProject(project), [setEditProject])
  const handleCloseEdit = useCallback(() => setEditProject(null), [setEditProject])
  const handleSelectDelete = useCallback((project: ProjectResponse) => setDeleteTarget(project), [setDeleteTarget])
  const handleCloseDelete = useCallback(() => setDeleteTarget(null), [setDeleteTarget])
  const handleShare = useCallback((project: ProjectResponse) => {
    router.push(`/projects/${project.id}/members`)
  }, [router])
  const handleDisconnect = useCallback(async (project: ProjectResponse) => {
    if (onDisconnect) await onDisconnect(project.id)
  }, [onDisconnect])

  const isEmpty = !loading && projects.length === 0 && pinnedProjects.length === 0

  // Count label includes pinned on page 1
  const displayTotal = page === 1 ? total + pinnedProjects.length : total

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            {t("projects.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {displayTotal} {displayTotal === 1 ? t("projects.countSingular") : t("projects.countPlural")}
            {pinnedCount > 0 && (
              <span className="ml-2 text-[11px] tabular-nums">
                · {pinnedCount}/6 {t("projects.pinnedSection").toLowerCase()}
              </span>
            )}
          </p>
        </div>
        <Button onClick={handleOpenCreate} size="sm">
          <Plus className="size-3.5" />
          {t("projects.newButton")}
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
        ) : isEmpty ? (
          <EmptyState hasSearch={hasSearch} onCreate={handleOpenCreate} />
        ) : viewMode === "shelf" ? (
          <ShelfView
            projects={projects}
            pinnedProjects={pinnedProjects}
            onEdit={handleSelectEdit}
            onDelete={handleSelectDelete}
            onShare={handleShare}
            onDisconnect={onDisconnect ? handleDisconnect : undefined}
            onTogglePin={togglePin}
            globalIndex={globalIndex}
            pinnedIds={pinnedIds}
            canPin={canPin}
            pinLoading={pinLoading}
          />
        ) : (
          <ListView
            projects={projects}
            pinnedProjects={pinnedProjects}
            onEdit={handleSelectEdit}
            onDelete={handleSelectDelete}
            onShare={handleShare}
            onDisconnect={onDisconnect ? handleDisconnect : undefined}
            onTogglePin={togglePin}
            globalIndex={globalIndex}
            pinnedIds={pinnedIds}
            canPin={canPin}
            pinLoading={pinLoading}
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
        title={t("projects.delete.title")}
        description={t("projects.delete.description")}
        getMessage={(p) => t("projects.delete.confirm", { name: p.name })}
      />
    </div>
  )
}
