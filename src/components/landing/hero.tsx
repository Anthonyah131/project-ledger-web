import { ChevronRight, Zap } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="flex flex-col items-center px-6 pb-24 pt-40 text-center">
      {/* Badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary">
        <Zap className="h-3 w-3" />
        Ahora con asistencia de IA integrada
      </div>

      {/* Headline */}
      <h1 className="mx-auto max-w-4xl text-balance text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
        Gestiona proyectos{" "}
        <span className="relative inline-block">
          <span className="relative z-10 text-primary">con precisión</span>
          <span className="absolute inset-x-0 bottom-1 z-0 h-3 bg-primary/15 transform-[skewX(-3deg)]" />
        </span>{" "}
        y sin caos
      </h1>

      {/* Subheadline */}
      <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground">
        Project Ledger centraliza tus proyectos, presupuestos y equipo en una
        sola plataforma. Toma decisiones más inteligentes con datos en tiempo
        real e inteligencia artificial.
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
          href="#how-it-works"
          className="inline-flex h-12 items-center gap-2 rounded-xl border border-border px-8 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          Ver cómo funciona
        </Link>
      </div>

      {/* Social proof */}
      <p className="mt-8 text-xs text-muted-foreground">
        Usado por más de{" "}
        <span className="font-semibold text-primary">2,000+ equipos</span>{" "}
        en Latinoamérica
      </p>

      {/* Mock dashboard */}
      <div className="relative mt-20 w-full max-w-5xl">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/20">
          {/* Window chrome */}
          <div className="flex h-10 items-center gap-2 border-b border-border bg-muted px-4">
            <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
            <div className="ml-4 h-5 w-64 rounded-md bg-border" />
          </div>

          {/* Dashboard mock */}
          <div className="flex h-80 gap-0">
            {/* Sidebar mock */}
            <div className="hidden w-52 flex-col gap-1.5 border-r border-border bg-sidebar p-4 sm:flex">
              {["Dashboard", "Proyectos", "Presupuesto", "Historial", "Configuración"].map(
                (item, i) => (
                  <div
                    key={item}
                    className={`h-8 rounded-md px-3 flex items-center text-xs font-medium ${
                      i === 0
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                        : "text-muted-foreground hover:bg-border"
                    }`}
                  >
                    {item}
                  </div>
                )
              )}
            </div>

            {/* Main content mock */}
            <div className="flex flex-1 flex-col gap-4 p-6">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Proyectos activos", val: "12", highlight: false },
                  { label: "Presupuesto total", val: "$48,200", highlight: true },
                  { label: "Tareas completadas", val: "87%", highlight: false },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`rounded-lg border p-3 ${s.highlight ? "border-primary/30 bg-primary/10" : "border-border bg-background"}`}
                  >
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    <p className={`mt-1 text-lg font-bold ${s.highlight ? "text-primary" : "text-foreground"}`}>{s.val}</p>
                  </div>
                ))}
              </div>

              {/* Chart mock */}
              <div className="flex-1 rounded-lg border border-border bg-background p-4">
                <div className="mb-3 text-xs font-medium text-muted-foreground">
                  Actividad mensual
                </div>
                <div className="flex h-24 items-end gap-1.5">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map(
                    (h, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-t transition-all ${i === 9 || i === 5 ? "bg-primary/70" : "bg-primary/20"}`}
                        style={{ height: `${h}%` }}
                      />
                    )
                  )}
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
