'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Eye, User, RefreshCw, Search, X, ChevronLeft, ChevronRight, RotateCcw, AlertCircle } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import StatusBadge from './StatusBadge';
import LoanApplicationModal from './LoanApplicationModal';
import ReconsiderModal from './ReconsiderModal';

// Utilidad para obtener el token desde cookies del navegador
function getTokenFromCookies(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie?.match(/(?:^|;\s*)access_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

interface LoanApplication {
  publicId: string;
  applicantFirstName: string;
  applicantLastName: string;
  applicantCuil: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantAddress?: string;
  applicantCity?: string;
  applicantProvince?: string;
  vehiclePrice: number;
  loanAmount: number;
  monthlyPayment: number;
  loanTermMonths?: number;
  interestRate?: number;
  cftAnnual?: number;
  downPayment?: number;
  totalAmount?: number;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleCondition?: string;
  statusReason?: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'A_RECONSIDERAR';
  createdAt: string;
  reviewedAt?: string;
  dealerId: number;
  submittedByUserId: number;
}

interface OverviewTabContentProps {
  refreshTrigger?: number;
}

const statusOptions: Array<{
  value: 'ALL' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'A_RECONSIDERAR';
  label: string;
}> = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'UNDER_REVIEW', label: 'En revisión' },
  { value: 'APPROVED', label: 'Aprobadas' },
  { value: 'REJECTED', label: 'Rechazadas' },
  { value: 'CANCELLED', label: 'Canceladas' },
  { value: 'A_RECONSIDERAR', label: 'A Reconsiderar' },
];

