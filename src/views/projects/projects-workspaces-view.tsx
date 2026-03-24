"use client"

// views/projects/projects-workspaces-view.tsx
// Unified Projects + Workspaces view with two tabs.

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProjectsShelf } from "@/components/projects/projects-shelf"
import { WorkspacesPanel } from "@/components/workspaces/workspaces-panel"
import { WorkspaceDetailView } from "@/views/projects/workspace-detail-view"
import { useLanguage } from "@/context/language-context"

type Tab = "projects" | "workspaces"

function ProjectsWorkspacesViewInner() {
  const { t } = useLanguage()
  const router = useRouter()
  const params = useSearchParams()

  const tab = (params.get("tab") as Tab) ?? "projects"
  const wsId = params.get("ws")

  function switchTab(value: Tab) {
    if (value === "projects") {
      router.push("/projects")
    } else {
      router.push("/projects?tab=workspaces")
    }
  }

  function selectWorkspace(id: string) {
    router.push(`/projects?tab=workspaces&ws=${id}`)
  }

  function backToWorkspaceList() {
    router.push("/projects?tab=workspaces")
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border mb-8">
        <TabButton active={tab === "projects"} onClick={() => switchTab("projects")}>
          {t("nav.projects")}
        </TabButton>
        <TabButton active={tab === "workspaces" || !!wsId} onClick={() => switchTab("workspaces")}>
          {t("nav.workspaces")}
        </TabButton>
      </div>

      {/* Content */}
      {tab === "projects" ? (
        <ProjectsShelf />
      ) : wsId ? (
        <WorkspaceDetailView
          workspaceId={wsId}
          onBack={backToWorkspaceList}
        />
      ) : (
        <WorkspacesPanel onSelectWorkspace={selectWorkspace} />
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-4 py-2.5 text-sm font-medium transition-colors relative",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-t",
        active
          ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground"
          : "text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      {children}
    </button>
  )
}

export function ProjectsWorkspacesView() {
  return (
    <Suspense>
      <ProjectsWorkspacesViewInner />
    </Suspense>
  )
}
