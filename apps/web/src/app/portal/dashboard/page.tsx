'use client';

import { useState, useEffect } from 'react';
import { Calculator, FileText, Users, Plus, LogOut, TrendingUp, DollarSign, Clock, CheckCircle, User, Building, AlertCircle, Mail, Phone, Calendar, Eye, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LoanCalculator from '@/components/calculator/LoanCalculator';
import LoanApplicationSteps from '@/components/forms/LoanApplicationSteps';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import OverviewTabContent from '@/components/portal/OverviewTabContent';
import { type Result } from '@/lib/calculator/loan-calculator';

interface UserData {
  publicId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: string;
  createdAt: string;
  lastLoginAt?: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading, canManageTeam, canAccessFullDashboard, isExecutive } = useAuth();
  
  // Estados locales del dashboard
  const [activeTab, setActiveTab] = useState('main');
  const [calculationResult, setCalculationResult] = useState<Result | null>(null);
  const [calculationData, setCalculationData] = useState<any>(null);
  const [isSubmittingLoan, setIsSubmittingLoan] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  
  // Estados del modal
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info'
  });

  // Ejecutar las funciones para obtener valores booleanos
  const canManageTeamValue = canManageTeam();
  const canAccessFullDashboardValue = canAccessFullDashboard();
  const isExecutiveValue = isExecutive();
  
  // Debug logging temporal
  useEffect(() => {
    if (user) {
      console.log('🔍 Debug - Usuario actual:', user);
      console.log('🔍 Debug - Rol:', user.role);
      console.log('🔍 Debug - canManageTeam:', canManageTeamValue);
      console.log('🔍 Debug - canAccessFullDashboard:', canAccessFullDashboardValue);
      console.log('🔍 Debug - isExecutive:', isExecutiveValue);
    }
  }, [user, canManageTeamValue, canAccessFullDashboardValue, isExecutiveValue]);

  // Función para manejar cuando se completa el cálculo y se quiere solicitar préstamo
  const handleCalculationComplete = (data: any) => {
    setCalculationData(data);
    // Hacer scroll al formulario para mejor UX
    const formElement = document.getElementById('loan-application-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Redirigir a login si no está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/';
    }
  }, [user, authLoading]);

  // Para ejecutivos, forzar que solo vean la pestaña principal
  useEffect(() => {
    if (isExecutiveValue && activeTab !== 'main') {
      setActiveTab('main');
    }
  }, [isExecutiveValue, activeTab]);

  const fetchUsers = async () => {
    if (!canManageTeamValue) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/dealer/users', { credentials: 'include' });
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/dealer/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (data.success) {
        showModal(
          '✅ Ejecutivo Creado',
          `El usuario ${newUser.email} ha sido creado y recibirá un correo para establecer su contraseña.`,
          'success'
        );
        setNewUser({ firstName: '', lastName: '', email: '', phone: '' });
        setShowCreateUser(false);
        fetchUsers();
      } else {
        showModal('❌ Error al Crear', data.error || 'No se pudo crear el ejecutivo. Verifique los datos.', 'error');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      showModal('❌ Error de Conexión', 'No se pudo conectar con el servidor para crear el usuario.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setModalState({ isOpen: true, title, message, type });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
    window.location.href = '/';
  };

  const handleLoanSubmit = async (data: any) => {
    setIsSubmittingLoan(true);
    try {
      console.log('📋 Enviando solicitud de préstamo:', data);
      
      // Validación: debe existir un cálculo previo
      if (!calculationData) {
        showModal(
          '⚠️ Falta el Cálculo',
          'Debe realizar y seleccionar un cálculo de préstamo antes de enviar la solicitud.',
          'warning'
        );
        return;
      }

      // Preparar datos para la API usando los campos planos del formulario y el cálculo del estado local
      const requestData = {
        personalData: {
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          cuil: data.cuil || '',
          email: data.email || '',
          telefono: data.telefono || '',
          fechaNacimiento: data.fechaNacimiento,
          domicilio: data.domicilio,
          ciudad: data.localidad, // el formulario usa 'localidad'
          provincia: data.provincia,
          codigoPostal: data.codigoPostal,
          estadoCivil: data.estadoCivil,
        },
        spouseData: data.tieneConyugue && data.nombreConyugue ? {
          nombreConyuge: data.nombreConyugue,
          apellidoConyuge: data.apellidoConyugue,
          cuilConyuge: data.cuilConyugue,
        } : undefined,
        employmentData: data.relacionLaboral ? {
          tipoEmpleo: data.relacionLaboral,
          tipoEmpleoOtro: data.otraRelacionLaboral,
          nombreEmpresa: data.empresa,
          telefonoEmpresa: data.telefonoEmpresa,
          experienciaLaboral: data.antiguedad,
        } : undefined,
        vehicleData: data.condicionVehiculo ? {
          condicionVehiculo: data.condicionVehiculo,
          marca: data.marca,
          modelo: data.modelo,
          anio: data.anio ? Number(data.anio) : undefined,
          version: data.version,
        } : undefined,
        calculationData: {
          vehiclePrice: calculationData.vehiclePrice,
          loanAmount: calculationData.loanAmount,
          loanTermMonths: calculationData.loanTerm, // mapeo a la API
          monthlyPayment: calculationData.monthlyPayment,
          totalAmount: calculationData.totalAmount,
          interestRate: calculationData.interestRate,
          cftAnnual: calculationData.cft,
        },
        documents: data.documentos || [],
      };

      // Enviar a la API usando credentials: include para manejo automático de cookies
      const response = await fetch('/api/loan-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Envía automáticamente las cookies HttpOnly
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (response.ok) {
        // Mostrar modal de éxito
        showModal(
          '✅ Solicitud Enviada Correctamente',
          `Su solicitud de préstamo ha sido guardada exitosamente.\n\n` +
          `Cliente: ${data.nombre} ${data.apellido}\n` +
          `Monto: $${calculationData.vehiclePrice?.toLocaleString('es-AR')}\n` +
          `Cuota: $${calculationData.monthlyPayment?.toLocaleString('es-AR')}\n` +
          `ID: ${result.applicationId}\n\n` +
          `La solicitud será procesada por nuestro equipo de análisis crediticio.`,
          'success'
        );
        
        // Limpiar datos de cálculo después del envío exitoso
        setCalculationData(null);
      } else {
        showModal(
          '❌ Error al Enviar Solicitud',
          `No se pudo guardar la solicitud: ${result.error || 'Error desconocido'}`,
          'error'
        );
      }
    } catch (error) {
      console.error('Error enviando solicitud:', error);
      showModal(
        '❌ Error de Conexión',
        'No se pudo conectar con el servidor. Verifique su conexión e intente nuevamente.',
        'error'
      );
    } finally {
      setIsSubmittingLoan(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'team') {
      fetchUsers();
    }
  }, [activeTab]);

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800 border-green-200',
      INVITED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      SUSPENDED: 'bg-red-100 text-red-800 border-red-200',
    };

    const labels = {
      ACTIVE: 'Activo',
      INVITED: 'Invitado',
      SUSPENDED: 'Suspendido',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

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
    { id: 'main', label: 'Calculadora y Solicitud', icon: Calculator },
    ...(canAccessFullDashboardValue ? [
      { id: 'team', label: 'Gestión de Equipo', icon: Users },
      { id: 'overview', label: 'Resumen', icon: TrendingUp },
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
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-20 translate-x-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-accent-500/20 rounded-full translate-y-16 -translate-x-16"></div>
        <div className="absolute top-1/2 right-1/4 w-6 h-6 bg-brand-accent-500 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute bottom-4 right-12 w-4 h-4 bg-white/40 rounded-full animate-pulse delay-300"></div>
        
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 relative z-10">
          <div className="flex justify-between items-center py-8">
            <div className="space-y-3">
              {/* Badge con gradiente */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-brand-accent-500/20 to-yellow-400/20 border border-brand-accent-500/30 backdrop-blur-sm">
                <div className="w-2 h-2 bg-brand-accent-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-bold text-white drop-shadow-sm">
                  {isExecutiveValue ? '👤 Ejecutivo de Cuentas' : '🏢 Portal Concesionario'}
                </span>
              </div>
              
              {/* Título principal */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg">
                  {isExecutiveValue ? 'Portal Ejecutivo' : 'Dashboard Concesionario'}
                </h1>
              </div>
              
              {/* Subtítulo */}
              <p className="text-brand-primary-100 text-lg drop-shadow-sm max-w-2xl">
                {isExecutiveValue ? 'Calculadora y solicitudes de crédito' : 'Gestiona tu equipo y solicitudes'}
              </p>
            </div>
            
            {/* Área de usuario y logout */}
            <div className="flex items-center space-x-4">
              {/* Info del usuario */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="text-right">
                  <div className="font-semibold">{user.firstName} {user.lastName}</div>
                  <div className="text-xs text-brand-primary-100">{user.role === 'EJECUTIVO_CUENTAS' ? 'Ejecutivo' : 'Dealer'}</div>
                </div>
              </div>
              
              {/* Botón de logout */}
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 transform hover:scale-105"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Salir</span>
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
                  <h2 className="text-2xl font-bold text-gray-900">Calculadora y Solicitud de Préstamo</h2>
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
                  <div id="loan-application-form">
                    <LoanApplicationSteps 
                      calculationResult={calculationResult}
                      calculationData={calculationData}
                      onSubmit={handleLoanSubmit}
                      isSubmitting={isSubmittingLoan}
                    />
                  </div>
                </div>

                {/* Información adicional */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-blue-900">Información Importante</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-3 p-4 bg-white/60 rounded-xl border border-blue-200">
                        <Calculator className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-semibold text-blue-900">Cálculo Preciso</p>
                          <p className="text-sm text-blue-700">CFT y cuotas calculadas automáticamente</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-white/60 rounded-xl border border-blue-200">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-semibold text-blue-900">Solicitud Completa</p>
                          <p className="text-sm text-blue-700">Todos los campos requeridos incluidos</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'team' && canManageTeamValue && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Gestión de Equipo</h2>
                  <button
                    onClick={() => setShowCreateUser(true)}
                    className="flex items-center gap-2 bg-brand-primary-600 hover:bg-brand-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Nuevo Ejecutivo
                  </button>
                </div>

                {/* Formulario para crear usuario */}
                {showCreateUser && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Crear Ejecutivo de Cuentas</h3>
                    <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                          type="text"
                          value={newUser.firstName}
                          onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
                          placeholder="Nombre"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                        <input
                          type="text"
                          value={newUser.lastName}
                          onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
                          placeholder="Apellido"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
                          placeholder="email@ejemplo.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (opcional)</label>
                        <input
                          type="tel"
                          value={newUser.phone}
                          onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
                          placeholder="+56 9 1234 5678"
                        />
                      </div>
                      <div className="md:col-span-2 flex gap-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-brand-primary-600 hover:bg-brand-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Creando...' : 'Crear Ejecutivo'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCreateUser(false)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Lista de usuarios */}
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Cargando equipo...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay ejecutivos de cuentas creados</p>
                    <p className="text-sm text-gray-400">Crea tu primer ejecutivo para comenzar</p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="divide-y divide-gray-200">
                      {users.map((user) => (
                        <div key={user.publicId} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-brand-primary-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-brand-primary-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {user.firstName} {user.lastName}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    {user.email}
                                  </span>
                                  {user.phone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="w-4 h-4" />
                                      {user.phone}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(user.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {getStatusBadge(user.status)}
                              {user.lastLoginAt && (
                                <span className="text-xs text-gray-500">
                                  Último acceso: {new Date(user.lastLoginAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'overview' && (
              <OverviewTabContent 
                refreshTrigger={calculationData ? 1 : 0}
              />
            )}

            {activeTab === 'stats' && canAccessFullDashboardValue && (
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
                        <p className="text-3xl font-bold">{users.length}</p>
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
                          <p className="font-semibold text-blue-900">Calculadora</p>
                          <p className="text-sm text-blue-700">Calcula préstamos en tiempo real</p>
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