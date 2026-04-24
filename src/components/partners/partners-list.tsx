"use client"

import { memo } from "react"
import { useRouter } from "next/navigation"
import { Mail, Phone } from "lucide-react"
import { cn } from "@/lib/utils"
import { ItemActionMenu } from "@/components/shared/item-action-menu"
import type { PartnerResponse } from "@/types/partner"
import { useLanguage } from "@/context/language-context"

interface PartnersListProps {
  partners: PartnerResponse[]
  onEdit: (p: PartnerResponse) => void
  onDelete: (p: PartnerResponse) => void
}

function PartnersListComponent({ partners, onEdit, onDelete }: PartnersListProps) {
  const router = useRouter()
  const { t } = useLanguage()

  return (
    <div role="list" aria-label={t("partners.title")}>
      {/* Header */}
      <div className="flex items-center px-5 py-2.5 text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest border-b border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent">
        <span className="flex-1">{t("partners.singular")}</span>
        <span className="w-48 hidden md:block">{t("common.email")}</span>
        <span className="w-32 hidden lg:block">{t("partners.phonelabel")}</span>
        <span className="w-8" />
      </div>

      {partners.map((p) => {
        const initial = p.name.charAt(0).toUpperCase()
        return (
          <div
            key={p.id}
            role="listitem"
            className={cn(
              "group flex items-center px-5 py-3",
              "border-b border-border/50 last:border-b-0",
              "hover:bg-violet-500/5 transition-colors duration-150",
              "cursor-pointer",
            )}
            onClick={() => router.push(`/partners/${p.id}`)}
          >
            {/* Avatar */}
            <div className="size-7 rounded-full shrink-0 mr-3.5 bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-700 dark:text-violet-400 text-[11px] font-bold">
              {initial}
            </div>

            {/* Name + notes */}
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-sm font-semibold text-foreground truncate leading-snug">
                {p.name}
              </p>
              {p.notes && (
                <p className="text-xs text-muted-foreground truncate mt-0.5 leading-relaxed">
                  {p.notes}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="w-48 hidden md:flex items-center gap-1.5 min-w-0">
              {p.email ? (
                <>
                  <Mail className="size-3 shrink-0 text-violet-500/60" />
                  <span className="text-xs text-muted-foreground truncate">{p.email}</span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground/30">—</span>
              )}
            </div>

            {/* Phone */}
            <div className="w-32 hidden lg:flex items-center gap-1.5">
              {p.phone ? (
                <>
                  <Phone className="size-3 shrink-0 text-violet-500/60" />
                  <span className="text-xs text-muted-foreground">{p.phone}</span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground/30">—</span>
              )}
            </div>

            {/* Menu */}
            <ItemActionMenu
              onOpen={() => router.push(`/partners/${p.id}`)}
              openLabel={t("partners.viewDetail")}
              onEdit={() => onEdit(p)}
              onDelete={() => onDelete(p)}
              stopPropagation
            />
          </div>
        )
      })}
    </div>
  )
}

export const PartnersList = memo(PartnersListComponent)
