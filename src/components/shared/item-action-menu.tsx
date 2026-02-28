"use client"

import { Pencil, Trash2, ArrowRight, MoreHorizontal, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  /** If provided, renders a "Gestionar accesos" option */
  onShare?: () => void;
  shareLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  /** Stop event propagation on trigger and items (for clickable rows) */
  stopPropagation?: boolean;
  /** Alignment of the dropdown. Default: "end" */
  align?: "start" | "center" | "end";
  /** Use the "ghost" trigger style (Button variant). When false, uses a custom minimal trigger. */
  variant?: "ghost" | "minimal";
}

export function ItemActionMenu({
  ariaLabel = "Opciones",
  onEdit,
  onDelete,
  onOpen,
  openLabel = "Abrir",
  onShare,
  shareLabel = "Gestionar accesos",
  editLabel = "Editar",
  deleteLabel = "Eliminar",
  stopPropagation = false,
  align = "end",
  variant = "minimal",
}: ItemActionMenuProps) {
  function withStop<E extends React.SyntheticEvent>(fn: () => void) {
    return (e: E) => {
      if (stopPropagation) e.stopPropagation();
      fn();
    };
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
          >
            <MoreHorizontal className="size-4" />
            <span className="sr-only">{ariaLabel}</span>
          </Button>
        ) : (
          <button
            onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
            className={cn(
              "shrink-0 ml-2 flex items-center justify-center size-7 rounded-md",
              "text-muted-foreground/0 group-hover:text-muted-foreground",
              "hover:bg-accent hover:text-foreground",
              "transition-all duration-150",
              "focus-visible:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            )}
            aria-label={ariaLabel}
          >
            <MoreHorizontal className="size-4" />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-44">
        {onOpen && (
          <>
            <DropdownMenuItem onClick={withStop(onOpen)}>
              <ArrowRight className="size-4" />
              {openLabel}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {onShare && (
          <>
            <DropdownMenuItem onClick={withStop(onShare)}>
              <Users className="size-4" />
              {shareLabel}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={withStop(onEdit)}>
          <Pencil className="size-4" />
          {editLabel}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={withStop(onDelete)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="size-4" />
          {deleteLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
