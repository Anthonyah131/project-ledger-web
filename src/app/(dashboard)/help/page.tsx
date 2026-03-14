// src/app/(dashboard)/help/page.tsx

import { Metadata } from "next";
import { HelpPageClient } from "@/views/help/help-page-client";

export const metadata: Metadata = {
  title: "Ayuda y FAQ — Project Ledger",
  description:
    "Preguntas frecuentes, canales de contacto y soporte para Project Ledger.",
};

export default function HelpPage() {
  return <HelpPageClient />;
}
