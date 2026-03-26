"use client"

import type { LucideIcon } from "lucide-react";
import { FolderOpen, Plus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/language-context";

interface EmptyStateProps {
  /** Whether a search/filter is active (shows "no results" variant) */
  hasSearch: boolean;
  /** Called when clicking the create button (hidden when hasSearch is true) */
  onCreate: () => void;
  /** Title shown when no search is active */
  title?: string;
  /** Description shown when no search is active */
  description?: string;
  /** Title shown when has search, default "Sin resultados" */
  searchTitle?: string;
  /** Description shown when has search */
  searchDescription?: string;
  /** Label for the create button */
  createLabel?: string;
  /** Icon shown when no search is active */
  icon?: LucideIcon;
}

export function EmptyState({
  hasSearch,
  onCreate,
  title,
  description,
  searchTitle,
  searchDescription,
  createLabel,
  icon: Icon = FolderOpen,
}: EmptyStateProps) {
  const { t } = useLanguage()
  const _title = title ?? t("common.noRecords")
  const _description = description ?? t("common.createFirst")
  const _searchTitle = searchTitle ?? t("common.noResults")
  const _searchDescription = searchDescription ?? t("common.noResultsDescription")
  const _createLabel = createLabel ?? t("common.createNew")

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="flex items-center justify-center size-12 rounded-xl bg-muted">
        {hasSearch ? (
          <SearchX className="size-5 text-muted-foreground" />
        ) : (
          <Icon className="size-5 text-muted-foreground" />
        )}
      </div>
      <div className="text-center">
        <h3 className="text-sm font-semibold text-foreground">
          {hasSearch ? _searchTitle : _title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1.5 max-w-65 leading-relaxed">
          {hasSearch ? _searchDescription : _description}
        </p>
      </div>
      {!hasSearch && (
        <Button onClick={onCreate} size="sm" className="mt-1">
          <Plus className="size-3.5" />
          {_createLabel}
        </Button>
      )}
    </div>
  );
}
