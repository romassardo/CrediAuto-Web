import React from 'react';
import { Calculator, Users, Eye, AlertCircle } from 'lucide-react';

interface PortalTabsProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  canAccessFullDashboard: boolean;
  isExecutive: boolean;
}

const PortalTabs: React.FC<PortalTabsProps> = ({ activeTab, setActiveTab, canAccessFullDashboard, isExecutive }) => {
  const availableTabs = [
    { id: 'main', label: 'Simulador y Solicitud', icon: Calculator },
    ...(canAccessFullDashboard ? [
      { id: 'team', label: 'Gestión de Equipo', icon: Users },
      { id: 'overview', label: 'Resumen', icon: Eye },
    ] : []),
    ...(isExecutive ? [
      { id: 'overview', label: 'Mis Solicitudes', icon: Eye },
    ] : []),
  ];

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100/50 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary-600/5 rounded-full -translate-y-12 translate-x-12"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-brand-accent-500/10 rounded-full translate-y-8 -translate-x-8"></div>
      
      <div className="bg-gradient-to-r from-brand-primary-600 via-brand-primary-700 to-brand-primary-800 px-8 py-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-accent-500/20 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative">
          <nav className="flex space-x-2">
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all transform hover:scale-105 ${
                  activeTab === tab.id
                    ? 'bg-white text-brand-primary-600 shadow-lg'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
          
          {isExecutive && (
            <div className="mt-3 flex items-center gap-2 text-white/70 text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>Acceso limitado: Solo simulador y solicitudes</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortalTabs;
