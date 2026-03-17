import { WorkspaceDetailView } from "@/views/workspaces/workspace-detail-view"

interface WorkspaceDetailPageProps {
  params: Promise<{ workspaceId: string }>
}

export default async function WorkspaceDetailPage({ params }: WorkspaceDetailPageProps) {
  const { workspaceId } = await params
  return <WorkspaceDetailView workspaceId={workspaceId} />
}
