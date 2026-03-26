"use client"

import { Search, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/context/language-context"

interface CategoriesToolbarProps {
  query: string
  onQueryChange: (q: string) => void
  onCreate: () => void
}

export function CategoriesToolbar({
  query,
  onQueryChange,
  onCreate,
}: CategoriesToolbarProps) {
  const { t } = useLanguage()

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative flex-1 min-w-50 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder={t("categories.searchPlaceholder")}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="pl-9 h-9"
        />
      </div>
      <div className="ml-auto">
        <Button
          size="sm"
          className="h-9 bg-linear-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 border-0 shadow-sm shadow-amber-500/30 transition-all"
          onClick={onCreate}
        >
          <Plus className="size-4 mr-1.5" />
          {t("categories.new")}
        </Button>
      </div>
    </div>
  )
}
