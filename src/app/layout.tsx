import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/context/theme-context";
import { LanguageProvider } from "@/context/language-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://project-ledger-web.vercel.app"),
  title: {
    default: "Project Ledger — Manage Your Projects with Intelligence",
    template: "%s | Project Ledger",
  },
  description:
    "The all-in-one platform to manage projects, track budgets, and make strategic decisions powered by AI.",
  authors: [{ name: "Project Ledger", url: "https://project-ledger-web.vercel.app" }],
  openGraph: {
    type: "website",
    siteName: "Project Ledger",
    url: "https://project-ledger-web.vercel.app",
    title: "Project Ledger — Manage Your Projects with Intelligence",
    description:
      "The all-in-one platform to manage projects, track budgets, and make strategic decisions powered by AI.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Project Ledger",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Project Ledger — Manage Your Projects with Intelligence",
    description:
      "The all-in-one platform to manage projects, track budgets, and make strategic decisions powered by AI.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://project-ledger-web.vercel.app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
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
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              {children}
              <Toaster position="bottom-right" richColors closeButton />
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
