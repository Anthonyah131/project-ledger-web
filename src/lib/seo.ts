import type { Metadata } from "next";

export const SITE_URL = "https://project-ledger-web.vercel.app";
export const SITE_NAME = "Project Ledger";
export const SITE_DESCRIPTION =
  "The all-in-one platform to manage projects, track budgets, and make strategic decisions powered by AI.";
export const DEFAULT_OG_IMAGE = "/og-image.png";

export function createMetadata({
  title,
  description = SITE_DESCRIPTION,
  ogImage = DEFAULT_OG_IMAGE,
  canonical,
  noIndex = false,
}: {
  title: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
}): Metadata {
  const url = canonical
    ? `${SITE_URL}${canonical}`
    : SITE_URL;

  return {
    title,
    description,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}
