import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { CookieConsent } from "@/components/CookieConsent";

export const metadata: Metadata = {
  title: "ZECB | Build SaaS in 72 Hours",
  description:
    "Deploy fully-functional, scalable SaaS businesses using our pre-architected engine. No recruiters, no management, just code-driven growth.",
  metadataBase: new URL("https://zecb.app"),
  openGraph: {
    title: "ZECB — Zero-Employee Company Builder",
    description: "Build profitable SaaS products in 72 hours. Automated pipeline, real customers, zero employees.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZECB — Build SaaS in 72 Hours",
    description: "Automated SaaS builder. From idea to live product with paying customers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <meta name="theme-color" content="#0f172a" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="bg-white font-sans text-slate-900 antialiased">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
