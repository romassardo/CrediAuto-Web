"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button"
import { CheckCircle, Star, Zap, Shield, Building, FileText, Users, Calculator, Car, Bike } from "lucide-react"
import { LoginModal } from "@/components/LoginModal"
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <main className="font-sans bg-gradient-to-br from-white via-slate-50 to-blue-50 text-text min-h-screen">
      {/* Header con Logo */}
      <header className="bg-white border-b border-gray-100" role="banner">
        <div className="w-full px-1 py-4">
          <div className="flex items-center justify-between">
            <Image
              src="/crediexpress-logo-sinfondo.png"
              alt="Crediexpress Automotor"
              width={400}
              height={98}
              className="h-auto object-contain max-h-14"
              style={{ width: 'auto' }}
            />
            <nav className="hidden md:flex items-center space-x-6" role="navigation" aria-label="Navegación principal">
              <a href="#beneficios" className="text-gray-600 hover:text-brand-primary-600 font-medium transition-colors">Beneficios</a>
              <a href="#como-acceder" className="text-gray-600 hover:text-brand-primary-600 font-medium transition-colors">Cómo funciona</a>
              <Button className="bg-brand-primary-600 hover:bg-brand-primary-700 transition-colors">Contacto</Button>
              <Button 
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-brand-primary-600 hover:bg-brand-primary-700 transition-colors"
              >
                Soy Concesionario
              </Button>
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
                <Button size="lg" className="bg-brand-primary-600 hover:bg-brand-primary-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                  <Calculator className="mr-2 h-5 w-5" />
                  Simulá tu Crédito
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-brand-primary-600 text-brand-primary-600 hover:bg-brand-primary-600 hover:text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                  <FileText className="mr-2 h-5 w-5" />
                  Ver Solicitudes
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm bg-white/90 border border-gray-100">
                <h2 className="text-2xl font-bold text-brand-primary-600 mb-6">Calculadora Rápida</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Vehículo</label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Car className="mr-2 h-4 w-4" />
                        Auto
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Bike className="mr-2 h-4 w-4" />
                        Moto
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Monto del Vehículo</label>
                    <input 
                      type="text" 
                      placeholder="$15.000.000" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cuotas</label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent">
                      <option>12 cuotas</option>
                      <option>24 cuotas</option>
                      <option>36 cuotas</option>
                      <option>48 cuotas</option>
                    </select>
                  </div>
                  <div className="bg-brand-primary-600/5 p-4 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Cuota estimada</p>
                      <p className="text-3xl font-bold text-brand-primary-600">$625.000</p>
                      <p className="text-xs text-gray-500 mt-1">TNA: 70% | TEA: 98% | CFT: 115%</p>
                    </div>
                  </div>
                  <Button className="w-full bg-brand-primary-600 hover:bg-brand-primary-700 text-white">
                    Ver Simulación Completa
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section id="beneficios" className="py-20 bg-white" aria-labelledby="beneficios-title">
        <div className="container mx-auto px-6 sm:px-8">
          <div className="text-center mb-16">
            <h2 id="beneficios-title" className="text-4xl font-bold text-brand-primary-600 mb-4">¿Por qué elegir Crediexpress?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Más de 15 años financiando sueños automotrices con transparencia y confianza
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-brand-primary-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-brand-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aprobación Rápida</h3>
              <p className="text-gray-600">Respuesta en menos de 24 horas con documentación mínima</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-white border border-green-100 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-green-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">100% Seguro</h3>
              <p className="text-gray-600">Plataforma encriptada y regulada por el BCRA</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-yellow-50 to-white border border-yellow-100 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-brand-accent-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="h-8 w-8 text-brand-accent-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">+500 Concesionarios</h3>
              <p className="text-gray-600">Red nacional de concesionarios aliados</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-white border border-purple-100 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-purple-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sin Comisiones Ocultas</h3>
              <p className="text-gray-600">Transparencia total en costos y condiciones</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-red-50 to-white border border-red-100 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Atención Personalizada</h3>
              <p className="text-gray-600">Asesoramiento experto en cada paso del proceso</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-indigo-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Comunidad Activa</h3>
              <p className="text-gray-600">Más de 50.000 clientes satisfechos nos recomiendan</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo Acceder */}
      <section id="como-acceder" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50" aria-labelledby="como-acceder-title">
        <div className="container mx-auto px-6 sm:px-8">
          <div className="text-center mb-16">
            <h2 id="como-acceder-title" className="text-4xl font-bold text-brand-primary-600 mb-4">¿Cómo acceder a tu crédito?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Proceso simple y rápido en 3 pasos
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-brand-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Simulá tu Crédito</h3>
              <p className="text-gray-600">Ingresá el monto y plazo deseado para conocer tu cuota mensual</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-brand-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Completá tu Solicitud</h3>
              <p className="text-gray-600">Cargá tus datos personales y documentación requerida</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-brand-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">¡Retirá tu Auto!</h3>
              <p className="text-gray-600">Una vez aprobado, coordiná la entrega en el concesionario</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-brand-primary-600 to-brand-primary-700 text-white">
        <div className="container mx-auto px-6 sm:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">¿Listo para financiar tu próximo vehículo?</h2>
          <p className="text-xl mb-8 opacity-90">
            Comenzá ahora y obtené tu preaprobación en minutos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-brand-primary-600 hover:bg-gray-100 transition-all">
              Simular Crédito
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

      <LoginModal 
        open={isLoginModalOpen} 
        onOpenChange={setIsLoginModalOpen} 
      />
    </main>
  );
}