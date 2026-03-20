import { redirect } from "next/navigation"

interface WorkspaceDetailPageProps {
  params: Promise<{ workspaceId: string }>
}

export default async function WorkspaceDetailPage({ params }: WorkspaceDetailPageProps) {
  const { workspaceId } = await params
  redirect(`/projects?tab=workspaces&ws=${workspaceId}`)
}
