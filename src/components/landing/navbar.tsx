"use client";

import { useEffect, useState } from "react";
import { ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/language-context";

export function Navbar() {
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md transition-[border-color,background-color,box-shadow] duration-300 ${
        isScrolled
          ? "border-border bg-background/95 shadow-sm shadow-black/10"
          : "border-border/50 bg-background/80"
      }`}
      data-lm-section="navbar"
      data-lm-reveal="shell"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <FileText className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            {t("nav.brand")}
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link href="#features" className="transition-colors hover:text-foreground">
            {t("nav.features")}
          </Link>
          <Link href="#how-it-works" className="transition-colors hover:text-foreground">
            {t("nav.howItWorks")}
          </Link>
          <Link href="#pricing" className="transition-colors hover:text-foreground">
            {t("nav.pricing")}
          </Link>
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:block"
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
      </div>
    </header>
  );
}
