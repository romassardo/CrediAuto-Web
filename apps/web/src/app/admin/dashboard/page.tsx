'use client';

import { useState, useEffect } from 'react';
import { Check, X, Eye, Clock, Building2, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

interface Dealer {
  id: string;
  legalName: string;
  tradeName: string;
  rut: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  createdAt: string;
  owner: {
    publicId: string;
    email: string;
    firstName: string;
    lastName: string;
    status: string;
    createdAt: string;
  } | null;
}

export default function AdminDashboard() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('PENDING_APPROVAL');
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  type ModalType = 'success' | 'error' | 'warning' | 'info';
  const [modalState, setModalState] = useState<{ isOpen: boolean; title: string; message: string; type: ModalType }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });
  const showModal = (title: string, message: string, type: ModalType = 'info') => {
    setModalState({ isOpen: true, title, message, type });
  };
  const closeModal = () => setModalState((prev) => ({ ...prev, isOpen: false }));

  const fetchDealers = async (status: string = 'PENDING_APPROVAL') => {
    try {
      const response = await fetch(`/api/admin/dealers?status=${status}`, { credentials: 'include' });
      const data = await response.json();
      
      if (data.success) {
        setDealers(data.dealers);
      }
    } catch (error) {
      console.error('Error fetching dealers:', error);
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
        },
        body: JSON.stringify({
          dealerId,
          action,
          reason,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Actualizar la lista
        await fetchDealers(selectedStatus);
        showModal('✅ Operación exitosa', data.message || 'Acción realizada correctamente.', 'success');
      } else {
        showModal('❌ Error', data.error || 'Error al procesar solicitud', 'error');
      }
    } catch (error) {
      console.error('Error processing dealer:', error);
      showModal('❌ Error de Conexión', 'No se pudo conectar con el servidor. Intenta nuevamente.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchDealers(selectedStatus);
  }, [selectedStatus]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-brand-primary-600/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-brand-accent-500/10 rounded-full blur-xl animate-bounce"></div>
      
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-100 relative z-10">
        <div className="container mx-auto px-6 sm:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="space-y-2">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-brand-primary-600/10 border border-brand-primary-600/20">
                <span className="text-sm font-medium text-brand-primary-600">🏢 Panel Administrativo</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Dashboard Administrativo</h1>
              <p className="text-xl text-gray-600">Gestión de concesionarios y solicitudes</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-brand-primary-600 to-brand-primary-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-brand-primary-600/25 flex items-center gap-3">
                <Building2 className="w-5 h-5" />
                <span className="font-semibold">Admin Panel</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 sm:px-8 py-12 relative">
        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100/50 p-8 mb-8 relative overflow-hidden">
          {/* Elementos decorativos del header */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary-600/5 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-brand-accent-500/10 rounded-full translate-y-8 -translate-x-8"></div>
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-brand-primary-600 rounded-full flex items-center justify-center shadow-sm">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Filtrar Concesionarios</h2>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {[
                { value: 'PENDING_APPROVAL', label: 'Pendientes', count: dealers.length },
                { value: 'APPROVED', label: 'Aprobados', count: 0 },
                { value: 'REJECTED', label: 'Rechazados', count: 0 },
                { value: 'SUSPENDED', label: 'Suspendidos', count: 0 },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedStatus(filter.value)}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 shadow-sm ${
                    selectedStatus === filter.value
                      ? 'bg-gradient-to-r from-brand-primary-600 to-brand-primary-700 text-white shadow-lg shadow-brand-primary-600/25'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                  }`}
                >
                  {filter.label}
                  {selectedStatus === filter.value && (
                    <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs font-bold">
                      {dealers.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de Concesionarios */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100/50 relative overflow-hidden">
          <div className="bg-gradient-to-r from-brand-primary-600 via-brand-primary-700 to-brand-primary-800 px-8 py-6 relative overflow-hidden">
            {/* Elementos decorativos del header */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-accent-500/20 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative">
              <h2 className="text-2xl font-bold text-white">
                Concesionarios {selectedStatus === 'PENDING_APPROVAL' ? 'Pendientes de Aprobación' : ''}
              </h2>
              <p className="text-brand-primary-100 mt-1">Gestiona las solicitudes de registro</p>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary-600/20 border-t-brand-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">Cargando concesionarios...</p>
            </div>
          ) : dealers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay concesionarios</h3>
              <p className="text-gray-500">No se encontraron concesionarios en este estado</p>
            </div>
          ) : (
            <div className="p-8">
              <div className="space-y-6">
                {dealers.map((dealer) => (
                  <div key={dealer.id} className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl border border-gray-200 hover:shadow-lg hover:border-brand-primary-200 transition-all transform hover:scale-[1.01]">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-brand-primary-600 to-brand-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{dealer.tradeName}</h3>
                            {getStatusBadge(dealer.status)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                            <Building2 className="w-5 h-5 text-brand-primary-600" />
                            <div>
                              <p className="font-medium text-gray-900">{dealer.legalName}</p>
                              <p className="text-gray-500 text-xs">Razón Social</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                            <Mail className="w-5 h-5 text-brand-primary-600" />
                            <div>
                              <p className="font-medium text-gray-900">{dealer.email}</p>
                              <p className="text-gray-500 text-xs">Email</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                            <Phone className="w-5 h-5 text-brand-primary-600" />
                            <div>
                              <p className="font-medium text-gray-900">{dealer.phone}</p>
                              <p className="text-gray-500 text-xs">Teléfono</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                            <MapPin className="w-5 h-5 text-brand-primary-600" />
                            <div>
                              <p className="font-medium text-gray-900">{dealer.address}, {dealer.city}</p>
                              <p className="text-gray-500 text-xs">Dirección</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                            <Calendar className="w-5 h-5 text-brand-primary-600" />
                            <div>
                              <p className="font-medium text-gray-900">{new Date(dealer.createdAt).toLocaleDateString()}</p>
                              <p className="text-gray-500 text-xs">Fecha de registro</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                            <div className="w-5 h-5 bg-brand-accent-500 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-900">#</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{dealer.rut}</p>
                              <p className="text-gray-500 text-xs">RUT</p>
                            </div>
                          </div>
                        </div>

                        {dealer.owner && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">{dealer.owner.firstName[0]}</span>
                              </div>
                              <div>
                                <p className="font-semibold text-blue-900">
                                  {dealer.owner.firstName} {dealer.owner.lastName}
                                </p>
                                <p className="text-blue-700 text-sm">{dealer.owner.email}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {selectedStatus === 'PENDING_APPROVAL' && (
                        <div className="flex items-center gap-3 ml-6">
                          <button
                            onClick={() => setSelectedDealer(dealer)}
                            className="p-3 text-gray-600 hover:text-brand-primary-600 hover:bg-brand-primary-50 rounded-xl transition-all transform hover:scale-110"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          
                          <button
                            onClick={() => handleApproveReject(dealer.id, 'approve')}
                            disabled={processingId === dealer.id}
                            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 shadow-lg shadow-green-600/25 disabled:opacity-50 disabled:transform-none"
                          >
                            {processingId === dealer.id ? (
                              <Clock className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            Aprobar
                          </button>
                          
                          <button
                            onClick={() => handleApproveReject(dealer.id, 'reject', 'No cumple requisitos')}
                            disabled={processingId === dealer.id}
                            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 shadow-lg shadow-red-600/25 disabled:opacity-50 disabled:transform-none"
                          >
                            <X className="w-4 h-4" />
                            Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
    </div>
  );
}