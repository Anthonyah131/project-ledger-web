"use client"

import * as React from "react"
import { useMemo } from "react"
import {
  IconChartBar,
  IconCreditCard,
  IconDashboard,
  IconFolder,
  IconHelp,
  IconMessageCircle,
  IconSettings,
  IconShieldDollar,
  IconUserShield,
  IconUsersGroup,
} from "@tabler/icons-react"

import { useAuth } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { NavMain } from "@/components/dashboard/nav-main"
import { NavSecondary } from "@/components/dashboard/nav-secondary"
import { NavUser } from "@/components/dashboard/nav-user"
import { useChatbotPanel } from "@/hooks/chatbot/use-chatbot-panel"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { openPanel } = useChatbotPanel()
  const homeUrl = user?.isAdmin ? "/admin/users" : "/dashboard"
  const isAdmin = Boolean(user?.isAdmin)

  const navMain = useMemo(
    () =>
      user?.isAdmin
        ? [{ title: t("nav.users"), url: "/admin/users", icon: IconUserShield }]
        : [
            { title: t("nav.dashboard"),      url: "/dashboard",       icon: IconDashboard },
            { title: t("nav.projects"),        url: "/projects",        icon: IconFolder },
            { title: t("nav.partners"),        url: "/partners",        icon: IconUsersGroup },
            { title: t("nav.paymentMethods"),  url: "/payment-methods", icon: IconCreditCard },
            { title: t("nav.reports"),         url: "/reports",         icon: IconChartBar },
          ],
    [user?.isAdmin, t],
  )

  const navSecondary = useMemo(
    () => [
      { title: t("nav.settings"), url: "/settings", icon: IconSettings },
      { title: t("nav.help"),     url: "/help",     icon: IconHelp },
    ],
    [t],
  )

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href={homeUrl}>
                <IconShieldDollar className="size-5!" />
                <span className="text-base font-semibold">Project Ledger</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} sectionLabel={t("nav.sections.main")} />
        {!isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>{t("nav.sections.assistant")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={openPanel} tooltip={t("chatbot.sidebarButton")}>
                    <IconMessageCircle />
                    <span>{t("chatbot.sidebarButton")}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        <NavSecondary items={navSecondary} sectionLabel={t("nav.sections.support")} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
