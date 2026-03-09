import { PaymentMethodDetailView } from "@/views/payment-methods/payment-method-detail-view"

interface Props {
  params: Promise<{ id: string }>
}

export default async function PaymentMethodDetailPage({ params }: Props) {
  const { id } = await params
  return <PaymentMethodDetailView paymentMethodId={id} />
}
