import type { Metadata } from "next";
import { CTA } from "@/components/landing/cta";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingMotionBootstrap } from "@/components/landing/landing-motion-bootstrap";
import { Navbar } from "@/components/landing/navbar";
import { Pricing } from "@/components/landing/pricing";
import { Stats } from "@/components/landing/stats";

export const metadata: Metadata = {
  title: "Project Ledger — Manage Your Projects with Intelligence",
  description:
    "The all-in-one platform to manage projects, track budgets, and make strategic decisions powered by AI.",
  alternates: {
    canonical: "https://project-ledger-web.vercel.app",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Project Ledger",
  url: "https://project-ledger-web.vercel.app",
  logo: "https://project-ledger-web.vercel.app/og-image.jpeg",
  description:
    "The all-in-one platform to manage projects, track budgets, and make strategic decisions powered by AI.",
  sameAs: [
    "https://github.com/anthonyah131",
    "https://www.linkedin.com/in/anthonyah-webdev/",
    "https://www.instagram.com/anthah_131/",
  ],
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background" data-lm-page="landing">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main>
        <LandingMotionBootstrap />
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
