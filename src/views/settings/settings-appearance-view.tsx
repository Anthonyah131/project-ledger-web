"use client";

import { Check, Laptop, Moon, Sun } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/context/theme-context";
import { cn } from "@/lib/utils";

const OPTIONS = [
  {
    value: "light" as const,
    title: "Claro",
    description: "Interfaz clara para espacios iluminados.",
    icon: Sun,
  },
  {
    value: "dark" as const,
    title: "Oscuro",
    description: "Interfaz oscura para reducir fatiga visual.",
    icon: Moon,
  },
  {
    value: "system" as const,
    title: "Sistema",
    description: "Se adapta automaticamente a tu sistema operativo.",
    icon: Laptop,
  },
];

export function SettingsAppearanceView() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apariencia</CardTitle>
        <CardDescription>Elige como se ve la aplicacion en tu dispositivo.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>Tema actual:</span>
          <Badge variant="outline" className="capitalize">
            {theme}
          </Badge>
          <span>Resuelto:</span>
          <Badge variant="outline" className="capitalize">
            {resolvedTheme}
          </Badge>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {OPTIONS.map((option) => {
            const isSelected = option.value === theme;

            return (
              <Button
                key={option.value}
                type="button"
                variant={isSelected ? "default" : "outline"}
                onClick={() => setTheme(option.value)}
                className={cn("h-auto items-start justify-start p-4 text-left")}
              >
                <span className="flex w-full items-start gap-3">
                  <option.icon className="mt-0.5 size-4 shrink-0" />
                  <span className="flex flex-1 flex-col gap-1">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      {option.title}
                      {isSelected && <Check className="size-4" />}
                    </span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </span>
                </span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
