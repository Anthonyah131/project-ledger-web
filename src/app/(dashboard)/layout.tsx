// app/(dashboard)/layout.tsx
// Protected shell for all dashboard routes.
// AuthGuard handles session verification, loading and redirects.
// For admin-only sub-sections, add a nested layout with <AuthGuard requireAdmin>.

import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

import { AuthGuard } from "@/components/auth/auth-guard";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Chatbot from "@/components/shared/chatbot";
import { OnboardingProvider } from "@/context/onboarding-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <OnboardingProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <SiteHeader />
            <main className="flex flex-1 flex-col gap-0 px-3 py-6 lg:px-4">{children}</main>
          </SidebarInset>
        </SidebarProvider>
        <Chatbot />
      </OnboardingProvider>
    </AuthGuard>
  );
}
