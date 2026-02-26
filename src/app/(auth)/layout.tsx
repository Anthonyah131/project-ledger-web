import { FileText } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — form content */}
      <div className="flex flex-col">
        {/* Logo */}
        <div className="p-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
              <FileText className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Project Ledger
            </span>
          </Link>
        </div>

        {/* Centered content */}
        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>

      {/* Right — decorative panel */}
      <div className="relative hidden bg-foreground lg:block">
        <div className="flex h-full flex-col items-center justify-center px-12 text-background">
          {/* Decorative quote / value prop */}
          <blockquote className="max-w-md space-y-4">
            <p className="text-xl font-medium leading-relaxed">
              &ldquo;Project Ledger nos permitió tener visibilidad total de
              nuestros proyectos y reducir costos operativos en un 35%.&rdquo;
            </p>
            <footer className="text-sm text-background/60">
              <p className="font-semibold text-background/80">María González</p>
              <p>Directora de Operaciones, TechCorp</p>
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
