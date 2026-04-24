"use client";

import { useEffect, useState } from "react";
import { ChevronRight, FileText, Globe, Menu, X } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/language-context";
import { setLanguage } from "@/lib/api-client";

const NAV_LINKS = [
  { href: "#features", key: "nav.features" },
  { href: "#how-it-works", key: "nav.howItWorks" },
  { href: "#pricing", key: "nav.pricing" },
];

export function Navbar() {
  const { t, locale, setLocale } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 bg-background/60 backdrop-blur-md"
        data-lm-section="navbar"
        data-lm-reveal="shell"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <FileText className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              {t("nav.brand")}
            </span>
          </Link>

          {/* Desktop Nav links */}
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
                {t(link.key)}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={() => {
                const next = locale === "es" ? "en" : "es";
                setLocale(next);
                setLanguage(next);
              }}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Change language"
            >
              <Globe className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">{locale}</span>
            </button>
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("nav.login")}
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-md shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-primary/40"
            >
              {t("nav.startFree")}
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground md:hidden"
            aria-label={t("nav.openMenu")}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-[60] md:hidden ${
          isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={handleNavClick}
        />
        <div
          className={`absolute inset-y-0 right-0 flex w-72 max-w-[85vw] flex-col bg-background shadow-xl transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center justify-end px-4">
            <button
              type="button"
              onClick={handleNavClick}
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
              aria-label={t("nav.closeMenu")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 px-4 pb-6">
            <button
              type="button"
              onClick={() => {
                const next = locale === "es" ? "en" : "es";
                setLocale(next);
                setLanguage(next);
                handleNavClick();
              }}
              className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Globe className="h-4 w-4" />
              <span className="font-medium uppercase">{locale}</span>
              <span className="text-xs text-muted-foreground">({locale === "es" ? "English" : "Español"})</span>
            </button>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-3 px-4 pb-8">
            <Link
              href="/login"
              onClick={handleNavClick}
              className="flex h-11 items-center justify-center rounded-xl border border-border text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              {t("nav.login")}
            </Link>
            <Link
              href="/register"
              onClick={handleNavClick}
              className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 transition-all hover:bg-primary/90"
            >
              {t("nav.startFree")}
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
