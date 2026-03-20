"use client"

// views/partners/partner-detail-view.tsx

import { PartnerDetailPanel } from "@/components/partners/detail/partner-detail-panel"

interface PartnerDetailViewProps {
  partnerId: string
}

export function PartnerDetailView({ partnerId }: PartnerDetailViewProps) {
  return <PartnerDetailPanel partnerId={partnerId} />
}
