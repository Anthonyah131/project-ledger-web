import { PartnerDetailView } from "@/views/partners/partner-detail-view"

interface PartnerDetailPageProps {
  params: Promise<{ partnerId: string }>
}

export default async function PartnerDetailPage({ params }: PartnerDetailPageProps) {
  const { partnerId } = await params
  return <PartnerDetailView partnerId={partnerId} />
}
