import {
  BarChart3,
  Bot,
  CreditCard,
  FileSearch,
  LayoutDashboard,
  MessageSquare,
  Receipt,
  Users,
} from "lucide-react";

// ─── Features ──────────────────────────────────────────────────────────────────

export const features = [
  {
    icon: LayoutDashboard,
    title: "Dashboard por proyecto",
    description:
      "Centraliza gastos, ingresos y presupuesto de cada proyecto en un panel claro. Ve el estado financiero en tiempo real sin abrir hojas de cálculo.",
  },
  {
    icon: CreditCard,
    title: "Métodos de pago con multi-moneda",
    description:
      "Registra desde qué cuenta o tarjeta sale o entra cada peso. Soporte multi-moneda con conversión automática a la moneda del proyecto.",
  },
  {
    icon: FileSearch,
    title: "OCR con IA — captura automática",
    description:
      "Fotografía un recibo o factura y la IA extrae título, monto, fecha, número de referencia y más. Revisa y guarda en segundos.",
  },
  {
    icon: Users,
    title: "Proyectos compartidos en equipo",
    description:
      "Invita colaboradores con permisos de lectura o edición. Todos trabajan sobre los mismos datos en tiempo real, sin conflictos.",
  },
  {
    icon: BarChart3,
    title: "Reportes y análisis",
    description:
      "Genera reportes de gastos e ingresos por categoría, método de pago, rango de fechas y más. Exporta y comparte con un clic.",
  },
  {
    icon: Bot,
    title: "Chatbot IA sobre tus datos",
    description:
      "Pregúntale al asistente de IA (Aria) sobre tus proyectos y métodos de pago. Disponible exclusivamente en el plan Premium.",
  },
  {
    icon: Receipt,
    title: "Gastos e ingresos por categoría",
    description:
      "Organiza cada movimiento con categorías personalizadas por proyecto. Mantén claridad contable sin complicaciones.",
  },
  {
    icon: MessageSquare,
    title: "Historial completo y trazable",
    description:
      "Nunca pierdas un registro. Cada gasto, ingreso y cambio queda guardado con fecha, responsable y referencia de comprobante.",
  },
];

// ─── Steps ─────────────────────────────────────────────────────────────────────

export const steps = [
  {
    number: "01",
    title: "Crea tu cuenta gratis",
    description:
      "Regístrate en segundos. Sin tarjeta de crédito. El plan Free te da acceso inmediato a 2 proyectos y funciones esenciales.",
  },
  {
    number: "02",
    title: "Configura tu proyecto",
    description:
      "Crea un proyecto, define su moneda, tus métodos de pago y categorías. Invita a tu equipo si trabajas en colaboración.",
  },
  {
    number: "03",
    title: "Registra con IA o manualmente",
    description:
      "Sube una foto del recibo para que la IA llene el formulario, o ingrésalo a mano. Cada movimiento queda organizado al instante.",
  },
  {
    number: "04",
    title: "Analiza y decide mejor",
    description:
      "Consulta reportes, haz preguntas al chatbot IA sobre tu flujo de caja y toma decisiones basadas en datos reales.",
  },
];

// ─── Stats ─────────────────────────────────────────────────────────────────────

export const stats = [
  { value: "3 planes", label: "Free, Basic y Premium" },
  { value: "< 30 s", label: "Para registrar un gasto con IA" },
  { value: "Multi-moneda", label: "Conversión automática" },
  { value: "100%", label: "Control de tu flujo de caja" },
];

// ─── Plans ─────────────────────────────────────────────────────────────────────
// Datos sincronizados con la base de datos — ref: 2026-03-14

export const plans = [
  {
    name: "Free",
    price: "$0",
    period: "para siempre",
    description: "Para uso personal básico, sin costo ni tarjeta.",
    features: [
      "2 proyectos",
      "30 gastos · 10 ingresos/mes",
      "2 métodos de pago",
      "5 categorías por proyecto",
      "3 divisas alternativas",
      "Sin OCR · Sin colaboradores",
    ],
    cta: "Empezar gratis",
    highlighted: false,
  },
  {
    name: "Basic",
    price: "$9.99",
    period: "por mes",
    description: "Para freelancers y equipos pequeños que necesitan más.",
    features: [
      "10 proyectos",
      "200 gastos · 100 ingresos/mes",
      "10 métodos de pago",
      "20 categorías por proyecto",
      "10 divisas alternativas",
      "10 lecturas OCR/mes · 5 miembros por proyecto",
    ],
    cta: "Suscribirse",
    highlighted: true,
  },
  {
    name: "Premium",
    price: "$19.99",
    period: "por mes",
    description: "Sin límites prácticos. Para equipos que escalan.",
    features: [
      "Proyectos ilimitados",
      "Gastos e ingresos ilimitados",
      "Métodos de pago ilimitados",
      "Categorías ilimitadas",
      "OCR ilimitado con IA",
      "Colaboradores ilimitados",
    ],
    cta: "Suscribirse",
    highlighted: false,
  },
];
