import Image from "next/image";
import { Metadata } from "next";
import { Button } from "@/components/ui/button"
import { CheckCircle, Star, Zap, Shield, Building, FileText, Users, Calculator, Car, Bike } from "lucide-react"

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

export default function Home() {
  return (
    <main className="font-sans bg-gradient-to-br from-white via-slate-50 to-blue-50 text-text min-h-screen">
      {/* Header con Logo */}
      <header className="bg-white border-b border-gray-100" role="banner">
        <div className="w-full px-1 py-4">
          <div className="flex items-center justify-between">
            <Image
              src="/crediexpress-logo.png"
              alt="Crediexpress Automotor"
              width={400}
              height={98}
              className="h-auto object-contain max-h-14"
            />
            <nav className="hidden md:flex items-center space-x-6" role="navigation" aria-label="Navegación principal">
              <a href="#beneficios" className="text-gray-600 hover:text-brand-primary-600 font-medium transition-colors">Beneficios</a>
              <a href="#como-acceder" className="text-gray-600 hover:text-brand-primary-600 font-medium transition-colors">Cómo funciona</a>
              <Button className="bg-brand-primary-600 hover:bg-brand-primary-700 transition-colors">Contacto</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-white" role="main" aria-labelledby="hero-title">
        {/* Imagen de fondo */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-white/40 z-10"></div>
          <Image
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
            alt="Auto de lujo"
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary-600/5 via-transparent to-brand-accent-500/5 z-20"></div>
        <div className="container mx-auto px-6 sm:px-8 py-20 sm:py-32 relative z-30">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-brand-accent-500/10 border border-brand-accent-500/20">
                  <span className="text-sm font-medium text-brand-primary-600 drop-shadow-sm">✨ Financiación confiable desde 2008</span>
                </div>
                <h1 id="hero-title" className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight drop-shadow-lg">
                  <span className="text-brand-primary-600 drop-shadow-md">Créditos</span>
                  <br />
                  <span className="text-gray-900 drop-shadow-md">prendarios</span>
                  <br />
                  <span className="bg-gradient-to-r from-brand-accent-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-md">inteligentes</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-prose leading-relaxed drop-shadow-sm">
                  Financiá tu auto o moto con las mejores condiciones del mercado. 
                  <span className="font-semibold text-brand-primary-600 drop-shadow-sm">Tasas competitivas</span>, 
                  <span className="font-semibold text-brand-primary-600 drop-shadow-sm">aprobación rápida</span> y 
                  <span className="font-semibold text-brand-primary-600 drop-shadow-sm">transparencia total</span>.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-brand-primary-600 hover:bg-brand-primary-700 text-white shadow-lg shadow-brand-primary-600/25 px-8 py-4 text-lg font-semibold transition-all" asChild>
                  <a href="#como-acceder" aria-describedby="hero-title">Comenzar ahora</a>
                </Button>
                <Button variant="outline" size="lg" className="border-2 border-brand-primary-600 text-brand-primary-600 hover:bg-brand-primary-600 hover:text-white px-8 py-4 text-lg font-semibold transition-all" asChild>
                  <a href="#beneficios" aria-describedby="hero-title">Ver beneficios</a>
                </Button>
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-4xl">
                {/* Fondo con sombra para el logo */}
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary-600/5 to-brand-accent-500/5 rounded-3xl"></div>
                
                {/* Logo principal - mucho más grande */}
                <div className="relative z-10 flex items-center justify-center p-16">
                  <Image
                    src="/crediexpress-logo-sinfondo.png"
                    alt="Crediexpress - Logo"
                    width={800}
                    height={800}
                    className="w-full max-w-2xl drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                    style={{ height: 'auto' }}
                  />
                </div>
                
                {/* Elementos decorativos flotantes */}
                <div className="absolute top-12 right-12 w-6 h-6 bg-brand-primary-600 rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute bottom-16 left-16 w-4 h-4 bg-brand-accent-500 rounded-full opacity-60 animate-pulse delay-300"></div>
                <div className="absolute top-1/2 -right-6 w-8 h-8 bg-gradient-to-r from-brand-primary-600 to-brand-accent-500 rounded-full opacity-40 animate-pulse delay-700"></div>
                <div className="absolute bottom-1/4 -left-8 w-3 h-3 bg-brand-accent-500 rounded-full opacity-50 animate-pulse delay-1000"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Estadísticas de Confianza */}
      <section className="bg-gradient-to-br from-white via-slate-50 to-blue-50 py-20 sm:py-28 relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-10 right-20 w-24 h-24 bg-brand-primary-600/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-16 left-16 w-32 h-32 bg-brand-accent-500/10 rounded-full blur-xl"></div>
        
        <div className="container mx-auto px-6 sm:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Columna izquierda - Contenido */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-brand-accent-500/10 border border-brand-accent-500/20">
                  <span className="text-sm font-medium text-brand-primary-600">📊 Confianza que respalda</span>
                </div>
                
                <h2 className="text-4xl sm:text-5xl font-bold leading-tight text-gray-900">
                  Financiamos tu <span className="text-brand-primary-600">próximo</span> vehículo
                </h2>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  Créditos prendarios para autos y motos con las mejores condiciones del mercado.
                </p>
              </div>
              
              {/* Estadísticas de vehículos */}
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-brand-primary-600 to-brand-primary-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <Car className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-brand-primary-600">70%</div>
                    <div className="text-gray-700 font-medium">Financiación Autos</div>
                    <div className="text-gray-500 text-sm">0km hasta 15 años</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-brand-accent-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Bike className="w-8 h-8 text-gray-900" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-brand-primary-600">50%</div>
                    <div className="text-gray-700 font-medium">Financiación Motos</div>
                    <div className="text-gray-500 text-sm">0km hasta 2 años</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-brand-primary-600">6-48</div>
                    <div className="text-gray-700 font-medium">Cuotas flexibles</div>
                    <div className="text-gray-500 text-sm">según tu vehículo</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Columna derecha - Mockup Dashboard */}
            <div className="relative order-1 lg:order-2">
              <div className="relative">
                {/* Círculo decorativo de fondo */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary-600/20 to-brand-accent-500/20 rounded-full blur-3xl transform scale-110"></div>
                
                {/* Dashboard mockup */}
                <div className="relative z-10">
                  <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-200 transform rotate-3 hover:rotate-1 transition-transform duration-500">
                    <div className="space-y-4">
                      {/* Header del dashboard */}
                      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-brand-primary-600 rounded-lg flex items-center justify-center">
                            <Building className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-sm font-semibold text-gray-800">Dashboard Crediexpress</div>
                        </div>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        </div>
                      </div>
                      
                      {/* Métricas */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center">
                          <div className="text-2xl font-bold text-brand-primary-600">500</div>
                          <div className="text-xs text-gray-600">Concesionarios</div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-3 text-center">
                          <div className="text-2xl font-bold text-brand-accent-500">15</div>
                          <div className="text-xs text-gray-600">Años</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 text-center">
                          <div className="text-2xl font-bold text-green-600">10k</div>
                          <div className="text-xs text-gray-600">Créditos</div>
                        </div>
                      </div>
                      
                      {/* Gráfico simulado */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-brand-primary-600 rounded-full"></div>
                          <div className="text-xs text-gray-600">Crecimiento mensual</div>
                        </div>
                        <div className="space-y-1">
                          <div className="h-2 bg-gradient-to-r from-brand-primary-600 to-brand-primary-400 rounded w-full"></div>
                          <div className="h-2 bg-gradient-to-r from-brand-primary-600 to-brand-primary-400 rounded w-4/5"></div>
                          <div className="h-2 bg-gradient-to-r from-brand-primary-600 to-brand-primary-400 rounded w-3/4"></div>
                          <div className="h-2 bg-gradient-to-r from-brand-primary-600 to-brand-primary-400 rounded w-5/6"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tarjeta flotante */}
                  <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-200 transform -rotate-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-brand-accent-500 to-yellow-500 rounded-xl flex items-center justify-center">
                        <Star className="w-5 h-5 text-gray-900" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800">98% Satisfacción</div>
                        <div className="text-xs text-gray-500">Clientes felices</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Elementos decorativos flotantes */}
                <div className="absolute top-8 right-8 w-3 h-3 bg-brand-primary-600 rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute bottom-12 left-12 w-2 h-2 bg-brand-accent-500 rounded-full opacity-60 animate-pulse delay-300"></div>
                <div className="absolute top-1/2 -right-2 w-4 h-4 bg-gradient-to-r from-brand-primary-600 to-brand-accent-500 rounded-full opacity-40 animate-pulse delay-700"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo Acceder */}
      <section id="como-acceder" className="bg-gradient-to-br from-white via-gray-50 to-slate-100 py-20 sm:py-28 relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-16 left-20 w-20 h-20 bg-brand-accent-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-16 w-28 h-28 bg-brand-primary-600/10 rounded-full blur-xl"></div>
        
        <div className="container mx-auto px-6 sm:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Columna izquierda - Mockup Proceso */}
            <div className="relative order-2 lg:order-1">
              <div className="relative">
                {/* Círculo decorativo de fondo */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary-600/20 to-brand-accent-500/20 rounded-full blur-3xl transform scale-110"></div>
                
                {/* Mockup del proceso */}
                <div className="relative z-10 space-y-6">
                  {/* Paso 1 - Móvil */}
                  <div className="flex justify-end">
                    <div className="bg-white rounded-2xl shadow-xl p-3 border border-gray-200 transform rotate-6 hover:rotate-3 transition-transform duration-300">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 w-32 h-48">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-brand-primary-600" />
                            <div className="text-xs font-semibold text-gray-800">Paso 1</div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-2 bg-white/60 rounded w-full"></div>
                            <div className="h-2 bg-white/60 rounded w-3/4"></div>
                          </div>
                          <div className="bg-brand-primary-600 text-white rounded p-2 text-center text-xs">
                            Concesionario
                          </div>
                          <div className="space-y-1">
                            <div className="h-1 bg-white/40 rounded w-full"></div>
                            <div className="h-1 bg-white/40 rounded w-2/3"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Paso 2 - Tablet */}
                  <div className="flex justify-center -mt-8">
                    <div className="bg-white rounded-2xl shadow-2xl p-4 border border-gray-200 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 w-64 h-40">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-brand-accent-500" />
                              <div className="text-sm font-semibold text-gray-800">Solicitud</div>
                            </div>
                            <div className="text-xs bg-brand-accent-500 text-gray-900 px-2 py-1 rounded">Paso 2</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="h-3 bg-white/60 rounded"></div>
                            <div className="h-3 bg-white/60 rounded"></div>
                          </div>
                          <div className="space-y-1">
                            <div className="h-2 bg-white/50 rounded w-full"></div>
                            <div className="h-2 bg-white/50 rounded w-4/5"></div>
                            <div className="h-2 bg-white/50 rounded w-3/4"></div>
                          </div>
                          <div className="bg-brand-accent-500 text-gray-900 rounded p-2 text-center text-sm font-medium">
                            Simular
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Paso 3 - Tarjeta de aprobación */}
                  <div className="flex justify-start -mt-6">
                    <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-200 transform rotate-12 hover:rotate-6 transition-transform duration-300">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 w-40 h-32">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                            <div className="text-xs bg-green-600 text-white px-2 py-1 rounded">Paso 3</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">¡Aprobado!</div>
                            <div className="text-xs text-gray-600 mt-1">24-48 horas</div>
                          </div>
                          <div className="bg-green-600 text-white rounded p-2 text-center text-xs font-medium">
                            Retirar vehículo
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Elementos decorativos flotantes */}
                <div className="absolute top-4 left-4 w-3 h-3 bg-brand-primary-600 rounded-full opacity-60 animate-bounce"></div>
                <div className="absolute bottom-8 right-8 w-2 h-2 bg-brand-accent-500 rounded-full opacity-60 animate-bounce delay-300"></div>
                <div className="absolute top-1/2 -left-2 w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full opacity-40 animate-bounce delay-700"></div>
              </div>
            </div>
            
            {/* Columna derecha - Contenido */}
            <div className="space-y-8 order-1 lg:order-2">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-brand-primary-600/10 border border-brand-primary-600/20">
                  <span className="text-sm font-medium text-brand-primary-600">🚀 ¿Cómo acceder a tu crédito?</span>
                </div>
                
                <h2 className="text-4xl sm:text-5xl font-bold leading-tight text-gray-900">
                  Proceso <span className="text-brand-primary-600">simple</span> en 3 pasos
                </h2>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  Obtené tu crédito prendario de forma rápida y segura a través de nuestros concesionarios aliados.
                </p>
              </div>
              
              {/* Pasos del proceso */}
              <div className="space-y-6">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-brand-primary-600 to-brand-primary-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">1</span>
                  </div>
                  <div className="pt-2">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Visitá un concesionario</h3>
                    <p className="text-gray-600">Elegí el auto o moto que querés en cualquiera de nuestros +500 concesionarios aliados</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-brand-accent-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-gray-900 font-bold text-lg">2</span>
                  </div>
                  <div className="pt-2">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Solicitá el crédito</h3>
                    <p className="text-gray-600">El concesionario te ayuda a completar la solicitud y simular las condiciones</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">3</span>
                  </div>
                  <div className="pt-2">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Obtené la aprobación</h3>
                    <p className="text-gray-600">Recibí la respuesta en 24-48 horas y retirá tu vehículo</p>
                  </div>
                </div>
              </div>
              
              {/* CTA */}
              <div className="pt-4">
                <Button 
                  size="lg" 
                  className="bg-brand-primary-600 hover:bg-brand-primary-700 text-white font-bold px-8 py-4 text-lg shadow-lg shadow-brand-primary-600/25 transition-all"
                >
                  Encontrar Concesionario
                </Button>
              </div>
            </div>
  	          </div>
  	        </div>
  	      </section>

      {/* Sección para Concesionarios */}
      <section className="bg-gradient-to-br from-brand-primary-600 via-brand-primary-700 to-brand-primary-800 py-20 sm:py-28 relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-brand-accent-500/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>
        
        <div className="container mx-auto px-6 sm:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Columna izquierda - Imagen */}
            <div className="relative order-2 lg:order-1">
              <div className="relative">
                {/* Círculo decorativo de fondo */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary-600/20 to-brand-accent-500/20 rounded-full blur-3xl transform scale-110"></div>
                
                {/* Contenedor de dispositivos */}
                <div className="relative flex items-center justify-center">
                  {/* Tablet */}
                  <div className="relative z-10 transform rotate-12">
                    <div className="bg-white rounded-2xl shadow-2xl p-4 border border-gray-200">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 h-64 w-80">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-brand-primary-600 rounded-full flex items-center justify-center">
                              <Car className="w-4 h-4 text-white" />
                            </div>
                            <div className="text-sm font-semibold text-gray-800">Portal Concesionarios</div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 bg-white/60 rounded w-3/4"></div>
                            <div className="h-3 bg-white/60 rounded w-1/2"></div>
                            <div className="h-3 bg-white/60 rounded w-2/3"></div>
                          </div>
                          <div className="bg-brand-primary-600 text-white rounded-lg p-3 text-center text-sm font-medium">
                            Simular Crédito
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Móvil superpuesto */}
                  <div className="absolute -bottom-8 -right-8 z-20 transform -rotate-6">
                    <div className="bg-white rounded-2xl shadow-xl p-2 border border-gray-200">
                      <div className="bg-gradient-to-br from-brand-accent-500/20 to-yellow-100 rounded-xl p-4 h-40 w-24">
                        <div className="space-y-2">
                          <div className="w-4 h-4 bg-brand-accent-500 rounded-full mx-auto"></div>
                          <div className="space-y-1">
                            <div className="h-1.5 bg-white/60 rounded w-full"></div>
                            <div className="h-1.5 bg-white/60 rounded w-3/4"></div>
                            <div className="h-1.5 bg-white/60 rounded w-1/2"></div>
                          </div>
                          <div className="bg-brand-accent-500 rounded p-1 text-center">
                            <div className="w-2 h-2 bg-white rounded mx-auto"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Elementos decorativos flotantes */}
                <div className="absolute top-4 right-4 w-3 h-3 bg-brand-primary-600 rounded-full opacity-60"></div>
                <div className="absolute bottom-8 left-8 w-2 h-2 bg-brand-accent-500 rounded-full opacity-60"></div>
                <div className="absolute top-1/2 -left-4 w-4 h-4 bg-gradient-to-r from-brand-primary-600 to-brand-accent-500 rounded-full opacity-40"></div>
              </div>
            </div>
            
            {/* Columna derecha - Contenido */}
            <div className="space-y-8 order-1 lg:order-2">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 border border-white/30">
                  <span className="text-sm font-medium text-white">🏢 Créditos prendarios</span>
                </div>
                
                <h2 className="text-4xl sm:text-5xl font-bold leading-tight text-white">
                  ¿Sos <span className="text-brand-accent-500">concesionario</span>?
                </h2>
                
                <p className="text-xl text-white/90 leading-relaxed">
                  Sumate a nuestra comunidad, ofrecé a tus clientes la mejor financiación para autos o motos y aumentá tus ingresos.
                </p>
              </div>
              
              {/* Beneficios */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-brand-accent-500 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="w-4 h-4 text-gray-900" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Podés simular tus créditos desde nuestra web agencias</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-brand-accent-500 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="w-4 h-4 text-gray-900" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Te ofrecemos la mejor atención personalizada</p>
                  </div>
                </div>
              </div>
              
              {/* CTA */}
              <div className="pt-4">
                <Button 
                  size="lg" 
                  className="bg-brand-accent-500 hover:bg-yellow-400 text-gray-900 font-bold px-8 py-4 text-lg shadow-xl shadow-black/20 transition-all transform hover:scale-105"
                  asChild
                >
                  <a href="/portal/registro-concesionario">
                    Registrá tu agencia
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section id="beneficios" className="bg-gradient-to-br from-white via-gray-50 to-slate-100 py-20 sm:py-28 relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-16 right-20 w-20 h-20 bg-brand-accent-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-16 w-28 h-28 bg-brand-primary-600/10 rounded-full blur-xl"></div>
        
        <div className="container mx-auto px-6 sm:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Columna izquierda - Contenido */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-brand-primary-600/10 border border-brand-primary-600/20">
                  <span className="text-sm font-medium text-brand-primary-600">✨ ¿Por qué elegir Crediexpress?</span>
                </div>
                
                <h2 className="text-4xl sm:text-5xl font-bold leading-tight text-gray-900">
                  Ventajas que nos hacen <span className="text-brand-primary-600">únicos</span>
                </h2>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  Descubrí por qué somos la mejor opción para financiar tu vehículo con condiciones excepcionales.
                </p>
              </div>
              
              {/* Beneficios */}
              <div className="space-y-6">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="pt-2">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Aprobación Express</h3>
                    <p className="text-gray-600">Respuesta en 24-48 horas hábiles con documentación mínima</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="pt-2">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Seguridad Garantizada</h3>
                    <p className="text-gray-600">Plataforma segura con encriptación bancaria y protección de datos</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="pt-2">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Red de Concesionarios</h3>
                    <p className="text-gray-600">Más de 500 concesionarios aliados en todo el país</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Calculator className="w-6 h-6 text-white" />
                  </div>
                  <div className="pt-2">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Cuotas Flexibles</h3>
                    <p className="text-gray-600">Hasta 48 meses para autos y 24 para motos con tasas competitivas</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Columna derecha - Mockup Beneficios */}
            <div className="relative order-1 lg:order-2">
              <div className="relative">
                {/* Círculo decorativo de fondo */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary-600/20 to-brand-accent-500/20 rounded-full blur-3xl transform scale-110"></div>
                
                {/* Mockup de beneficios */}
                <div className="relative z-10 space-y-6">
                  {/* Tarjeta principal - Aprobación */}
                  <div className="flex justify-center">
                    <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-200 transform hover:scale-105 transition-transform duration-300 w-80">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-white" />
                              </div>
                              <div className="text-lg font-bold text-gray-900">¡Aprobado!</div>
                            </div>
                            <div className="text-xs bg-green-600 text-white px-3 py-1 rounded-full">Express</div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/60 rounded-xl p-3">
                              <div className="text-xs text-gray-600">Monto</div>
                              <div className="font-bold text-gray-900">$2.500.000</div>
                            </div>
                            <div className="bg-white/60 rounded-xl p-3">
                              <div className="text-xs text-gray-600">Plazo</div>
                              <div className="font-bold text-gray-900">36 meses</div>
                            </div>
                          </div>
                          
                          <div className="bg-green-600 text-white rounded-xl p-3 text-center font-medium">
                            24-48 horas
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tarjetas flotantes - Beneficios */}
                  <div className="flex justify-start -mt-4">
                    <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-200 transform rotate-6 hover:rotate-3 transition-transform duration-300">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 w-32 h-24">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-blue-600" />
                            <div className="text-xs font-semibold text-gray-800">Seguro</div>
                          </div>
                          <div className="text-xs text-gray-600">Encriptación bancaria</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end -mt-8">
                    <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-200 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 w-36 h-28">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-600" />
                            <div className="text-xs font-semibold text-gray-800">Red</div>
                          </div>
                          <div className="text-lg font-bold text-purple-600">+500</div>
                          <div className="text-xs text-gray-600">Concesionarios</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Elementos decorativos flotantes */}
                <div className="absolute top-8 left-8 w-3 h-3 bg-brand-primary-600 rounded-full opacity-60 animate-bounce"></div>
                <div className="absolute bottom-12 right-12 w-2 h-2 bg-brand-accent-500 rounded-full opacity-60 animate-bounce delay-300"></div>
                <div className="absolute top-1/2 -right-2 w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full opacity-40 animate-bounce delay-700"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-gray-100 py-20 sm:py-28 relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-20 left-16 w-24 h-24 bg-brand-primary-600/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-16 right-20 w-32 h-32 bg-brand-accent-500/10 rounded-full blur-xl"></div>
        
        <div className="container mx-auto px-6 sm:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Columna izquierda - Mockup Testimonios */}
            <div className="relative order-2 lg:order-1">
              <div className="relative">
                {/* Círculo decorativo de fondo */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-accent-500/20 to-brand-primary-600/20 rounded-full blur-3xl transform scale-110"></div>
                
                {/* Mockup de testimonios */}
                <div className="relative z-10 space-y-6">
                  {/* Testimonio principal */}
                  <div className="flex justify-center">
                    <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-200 transform hover:scale-105 transition-transform duration-300 w-96">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden shadow-md">
                              <Image
                                src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
                                alt="María González"
                                width={48}
                                height={48}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-gray-900">María González</div>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white/60 rounded-xl p-4">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              &quot;Excelente servicio, me aprobaron el crédito en menos de 48 horas...&quot;
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-600">Honda Civic 2023</div>
                            <div className="text-xs bg-green-600 text-white px-2 py-1 rounded">Verificado</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Testimonios flotantes */}
                  <div className="flex justify-start -mt-4">
                    <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-200 transform rotate-6 hover:rotate-3 transition-transform duration-300">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 w-48 h-32">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                            <div className="text-xs font-semibold text-gray-800">Carlos R.</div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <div className="text-xs text-gray-600">&quot;La mejor experiencia...&quot;</div>
                          <div className="text-xs text-gray-500">Toyota Corolla</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end -mt-6">
                    <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-200 transform -rotate-12 hover:-rotate-6 transition-transform duration-300">
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 w-44 h-28">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                            <div className="text-xs font-semibold text-gray-800">Ana M.</div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <div className="text-xs text-gray-600">&quot;Rápido y seguro...&quot;</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Elementos decorativos flotantes */}
                <div className="absolute top-4 right-4 w-3 h-3 bg-brand-accent-500 rounded-full opacity-60 animate-bounce"></div>
                <div className="absolute bottom-8 left-8 w-2 h-2 bg-brand-primary-600 rounded-full opacity-60 animate-bounce delay-300"></div>
                <div className="absolute top-1/2 -left-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-40 animate-bounce delay-700"></div>
              </div>
            </div>
            
            {/* Columna derecha - Contenido */}
            <div className="space-y-8 order-1 lg:order-2">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-brand-primary-600/10 border border-brand-primary-600/20">
                  <span className="text-sm font-medium text-brand-primary-600">💬 Lo que dicen nuestros clientes</span>
                </div>
                
                <h2 className="text-4xl sm:text-5xl font-bold leading-tight text-gray-900">
                  Experiencias <span className="text-brand-primary-600">reales</span> de éxito
                </h2>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  Miles de clientes ya confiaron en nosotros para financiar su vehículo. Conocé sus historias.
                </p>
              </div>
              
              {/* Estadísticas de testimonios */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <div className="text-3xl font-bold text-brand-primary-600 mb-2">4.9/5</div>
                  <div className="text-sm text-gray-600">Calificación promedio</div>
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <div className="text-3xl font-bold text-brand-primary-600 mb-2">+5.000</div>
                  <div className="text-sm text-gray-600">Clientes satisfechos</div>
                  <div className="text-xs text-green-600 mt-2 font-medium">✓ Verificados</div>
                </div>
              </div>
              
              {/* CTA */}
              <div className="pt-4">
                <Button 
                  size="lg" 
                  className="bg-brand-primary-600 hover:bg-brand-primary-700 text-white font-bold px-8 py-4 text-lg shadow-lg shadow-brand-primary-600/25 transition-all"
                >
                  Ver Más Testimonios
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-brand-primary-600 text-white py-16 sm:py-24">
        <div className="container mx-auto px-6 sm:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
            ¿Listo para financiar tu próximo vehículo?
          </h2>
          <p className="text-base mb-8 opacity-90">
            Comenzá ahora y obtené tu pre-aprobación en minutos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="transition-all">
              Encontrar Concesionario
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-brand-primary-600 transition-all">
              Contactar Asesor
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Información */}
      <footer className="bg-surface py-8">
        <div className="container mx-auto px-6 sm:px-8 text-center">
          <p className="text-sm text-[color:var(--color-text)]/60">
            Crediexpress Auto - Créditos prendarios para autos y motos
          </p>
          <p className="text-xs text-[color:var(--color-text)]/40 mt-2">
            Los valores mostrados son estimativos. Sujeto a evaluación crediticia.
          </p>
        </div>
      </footer>
    </main>
  );
}