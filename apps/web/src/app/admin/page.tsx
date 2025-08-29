'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir automáticamente a la página de préstamos
    router.replace('/admin/loans');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary-600"></div>
      <span className="ml-2 text-gray-600">Redirigiendo...</span>
    </div>
  );
}
