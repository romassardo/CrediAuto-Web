'use client';

import { Suspense, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Wrapper con Suspense para permitir el uso de useSearchParams según Next.js 15
export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-brand-primary-600 via-brand-primary-700 to-brand-primary-800">
          Cargando…
        </div>
      }
    >
      <SetPasswordContent />
    </Suspense>
  );
}

function SetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = token && password.length >= 8 && password === confirm && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data?.error || `Error ${res.status}`);
      }

      setSuccess(true);
      // Redirigir a login después de 2.5s
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-primary-600 via-brand-primary-700 to-brand-primary-800 relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-brand-accent-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-white/10 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-brand-accent-500/10 rounded-full blur-lg animate-pulse"></div>
        <div className="absolute top-32 right-1/4 w-20 h-20 bg-white/5 rounded-full blur-lg animate-bounce"></div>

        <div className="flex items-center justify-center min-h-screen p-6 relative z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl ring-1 ring-white/20 p-8 max-w-md w-full text-center">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img
                src="/recurso-15.svg"
                alt="Crediexpress Automotor"
                className="h-16 w-auto"
              />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Enlace inválido</h1>
            <p className="text-gray-600 mb-6">El enlace para establecer contraseña no es válido. Solicita uno nuevo.</p>
            
            <Link 
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-brand-primary-600 hover:bg-brand-primary-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary-600 via-brand-primary-700 to-brand-primary-800 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-brand-accent-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-white/10 rounded-full blur-xl animate-bounce"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-brand-accent-500/10 rounded-full blur-lg animate-pulse"></div>
      <div className="absolute top-32 right-1/4 w-20 h-20 bg-white/5 rounded-full blur-lg animate-bounce"></div>

      <div className="flex items-center justify-center min-h-screen p-6 relative z-10">
        <div className="relative max-w-md w-full">
          {/* Decoración adicional */}
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-brand-accent-500/30 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/20 rounded-full blur-3xl" />

          <div className="bg-white/95 backdrop-blur-sm relative rounded-2xl shadow-2xl ring-1 ring-white/20 p-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img
                src="/recurso-15.svg"
                alt="Crediexpress Automotor"
                className="h-12 w-auto drop-shadow-sm"
              />
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Establecer contraseña</h1>
              <p className="text-gray-600">Creá tu contraseña para acceder al portal de Crediexpress Automotor</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nueva contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm transition-all duration-200 focus:border-brand-primary-500 focus:ring-2 focus:ring-brand-primary-500/20 focus:outline-none placeholder-gray-500"
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar contraseña</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm transition-all duration-200 focus:border-brand-primary-500 focus:ring-2 focus:ring-brand-primary-500/20 focus:outline-none placeholder-gray-500"
                  placeholder="Repetí tu contraseña"
                  required
                  minLength={8}
                />
                {confirm && password !== confirm && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Las contraseñas no coinciden
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4 flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-4 flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  ¡Contraseña guardada! Te redirigimos al inicio de sesión…
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                  canSubmit 
                    ? 'bg-gradient-to-r from-brand-primary-600 to-brand-primary-700 hover:from-brand-primary-700 hover:to-brand-primary-800 hover:shadow-xl transform hover:-translate-y-0.5' 
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Guardando…</span>
                  </>
                ) : (
                  <span>Guardar contraseña</span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                ¿Problemas con el enlace?{' '}
                <Link href="/" className="text-brand-primary-600 hover:text-brand-primary-700 font-medium">
                  Contacta soporte
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
