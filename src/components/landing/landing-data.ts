import {
  BarChart3,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Timer,
  Users,
} from "lucide-react";

// ─── Features ──────────────────────────────────────────────────────────────────

export const features = [
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

// ─── Steps ─────────────────────────────────────────────────────────────────────

export const steps = [
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

// ─── Stats ─────────────────────────────────────────────────────────────────────

export const stats = [
  { value: "10K+", label: "Proyectos gestionados" },
  { value: "98%", label: "Satisfacción de clientes" },
  { value: "3x", label: "Más productividad" },
  { value: "< 2min", label: "Tiempo de configuración" },
];

// ─── Plans ─────────────────────────────────────────────────────────────────────

export const plans = [
  {
    name: "Free",
    price: "$0",
    period: "para siempre",
    description: "Para uso personal básico sin costo.",
    features: [
      "Hasta 2 proyectos",
      "Hasta 30 gastos",
      "Hasta 5 categorías",
      "2 métodos de pago",
      "Multi-moneda (3 divisas)",
    ],
    cta: "Empezar gratis",
    highlighted: false,
  },
  {
    name: "Basic",
    price: "$9.99",
    period: "por mes",
    description: "Para freelancers y equipos pequeños.",
    features: [
      "Hasta 10 proyectos",
      "Hasta 200 gastos",
      "Hasta 20 categorías",
      "Hasta 5 miembros por proyecto",
      "Lectura OCR de documentos",
      "Exportación de datos",
    ],
    cta: "Suscribirse",
    highlighted: true,
  },
  {
    name: "Premium",
    price: "$19.99",
    period: "por mes",
    description: "Funciones avanzadas sin límites prácticos.",
    features: [
      "Proyectos ilimitados",
      "Gastos ilimitados",
      "Miembros ilimitados",
      "Reportes avanzados",
      "OCR ilimitado",
      "Acceso a API",
    ],
    cta: "Suscribirse",
    highlighted: false,
  },
];
