import React from 'react';
import { Building, User, LogOut } from 'lucide-react';
import { type User as UserType } from '@/hooks/portal/usePortalDashboard';

interface PortalHeaderProps {
  user: UserType;
  isExecutive: boolean;
}

const PortalHeader: React.FC<PortalHeaderProps> = ({ user, isExecutive }) => {
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      window.location.href = '/';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      window.location.href = '/';
    }
  };

  return (
    <header className="bg-gradient-to-r from-brand-primary-600 via-brand-primary-700 to-brand-primary-800 shadow-2xl relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-20 translate-x-20"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-accent-500/20 rounded-full translate-y-16 -translate-x-16"></div>
      <div className="absolute top-1/2 right-1/4 w-6 h-6 bg-brand-accent-500 rounded-full opacity-60 animate-pulse"></div>
      <div className="absolute bottom-4 right-12 w-4 h-4 bg-white/40 rounded-full animate-pulse delay-300"></div>
      
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 relative z-10">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-brand-accent-500/20 to-yellow-400/20 border border-brand-accent-500/30 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 bg-brand-accent-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-xs font-bold text-white drop-shadow-sm">
                {isExecutive ? '👤 Ejecutivo' : '🏢 Concesionario'}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Building className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">
                  {isExecutive ? 'Portal Ejecutivo' : 'Dashboard Concesionario'}
                </h1>
                <p className="text-brand-primary-100 text-sm drop-shadow-sm">
                  {isExecutive ? 'Calculadora y solicitudes' : 'Gestiona tu equipo y solicitudes'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-right">
                <div className="font-semibold text-sm">{user.firstName} {user.lastName}</div>
                <div className="text-xs text-brand-primary-100">{user.role === 'EJECUTIVO_CUENTAS' ? 'Ejecutivo' : 'Dealer'}</div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 transform hover:scale-105"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium text-sm">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PortalHeader;
