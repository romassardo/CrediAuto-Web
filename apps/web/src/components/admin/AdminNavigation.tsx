'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Building2, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AdminNavigationProps {
  title: string;
  subtitle: string;
  stats?: {
    count: number;
    label: string;
  };
}

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function AdminNavigation({ title, subtitle, stats }: AdminNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const navigationItems = [
    { href: '/admin/loans', label: 'Préstamos' },
    { href: '/admin/dashboard', label: 'Concesionarios' },
    { href: '/admin/rates', label: 'Tasas' },
    { href: '/admin/kpis', label: 'KPIs' },
  ];

  // Obtener información del usuario
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUserInfo(data.user);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  // Función de logout
  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-brand-primary-600 via-brand-primary-700 to-brand-primary-800 relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-accent-500/20 rounded-full translate-y-12 -translate-x-12 animate-pulse delay-300"></div>
      
      <div className="container mx-auto px-6 sm:px-8 py-6 relative">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-accent-500/20 border border-brand-accent-500/30 mb-1">
                <span className="text-xs font-medium text-brand-accent-500">🏢 Administración</span>
              </div>
              <h1 className="text-2xl font-bold text-white">{title}</h1>
              <p className="text-brand-primary-100 text-sm">{subtitle}</p>
            </div>
          </div>
          
          {/* Navegación centrada */}
          <div className="flex items-center justify-center flex-1">
            <nav className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    pathname === item.href
                      ? 'bg-white text-brand-primary-600 shadow-sm'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Usuario y logout */}
          <div className="flex items-center gap-4">
            {/* Información del usuario */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
              <div className="w-8 h-8 bg-brand-accent-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-right">
                <div className="text-white text-sm font-medium">
                  {userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : 'Cargando...'}
                </div>
                <div className="text-brand-primary-200 text-xs">
                  {userInfo ? (userInfo.role === 'ADMIN' ? 'Administrador' : userInfo.role) : 'Usuario'}
                </div>
              </div>
            </div>

            {/* Botón de logout */}
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm rounded-xl px-4 py-2 border border-red-400/30 text-red-100 hover:text-white transition-all disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">
                {loading ? 'Saliendo...' : 'Salir'}
              </span>
            </button>

            {/* Stats (si existen) */}
            {stats && (
              <div className="text-right">
                <div className="text-white/90 text-sm font-medium">{stats.count} {stats.label}</div>
                <div className="text-brand-primary-200 text-xs">Total registros</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
