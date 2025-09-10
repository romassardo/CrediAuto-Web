'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TestAdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const createAdminSession = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/auth/test-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('✅ Sesión de admin creada. Redirigiendo a KPIs...');
        setTimeout(() => {
          router.push('/admin/kpis');
        }, 1500);
      } else {
        setMessage('❌ Error: ' + data.error);
      }
    } catch (error) {
      setMessage('❌ Error de conexión: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          🧪 Test Admin Session
        </h1>
        
        <p className="text-gray-600 text-center mb-6">
          Crear sesión temporal de administrador para probar KPIs
        </p>

        <button
          onClick={createAdminSession}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2 px-4 rounded-md transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creando sesión...
            </div>
          ) : (
            'Crear Sesión Admin'
          )}
        </button>

        {message && (
          <div className="mt-4 p-3 bg-gray-100 rounded-md text-sm">
            {message}
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500 text-center">
          <p>Esta es una utilidad temporal de desarrollo</p>
          <p>Solo funciona en entorno local</p>
        </div>
      </div>
    </div>
  );
}
