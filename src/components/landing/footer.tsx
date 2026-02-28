import { FileText, Github, Globe, Lock, Mail, Twitter } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm shadow-primary/30">
                <FileText className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-semibold">Project Ledger</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              La plataforma para gestionar proyectos con precisión e inteligencia.
            </p>
            <div className="mt-4 flex gap-4">
              <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                <Github className="h-4 w-4" />
              </a>
              <a href="mailto:hello@projectledger.com" className="text-muted-foreground transition-colors hover:text-foreground">
                <Mail className="h-4 w-4" />
              </a>
              <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="mb-3 text-sm font-semibold text-foreground">Producto</p>
              <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                {["Características", "Precios", "Changelog", "Roadmap"].map((l) => (
                  <li key={l}>
                    <a href="#" className="transition-colors hover:text-foreground">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold text-foreground">Empresa</p>
              <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                {["Sobre nosotros", "Blog", "Clientes", "Contacto"].map((l) => (
                  <li key={l}>
                    <a href="#" className="transition-colors hover:text-foreground">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold text-foreground">Legal</p>
              <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                {["Privacidad", "Términos", "Seguridad", "Cookies"].map((l) => (
                  <li key={l}>
                    <a href="#" className="transition-colors hover:text-foreground">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 Project Ledger. Todos los derechos reservados.</p>
          <div className="flex items-center gap-1.5">
            <Lock className="h-3 w-3" />
            <span>Datos encriptados y seguros</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
