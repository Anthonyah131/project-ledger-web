"use client";

import { useRef } from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/language-context";
import { useHeroEntrance } from "@/hooks/animations/use-hero-entrance";

export function Hero() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLElement | null>(null);
  useHeroEntrance(containerRef);

  const navItems = [
    t("landing.mockDashboard.nav.dashboard"),
    t("landing.mockDashboard.nav.projects"),
    t("landing.mockDashboard.nav.reports"),
    t("landing.mockDashboard.nav.paymentMethods"),
    t("landing.mockDashboard.nav.settings"),
  ];

  const stats = [
    { label: t("landing.mockDashboard.stats.income"), val: "$12,400", up: true },
    { label: t("landing.mockDashboard.stats.expenses"), val: "$8,310", up: false },
    { label: t("landing.mockDashboard.stats.balance"), val: "$4,090", highlight: true },
  ];

  const transactions = [
    { name: t("landing.mockDashboard.transactions.t1.name"), amt: "-$120", cat: t("landing.mockDashboard.transactions.t1.cat"), pending: false },
    { name: t("landing.mockDashboard.transactions.t2.name"), amt: "+$3,200", cat: t("landing.mockDashboard.transactions.t2.cat"), pending: false },
    { name: t("landing.mockDashboard.transactions.t3.name"), amt: "-$85", cat: t("landing.mockDashboard.transactions.t3.cat"), pending: true },
  ];

  return (
    <section
      ref={containerRef}
      className="flex flex-col items-center px-6 pb-24 pt-40 text-center"
      data-lm-section="hero"
    >
      {/* Badge */}
      <div
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary"
        data-lm-reveal="badge"
      >
        <Sparkles className="h-3 w-3" />
        {t("landing.badge")}
      </div>

      {/* Headline */}
      <h1
        className="mx-auto max-w-4xl text-balance text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl"
        data-lm-reveal="headline"
      >
        {t("landing.heroTitlePart1")}{" "}
        <span className="relative inline-block">
          <span className="relative z-10 text-primary">{t("landing.heroTitleHighlight")}</span>
          <span className="absolute inset-x-0 bottom-1 z-0 h-3 bg-primary/15 transform-[skewX(-3deg)]" />
        </span>{" "}
        {t("landing.heroTitlePart2")}
      </h1>

      {/* Subheadline */}
      <p
        className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground"
        data-lm-reveal="subtitle"
      >
        {t("landing.heroSubtitle")}
      </p>

      {/* CTAs */}
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row" data-lm-reveal="cta-row">
        <Link
          href="/register"
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-primary/50"
        >
          {t("landing.ctaPrimary")}
          <ChevronRight className="h-4 w-4" />
        </Link>
        <Link
          href="#features"
          className="inline-flex h-12 items-center gap-2 rounded-xl border border-border px-8 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          {t("landing.ctaSecondary")}
        </Link>
      </div>

      {/* Social proof */}
      <p className="mt-8 text-xs text-muted-foreground" data-lm-reveal="social-proof">
        {t("landing.freePlanBadge")} ·{" "}
        <span className="font-semibold text-primary">{t("landing.noTimeLimit")}</span>{" "}
        · {t("landing.upgradeAnytime")}
      </p>

      {/* Mock dashboard */}
      <div className="relative mt-20 w-full max-w-5xl" data-lm-reveal="dashboard-mock">
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
              {navItems.map((item, i) => (
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
              ))}
            </div>

            {/* Main content */}
            <div className="flex flex-1 flex-col gap-3 p-5">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {stats.map((s) => (
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
                    {t("landing.mockDashboard.recentMovements")}
                  </p>
                  {transactions.map((tx) => (
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
                    {t("landing.mockDashboard.expensesChart")}
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
