import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? (process.env.NODE_ENV === 'production' ? 'https://crediexpress-auto.com' : 'http://localhost:3000')),
  title: 'Tu Crédito Prendario Fácil y Rápido | Crediexpress Auto',
  description: 'Tu próximo auto, hoy. Accedé a créditos prendarios simples y transparentes. Rapidez en la aprobación, tasas competitivas y respaldo total.',
  keywords: 'crédito prendario fácil, financiación rápida auto, préstamos simples moto, créditos transparentes, financiación vehicular Argentina',
  openGraph: {
    title: 'Tu Crédito Prendario Fácil y Rápido | Crediexpress Auto',
    description: 'Tu próximo auto, hoy. Accedé a créditos prendarios simples y transparentes con rapidez en la aprobación.',
    type: 'website',
    locale: 'es_AR',
    siteName: 'Crediexpress Auto',
    images: [
      {
        url: '/close-up-car-with-man-woman.jpg',
        width: 1200,
        height: 800,
        alt: 'Crediexpress Auto - Tu crédito prendario fácil y rápido',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tu Crédito Prendario Fácil y Rápido | Crediexpress Auto',
    description: 'Tu próximo auto, hoy. Créditos prendarios simples y transparentes.',
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
    <html lang="es-AR" className="scroll-smooth" suppressHydrationWarning>
      <body className="font-dm-sans">{children}</body>
    </html>
  );
}