"use client";

// src/components/shared/app-footer.tsx
// Reusable footer component driven entirely by site-data.ts

import Link from "next/link";
import { FileText, Github, Instagram, Linkedin, Lock, Mail } from "lucide-react";
import { siteInfo, socialLinks, footerLinks } from "@/data/site-data";

const SOCIAL_ICONS: Record<string, React.ElementType> = {
  github: Github,
  linkedin: Linkedin,
  instagram: Instagram,
  mail: Mail,
};

export function AppFooter() {
  return (
    <footer className="border-t border-border bg-background px-6 py-12 mt-auto">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
          {/* Brand */}
          <div className="min-w-[200px]">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm shadow-primary/30">
                <FileText className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-semibold">{siteInfo.name}</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              {siteInfo.description}
            </p>

            {/* Social Links */}
            <div className="mt-4 flex gap-4">
              {socialLinks.map((s) => {
                const Icon = SOCIAL_ICONS[s.icon] ?? Mail;
                return (
                  <a
                    key={s.id}
                    href={s.href}
                    target={s.href.startsWith("mailto") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Footer Link Groups */}
          <div className={`grid gap-8 grid-cols-${footerLinks.length} sm:grid-cols-${footerLinks.length}`}
            style={{ gridTemplateColumns: `repeat(${footerLinks.length}, minmax(120px, 1fr))` }}
          >
            {footerLinks.map((group) => (
              <div key={group.group}>
                <p className="mb-3 text-sm font-semibold text-foreground">
                  {group.group}
                </p>
                <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith("http") || link.href.startsWith("mailto") ? (
                        <a
                          href={link.href}
                          target={(link as { newTab?: boolean }).newTab ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          className="transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {siteInfo.year} {siteInfo.name}. Hecho por{" "}
            <a
              href={`https://github.com/${siteInfo.authorHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors underline underline-offset-2"
            >
              {siteInfo.author}
            </a>
            .
          </p>
          <div className="flex items-center gap-1.5">
            <Lock className="h-3 w-3" />
            <span>Datos encriptados y seguros</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
