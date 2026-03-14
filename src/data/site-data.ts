// src/data/site-data.ts
// ─── Single source of truth for all site-wide content ──────────────────────────
// Update this file to change branding, links, FAQs, and contact info globally.

// ─── Site Info ─────────────────────────────────────────────────────────────────

export const siteInfo = {
  name: "Project Ledger",
  tagline: "Gestiona tus proyectos con inteligencia",
  description:
    "La plataforma todo-en-uno para gestionar proyectos, rastrear presupuestos y tomar decisiones estratégicas con IA.",
  year: 2026,
  author: "Anthony",
  authorHandle: "anthonyah131",
  email: "anthonyah131@gmail.com",
  supportEmail: "anthonyah131@gmail.com",
};

// ─── Social Links ──────────────────────────────────────────────────────────────

export const socialLinks = [
  {
    id: "github",
    label: "GitHub",
    href: "https://github.com/anthonyah131",
    icon: "github",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/anthonyah131",
    icon: "linkedin",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/anthonyah131",
    icon: "instagram",
  },
  {
    id: "email",
    label: "Email",
    href: `mailto:anthonyah131@gmail.com`,
    icon: "mail",
  },
];

// ─── Footer Links ──────────────────────────────────────────────────────────────

export const footerLinks = [
  {
    group: "Producto",
    links: [
      { label: "Características", href: "/#features" },
      { label: "Precios", href: "/#pricing" },
      { label: "Cómo funciona", href: "/#how-it-works" },
      { label: "Ayuda / FAQ", href: "/help" },
    ],
  },
  {
    group: "Empresa",
    links: [
      { label: "Sobre el proyecto", href: "/#about" },
      { label: "GitHub del repo", href: "https://github.com/anthonyah131/project-ledger-web", newTab: true },
      { label: "Contacto", href: `mailto:anthonyah131@gmail.com` },
    ],
  },
  {
    group: "Legal",
    links: [
      { label: "Privacidad", href: "#" },
      { label: "Términos de uso", href: "#" },
      { label: "Seguridad", href: "#" },
    ],
  },
];

// ─── Contact Channels (for Help page quick-actions) ────────────────────────────

export const contactChannels = [
  {
    id: "gmail",
    label: "Enviar email",
    description: "Escríbenos directamente a nuestro correo de soporte.",
    href: `https://mail.google.com/mail/?view=cm&fs=1&to=anthonyah131@gmail.com&su=Soporte%20Project%20Ledger`,
    newTab: true,
    icon: "mail",
    cta: "Abrir Gmail",
  },
  {
    id: "github",
    label: "GitHub",
    description: "Reporta bugs o consulta el código fuente del proyecto.",
    href: "https://github.com/anthonyah131/project-ledger-web",
    newTab: true,
    icon: "github",
    cta: "Ver repositorio",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    description: "Conéctate conmigo en LinkedIn para hablar sobre el proyecto.",
    href: "https://www.linkedin.com/in/anthonyah131",
    newTab: true,
    icon: "linkedin",
    cta: "Ver perfil",
  },
  {
    id: "instagram",
    label: "Instagram",
    description: "Sígueme en Instagram para actualizaciones del proyecto.",
    href: "https://www.instagram.com/anthonyah131",
    newTab: true,
    icon: "instagram",
    cta: "Ver perfil",
  },
];

// ─── FAQ Categories ────────────────────────────────────────────────────────────

