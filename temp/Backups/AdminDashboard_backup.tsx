'use client';

import { useState, useEffect, useMemo } from 'react';
import { Check, X, Clock, Building2, Mail, Phone, MapPin, Calendar, Search, Filter, Eye, MoreHorizontal, User } from 'lucide-react';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import Link from 'next/link';

interface Dealer {
  id: string;
  legalName: string;
  tradeName: string;
  cuit: string;
  email: string;
  phone: string;
  addressStreet: string;
  addressCity: string;
  addressProvince: string;
  status: string;
  createdAt: string;
  owner?: {
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
  };
  users?: Array<{
    publicId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
  }>;
}

export default function AdminDealers() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  type ModalType = 'success' | 'error' | 'warning' | 'info';
  const [modalState, setModalState] = useState<{ isOpen: boolean; title: string; message: string; type: ModalType }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });
  const showModal = (title: string, message: unknown, type: ModalType = 'info') => {
    const safeMessage =
      typeof message === 'string'
        ? message
        : message instanceof Error
          ? message.message
          : (() => {
              try {
                return JSON.stringify(message);
              } catch {
                return 'Error desconocido';
              }
            })();
    setModalState({ isOpen: true, title, message: safeMessage, type });
  };
  const closeModal = () => setModalState((prev) => ({ ...prev, isOpen: false }));

  const fetchDealers = async (status: string = 'PENDING_APPROVAL') => {
    try {
      const response = await fetch(`/api/admin/dealers?status=${encodeURIComponent(status)}`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });

      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        let message = `Error ${response.status}`;
        if (contentType.includes('application/json')) {
          try {
            const err = await response.json();
            message = err.error || err.message || message;
          } catch {}
        } else {
          try {
            const text = await response.text();
            message = text?.slice(0, 300) || message;
          } catch {}
        }
        showModal('❌ Error al cargar', message, 'error');
        setDealers([]);
        return;
      }

      if (!contentType.includes('application/json')) {
        const text = await response.text();
        showModal('❌ Respuesta inválida', 'El servidor devolvió un contenido no-JSON.', 'error');
        console.error('Non-JSON response for GET /api/admin/dealers:', text.slice(0, 300));
        setDealers([]);
        return;
      }

      const data = await response.json();
      if (data?.success && Array.isArray(data.dealers)) {
        setDealers(data.dealers);
        // Contar dealers pendientes para mostrar advertencia
        const pending = data.dealers.filter((dealer: Dealer) => dealer.status === 'PENDING_APPROVAL').length;
        setPendingCount(pending);
      } else {
        showModal('❌ Error de datos', 'Formato de respuesta inválido', 'error');
        setDealers([]);
        setPendingCount(0);
      }
    } catch (error) {
      console.error('Error fetching dealers:', error);
      showModal('❌ Error de Conexión', 'No se pudo conectar con el servidor. Intenta nuevamente.', 'error');
      setDealers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (dealerId: string, action: 'approve' | 'reject', reason?: string) => {
    setProcessingId(dealerId);
    try {
      const response = await fetch('/api/admin/dealers', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ dealerId, action, reason }),
      });

      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        let message = `Error ${response.status}`;
        if (contentType.includes('application/json')) {
          try {
            const err = await response.json();
            message = err.error || err.message || message;
          } catch {}
        } else {
          try {
            const text = await response.text();
            message = text?.slice(0, 300) || message;
          } catch {}
        }
        showModal('❌ Error', message, 'error');
        return;
      }

      if (!contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response for POST /api/admin/dealers:', text.slice(0, 300));
        showModal('❌ Respuesta inválida', 'El servidor devolvió un contenido no-JSON.', 'error');
        return;
      }

      const data = await response.json();
      if (data?.success) {
        await fetchDealers(selectedStatus);
        showModal('✅ Operación exitosa', data.message || 'Acción realizada correctamente.', 'success');
      } else {
        showModal('❌ Error', data?.error || 'Error al procesar solicitud', 'error');
      }
    } catch (error) {
      console.error('Error processing dealer:', error);
      showModal('❌ Error de Conexión', 'No se pudo conectar con el servidor. Intenta nuevamente.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // Filtrar dealers por término de búsqueda y estado
  const filteredDealers = useMemo(() => {
    let filtered = dealers;
    
    // Filtrar por estado
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(dealer => dealer.status === selectedStatus);
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(dealer => 
        dealer.tradeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dealer.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dealer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dealer.cuit.includes(searchTerm)
      );
    }
    
    return filtered;
  }, [dealers, searchTerm, selectedStatus]);

  useEffect(() => {
    fetchDealers('ALL'); // Siempre cargar todos los dealers
  }, []);

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      APPROVED: 'bg-green-100 text-green-800 border-green-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
      SUSPENDED: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    const labels = {
      PENDING_APPROVAL: 'Pendiente',
      APPROVED: 'Aprobado',
      REJECTED: 'Rechazado',
      SUSPENDED: 'Suspendido',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getSelectedLabel = () => {
    switch (selectedStatus) {
      case 'ALL':
        return 'Todos los estados';
      case 'PENDING_APPROVAL':
        return 'Pendientes';
      case 'APPROVED':
        return 'Aprobados';
      case 'REJECTED':
        return 'Rechazados';
      case 'SUSPENDED':
        return 'Suspendidos';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50 relative overflow-hidden">
      {/* Header Compacto */}
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
                <h1 className="text-2xl font-bold text-white">Gestión de Concesionarios</h1>
                <p className="text-brand-primary-100 text-sm">Administra y supervisa concesionarios</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-white/90 text-sm font-medium">{dealers.length} concesionarios</div>
                <div className="text-brand-primary-200 text-xs">
                  {pendingCount > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 mr-2">
                      {pendingCount} pendientes
                    </span>
                  )}
                  {getSelectedLabel()}
                </div>
              </div>
              <Link
                href="/admin/loans"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm transition-all"
              >
                Ver Préstamos
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 sm:px-8 py-6 relative">
        {/* Filtros y búsqueda compactos */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100/50 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SUSPENDED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    selectedStatus === status
                      ? 'bg-brand-primary-600 text-white border-brand-primary-700 shadow-sm'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                  }`}
                >
                  {status === 'ALL' && 'Todos'}
                  {status === 'PENDING_APPROVAL' && 'Pendientes'}
                  {status === 'APPROVED' && 'Aprobados'}
                  {status === 'REJECTED' && 'Rechazados'}
                  {status === 'SUSPENDED' && 'Suspendidos'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 w-full lg:w-80 bg-white border-2 border-gray-300 rounded-lg px-3 py-2 shadow-sm">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, email o CUIT..."
                className="flex-1 outline-none text-sm text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Tabla de Concesionarios */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Concesionarios ({filteredDealers.length})
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedStatus === 'PENDING_APPROVAL' && 'Solicitudes pendientes de aprobación'}
                  {selectedStatus === 'APPROVED' && 'Concesionarios aprobados'}
                  {selectedStatus === 'REJECTED' && 'Solicitudes rechazadas'}
                  {selectedStatus === 'SUSPENDED' && 'Concesionarios suspendidos'}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary-600"></div>
              <span className="ml-2 text-gray-600">Cargando...</span>
            </div>
          ) : filteredDealers.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay concesionarios</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'No se encontraron resultados para tu búsqueda' : 'No hay concesionarios en este estado'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Concesionario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ubicación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDealers.map((dealer) => (
                    <tr key={dealer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-brand-primary-600 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{dealer.tradeName}</div>
                            <div className="text-sm text-gray-500">{dealer.legalName}</div>
                            <div className="text-xs text-gray-400">CUIT: {dealer.cuit}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{dealer.email}</div>
                        <div className="text-sm text-gray-500">{dealer.phone}</div>
                        {dealer.owner && (
                          <div className="text-xs text-gray-400">
                            {dealer.owner.firstName} {dealer.owner.lastName}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{dealer.addressCity}</div>
                        <div className="text-sm text-gray-500">{dealer.addressProvince}</div>
                        <div className="text-xs text-gray-400">{dealer.addressStreet}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(dealer.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(dealer.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedDealer(dealer);
                            setIsModalOpen(true);
                          }}
                          className="text-brand-primary-600 hover:text-brand-primary-900 mr-3"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                      {selectedStatus === 'PENDING_APPROVAL' && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApproveReject(dealer.id, 'approve')}
                              disabled={processingId === dealer.id}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                              {processingId === dealer.id ? (
                                <Clock className="w-3 h-3 animate-spin mr-1" />
                              ) : (
                                <Check className="w-3 h-3 mr-1" />
                              )}
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleApproveReject(dealer.id, 'reject', 'No cumple requisitos')}
                              disabled={processingId === dealer.id}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Rechazar
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />

      {/* Modal de detalles del concesionario */}
      {isModalOpen && selectedDealer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-brand-primary-600 to-brand-primary-700 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{selectedDealer.tradeName}</h3>
                    <p className="text-brand-primary-100 text-sm">{selectedDealer.legalName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-brand-primary-600" />
                    Información del Concesionario
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nombre Comercial</label>
                      <p className="text-sm text-gray-900">{selectedDealer.tradeName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Razón Social</label>
                      <p className="text-sm text-gray-900">{selectedDealer.legalName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">CUIT</label>
                      <p className="text-sm text-gray-900">{selectedDealer.cuit}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Estado</label>
                      <div className="mt-1">{getStatusBadge(selectedDealer.status)}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-brand-primary-600" />
                    Información de Contacto
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm text-gray-900">{selectedDealer.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Teléfono</label>
                      <p className="text-sm text-gray-900">{selectedDealer.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Dirección</label>
                      <p className="text-sm text-gray-900">{selectedDealer.addressStreet}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Ubicación</label>
                      <p className="text-sm text-gray-900">{selectedDealer.addressCity}, {selectedDealer.addressProvince}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información del responsable */}
              {selectedDealer.owner && (
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-brand-primary-600" />
                    Responsable Principal
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
                      <p className="text-sm text-gray-900">
                        {selectedDealer.owner.firstName} {selectedDealer.owner.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm text-gray-900">{selectedDealer.owner.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Fecha de Registro</label>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedDealer.owner.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Ejecutivos de cuenta */}
              {selectedDealer.users && selectedDealer.users.length > 0 && (
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-brand-primary-600" />
                    Ejecutivos de Cuenta ({selectedDealer.users.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedDealer.users.map((user, index) => (
                      <div key={user.publicId} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-brand-primary-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                            <p className="text-xs text-gray-400">
                              {user.role} • {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Información adicional */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-brand-primary-600" />
                  Información Adicional
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fecha de Solicitud</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedDealer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer con acciones */}
            {selectedDealer.status === 'PENDING_APPROVAL' && (
              <div className="border-t bg-gray-50 px-6 py-4 rounded-b-xl">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      handleApproveReject(selectedDealer.id, 'reject');
                      setIsModalOpen(false);
                    }}
                    disabled={processingId === selectedDealer.id}
                    className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Rechazar
                  </button>
                  <button
                    onClick={() => {
                      handleApproveReject(selectedDealer.id, 'approve');
                      setIsModalOpen(false);
                    }}
                    disabled={processingId === selectedDealer.id}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Aprobar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}