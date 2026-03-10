import { redirect } from "next/navigation";

export default function BillingCancelPage() {
  redirect("/settings/billing/cancel");
}
