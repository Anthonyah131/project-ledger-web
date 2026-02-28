import { ChevronRight, TrendingUp } from "lucide-react";
import Link from "next/link";

export function CTA() {
  return (
    <section className="px-6 py-20">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-primary/30 bg-primary/10 px-8 py-16 text-center">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        </div>
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary ring-1 ring-primary/30">
          <TrendingUp className="h-6 w-6" />
        </div>
        <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground">
          Empieza a gestionar mejor hoy
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Únete a miles de equipos que ya toman decisiones más inteligentes con
          Project Ledger.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-primary/50"
          >
            Crear cuenta gratis
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 items-center px-8 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            Ya tengo cuenta →
          </Link>
        </div>
      </div>
    </section>
  );
}
