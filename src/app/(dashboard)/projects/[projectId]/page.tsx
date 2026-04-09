import { Suspense } from "react"
import { ProjectDetailView } from "@/views/project-detail/project-detail-view"

interface Props {
  params: Promise<{ projectId: string }>
}

export default async function ProjectDetailPage({ params }: Props) {
  const { projectId } = await params
  return (
    <Suspense>
      <ProjectDetailView projectId={projectId} />
    </Suspense>
  )
}
