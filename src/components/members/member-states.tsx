"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Users } from "lucide-react"

export function MembersSkeleton() {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center px-5 py-2.5 bg-muted/30 border-b border-border">
        <Skeleton className="h-3 w-20" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-3.5 border-b last:border-b-0">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-44" />
          </div>
          <Skeleton className="h-7 w-28 hidden sm:block" />
          <Skeleton className="h-3 w-20 hidden md:block" />
        </div>
      ))}
    </div>
  )
}

export function MembersEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="flex items-center justify-center size-12 rounded-xl bg-muted">
        <Users className="size-5 text-muted-foreground" />
      </div>
      <div className="text-center">
        <h3 className="text-sm font-semibold text-foreground">Sin miembros</h3>
        <p className="text-xs text-muted-foreground mt-1.5 max-w-65 leading-relaxed">
          Solo tú tienes acceso a este proyecto. Invita a alguien para colaborar.
        </p>
      </div>
    </div>
  )
}
