// BACKUP DE LA PÁGINA ORIGINAL ANTES DE MIGRACIÓN - 2025-01-07
// Este archivo contiene la landing page original completa// BACKUP COMPLETO DE LA PÁGINA ORIGINAL ANTES DE MIGRACIÓN - 2025-01-07
// Este archivo contiene la landing page original completa

import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button"
import { CheckCircle, Star, Zap, Shield, Building, FileText, Users, Calculator, Car, Bike, LogIn } from "lucide-react"
import logoCrediexpress from "../../public/crediexpress-logo.png";
import { LoginModal } from "@/components/LoginModal";

export const metadata: Metadata = {
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