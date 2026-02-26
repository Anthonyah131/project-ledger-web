"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProjectsPaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function ProjectsPagination({
  page,
  pageSize,
  total,
  onPageChange,
}: ProjectsPaginationProps) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  function getPages(): (number | "dots")[] {
    const pages: (number | "dots")[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push("dots")
      const s = Math.max(2, page - 1)
      const e = Math.min(totalPages - 1, page + 1)
      for (let i = s; i <= e; i++) pages.push(i)
      if (page < totalPages - 2) pages.push("dots")
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="flex items-center justify-between px-5 py-3">
      <p className="text-xs text-muted-foreground tabular-nums">
        {start}{"\u2013"}{end} de {total}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Pagina anterior"
        >
          <ChevronLeft className="size-3.5" />
        </button>

        {getPages().map((p, idx) =>
          p === "dots" ? (
            <span key={`d-${idx}`} className="flex items-center justify-center size-7 text-xs text-muted-foreground">
              {"..."}
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                "flex items-center justify-center size-7 rounded-md text-xs font-medium transition-colors",
                p === page
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Pagina siguiente"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
