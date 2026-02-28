import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { plans } from "./landing-data";

export function Pricing() {
  return (
    <section id="pricing" className="px-6 py-28">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            Precios
          </p>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground">
            Planes para cada etapa
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Empieza gratis y escala cuando lo necesites. Sin sorpresas.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-8 transition-all ${
                plan.highlighted
                  ? "border-primary bg-primary/10 shadow-xl shadow-primary/20"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/40">
                    Más popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p className={`text-sm font-semibold ${plan.highlighted ? "text-primary" : "text-muted-foreground"}`}>
                  {plan.name}
                </p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className={`text-4xl font-bold ${plan.highlighted ? "text-foreground" : "text-foreground"}`}>{plan.price}</span>
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <ul className="mb-8 flex flex-1 flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <CheckCircle2 className={`h-4 w-4 shrink-0 ${plan.highlighted ? "text-primary" : "text-muted-foreground"}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`inline-flex h-11 items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 hover:bg-primary/90"
                    : "border border-border bg-muted text-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
