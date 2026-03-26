// src/app/(dashboard)/help/page.tsx

import { Metadata } from "next";
import { HelpPageClient } from "@/views/help/help-page-client";

export const metadata: Metadata = {
  title: "Help & FAQ — Project Ledger",
  description:
    "Frequently asked questions, contact channels, and support for Project Ledger.",
};

export default function HelpPage() {
  return <HelpPageClient />;
}
