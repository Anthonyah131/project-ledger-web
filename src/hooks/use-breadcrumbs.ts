"use client"

// hooks/use-breadcrumbs.ts
// Parses the current pathname and resolves entity names for dynamic segments.

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/context/language-context"
import { getProject } from "@/services/project-service"
import { getPartner } from "@/services/partner-service"
import { getPaymentMethod } from "@/services/payment-method-service"
import { getWorkspace } from "@/services/workspace-service"

export interface BreadcrumbItem {
  label: string
  href: string
  isCurrent?: boolean
}

// Segments that have a dynamic child ID requiring an API lookup
const DYNAMIC_RESOLVERS: Record<string, (id: string) => Promise<{ name: string }>> = {
  projects: (id) => getProject(id),
  partners: (id) => getPartner(id),
  "payment-methods": (id) => getPaymentMethod(id),
  workspaces: (id) => getWorkspace(id),
}

// Segments to skip entirely in breadcrumbs (billing flow sub-pages)
const SKIP_SEGMENTS = new Set(["cancel", "success"])

export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [dynamicNames, setDynamicNames] = useState<Record<string, string>>({})

  const staticLabels: Record<string, string> = {
    dashboard: t("nav.dashboard"),
    projects: t("nav.projects"),
    partners: t("nav.partners"),
    "payment-methods": t("nav.paymentMethods"),
    reports: t("nav.reports"),
    settings: t("nav.settings"),
    billing: t("billing.title"),
    workspaces: t("nav.workspaces"),
    help: t("nav.help"),
    admin: t("nav.admin"),
    users: t("nav.users"),
    profile: t("settings.shell.profile"),
    appearance: t("settings.shell.appearance"),
    security: t("settings.shell.security"),
    members: t("projects.members"),
  }

  const segments = pathname.split("/").filter(Boolean)

  useEffect(() => {
    const toResolve: Array<{ parentSegment: string; id: string }> = []

    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i]
      const prevSegment = segments[i - 1]

      if (
        DYNAMIC_RESOLVERS[prevSegment] &&
        !SKIP_SEGMENTS.has(segment) &&
        !(segment in staticLabels)
      ) {
        toResolve.push({ parentSegment: prevSegment, id: segment })
      }
    }

    if (toResolve.length === 0) return

    let cancelled = false

    Promise.all(
      toResolve
        .filter(({ id }) => !dynamicNames[id])
        .map(async ({ parentSegment, id }) => {
          try {
            const entity = await DYNAMIC_RESOLVERS[parentSegment](id)
            return { id, name: entity.name }
          } catch {
            return null
          }
        })
    ).then((results) => {
      if (cancelled) return
      const updates: Record<string, string> = {}
      for (const r of results) {
        if (r) updates[r.id] = r.name
      }
      if (Object.keys(updates).length > 0) {
        setDynamicNames((prev) => ({ ...prev, ...updates }))
      }
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const items: BreadcrumbItem[] = []

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    const prevSegment = i > 0 ? segments[i - 1] : null
    const href = "/" + segments.slice(0, i + 1).join("/")
    const isCurrent = i === segments.length - 1

    if (SKIP_SEGMENTS.has(segment)) continue

    if (segment in staticLabels) {
      items.push({ label: staticLabels[segment], href, isCurrent })
    } else if (prevSegment && DYNAMIC_RESOLVERS[prevSegment]) {
      items.push({ label: dynamicNames[segment] ?? "...", href, isCurrent })
    }
  }

  return items
}
