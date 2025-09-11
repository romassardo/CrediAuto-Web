import React from 'react';
import { FileText, X, Calendar, User, Heart, MapPin, Briefcase, Car, Calculator, Building, Eye, Download, Phone, Mail, Hash, DollarSign, UserCheck, Clock, ExternalLink, AlertCircle, MessageSquare } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface LoanApplication {
  publicId: string;
  applicantFirstName: string;
  applicantLastName: string;
  applicantCuil: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantBirthDate?: string;
  applicantAddress?: string;
  applicantCity?: string;
  applicantProvince?: string;
  applicantPostalCode?: string;
  applicantMaritalStatus?: string;
  spouseFirstName?: string;
  spouseLastName?: string;
  spouseCuil?: string;
  spouseIncome?: number | string;
  employmentType?: string;
  employmentTypeOther?: string;
  companyName?: string;
  companyPhone?: string;
  workExperience?: string;
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
  vehicleVersion?: string;
  vehicleCondition?: string;
  documentsMetadata?: any;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'A_RECONSIDERAR';
  statusReason?: string;
  reviewedAt?: string;
  reviewedByUserId?: number;
  submissionData?: any;
  calculationData?: any;
  createdAt: string;
  updatedAt?: string;
  dealerId: number;
  executiveId?: number;
  submittedByUserId: number;
  // Campos de reconsideración
  reconsiderationRequested?: boolean;
  reconsiderationReason?: string;
  reconsiderationRequestedAt?: string;
  reconsiderationReviewedAt?: string;
  reconsiderationReviewedByUserId?: number;
  reconsiderationDocumentsMetadata?: any;
  dealer?: {
    id: number;
    legalName?: string;
    tradeName: string;
    cuit?: string;
    email?: string;
    phone?: string;
    addressStreet?: string;
    addressCity?: string;
    addressProvince?: string;
    postalCode?: string;
    status: string;
  };
  executive?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
  };
  submittedByUser?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email: string;
    role: string;
  };
}

interface LoanApplicationModalProps {
  application: LoanApplication | null;
  isOpen: boolean;
  onClose: () => void;
}

