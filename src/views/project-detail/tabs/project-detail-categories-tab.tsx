"use client"

import dynamic from "next/dynamic"
import { TabsContent } from "@/components/ui/tabs"
import { DeleteEntityModal } from "@/components/shared/delete-entity-modal"
import { CategoriesToolbar } from "@/components/project-detail/categories/categories-toolbar"
import { CategoriesList } from "@/components/project-detail/categories/categories-list"
import {
  CategoriesEmptyState,
  CategoriesSkeleton,
} from "@/components/project-detail/categories/category-states"
import type {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/category"

const CreateCategoryModal = dynamic(() =>
  import("@/components/project-detail/categories/create-category-modal").then((mod) => mod.CreateCategoryModal)
)
const EditCategoryModal = dynamic(() =>
  import("@/components/project-detail/categories/edit-category-modal").then((mod) => mod.EditCategoryModal)
)

interface CategoriesTabState {
  query: string
  setQuery: (value: string) => void
  loading: boolean
  categories: CategoryResponse[]
  hasSearch: boolean
  createOpen: boolean
  editTarget: CategoryResponse | null
  deleteTarget: CategoryResponse | null
}

interface ProjectDetailCategoriesTabProps {
  cat: CategoriesTabState
  onCreateOpen: () => void
  onCreateClose: () => void
  onEditSelect: (category: CategoryResponse) => void
  onEditClose: () => void
  onDeleteSelect: (category: CategoryResponse) => void
  onDeleteClose: () => void
  onCreate: (data: CreateCategoryRequest) => void
  onSave: (id: string, data: UpdateCategoryRequest) => void
  onDelete: (category: CategoryResponse) => void
}

export function ProjectDetailCategoriesTab({
  cat,
  onCreateOpen,
  onCreateClose,
  onEditSelect,
  onEditClose,
  onDeleteSelect,
  onDeleteClose,
  onCreate,
  onSave,
  onDelete,
}: ProjectDetailCategoriesTabProps) {
  return (
    <TabsContent value="categories" className="flex flex-col gap-4">
      <CategoriesToolbar
        query={cat.query}
        onQueryChange={cat.setQuery}
        onCreate={onCreateOpen}
      />

      {cat.loading ? (
        <CategoriesSkeleton />
      ) : cat.categories.length === 0 ? (
        <CategoriesEmptyState
          hasSearch={cat.hasSearch}
          onCreate={onCreateOpen}
        />
      ) : (
        <CategoriesList
          categories={cat.categories}
          onEdit={onEditSelect}
          onDelete={onDeleteSelect}
        />
      )}

      {cat.createOpen && (
        <CreateCategoryModal
          open={cat.createOpen}
          onClose={onCreateClose}
          onCreate={onCreate}
        />
      )}

      {!!cat.editTarget && (
        <EditCategoryModal
          category={cat.editTarget}
          open={!!cat.editTarget}
          onClose={onEditClose}
          onSave={onSave}
        />
      )}

      <DeleteEntityModal
        item={cat.deleteTarget}
        open={!!cat.deleteTarget}
        onClose={onDeleteClose}
        onConfirm={onDelete}
        title="Eliminar categoria"
        description="Esta accion no se puede deshacer."
        getMessage={(category) => `¿Eliminar categoría "${category.name}"? Los gastos de esta categoría se moverán a la categoría General.`}
      />
    </TabsContent>
  )
}
