'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authFetch } from '@/lib/authFetch';

// Tipos de datos
export interface User { 
  publicId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: string;
  createdAt: string;
  lastLoginAt?: string;
  role?: string;
}

export interface LoanApplication {
  [key: string]: any;
}

type ModalType = 'success' | 'error' | 'warning' | 'info';

// Datos seleccionados desde la Calculadora (lo que emite onCalculationComplete)
export interface CalculationSelection {
  vehiclePrice: number;
  downPayment?: number;
  loanTerm: number;           // meses
  interestRate: number;       // tasa en decimal
  loanAmount: number;         // desembolso neto
  monthlyPayment: number;     // cuota mensual
  totalAmount: number;        // suma de cuotas
  cft: number;                // CFT efectivo anual (decimal)
}

export const usePortalDashboard = () => {
  const { user, loading: authLoading, canManageTeam, canAccessFullDashboard, isExecutive } = useAuth();

  // --- MODAL STATE & HANDLERS ---
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as ModalType,
  });

  const showModal = (title: string, message: string, type: ModalType = 'info') => {
    setModalState({ isOpen: true, title, message, type });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  // Ahora usamos authFetch que adjunta Authorization automáticamente y maneja auto-refresh

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

  // Permisos (valores booleanos directos para usar en el hook)
  const canManageTeamValue = canManageTeam();
  const canAccessFullDashboardValue = canAccessFullDashboard();
  const isExecutiveValue = isExecutive();

  // Estados del dashboard
  const [activeTab, setActiveTab] = useState('main');
  const [team, setTeam] = useState<User[]>([]);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [calculationData, setCalculationData] = useState<CalculationSelection | null>(null);
  const [isSubmittingLoan, setIsSubmittingLoan] = useState(false);
  const [newExecutive, setNewExecutive] = useState({ email: '', firstName: '', lastName: '', phone: '' });
  const mainTabRef = useRef<HTMLDivElement>(null);
  const [overviewRefreshTick, setOverviewRefreshTick] = useState(0);

  // Redirección si no está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/';
    }
  }, [user, authLoading]);

  // Forzar pestaña para ejecutivos
  useEffect(() => {
    if (isExecutiveValue && activeTab !== 'main') {
      setActiveTab('main');
    }
  }, [isExecutiveValue, activeTab]);

  // --- LÓGICA DE OBTENCIÓN DE DATOS ---
  const fetchTeam = useCallback(async () => {
    console.log('🔍 fetchTeam called - canManageTeamValue:', canManageTeamValue);
    if (!canManageTeamValue) {
      console.log('❌ No puede gestionar equipo, saliendo de fetchTeam');
      return;
    }
    setTeamLoading(true);
    console.log('📡 Haciendo llamada a /api/dealer/users');
    try {
      const response = await authFetch('/api/dealer/users');
      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📡 Response data:', data);
      if (data.success) {
        console.log('✅ Datos recibidos exitosamente, usuarios:', data.users.length);
        setTeam(data.users);
      } else {
        console.log('❌ Error en respuesta:', data.error);
        showModal('Error de Red', data.error || 'No se pudo obtener la lista de usuarios.', 'error');
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      showModal('Error de Conexión', 'No se pudo conectar con el servidor para obtener los usuarios.', 'error');
    } finally {
      setTeamLoading(false);
    }
  }, [canManageTeamValue]);

  const fetchApplications = useCallback(async () => {
    if (!user) return;
    setApplicationsLoading(true);
    try {
      const response = await authFetch('/api/loan-applications/my-applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      } else {
        showModal('Error de Red', 'No se pudo obtener la lista de solicitudes.', 'error');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      showModal('Error de Conexión', 'No se pudo conectar con el servidor para obtener las solicitudes.', 'error');
    } finally {
      setApplicationsLoading(false);
    }
  }, [user]);

  // Efecto para cargar datos según la pestaña activa
  useEffect(() => {
    if (activeTab === 'team') fetchTeam();
    else if (activeTab === 'overview') fetchApplications();
  }, [activeTab, user, fetchTeam, fetchApplications]);

  // --- MANEJADORES DE EVENTOS ---
  const handleCreateExecutive = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamLoading(true);
    try {
      const response = await authFetch('/api/dealer/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExecutive),
      });
      const data = await response.json();
      if (data.success) {
        showModal('✅ Ejecutivo Creado', `El usuario ${newExecutive.email} ha sido creado y recibirá un correo para establecer su contraseña.`, 'success');
        setNewExecutive({ email: '', firstName: '', lastName: '', phone: '' });
        setShowCreateUser(false);
        fetchTeam();
      } else {
        showModal('❌ Error al Crear', data.error || 'No se pudo crear el ejecutivo. Verifique los datos.', 'error');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      showModal('❌ Error de Conexión', 'No se pudo conectar con el servidor para crear el usuario.', 'error');
    } finally {
      setTeamLoading(false);
    }
  };

  // Suspender ejecutivo (PATCH status: SUSPENDED)
  const handleSuspendExecutive = async (target: User) => {
    setTeamLoading(true);
    try {
      const response = await authFetch(`/api/dealer/users/${target.publicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SUSPENDED' }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && (data as any).success) {
        showModal('✅ Usuario suspendido', `${target.email} fue suspendido correctamente.`, 'success');
        fetchTeam();
      } else {
        showModal('❌ No se pudo suspender', (data as any).error || `Error ${response.status}`, 'error');
      }
    } catch (error) {
      console.error('Error suspendiendo usuario:', error);
      showModal('❌ Error de Conexión', 'No se pudo conectar con el servidor.', 'error');
    } finally {
      setTeamLoading(false);
    }
  };

  // Activar ejecutivo (PATCH status: ACTIVE)
  const handleActivateExecutive = async (target: User) => {
    setTeamLoading(true);
    try {
      const response = await authFetch(`/api/dealer/users/${target.publicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE' }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && (data as any).success) {
        showModal('✅ Usuario activado', `${target.email} fue activado correctamente.`, 'success');
        fetchTeam();
      } else {
        showModal('❌ No se pudo activar', (data as any).error || `Error ${response.status}`, 'error');
      }
    } catch (error) {
      console.error('Error activando usuario:', error);
      showModal('❌ Error de Conexión', 'No se pudo conectar con el servidor.', 'error');
    } finally {
      setTeamLoading(false);
    }
  };

  // Eliminar ejecutivo (soft-delete)
  const handleDeleteExecutive = async (target: User) => {
    setTeamLoading(true);
    try {
      const response = await authFetch(`/api/dealer/users/${target.publicId}`, {
        method: 'DELETE',
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && (data as any).success !== false) {
        showModal('🗑️ Usuario eliminado', `${target.email} fue eliminado correctamente.`, 'success');
        fetchTeam();
      } else {
        showModal('❌ No se pudo eliminar', (data as any).error || `Error ${response.status}`, 'error');
      }
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      showModal('❌ Error de Conexión', 'No se pudo conectar con el servidor.', 'error');
    } finally {
      setTeamLoading(false);
    }
  };

  const handleLoanSubmit = async (formData: any) => {
    setIsSubmittingLoan(true);
    try {
      // Validación: debe existir un cálculo previo seleccionado
      if (!calculationData) {
        showModal(
          '⚠️ Falta el Cálculo',
          'Debe realizar y seleccionar un cálculo de préstamo antes de enviar la solicitud.',
          'warning'
        );
        setIsSubmittingLoan(false);
        return;
      }

      // Construir el objeto base con los datos siempre presentes
      const baseData: any = {
        personalData: {
          nombre: formData.nombre,
          apellido: formData.apellido,
          cuil: formData.cuil,
          email: formData.email,
          telefono: formData.telefono,
          fechaNacimiento: formData.fechaNacimiento,
          domicilio: formData.domicilio,
          ciudad: formData.localidad,
          provincia: formData.provincia,
          codigoPostal: formData.codigoPostal,
          estadoCivil: formData.estadoCivil,
        },
        documents: [],
      };

      // 1. Añadir datos del cónyuge solo si existen (mapeo a nombres esperados por la API)
      if (formData.tieneConyugue && formData.nombreConyugue) {
        baseData.spouseData = {
          nombreConyuge: formData.nombreConyugue,
          apellidoConyuge: formData.apellidoConyugue,
          cuilConyuge: formData.cuilConyugue,
          ingresoConyuge: formData.ingresoConyugue ? Number(formData.ingresoConyugue) : undefined,
        };
      }

      // 2. Añadir datos laborales solo si existen
      if (formData.relacionLaboral) {
        baseData.employmentData = {
          tipoEmpleo: formData.relacionLaboral,
          tipoEmpleoOtro: formData.otraRelacionLaboral,
          nombreEmpresa: formData.empresa,
          telefonoEmpresa: formData.telefonoEmpresa,
          experienciaLaboral: formData.antiguedad,
        };
      }

      // 3. Añadir datos del vehículo solo si existen (mapeo a nombres esperados por la API)
      if (formData.condicionVehiculo) {
        baseData.vehicleData = {
          condicionVehiculo: formData.condicionVehiculo,
          marca: formData.marca,
          modelo: formData.modelo,
          anio: formData.anio ? Number(formData.anio) : undefined,
          version: formData.version,
        };
      }
      
      // 4. Añadir datos de cálculo solo si existen (mapeo exacto desde LoanCalculator hacia la API)
      if (calculationData) {
        baseData.calculationData = {
          vehiclePrice: calculationData.vehiclePrice,
          loanAmount: calculationData.loanAmount,
          loanTermMonths: calculationData.loanTerm, // API espera loanTermMonths
          monthlyPayment: calculationData.monthlyPayment,
          totalAmount: calculationData.totalAmount,
          interestRate: calculationData.interestRate,
          cftAnnual: calculationData.cft, // API espera cftAnnual
        };
      }
      // 5. Subir archivos primero (si hay), recibir URLs y agregarlas al metadata
      if (Array.isArray(formData.documentos) && formData.documentos.length > 0) {
        try {
          const uploadForm = new FormData();
          for (const file of formData.documentos as File[]) {
            uploadForm.append('files', file);
          }
          const uploadResp = await authFetch('/api/uploads/loan-docs', {
            method: 'POST',
            body: uploadForm,
          });
          const uploadJson = await uploadResp.json();
          if (!uploadResp.ok || !uploadJson?.success) {
            throw new Error(uploadJson?.error || `Error al subir archivos (${uploadResp.status})`);
          }
          baseData.documents = (uploadJson.files || []).map((f: any) => ({
            name: f.name,
            size: f.size,
            type: f.type,
            url: f.url,
            storagePath: f.storagePath,
          }));
        } catch (err) {
          console.error('❌ Error subiendo documentos:', err);
          showModal('❌ Error al Subir Documentos', err instanceof Error ? err.message : 'No se pudieron subir los archivos. Intente nuevamente.', 'error');
          setIsSubmittingLoan(false);
          return;
        }
      }

      // 6. Enviar la solicitud con metadata + URLs
      const response = await authFetch('/api/loan-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(baseData),
      });
      const result = await response.json();
      if (response.ok) {
        showModal('✅ Solicitud Enviada', `La solicitud para ${formData.nombre} ${formData.apellido} (ID: ${result.applicationId}) fue enviada correctamente.`, 'success');
        setCalculationData(null);
        fetchApplications();
        setOverviewRefreshTick(prev => prev + 1);
      } else {
        showModal('❌ Error en la Solicitud', result.error || 'Ocurrió un error desconocido al enviar la solicitud.', 'error');
      }
    } catch (error) {
      console.error('Error submitting loan:', error);
      showModal('❌ Error de Conexión', error instanceof Error ? error.message : 'No se pudo conectar con el servidor para enviar la solicitud.', 'error');
    } finally {
      setIsSubmittingLoan(false);
    }
  };
  
  const handleCalculationComplete = (data: CalculationSelection) => {
    setCalculationData(data);
    if (mainTabRef.current) {
      mainTabRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return {
    // Auth and user data
    user,
    authLoading,
    handleLogout,
    canManageTeam: canManageTeamValue,
    canAccessFullDashboard: canAccessFullDashboardValue,
    isExecutive: isExecutiveValue,

    // Modal state and handlers
    modalState,
    showModal,
    closeModal,

    // Tabs state
    activeTab,
    setActiveTab,

    // Main Tab state and handlers
    calculationData,
    handleCalculationComplete,
    handleLoanSubmit,
    isSubmittingLoan,
    mainTabRef,

    // Team Tab state and handlers
    team,
    teamLoading,
    showCreateUser,
    setShowCreateUser,
    newExecutive,
    setNewExecutive,
    handleCreateExecutive,
    handleSuspendExecutive,
    handleActivateExecutive,
    handleDeleteExecutive,
    
    // Overview Tab state and handlers
    applications,
    applicationsLoading,
    overviewRefreshTick,
  };
};
