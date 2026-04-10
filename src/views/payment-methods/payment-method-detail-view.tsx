"use client"

// views/payment-methods/payment-method-detail-view.tsx
// Vista de detalle para un método de pago individual

import { useEffect, useRef } from "react"
import { usePaymentMethodDetail } from "@/hooks/payment-methods/use-payment-method-detail"
import { PaymentMethodDetailPanel } from "@/components/payment-methods/payment-method-detail-panel"
import { useRouter, useSearchParams } from "next/navigation"
import { useOnboardingContext } from "@/context/onboarding-context"

interface Props {
  paymentMethodId: string
}

export function PaymentMethodDetailView({ paymentMethodId }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshProgress } = useOnboardingContext()
  const {
    paymentMethod,
    expenses,
    incomes,
    projects,
    summary,
    loadingDetail,
    loadingExpenses,
    loadingIncomes,
    loadingProjects,
    loadingSummary,
    error,
    page,
    setPage,
    pageSize,
    setPageSize,
    sort,
    handleSortChange,
    incomePage,
    setIncomePage,
    incomePageSize,
    setIncomePageSize,
    incomeSort,
    handleIncomeSortChange,
    from,
    to,
    activeStatus,
    dateRangeError,
    projectId,
    setFrom,
    setTo,
    setProjectId,
    setActiveStatus,
    clearFilters,
    editOpen,
    setEditOpen,
    deleteOpen,
    setDeleteOpen,
    mutateUpdate,
    mutateDelete,
    partners,
    loadingPartners,
    linkPartnerOpen,
    setLinkPartnerOpen,
    openLinkPartnerDialog,
    handleLinkPartner,
    handleUnlinkPartner,
  } = usePaymentMethodDetail(paymentMethodId)

  // Auto-open link partner dialog when navigated from onboarding checklist
  const onboardingAutoOpened = useRef(false)
  useEffect(() => {
    if (searchParams.get("onboarding") !== "1") return
    if (onboardingAutoOpened.current) return
    if (loadingDetail || !paymentMethod) return
    if (paymentMethod.partner) return // already linked
    onboardingAutoOpened.current = true
    openLinkPartnerDialog()
  }, [loadingDetail, paymentMethod, searchParams, openLinkPartnerDialog])

  const handleBack = () => {
    router.push("/payment-methods")
  }

  const handleDeleteWithRedirect = async () => {
    const deleted = await mutateDelete()
    if (deleted) {
      router.push("/payment-methods")
    }

    return deleted
  }

  const defaultTab = searchParams.get("onboarding") === "1" ? "partner" : "expenses"

  return (
    <PaymentMethodDetailPanel
      paymentMethod={paymentMethod}
      defaultTab={defaultTab}
      expenses={expenses}
      incomes={incomes}
      projects={projects}
      summary={summary}
      loadingDetail={loadingDetail}
      loadingExpenses={loadingExpenses}
      loadingIncomes={loadingIncomes}
      loadingProjects={loadingProjects}
      loadingSummary={loadingSummary}
      error={error}
      page={page}
      setPage={setPage}
      pageSize={pageSize}
      setPageSize={setPageSize}
      sort={sort}
      handleSortChange={handleSortChange}
      incomePage={incomePage}
      setIncomePage={setIncomePage}
      incomePageSize={incomePageSize}
      setIncomePageSize={setIncomePageSize}
      incomeSort={incomeSort}
      handleIncomeSortChange={handleIncomeSortChange}
      from={from}
      to={to}
      activeStatus={activeStatus}
      dateRangeError={dateRangeError}
      projectId={projectId}
      setFrom={setFrom}
      setTo={setTo}
      setProjectId={setProjectId}
      setActiveStatus={setActiveStatus}
      clearFilters={clearFilters}
      editOpen={editOpen}
      setEditOpen={setEditOpen}
      deleteOpen={deleteOpen}
      setDeleteOpen={setDeleteOpen}
      mutateUpdate={mutateUpdate}
      mutateDelete={handleDeleteWithRedirect}
      onBack={handleBack}
      partners={partners}
      loadingPartners={loadingPartners}
      linkPartnerOpen={linkPartnerOpen}
      setLinkPartnerOpen={setLinkPartnerOpen}
      openLinkPartnerDialog={openLinkPartnerDialog}
      onLinkPartner={async (partnerId) => { await handleLinkPartner(partnerId); refreshProgress() }}
      onUnlinkPartner={handleUnlinkPartner}
    />
  )
}
