"use client"

import * as React from "react"
import {
  IconChartBar,
  IconCreditCard,
  IconDashboard,
  IconFolder,
  IconHelp,
  IconReceipt,
  IconSettings,
  IconShieldDollar,
} from "@tabler/icons-react"

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

const navMain = [
  { title: "Dashboard",        url: "/dashboard",        icon: IconDashboard },
  { title: "Proyectos",        url: "/projects",         icon: IconFolder },
  { title: "Gastos",           url: "/expenses",         icon: IconReceipt },
  { title: "Obligaciones",     url: "/obligations",      icon: IconShieldDollar },
  { title: "Métodos de pago",  url: "/payment-methods",  icon: IconCreditCard },
  { title: "Reportes",         url: "/reports",          icon: IconChartBar },
]

const navSecondary = [
  { title: "Configuración", url: "/settings", icon: IconSettings },
  { title: "Ayuda",         url: "#",         icon: IconHelp },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
