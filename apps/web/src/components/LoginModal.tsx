"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Building, Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";

interface LoginModalProps {
  children: React.ReactNode;
}

export function LoginModal({ children }: LoginModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al iniciar sesión');
        return;
      }

      // Login exitoso
      console.log('Login successful:', data.user);
      
      // Verificar si debe cambiar contraseña
      if (data.mustChangePassword) {
        window.location.href = '/change-password';
        return;
      }
      
      // Redireccionar según el rol
      if (data.user.role === 'ADMIN') {
        window.location.href = '/admin/dashboard';
      } else if (data.user.role === 'DEALER' || data.user.role === 'EJECUTIVO_CUENTAS') {
        window.location.href = '/portal/dashboard';
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error("Login error:", error);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.email.trim() && formData.password.trim();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-none">
        <DialogTitle className="sr-only">Portal Concesionarios - Iniciar Sesión</DialogTitle>
        <DialogDescription className="sr-only">
          Formulario de inicio de sesión para concesionarios registrados en el sistema CrediAuto
        </DialogDescription>
        
        <div className="relative">
          {/* Elementos decorativos de fondo */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-brand-primary-600/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute -bottom-20 -right-20 w-32 h-32 bg-brand-accent-500/10 rounded-full blur-xl animate-bounce"></div>
          
          {/* Modal principal */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100/50 overflow-hidden relative z-10">
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-brand-primary-600 via-brand-primary-700 to-brand-primary-800 px-8 py-8 text-center relative overflow-hidden">
              {/* Elementos decorativos del header */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-accent-500/20 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Portal Concesionarios</h2>
                <p className="text-brand-primary-100 text-lg">Accede a tu cuenta para gestionar créditos</p>
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Mensaje de error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}
              {/* Campo Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand-primary-600" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 shadow-sm"
                  placeholder="tu@concesionario.com"
                  autoComplete="email"
                  required
                />
              </div>

              {/* Campo Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-brand-primary-600" />
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 shadow-sm"
                    placeholder="Tu contraseña"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Botón de envío */}
              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="w-full bg-gradient-to-r from-brand-primary-600 to-brand-primary-700 hover:from-brand-primary-700 hover:to-brand-primary-800 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Iniciar Sesión
                  </>
                )}
              </Button>

              {/* Enlaces adicionales */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <Link 
                    href="#" 
                    className="text-sm text-brand-primary-600 hover:text-brand-primary-700 hover:underline font-medium transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                
                <div className="text-center text-sm text-gray-600">
                  ¿No tenés cuenta?{" "}
                  <Link 
                    href="/portal/registro-concesionario" 
                    className="text-brand-primary-600 hover:text-brand-primary-700 hover:underline font-medium transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Registrate aquí
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}