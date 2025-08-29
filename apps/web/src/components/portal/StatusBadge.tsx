import React from 'react';

// Define los posibles tipos de status y sus configuraciones
const statusConfig = {
  user: {
    ACTIVE: { label: 'Activo', styles: 'bg-green-100 text-green-800 border-green-200' },
    INVITED: { label: 'Invitado', styles: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    SUSPENDED: { label: 'Suspendido', styles: 'bg-red-100 text-red-800 border-red-200' },
  },
  application: {
    PENDING: { label: 'Pendiente', styles: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    UNDER_REVIEW: { label: 'En Revisión', styles: 'bg-blue-100 text-blue-800 border-blue-200' },
    APPROVED: { label: 'Aprobado', styles: 'bg-green-100 text-green-800 border-green-200' },
    REJECTED: { label: 'Rechazado', styles: 'bg-red-100 text-red-800 border-red-200' },
    CANCELLED: { label: 'Cancelado', styles: 'bg-gray-100 text-gray-800 border-gray-200' },
  },
};

interface StatusBadgeProps {
  status: string;
  type: keyof typeof statusConfig;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type }) => {
  const config = statusConfig[type];
  const statusInfo = config[status as keyof typeof config] || { 
    label: status, 
    styles: 'bg-gray-100 text-gray-800 border-gray-200' 
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.styles}`}>
      {statusInfo.label}
    </span>
  );
};

export default StatusBadge;
