'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'DEALER' | 'EJECUTIVO_CUENTAS';
  status: string;
  dealerId?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          console.log('🔍 useAuth - Datos recibidos del API:', userData);
          console.log('🔍 useAuth - Usuario:', userData.user);
          console.log('🔍 useAuth - Rol del usuario:', userData.user?.role);

          if (userData.success && userData.user) {
            setAuthState({
              user: userData.user,
              loading: false,
              error: null,
            });
          } else {
            setAuthState({
              user: null,
              loading: false,
              error: 'Datos de usuario inválidos',
            });
          }
        } else {
          setAuthState({
            user: null,
            loading: false,
            error: 'No autenticado',
          });
        }
      } catch (error) {
        setAuthState({
          user: null,
          loading: false,
          error: 'Error de conexión',
        });
      }
    };

    fetchUser();
  }, []);

  const hasRole = (role: string | string[]) => {
    if (!authState.user) return false;
    if (Array.isArray(role)) {
      return role.includes(authState.user.role);
    }
    return authState.user.role === role;
  };

  const isDealer = () => hasRole('DEALER');
  const isExecutive = () => hasRole('EJECUTIVO_CUENTAS');
  const isAdmin = () => hasRole('ADMIN');
  const canManageTeam = () => {
    const result = hasRole(['DEALER', 'ADMIN']);
    console.log('🔍 canManageTeam - Usuario:', authState.user?.role, 'Resultado:', result);
    return result;
  };
  const canAccessFullDashboard = () => {
    const result = hasRole(['DEALER', 'ADMIN']);
    console.log('🔍 canAccessFullDashboard - Usuario:', authState.user?.role, 'Resultado:', result);
    return result;
  };

  return {
    ...authState,
    hasRole,
    isDealer,
    isExecutive,
    isAdmin,
    canManageTeam,
    canAccessFullDashboard,
  };
}