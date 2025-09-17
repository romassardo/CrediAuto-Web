'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calculator, FileText, Users, LogOut, TrendingUp, Eye, Settings, User, Building } from 'lucide-react';
import { usePortalDashboard } from '@/hooks/portal/usePortalDashboard';
import LoanCalculator from '@/components/calculator/LoanCalculator';
import LoanApplicationSteps from '@/components/forms/LoanApplicationSteps';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import OverviewTabContent from '@/components/portal/OverviewTabContent';
import TeamTabContent from '@/components/portal/TeamTabContent';
import { type Result } from '@/lib/calculator/loan-calculator';

 

export default function DashboardPage() {
  const {
    user,
    authLoading,
    handleLogout,
    canManageTeam,
    canAccessFullDashboard,
    isExecutive,
    modalState,
    closeModal,
    activeTab,
    setActiveTab,
    calculationData,
    handleCalculationComplete,
    handleLoanSubmit,
    isSubmittingLoan,
    mainTabRef,
    team,
    teamLoading,
    showCreateUser,
    setShowCreateUser,
    newExecutive,
    setNewExecutive,
    handleCreateExecutive,
    handleActivateExecutive,
    handleSuspendExecutive,
    handleDeleteExecutive,
    handleUpdateExecutive,
    handleResetExecutivePassword,
    overviewRefreshTick,
  } = usePortalDashboard();

  const [calculationResult, setCalculationResult] = useState<Result | null>(null);
 

  // Mostrar loading mientras se autentica
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, no mostrar nada (se redirigirá)
  if (!user) {
    return null;
  }

  // Definir pestañas disponibles según el rol
  const availableTabs = [
    { id: 'main', label: 'Simulador y Solicitud', icon: Calculator },
    // Resumen está disponible para ejecutivos y dealers
    ...(isExecutive || canAccessFullDashboard ? [
      { id: 'overview', label: 'Resumen', icon: TrendingUp },
    ] : []),
    // Solo dealers pueden gestionar equipo
    ...(canAccessFullDashboard ? [
      { id: 'team', label: 'Gestión de Equipo', icon: Users },
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-brand-primary-600/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-brand-accent-500/10 rounded-full blur-xl animate-bounce"></div>
      
      {/* Header rediseñado según guía UI/UX */}
      <header className="bg-gradient-to-r from-brand-primary-600 via-brand-primary-700 to-brand-primary-800 shadow-2xl relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-12 translate-x-12"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-brand-accent-500/20 rounded-full translate-y-10 -translate-x-10"></div>
        <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-brand-accent-500 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute bottom-4 right-12 w-3 h-3 bg-white/40 rounded-full animate-pulse delay-300"></div>
        
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 relative z-10">
          <div className="flex justify-between items-center py-4">
            <div className="space-y-3">
              {/* Badge con gradiente */}
              <div className="inline-flex items-center px-2.5 py-1.5 rounded-full bg-gradient-to-r from-brand-accent-500/20 to-yellow-400/20 border border-brand-accent-500/30 backdrop-blur-sm">
                <div className="w-1.5 h-1.5 bg-brand-accent-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-xs font-bold text-white drop-shadow-sm">
                  {isExecutive ? '👤 Ejecutivo de Cuentas' : '🏢 Portal Concesionario'}
                </span>
              </div>
              
              {/* Título principal */}
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
                  {isExecutive ? 'Portal Ejecutivo' : 'Dashboard Concesionario'}
                </h1>
              </div>
              
              {/* Subtítulo */}
              <p className="text-brand-primary-100 text-sm sm:text-base drop-shadow-sm max-w-2xl">
                {isExecutive ? 'Simulador y solicitudes de crédito' : 'Gestiona tu equipo y solicitudes'}
              </p>
            </div>
            
            {/* Área de usuario, perfil y logout */}
            <div className="flex items-center space-x-4">
              {/* Info del usuario */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm">{user.firstName} {user.lastName}</div>
                  <div className="text-[11px] text-brand-primary-100">{user.role === 'EJECUTIVO_CUENTAS' ? 'Ejecutivo' : 'Dealer'}</div>
                </div>
              </div>

              {/* Botón Perfil */}
              <Link
                href="/portal/profile"
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-3 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                title="Perfil"
              >
                <Settings className="w-4 h-4" />
                <span className="font-medium text-sm">Perfil</span>
              </Link>

              {/* Botón de logout */}
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 transform hover:scale-105"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium text-sm">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        {/* Navegación por pestañas */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100/50 mb-8 relative overflow-hidden">
          {/* Elementos decorativos del header */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary-600/5 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-brand-accent-500/10 rounded-full translate-y-8 -translate-x-8"></div>
          
          <div className="bg-gradient-to-r from-brand-primary-600 via-brand-primary-700 to-brand-primary-800 px-8 py-6 relative overflow-hidden">
            {/* Elementos decorativos del header */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-accent-500/20 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative">
              <nav className="flex space-x-2">
                {availableTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all transform hover:scale-105 ${
                      activeTab === tab.id
                        ? 'bg-white text-brand-primary-600 shadow-lg'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
              
            </div>
          </div>
          
          {/* Contenido de las pestañas */}
          <div className="p-8">
            {activeTab === 'main' && (
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-primary-600 rounded-full flex items-center justify-center shadow-sm">
                    <Calculator className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Simulador y Solicitud de Préstamo</h2>
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Calculadora */}
                  <div>
                    <LoanCalculator 
                      onCalculationChange={setCalculationResult}
                      onCalculationComplete={handleCalculationComplete}
                    />
                  </div>
                  
                  {/* Formulario de Solicitud */}
                  <div id="loan-application-form" ref={mainTabRef}>
                    <LoanApplicationSteps 
                      calculationResult={calculationResult}
                      calculationData={calculationData}
                      onSubmit={handleLoanSubmit}
                      isSubmitting={isSubmittingLoan}
                    />
                  </div>
                </div>

                {/* Información adicional eliminada por solicitud del cliente */}
              </div>
            )}

            {activeTab === 'team' && canManageTeam && (
              <TeamTabContent
                users={team}
                loading={teamLoading}
                showCreateUser={showCreateUser}
                setShowCreateUser={setShowCreateUser}
                newUser={newExecutive}
                setNewUser={setNewExecutive}
                handleCreateUser={handleCreateExecutive}
                onActivate={handleActivateExecutive}
                onSuspend={handleSuspendExecutive}
                onDelete={handleDeleteExecutive}
                onUpdate={handleUpdateExecutive}
                onResetPassword={handleResetExecutivePassword}
              />
            )}

            {activeTab === 'overview' && (
              <OverviewTabContent 
                refreshTrigger={overviewRefreshTick}
              />
            )}

            {activeTab === 'stats' && canAccessFullDashboard && (
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-primary-600 rounded-full flex items-center justify-center shadow-sm">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Estadísticas del Dashboard</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-brand-primary-600 to-brand-primary-700 rounded-2xl p-6 text-white shadow-lg shadow-brand-primary-600/25 transform hover:scale-105 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-brand-primary-100 text-sm font-medium">Ejecutivos</p>
                        <p className="text-3xl font-bold">{team.length}</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg shadow-green-500/25 transform hover:scale-105 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">Solicitudes</p>
                        <p className="text-3xl font-bold">0</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-brand-accent-500 to-yellow-500 rounded-2xl p-6 text-gray-900 shadow-lg shadow-brand-accent-500/25 transform hover:scale-105 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-800 text-sm font-medium">Pendientes</p>
                        <p className="text-3xl font-bold">0</p>
                      </div>
                      <div className="w-12 h-12 bg-gray-900/20 rounded-xl flex items-center justify-center">
                        <Calculator className="w-6 h-6 text-gray-900" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/25 transform hover:scale-105 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-100 text-sm font-medium">Aprobadas</p>
                        <p className="text-3xl font-bold">0</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Settings className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <Building className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-blue-900">Funcionalidades Disponibles</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-4 bg-white/60 rounded-xl border border-blue-200">
                        <Calculator className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-semibold text-blue-900">Simulador</p>
                          <p className="text-sm text-blue-700">Simulá préstamos en tiempo real</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-white/60 rounded-xl border border-blue-200">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-semibold text-blue-900">Solicitudes</p>
                          <p className="text-sm text-blue-700">Envía solicitudes completas</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-white/60 rounded-xl border border-blue-200">
                        <Users className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-semibold text-blue-900">Equipo</p>
                          <p className="text-sm text-blue-700">Gestiona ejecutivos de cuentas</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal de Confirmación */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />
    </div>
  );
}