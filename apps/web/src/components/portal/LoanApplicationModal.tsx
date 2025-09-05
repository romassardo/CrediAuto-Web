import React from 'react';
import { FileText, X, Calendar, User, Heart, MapPin, Briefcase, Car, Calculator, Building, Eye, Download, Phone, Mail, Hash, DollarSign, UserCheck, Clock } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-primary-600 to-brand-primary-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Detalles de Solicitud</h2>
                <p className="text-white/80 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  {application.publicId}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={application.status} type="application" />
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Información del Solicitante */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-primary-600" />
              Información del Solicitante
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Nombre Completo</p>
                <p className="font-semibold text-gray-900">{application.applicantFirstName} {application.applicantLastName}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  CUIL
                </p>
                <p className="font-semibold text-gray-900">{application.applicantCuil}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Email
                </p>
                <p className="font-semibold text-gray-900">{application.applicantEmail}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  Teléfono
                </p>
                <p className="font-semibold text-gray-900">{application.applicantPhone}</p>
              </div>
              {application.applicantBirthDate && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Fecha de Nacimiento
                  </p>
                  <p className="font-semibold text-gray-900">{new Date(application.applicantBirthDate).toLocaleDateString('es-AR')}</p>
                </div>
              )}
              {application.applicantMaritalStatus && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    Estado Civil
                  </p>
                  <p className="font-semibold text-gray-900">{application.applicantMaritalStatus}</p>
                </div>
              )}
              {application.applicantAddress && (
                <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Dirección
                  </p>
                  <p className="font-semibold text-gray-900">
                    {application.applicantAddress}
                    {application.applicantCity && `, ${application.applicantCity}`}
                    {application.applicantProvince && `, ${application.applicantProvince}`}
                    {application.applicantPostalCode && ` (${application.applicantPostalCode})`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Información del Cónyuge */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-brand-primary-600" />
              Información del Cónyuge
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-600 mb-1">Nombre Completo</p>
                <p className="text-lg font-bold text-purple-800">
                  {application.spouseFirstName && application.spouseLastName 
                    ? `${application.spouseFirstName} ${application.spouseLastName}` 
                    : 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  CUIL
                </p>
                <p className="font-semibold text-gray-900">{application.spouseCuil || 'N/A'}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  Ingreso del Cónyuge
                </p>
                <p className="font-semibold text-green-800">
                  {application.spouseIncome 
                    ? formatCurrency(application.spouseIncome)
                    : 'No registrado'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Información del Concesionario */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-brand-primary-600" />
              Información del Concesionario
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 mb-1">Nombre Comercial</p>
                <p className="text-lg font-bold text-blue-800">{application.dealer?.tradeName || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Razón Social</p>
                <p className="font-semibold text-gray-900">{application.dealer?.legalName || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">CUIT</p>
                <p className="font-semibold text-gray-900">{application.dealer?.cuit || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Email
                </p>
                <p className="font-semibold text-gray-900">{application.dealer?.email || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  Teléfono
                </p>
                <p className="font-semibold text-gray-900">{application.dealer?.phone || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Estado</p>
                <p className="font-semibold text-gray-900">{application.dealer?.status || 'N/A'}</p>
              </div>
              {application.dealer?.addressStreet && (
                <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Dirección
                  </p>
                  <p className="font-semibold text-gray-900">
                    {application.dealer.addressStreet}
                    {application.dealer.addressCity && `, ${application.dealer.addressCity}`}
                    {application.dealer.addressProvince && `, ${application.dealer.addressProvince}`}
                    {application.dealer.postalCode && ` (${application.dealer.postalCode})`}
                  </p>
                </div>
              )}
              {application.executive && (
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-green-600 mb-1">Ejecutivo Asignado</p>
                  <p className="text-lg font-bold text-green-800">
                    {application.executive.firstName && application.executive.lastName 
                      ? `${application.executive.firstName} ${application.executive.lastName}` 
                      : 'N/A'}
                  </p>
                  <p className="text-sm text-green-700">{application.executive.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Información Laboral */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-brand-primary-600" />
              Información Laboral
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Tipo de Empleo</p>
                <p className="font-semibold text-gray-900">{application.employmentType || 'N/A'}</p>
                {application.employmentTypeOther && (
                  <p className="text-sm text-gray-600 mt-1">({application.employmentTypeOther})</p>
                )}
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  Empresa
                </p>
                <p className="font-semibold text-gray-900">{application.companyName || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  Teléfono Empresa
                </p>
                <p className="font-semibold text-gray-900">{application.companyPhone || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Experiencia Laboral</p>
                <p className="font-semibold text-gray-900">{application.workExperience || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Información del Vehículo */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Car className="w-5 h-5 text-brand-primary-600" />
              Información del Vehículo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Marca</p>
                <p className="font-semibold text-gray-900">{application.vehicleBrand || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Modelo</p>
                <p className="font-semibold text-gray-900">{application.vehicleModel || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Año</p>
                <p className="font-semibold text-gray-900">{application.vehicleYear || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Condición</p>
                <p className="font-semibold text-gray-900">{application.vehicleCondition || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Versión</p>
                <p className="font-semibold text-gray-900">{application.vehicleVersion || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Información Financiera */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-brand-primary-600" />
              Información Financiera
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 mb-1">Precio del Vehículo</p>
                <p className="text-xl font-bold text-green-800">{formatCurrency(application.vehiclePrice)}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 mb-1">Monto del Préstamo</p>
                <p className="text-xl font-bold text-blue-800">{formatCurrency(application.loanAmount)}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-600 mb-1">Cuota Mensual</p>
                <p className="text-xl font-bold text-purple-800">{formatCurrency(application.monthlyPayment)}</p>
              </div>
              {application.downPayment && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Anticipo</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(application.downPayment)}</p>
                </div>
              )}
              {application.totalAmount && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Monto Total</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(application.totalAmount)}</p>
                </div>
              )}
              {application.loanTermMonths && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Plazo</p>
                  <p className="font-semibold text-gray-900">{application.loanTermMonths} meses</p>
                </div>
              )}
              {application.interestRate && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Tasa de Interés</p>
                  <p className="font-semibold text-gray-900">{formatPercentage(application.interestRate)}</p>
                </div>
              )}
              {application.cftAnnual && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">CFT Anual</p>
                  <p className="font-semibold text-gray-900">{formatPercentage(application.cftAnnual)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Documentos Iniciales */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-primary-600" />
              Documentos Iniciales
            </h3>
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
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No hay documentos adjuntos</p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {documents.map((doc: any, index: number) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-primary-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-brand-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{doc.name || `Documento ${index + 1}`}</p>
                          <p className="text-sm text-gray-500">
                            {doc.size ? `${(doc.size / 1024 / 1024).toFixed(2)} MB` : 'Tamaño desconocido'} • 
                            {doc.type || 'Tipo desconocido'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.url && (
                          <>
                            <button
                              onClick={() => window.open(doc.url, '_blank')}
                              className="flex items-center gap-1 px-3 py-2 text-sm text-brand-primary-600 hover:text-brand-primary-700 hover:bg-brand-primary-50 rounded-lg transition-colors"
                              title="Ver documento"
                            >
                              <Eye className="w-4 h-4" />
                              Ver
                            </button>
                            <button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = doc.url;
                                link.download = doc.name || `documento-${index + 1}`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="flex items-center gap-1 px-3 py-2 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                              title="Descargar documento"
                            >
                              <Download className="w-4 h-4" />
                              Descargar
                            </button>
                          </>
                        )}
                        {!doc.url && (
                          <span className="text-sm text-gray-400 px-3 py-2">
                            No disponible
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Documentos de Reconsideración */}
          {(application.reconsiderationRequested || application.status === 'A_RECONSIDERAR') && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-600" />
                Documentos de Reconsideración
              </h3>
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">
                    Solicitada el {application.reconsiderationRequestedAt 
                      ? new Date(application.reconsiderationRequestedAt).toLocaleDateString('es-AR', {
                          year: 'numeric',
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Fecha no disponible'
                    }
                  </span>
                </div>
                {application.reconsiderationReason && (
                  <p className="text-sm text-orange-700">
                    <strong>Motivo:</strong> {application.reconsiderationReason}
                  </p>
                )}
              </div>
              {(() => {
                let reconsiderationDocs = [];
                try {
                  if (application.reconsiderationDocumentsMetadata) {
                    const parsed = typeof application.reconsiderationDocumentsMetadata === 'string' 
                      ? JSON.parse(application.reconsiderationDocumentsMetadata) 
                      : application.reconsiderationDocumentsMetadata;
                    reconsiderationDocs = Array.isArray(parsed) ? parsed : [];
                  }
                } catch (e) {
                  console.error('Error parsing reconsideration documents metadata:', e);
                }

                if (reconsiderationDocs.length === 0) {
                  return (
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No hay documentos de reconsideración adjuntos</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {reconsiderationDocs.map((doc: any, index: number) => (
                      <div key={index} className="bg-white border border-orange-200 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{doc.name || `Documento Reconsideración ${index + 1}`}</p>
                            <p className="text-sm text-gray-500">
                              {doc.size ? `${(doc.size / 1024 / 1024).toFixed(2)} MB` : 'Tamaño desconocido'} • 
                              {doc.type || 'Tipo desconocido'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.url && (
                            <>
                              <button
                                onClick={() => window.open(doc.url, '_blank')}
                                className="flex items-center gap-1 px-3 py-2 text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Ver documento"
                              >
                                <Eye className="w-4 h-4" />
                                Ver
                              </button>
                              <button
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = doc.url;
                                  link.download = doc.name || `reconsideracion-${index + 1}`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                                className="flex items-center gap-1 px-3 py-2 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                title="Descargar documento"
                              >
                                <Download className="w-4 h-4" />
                                Descargar
                              </button>
                            </>
                          )}
                          {!doc.url && (
                            <span className="text-sm text-gray-400 px-3 py-2">
                              No disponible
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Información de Revisión */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-brand-primary-600" />
              Información de Revisión
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Fecha de Revisión</p>
                <p className="font-semibold text-gray-900">
                  {application.reviewedAt 
                    ? new Date(application.reviewedAt).toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'N/A'
                  }
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  Revisado por (ID)
                </p>
                <p className="font-semibold text-gray-900">{application.reviewedByUserId || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                <p className="text-sm text-gray-500 mb-1">Motivo del Estado</p>
                <p className="font-semibold text-gray-900">{application.statusReason || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Datos Técnicos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Hash className="w-5 h-5 text-brand-primary-600" />
              Datos Técnicos
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">Datos de Envío</p>
                <pre className="text-xs text-gray-700 bg-white p-3 rounded border overflow-x-auto max-h-40">
                  {application.submissionData ? JSON.stringify(application.submissionData, null, 2) : 'N/A'}
                </pre>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">Datos de Cálculo</p>
                <pre className="text-xs text-gray-700 bg-white p-3 rounded border overflow-x-auto max-h-40">
                  {application.calculationData ? JSON.stringify(application.calculationData, null, 2) : 'N/A'}
                </pre>
              </div>
            </div>
          </div>

          {/* Información de Solicitud */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-primary-600" />
              Información de Solicitud
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Fecha de Solicitud</p>
                <p className="font-semibold text-gray-900">{new Date(application.createdAt).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
              {application.updatedAt && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Última Actualización</p>
                  <p className="font-semibold text-gray-900">{new Date(application.updatedAt).toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              )}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">ID de Solicitud</p>
                <p className="font-semibold text-gray-900 font-mono">{application.publicId}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Estado Actual</p>
                <div className="mt-2">
                  <StatusBadge status={application.status} type="application" />
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Dealer ID</p>
                <p className="font-semibold text-gray-900">{application.dealerId}</p>
              </div>
              {application.executiveId && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Ejecutivo ID</p>
                  <p className="font-semibold text-gray-900">{application.executiveId}</p>
                </div>
              )}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Enviado por (ID)</p>
                <p className="font-semibold text-gray-900">{application.submittedByUserId}</p>
              </div>
            </div>
          </div>
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