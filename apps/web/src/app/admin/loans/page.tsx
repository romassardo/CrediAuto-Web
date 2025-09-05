"use client";

import { useEffect, useState, useCallback } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import AdminNavigation from "@/components/admin/AdminNavigation";
import { Check, X, Search, Calendar, Clock, Eye, FileText, User, Building, DollarSign, Car, Heart, Download, ExternalLink, Briefcase, MapPin } from "lucide-react";

// Tipos alineados con /api/admin/loan-applications (GET)
interface AdminLoanApplication {
  id: number;
  publicId: string;
  clientFirstName: string;
  clientLastName: string;
  clientDni: string;
  clientEmail: string;
  clientPhone: string;
  vehiclePrice: number;
  loanAmount: number;
  monthlyPayment: number;
  loanTerm: number;
  cft: number;
  status: string;
  createdAt: string;
  reviewedAt?: string;
  // Campos adicionales del vehículo
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleVersion?: string;
  vehicleCondition?: string;
  // Campos adicionales del cónyuge
  spouseFirstName?: string;
  spouseLastName?: string;
  spouseCuil?: string;
  spouseIncome?: number | string;
  // Campos adicionales de dirección y empleo
  applicantFirstName?: string;
  applicantLastName?: string;
  applicantCuil?: string;
  applicantEmail?: string;
  applicantPhone?: string;
  applicantAddress?: string;
  applicantCity?: string;
  applicantProvince?: string;
  applicantPostalCode?: string;
  applicantMaritalStatus?: string;
  applicantBirthDate?: string;
  employmentType?: string;
  employmentTypeOther?: string;
  companyName?: string;
  companyPhone?: string;
  workExperience?: string;
  dealer: {
    companyName: string;
  };
  submittedByUser: {
    firstName: string;
    lastName: string;
    email: string;
  };
  documentsMetadata?: any[];
  // Datos de submisión con estructura anidada
  submissionData?: {
    vehicleData?: {
      marca: string;
      modelo: string;
      anio: number;
      version: string;
      condicionVehiculo: string;
    };
    spouseData?: {
      nombreConyuge: string;
      apellidoConyuge: string;
      cuilConyuge: string;
    };
    personalData?: any;
    employmentData?: any;
    calculationData?: any;
    documents?: any[];
  };
  // Campos de reconsideración
  reconsiderationRequested?: boolean;
  reconsiderationReason?: string;
  reconsiderationRequestedAt?: string;
  reconsiderationReviewedAt?: string;
  reconsiderationReviewedByUserId?: number;
  reconsiderationDocumentsMetadata?: any;
}

type ModalType = "success" | "error" | "warning" | "info";

