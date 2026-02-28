import {
  CTA,
  Features,
  Footer,
  Hero,
  HowItWorks,
  Navbar,
  Pricing,
  Stats,
} from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
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
