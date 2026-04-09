"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { SearchIcon } from "lucide-react"
import {
  IconArrowUp,
  IconChartBar,
  IconCreditCard,
  IconDashboard,
  IconFolder,
  IconPin,
  IconPlus,
  IconReceipt,
  IconSettings,
  IconUsersGroup,
} from "@tabler/icons-react"

import { useLanguage } from "@/context/language-context"
import { useCommandPalette } from "@/hooks/use-command-palette"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

/**
 * Renders both the trigger button (for the header) and the command dialog.
 * useCommandPalette is called once here so open/setOpen is shared.
 */
export function CommandPalette() {
  const router = useRouter()
  const { t } = useLanguage()
  const {
    open,
    setOpen,
    query,
    setQuery,
    pinnedProjects,
    projects,
    projectsHasNextPage,
    projectsLoadMore,
    partners,
    paymentMethods,
    paymentMethodsHasNextPage,
    paymentMethodsLoadMore,
    searchResults,
  } = useCommandPalette()

  const runCommand = useCallback(
    (fn: () => void) => {
      setOpen(false)
      fn()
    },
    [setOpen],
  )

  const navItems = [
    { title: t("nav.dashboard"), url: "/dashboard", icon: IconDashboard },
    { title: t("nav.projects"), url: "/projects", icon: IconFolder },
    { title: t("nav.partners"), url: "/partners", icon: IconUsersGroup },
    { title: t("nav.paymentMethods"), url: "/payment-methods", icon: IconCreditCard },
    { title: t("nav.reports"), url: "/reports", icon: IconChartBar },
    { title: t("nav.settings"), url: "/settings", icon: IconSettings },
  ]

  const quickActions = [
    {
      title: t("commandPalette.actions.newProject"),
      icon: IconPlus,
      action: () => router.push("/projects?new=1"),
    },
  ]

  const hasProjects = pinnedProjects.length > 0 || projects.length > 0

  return (
    <>
      {/* Trigger button — rendered inside the header */}
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-2 text-muted-foreground text-sm font-normal"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="size-3.5" />
        <span className="hidden sm:inline">{t("commandPalette.trigger")}</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Dialog */}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={t("commandPalette.placeholder")}
        description={t("commandPalette.placeholder")}
        showCloseButton={false}
      >
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder={t("commandPalette.placeholder")}
        />
        <CommandList>
          <CommandEmpty>{t("commandPalette.empty")}</CommandEmpty>

          {/* Navigation */}
          <CommandGroup heading={t("commandPalette.groups.navigation")}>
            {navItems.map((item) => (
              <CommandItem
                key={item.url}
                value={item.title}
                onSelect={() => runCommand(() => router.push(item.url))}
              >
                <item.icon />
                {item.title}
              </CommandItem>
            ))}
          </CommandGroup>

          {/* Quick Actions */}
          <CommandSeparator />
          <CommandGroup heading={t("commandPalette.groups.quickActions")}>
            {quickActions.map((action) => (
              <CommandItem
                key={action.title}
                value={action.title}
                onSelect={() => runCommand(action.action)}
              >
                <action.icon />
                {action.title}
              </CommandItem>
            ))}
          </CommandGroup>

          {/* Projects (pinned first, then rest) */}
          {hasProjects && (
            <>
              <CommandSeparator />
              <CommandGroup heading={t("commandPalette.groups.projects")}>
                {pinnedProjects.map((project) => (
                  <CommandItem
                    key={project.id}
                    value={`project-${project.id}-${project.name}`}
                    onSelect={() =>
                      runCommand(() => router.push(`/projects/${project.id}`))
                    }
                  >
                    <IconPin className="text-muted-foreground" />
                    {project.name}
                    {project.workspaceName && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {project.workspaceName}
                      </span>
                    )}
                  </CommandItem>
                ))}
                {projects.map((project) => (
                  <CommandItem
                    key={project.id}
                    value={`project-${project.id}-${project.name}`}
                    onSelect={() =>
                      runCommand(() => router.push(`/projects/${project.id}`))
                    }
                  >
                    <IconFolder />
                    {project.name}
                    {project.workspaceName && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {project.workspaceName}
                      </span>
                    )}
                  </CommandItem>
                ))}
                {projectsHasNextPage && (
                  <CommandItem
                    value="load-more-projects"
                    onSelect={projectsLoadMore}
                    className="text-xs text-muted-foreground italic justify-center"
                  >
                    {t("commandPalette.moreResultsAvailable")}
                  </CommandItem>
                )}
              </CommandGroup>
            </>
          )}

          {/* Partners */}
          {partners.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading={t("commandPalette.groups.partners")}>
                {partners.map((partner) => (
                  <CommandItem
                    key={partner.id}
                    value={`partner-${partner.id}-${partner.name}`}
                    onSelect={() =>
                      runCommand(() => router.push(`/partners/${partner.id}`))
                    }
                  >
                    <IconUsersGroup />
                    {partner.name}
                    {partner.email && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {partner.email}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {/* Payment Methods */}
          {paymentMethods.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading={t("commandPalette.groups.paymentMethods")}>
                {paymentMethods.map((pm) => (
                  <CommandItem
                    key={pm.id}
                    value={`pm-${pm.id}-${pm.name}`}
                    onSelect={() =>
                      runCommand(() => router.push(`/payment-methods/${pm.id}`))
                    }
                  >
                    <IconCreditCard />
                    {pm.name}
                    {pm.currency && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {pm.currency}
                      </span>
                    )}
                  </CommandItem>
                ))}
                {paymentMethodsHasNextPage && (
                  <CommandItem
                    value="load-more-payment-methods"
                    onSelect={paymentMethodsLoadMore}
                    className="text-xs text-muted-foreground italic justify-center"
                  >
                    {t("commandPalette.moreResultsAvailable")}
                  </CommandItem>
                )}
              </CommandGroup>
            </>
          )}

          {/* Expenses — global search results */}
          {searchResults && searchResults.expenses.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading={t("commandPalette.groups.expenses")}>
                {searchResults.expenses.map((expense) => (
                  <CommandItem
                    key={expense.id}
                    value={`expense-${expense.id}-${expense.title}`}
                    onSelect={() =>
                      runCommand(() =>
                        router.push(`/projects/${expense.projectId}?expense=${expense.id}`),
                      )
                    }
                  >
                    <IconReceipt />
                    <span className="flex-1 truncate">{expense.title}</span>
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                      {expense.amount} {expense.currency} · {expense.projectName}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {/* Incomes — global search results */}
          {searchResults && searchResults.incomes.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading={t("commandPalette.groups.incomes")}>
                {searchResults.incomes.map((income) => (
                  <CommandItem
                    key={income.id}
                    value={`income-${income.id}-${income.title}`}
                    onSelect={() =>
                      runCommand(() =>
                        router.push(`/projects/${income.projectId}?income=${income.id}`),
                      )
                    }
                  >
                    <IconArrowUp />
                    <span className="flex-1 truncate">{income.title}</span>
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                      {income.amount} {income.currency} · {income.projectName}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
