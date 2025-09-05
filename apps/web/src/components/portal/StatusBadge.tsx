import React from 'react';

// Define los posibles tipos de status y sus configuraciones
const statusConfig = {
  user: {
    ACTIVE: { label: 'Activo', styles: 'bg-green-500 text-white border-green-600 shadow-sm' },
    INVITED: { label: 'Invitado', styles: 'bg-yellow-500 text-white border-yellow-600 shadow-sm' },
    SUSPENDED: { label: 'Suspendido', styles: 'bg-red-500 text-white border-red-600 shadow-sm' },
  },
  application: {
    PENDING: { label: 'Pendiente', styles: 'bg-yellow-500 text-white border-yellow-600 shadow-sm font-semibold' },
    UNDER_REVIEW: { label: 'En Revisión', styles: 'bg-blue-500 text-white border-blue-600 shadow-sm font-semibold' },
    APPROVED: { label: 'Aprobado', styles: 'bg-green-500 text-white border-green-600 shadow-sm font-semibold' },
    REJECTED: { label: 'Rechazado', styles: 'bg-red-500 text-white border-red-600 shadow-sm font-semibold' },
    CANCELLED: { label: 'Cancelado', styles: 'bg-gray-500 text-white border-gray-600 shadow-sm font-semibold' },
    A_RECONSIDERAR: { label: 'A Reconsiderar', styles: 'bg-orange-500 text-white border-orange-600 shadow-sm font-semibold' },
  },
};

interface StatusBadgeProps {
  status: string;
  type: keyof typeof statusConfig;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type }) => {
  const config = statusConfig[type];
  // Evitar "never" por intersección de claves usando un índice seguro
  const map = config as Record<string, { label: string; styles: string }>
  const statusInfo = map[status] ?? {
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
