import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://crediexpress-auto.com' : 'http://localhost:3000'),
  title: 'Créditos Prendarios Inteligentes | Crediexpress Auto',
  description: 'Financiá tu auto o moto con las mejores condiciones del mercado. Tasas competitivas, aprobación rápida y transparencia total. +500 concesionarios aliados.',
  keywords: 'créditos prendarios, financiación auto, préstamos moto, créditos vehiculares, concesionarios Argentina',
  openGraph: {
    title: 'Créditos Prendarios Inteligentes | Crediexpress Auto',
    description: 'Financiá tu auto o moto con las mejores condiciones del mercado. Tasas competitivas, aprobación rápida y transparencia total.',
    type: 'website',
    locale: 'es_AR',
    siteName: 'Crediexpress Auto',
    images: [
      {
        url: '/crediexpress-logo.png',
        width: 400,
        height: 98,
        alt: 'Crediexpress Auto - Créditos Prendarios',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Créditos Prendarios Inteligentes | Crediexpress Auto',
    description: 'Financiá tu auto o moto con las mejores condiciones del mercado.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-AR" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}