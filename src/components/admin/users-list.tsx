"use client"

import { memo } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate } from "@/lib/date-utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Pencil, ShieldCheck, ShieldOff, Trash2, UserCheck, UserX } from "lucide-react"
import { useLanguage } from "@/context/language-context"
import type { AdminUserResponse } from "@/types/admin-user"

interface AdminUsersListProps {
  users: AdminUserResponse[]
  onEdit: (user: AdminUserResponse) => void
  onDelete: (user: AdminUserResponse) => void
  onActivate: (user: AdminUserResponse) => void
  onDeactivate: (user: AdminUserResponse) => void
  onToggleAdmin: (user: AdminUserResponse) => void
}

function getInitials(name: string | null | undefined) {
  if (!name) return "??"
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

function AdminUsersListComponent({
  users,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  onToggleAdmin,
}: AdminUsersListProps) {
  const { t } = useLanguage()

  return (
    <div role="list" aria-label={t("admin.plural")}>
      {/* Header */}
      <div className="flex items-center px-5 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-widest border-b border-border bg-muted/30">
        <span className="flex-1">{t("admin.columnUser")}</span>
        <span className="w-16 text-center hidden sm:block">{t("admin.columnPlan")}</span>
        <span className="w-16 text-center hidden sm:block">{t("admin.columnStatus")}</span>
        <span className="w-14 text-center hidden md:block">{t("admin.columnRole")}</span>
        <span className="w-28 text-right hidden lg:block">{t("admin.columnRegistered")}</span>
        <span className="w-28 text-right hidden lg:block">{t("admin.columnLastAccess")}</span>
        <span className="w-8" />
      </div>

      {users.map((user) => (
        <div
          key={user.id}
          role="listitem"
          className={cn(
            "group flex items-center px-5 py-3.5",
            "border-b border-border last:border-b-0",
            "hover:bg-accent/30 transition-colors duration-150",
            user.isDeleted && "opacity-50",
          )}
        >
          {/* Avatar */}
          <Avatar className="size-8 shrink-0 mr-3">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.fullName} />
            <AvatarFallback className="text-[10px] font-medium">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>

          {/* Name + email */}
          <div className="flex-1 min-w-0 mr-4">
            <p className="text-sm font-medium text-foreground truncate leading-snug">
              {user.fullName}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5 leading-relaxed">
              {user.email}
            </p>
          </div>

          {/* Plan badge */}
          <div className="w-16 flex justify-center sm:flex">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-medium">
              {user.plan?.name ?? "—"}
            </Badge>
          </div>

          {/* Status badge */}
          <div className="w-16 flex justify-center sm:flex">
            {user.isDeleted ? (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 font-medium">
                {t("admin.statusDeleted")}
              </Badge>
            ) : user.isActive ? (
              <Badge className="text-[10px] px-1.5 py-0 h-4 font-medium bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0">
                {t("admin.statusActive")}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-medium text-muted-foreground">
                {t("admin.statusInactive")}
              </Badge>
            )}
          </div>

          {/* Role */}
          <div className="w-14 flex justify-center md:flex">
            {user.isAdmin ? (
              <Badge className="text-[10px] px-1.5 py-0 h-4 font-medium bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0">
                {t("admin.roleAdmin")}
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground">{t("admin.roleUser")}</span>
            )}
          </div>

          {/* Created date */}
          <span className="w-28 text-right text-xs text-muted-foreground tabular-nums hidden lg:block">
            {formatDate(user.createdAt)}
          </span>

          {/* Last login */}
          <span className="w-28 text-right text-xs text-muted-foreground tabular-nums hidden lg:block">
            {formatDate(user.lastLoginAt, { fallback: "—" })}
          </span>

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center justify-center size-7 rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-accent transition-all duration-150 ml-1"
                aria-label={t("common.actions")}
              >
                <MoreVertical className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Pencil className="size-3.5 mr-2" />
                {t("common.edit")}
              </DropdownMenuItem>

              {!user.isDeleted && (
                <>
                  {user.isActive ? (
                    <DropdownMenuItem onClick={() => onDeactivate(user)}>
                      <UserX className="size-3.5 mr-2" />
                      {t("admin.deactivate")}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onActivate(user)}>
                      <UserCheck className="size-3.5 mr-2" />
                      {t("admin.activate")}
                    </DropdownMenuItem>
                  )}

                  {user.isAdmin ? (
                    <DropdownMenuItem onClick={() => onToggleAdmin(user)}>
                      <ShieldOff className="size-3.5 mr-2" />
                      {t("admin.removeAdmin")}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onToggleAdmin(user)}>
                      <ShieldCheck className="size-3.5 mr-2" />
                      {t("admin.makeAdmin")}
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => onDelete(user)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-3.5 mr-2" />
                    {t("common.delete")}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  )
}

export const AdminUsersList = memo(AdminUsersListComponent)
