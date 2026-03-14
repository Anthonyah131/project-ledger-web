import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/context/theme-context";
import N8nChat from "@/components/shared/n8n-chat";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project Ledger — Gestiona tus proyectos con inteligencia",
  description:
    "La plataforma todo-en-uno para gestionar proyectos, rastrear presupuestos y tomar decisiones estratégicas con IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster position="bottom-right" richColors closeButton />
            <N8nChat />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
