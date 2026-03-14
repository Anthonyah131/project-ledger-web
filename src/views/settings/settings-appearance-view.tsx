"use client";

import { Laptop, Moon, Sun } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/context/theme-context";
import { cn } from "@/lib/utils";

const OPTIONS = [
  {
    value: "light" as const,
    title: "Claro",
    description: "Para espacios iluminados.",
    icon: Sun,
    preview: "bg-white border-gray-200",
    previewInner: "bg-gray-100",
  },
  {
    value: "dark" as const,
    title: "Oscuro",
    description: "Reduce fatiga visual.",
    icon: Moon,
    preview: "bg-zinc-900 border-zinc-700",
    previewInner: "bg-zinc-800",
  },
  {
    value: "system" as const,
    title: "Sistema",
    description: "Se adapta automáticamente.",
    icon: Laptop,
    preview: "bg-gradient-to-br from-white to-zinc-900 border-zinc-400",
    previewInner: "bg-gradient-to-br from-gray-100 to-zinc-800",
  },
];

export function SettingsAppearanceView() {
  const { theme, setTheme } = useTheme();

  return (
    <section>
      <div className="mb-1">
        <h2 className="text-base font-semibold">Apariencia</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Elige cómo se ve la aplicación en tu dispositivo.
        </p>
      </div>

      <Separator className="my-4" />

      <div className="grid gap-3 sm:grid-cols-3">
        {OPTIONS.map((option) => {
          const isSelected = option.value === theme;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              className={cn(
                "group flex flex-col overflow-hidden rounded-xl border-2 text-left transition-all",
                isSelected
                  ? "border-primary shadow-sm"
                  : "border-border hover:border-muted-foreground/30",
              )}
            >
              {/* Mini preview area */}
              <div
                className={cn(
                  "flex h-24 w-full items-end gap-2 border-b p-3",
                  option.preview,
                )}
              >
                <div className={cn("h-3 flex-1 rounded-sm", option.previewInner)} />
                <div className={cn("h-5 w-8 rounded-sm", option.previewInner)} />
                <div className={cn("h-4 w-6 rounded-sm", option.previewInner)} />
              </div>

              {/* Label */}
              <div className="flex items-center gap-2.5 px-3 py-3">
                <div
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-md",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  <option.icon className="size-3.5" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">{option.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
