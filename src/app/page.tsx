import {
  BarChart3,
  CheckCircle2,
  ChevronRight,
  FileText,
  Github,
  Globe,
  LayoutDashboard,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingUp,
  Twitter,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

// ─── Data ──────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: LayoutDashboard,
    title: "Dashboard centralizado",
    description:
      "Visualiza el estado de todos tus proyectos en tiempo real desde un único panel intuitivo.",
  },
  {
    icon: BarChart3,
    title: "Seguimiento financiero",
    description:
      "Registra ingresos, gastos y presupuestos por proyecto con reportes automáticos.",
  },
  {
    icon: Sparkles,
    title: "Asistencia con IA",
    description:
      "Envía prompts a modelos de IA directamente desde la plataforma para análisis y decisiones.",
  },
  {
    icon: Timer,
    title: "Historial completo",
    description:
      "Accede al registro detallado de todas las actividades y consultas realizadas en cada proyecto.",
  },
  {
    icon: Users,
    title: "Colaboración en equipo",
    description:
      "Invita a tu equipo, asigna roles y trabaja de forma sincronizada sin fricciones.",
  },
  {
    icon: ShieldCheck,
    title: "Seguridad empresarial",
    description:
      "Autenticación robusta, datos cifrados y control de acceso granular para tu tranquilidad.",
  },
];

const steps = [
  {
    number: "01",
    title: "Crea tu cuenta",
    description:
      "Regístrate en segundos. Sin tarjeta de crédito requerida para empezar.",
  },
  {
    number: "02",
    title: "Configura tus proyectos",
    description:
      "Crea proyectos, define presupuestos y agrega a los miembros de tu equipo.",
  },
  {
    number: "03",
    title: "Toma mejores decisiones",
    description:
      "Usa el dashboard e IA integrada para analizar datos y optimizar resultados.",
  },
];

const stats = [
  { value: "10K+", label: "Proyectos gestionados" },
  { value: "98%", label: "Satisfacción de clientes" },
  { value: "3x", label: "Más productividad" },
  { value: "< 2min", label: "Tiempo de configuración" },
];

const plans = [
  {
    name: "Gratis",
    price: "$0",
    period: "para siempre",
    description: "Perfecto para empezar y proyectos personales.",
    features: [
      "Hasta 3 proyectos",
      "Dashboard básico",
      "1 usuario",
      "Historial 30 días",
    ],
    cta: "Empezar gratis",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "por mes",
    description: "Para equipos que necesitan más potencia y control.",
    features: [
      "Proyectos ilimitados",
      "Dashboard avanzado",
      "Hasta 10 usuarios",
      "Historial ilimitado",
      "Asistencia IA incluida",
      "Reportes exportables",
    ],
    cta: "Empezar prueba gratuita",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contactar ventas",
    description: "Soluciones a medida para grandes organizaciones.",
    features: [
      "Todo lo de Pro",
      "Usuarios ilimitados",
      "SSO / SAML",
      "SLA garantizado",
      "Onboarding dedicado",
      "Soporte prioritario 24/7",
    ],
    cta: "Contactar ventas",
    highlighted: false,
  },
];

