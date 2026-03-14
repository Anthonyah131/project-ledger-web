import { ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="flex flex-col items-center px-6 pb-24 pt-40 text-center">
      {/* Badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary">
        <Sparkles className="h-3 w-3" />
        OCR con IA + chatbot financiero integrado
      </div>

      {/* Headline */}
      <h1 className="mx-auto max-w-4xl text-balance text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
        Control financiero de{" "}
        <span className="relative inline-block">
          <span className="relative z-10 text-primary">proyectos</span>
          <span className="absolute inset-x-0 bottom-1 z-0 h-3 bg-primary/15 transform-[skewX(-3deg)]" />
        </span>{" "}
        sin fricción
      </h1>

      {/* Subheadline */}
      <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground">
        Project Ledger te permite registrar gastos e ingresos, gestionar métodos
        de pago, colaborar en equipo y analizar tu flujo de caja — todo en un
        solo lugar, con IA que lee tus comprobantes.
      </p>

      {/* CTAs */}
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/register"
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-primary/50"
        >
          Empezar gratis — sin tarjeta
          <ChevronRight className="h-4 w-4" />
        </Link>
        <Link
          href="#features"
          className="inline-flex h-12 items-center gap-2 rounded-xl border border-border px-8 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          Ver características
        </Link>
      </div>

      {/* Social proof */}
      <p className="mt-8 text-xs text-muted-foreground">
        Plan Free disponible para siempre ·{" "}
        <span className="font-semibold text-primary">Sin límite de tiempo</span>{" "}
        · Actualiza cuando lo necesites
      </p>

      {/* Mock dashboard */}
      <div className="relative mt-20 w-full max-w-5xl">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/20">
          {/* Window chrome */}
          <div className="flex h-10 items-center gap-2 border-b border-border bg-muted px-4">
            <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
            <div className="ml-4 h-5 w-48 rounded-md bg-border/60" />
          </div>

          {/* Dashboard mock */}
          <div className="flex h-80 gap-0">
            {/* Sidebar */}
            <div className="hidden w-48 flex-col gap-1.5 border-r border-border bg-sidebar p-4 sm:flex">
              {["Dashboard", "Proyectos", "Reportes", "Métodos de pago", "Configuración"].map(
                (item, i) => (
                  <div
                    key={item}
                    className={`h-8 rounded-md px-3 flex items-center text-xs font-medium ${
                      i === 0
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item}
                  </div>
                )
              )}
            </div>

            {/* Main content */}
            <div className="flex flex-1 flex-col gap-3 p-5">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Ingresos del mes", val: "$12,400", up: true },
                  { label: "Gastos del mes", val: "$8,310", up: false },
                  { label: "Balance neto", val: "$4,090", highlight: true },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`rounded-lg border p-3 ${s.highlight ? "border-primary/30 bg-primary/10" : "border-border bg-background"}`}
                  >
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    <p className={`mt-1 text-lg font-bold ${s.highlight ? "text-primary" : "text-foreground"}`}>
                      {s.val}
                    </p>
                  </div>
                ))}
              </div>

              {/* Recent transactions + chart */}
              <div className="flex flex-1 gap-3">
                {/* Transactions list */}
                <div className="flex-1 rounded-lg border border-border bg-background p-3">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Últimos movimientos
                  </p>
                  {[
                    { name: "Servicios en la nube", amt: "-$120", cat: "Tecnología", pending: false },
                    { name: "Pago cliente ACME", amt: "+$3,200", cat: "Ingresos", pending: false },
                    { name: "Almuerzo equipo", amt: "-$85", cat: "Operativo", pending: true },
                  ].map((tx) => (
                    <div key={tx.name} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
                      <div>
                        <p className="text-[11px] font-medium text-foreground">{tx.name}</p>
                        <p className="text-[10px] text-muted-foreground">{tx.cat}</p>
                      </div>
                      <span className={`text-xs font-semibold ${tx.amt.startsWith("+") ? "text-green-500" : "text-foreground"}`}>
                        {tx.amt}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bar chart */}
                <div className="hidden w-40 rounded-lg border border-border bg-background p-3 md:block">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Gastos / mes
                  </p>
                  <div className="flex h-20 items-end gap-1">
                    {[50, 70, 45, 85, 60, 95].map((h, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-t transition-all ${i === 5 ? "bg-primary/80" : "bg-primary/20"}`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute inset-x-10 -bottom-4 -z-10 h-24 rounded-full bg-primary/10 blur-2xl" />
      </div>
    </section>
  );
}
