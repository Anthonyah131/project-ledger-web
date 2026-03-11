import { IconLayoutDashboard } from "@tabler/icons-react"

export function DashboardAdminEmptyState() {
  return (
    <section className="rounded-2xl border border-dashed border-border/80 bg-card/60 p-8 shadow-sm">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-border/70 bg-background/80 text-primary shadow-sm">
          <IconLayoutDashboard className="size-7" />
        </div>
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Dashboard admin
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Este dashboard todavia no esta disponible
          </h1>
          <p className="text-sm text-muted-foreground">
            Por ahora el espacio administrativo no tiene widgets. Puedes continuar gestionando usuarios desde el menu lateral.
          </p>
        </div>
      </div>
    </section>
  )
}