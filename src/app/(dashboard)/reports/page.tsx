import { Suspense } from "react"
import { ReportsView } from "@/views/reports/reports-view"

export default function ReportsPage() {
  return (
    <Suspense fallback={null}>
      <ReportsView />
    </Suspense>
  )
}
