"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Palette, Shield, UserRound } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    title: "Perfil",
    description: "Nombre, email y avatar",
    href: "/settings/profile",
    icon: UserRound,
  },
  {
    title: "Apariencia",
    description: "Tema claro, oscuro o sistema",
    href: "/settings/appearance",
    icon: Palette,
  },
  {
    title: "Seguridad",
    description: "Contrasena y sesion",
    href: "/settings/security",
    icon: Shield,
  },
  {
    title: "Facturacion",
    description: "Planes y suscripcion",
    href: "/settings/billing",
    icon: CreditCard,
  },
] as const;

export function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuracion</h1>
        <p className="text-sm text-muted-foreground">
          Administra perfil, apariencia, seguridad y facturacion desde un solo lugar.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <Card className="h-fit py-4">
          <CardContent className="px-3">
            <nav className="flex flex-col gap-1" aria-label="Secciones de configuracion">
              {SECTIONS.map((section) => {
                const isActive = pathname === section.href || pathname.startsWith(`${section.href}/`);

                return (
                  <Link
                    key={section.href}
                    href={section.href}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border border-transparent px-3 py-2 transition-colors",
                      isActive
                        ? "border-border bg-accent text-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    )}
                  >
                    <section.icon className="mt-0.5 size-4 shrink-0" />
                    <span className="flex flex-col">
                      <span className="text-sm font-medium">{section.title}</span>
                      <span className="text-xs text-muted-foreground">{section.description}</span>
                    </span>
                  </Link>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}
