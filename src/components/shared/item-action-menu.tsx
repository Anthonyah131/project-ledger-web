"use client"

import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Unlink,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/language-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ItemActionMenuProps {
  /** Accessible label for the trigger button */
  ariaLabel?: string;
  /** Called when the Edit item is clicked */
  onEdit: () => void;
  /** Called when the Delete item is clicked */
  onDelete: () => void;
  /** If provided, renders an "Open" option at the top with a separator */
  onOpen?: () => void;
  openLabel?: string;
  /** If provided, renders an "Activate" option for inactive entities */
  onActivate?: () => void;
  activateLabel?: string;
  activatingLabel?: string;
  isActivating?: boolean;
  /** If provided, renders a "Gestionar accesos" option */
  onShare?: () => void;
  shareLabel?: string;
  /** If provided, renders a "Desconectar" option (workspace context) */
  onDisconnect?: () => void;
  disconnectLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  /** Stop event propagation on trigger and items (for clickable rows) */
  stopPropagation?: boolean;
  /** Alignment of the dropdown. Default: "end" */
  align?: "start" | "center" | "end";
  /** Use the "ghost" trigger style (Button variant). When false, uses a custom minimal trigger. */
  variant?: "ghost" | "minimal";
  /** If provided, renders a "Duplicate" option before Edit */
  onDuplicate?: () => void;
  duplicateLabel?: string;
  /** Disable the trigger and all actions */
  disabled?: boolean;
}

export function ItemActionMenu({
  ariaLabel,
  onEdit,
  onDelete,
  onOpen,
  openLabel,
  onActivate,
  activateLabel,
  activatingLabel,
  isActivating = false,
  onShare,
  shareLabel,
  onDisconnect,
  disconnectLabel,
  onDuplicate,
  duplicateLabel,
  editLabel,
  deleteLabel,
  stopPropagation = false,
  align = "end",
  variant = "minimal",
  disabled = false,
}: ItemActionMenuProps) {
  const { t } = useLanguage()
  const _ariaLabel = ariaLabel ?? t("common.options")
  const _openLabel = openLabel ?? t("common.open")
  const _activateLabel = activateLabel ?? t("common.activate")
  const _activatingLabel = activatingLabel ?? t("common.activating")
  const _shareLabel = shareLabel ?? t("common.manageAccess")
  const _disconnectLabel = disconnectLabel ?? t("common.disconnectFromWorkspace")
  const _duplicateLabel = duplicateLabel ?? t("common.duplicate")
  const _editLabel = editLabel ?? t("common.edit")
  const _deleteLabel = deleteLabel ?? t("common.delete")

  function runAfterMenuClose(fn: () => void) {
    if (typeof window !== "undefined" && "requestAnimationFrame" in window) {
      window.requestAnimationFrame(() => fn());
      return;
    }
    setTimeout(fn, 0);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "ghost" ? (
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors"
            onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
            aria-label={_ariaLabel}
            disabled={disabled}
          >
            <MoreHorizontal className="size-4" />
            <span className="sr-only">{_ariaLabel}</span>
          </Button>
        ) : (
          <button
            onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
            disabled={disabled}
            className={cn(
              "shrink-0 ml-2 flex items-center justify-center size-7 rounded-md",
              "text-muted-foreground/0 group-hover:text-muted-foreground",
              "hover:bg-accent hover:text-foreground",
              "disabled:pointer-events-none disabled:text-muted-foreground/40",
              "transition-all duration-150",
              "focus-visible:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            )}
            aria-label={_ariaLabel}
          >
            <MoreHorizontal className="size-4" />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-44" onClick={(e) => e.stopPropagation()}>
        {onOpen && (
          <>
            <DropdownMenuItem onSelect={() => runAfterMenuClose(onOpen)}>
              <ArrowRight className="size-4" />
              {_openLabel}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {onShare && (
          <>
            <DropdownMenuItem onSelect={() => runAfterMenuClose(onShare)}>
              <Users className="size-4" />
              {_shareLabel}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {onActivate && (
          <>
            <DropdownMenuItem onSelect={() => runAfterMenuClose(onActivate)} disabled={isActivating}>
              {isActivating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              {isActivating ? _activatingLabel : _activateLabel}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {onDisconnect && (
          <>
            <DropdownMenuItem onSelect={() => runAfterMenuClose(onDisconnect)}>
              <Unlink className="size-4" />
              {_disconnectLabel}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {onDuplicate && (
          <>
            <DropdownMenuItem onSelect={() => runAfterMenuClose(onDuplicate)}>
              <Copy className="size-4" />
              {_duplicateLabel}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onSelect={() => runAfterMenuClose(onEdit)}>
          <Pencil className="size-4" />
          {_editLabel}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => runAfterMenuClose(onDelete)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="size-4" />
          {_deleteLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