const OverviewTabContent: React.FC<OverviewTabContentProps> = ({ refreshTrigger }) => {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReconsiderModalOpen, setIsReconsiderModalOpen] = useState(false);
  const [reconsiderApplicationId, setReconsiderApplicationId] = useState<string>('');
  const [isSubmittingReconsideration, setIsSubmittingReconsideration] = useState(false);

  // Filtros, búsqueda y paginación
  const [status, setStatus] = useState<
    'ALL' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'A_RECONSIDERAR'
  >('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Autocompletado
  const [suggestions, setSuggestions] = useState<LoanApplication[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);

  // URL sync (Next.js 15)
  const router = useRouter();
  const pathname = usePathname();
  const searchParamsHook = useSearchParams();
  const [initialized, setInitialized] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
  };

  // === Unread logic for Admin observations (statusReason) ===
  const getLocal = (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try { return localStorage.getItem(key); } catch { return null; }
  };
  const setLocal = (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(key, value); } catch {}
  };
  const ADMIN_SEEN_KEY = (id: string) => `admin_reason_last_seen_at:${id}`;
  const isAdminObservationUnread = (a: LoanApplication): boolean => {
    if (!a.statusReason) return false;
    const seenIso = getLocal(ADMIN_SEEN_KEY(a.publicId));
    const seen = seenIso ? Date.parse(seenIso) : 0;
    const when = a.reviewedAt ? Date.parse(a.reviewedAt) : 0;
    if (!when) return !seen; // si no hay fecha, mostrar si nunca se marcó como visto
    return when > seen;
  };
  const markAdminObservationRead = (publicId: string, whenIso?: string) => {
    const stamp = whenIso && whenIso.length > 0 ? whenIso : new Date().toISOString();
    setLocal(ADMIN_SEEN_KEY(publicId), stamp);
  };

  // Cerrar sugerencias al hacer click afuera o presionar ESC
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (!searchRef.current) return;
      if (!searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);
  const fetchApplications = useCallback(async (opts?: { abortSignal?: AbortSignal }) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (status !== 'ALL') params.set('status', status);
      if (search.trim()) params.set('search', search.trim());
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));

      const token = getTokenFromCookies();
      const response = await fetch(`/api/loan-applications?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: opts?.abortSignal,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setApplications(data.items || []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [status, search, page, pageSize]);

  const fetchSuggestions = useCallback(async (opts?: { abortSignal?: AbortSignal }) => {
    try {
      const q = search.trim();
      if (!q) {
        setSuggestions([]);
        return;
      }
      const params = new URLSearchParams({ page: '1', pageSize: '5', search: q });
      if (status !== 'ALL') params.set('status', status);

      const token = getTokenFromCookies();
      const res = await fetch(`/api/loan-applications?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: opts?.abortSignal,
      });
      if (!res.ok) return;
      const data = await res.json();
      setSuggestions(Array.isArray(data.items) ? data.items : []);
    } catch {
      // Silenciar errores en sugerencias
    }
  }, [status, search]);

  // Inicializar estado desde la URL una sola vez
  useEffect(() => {
    if (initialized) return;
    const sp = new URLSearchParams(searchParamsHook?.toString() || '');
    const qs = sp.get('search') ?? '';
    const st = sp.get('status') as any;
    const pg = parseInt(sp.get('page') || '1', 10);
    const ps = parseInt(sp.get('pageSize') || '10', 10);
    if (qs) setSearch(qs);
    if (st && ['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED', 'A_RECONSIDERAR'].includes(st)) setStatus(st);
    if (!Number.isNaN(pg)) setPage(pg);
    if (!Number.isNaN(ps)) setPageSize(ps);
    setInitialized(true);
  }, [searchParamsHook, initialized]);

  // Sincronizar URL cuando cambian los filtros (sin recargar)
  useEffect(() => {
    if (!initialized) return;
    const sp = new URLSearchParams();
    if (status !== 'ALL') sp.set('status', status);
    if (search.trim()) sp.set('search', search.trim());
    sp.set('page', String(page));
    sp.set('pageSize', String(pageSize));
    const next = sp.toString();
    const current = searchParamsHook?.toString() || '';
    if (next !== current) {
      router.replace(`${pathname}?${next}`, { scroll: false });
    }
  }, [status, search, page, pageSize, initialized, router, pathname, searchParamsHook]);

  // Fetch principal según filtros/paginación
  useEffect(() => {
    if (!initialized) return;
    const ac = new AbortController();
    fetchApplications({ abortSignal: ac.signal });
    return () => ac.abort();
  }, [refreshTrigger, initialized, fetchApplications]);

  // Debounce de búsqueda + sugerencias
  useEffect(() => {
    if (!initialized) return;
    const ac = new AbortController();
    const t = setTimeout(() => {
      setPage(1);
      fetchApplications({ abortSignal: ac.signal });
      fetchSuggestions({ abortSignal: ac.signal });
      setShowSuggestions(true);
    }, 350);
    return () => {
      ac.abort();
      clearTimeout(t);
    };
  }, [search, initialized, fetchApplications, fetchSuggestions]);

  const handleRefresh = () => {
    fetchApplications();
  };

  const handleViewDetails = async (application: LoanApplication) => {
    // Abrimos el modal y mostramos datos básicos mientras se carga el detalle
    setIsModalOpen(true);
    setSelectedApplication(application);

    // Marcar observación del admin como leída al abrir
    try {
      markAdminObservationRead(application.publicId, application.reviewedAt);
    } catch {}

    try {
      const token = getTokenFromCookies();
      const res = await fetch(`/api/loan-applications/${application.publicId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      if (!res.ok) {
        console.warn('⚠️ No se pudo obtener el detalle, usando datos básicos', res.status, res.statusText);
        return;
      }
      const data = await res.json();
      if (data?.success && data?.data) {
        setSelectedApplication(data.data);
      }
    } catch (e) {
      console.error('Error cargando detalle de solicitud:', e);
      // Dejamos los datos básicos ya seteados como fallback
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
  };

  const handleStatusChange = (
    next: 'ALL' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'A_RECONSIDERAR'
  ) => {
    setStatus(next);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleClearSearch = () => {
    setSearch('');
    setSuggestions([]);
    setShowSuggestions(false);
    setPage(1);
  };

  const handleSelectSuggestion = (s: LoanApplication) => {
    const q =
      s.applicantCuil ||
      s.applicantEmail ||
      s.applicantPhone ||
      `${s.applicantFirstName} ${s.applicantLastName}`;
    setSearch(q);
    setShowSuggestions(false);
    setPage(1);
  };

  const handleReconsider = (publicId: string) => {
    setReconsiderApplicationId(publicId);
    setIsReconsiderModalOpen(true);
  };

  const handleReconsiderSubmit = async (data: { reason: string; files: File[] }) => {
    setIsSubmittingReconsideration(true);
    
    try {
      const formData = new FormData();
      formData.append('reason', data.reason);
      
      // Agregar archivos al FormData
      data.files.forEach((file) => {
        formData.append('files', file);
      });

      const token = getTokenFromCookies();
      const response = await fetch(`/api/loan-applications/${reconsiderApplicationId}/reconsider`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Refrescar la lista de aplicaciones
      fetchApplications();
      
      // Cerrar modal
      setIsReconsiderModalOpen(false);
      setReconsiderApplicationId('');
      
      // TODO: Mostrar mensaje de éxito (podríamos agregar un toast/modal de confirmación)
      console.log('Reconsideración enviada exitosamente:', result);
      
    } catch (error) {
      console.error('Error al enviar reconsideración:', error);
      // TODO: Mostrar mensaje de error
    } finally {
      setIsSubmittingReconsideration(false);
    }
  };

  const handleReconsiderCancel = () => {
    setIsReconsiderModalOpen(false);
    setReconsiderApplicationId('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Resumen de Solicitudes</h2>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-brand-primary-600 bg-brand-primary-50 rounded-lg hover:bg-brand-primary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Buscador con autocompletado */}
        <div className="relative w-full md:max-w-md" ref={searchRef}>
          <label htmlFor="dashboard-search" className="sr-only">
            Buscar
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="dashboard-search"
              value={search}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Buscar por nombre, CUIL, email o teléfono"
              className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary-200 focus:border-brand-primary-400 dark:bg-white dark:text-gray-900"
              autoComplete="off"
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
                aria-label="Limpiar búsqueda"
                title="Limpiar búsqueda"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <ul
              role="listbox"
              className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto"
            >
              {suggestions.map((s) => (
                <li
                  key={s.publicId}
                  role="option"
                  aria-selected={false}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectSuggestion(s);
                  }}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center">
                    <span className="font-medium text-sm text-gray-900">
                      {s.applicantFirstName} {s.applicantLastName}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {s.applicantCuil && <>CUIL {s.applicantCuil} · </>}
                    {s.applicantEmail} · {s.applicantPhone}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Filtro por estado */}
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleStatusChange(opt.value)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                status === opt.value
                  ? 'bg-brand-primary-600 text-white border-brand-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">Error al cargar solicitudes: {error}</p>
          <div className="mt-3 flex gap-2">
            {error.includes('sesión ha expirado') ? (
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium transition-colors"
              >
                Recargar página
              </button>
            ) : (
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium transition-colors"
              >
                Intentar nuevamente
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Cargando solicitudes...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay solicitudes para mostrar</p>
          <p className="text-sm text-gray-400">Las nuevas solicitudes aparecerán aquí.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-xl ring-1 ring-gray-300">
          <table className="min-w-[900px] w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600">
                <th className="px-4 py-3 border-b">Solicitante</th>
                <th className="px-4 py-3 border-b">Préstamo</th>
                <th className="px-4 py-3 border-b">Cuota</th>
                <th className="px-4 py-3 border-b">Fecha</th>
                <th className="px-4 py-3 border-b">Estado</th>
                <th className="px-4 py-3 border-b text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-900">
              {applications.map((app: LoanApplication) => (
                <tr key={app.publicId} className={`${app.status === 'PENDING' ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-gray-50'}`}>
                  <td className={`px-4 py-3 align-middle ${app.status === 'PENDING' ? 'border-l-4 border-brand-accent-500' : ''}`}>
                    <div className="flex items-center gap-3">
                      {app.status === 'PENDING' && (
                        <span
                          className="inline-block w-2 h-2 rounded-full bg-brand-accent-500 animate-pulse"
                          title="Pendiente"
                          aria-label="Pendiente"
                        ></span>
                      )}
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-brand-primary-100 to-brand-primary-200 shadow-sm">
                        <User className="w-4 h-4 text-brand-primary-600" />
                      </div>
                      <div>
                        <div className="font-medium">{app.applicantFirstName} {app.applicantLastName}</div>
                        <div className="text-xs text-gray-500">{app.applicantEmail} · {app.applicantPhone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="font-semibold">{formatCurrency(app.loanAmount)}</div>
                    <div className="text-xs text-gray-500">Monto</div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="font-semibold">{formatCurrency(app.monthlyPayment)}</div>
                    <div className="text-xs text-gray-500">Mensual</div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="font-medium">{new Date(app.createdAt).toLocaleDateString('es-AR')}</div>
                    <div className="text-xs text-gray-500">Solicitud</div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={app.status} type="application" />
                      {app.statusReason && isAdminObservationUnread(app) && (
                        <span
                          title={app.statusReason}
                          aria-label="Observación del administrador (no leída)"
                          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-50 border border-yellow-200"
                        >
                          <AlertCircle className="w-3.5 h-3.5 text-brand-accent-500" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => handleViewDetails(app)}
                        className="inline-flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                      
                      {app.status === 'REJECTED' && (
                        <button
                          onClick={() => handleReconsider(app.publicId)}
                          className="inline-flex items-center justify-center p-2 hover:bg-orange-50 rounded-lg transition-colors text-orange-600 hover:text-orange-700"
                          title="Solicitar reconsideración"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} de {total}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-2 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                title="Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm">Página {page} de {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-2 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                title="Siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(parseInt(e.target.value));
                  setPage(1);
                }}
                className="ml-2 border rounded-lg px-2 py-1 text-sm"
                aria-label="Tamaño de página"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      <LoanApplicationModal
        application={selectedApplication}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Modal de reconsideración */}
      <ReconsiderModal
        isOpen={isReconsiderModalOpen}
        onClose={handleReconsiderCancel}
        onSubmit={handleReconsiderSubmit}
        applicationId={reconsiderApplicationId}
        isLoading={isSubmittingReconsideration}
      />
    </div>
  );
};

export default OverviewTabContent;