export const faqCategories = [
  {
    id: "general",
    category: "General",
    icon: "circle-help",
    faqs: [
      {
        question: "¿Qué es Project Ledger?",
        answer:
          "Project Ledger es una plataforma SaaS para gestionar proyectos, rastrear presupuestos e integrar asistencia con inteligencia artificial. Fue diseñada como proyecto de portafolio con funcionalidades de nivel producción.",
      },
      {
        question: "¿Es gratuito?",
        answer:
          "Sí, ofrecemos un plan Free permanente con hasta 2 proyectos y funcionalidades básicas. También tenemos planes Basic ($9.99/mes) y Premium ($19.99/mes) con límites más altos y funciones avanzadas.",
      },
      {
        question: "¿Necesito tarjeta de crédito para registrarme?",
        answer:
          "No. Puedes crear tu cuenta y usar el plan Free sin ingresar datos de pago. Solo se requiere tarjeta si decides suscribirte a un plan de pago.",
      },
      {
        question: "¿En qué tecnologías está construido?",
        answer:
          "El frontend usa Next.js 15, React 19, Tailwind CSS y shadcn/ui. El backend usa Node.js con Express, Supabase (PostgreSQL) para la base de datos y n8n para la automatización con IA.",
      },
    ],
  },
  {
    id: "projects",
    category: "Proyectos",
    icon: "folder",
    faqs: [
      {
        question: "¿Cómo creo un proyecto?",
        answer:
          'Ve a la sección "Proyectos" en el menú lateral y haz clic en "Nuevo proyecto". Completa el nombre, descripción, presupuesto y moneda, y tu proyecto estará listo.',
      },
      {
        question: "¿Puedo invitar a otros miembros a mis proyectos?",
        answer:
          "Sí, desde el detalle de un proyecto puedes agregar miembros por email. Dependiendo de tu plan, puedes tener hasta 5 miembros (Basic) o ilimitados (Premium).",
      },
      {
        question: "¿Qué tipos de gastos puedo registrar?",
        answer:
          "Puedes registrar cualquier gasto asociado al proyecto: materiales, servicios, honorarios, etc. Cada gasto lleva fecha, monto, categoría, método de pago y descripción opcional.",
      },
      {
        question: "¿Puedo usar múltiples monedas?",
        answer:
          "Sí. El plan Free soporta hasta 3 divisas, mientras que los planes de pago permiten multi-moneda sin restricciones.",
      },
    ],
  },
  {
    id: "billing",
    category: "Facturación",
    icon: "credit-card",
    faqs: [
      {
        question: "¿Cómo cambio mi plan?",
        answer:
          'Ve a "Configuración" → "Facturación" y selecciona el plan deseado. El cambio se aplica inmediatamente y se prorratea al ciclo de facturación actual.',
      },
      {
        question: "¿Puedo cancelar en cualquier momento?",
        answer:
          "Sí, puedes cancelar tu suscripción cuando quieras. Seguirás teniendo acceso a las funciones de tu plan hasta el final del período pagado.",
      },
      {
        question: "¿Qué métodos de pago aceptan?",
        answer:
          "Actualmente el módulo de pagos es una simulación para el portafolio. En una versión de producción real se integraría Stripe o PayPal.",
      },
    ],
  },
  {
    id: "security",
    category: "Seguridad y privacidad",
    icon: "shield-check",
    faqs: [
      {
        question: "¿Mis datos están seguros?",
        answer:
          "Todos los datos se almacenan en Supabase con cifrado en tránsito (HTTPS/TLS) y en reposo. No compartimos tus datos con terceros.",
      },
      {
        question: "¿Cómo funciona la autenticación?",
        answer:
          "Usamos JWT con tokens de acceso y refresco gestionados por Supabase Auth. Las sesiones expiran y se rotan automáticamente.",
      },
      {
        question: "¿Puedo eliminar mi cuenta?",
        answer:
          "Sí. Desde Configuración puedes solicitar la eliminación de tu cuenta y todos tus datos asociados de forma permanente.",
      },
    ],
  },
  {
    id: "ai",
    category: "Asistente IA",
    icon: "sparkles",
    faqs: [
      {
        question: "¿Cómo funciona el asistente de IA?",
        answer:
          "El asistente está integrado mediante n8n y se conecta a modelos de lenguaje como GPT. Puedes hacerle preguntas sobre tus proyectos, pedir análisis financieros o consultar el historial.",
      },
      {
        question: "¿El asistente tiene acceso a mis datos?",
        answer:
          "El asistente solo accede a los datos del proyecto activo en tu sesión. Nunca comparte información entre usuarios.",
      },
    ],
  },
];