export default function AdminLoansPage() {
  const [apps, setApps] = useState<AdminLoanApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'A_RECONSIDERAR'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [selectedApp, setSelectedApp] = useState<AdminLoanApplication | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: ModalType;
  }>({ isOpen: false, title: "", message: "", type: "info" });

  const showModal = (title: string, message: unknown, type: ModalType = "info") => {
    const safeMessage =
      typeof message === "string"
        ? message
        : message instanceof Error
        ? message.message
        : (() => {
            try {
              return JSON.stringify(message);
            } catch {
              return "Error desconocido";
            }
          })();
    setModalState({ isOpen: true, title, message: safeMessage, type });
  };
  const closeModal = () => setModalState((prev) => ({ ...prev, isOpen: false }));

  // Función para obtener token de cookies
  const getTokenFromCookies = (): string | null => {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'access_token') {
        return decodeURIComponent(value);
      }
    }
    return null;
  };

  const handleOpenDetailsModal = async (app: AdminLoanApplication) => {
    setIsModalOpen(true);
    
    try {
      const token = getTokenFromCookies();
      const response = await fetch(`/api/admin/loan-applications/${app.publicId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('🔎 Admin detalle - respuesta API', result);
      if (result.success && result.data) {
        console.log('✅ Seteando selectedApp con detalle', {
          publicId: result.data.publicId,
          spouseIncome: result.data.spouseIncome,
          status: result.data.status,
          reconsiderationRequested: result.data.reconsiderationRequested,
          hasReconsiderationDocs: !!result.data.reconsiderationDocumentsMetadata
        });
        setSelectedApp(result.data);
      } else {
        throw new Error('No se pudieron obtener los detalles');
      }
    } catch (error) {
      console.error('Error al obtener detalles:', error);
      showModal('Error', 'No se pudieron cargar los detalles de la solicitud', 'error');
      setSelectedApp(app); // Fallback a datos básicos
    }
  };

  const handleCloseDetailsModal = () => {
    setIsModalOpen(false);
    setSelectedApp(null);
  };

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (statusFilter && statusFilter !== "ALL") params.set("status", statusFilter);
      if (searchTerm.trim()) params.set("search", searchTerm.trim());

      const token = getTokenFromCookies();
      const response = await fetch(`/api/admin/loan-applications?${params.toString()}`, {
        credentials: "include",
        headers: {
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const contentType = response.headers.get("content-type") || "";

      if (!response.ok) {
        let message = `Error ${response.status}`;
        if (contentType.includes("application/json")) {
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
        showModal("❌ Error al cargar", message, "error");
        setApps([]);
        setTotalPages(1);
        setTotalCount(0);
        return;
      }

      if (!contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response for GET /api/admin/loan-applications:", text.slice(0, 300));
        showModal("❌ Respuesta inválida", "El servidor devolvió un contenido no-JSON.", "error");
        setApps([]);
        setTotalPages(1);
        setTotalCount(0);
        return;
      }

      const data = await response.json();
      if (data?.success && data?.data?.applications) {
        setApps(data.data.applications as AdminLoanApplication[]);
        const p = data.data.pagination;
        setTotalPages(p?.totalPages ?? 1);
        setTotalCount(p?.totalCount ?? 0);
      } else {
        showModal("❌ Error", data?.error || "Respuesta inválida del servidor", "error");
        setApps([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      showModal("❌ Error de Conexión", "No se pudo conectar con el servidor. Intenta nuevamente.", "error");
      setApps([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, searchTerm, limit]);

  // Ejecuta la carga cada vez que cambien filtros/paginación
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Debug cuando cambia el detalle seleccionado
  useEffect(() => {
    if (!selectedApp) return;
    try {
      const recMeta = selectedApp.reconsiderationDocumentsMetadata;
      const parsed = typeof recMeta === 'string' ? JSON.parse(recMeta) : recMeta;
      const recCount = Array.isArray(parsed) ? parsed.length : 0;
      console.log('🧩 SelectedApp cambiado', {
        publicId: selectedApp.publicId,
        spouseIncome: selectedApp.spouseIncome,
        status: selectedApp.status,
        reconsiderationRequested: selectedApp.reconsiderationRequested,
        recDocsCount: recCount
      });
    } catch (e) {
      console.log('🧩 SelectedApp cambiado (sin parse docs)', {
        publicId: selectedApp.publicId,
        spouseIncome: selectedApp.spouseIncome,
        status: selectedApp.status,
        reconsiderationRequested: selectedApp.reconsiderationRequested,
      });
    }
  }, [selectedApp]);

  const updateStatus = async (
    applicationPublicId: string,
    nextStatus: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED"
  ) => {
    setProcessingId(applicationPublicId);
    try {
      const token = getTokenFromCookies();
      const response = await fetch("/api/admin/loan-applications", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ applicationId: applicationPublicId, status: nextStatus }),
      });

      const contentType = response.headers.get("content-type") || "";

      if (!response.ok) {
        let message = `Error ${response.status}`;
        if (contentType.includes("application/json")) {
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
        showModal("❌ Error", message, "error");
        return;
      }

      if (!contentType.includes("application/json")) {
        const text = await response.text();
        console.error(
          "Non-JSON response for PATCH /api/admin/loan-applications:",
          text.slice(0, 300)
        );
        showModal("❌ Respuesta inválida", "El servidor devolvió un contenido no-JSON.", "error");
        return;
      }

      const data = await response.json();
      if (data?.success) {
        await fetchApplications();
        showModal(
          "✅ Operación exitosa",
          data.message || "Solicitud actualizada correctamente.",
          "success"
        );
      } else {
        showModal("❌ Error", data?.error || "No se pudo actualizar la solicitud.", "error");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showModal("❌ Error", "No se pudo actualizar la solicitud.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-yellow-500 text-white border-yellow-600 shadow-sm font-semibold",
      UNDER_REVIEW: "bg-blue-500 text-white border-blue-600 shadow-sm font-semibold",
      APPROVED: "bg-green-500 text-white border-green-600 shadow-sm font-semibold",
      REJECTED: "bg-red-500 text-white border-red-600 shadow-sm font-semibold",
      CANCELLED: "bg-gray-500 text-white border-gray-600 shadow-sm font-semibold",
      A_RECONSIDERAR: "bg-orange-500 text-white border-orange-600 shadow-sm font-semibold",
    };
    const labels: Record<string, string> = {
      PENDING: "Pendiente",
      UNDER_REVIEW: "En revisión",
      APPROVED: "Aprobada",
      REJECTED: "Rechazada",
      CANCELLED: "Cancelada",
      A_RECONSIDERAR: "A Reconsiderar",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          styles[status] || ""
        }`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const formatMoney = (n: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

  const formatDate = (s?: string) => (s ? new Date(s).toLocaleDateString() : "-");

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50 relative overflow-hidden">
      {/* Nueva Navegación Admin */}
      <AdminNavigation 
        title="Solicitudes de Préstamo"
        subtitle="Gestiona las solicitudes de financiamiento"
        stats={{
          count: totalCount,
          label: "solicitudes"
        }}
      />

      <div className="container mx-auto px-6 sm:px-8 py-6 relative">
        {/* Filtros y búsqueda compactos */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100/50 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {(["ALL", "PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "CANCELLED", "A_RECONSIDERAR"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => { setStatusFilter(st); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    statusFilter === st
                      ? "bg-brand-primary-600 text-white border-brand-primary-700 shadow-sm"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
                  }`}
                >
                  {st === "ALL" && "Todos"}
                  {st === "PENDING" && "Pendientes"}
                  {st === "UNDER_REVIEW" && "En Revisión"}
                  {st === "APPROVED" && "Aprobadas"}
                  {st === "REJECTED" && "Rechazadas"}
                  {st === "CANCELLED" && "Canceladas"}
                  {st === "A_RECONSIDERAR" && "A Reconsiderar"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 w-full lg:w-80 bg-white border-2 border-gray-300 rounded-lg px-3 py-2 shadow-sm">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                placeholder="Buscar por nombre, DNI, email..."
                className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Tabla moderna y densa */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100/50 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-brand-primary-600/20 border-t-brand-primary-600 mx-auto"></div>
              <p className="mt-3 text-gray-600 text-sm">Cargando solicitudes...</p>
            </div>
          ) : apps.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No hay solicitudes</h3>
              <p className="text-gray-500 text-sm">No se encontraron solicitudes para este filtro</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Solicitante
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Préstamo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Dealer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {apps.map((a) => (
                    <tr key={a.publicId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-brand-primary-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">
                              {a.clientFirstName} {a.clientLastName}
                            </div>
                            <div className="text-xs text-gray-500">DNI: {a.clientDni}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{a.clientEmail}</div>
                        <div className="text-xs text-gray-500">{a.clientPhone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-gray-900">{formatMoney(a.loanAmount)}</div>
                        <div className="text-xs text-gray-500">
                          {formatMoney(a.monthlyPayment)} × {a.loanTerm}m
                        </div>
                        <div className="text-xs text-brand-primary-600">CFT: {(a.cft || 0).toFixed(2)}%</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Building className="w-3 h-3 text-gray-400" />
                          <div className="text-sm text-gray-900 truncate max-w-32">
                            {a.dealer.companyName}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(a.status)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{formatDate(a.createdAt)}</div>
                        {a.reviewedAt && (
                          <div className="text-xs text-gray-500">Rev: {formatDate(a.reviewedAt)}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenDetailsModal(a)}
                            className="p-1.5 rounded-lg text-brand-primary-600 hover:bg-brand-primary-50 transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {a.status !== "APPROVED" && a.status !== "REJECTED" && (
                            <button
                              onClick={() => updateStatus(a.publicId, "UNDER_REVIEW")}
                              disabled={processingId === a.publicId}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
                              title="Marcar en revisión"
                            >
                              {processingId === a.publicId ? (
                                <Clock className="w-4 h-4 animate-spin" />
                              ) : (
                                <Clock className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          {a.status !== "APPROVED" && (
                            <button
                              onClick={() => updateStatus(a.publicId, "APPROVED")}
                              disabled={processingId === a.publicId}
                              className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                              title="Aprobar"
                            >
                              {processingId === a.publicId ? (
                                <Clock className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          {a.status !== "REJECTED" && (
                            <button
                              onClick={() => updateStatus(a.publicId, "REJECTED")}
                              disabled={processingId === a.publicId}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                              title="Rechazar"
                            >
                              {processingId === a.publicId ? (
                                <Clock className="w-4 h-4 animate-spin" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación compacta */}
          {!loading && totalPages > 1 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 border border-gray-200 disabled:opacity-50 transition-colors"
              >
                Anterior
              </button>
              <div className="text-sm text-gray-600">
                Página {page} de {totalPages} • {totalCount} solicitudes
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 border border-gray-200 disabled:opacity-50 transition-colors"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles */}
      {isModalOpen && selectedApp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-brand-primary-600 via-brand-primary-700 to-brand-primary-800 px-6 py-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-12 translate-x-12"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {selectedApp.clientFirstName} {selectedApp.clientLastName}
                    </h2>
                    <p className="text-brand-primary-100 text-sm">Solicitud de Préstamo</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(selectedApp.status)}
                  <button
                    onClick={handleCloseDetailsModal}
                    className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información Personal */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <User className="w-4 h-4 text-brand-primary-600" />
                    <h3 className="font-semibold text-gray-900">Información Personal</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</label>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedApp.applicantFirstName || selectedApp.clientFirstName} {selectedApp.applicantLastName || selectedApp.clientLastName}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">CUIL</label>
                      <div className="text-sm text-gray-900">{selectedApp.applicantCuil || selectedApp.clientDni}</div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
                      <div className="text-sm text-gray-900">{selectedApp.applicantEmail || selectedApp.clientEmail}</div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</label>
                      <div className="text-sm text-gray-900">{selectedApp.applicantPhone || selectedApp.clientPhone}</div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Nacimiento</label>
                      <div className="text-sm text-gray-900">
                        {selectedApp.applicantBirthDate ? formatDate(selectedApp.applicantBirthDate) : '-'}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Estado Civil</label>
                      <div className="text-sm text-gray-900 capitalize">
                        {selectedApp.applicantMaritalStatus || '-'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información de Dirección */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <MapPin className="w-4 h-4 text-brand-primary-600" />
                    <h3 className="font-semibold text-gray-900">Información de Dirección</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</label>
                      <div className="text-sm text-gray-900">
                        {selectedApp.applicantAddress || '-'}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Ciudad</label>
                        <div className="text-sm text-gray-900">{selectedApp.applicantCity || '-'}</div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Código Postal</label>
                        <div className="text-sm text-gray-900">{selectedApp.applicantPostalCode || '-'}</div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Provincia</label>
                      <div className="text-sm text-gray-900">{selectedApp.applicantProvince || '-'}</div>
                    </div>
                  </div>
                </div>

                {/* Información Laboral */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <Briefcase className="w-4 h-4 text-brand-primary-600" />
                    <h3 className="font-semibold text-gray-900">Información Laboral</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Empleo</label>
                      <div className="text-sm text-gray-900 capitalize">
                        {selectedApp.employmentType?.replace('_', ' ') || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</label>
                      <div className="text-sm text-gray-900">{selectedApp.companyName || '-'}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono Empresa</label>
                        <div className="text-sm text-gray-900">{selectedApp.companyPhone || '-'}</div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Experiencia</label>
                        <div className="text-sm text-gray-900">
                          {selectedApp.workExperience ? `${selectedApp.workExperience} años` : '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información del Préstamo */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <DollarSign className="w-4 h-4 text-brand-primary-600" />
                    <h3 className="font-semibold text-gray-900">Información del Préstamo</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Monto del Vehículo</label>
                      <div className="text-sm font-semibold text-gray-900">{formatMoney(selectedApp.vehiclePrice)}</div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Monto del Préstamo</label>
                      <div className="text-sm font-semibold text-gray-900">{formatMoney(selectedApp.loanAmount)}</div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Cuota Mensual</label>
                      <div className="text-sm font-semibold text-gray-900">{formatMoney(selectedApp.monthlyPayment)}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Plazo</label>
                        <div className="text-sm text-gray-900">{selectedApp.loanTerm} meses</div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">CFT</label>
                        <div className="text-sm font-semibold text-brand-primary-600">{(selectedApp.cft || 0).toFixed(2)}%</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información del Vehículo */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <Car className="w-4 h-4 text-brand-primary-600" />
                    <h3 className="font-semibold text-gray-900">Información del Vehículo</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Marca y Modelo</label>
                      <div className="text-sm text-gray-900">
                        {selectedApp.submissionData?.vehicleData ? 
                          `${selectedApp.submissionData.vehicleData.marca} ${selectedApp.submissionData.vehicleData.modelo}` :
                          `${selectedApp.vehicleBrand || '-'} ${selectedApp.vehicleModel || '-'}`
                        }
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Año</label>
                        <div className="text-sm text-gray-900">
                          {selectedApp.submissionData?.vehicleData?.anio || selectedApp.vehicleYear || '-'}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Versión</label>
                        <div className="text-sm text-gray-900">
                          {selectedApp.submissionData?.vehicleData?.version || selectedApp.vehicleVersion || '-'}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Condición</label>
                        <div className="text-sm text-gray-900 capitalize">
                          {selectedApp.submissionData?.vehicleData?.condicionVehiculo || selectedApp.vehicleCondition || '-'}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</label>
                        <div className="text-sm font-semibold text-gray-900">{formatMoney(selectedApp.vehiclePrice)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información del Cónyuge */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <Heart className="w-4 h-4 text-brand-primary-600" />
                    <h3 className="font-semibold text-gray-900">Información del Cónyuge</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</label>
                      <div className="text-sm text-gray-900">
                        {selectedApp.submissionData?.spouseData ? 
                          `${selectedApp.submissionData.spouseData.nombreConyuge?.trim()} ${selectedApp.submissionData.spouseData.apellidoConyuge}` :
                          selectedApp.spouseFirstName && selectedApp.spouseLastName ?
                          `${selectedApp.spouseFirstName} ${selectedApp.spouseLastName}` :
                          'No registrado'
                        }
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">CUIL</label>
                      <div className="text-sm text-gray-900">
                        {selectedApp.submissionData?.spouseData?.cuilConyuge || selectedApp.spouseCuil || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Ingreso del Cónyuge</label>
                      <div className="text-sm font-semibold text-gray-900">
                        {selectedApp.spouseIncome !== undefined && selectedApp.spouseIncome !== null && String(selectedApp.spouseIncome) !== ''
                          ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(
                              typeof selectedApp.spouseIncome === 'string' ? parseFloat(selectedApp.spouseIncome) : selectedApp.spouseIncome
                            )
                          : 'No registrado'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información del Dealer */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <Building className="w-4 h-4 text-brand-primary-600" />
                    <h3 className="font-semibold text-gray-900">Concesionario</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</label>
                      <div className="text-sm font-medium text-gray-900">{selectedApp.dealer?.companyName || '-'}</div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Enviado por</label>
                      <div className="text-sm text-gray-900">
                        {selectedApp.submittedByUser?.firstName || ''} {selectedApp.submittedByUser?.lastName || ''}
                      </div>
                      <div className="text-xs text-gray-500">{selectedApp.submittedByUser?.email || '-'}</div>
                    </div>
                  </div>
                </div>

                {/* Información de Solicitud */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <Calendar className="w-4 h-4 text-brand-primary-600" />
                    <h3 className="font-semibold text-gray-900">Información de Solicitud</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Creación</label>
                      <div className="text-sm text-gray-900">{formatDate(selectedApp.createdAt)}</div>
                    </div>
                    {selectedApp.reviewedAt && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Revisión</label>
                        <div className="text-sm text-gray-900">{formatDate(selectedApp.reviewedAt)}</div>
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Estado Actual</label>
                      <div className="mt-1">{getStatusBadge(selectedApp.status)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documentación Subida */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 pb-4 border-b border-gray-200">
                  <FileText className="w-4 h-4 text-brand-primary-600" />
                  <h3 className="font-semibold text-gray-900">Documentación Subida</h3>
                </div>
                <div className="mt-4">
                  {selectedApp.documentsMetadata && Array.isArray(selectedApp.documentsMetadata) && selectedApp.documentsMetadata.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedApp.documentsMetadata.map((doc: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                          <div className="w-8 h-8 bg-brand-primary-600 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {doc.name || `Documento ${index + 1}`}
                            </div>
                            <div className="text-xs text-gray-500">
                              {doc.size ? `${Math.round(doc.size / 1024)} KB` : 'Tamaño desconocido'}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {doc.url && (
                              <>
                                <button
                                  onClick={() => window.open(doc.url, '_blank')}
                                  className="p-1.5 rounded-lg text-brand-primary-600 hover:bg-brand-primary-50 transition-colors"
                                  title="Ver documento"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = doc.url;
                                    link.download = doc.name || `documento-${index + 1}`;
                                    link.click();
                                  }}
                                  className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                                  title="Descargar documento"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Sin documentos</h4>
                      <p className="text-xs text-gray-500">No se han subido documentos para esta solicitud</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Documentos de Reconsideración */}
              {(selectedApp.reconsiderationRequested || selectedApp.status === 'A_RECONSIDERAR' || !!selectedApp.reconsiderationDocumentsMetadata) && (
                <div className="mt-6 pt-6 border-t border-orange-200">
                  <div className="flex items-center gap-2 pb-4">
                    <FileText className="w-4 h-4 text-orange-600" />
                    <h3 className="font-semibold text-gray-900">Documentos de Reconsideración</h3>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-1 text-sm text-orange-800">
                      <Calendar className="w-4 h-4 text-orange-600" />
                      <span>
                        Solicitada el {selectedApp.reconsiderationRequestedAt ? new Date(selectedApp.reconsiderationRequestedAt).toLocaleString('es-AR') : 'Fecha no disponible'}
                      </span>
                    </div>
                    {selectedApp.reconsiderationReason && (
                      <p className="text-sm text-orange-700"><strong>Motivo:</strong> {selectedApp.reconsiderationReason}</p>
                    )}
                  </div>
                  {(() => {
                    try {
                      const parsed = typeof selectedApp.reconsiderationDocumentsMetadata === 'string'
                        ? JSON.parse(selectedApp.reconsiderationDocumentsMetadata)
                        : selectedApp.reconsiderationDocumentsMetadata;
                      const docs = Array.isArray(parsed) ? parsed : [];
                      if (docs.length === 0) {
                        return (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <FileText className="w-8 h-8 text-orange-400" />
                            </div>
                            <h4 className="text-sm font-medium text-gray-900 mb-1">Sin documentos de reconsideración</h4>
                            <p className="text-xs text-gray-500">No se han subido documentos para la reconsideración</p>
                          </div>
                        );
                      }
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {docs.map((doc: any, index: number) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors">
                              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                                <FileText className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">{doc.name || `Documento ${index + 1}`}</div>
                                <div className="text-xs text-gray-500">{doc.size ? `${Math.round(doc.size / 1024)} KB` : 'Tamaño desconocido'}</div>
                              </div>
                              <div className="flex items-center gap-1">
                                {doc.url && (
                                  <>
                                    <button onClick={() => window.open(doc.url, '_blank')} className="p-1.5 rounded-lg text-orange-600 hover:bg-orange-100 transition-colors" title="Ver documento">
                                      <ExternalLink className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => { const link = document.createElement('a'); link.href = doc.url; link.download = doc.name || `documento-recon-${index + 1}`; link.click(); }} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors" title="Descargar documento">
                                      <Download className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    } catch (e) {
                      console.error('Error parsing reconsideration documents metadata:', e);
                      return (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <X className="w-8 h-8 text-red-400" />
                          </div>
                          <p className="text-xs text-gray-500">No se pudieron leer los documentos de reconsideración</p>
                        </div>
                      );
                    }
                  })()}
                </div>
              )}

              {/* Acciones del modal */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-3 justify-end">
                  {selectedApp.status !== "APPROVED" && selectedApp.status !== "REJECTED" && (
                    <button
                      onClick={() => {
                        updateStatus(selectedApp.publicId, "UNDER_REVIEW");
                        handleCloseDetailsModal();
                      }}
                      disabled={processingId === selectedApp.publicId}
                      className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow disabled:opacity-50 flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      Marcar en Revisión
                    </button>
                  )}
                  {selectedApp.status !== "APPROVED" && (
                    <button
                      onClick={() => {
                        updateStatus(selectedApp.publicId, "APPROVED");
                        handleCloseDetailsModal();
                      }}
                      disabled={processingId === selectedApp.publicId}
                      className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 hover:bg-green-700 text-white shadow disabled:opacity-50 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Aprobar Solicitud
                    </button>
                  )}
                  {selectedApp.status !== "REJECTED" && (
                    <button
                      onClick={() => {
                        updateStatus(selectedApp.publicId, "REJECTED");
                        handleCloseDetailsModal();
                      }}
                      disabled={processingId === selectedApp.publicId}
                      className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white shadow disabled:opacity-50 flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Rechazar Solicitud
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