const LoanApplicationModal: React.FC<LoanApplicationModalProps> = ({ application, isOpen, onClose }) => {
  if (!isOpen || !application) return null;

  // Debug logs
  console.log('🔍 Modal Debug - Application data:', {
    publicId: application.publicId,
    spouseIncome: application.spouseIncome,
    reconsiderationRequested: application.reconsiderationRequested,
    status: application.status,
    reconsiderationDocumentsMetadata: application.reconsiderationDocumentsMetadata
  });

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(num);
  };

  const formatPercentage = (value: number | string | undefined) => {
    if (!value) return 'N/A';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'N/A';
    return `${numValue.toFixed(2)}%`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-primary-600 via-brand-primary-700 to-brand-primary-800 px-6 py-4 rounded-t-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {application.applicantFirstName} {application.applicantLastName}
                </h2>
                <p className="text-brand-primary-100 text-sm">Solicitud de Préstamo</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={application.status} type="application" />
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Observación del Administrador (motivo de rechazo o requerimiento) */}
          {application.statusReason && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="text-red-800 font-semibold">Observación del Administrador</h3>
                  <p className="text-sm text-red-700 mt-1 whitespace-pre-wrap">{application.statusReason}</p>
                </div>
              </div>
            </div>
          )}

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
                        {application.applicantFirstName} {application.applicantLastName}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">CUIL</label>
                      <div className="text-sm text-gray-900">{application.applicantCuil}</div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
                      <div className="text-sm text-gray-900">{application.applicantEmail}</div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</label>
                      <div className="text-sm text-gray-900">{application.applicantPhone}</div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Nacimiento</label>
                      <div className="text-sm text-gray-900">
                        {application.applicantBirthDate ? new Date(application.applicantBirthDate).toLocaleDateString('es-AR') : '-'}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Estado Civil</label>
                      <div className="text-sm text-gray-900 capitalize">
                        {application.applicantMaritalStatus || '-'}
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
                        {application.applicantAddress || '-'}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Ciudad</label>
                        <div className="text-sm text-gray-900">{application.applicantCity || '-'}</div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Código Postal</label>
                        <div className="text-sm text-gray-900">{application.applicantPostalCode || '-'}</div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Provincia</label>
                      <div className="text-sm text-gray-900">{application.applicantProvince || '-'}</div>
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
                        {application.spouseFirstName && application.spouseLastName 
                          ? `${application.spouseFirstName} ${application.spouseLastName}` 
                          : 'No registrado'}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">CUIL</label>
                      <div className="text-sm text-gray-900">
                        {application.spouseCuil || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Ingreso del Cónyuge</label>
                      <div className="text-sm font-semibold text-gray-900">
                        {application.spouseIncome !== undefined && application.spouseIncome !== null && String(application.spouseIncome) !== ''
                          ? formatCurrency(application.spouseIncome)
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
                      <div className="text-sm font-medium text-gray-900">{application.dealer?.tradeName || '-' }</div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Enviado por</label>
                      <div className="text-sm text-gray-900">
                        {application.submittedByUser?.firstName || ''} {application.submittedByUser?.lastName || ''}
                      </div>
                      <div className="text-xs text-gray-500">{application.submittedByUser?.email || '-'}</div>
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
                        {application.employmentType?.replace('_', ' ') || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</label>
                      <div className="text-sm text-gray-900">{application.companyName || '-'}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono Empresa</label>
                        <div className="text-sm text-gray-900">{application.companyPhone || '-'}</div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Experiencia</label>
                        <div className="text-sm text-gray-900">
                          {application.workExperience ? `${application.workExperience} años` : '-'}
                        </div>
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
                        {`${application.vehicleBrand || '-'} ${application.vehicleModel || '-'}`}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Año</label>
                        <div className="text-sm text-gray-900">
                          {application.vehicleYear || '-'}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Versión</label>
                        <div className="text-sm text-gray-900">
                          {application.vehicleVersion || '-'}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Condición</label>
                        <div className="text-sm text-gray-900 capitalize">
                          {application.vehicleCondition || '-'}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</label>
                        <div className="text-sm font-semibold text-gray-900">{formatCurrency(application.vehiclePrice)}</div>
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
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(application.vehiclePrice)}</div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Monto del Préstamo</label>
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(application.loanAmount)}</div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Cuota Mensual</label>
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(application.monthlyPayment)}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Plazo</label>
                        <div className="text-sm text-gray-900">{application.loanTermMonths} meses</div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">CFT</label>
                        <div className="text-sm font-semibold text-brand-primary-600">{formatPercentage(application.cftAnnual)}</div>
                      </div>
                    </div>
                  </div>
                </div>

          </div>

          {/* Documentación Subida */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 pb-4">
              <FileText className="w-4 h-4 text-brand-primary-600" />
              <h3 className="font-semibold text-gray-900">Documentación Subida</h3>
            </div>
            {(() => {
              let documents = [];
              try {
                if (application.documentsMetadata) {
                  const parsed = typeof application.documentsMetadata === 'string' 
                    ? JSON.parse(application.documentsMetadata) 
                    : application.documentsMetadata;
                  documents = Array.isArray(parsed) ? parsed : [];
                }
              } catch (e) {
                console.error('Error parsing documents metadata:', e);
              }

              if (documents.length === 0) {
                return (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Sin documentos</h4>
                    <p className="text-xs text-gray-500">No se han subido documentos para esta solicitud</p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {documents.map((doc: any, index: number) => (
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
              );
            })()}
          </div>

          {/* Documentos de Reconsideración */}
          {(application.reconsiderationRequested || application.status === 'A_RECONSIDERAR' || !!application.reconsiderationDocumentsMetadata) && (
            <div className="mt-6 pt-6 border-t border-orange-200">
              <div className="flex items-center gap-2 pb-4">
                <FileText className="w-4 h-4 text-orange-600" />
                <h3 className="font-semibold text-gray-900">Documentos de Reconsideración</h3>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-1 text-sm text-orange-800">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <span>
                    Solicitada el {application.reconsiderationRequestedAt ? new Date(application.reconsiderationRequestedAt).toLocaleString('es-AR') : 'Fecha no disponible'}
                  </span>
                </div>
              </div>

              {/* Hilo de Observaciones (ordenado por fecha) */}
              {(application.statusReason || application.reconsiderationReason) && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 pb-2">
                    <MessageSquare className="w-4 h-4 text-brand-primary-600" />
                    <h4 className="font-semibold text-gray-900">Hilo de Observaciones</h4>
                  </div>
                  {(() => {
                    const items: Array<{
                      who: 'ADMIN' | 'DEALER';
                      at?: string;
                      text: string;
                    }> = [];
                    if (application.statusReason) {
                      items.push({ who: 'ADMIN', at: application.reviewedAt, text: application.statusReason });
                    }
                    if (application.reconsiderationReason) {
                      items.push({ who: 'DEALER', at: application.reconsiderationRequestedAt, text: application.reconsiderationReason });
                    }
                    items.sort((a, b) => {
                      const ta = a.at ? Date.parse(a.at) : 0;
                      const tb = b.at ? Date.parse(b.at) : 0;
                      return ta - tb;
                    });
                    return (
                      <div className="space-y-3">
                        {items.map((m, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${m.who === 'ADMIN' ? 'bg-brand-primary-600' : 'bg-orange-600'}`}>{m.who === 'ADMIN' ? 'A' : 'D'}</div>
                            <div className="flex-1">
                              <div className="text-xs text-gray-500">{m.who === 'ADMIN' ? 'Admin' : 'Concesionario'} • {m.at ? new Date(m.at).toLocaleString('es-AR') : 'Fecha no disponible'}</div>
                              <div className={`mt-1 p-3 rounded-lg whitespace-pre-wrap border ${m.who === 'ADMIN' ? 'bg-brand-primary-50 border-brand-primary-200 text-brand-primary-900' : 'bg-orange-50 border-orange-200 text-orange-900'}`}>
                                {m.text}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
              {(() => {
                try {
                  const parsed = typeof application.reconsiderationDocumentsMetadata === 'string'
                    ? JSON.parse(application.reconsiderationDocumentsMetadata)
                    : application.reconsiderationDocumentsMetadata;
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
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanApplicationModal;