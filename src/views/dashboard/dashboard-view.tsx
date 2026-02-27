"use client";

// views/dashboard/dashboard-view.tsx

import {
  IconReceipt,
  IconFolder,
  IconShieldDollar,
  IconChartBar,
  IconTrendingUp,
  IconAlertCircle,
  IconShieldCheck,
  IconUserShield,
} from "@tabler/icons-react";

import { useAuth } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

//  Summary cards 
// Placeholder values until real data endpoints are wired up.
const summaryCards = [
  {
    label: "Total gastos",
    value: "",
    footer: "Conecta tu primer proyecto",
    footerIcon: IconTrendingUp,
    icon: IconReceipt,
    trend: null,
  },
  {
    label: "Proyectos activos",
    value: "0",
    footer: "Sin proyectos todavía",
    footerIcon: IconFolder,
    icon: IconFolder,
    trend: null,
  },
  {
    label: "Obligaciones pendientes",
    value: "0",
    footer: "Sin deudas registradas",
    footerIcon: IconShieldDollar,
    icon: IconShieldDollar,
    trend: null,
  },
  {
    label: "Presupuesto utilizado",
    value: "",
    footer: "Sin presupuesto configurado",
    footerIcon: IconChartBar,
    icon: IconChartBar,
    trend: null,
  },
];

//  View 
export function DashboardView() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      {/*  Page heading  */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Bienvenido, {user.fullName.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground">
          Aquí tienes un resumen de tus finanzas y proyectos.
        </p>
      </div>

      {/*  Status badges  */}
      <div className="flex flex-wrap gap-2">
        {user.isActive ? (
          <Badge
            variant="outline"
            className="gap-1.5 border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
          >
            <IconShieldCheck className="size-3.5" />
            Cuenta activa
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="gap-1.5 border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
          >
            <IconAlertCircle className="size-3.5" />
            Cuenta pendiente de activación
          </Badge>
        )}
        {user.isAdmin && (
          <Badge
            variant="outline"
            className="gap-1.5 border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400"
          >
            <IconUserShield className="size-3.5" />
            Administrador
          </Badge>
        )}
      </div>

      {/*  Summary cards  */}
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="@container/card">
            <CardHeader>
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {card.value}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <card.icon className="size-3.5" />
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                <card.footerIcon className="size-4" />
                {card.footer}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/*  Inactive warning  */}
      {!user.isActive && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-950/20">
          <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
            Acceso limitado
          </p>
          <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
            Un administrador debe activar tu cuenta para que puedas crear proyectos y registrar gastos.
          </p>
        </div>
      )}
    </div>
  );
}