// ─── Components ────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <FileText className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Project Ledger
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link href="#features" className="transition-colors hover:text-foreground">
            Características
          </Link>
          <Link href="#how-it-works" className="transition-colors hover:text-foreground">
            Cómo funciona
          </Link>
          <Link href="#pricing" className="transition-colors hover:text-foreground">
            Precios
          </Link>
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:block"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-md shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-primary/40"
          >
            Comenzar gratis
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="flex flex-col items-center px-6 pb-24 pt-40 text-center">
      {/* Badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary">
        <Zap className="h-3 w-3" />
        Ahora con asistencia de IA integrada
      </div>

      {/* Headline */}
      <h1 className="mx-auto max-w-4xl text-balance text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
        Gestiona proyectos{" "}
        <span className="relative inline-block">
          <span className="relative z-10 text-primary">con precisión</span>
          <span className="absolute inset-x-0 bottom-1 z-0 h-3 bg-primary/15 transform-[skewX(-3deg)]" />
        </span>{" "}
        y sin caos
      </h1>

      {/* Subheadline */}
      <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground">
        Project Ledger centraliza tus proyectos, presupuestos y equipo en una
        sola plataforma. Toma decisiones más inteligentes con datos en tiempo
        real e inteligencia artificial.
      </p>

      {/* CTAs */}
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/register"
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-primary/50"
        >
          Empezar gratis — sin tarjeta
          <ChevronRight className="h-4 w-4" />
        </Link>
        <Link
          href="#how-it-works"
          className="inline-flex h-12 items-center gap-2 rounded-xl border border-border px-8 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          Ver cómo funciona
        </Link>
      </div>

      {/* Social proof */}
      <p className="mt-8 text-xs text-muted-foreground">
        Usado por más de{" "}
        <span className="font-semibold text-primary">2,000+ equipos</span>{" "}
        en Latinoamérica
      </p>

      {/* Mock dashboard */}
      <div className="relative mt-20 w-full max-w-5xl">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/20">
          {/* Window chrome */}
          <div className="flex h-10 items-center gap-2 border-b border-border bg-muted px-4">
            <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
            <div className="ml-4 h-5 w-64 rounded-md bg-border" />
          </div>

          {/* Dashboard mock */}
          <div className="flex h-80 gap-0">
            {/* Sidebar mock */}
            <div className="hidden w-52 flex-col gap-1.5 border-r border-border bg-sidebar p-4 sm:flex">
              {["Dashboard", "Proyectos", "Presupuesto", "Historial", "Configuración"].map(
                (item, i) => (
                  <div
                    key={item}
                    className={`h-8 rounded-md px-3 flex items-center text-xs font-medium ${
                      i === 0
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                        : "text-muted-foreground hover:bg-border"
                    }`}
                  >
                    {item}
                  </div>
                )
              )}
            </div>

            {/* Main content mock */}
            <div className="flex flex-1 flex-col gap-4 p-6">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Proyectos activos", val: "12", highlight: false },
                  { label: "Presupuesto total", val: "$48,200", highlight: true },
                  { label: "Tareas completadas", val: "87%", highlight: false },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`rounded-lg border p-3 ${s.highlight ? "border-primary/30 bg-primary/10" : "border-border bg-background"}`}
                  >
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    <p className={`mt-1 text-lg font-bold ${s.highlight ? "text-primary" : "text-foreground"}`}>{s.val}</p>
                  </div>
                ))}
              </div>

              {/* Chart mock */}
              <div className="flex-1 rounded-lg border border-border bg-background p-4">
                <div className="mb-3 text-xs font-medium text-muted-foreground">
                  Actividad mensual
                </div>
                <div className="flex h-24 items-end gap-1.5">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map(
                    (h, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-t transition-all ${i === 9 || i === 5 ? "bg-primary/70" : "bg-primary/20"}`}
                        style={{ height: `${h}%` }}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute inset-x-10 -bottom-4 -z-10 h-24 rounded-full bg-primary/10 blur-2xl" />
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-bold tracking-tight text-primary">
                {s.value}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="px-6 py-28">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            Características
          </p>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground">
            Todo lo que necesitas en un solo lugar
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Construido para equipos modernos que quieren claridad, velocidad y
            control total sobre sus proyectos.
          </p>
        </div>

        {/* Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-colors group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md group-hover:shadow-primary/30">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground group-hover:text-primary transition-colors">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-muted/30 px-6 py-28">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            Cómo funciona
          </p>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground">
            En marcha en menos de 5 minutos
          </h2>
        </div>

        {/* Steps */}
        <div className="relative mt-16 grid gap-8 lg:grid-cols-3">
          {/* Connector line */}
          <div className="absolute left-0 right-0 top-12 hidden h-px bg-border lg:block" />

          {steps.map(({ number, title, description }) => (
            <div key={number} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 mb-6 flex h-24 w-24 flex-col items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 shadow-md shadow-primary/10">
                <span className="text-2xl font-bold text-primary">{number}</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="px-6 py-28">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            Precios
          </p>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground">
            Planes para cada etapa
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Empieza gratis y escala cuando lo necesites. Sin sorpresas.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-8 transition-all ${
                plan.highlighted
                  ? "border-primary bg-primary/10 shadow-xl shadow-primary/20"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/40">
                    Más popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p className={`text-sm font-semibold ${plan.highlighted ? "text-primary" : "text-muted-foreground"}`}>
                  {plan.name}
                </p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className={`text-4xl font-bold ${plan.highlighted ? "text-foreground" : "text-foreground"}`}>{plan.price}</span>
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <ul className="mb-8 flex flex-1 flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <CheckCircle2 className={`h-4 w-4 shrink-0 ${plan.highlighted ? "text-primary" : "text-muted-foreground"}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`inline-flex h-11 items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 hover:bg-primary/90"
                    : "border border-border bg-muted text-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="px-6 py-20">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-primary/30 bg-primary/10 px-8 py-16 text-center">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        </div>
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary ring-1 ring-primary/30">
          <TrendingUp className="h-6 w-6" />
        </div>
        <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground">
          Empieza a gestionar mejor hoy
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Únete a miles de equipos que ya toman decisiones más inteligentes con
          Project Ledger.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-primary/50"
          >
            Crear cuenta gratis
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 items-center px-8 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            Ya tengo cuenta →
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
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

// ─── Page ──────────────────────────────────────────────────────────────────────

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
