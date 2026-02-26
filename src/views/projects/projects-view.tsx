"use client";

// views/projects/projects-view.tsx
// Thin view wrapper — mounts the ProjectsShelf orchestrator.

import { ProjectsShelf } from "@/components/projects/projects-shelf";

export function ProjectsView() {
  return <ProjectsShelf />;
}
