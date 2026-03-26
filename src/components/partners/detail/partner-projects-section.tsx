"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/context/language-context"
import { FolderKanban } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/shared/pagination"
import { SectionToolbar } from "./section-toolbar"
import { getAccentColor } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { PartnerProjectResponse } from "@/types/partner"
import type { ViewMode } from "@/types/project"

function ProjectCard({ project, accentIndex }: { project: PartnerProjectResponse; accentIndex: number }) {
  const router = useRouter()
  const accent = getAccentColor(accentIndex)
  return (
    <div
      role="listitem"
      className="group bg-card flex flex-col cursor-pointer transition-colors duration-150 hover:bg-accent/30"
      onClick={() => router.push(`/projects/${project.id}`)}
    >
      <div className="flex flex-1 gap-4 p-5">
        <div className={cn("w-1 shrink-0 rounded-full self-stretch", accent)} />
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground leading-snug truncate">{project.name}</h3>
            {project.description && (
              <p className="text-xs text-muted-foreground leading-relaxed mt-1 line-clamp-2">{project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 mt-auto flex-wrap">
            <span className="text-xs font-medium text-foreground/80">{project.currencyCode}</span>
            {project.workspaceName && (
              <>
                <span className="text-border">{"/"}</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-medium text-muted-foreground">
                  {project.workspaceName}
                </Badge>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProjectRow({ project, accentIndex }: { project: PartnerProjectResponse; accentIndex: number }) {
  const router = useRouter()
  const accent = getAccentColor(accentIndex)
  return (
    <div
      role="listitem"
      className="group flex items-center gap-3 px-5 py-3 border-b border-border/50 last:border-b-0 hover:bg-accent/20 transition-colors duration-150 cursor-pointer"
      onClick={() => router.push(`/projects/${project.id}`)}
    >
      <div className={cn("size-2 rounded-full shrink-0", accent)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{project.name}</p>
        {project.description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{project.description}</p>
        )}
      </div>
      <span className="text-xs font-medium text-foreground/70 shrink-0">{project.currencyCode}</span>
      {project.workspaceName && (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-medium text-muted-foreground shrink-0">
          {project.workspaceName}
        </Badge>
      )}
    </div>
  )
}

interface PartnerProjectsSectionProps {
  items: PartnerProjectResponse[]
  totalCount: number
  page: number
  onPageChange: (p: number) => void
  pageSize: number
  onPageSizeChange: (s: number) => void
  sort: string
  onSortChange: (s: string) => void
  loading: boolean
}

export function PartnerProjectsSection({
  items,
  totalCount,
  page,
  onPageChange,
  pageSize,
  onPageSizeChange,
  sort,
  onSortChange,
  loading,
}: PartnerProjectsSectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("shelf")
  const { t } = useLanguage()
  const globalOffset = (page - 1) * pageSize

  const sortOptions = useMemo(() => [
    { value: "name:asc", label: t("common.sortAZ") },
    { value: "name:desc", label: t("common.sortZA") },
    { value: "updatedAt:desc", label: t("common.sortRecent") },
    { value: "createdAt:desc", label: t("common.sortNew") },
  ], [t])

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-border bg-gradient-to-r from-foreground/3 to-transparent">
        <FolderKanban className="size-4 text-muted-foreground shrink-0" />
        <h2 className="text-sm font-semibold text-foreground">{t("partners.relatedProjects")}</h2>
        {totalCount > 0 && (
          <span className="text-xs text-muted-foreground tabular-nums">{totalCount}</span>
        )}
        <div className="ml-auto">
          <SectionToolbar
            sort={sort}
            sortOptions={sortOptions}
            onSortChange={onSortChange}
            pageSize={pageSize}
            onPageSizeChange={onPageSizeChange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            accentClass="bg-foreground/10 text-foreground"
            borderClass="border-border"
          />
        </div>
      </div>

      {loading ? (
        viewMode === "shelf" ? <GridSkeleton /> : <ListSkeleton />
      ) : items.length === 0 ? (
        <SectionEmpty message={t("partners.projectsEmpty")} />
      ) : viewMode === "shelf" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border" role="list">
          {items.map((p, i) => (
            <ProjectCard key={p.id} project={p} accentIndex={globalOffset + i} />
          ))}
        </div>
      ) : (
        <div role="list">
          {items.map((p, i) => (
            <ProjectRow key={p.id} project={p} accentIndex={globalOffset + i} />
          ))}
        </div>
      )}

      {!loading && totalCount > pageSize && (
        <div className="border-t border-border">
          <Pagination page={page} pageSize={pageSize} total={totalCount} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border/50">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card p-5 flex gap-4">
          <Skeleton className="w-1 rounded-full self-stretch shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-3 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-3">
          <Skeleton className="size-2 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

function SectionEmpty({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-10 px-4">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
