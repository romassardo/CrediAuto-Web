"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle, Building, User, Sparkles, Shield, Clock } from "lucide-react";

export default function RegistroConcesionario() {
  const [formData, setFormData] = useState({
    // Datos del responsable
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    
    // Datos del concesionario
    nombreComercial: "",
    ciudad: "",
    provincia: "",
    
    // Términos
    aceptaTerminos: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value.trim()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) return;
    
    setIsSubmitting(true);
    
    try {
      // Simular envío con validación
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowSuccess(true);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = Boolean(
    formData.nombre.trim() && 
    formData.apellido.trim() && 
    formData.email.trim() && 
    formData.telefono.trim() && 
    formData.nombreComercial.trim() && 
    formData.ciudad.trim() && 
    formData.provincia.trim() && 
    formData.aceptaTerminos
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-brand-primary-600/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-brand-accent-500/10 rounded-full blur-xl animate-bounce"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-brand-accent-500/5 rounded-full blur-lg animate-pulse"></div>
      <div className="absolute top-32 right-1/4 w-20 h-20 bg-brand-primary-600/5 rounded-full blur-lg animate-bounce"></div>
      
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 relative z-10 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-3 group">
                <Image
                  src="/crediexpress-logo-sinfondo.png"
                  alt="Crediexpress Auto"
                  width={40}
                  height={40}
                  className="object-contain w-10 h-10 group-hover:scale-105 transition-transform"
                />
                <span className="text-xl font-bold text-brand-primary-600 group-hover:text-brand-primary-700 transition-colors">Crediexpress</span>
              </Link>
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
              <Link href="/" className="flex items-center gap-3 text-brand-primary-600 hover:text-brand-primary-700 transition-all hover:gap-4 group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Volver al inicio</span>
              </Link>
            </div>
            <div className="text-sm text-gray-500">
              ¿Ya tenés cuenta? <Link href="/portal/login" className="text-brand-primary-600 hover:underline font-medium transition-all hover:text-brand-primary-700">Iniciar sesión</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="container mx-auto px-6 py-12 relative z-10">
        {!showSuccess ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-7xl mx-auto">
            {/* Columna izquierda - Información y beneficios */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-brand-accent-500/10 border border-brand-accent-500/20">
                  <Sparkles className="w-4 h-4 text-brand-primary-600 mr-2" />
                  <span className="text-sm font-medium text-brand-primary-600">Portal exclusivo para concesionarios</span>
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                  <span className="text-brand-primary-600">Únete a nuestra</span>
                  <br />
                  <span className="bg-gradient-to-r from-brand-accent-500 to-yellow-400 bg-clip-text text-transparent">red de concesionarios</span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  Accede a herramientas exclusivas para gestionar créditos prendarios de forma rápida y eficiente.
                </p>
              </div>

              {/* Beneficios */}
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-brand-primary-600/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-brand-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Aprobación en 24-48hs</h3>
                    <p className="text-gray-600 text-sm">Procesamos tu solicitud de forma rápida y eficiente</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-brand-accent-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-brand-accent-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Plataforma segura</h3>
                    <p className="text-gray-600 text-sm">Tus datos están protegidos con la mejor tecnología</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Red de +500 concesionarios</h3>
                    <p className="text-gray-600 text-sm">Forma parte de nuestra comunidad de socios</p>
                  </div>
                </div>
              </div>

              {/* Mockup Portal Concesionarios */}
              <div className="relative hidden lg:block">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-primary-600/10 to-brand-accent-500/10 rounded-2xl blur-xl"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-xl">
                  {/* Header simulando ventana del navegador */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <div className="ml-4 text-xs text-gray-500 font-mono">portal.crediexpress.com</div>
                  </div>
                  
                  {/* Contenido del portal simulado */}
                  <div className="space-y-3">
                    {/* Título del dashboard */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-4 h-4 bg-brand-primary-600 rounded flex items-center justify-center">
                        <Building className="w-2 h-2 text-white" />
                      </div>
                      <div className="h-3 bg-gradient-to-r from-brand-primary-600 to-brand-primary-700 rounded w-32"></div>
                    </div>
                    
                    {/* Líneas de contenido simulado */}
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                    
                    {/* Botones de acción simulados */}
                    <div className="flex gap-2 mt-4">
                      <div className="h-8 bg-brand-accent-500 rounded px-3 flex items-center">
                        <span className="text-xs text-gray-900 font-medium">Simular Crédito</span>
                      </div>
                      <div className="h-8 bg-gray-200 rounded px-3 flex items-center">
                        <span className="text-xs text-gray-500">Ver Solicitudes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna derecha - Formulario */}
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100/50 overflow-hidden">
              {/* Header del formulario */}
              <div className="bg-gradient-to-r from-brand-primary-600 via-brand-primary-700 to-brand-primary-800 px-8 py-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-accent-500/20 rounded-full translate-y-12 -translate-x-12"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                    <Building className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Información del Concesionario</h2>
                  <p className="text-brand-primary-100 text-lg">Completá todos los campos para procesar tu solicitud</p>
                </div>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* Sección: Datos del Responsable */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                    <div className="w-8 h-8 bg-brand-primary-600 rounded-full flex items-center justify-center shadow-sm">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Datos del Responsable</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 shadow-sm"
                        placeholder="Ingresá tu nombre"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-2">
                        Apellido *
                      </label>
                      <input
                        type="text"
                        id="apellido"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 shadow-sm"
                        placeholder="Tu apellido"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 shadow-sm"
                        placeholder="tu@email.com"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 shadow-sm"
                        placeholder="+54 11 1234-5678"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Sección: Datos del Concesionario */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                    <div className="w-8 h-8 bg-brand-primary-600 rounded-full flex items-center justify-center shadow-sm">
                      <Building className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Datos del Concesionario</h3>
                  </div>

                  <div>
                    <label htmlFor="nombreComercial" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre comercial *
                    </label>
                    <input
                      type="text"
                      id="nombreComercial"
                      name="nombreComercial"
                      value={formData.nombreComercial}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 shadow-sm"
                      placeholder="Ej: AutoCenter San Martín"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700 mb-2">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        id="ciudad"
                        name="ciudad"
                        value={formData.ciudad}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 shadow-sm"
                        placeholder="Buenos Aires"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="provincia" className="block text-sm font-medium text-gray-700 mb-2">
                        Provincia *
                      </label>
                      <input
                        type="text"
                        id="provincia"
                        name="provincia"
                        value={formData.provincia}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 shadow-sm"
                        placeholder="Buenos Aires"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Términos y condiciones */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="aceptaTerminos"
                      name="aceptaTerminos"
                      checked={formData.aceptaTerminos}
                      onChange={handleInputChange}
                      className="mt-1 w-4 h-4 text-brand-primary-600 border-gray-300 rounded focus:ring-brand-primary-600"
                      required
                    />
                    <label htmlFor="aceptaTerminos" className="text-sm text-gray-600 leading-relaxed">
                      Acepto los <Link href="#" className="text-brand-primary-600 hover:underline font-medium">términos y condiciones</Link> y autorizo el tratamiento de mis datos personales según la <Link href="#" className="text-brand-primary-600 hover:underline font-medium">política de privacidad</Link>.
                    </label>
                  </div>
                </div>

                {/* Botón de envío */}
                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="w-full bg-gradient-to-r from-brand-primary-600 to-brand-primary-700 hover:from-brand-primary-700 hover:to-brand-primary-800 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Procesando solicitud...
                    </>
                  ) : (
                    <>
                      <Building className="w-5 h-5" />
                      Registrar Concesionario
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          // Mensaje de éxito
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100/50 overflow-hidden text-center p-12 relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-primary-600 to-brand-accent-500"></div>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">¡Solicitud Enviada!</h1>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                Tu solicitud será revisada en <span className="font-semibold text-brand-primary-600">24-48 horas hábiles</span>. Te contactaremos por email.
              </p>
              <Link 
                href="/"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-primary-600 to-brand-primary-700 hover:from-brand-primary-700 hover:to-brand-primary-800 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
