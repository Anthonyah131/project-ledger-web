"use client"

import { cn } from "@/lib/utils"
import { ROLE_LABEL } from "@/lib/constants"
import { formatDate } from "@/lib/format-utils"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Trash2, Crown } from "lucide-react"
import type { ProjectMemberResponse } from "@/types/project-member"

interface MembersListProps {
  members: ProjectMemberResponse[]
  onChangeRole: (memberId: string, role: "editor" | "viewer") => void
  onRemove: (member: ProjectMemberResponse) => void
}

export function MembersList({ members, onChangeRole, onRemove }: MembersListProps) {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center px-5 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-widest border-b border-border bg-muted/30">
        <span className="flex-1">Miembro</span>
        <span className="w-36 text-center hidden sm:block">Rol</span>
        <span className="w-28 text-right hidden md:block">Desde</span>
        <span className="w-10" />
      </div>

      {/* Rows */}
      {members.map((member) => {
        const isOwner = member.role === "owner"

        return (
          <div
            key={member.id}
            className={cn(
              "group flex items-center px-5 py-3.5",
              "border-b border-border last:border-b-0",
              "hover:bg-accent/30 transition-colors duration-150",
            )}
          >
            {/* Avatar + info */}
            <div className="flex-1 min-w-0 flex items-center gap-3">
              <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                {isOwner ? (
                  <Crown className="size-3.5 text-primary" />
                ) : (
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    {member.userFullName.charAt(0)}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate leading-snug">
                  {member.userFullName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {member.userEmail}
                </p>
              </div>
            </div>

            {/* Role */}
            <div className="w-36 justify-center hidden sm:flex">
              {isOwner ? (
                <Badge variant="default" className="text-[10px] px-2 py-0 h-5 font-medium">
                  {ROLE_LABEL[member.role]}
                </Badge>
              ) : (
                <Select
                  value={member.role}
                  onValueChange={(v) => onChangeRole(member.id, v as "editor" | "viewer")}
                >
                  <SelectTrigger className="w-28 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">{ROLE_LABEL.editor}</SelectItem>
                    <SelectItem value="viewer">{ROLE_LABEL.viewer}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Date */}
            <span className="w-28 text-right text-xs text-muted-foreground tabular-nums hidden md:block">
              {formatDate(member.joinedAt)}
            </span>

            {/* Remove */}
            <div className="w-10 flex justify-end">
              {!isOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground/0 group-hover:text-muted-foreground hover:text-destructive transition-colors"
                  onClick={() => onRemove(member)}
                  aria-label={`Remover a ${member.userFullName}`}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
