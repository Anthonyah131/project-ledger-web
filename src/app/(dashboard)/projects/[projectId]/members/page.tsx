import { MembersView } from "@/views/members/members-view"

interface Props {
  params: Promise<{ projectId: string }>
}

export default async function MembersPage({ params }: Props) {
  const { projectId } = await params
  return <MembersView projectId={projectId} />
}
