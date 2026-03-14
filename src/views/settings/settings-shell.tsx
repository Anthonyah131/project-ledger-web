"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Palette, Shield, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const SECTIONS = [
  {
    title: "Perfil",
    href: "/settings/profile",
    icon: UserRound,
  },
  {
    title: "Apariencia",
    href: "/settings/appearance",
    icon: Palette,
  },
  {
    title: "Seguridad",
    href: "/settings/security",
    icon: Shield,
  },
  {
    title: "Facturación",
    href: "/settings/billing",
    icon: CreditCard,
  },
] as const;

export function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Administra perfil, apariencia, seguridad y facturación desde un solo lugar.
        </p>
      </div>

      <Separator className="mb-6" />

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar */}
        <aside className="shrink-0 md:w-52">
          <nav className="flex flex-col" aria-label="Secciones de configuración">
            {SECTIONS.map((section) => {
              const isActive =
                pathname === section.href || pathname.startsWith(`${section.href}/`);

              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className={cn(
                    "group relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1 h-[calc(100%-8px)] w-0.5 rounded-full bg-primary" />
                  )}
                  <section.icon className="size-4 shrink-0" />
                  {section.title}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-8">{children}</div>
      </div>
    </div>
  );
}
