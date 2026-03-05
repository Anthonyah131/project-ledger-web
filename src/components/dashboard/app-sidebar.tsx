"use client"

import * as React from "react"
import { useMemo } from "react"
import {
  IconChartBar,
  IconCreditCard,
  IconDashboard,
  IconFolder,
  IconHelp,
  IconReceipt,
  IconSettings,
  IconShieldDollar,
  IconUserShield,
} from "@tabler/icons-react"

import { useAuth } from "@/context/auth-context"
import { NavMain } from "@/components/dashboard/nav-main"
import { NavSecondary } from "@/components/dashboard/nav-secondary"
import { NavUser } from "@/components/dashboard/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const userNavMain = [
  { title: "Dashboard",        url: "/dashboard",        icon: IconDashboard },
  { title: "Proyectos",        url: "/projects",         icon: IconFolder },
  { title: "Gastos",           url: "/expenses",         icon: IconReceipt },
  { title: "Obligaciones",     url: "/obligations",      icon: IconShieldDollar },
  { title: "Facturación",      url: "/billing",          icon: IconCreditCard },
  { title: "Métodos de pago",  url: "/payment-methods",  icon: IconCreditCard },
  { title: "Reportes",         url: "/reports",          icon: IconChartBar },
]

const adminNavMain = [
  { title: "Usuarios", url: "/admin/users", icon: IconUserShield },
]

const navSecondary = [
  { title: "Configuración", url: "/settings", icon: IconSettings },
  { title: "Ayuda",         url: "#",         icon: IconHelp },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  const navMain = useMemo(
    () => (user?.isAdmin ? adminNavMain : userNavMain),
    [user?.isAdmin],
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
              <a href="/dashboard">
                <IconShieldDollar className="size-5!" />
                <span className="text-base font-semibold">Project Ledger</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
